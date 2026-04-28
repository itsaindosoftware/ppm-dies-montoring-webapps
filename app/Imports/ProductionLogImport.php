<?php

namespace App\Imports;

use App\Models\DieChangeLog;
use App\Models\DieModel;
use App\Models\ProductionLog;
use App\Models\User;
use App\Notifications\CriticalDieAlert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithCalculatedFormulas;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

class ProductionLogImport implements ToModel, WithHeadingRow, WithValidation, WithCalculatedFormulas, SkipsEmptyRows, SkipsOnError, SkipsOnFailure
{
    use Importable, SkipsErrors, SkipsFailures;

    protected int $importedCount = 0;
    protected int $accumulatedCount = 0;
    protected array $skippedRows = [];
    protected array $successRows = [];
    protected array $accumulatedRows = [];
    protected int $currentRow = 1; // heading row = 1, data starts at 2
    protected array $alertsSent = [];

    public function model(array $row)
    {
        $this->currentRow++;
        $rowNum = $this->currentRow;

        // Flexible key lookup for part_number
        $partNumber = $this->cleanValue($row['part_number'] ?? $row['part_no'] ?? $row['partnumber'] ?? null);

        // Skip if no part number
        if (empty($partNumber)) {
            return null;
        }

        // Find die by part number - first try exact match
        $die = DieModel::where('part_number', $partNumber)->first();
        $matchedByBase = false;

        // If no exact match, try matching by base part number
        // Strip parenthetical suffix like (AC), (CC), (A), (R), (L), (C), etc.
        if (!$die) {
            $basePartNumber = trim(preg_replace('/\s*\([^)]*\)\s*$/', '', $partNumber));

            if ($basePartNumber !== $partNumber && !empty($basePartNumber)) {
                $die = DieModel::where('part_number', $basePartNumber)->first();
                if ($die) {
                    $matchedByBase = true;
                }
            }
        }

        // Flexible key lookup for output qty
        $rawOutput = $row['total_output_prod_pcs'] ?? $row['total_output_prod'] ?? $row['output_qty'] ?? $row['output'] ?? $row['qty'] ?? 0;

        if (!$die) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $this->cleanValue($row['part_name'] ?? null, '-'),
                'date' => $row['date'] ?? '-',
                'output' => $rawOutput ?: '-',
                'reason' => "Part number '{$partNumber}' not found in Dies Master",
            ];
            return null;
        }

        // Parse date
        $date = $this->parseDate($row['date'] ?? null);
        if (!$date) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $row['date'] ?? '-',
                'output' => $rawOutput ?: '-',
                'reason' => "Invalid date format: '" . ($row['date'] ?? '') . "'",
            ];
            return null;
        }

        // Parse output qty
        $outputQty = (int) str_replace([',', '.', ' '], '', $rawOutput);

        if ($outputQty <= 0) {
            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $date->format('d-M-Y'),
                'output' => $rawOutput ?: '0',
                'reason' => 'Output qty kosong atau 0',
            ];
            return null;
        }

        $shift = (int) ($row['shift'] ?? 1);
        $line = $this->cleanValue($row['line'] ?? null, $die->line);

        // Check for duplicate: same die (part_number/part_name/model/customer) + same date + same shift
        // If data already exists in database, skip entirely (do not overwrite or accumulate)
        $existingLog = ProductionLog::where('die_id', $die->id)
            ->where('production_date', $date->format('Y-m-d'))
            ->where('shift', $shift)
            ->first();

        if ($existingLog) {
            // If matched by base part number (variant suffix stripped), accumulate quantity
            // e.g. 65112-I6050 (AC) + 65112-I6050 (CC) → both accumulate to die 65112-I6050
            if ($matchedByBase) {
                $existingLog->increment('output_qty', $outputQty);

                $strokeSync = $this->syncGroupedStrokes($die, $partNumber, $outputQty);

                $this->accumulatedCount++;
                $this->accumulatedRows[] = [
                    'row_number' => $rowNum,
                    'part_number' => $partNumber,
                    'part_name' => $die->part_name,
                    'date' => $date->format('d-M-Y'),
                    'shift' => $shift,
                    'output' => $outputQty,
                    'accumulated_to' => $die->part_number,
                    'new_total' => $existingLog->output_qty,
                    'reason' => "Diakumulasi ke part {$die->part_number} (total log: {$existingLog->output_qty}, stroke: {$strokeSync['new_stroke']}, grouped dies: {$strokeSync['grouped_count']})",
                ];

                return null;
            }

            $this->skippedRows[] = [
                'row_number' => $rowNum,
                'part_number' => $partNumber,
                'part_name' => $die->part_name,
                'date' => $date->format('d-M-Y'),
                'output' => $outputQty,
                // You cannot double input on the same date (pesan erornya revisi dari pak didin)
                // 'reason' => "Data sudah ada di database (tanggal: {$existingLog->production_date->format('d-M-Y')}, shift: {$existingLog->shift}, output existing: {$existingLog->output_qty})",
                'reason' => 'You cannot double input on the same date (date: ' . Carbon::parse($existingLog->production_date)->format('d-M-Y') . ')',
            ];
            return null;
        }

        // Update qty_die on die master if provided in import
        $rawQtyDie = $row['qty_die'] ?? $row['qtydie'] ?? $row['qty_dies'] ?? null;
        if (!empty($rawQtyDie)) {
            $qtyDie = (int) str_replace([',', '.', ' '], '', $rawQtyDie);
            if ($qtyDie > 0 && $qtyDie !== (int) $die->qty_die) {
                $die->update(['qty_die' => $qtyDie]);
            }
        }

        $strokeSync = $this->syncGroupedStrokes($die, $partNumber, $outputQty);

        $this->importedCount++;

        $this->successRows[] = [
            'row_number' => $rowNum,
            'part_number' => $partNumber,
            'part_name' => $die->part_name,
            'date' => $date->format('d-M-Y'),
            'shift' => $shift,
            'line' => $line,
            'output' => $outputQty,
            'grouped_dies' => $strokeSync['grouped_count'],
            'new_stroke' => $strokeSync['new_stroke'],
        ];

        return new ProductionLog([
            'die_id' => $die->id,
            'production_date' => $date,
            'shift' => $shift,
            'line' => $line,
            'running_process' => $this->cleanValue($row['running_process'] ?? null, 'Auto'),
            'start_time' => $this->parseTime($row['start'] ?? null),
            'finish_time' => $this->parseTime($row['finish'] ?? null),
            'total_hours' => $this->parseHours($row['total_hr'] ?? null),
            'total_minutes' => (int) ($row['total_min'] ?? 0),
            'break_time' => (int) ($row['break_time_min'] ?? 0),
            'output_qty' => $outputQty,
            'month' => $date->format('M'),
            'created_by' => auth()->id(),
        ]);
    }

    /**
     * Clean cell value - discard Excel formula text, return fallback instead
     */
    protected function cleanValue($value, $fallback = null)
    {
        if (empty($value)) {
            return $fallback;
        }
        if (is_string($value) && str_starts_with(trim($value), '=')) {
            return $fallback;
        }
        return $value;
    }

    public function rules(): array
    {
        return [
            'part_number' => 'nullable|string',
            'date' => 'nullable',
            'shift' => 'nullable|integer|min:1|max:3',
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'part_number.string' => 'Part Number harus berupa teks',
            'date.required' => 'Date is required',
        ];
    }

    protected function parseDate($value): ?Carbon
    {
        if (empty($value)) {
            return null;
        }

        try {
            // Try different date formats
            $formats = ['d-M-y', 'd-M-Y', 'Y-m-d', 'd/m/Y', 'd/m/y', 'm/d/Y'];

            foreach ($formats as $format) {
                try {
                    return Carbon::createFromFormat($format, $value);
                } catch (\Exception $e) {
                    continue;
                }
            }

            // Try Excel serial date
            if (is_numeric($value)) {
                return Carbon::createFromTimestamp(($value - 25569) * 86400);
            }

            return Carbon::parse($value);
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseTime($value): ?string
    {
        if (empty($value)) {
            return null;
        }

        try {
            if (is_numeric($value)) {
                // Excel time (fraction of day)
                $hours = floor($value * 24);
                $minutes = round(($value * 24 - $hours) * 60);
                return sprintf('%02d:%02d', $hours, $minutes);
            }

            return Carbon::parse($value)->format('H:i');
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function parseHours($value): ?float
    {
        if (empty($value)) {
            return null;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        // Parse time format like "1:27"
        if (strpos($value, ':') !== false) {
            $parts = explode(':', $value);
            return (float) $parts[0] + ((float) ($parts[1] ?? 0) / 60);
        }

        return null;
    }

    /**
     * Sync grouped die stroke values using the same die_group rules as edit/update.
     * Only accumulation_stroke is updated from production output import.
     */
    protected function syncGroupedStrokes(DieModel $seedDie, string $partNumber, int $outputQty): array
    {
        $groupKey = DieModel::resolveDieGroup($partNumber, $seedDie->die_group);
        $groupedDies = $this->getGroupedDies($seedDie, $groupKey);

        if ($groupedDies->isEmpty()) {
            $groupedDies = collect([$seedDie]);
        }

        $currentStroke = (int) $groupedDies->max(function ($die) {
            return (int) ($die->accumulation_stroke ?? 0);
        });

        $newStroke = $currentStroke + $outputQty;

        foreach ($groupedDies as $groupedDie) {
            $beforeStroke = (int) ($groupedDie->accumulation_stroke ?? 0);
            $previousStatus = $groupedDie->ppm_status;

            // Import production output only contributes to accumulation_stroke.
            $groupedDie->update([
                'accumulation_stroke' => $newStroke,
            ]);

            $this->storeAccumulationStrokeChangeLog($groupedDie, $beforeStroke, $newStroke);

            $groupedDie->refresh();
            $groupedDie->load(['machineModel.tonnageStandard', 'customer']);
            $this->checkAndSendAlert($groupedDie, $previousStatus, $groupedDie->ppm_status);
        }

        return [
            'grouped_count' => $groupedDies->count(),
            'new_stroke' => $newStroke,
        ];
    }

    protected function getGroupedDies(DieModel $seedDie, ?string $groupKey)
    {
        if (!empty($seedDie->group_name)) {
            $groupedByName = DieModel::query()
                ->where('group_name', $seedDie->group_name)
                ->get();

            if ($groupedByName->isNotEmpty()) {
                if ($groupedByName->contains(fn(DieModel $candidate) => $candidate->id === $seedDie->id)) {
                    return $groupedByName->values();
                }

                return $groupedByName->push($seedDie)->unique('id')->values();
            }
        }

        if (!$groupKey) {
            return collect([$seedDie]);
        }

        $queryPrefix = substr($groupKey, 0, 5);

        $candidateDies = DieModel::query()
            ->where(function ($query) use ($queryPrefix) {
                $query->where('part_number', 'like', $queryPrefix . '%')
                    ->orWhere('die_group', 'like', $queryPrefix . '%');
            })
            ->get();

        $groupedDies = $candidateDies->filter(function (DieModel $candidate) use ($groupKey) {
            $candidateGroup = DieModel::resolveDieGroup($candidate->part_number, $candidate->die_group);

            return DieModel::areDieGroupsCompatible($groupKey, $candidateGroup);
        })->values();

        if ($groupedDies->contains(fn(DieModel $candidate) => $candidate->id === $seedDie->id)) {
            return $groupedDies;
        }

        return $groupedDies->push($seedDie)->unique('id')->values();
    }

    protected function storeAccumulationStrokeChangeLog(DieModel $die, int $beforeStroke, int $afterStroke): void
    {
        if ($beforeStroke === $afterStroke) {
            return;
        }

        DieChangeLog::create([
            'die_id' => $die->id,
            'user_id' => auth()->id(),
            'part_number' => $die->part_number,
            'part_name' => $die->part_name,
            'changed_fields' => [
                'accumulation_stroke' => [
                    'old' => number_format($beforeStroke),
                    'new' => number_format($afterStroke),
                    'source' => 'import_production_log',
                ],
            ],
        ]);
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }

    public function getSuccessRows(): array
    {
        return $this->successRows;
    }

    public function getAccumulatedCount(): int
    {
        return $this->accumulatedCount;
    }

    public function getAccumulatedRows(): array
    {
        return $this->accumulatedRows;
    }

    public function getAlertsSent(): array
    {
        return $this->alertsSent;
    }

    /**
     * Check if die status changed and send alert notification.
     * Sends orange/red alerts to all relevant roles per flowchart.
     */
    protected function checkAndSendAlert(DieModel $die, string $previousStatus, string $newStatus): void
    {
        if ($previousStatus === $newStatus) {
            return;
        }

        // Prevent duplicate alerts for the same die in this import batch
        $alertKey = "{$die->id}_{$newStatus}";
        if (in_array($alertKey, $this->alertsSent)) {
            return;
        }

        $advancedAlertStatuses = [
            'orange_alerted',
            'lot_date_set',
            'ppm_scheduled',
            'schedule_approved',
            'red_alerted',
            'transferred_to_mtn',
            'ppm_in_progress',
            'additional_repair',
            'ppm_completed',
        ];

        $recipients = User::where('is_active', true)
            ->whereIn('role', [
                User::ROLE_ADMIN,
                User::ROLE_MTN_DIES,
                User::ROLE_MGR_GM,
                User::ROLE_MD,
                User::ROLE_PPIC,
                User::ROLE_PRODUCTION,
            ])
            ->get();

        if ($recipients->isEmpty()) {
            return;
        }

        if ($newStatus === 'orange') {
            Notification::send($recipients, new CriticalDieAlert($die));

            if (!in_array($die->ppm_alert_status, $advancedAlertStatuses)) {
                $die->update(['ppm_alert_status' => 'orange_alerted']);
            }

            cache()->put("ppm_orange_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());
            $this->alertsSent[] = $alertKey;

        } elseif ($newStatus === 'red') {
            Notification::send($recipients, new CriticalDieAlert($die, 'red'));

            if (!in_array($die->ppm_alert_status, ['red_alerted', 'transferred_to_mtn', 'ppm_in_progress', 'additional_repair', 'ppm_completed'])) {
                $die->update([
                    'ppm_alert_status' => 'red_alerted',
                    'red_alerted_at' => now(),
                ]);
            }

            cache()->put("ppm_red_alert_{$die->id}_" . now()->format('Y-m-d'), true, now()->endOfDay());
            $this->alertsSent[] = $alertKey;
        }
    }
}
