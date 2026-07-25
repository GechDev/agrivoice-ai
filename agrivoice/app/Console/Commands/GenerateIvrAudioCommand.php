<?php

namespace App\Console\Commands;

use App\Services\AddisAiVoiceService;
use App\Services\IvrAudioCatalog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class GenerateIvrAudioCommand extends Command
{
    protected $signature = 'ivr:generate-audio
                            {--force : Regenerate clips even when files already exist}
                            {--yes : Skip the confirmation prompt}';

    protected $description = 'Generate and save fixed Amharic IVR menu clips via Addis AI TTS';

    public function handle(AddisAiVoiceService $voice, IvrAudioCatalog $catalog): int
    {
        if (! $voice->isConfigured()) {
            $this->error('ADDIS_AI_API_KEY is not set.');

            return self::FAILURE;
        }

        Storage::disk(IvrAudioCatalog::DISK)->makeDirectory(IvrAudioCatalog::DIRECTORY);

        $clips = $catalog->clips();
        $force = (bool) $this->option('force');
        $pending = [];

        foreach ($clips as $clipId => $text) {
            $path = $catalog->relativePath($clipId);
            $exists = Storage::disk(IvrAudioCatalog::DISK)->exists($path);

            if ($exists && ! $force) {
                $this->line("skip  {$clipId} (already exists)");

                continue;
            }

            $pending[$clipId] = $text;
        }

        if ($pending === []) {
            $this->info('All fixed IVR clips are already present.');

            return self::SUCCESS;
        }

        $this->info('Clips to generate: '.count($pending));

        $estimatedTotal = 0.0;
        $currency = 'ETB';

        foreach ($pending as $clipId => $text) {
            try {
                $estimate = $voice->estimate($text);
                $cost = (float) (data_get($estimate, 'estimated_cost')
                    ?? data_get($estimate, 'estimatedCost')
                    ?? 0);
                $currency = (string) (data_get($estimate, 'currency') ?? $currency);
                $estimatedTotal += $cost;
                $this->line(sprintf('  %-16s  ~%s %s', $clipId, number_format($cost, 2), $currency));
            } catch (Throwable $exception) {
                $this->warn("  {$clipId}: estimate unavailable ({$exception->getMessage()})");
            }
        }

        if ($estimatedTotal > 0) {
            $this->newLine();
            $this->warn(sprintf('Estimated total: %s %s', number_format($estimatedTotal, 2), $currency));
        }

        if (! $this->option('yes') && ! $this->confirm('Generate and download these clips now?', true)) {
            $this->info('Cancelled.');

            return self::SUCCESS;
        }

        $voiceId = $voice->voiceId();

        foreach ($pending as $clipId => $text) {
            try {
                $url = $voice->generateAndStoreClip(
                    $clipId,
                    $text,
                    $catalog->clientRequestId($clipId, $voiceId),
                );
                $this->info("saved {$clipId} → {$url}");
            } catch (RuntimeException $exception) {
                $this->error("failed {$clipId}: {$exception->getMessage()}");

                return self::FAILURE;
            }
        }

        $this->newLine();
        $this->info('Done. Ensure `php artisan storage:link` has been run so /storage/ivr/* is public.');

        return self::SUCCESS;
    }
}
