<?php

namespace App\Models;

use App\Enums\ReportStatus;
use Database\Factories\ReportStatusLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $report_id
 * @property int|null $changed_by
 * @property ReportStatus $old_status
 * @property ReportStatus $new_status
 * @property string|null $reason
 * @property Carbon|null $created_at
 * @property-read Report $report
 * @property-read User|null $changedBy
 */
class ReportStatusLog extends Model
{
    /** @use HasFactory<ReportStatusLogFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'report_id',
        'changed_by',
        'old_status',
        'new_status',
        'reason',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_status' => ReportStatus::class,
            'new_status' => ReportStatus::class,
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Report, $this>
     */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
