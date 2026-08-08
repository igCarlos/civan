<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\SystemSetting;
use Carbon\CarbonInterface;

class AuditRetentionService
{
    public const PAGE_VIEW_RETENTION_KEY =
        'audit.page_view_retention_days';

    /**
     * Días actuales de retención.
     */
    public function pageViewRetentionDays(): int
    {
        return max(
            1,
            (int) SystemSetting::valueOf(
                self::PAGE_VIEW_RETENTION_KEY,
                config(
                    'audit.retention.page_view_days',
                    30
                )
            )
        );
    }

    /**
     * Tamaño de bloque para limpieza.
     */
    public function chunkSize(): int
    {
        return max(
            100,
            (int) config(
                'audit.retention.chunk_size',
                1000
            )
        );
    }

    /**
     * Fecha límite actual.
     */
    public function cutoff(): CarbonInterface
    {
        return now()->subDays(
            $this->pageViewRetentionDays()
        );
    }

    /**
     * Estadísticas de retención.
     */
    public function stats(): array
    {
        $days =
            $this->pageViewRetentionDays();

        $cutoff =
            now()->subDays(
                $days
            );

        $pageViewQuery =
            AuditLog::query()
                ->where(
                    'event',
                    'page_view'
                );

        $eligible =
            (clone $pageViewQuery)
                ->where(
                    'created_at',
                    '<',
                    $cutoff
                )
                ->count();

        $oldest =
            (clone $pageViewQuery)
                ->orderBy(
                    'created_at'
                )
                ->value(
                    'created_at'
                );

        return [
            'retention_days' =>
                $days,

            'cutoff' =>
                $cutoff,

            'page_view_total' =>
                (clone $pageViewQuery)
                    ->count(),

            'eligible_count' =>
                $eligible,

            'oldest_page_view' =>
                $oldest,
        ];
    }

    /**
     * Eliminar page_view vencidos.
     */
    public function prune(): array
    {
        $days =
            $this->pageViewRetentionDays();

        $cutoff =
            now()->subDays(
                $days
            );

        $chunkSize =
            $this->chunkSize();

        $deleted = 0;

        while (true) {
            $ids =
                AuditLog::query()
                    ->where(
                        'event',
                        'page_view'
                    )
                    ->where(
                        'created_at',
                        '<',
                        $cutoff
                    )
                    ->orderBy(
                        'id'
                    )
                    ->limit(
                        $chunkSize
                    )
                    ->pluck(
                        'id'
                    );

            if ($ids->isEmpty()) {
                break;
            }

            $deleted +=
                AuditLog::query()
                    ->whereIn(
                        'id',
                        $ids
                    )
                    ->delete();
        }

        return [
            'event' =>
                'page_view',

            'retention_days' =>
                $days,

            'cutoff' =>
                $cutoff->toDateTimeString(),

            'deleted_count' =>
                $deleted,
        ];
    }
}
