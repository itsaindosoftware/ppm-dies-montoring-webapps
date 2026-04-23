<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>PPM Form</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 8mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #111;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
        }

        .sheet {
            width: 100%;
            border: 2px solid #111;
        }

        .border {
            border: 1px solid #111;
        }

        .border-thick {
            border: 2px solid #111;
        }

        .border-top-0 {
            border-top: 0;
        }

        .header {
            padding: 10px 12px;
        }

        .header-table,
        .meta-table,
        .checklist-table,
        .sign-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-title {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-align: center;
        }

        .meta-wrap {
            padding: 8px 10px;
        }

        .meta-section {
            width: 50%;
            vertical-align: top;
        }

        .meta-table td {
            padding: 2px 0;
            vertical-align: top;
        }

        .label {
            width: 86px;
        }

        .colon {
            width: 10px;
        }

        .process-row {
            margin-top: 8px;
            font-weight: 700;
        }

        .checklist-table th,
        .checklist-table td,
        .sign-table td {
            border: 1px solid #111;
            padding: 3px 4px;
            vertical-align: top;
        }

        .checklist-table {
            font-size: 9px;
        }

        .checklist-table th {
            text-align: center;
            font-weight: 700;
        }

        .center {
            text-align: center;
        }

        .checkbox {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 1px solid #111;
            line-height: 12px;
            font-size: 10px;
            text-align: center;
        }

        .illustration-wrap,
        .note-wrap,
        .sign-wrap {
            padding: 8px 10px;
        }

        .illustration-box {
            height: 120px;
            border: 1px solid #bbb;
            text-align: center;
            vertical-align: middle;
        }

        .illustration-box img {
            width: auto;
            max-width: 100%;
            max-height: 112px;
        }

        .muted {
            color: #666;
        }

        .note-title {
            font-weight: 700;
            margin-bottom: 4px;
        }

        .note-body {
            min-height: 34px;
            white-space: pre-wrap;
        }

        .sign-table td {
            text-align: center;
        }

        .sign-value {
            height: 64px;
            vertical-align: bottom !important;
            padding-bottom: 6px !important;
        }

        .logo {
            height: 54px;
        }
    </style>
</head>
<body>
    <div class="sheet">
        <div class="border-thick header">
            <table class="header-table">
                <tr>
                    <td style="width: 26%;">
                        @if($logoPath)
                            <img src="{{ $logoPath }}" alt="Company Logo" class="logo">
                        @endif
                    </td>
                    <td>
                        <div class="header-title">INSPECTION CHECK PPM DIES</div>
                    </td>
                </tr>
            </table>
        </div>

        <div class="border-thick border-top-0 meta-wrap">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td class="meta-section">
                        <table class="meta-table">
                            <tr><td class="label">PART NAME</td><td class="colon">:</td><td>{{ $die?->part_name ?: '-' }}</td></tr>
                            <tr><td class="label">PART No.</td><td class="colon">:</td><td>{{ $die?->part_number ?: '-' }}</td></tr>
                            <tr><td class="label">MODEL</td><td class="colon">:</td><td>{{ $die?->machineModel?->code ?: '-' }}</td></tr>
                            <tr><td class="label">TOTAL STOKE</td><td class="colon">:</td><td>{{ $history->stroke_at_ppm ?: ($die?->accumulation_stroke ?: '-') }}</td></tr>
                        </table>
                    </td>
                    <td class="meta-section">
                        <table class="meta-table">
                            <tr><td class="label">PM ID</td><td class="colon">:</td><td>{{ $history->id }}</td></tr>
                            <tr><td class="label">DIES No.</td><td class="colon">:</td><td>{{ $die?->qty_die ?: '-' }}</td></tr>
                            <tr><td class="label">CUSTOMER</td><td class="colon">:</td><td>{{ $die?->customer?->code ?: '-' }}</td></tr>
                            <tr><td class="label">STANDARD STROKE</td><td class="colon">:</td><td>{{ $standardStrokeValue }}</td></tr>
                            <tr><td class="label">TOLERANCE</td><td class="colon">:</td><td>1 Lot</td></tr>
                        </table>
                    </td>
                </tr>
            </table>

            <table class="meta-table process-row">
                <tr><td class="label">PROCESS</td><td class="colon">:</td><td>{{ $processLabel }}</td></tr>
            </table>
        </div>

        <table class="checklist-table">
            <thead>
                <tr>
                    <th rowspan="2" style="width: 34px;">No.</th>
                    <th rowspan="2">CHECKLIST ITEM</th>
                    <th colspan="2" style="width: 120px;">Inspection result</th>
                    <th rowspan="2" style="width: 170px;">Remark</th>
                </tr>
                <tr>
                    <th style="width: 60px;">Normal</th>
                    <th style="width: 60px;">Unusual</th>
                </tr>
            </thead>
            <tbody>
                @foreach($checklistRows as $index => $item)
                    @php
                        $result = $item['result'] ?? '';
                    @endphp
                    <tr>
                        <td class="center">{{ $item['item_no'] ?? ($index + 1) }}</td>
                        <td>{{ $item['description'] ?? '-' }}</td>
                        <td class="center"><span class="checkbox">{{ $result === 'normal' || $result === 'ok' ? 'v' : '' }}</span></td>
                        <td class="center"><span class="checkbox">{{ $result && $result !== 'normal' && $result !== 'ok' ? 'v' : '' }}</span></td>
                        <td>{{ $item['remark'] ?? '' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="border-thick border-top-0 illustration-wrap">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td class="illustration-box">
                        @if($illustrationPath)
                            <img src="{{ $illustrationPath }}" alt="PPM Illustration">
                        @else
                            <span class="muted">No image selected</span>
                        @endif
                    </td>
                </tr>
            </table>
        </div>

        <div class="border-thick border-top-0 note-wrap">
            <div class="note-title">Note</div>
            <div class="note-body">{{ $noteValue }}</div>
        </div>

        <div class="border-thick border-top-0 sign-wrap">
            <table class="sign-table">
                <tbody>
                    <tr>
                        <td style="width: 33.33%;">Date</td>
                        <td style="width: 33.33%;">checked</td>
                        <td style="width: 33.33%;">Approved</td>
                    </tr>
                    <tr>
                        <td class="sign-value">{{ $history->ppm_date ?: '-' }}</td>
                        <td class="sign-value">{{ $history->checked_by ?: '-' }}</td>
                        <td class="sign-value">{{ $history->approved_by ?: '-' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>