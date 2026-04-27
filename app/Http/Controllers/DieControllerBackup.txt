<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\DieChangeLog;
use App\Models\DieModel;
use App\Models\DieProcess;
use App\Models\PpmHistory;
use App\Models\Customer;
use App\Models\MachineModel;
use App\Services\DieMonitoringService;
use DateTimeInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

// s

class DieController extends Controller
{
    private const DIE_CHANGE_FIELD_LABELS = [
        'part_number' => 'Part Number',
        'part_name' => 'Part Name',
        'machine_model_id' => 'Machine Model',
        'customer_id' => 'Customer',
        'qty_die' => 'Qty Dies',
        'dies_size' => 'Dies Size',
        'line' => 'Line',
        'process_type' => 'Process Type',
        'control_stroke' => 'Control Stroke',
        'last_ppm_date' => 'Last PPM Date',
        'accumulation_stroke' => 'Accumulation Stroke',
        'location' => 'Location',
        'notes' => 'Notes',
        'is_4lot_check' => '4-Lot Check',
        'group_name' => 'Group Name',
    ];

    protected DieMonitoringService $monitoringService;

    public function __construct(DieMonitoringService $monitoringService)
    {
        $this->monitoringService = $monitoringService;
    }

    /**
     * Display a listing of dies.
     */
    public function index(Request $request)
    {
        $filters = $request->only(['customer_id', 'machine_model_id', 'status', 'line', 'search', 'ppm_done_date']);
        $perPage = (int) $request->input('per_page', 15);
        $perPage = in_array($perPage, [10, 15, 25, 50, 100, 200]) ? $perPage : 15;

        $paginator = $this->monitoringService->getDies($filters, $perPage);

        // Transform paginated items to include computed attributes
        $paginator->through(function ($die) {
            return [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer?->code,
                'customer_name' => $die->customer?->name,
                'model' => $die->machineModel?->code,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'dies_size' => $die->dies_size,
                'line' => $die->line,
                'process_type' => $die->process_type,
                'accumulation_stroke' => $die->accumulation_stroke,
                'standard_stroke' => $die->standard_stroke,
                'ppm_number_by_stroke' => $die->standard_stroke > 0
                    ? max(1, (int) ceil(max(0, (int) ($die->accumulation_stroke ?? 0)) / $die->standard_stroke))
                    : 1,
                'ppm_standard' => $die->ppm_standard,
                'remaining_strokes' => $die->remaining_strokes,
                'stroke_percentage' => $die->stroke_percentage,
                'lot_size' => $die->lot_size_value,
                'current_lot' => $die->current_lot,
                'total_lots' => $die->total_lots,
                'remaining_lots' => $die->remaining_lots,
                'lot_progress' => $die->lot_progress,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                'last_stroke' => $die->latestProductionLog?->output_qty,
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
                'is_4lot_check' => $die->is_4lot_check,
                'updated_at' => $die->updated_at?->format('d-M-Y H:i:s'),

            ];
        });

        // Get distinct lines for filter tabs
        $lines = DieModel::active()
            ->whereNotNull('line')
            ->where('line', '!=', '')
            ->distinct()
            ->pluck('line')
            ->sort()
            ->values();

        // Line summary stats
        $lineStats = DieModel::active()
            ->selectRaw('line, COUNT(*) as total')
            ->whereNotNull('line')
            ->where('line', '!=', '')
            ->groupBy('line')
            ->pluck('total', 'line');

        $historyPaginator = DieChangeLog::with(['die:id,part_number,part_name', 'user:id,name'])
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                $search = $filters['search'];

                $query->where(function ($nestedQuery) use ($search) {
                    $nestedQuery->where('part_number', 'like', "%{$search}%")
                        ->orWhere('part_name', 'like', "%{$search}%")
                        ->orWhereHas('die', function ($dieQuery) use ($search) {
                            $dieQuery->where('part_number', 'like', "%{$search}%")
                                ->orWhere('part_name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(!empty($filters['customer_id']), function ($query) use ($filters) {
                $query->whereHas('die', function ($dieQuery) use ($filters) {
                    $dieQuery->where('customer_id', $filters['customer_id']);
                });
            })
            ->when(!empty($filters['machine_model_id']), function ($query) use ($filters) {
                $query->whereHas('die', function ($dieQuery) use ($filters) {
                    $dieQuery->where('machine_model_id', $filters['machine_model_id']);
                });
            })
            ->when(!empty($filters['line']), function ($query) use ($filters) {
                $query->whereHas('die', function ($dieQuery) use ($filters) {
                    $dieQuery->where('line', $filters['line']);
                });
            })
            ->orderByDesc('created_at')
            ->paginate(15, ['*'], 'history_page');

        $historyPaginator->through(function (DieChangeLog $log) {
            $changes = collect($log->changed_fields ?? [])
                ->map(function ($change, $field) {
                    return [
                        'field' => $field,
                        'label' => $this->getDieFieldLabel($field),
                        'old_value' => $change['old'] ?? '-',
                        'new_value' => $change['new'] ?? '-',
                    ];
                })
                ->values();

            return [
                'id' => $log->id,
                'die_encrypted_id' => $log->die?->encrypted_id,
                'part_number' => $log->part_number ?: $log->die?->part_number,
                'part_name' => $log->part_name ?: $log->die?->part_name,
                'changed_at' => $log->created_at?->format('d-M-Y H:i:s'),
                'edited_by' => $log->user?->name ?? 'System',
                'fields_changed' => $changes,
                'total_changes' => $changes->count(),
            ];
        });

        return Inertia::render('Dies/Index', [
            'dies' => $paginator,
            'dieChangeLogs' => $historyPaginator,
            'filters' => $filters,
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
            'lines' => $lines,
            'lineStats' => $lineStats,
        ]);
    }

    /**
     * Display PPM Form list page with search filters.
     */
    public function ppmForm(Request $request)
    {
        $filters = $request->only(['ppm_date', 'part_number', 'part_name', 'process_name']);

        $ppmHistories = PpmHistory::query()
            ->with([
                'die:id,part_number,part_name,line,qty_die,machine_model_id,customer_id,accumulation_stroke',
                'die.customer:id,code,name',
                'die.machineModel:id,code',
            ])
            ->where('status', 'done')
            ->whereIn('process_type', DieModel::PROCESS_TYPES)
            ->when(!empty($filters['ppm_date']), function ($query) use ($filters) {
                $query->whereDate('ppm_date', $filters['ppm_date']);
            })
            ->when(!empty($filters['part_number']), function ($query) use ($filters) {
                $query->whereHas('die', function ($dieQuery) use ($filters) {
                    $dieQuery->where('part_number', 'like', '%' . $filters['part_number'] . '%');
                });
            })
            ->when(!empty($filters['part_name']), function ($query) use ($filters) {
                $query->whereHas('die', function ($dieQuery) use ($filters) {
                    $dieQuery->where('part_name', 'like', '%' . $filters['part_name'] . '%');
                });
            })
            ->when(!empty($filters['process_name']), function ($query) use ($filters) {
                $keyword = trim(strtolower($filters['process_name']));
                $normalized = str_replace(' ', '_', $keyword);

                $query->where(function ($nested) use ($keyword, $normalized) {
                    $nested->where('process_type', 'like', '%' . $keyword . '%')
                        ->orWhere('process_type', 'like', '%' . $normalized . '%');
                });
            })
            ->orderByDesc('ppm_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        $ppmHistories->through(function (PpmHistory $history) {
            $die = $history->die;

            return [
                'id' => $history->id,
                'ppm_date' => $history->ppm_date,
                'pic' => $history->pic,
                'status' => $history->status,
                'maintenance_type' => $history->maintenance_type,
                'process_type' => $history->process_type,
                'checklist_results' => $history->checklist_results,
                'illustration_url' => $history->illustration_url,
                'work_performed' => $history->work_performed,
                'parts_replaced' => $history->parts_replaced,
                'findings' => $history->findings,
                'recommendations' => $history->recommendations,
                'checked_by' => $history->checked_by,
                'approved_by' => $history->approved_by,
                'stroke_at_ppm' => $history->stroke_at_ppm,
                'ppm_number' => $history->ppm_number,
                'created_at' => $history->created_at?->toIso8601String(),
                'die' => [
                    'id' => $die?->id,
                    'encrypted_id' => $die?->encrypted_id,
                    'part_number' => $die?->part_number,
                    'part_name' => $die?->part_name,
                    'line' => $die?->line,
                    'qty_die' => $die?->qty_die,
                    'model' => $die?->machineModel?->code,
                    'customer' => $die?->customer?->code,
                    'total_stroke' => $die?->accumulation_stroke,
                    'standard_stroke' => $die?->standard_stroke,
                ],
            ];
        });

        return Inertia::render('PPM/Form', [
            'ppmHistories' => $ppmHistories,
            'filters' => $filters,
        ]);
    }

    public function downloadPpmFormPdf(PpmHistory $history)
    {
        $history->loadMissing([
            'die:id,part_number,part_name,line,qty_die,machine_model_id,customer_id,accumulation_stroke,ppm_standard,control_stroke',
            'die.customer:id,code,name',
            'die.machineModel:id,code',
            'die.machineModel.tonnageStandard:id,standard_stroke',
        ]);

        $checklistResults = collect($history->checklist_results ?? [])
            ->take(12)
            ->map(function ($item, $index) {
                return [
                    'item_no' => data_get($item, 'item_no', $index + 1),
                    'description' => data_get($item, 'description', '-'),
                    'result' => strtolower(trim((string) data_get($item, 'result', ''))),
                    'remark' => data_get($item, 'remark', ''),
                ];
            })
            ->values()
            ->all();

        $checklistResults = array_pad($checklistResults, 12, null);

        $processLabels = [
            'blank_pierce' => 'BLANK + PIERCE',
            'draw' => 'DRAW',
            'embos' => 'EMBOS',
            'trim' => 'TRIM',
            'form' => 'FORM',
            'flang' => 'FLANG',
            'restrike' => 'RESTRIKE',
            'pierce' => 'PIERCE',
            'cam_pierce' => 'CAM-PIERCE',
        ];

        $logoPath = public_path('storage/logo-itsa2.png');
        $illustrationPath = $history->illustration_path
            ? storage_path('app/public/' . $history->illustration_path)
            : null;

        $pdf = Pdf::loadView('ppm.form-pdf', [
            'history' => $history,
            'die' => $history->die,
            'processLabel' => $processLabels[$history->process_type] ?? strtoupper((string) $history->process_type),
            'checklistRows' => $checklistResults,
            'standardStrokeValue' => $history->die?->ppm_standard ?? $history->die?->standard_stroke ?? '-',
            'noteValue' => $history->work_performed ?: ($history->findings ?: '-'),
            'logoPath' => file_exists($logoPath) ? $logoPath : null,
            'illustrationPath' => $illustrationPath && file_exists($illustrationPath) ? $illustrationPath : null,
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('PPM_Form_' . ($history->ppm_number ?: $history->id) . '.pdf');
    }

    /**
     * Show the form for creating a new die.
     */
    public function create()
    {
        // Collect distinct die groups from existing records
        $existingGroups = DieModel::whereNotNull('die_group')
            ->where('die_group', '!=', '')
            ->distinct()
            ->orderBy('die_group')
            ->pluck('die_group')
            ->toArray();

        // Also derive groups from part_number prefixes (first 5 chars)
        $partPrefixes = DieModel::whereNotNull('part_number')
            ->where('part_number', '!=', '')
            ->pluck('part_number')
            ->map(fn($p) => substr($p, 0, 5))
            ->unique()
            ->sort()
            ->values()
            ->toArray();

        $dieGroups = collect(array_merge($existingGroups, $partPrefixes))
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Dies/Create', [
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with('tonnageStandard')
                ->active()
                ->get(),
            'dieGroups' => $dieGroups,
        ]);
    }

    /**
     * Store a newly created die.
     */
    public function store(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'part_number' => 'required|string|max:50',
            'part_name' => 'required|string|max:200',
            'machine_model_id' => 'required|exists:machine_models,id',
            'customer_id' => 'required|exists:customers,id',
            'qty_die' => 'required|integer|min:1',
            'line' => 'nullable|string|max:20',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'control_stroke' => 'nullable|integer|min:0',
            'last_ppm_date' => 'nullable|date',
            'last_stroke' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        DieModel::create($validated);

        return redirect()->route('dies.index')
            ->with('success', 'Die created successfully.');
    }

    /**
     * Display the specified die.
     */
    public function show(DieModel $die)
    {
        $die->load([
            'machineModel.tonnageStandard',
            'customer',
            'productionLogs' => fn($q) => $q->orderByDesc('production_date')->limit(50),
            'ppmHistories' => fn($q) => $q->orderByDesc('ppm_date'),
            'dieProcesses',
            'latestProductionLog',
        ]);

        // Build schedule info: prioritize dies table fields, fallback to ppm_schedules table
        // Only look up fallback schedule when PPM flow is in scheduling phase
        // (NOT during red_alerted or earlier — those are from previous cycles)
        $ppmScheduledDate = $die->ppm_scheduled_date?->format('d-M-Y');
        $ppmScheduledBy = $die->ppm_scheduled_by;

        // Only do fallback lookup when status indicates scheduling has actually happened
        // in the CURRENT cycle. Statuses like orange_alerted, lot_date_set, red_alerted
        // are BEFORE MTN creates a schedule, so old schedule data should NOT be shown.
        $schedulingActiveStatuses = [
            'ppm_scheduled',
            'schedule_approved',
            'transferred_to_mtn',
            'ppm_in_progress',
            'additional_repair',
            'ppm_completed',
        ];

        if (in_array($die->ppm_alert_status, $schedulingActiveStatuses)) {
            // Get upcoming/latest PPM schedule from ppm_schedules table (scheduler calendar)
            $upcomingSchedule = $die->ppmSchedules()
                ->where(function ($q) {
                    $q->whereNotNull('plan_week')
                        ->orWhereNotNull('ppm_date');
                })
                ->orderByDesc('year')
                ->orderByDesc('month')
                ->orderByDesc('week')
                ->first();

            // If no date on die record, try to get from ppm_schedules (scheduler calendar)
            if (!$ppmScheduledDate && $upcomingSchedule) {
                if ($upcomingSchedule->ppm_date) {
                    $ppmScheduledDate = $upcomingSchedule->ppm_date->format('d-M-Y');
                } elseif ($upcomingSchedule->plan_week) {
                    $ppmScheduledDate = "Week {$upcomingSchedule->week_label}, " .
                        \Carbon\Carbon::create($upcomingSchedule->year, $upcomingSchedule->month, 1)->format('M Y') .
                        " (Plan: {$upcomingSchedule->plan_week})";
                }
                // Use updated_by (who last edited the calendar cell) as the scheduler
                $ppmScheduledBy = $ppmScheduledBy ?: ($upcomingSchedule->updated_by ?? $upcomingSchedule->pic);
            }

            // If ppm_scheduled_by still empty but calendar has updated_by, use that
            if (!$ppmScheduledBy && $upcomingSchedule) {
                $ppmScheduledBy = $upcomingSchedule->updated_by ?? $upcomingSchedule->pic;
            }
        }

        return Inertia::render('Dies/Show', [
            'die' => [
                'id' => $die->id,
                'encrypted_id' => $die->encrypted_id,
                'part_number' => $die->part_number,
                'part_name' => $die->part_name,
                'customer' => $die->customer,
                'machineModel' => $die->machineModel,
                'tonnage' => $die->machineModel?->tonnageStandard?->tonnage,
                'qty_die' => $die->qty_die,
                'line' => $die->line,
                'process_type' => $die->process_type,
                'accumulation_stroke' => $die->accumulation_stroke,
                'last_stroke' => $die->latestProductionLog?->output_qty,
                'standard_stroke' => $die->standard_stroke,
                'remaining_strokes' => $die->remaining_strokes,
                'stroke_percentage' => $die->stroke_percentage,
                'lot_size' => $die->lot_size_value,
                'current_lot' => $die->current_lot,
                'total_lots' => $die->total_lots,
                'remaining_lots' => $die->remaining_lots,
                'lot_progress' => $die->lot_progress,
                'ppm_status' => $die->ppm_status,
                'ppm_status_label' => $die->ppm_status_label,
                'ppm_alert_status' => $die->ppm_alert_status,
                'ppm_alert_status_label' => $die->ppm_alert_status_label,
                'last_ppm_date' => $die->last_ppm_date?->format('d-M-Y'),
                'location' => $die->location,
                'notes' => $die->notes,
                'productionLogs' => $die->productionLogs,
                'ppmHistories' => $die->ppmHistories,
                // PPM Conditions Info
                'ppm_trigger_condition' => $die->ppm_trigger_condition,
                'ppm_conditions_info' => $die->ppm_conditions_info,
                'next_ppm_stroke' => $die->next_ppm_stroke,
                'ppm_count' => $die->ppm_count ?? 0,
                'stroke_at_last_ppm' => $die->stroke_at_last_ppm ?? 0,
                'total_ppm_checkpoints' => $die->total_ppm_checkpoints,
                // PPIC & PROD features
                'last_lot_date' => $die->last_lot_date?->format('d-M-Y'),
                'last_lot_date_set_by' => $die->last_lot_date_set_by,
                'transferred_at' => $die->transferred_at?->format('d-M-Y H:i'),
                'transferred_by' => $die->transferred_by,
                'transfer_from_location' => $die->transfer_from_location,
                'transfer_to_location' => $die->transfer_to_location,
                // PPM Schedule Info
                'ppm_scheduled_date' => $ppmScheduledDate,
                'ppm_scheduled_by' => $ppmScheduledBy,
                'schedule_approved_at' => $die->schedule_approved_at?->format('d-M-Y H:i'),
                'schedule_approved_by' => $die->schedule_approved_by,
                // PPM Processing Info
                'ppm_started_at' => $die->ppm_started_at?->format('d-M-Y H:i'),
                'ppm_finished_at' => $die->ppm_finished_at?->format('d-M-Y H:i'),
                'ppm_total_days' => $die->ppm_total_days,
                'is_4lot_check' => $die->is_4lot_check,
                // Multi-process PPM
                'die_processes' => $die->dieProcesses->map(fn($p) => [
                    'id' => $p->id,
                    'encrypted_id' => $p->encrypted_id,
                    'process_type' => $p->process_type,
                    'process_label' => $p->process_label,
                    'process_order' => $p->process_order,
                    'ppm_status' => $p->ppm_status,
                    'status_label' => $p->status_label,
                    'ppm_started_at' => $p->ppm_started_at?->format('d-M-Y H:i'),
                    'ppm_completed_at' => $p->ppm_completed_at?->format('d-M-Y H:i'),
                    'completed_by' => $p->completed_by,
                    'notes' => $p->notes,
                ]),
                'ppm_process_progress' => $die->ppm_process_progress,
                // Remarks
                'schedule_remark' => $die->schedule_remark,
                'schedule_change_reason' => $die->schedule_change_reason,
                'mtn_remark' => $die->mtn_remark,
                'ppic_remark' => $die->ppic_remark,
                'schedule_cancelled_at' => $die->schedule_cancelled_at?->format('d-M-Y H:i'),
                'schedule_cancelled_by' => $die->schedule_cancelled_by,
                'group_name' => $die->group_name,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified die.
     */
    public function edit(DieModel $die)
    {
        return Inertia::render('Dies/Edit', [
            'die' => $die,
            'customers' => Customer::active()->get(['id', 'code', 'name']),
            'machineModels' => MachineModel::with([
                'tonnageStandard' => fn($q) => $q->select(['id', 'tonnage', 'standard_stroke']),
            ])
                ->active()
                ->get(['id', 'code', 'name', 'tonnage_standard_id']),
            'groupNames' => $this->getAvailableGroupNames(),
        ]);
    }

    /**
     * Update the specified die.
     */
    public function update(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'part_number' => 'required|string|max:50',
            'part_name' => 'required|string|max:200',
            'machine_model_id' => 'required|exists:machine_models,id',
            'customer_id' => 'required|exists:customers,id',
            'qty_die' => 'required|integer|min:1',
            'dies_size' => 'nullable|string|max:20',
            'line' => 'nullable|string|max:20',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'control_stroke' => 'nullable|integer|min:0',
            'last_ppm_date' => 'nullable|date',
            'accumulation_stroke' => 'nullable|integer|min:0',
            'location' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'is_4lot_check' => 'boolean',
            'group_name' => 'nullable|string|max:100',
        ]);

        $newGroupName = $validated['group_name'] ?? null;
        $newAccumulationStroke = (int) ($validated['accumulation_stroke'] ?? 0);

        DB::transaction(function () use ($die, $validated, $newGroupName, $newAccumulationStroke) {
            $trackedFields = array_keys($validated);
            $beforeValues = $this->extractDieFieldValues($die, $trackedFields);

            // Update only this die's data (including group_name)
            $die->update($validated);
            $die->refresh();

            $changes = $this->buildDieChanges($trackedFields, $beforeValues, $this->extractDieFieldValues($die, $trackedFields));
            if (!empty($changes)) {
                $this->storeDieChangeLog($die, $changes);
            }

            // Sync accumulation_stroke to dies with the same group_name
            if ($newGroupName) {
                $groupMembers = DieModel::query()
                    ->where('group_name', $newGroupName)
                    ->where('id', '!=', $die->id)
                    ->get();

                $groupMembers->each(function (DieModel $member) use ($newAccumulationStroke) {
                    $memberBeforeValues = $this->extractDieFieldValues($member, ['accumulation_stroke']);

                    $member->update(['accumulation_stroke' => $newAccumulationStroke]);
                    $member->refresh();

                    $memberChanges = $this->buildDieChanges(
                        ['accumulation_stroke'],
                        $memberBeforeValues,
                        $this->extractDieFieldValues($member, ['accumulation_stroke'])
                    );

                    if (!empty($memberChanges)) {
                        $this->storeDieChangeLog($member, $memberChanges);
                    }
                });
            }
        });

        return redirect()->route('dies.index')
            ->with('success', 'Die updated successfully.');
    }

    /**
     * Record PPM for the specified die.
     * Button disabled unless die has been transferred to MTN Dies location.
     */
    public function recordPpm(Request $request, DieModel $die)
    {
        // Validate that die has been transferred to MTN Dies
        if (!in_array($die->ppm_alert_status, ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'])) {
            return redirect()->back()
                ->with('error', 'Cannot record PPM. Die must be transferred to MTN Dies location first.');
        }

        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'checklist_results' => 'nullable|array',
            'checklist_results.*.item_no' => 'required|integer',
            'checklist_results.*.description' => 'required|string',
            'checklist_results.*.result' => 'required|in:normal,unusual',
            'checklist_results.*.remark' => 'nullable|string',
            'work_performed' => 'nullable|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->recordPpm($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM recorded successfully. Stroke counter has been reset.');
    }

    /**
     * Schedule PPM for the specified die (after Orange Alert)
     * Flow: Orange Alert → MTN Dies: Create Schedule of PPM
     * Now supports schedule_remark
     */
    public function schedulePpm(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'scheduled_date' => 'nullable|date',
            'plan_week' => 'nullable|string|max:20',
            'pic' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'schedule_remark' => 'nullable|string|max:1000',
        ]);

        $this->monitoringService->schedulePpmWithRemark($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM has been scheduled successfully.');
    }

    /**
     * PPIC: Approve PPM Schedule
     * Flow: MTN Dies creates schedule → PPIC: Approve The PPM Schedule
     */
    public function approvePpmSchedule(Request $request, DieModel $die)
    {
        $this->monitoringService->approvePpmSchedule($die);

        return redirect()->back()
            ->with('success', 'PPM Schedule has been approved by PPIC.');
    }

    /**
     * Start PPM Processing for the specified die
     * Flow: MTN Dies starts PPM Processing
     * Now supports multi-process type selection
     */
    public function startPpmProcessing(Request $request, DieModel $die)
    {
        // ketika ppic belum konfirmasi jadwal, maka tidak bisa mulai ppm processing
        if (!$die->schedule_approved_at) {
            return redirect()->back()
                ->with('error', 'Cannot start PPM Processing. PPM schedule must be confirmed by PPIC first.');
        }
        // ketika jadwal sudah dikonfirmasi tapi bagian production belum ditransfer ke MTN Dies, maka tidak bisa mulai ppm processing
        if ($die->ppm_alert_status !== 'transferred_to_mtn' || !$die->transferred_at) {
            return redirect()->back()
                ->with('error', 'Cannot start PPM Processing. Die must be transferred by Production to MTN Dies first.');
        }

        $validated = $request->validate([
            'process_types' => 'nullable|array',
            'process_types.*' => 'in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
        ]);

        $this->monitoringService->startPpmProcessing($die, $validated['process_types'] ?? []);

        return redirect()->back()
            ->with('success', 'PPM Processing has been started.' .
                (!empty($validated['process_types']) ? ' ' . count($validated['process_types']) . ' processes initialized.' : ''));
    }

    /**
     * PPIC: Set Last Date of LOT
     * Flow: Orange Alert -> PPIC sets the estimated last production date for current LOT
     */
    public function setLastLotDate(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'last_lot_date' => 'required|date',
            'set_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->setLastLotDate($die, $validated);

        return redirect()->back()
            ->with('success', 'Last LOT date has been set successfully.');
    }

    /**
     * PROD: Transfer Dies to MTN Dies Location
     * Flow: Red Alert → PROD: Transfer Dies to Location MTN Dies
     */
    public function transferDies(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'from_location' => 'nullable|string|max:100',
            'to_location' => 'nullable|string|max:100',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferDiesToMtn($die, $validated);

        return redirect()->back()
            ->with('success', 'Dies has been transferred to MTN Dies location.');
    }

    /**
     * PROD: Transfer Dies Back to Production
     * Flow: PPM Completed → Status Red→Green → PROD: Dies Location Back to Production
     */
    public function transferBackToProduction(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'to_location' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->transferBackToProduction($die, $validated);

        return redirect()->back()
            ->with('success', 'Dies has been transferred back to Production. PPM cycle completed.');
    }

    /**
     * MTN Dies: Mark Additional Repair Needed during PPM
     * Flow: Processing PPM → "The Process is Normal?" → No → Additional Repair Dies
     */
    public function markAdditionalRepair(Request $request, DieModel $die)
    {
        $this->monitoringService->markAdditionalRepair($die);

        return redirect()->back()
            ->with('success', 'Die marked for additional repair. PPM continues after repair.');
    }

    /**
     * MTN Dies: Resume PPM after Additional Repair
     * Flow: Additional Repair Dies → back to Processing PPM
     */
    public function resumePpmAfterRepair(DieModel $die)
    {
        $this->monitoringService->resumePpmAfterRepair($die);

        return redirect()->back()
            ->with('success', 'PPM processing resumed after additional repair.');
    }

    /**
     * Cancel PPM Schedule with reason
     */
    public function cancelSchedule(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $this->monitoringService->cancelPpmSchedule($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM Schedule cancelled.');
    }

    /**
     * Reschedule PPM with change reason
     */
    public function reschedule(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'scheduled_date' => 'required|date',
            'pic' => 'nullable|string|max:100',
            'reason' => 'nullable|string|max:1000',
            'schedule_remark' => 'nullable|string|max:1000',
        ]);

        $this->monitoringService->reschedulePpm($die, $validated);

        return redirect()->back()
            ->with('success', 'PPM rescheduled successfully.');
    }

    /**
     * Complete a specific process within multi-process PPM
     */
    public function completeProcess(Request $request, DieProcess $process)
    {
        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'checklist_results' => 'nullable|array',
            'checklist_results.*.item_no' => 'required|integer',
            'checklist_results.*.description' => 'required|string',
            'checklist_results.*.result' => 'required|in:normal,unusual',
            'checklist_results.*.remark' => 'nullable|string',
            'work_performed' => 'nullable|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
        ]);

        $this->monitoringService->completeProcess($process, $validated);

        return redirect()->back()
            ->with('success', "Process {$process->process_label} completed.");
    }

    /**
     * Start a specific process within multi-process PPM
     */
    public function startProcess(DieProcess $process)
    {
        $this->monitoringService->startProcess($process);

        return redirect()->back()
            ->with('success', "Process {$process->process_label} started.");
    }

    /**
     * Update MTN Dies remark
     */
    public function updateMtnRemark(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'mtn_remark' => 'required|string|max:2000',
        ]);

        $this->monitoringService->updateMtnRemark($die, $validated['mtn_remark']);

        return redirect()->back()
            ->with('success', 'MTN Dies remark updated.');
    }

    /**
     * Update PPIC remark
     */
    public function updatePpicRemark(Request $request, DieModel $die)
    {
        $validated = $request->validate([
            'ppic_remark' => 'required|string|max:2000',
        ]);

        $this->monitoringService->updatePpicRemark($die, $validated['ppic_remark']);

        return redirect()->back()
            ->with('success', 'PPIC remark updated.');
    }

    /**
     * Remove the specified die from storage.
     */
    public function destroy(DieModel $die)
    {
        // Check if die has production logs or PPM history
        if ($die->productionLogs()->exists() || $die->ppmHistories()->exists()) {
            // Soft delete - just mark as inactive
            $die->update(['status' => 'inactive']);
            return redirect()->route('dies.index')
                ->with('success', 'Die has been deactivated.');
        }

        $die->delete();
        return redirect()->route('dies.index')
            ->with('success', 'Die deleted successfully.');
    }

    /**
     * Show Test Alert page
     */
    public function showTestAlert()
    {
        return Inertia::render('TestAlert', [
            'dies' => DieModel::with('customer:id,code')
                ->active()
                ->get(['id', 'part_number', 'part_name', 'customer_id', 'accumulation_stroke']),
            'mailConfig' => [
                'driver' => config('mail.default'),
                'host' => config('mail.mailers.smtp.host'),
                'from' => config('mail.from.address'),
            ],
        ]);
    }

    /**
     * Send test alert email
     */
    public function sendTestAlert(Request $request)
    {
        $validated = $request->validate([
            'die_id' => 'required|exists:dies,id',
            'alert_type' => 'required|in:orange,red',
            'email' => 'required|email',
        ]);

        $die = DieModel::with(['customer', 'machineModel'])->findOrFail($validated['die_id']);

        try {
            $notification = new \App\Notifications\CriticalDieAlert($die, $validated['alert_type']);

            // Use on-demand notification
            \Illuminate\Support\Facades\Notification::route('mail', $validated['email'])
                ->notify($notification);

            return redirect()->back()
                ->with('success', "Test {$validated['alert_type']} alert sent to {$validated['email']}");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    // ======================================
    // BATCH PPM ACTIONS (Multi-Die)
    // ======================================

    /**
     * Batch: Start PPM Processing for multiple dies
     */
    public function batchStartPpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'transferred_to_mtn')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Start PPM.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->startPpmProcessing($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM process started successfully.");
    }

    /**
     * Batch: Transfer multiple dies to MTN Dies
     */
    public function batchTransferDies(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'transferred_by' => 'nullable|string|max:100',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'red_alerted')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk transfer ke MTN Dies.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferDiesToMtn($die, [
                'transferred_by' => $validated['transferred_by'] ?? auth()->user()?->name,
            ]);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die successfully transferred to MTN Dies.");
    }

    /**
     * Batch: Transfer multiple dies back to Production
     */
    public function batchTransferBack(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'ppm_completed')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'No dies are eligible for transfer back to Production.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->transferBackToProduction($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die successfully transferred back to Production. PPM cycle completed.");
    }

    /**
     * Batch: Mark additional repair for multiple dies
     */
    public function batchAdditionalRepair(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'ppm_in_progress')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Additional Repair.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->markAdditionalRepair($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die ditandai membutuhkan additional repair.");
    }

    /**
     * Batch: Resume PPM after repair for multiple dies
     */
    public function batchResumePpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->where('ppm_alert_status', 'additional_repair')
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Resume PPM.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->resumePpmAfterRepair($die);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM process resumed successfully.");
    }

    /**
     * Batch: Record PPM for multiple dies at once
     * Each die gets its own process_type, checklist, and PPM history
     * Shared fields: ppm_date, pic, maintenance_type, checked_by, approved_by
     */
    public function batchRecordPpm(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
            // Per-die data keyed by die ID
            'die_data' => 'required|array',
            'die_data.*.process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'die_data.*.checklist_results' => 'nullable|array',
            'die_data.*.checklist_results.*.item_no' => 'required|integer',
            'die_data.*.checklist_results.*.description' => 'required|string',
            'die_data.*.checklist_results.*.result' => 'required|in:normal,unusual',
            'die_data.*.checklist_results.*.remark' => 'nullable|string',
            'die_data.*.work_performed' => 'nullable|string',
            'die_data.*.parts_replaced' => 'nullable|string',
            'die_data.*.findings' => 'nullable|string',
            'die_data.*.recommendations' => 'nullable|string',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->whereIn('ppm_alert_status', ['transferred_to_mtn', 'ppm_in_progress', 'additional_repair'])
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Record PPM.');
        }

        $dieData = $validated['die_data'] ?? [];
        $count = 0;
        foreach ($dies as $die) {
            $perDie = $dieData[$die->id] ?? [];
            $ppmData = [
                'ppm_date' => $validated['ppm_date'],
                'pic' => $validated['pic'],
                'maintenance_type' => $validated['maintenance_type'],
                'process_type' => $perDie['process_type'] ?? $die->process_type,
                'checklist_results' => $perDie['checklist_results'] ?? null,
                'work_performed' => $perDie['work_performed'] ?? null,
                'parts_replaced' => $perDie['parts_replaced'] ?? null,
                'findings' => $perDie['findings'] ?? null,
                'recommendations' => $perDie['recommendations'] ?? null,
                'checked_by' => $validated['checked_by'],
                'approved_by' => $validated['approved_by'],
            ];
            $this->monitoringService->recordPpm($die, $ppmData);
            $count++;
        }

        return redirect()->back()
            ->with('success', "{$count} die PPM recorded successfully.");
    }

    /**
     * Batch: Set Last LOT Date for multiple dies at once
     * Flow: PPIC sets the estimated last production date for multiple orange/red dies
     */
    public function batchSetLastLotDate(Request $request)
    {
        $validated = $request->validate([
            'die_ids' => 'required|array|min:1',
            'die_ids.*' => 'exists:dies,id',
            'last_lot_date' => 'required|date',
            'set_by' => 'nullable|string|max:100',
        ]);

        $dies = DieModel::whereIn('id', $validated['die_ids'])
            ->whereNotIn('ppm_alert_status', [
                'transferred_to_mtn',
                'ppm_in_progress',
                'additional_repair',
                'ppm_completed',
            ])
            ->get();

        if ($dies->isEmpty()) {
            return redirect()->back()
                ->with('error', 'Tidak ada die yang memenuhi syarat untuk Set Last LOT Date.');
        }

        $count = 0;
        foreach ($dies as $die) {
            $this->monitoringService->setLastLotDate($die, [
                'last_lot_date' => $validated['last_lot_date'],
                'set_by' => $validated['set_by'] ?? auth()->user()?->name,
            ]);
            $count++;
        }
        dd($count);

        return redirect()->back()
            ->with('success', "{$count} die Last LOT Date set successfully.");
    }

    private function getAvailableDieGroups()
    {
        $existingGroups = DieModel::whereNotNull('die_group')
            ->where('die_group', '!=', '')
            ->pluck('die_group')
            ->map(fn($group) => $this->sanitizeDieGroup($group));

        $derivedGroups = DieModel::whereNotNull('part_number')
            ->where('part_number', '!=', '')
            ->pluck('part_number')
            ->map(fn($partNumber) => $this->deriveDieGroupFromPartNumber($partNumber));

        return $existingGroups
            ->merge($derivedGroups)
            ->filter()
            ->unique()
            ->sort()
            ->values();
    }

    private function resolveDieGroup(?string $partNumber, ?string $dieGroup): ?string
    {
        return DieModel::resolveDieGroup($partNumber, $dieGroup);
    }

    private function deriveDieGroupFromPartNumber(?string $partNumber): ?string
    {
        return DieModel::deriveDieGroupFromPartNumber($partNumber);
    }

    private function sanitizeDieGroup(?string $dieGroup): ?string
    {
        return DieModel::sanitizeDieGroup($dieGroup);
    }

    private function isDieGroupValidForPartNumber(?string $partNumber, string $dieGroup): bool
    {
        return DieModel::isDieGroupValidForPartNumber($partNumber, $dieGroup);
    }

    private function adjustGroupedAccumulationStroke(?string $groupKey, int $deltaStroke, ?int $excludeDieId = null): void
    {
        if (!$groupKey || $deltaStroke === 0) {
            return;
        }

        $this->getDiesInCompatibleGroup($groupKey)
            ->when($excludeDieId, fn($collection) => $collection->where('id', '!=', $excludeDieId))
            ->each(function (DieModel $groupedDie) use ($groupKey, $deltaStroke) {
                $newAccumulationStroke = max(0, (int) ($groupedDie->accumulation_stroke ?? 0) + $deltaStroke);

                $payload = [
                    'accumulation_stroke' => $newAccumulationStroke,
                ];

                if (DieModel::isDieGroupValidForPartNumber($groupedDie->part_number, $groupKey)) {
                    $payload['die_group'] = $groupKey;
                }

                $groupedDie->update($payload);
            });
    }

    private function getDiesInCompatibleGroup(?string $groupKey)
    {
        if (!$groupKey) {
            return collect();
        }

        $queryPrefix = substr($groupKey, 0, 5);

        return DieModel::query()
            ->where(function ($query) use ($queryPrefix) {
                $query->where('part_number', 'like', $queryPrefix . '%')
                    ->orWhere('die_group', 'like', $queryPrefix . '%');
            })
            ->get()
            ->filter(function (DieModel $candidate) use ($groupKey) {
                $candidateGroup = DieModel::resolveDieGroup($candidate->part_number, $candidate->die_group);

                return DieModel::areDieGroupsCompatible($groupKey, $candidateGroup);
            })
            ->values();
    }

    public function updatePpmForm(Request $request, PpmHistory $history)
    {
        $validated = $request->validate([
            'ppm_date' => 'required|date',
            'pic' => 'required|string|max:100',
            'maintenance_type' => 'required|in:routine,repair,overhaul,emergency',
            'process_type' => 'nullable|in:blank_pierce,draw,embos,trim,form,flang,restrike,pierce,cam_pierce',
            'checklist_results' => 'nullable|array',
            'checklist_results.*.item_no' => 'required|integer',
            'checklist_results.*.description' => 'required|string',
            'checklist_results.*.result' => 'required|in:normal,unusual',
            'checklist_results.*.remark' => 'nullable|string',
            'work_performed' => 'nullable|string',
            'parts_replaced' => 'nullable|string',
            'findings' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'checked_by' => 'nullable|string|max:100',
            'approved_by' => 'nullable|string|max:100',
            'illustration_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        // Accept ISO datetime input from frontend and persist as date column format.
        $validated['ppm_date'] = Carbon::parse($validated['ppm_date'])->toDateString();

        if ($request->hasFile('illustration_image')) {
            if ($history->illustration_path && Storage::disk('public')->exists($history->illustration_path)) {
                Storage::disk('public')->delete($history->illustration_path);
            }

            $validated['illustration_path'] = $request->file('illustration_image')
                ->store('ppm-illustrations', 'public');
        }

        unset($validated['illustration_image']);

        $history->update($validated);

        return redirect()->back()->with('success', 'PPM history updated successfully.');
    }

    public function destroyPpmFormHistory(PpmHistory $history)
    {
        if ($history->illustration_path && Storage::disk('public')->exists($history->illustration_path)) {
            Storage::disk('public')->delete($history->illustration_path);
        }

        // Hapus satu data die_processes yang berelasi ke ppm_history ini
        \App\Models\DieProcess::where('die_id', $history->die_id)
            ->where('process_type', $history->process_type)
            ->where('ppm_history_id', $history->id)
            ->limit(1)
            ->delete();

        $history->delete();

        return redirect()->back()->with('success', 'PPM history & relasi die_process berhasil dihapus.');
    }


    private function getAvailableGroupNames()
    {
        return DieModel::whereNotNull('group_name')
            ->where('group_name', '!=', '')
            ->distinct()
            ->orderBy('group_name')
            ->pluck('group_name')
            ->values();
    }

    private function extractDieFieldValues(DieModel $die, array $fields): array
    {
        $values = [];

        foreach (array_unique($fields) as $field) {
            $values[$field] = $this->normalizeDieFieldValue($field, $die->{$field});
        }

        return $values;
    }

    private function buildDieChanges(array $fields, array $beforeValues, array $afterValues): array
    {
        $changes = [];

        foreach (array_unique($fields) as $field) {
            $oldValue = $beforeValues[$field] ?? null;
            $newValue = $afterValues[$field] ?? null;

            if ($oldValue === $newValue) {
                continue;
            }

            $changes[$field] = [
                'old' => $this->formatDieFieldValueForDisplay($field, $oldValue),
                'new' => $this->formatDieFieldValueForDisplay($field, $newValue),
            ];
        }

        return $changes;
    }

    private function storeDieChangeLog(DieModel $die, array $changes): void
    {
        DieChangeLog::create([
            'die_id' => $die->id,
            'user_id' => auth()->id(),
            'part_number' => $die->part_number,
            'part_name' => $die->part_name,
            'changed_fields' => $changes,
        ]);
    }

    private function normalizeDieFieldValue(string $field, mixed $value): mixed
    {
        if ($value instanceof DateTimeInterface) {
            return $field === 'last_ppm_date'
                ? $value->format('Y-m-d')
                : $value->format('Y-m-d H:i:s');
        }

        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return str_contains((string) $value, '.') ? (float) $value : (int) $value;
        }

        if (is_string($value)) {
            $trimmedValue = trim($value);

            return $trimmedValue === '' ? null : $trimmedValue;
        }

        return $value;
    }

    private function formatDieFieldValueForDisplay(string $field, mixed $value): string
    {
        if ($value === null || $value === '') {
            return '-';
        }

        return match ($field) {
            'machine_model_id' => MachineModel::find($value)?->code ?? (string) $value,
            'customer_id' => Customer::find($value)?->code ?? (string) $value,
            'process_type' => ucwords(str_replace('_', ' ', (string) $value)),
            'is_4lot_check' => $value ? 'Yes' : 'No',
            'qty_die', 'control_stroke', 'accumulation_stroke' => number_format((int) $value),
            default => (string) $value,
        };
    }

    private function getDieFieldLabel(string $field): string
    {
        return self::DIE_CHANGE_FIELD_LABELS[$field] ?? ucwords(str_replace('_', ' ', $field));
    }
}
