<?php

namespace App\Exports;

use App\Models\PpmHistory;
use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class PpmHistoryReportExport implements FromCollection, WithHeadings, WithStyles, WithTitle, ShouldAutoSize
{
    protected Carbon $dateFrom;
    protected Carbon $dateTo;

    public function __construct(Carbon $dateFrom, Carbon $dateTo)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function title(): string
    {
        return 'PPM History Report';
    }

    public function headings(): array
    {
        return [
            'No',
            'PPM Date',
            'Dies Group',
            'Part Number',
            'Part Name',
            'Customer',
            'Model',
            'PPM Process Type',
            'Qty Dies',
            'Std Stroke',
            'Stroke at PPM',
            'Maintenance Type',
            'PIC',
            'Status',
            'Work Performed',
            'Checked By',
            'Approved By',
        ];
    }

    public function collection()
    {
        $histories = PpmHistory::with(['die.customer', 'die.machineModel', 'die.dieProcesses'])
            ->whereBetween('ppm_date', [$this->dateFrom, $this->dateTo])
            ->orderByDesc('ppm_date')
            ->get();

        $rows = collect();
        $index = 0;

        foreach ($histories as $history) {
            $dieProcesses = $history->die?->dieProcesses ?? collect();

            if ($dieProcesses->count() > 1) {
                // Check if this PpmHistory is linked to a specific die_process (multi-process PPM)
                $linkedProcess = $dieProcesses->firstWhere('ppm_history_id', $history->id);

                if ($linkedProcess) {
                    // Multi-process PPM: each PpmHistory already represents one process
                    $index++;
                    $rows->push($this->buildRow($history, $index, $linkedProcess->process_type));
                } else {
                    // Single recordPpm with multiple die_processes: expand into rows per process
                    foreach ($dieProcesses as $process) {
                        $index++;
                        $rows->push($this->buildRow($history, $index, $process->process_type));
                    }
                }
            } else {
                // Single process or no die_processes
                $index++;
                $rows->push($this->buildRow($history, $index, $history->process_type));
            }
        }

        return $rows;
    }

    protected function buildRow(PpmHistory $history, int $index, ?string $processType): array
    {
        return [
            'no' => $index,
            'ppm_date' => $history->ppm_date->format('d-M-Y'),
            'dies_group' => $history->die?->group_name,
            'part_number' => $history->die?->part_number,
            'part_name' => $history->die?->part_name,
            'customer' => $history->die?->customer?->code,
            'model' => $history->die?->machineModel?->code,
            'ppm_process_type' => $processType ? ucwords(str_replace('_', ' ', $processType)) : null,
            'qty_dies' => $history->die?->qty_die,
            'std_stroke' => $history->die?->standard_stroke ? number_format($history->die->standard_stroke) : null,
            'stroke_at_ppm' => $history->stroke_at_ppm ? number_format($history->stroke_at_ppm) : null,
            'maintenance_type' => ucfirst($history->maintenance_type),
            'pic' => $history->pic,
            'status' => ucfirst($history->status),
            'work_performed' => $history->work_performed,
            'checked_by' => $history->checked_by,
            'approved_by' => $history->approved_by,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'Q';

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1565C0'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getStyle("A2:{$lastCol}{$lastRow}")->applyFromArray([
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN],
            ],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(25);

        return [];
    }
}
