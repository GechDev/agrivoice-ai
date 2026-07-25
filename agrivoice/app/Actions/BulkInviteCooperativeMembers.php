<?php

namespace App\Actions;

use App\Enums\CooperativeMemberStatus;
use App\Jobs\SendMemberInviteJob;
use App\Models\Cooperative;
use App\Models\CooperativeMember;
use App\Support\EthiopianPhoneNumber;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\LazyCollection;
use SplFileObject;

class BulkInviteCooperativeMembers
{
    private const CHUNK_SIZE = 200;

    /**
     * @return array{invited: int, skipped_duplicates: int, invalid_format: int}
     */
    public function handle(Cooperative $cooperative, UploadedFile $csv): array
    {
        $summary = [
            'invited' => 0,
            'skipped_duplicates' => 0,
            'invalid_format' => 0,
        ];

        $existingPhones = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->pluck('phone_number')
            ->flip()
            ->all();

        $seenInCsv = [];
        /** @var list<array{cooperative_id: int, name: string|null, phone_number: string, status: string, farmer_id: null, joined_at: null, created_at: Carbon, updated_at: Carbon}> $toInsert */
        $toInsert = [];
        $now = now();

        $rows = $this->streamRows($csv);

        $headerMap = null;

        foreach ($rows as $index => $row) {
            if ($index === 0) {
                $headerMap = $this->mapHeaders($row);

                if ($headerMap === null) {
                    $summary['invalid_format']++;

                    continue;
                }

                continue;
            }

            if ($this->rowIsEmpty($row)) {
                continue;
            }

            if ($headerMap === null) {
                $summary['invalid_format']++;

                continue;
            }

            $name = $this->cell($row, $headerMap['name'] ?? null);
            $phoneRaw = $this->cell($row, $headerMap['phone'] ?? null);

            if ($phoneRaw === null || $phoneRaw === '') {
                $summary['invalid_format']++;

                continue;
            }

            $phone = EthiopianPhoneNumber::tryFrom($phoneRaw);

            if ($phone === null) {
                $summary['invalid_format']++;

                continue;
            }

            $canonical = $phone->value;

            if (isset($existingPhones[$canonical]) || isset($seenInCsv[$canonical])) {
                $summary['skipped_duplicates']++;

                continue;
            }

            $seenInCsv[$canonical] = true;
            $toInsert[] = [
                'cooperative_id' => $cooperative->id,
                'name' => $name !== null && $name !== '' ? mb_substr($name, 0, 255) : null,
                'phone_number' => $canonical,
                'status' => CooperativeMemberStatus::Invited->value,
                'farmer_id' => null,
                'joined_at' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        if ($toInsert === []) {
            return $summary;
        }

        $insertedPhones = array_column($toInsert, 'phone_number');

        DB::transaction(function () use ($toInsert): void {
            foreach (array_chunk($toInsert, self::CHUNK_SIZE) as $chunk) {
                CooperativeMember::query()->insert($chunk);
            }
        });

        $summary['invited'] = count($insertedPhones);

        $memberIds = CooperativeMember::query()
            ->forCooperative($cooperative->id)
            ->whereIn('phone_number', $insertedPhones)
            ->pluck('id');

        foreach ($memberIds as $memberId) {
            SendMemberInviteJob::dispatch((int) $memberId);
        }

        return $summary;
    }

    /**
     * @return LazyCollection<int, list<string|null>>
     */
    private function streamRows(UploadedFile $csv): LazyCollection
    {
        $path = $csv->getRealPath();

        return LazyCollection::make(function () use ($path) {
            if ($path === false) {
                return;
            }

            $file = new SplFileObject($path);
            $file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::DROP_NEW_LINE);

            foreach ($file as $row) {
                if (! is_array($row)) {
                    continue;
                }

                /** @var list<string|null> $row */
                yield array_map(
                    fn (mixed $value): ?string => is_string($value) || is_numeric($value)
                        ? trim((string) $value)
                        : null,
                    $row,
                );
            }
        });
    }

    /**
     * @param  list<string|null>  $headerRow
     * @return array{name: int|null, phone: int}|null
     */
    private function mapHeaders(array $headerRow): ?array
    {
        if ($headerRow !== [] && isset($headerRow[0]) && is_string($headerRow[0])) {
            $headerRow[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headerRow[0]) ?? $headerRow[0];
        }

        $nameIndex = null;
        $phoneIndex = null;

        foreach ($headerRow as $index => $header) {
            if ($header === null) {
                continue;
            }

            $normalized = strtolower(trim($header));

            if ($normalized === 'name') {
                $nameIndex = $index;
            }

            if (in_array($normalized, ['phone_number', 'phone'], true)) {
                $phoneIndex = $index;
            }
        }

        if ($phoneIndex === null) {
            return null;
        }

        return [
            'name' => $nameIndex,
            'phone' => $phoneIndex,
        ];
    }

    /**
     * @param  list<string|null>  $row
     */
    private function cell(array $row, ?int $index): ?string
    {
        if ($index === null) {
            return null;
        }

        return $row[$index] ?? null;
    }

    /**
     * @param  list<string|null>  $row
     */
    private function rowIsEmpty(array $row): bool
    {
        foreach ($row as $value) {
            if ($value !== null && $value !== '') {
                return false;
            }
        }

        return true;
    }
}
