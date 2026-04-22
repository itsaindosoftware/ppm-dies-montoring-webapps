<?php

namespace App\Http\Controllers;

use App\Models\DieModel;
// use App\Models\ProductionLog;
use App\Models\PpmHistory;
use App\Models\Customer;
use App\Models\SpecialDiesRepair;
use App\Services\DieMonitoringService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    public function index()
    {
        $stats = $this->monitoringService->getDashboardStats();
        $diesByTonnage = $this->monitoringService->getDiesByTonnage();
        $criticalDies = $this->monitoringService->getCriticalDies(10);
        $upcomingPpm = $this->monitoringService->getUpcomingPpm(14);

        // Chart Data
        $chartData = [
            'statusDistribution' => $this->getStatusDistributionData($stats),
            'diesByTonnage' => $this->getDiesByTonnageChartData($diesByTonnage),
            'topDiesByGroup' => $this->getTopDiesByGroupData(),
            'topDiesByStroke' => $this->getTopDiesByStrokeData(),
            'monthlyPpmCount' => $this->getMonthlyPpmCountData(),
            'customerDistribution' => $this->getCustomerDistributionData(),
        ];

        // PPM Timeline Tracking Table (RED alert max 1 week = 5 days)
        $ppmTimeline = $this->getPpmTimelineData();

        // Active Special Repairs
        $activeSpecialRepairs = SpecialDiesRepair::with(['die.customer'])
            ->active()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'encrypted_id' => $r->encrypted_id,
                'part_number' => $r->die?->part_number,
                'repair_type_label' => $r->repair_type_label,
                'priority' => $r->priority,
                'priority_color' => $r->priority_color,
                'status_label' => $r->status_label,
                'status_color' => $r->status_color,
                'requested_at' => $r->requested_at?->format('d-M-Y'),
                'delivery_deadline' => $r->delivery_deadline?->format('d-M-Y'),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'diesByTonnage' => $diesByTonnage,
            'criticalDies' => $criticalDies,
            'upcomingPpm' => $upcomingPpm,
            'chartData' => $chartData,
            'ppmTimeline' => $ppmTimeline,
            'activeSpecialRepairs' => $activeSpecialRepairs,
        ]);
    }

    /**
     * Status distribution for doughnut chart
     */
    protected function getStatusDistributionData(array $stats): array
    {
        return [
            'labels' => ['OK', 'Warning', 'Critical'],
            'values' => [$stats['ok'], $stats['warning'], $stats['critical']],
        ];
    }

    /**
     * Dies by tonnage for bar chart
     */
    protected function getDiesByTonnageChartData(array $diesByTonnage): array
    {
        $labels = [];
        $ok = [];
        $warning = [];
        $critical = [];

        foreach ($diesByTonnage as $item) {
            $labels[] = $item['tonnage'];
            $ok[] = $item['ok'];
            $warning[] = $item['warning'];
            $critical[] = $item['critical'];
        }

        return [
            'labels' => $labels,
            'ok' => $ok,
            'warning' => $warning,
            'critical' => $critical,
        ];
    }

    /**
     * TOP 10 dies by stroke progress, grouped by A1, A2, B1, B2
     * Groups are based on lot position in the 4-lot PPM cycle:
     * A1 = Lot 1 (0-25%), A2 = Lot 2 (25-50%), B1 = Lot 3 (50-75% / Orange), B2 = Lot 4 (75-100% / Red)
     * top 10 dies berdasarkan mesin
     */
    protected function getTopDiesByGroupData(): array
    {
        $groups = [
            'A1' => ['label' => 'A1 Line', 'color' => '#22c55e', 'dies' => []],
            'A2' => ['label' => 'A2 Line', 'color' => '#3b82f6', 'dies' => []],
            'B1' => ['label' => 'B1 Line', 'color' => '#f97316', 'dies' => []],
            'B2' => ['label' => 'B2 Line', 'color' => '#ef4444', 'dies' => []],
        ];

        // A1: khusus dies dengan line = '800T', sort by accumulation_stroke terbesar
        $dies800T = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('line', '800T')
            ->get();

        foreach ($dies800T as $die) {
            $groups['A1']['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'stroke_percentage' => $die->stroke_percentage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'standard_stroke' => $die->standard_stroke,
                'current_lot' => $die->current_lot,
                'ppm_status' => $die->ppm_status,
            ];
        }

        // Sort A1 by status priority (red, orange, green), then by stroke descending
        $this->sortTopDiesGroupEntries($groups['A1']['dies']);
        $groups['A1']['dies'] = array_slice($groups['A1']['dies'], 0, 10);
        $groups['A1']['count'] = count($groups['A1']['dies']);

        // A2: khusus dies dengan line = '1200T', sort by accumulation_stroke terbesar
        $dies1200T = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('line', '1200T')
            ->get();

        foreach ($dies1200T as $die) {
            $groups['A2']['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'stroke_percentage' => $die->stroke_percentage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'standard_stroke' => $die->standard_stroke,
                'current_lot' => $die->current_lot,
                'ppm_status' => $die->ppm_status,
            ];
        }

        // Sort A2 by status priority (red, orange, green), then by stroke descending
        $this->sortTopDiesGroupEntries($groups['A2']['dies']);
        $groups['A2']['dies'] = array_slice($groups['A2']['dies'], 0, 10);
        $groups['A2']['count'] = count($groups['A2']['dies']);

        // B1: khusus dies dengan line = 'Progressive', sort by accumulation_stroke terbesar
        $diesProgressive = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('line', 'Progressive')
            ->get();

        foreach ($diesProgressive as $die) {
            $groups['B1']['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'stroke_percentage' => $die->stroke_percentage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'standard_stroke' => $die->standard_stroke,
                'current_lot' => $die->current_lot,
                'ppm_status' => $die->ppm_status,
            ];
        }

        // Sort B1 by status priority (red, orange, green), then by stroke descending
        $this->sortTopDiesGroupEntries($groups['B1']['dies']);
        $groups['B1']['dies'] = array_slice($groups['B1']['dies'], 0, 10);
        $groups['B1']['count'] = count($groups['B1']['dies']);

        // B2: khusus dies dengan line = '250T', sort by accumulation_stroke terbesar
        $dies250T = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->where('line', '250T')
            ->get();

        foreach ($dies250T as $die) {
            $groups['B2']['dies'][] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'stroke_percentage' => $die->stroke_percentage,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->last_stroke,
                'standard_stroke' => $die->standard_stroke,
                'current_lot' => $die->current_lot,
                'ppm_status' => $die->ppm_status,
            ];
        }

        // Sort B2 by status priority (red, orange, green), then by stroke descending
        $this->sortTopDiesGroupEntries($groups['B2']['dies']);
        $groups['B2']['dies'] = array_slice($groups['B2']['dies'], 0, 10);
        $groups['B2']['count'] = count($groups['B2']['dies']);

        return $groups;
    }

    protected function sortTopDiesGroupEntries(array &$dies): void
    {
        usort($dies, function ($left, $right) {
            $statusCompare = $this->getPpmStatusPriority($left['ppm_status'] ?? null)
                <=> $this->getPpmStatusPriority($right['ppm_status'] ?? null);

            if ($statusCompare !== 0) {
                return $statusCompare;
            }

            return $this->getDashboardStrokeValue($right)
                <=> $this->getDashboardStrokeValue($left);
        });
    }

    protected function getPpmStatusPriority(?string $status): int
    {
        return match ($status) {
            'red' => 0,
            'orange' => 1,
            'green' => 2,
            default => 3,
        };
    }

    protected function getDashboardStrokeValue(array $die): int
    {
        // return (int) ($die['accumulation_stroke'] ?: $die['last_stroke'] ?: 0);
        return (int) ($die['accumulation_stroke'] ?? 0);
    }

    /**
     * Top 10 dies by stroke percentage
     */
    protected function getTopDiesByStrokeData(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard'])
            ->active()
            ->get();

        // Sort by current stroke (accumulation_stroke or last_stroke fallback) descending
        $dies = $dies->sortByDesc(function ($die) {
            return $die->accumulation_stroke ?: $die->last_stroke ?: 0;
        })->take(10);

        $labels = [];
        $values = [];
        $maxValues = [];

        foreach ($dies as $die) {
            // Use fallback logic: accumulation_stroke or last_stroke
            $currentStroke = $die->accumulation_stroke ?: $die->last_stroke ?: 0;

            $labels[] = $die->part_number;
            $values[] = $currentStroke;
            $maxValues[] = $die->standard_stroke;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'maxValues' => $maxValues,
        ];
    }

    /**
     * Monthly PPM count for current year
     */
    protected function getMonthlyPpmCountData(): array
    {
        $year = now()->year;

        $ppmCounts = PpmHistory::select(
            DB::raw('MONTH(ppm_date) as month'),
            DB::raw('COUNT(*) as count')
        )
            ->whereYear('ppm_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $values = [];

        for ($month = 1; $month <= 12; $month++) {
            $values[] = $ppmCounts->get($month)?->count ?? 0;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'datasetLabel' => 'PPM Completed',
        ];
    }

    /**
     * Customer distribution
     */
    protected function getCustomerDistributionData(): array
    {
        $customers = Customer::withCount(['dies' => fn($q) => $q->active()])
            ->having('dies_count', '>', 0)
            ->orderByDesc('dies_count')
            ->get();

        return [
            'labels' => $customers->pluck('code')->toArray(),
            'values' => $customers->pluck('dies_count')->toArray(),
        ];
    }

    /**
     * PPM Timeline Data - Track RED alert to completion (max 5 days)
     *
     * Timeline:
     * n   = RED alert triggered
     * n+1 = PROD transfers dies to MTN (max 1 day)
     * n+3 = PPM activity completed (max 3 days from transfer)
     * n+4 = PPM finish & transfer back to production (max 4 days from RED)
     * Total max = 5 working days (1 week)
     */
    protected function getPpmTimelineData(): array
    {
        $dies = DieModel::with(['machineModel.tonnageStandard', 'customer'])
            ->active()
            ->whereNotNull('ppm_alert_status')
            ->whereIn('ppm_alert_status', [
                'red_alerted',
                'transferred_to_mtn',
                'ppm_scheduled',
                'schedule_approved',
                'ppm_in_progress',
                'additional_repair',
                'ppm_completed',
                'special_repair',
            ])
            ->get();

        $timeline = [];

        foreach ($dies as $die) {
            $redAlertedAt = $die->red_alerted_at;
            $now = now();

            // Calculate days since RED alert
            $daysSinceRed = $redAlertedAt ? (int) $redAlertedAt->diffInWeekdays($now) : null;

            // Check SLA compliance
            $transferSla = null; // max n+1
            $ppmActivitySla = null; // max n+3
            $ppmFinishSla = null; // max n+4
            $totalSla = null; // max 5 days

            if ($redAlertedAt) {
                $transferDays = $die->transferred_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->transferred_at)
                    : null;
                $transferSla = $transferDays !== null ? ($transferDays <= 1 ? 'on_track' : 'overdue') : 'pending';

                $ppmDays = $die->ppm_started_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->ppm_started_at)
                    : null;

                $finishDays = $die->ppm_finished_at
                    ? (int) $redAlertedAt->diffInWeekdays($die->ppm_finished_at)
                    : null;
                $ppmFinishSla = $finishDays !== null ? ($finishDays <= 4 ? 'on_track' : 'overdue') : 'pending';

                $totalSla = $daysSinceRed !== null ? ($daysSinceRed <= 5 ? 'on_track' : 'overdue') : 'pending';
            }

            $timeline[] = [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'customer' => $die->customer?->code,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'red_alerted_at' => $redAlertedAt?->format('d-M-Y H:i'),
                'transferred_at' => $die->transferred_at?->format('d-M-Y H:i'),
                'ppm_started_at' => $die->ppm_started_at?->format('d-M-Y H:i'),
                'ppm_finished_at' => $die->ppm_finished_at?->format('d-M-Y H:i'),
                'returned_to_production_at' => $die->returned_to_production_at?->format('d-M-Y H:i'),
                'days_since_red' => $daysSinceRed,
                'ppm_total_days' => $die->ppm_total_days,
                'transfer_sla' => $transferSla,
                'ppm_finish_sla' => $ppmFinishSla,
                'total_sla' => $totalSla,
                'is_overdue' => $daysSinceRed !== null && $daysSinceRed > 5,
            ];
        }

        return $timeline;
    }
}