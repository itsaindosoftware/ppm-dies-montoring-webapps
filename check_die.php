<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$dies = \App\Models\DieModel::where('part_number', 'LIKE', '62741-74U00%')->get(['id', 'part_number', 'accumulation_stroke', 'ppm_standard', 'ppm_alert_status']);
foreach ($dies as $d) {
    $d->loadMissing('machineModel.tonnageStandard');
    echo "ID: {$d->id} | PN: {$d->part_number}" . PHP_EOL;
    echo "  Accumulation Stroke: {$d->accumulation_stroke}" . PHP_EOL;
    echo "  Standard Stroke:     {$d->standard_stroke}" . PHP_EOL;
    echo "  PPM Status:          {$d->ppm_status}" . PHP_EOL;
    echo "  Alert Status:        " . ($d->ppm_alert_status ?? '-') . PHP_EOL;
    echo "  Related Dies:" . PHP_EOL;
    foreach ($d->getRelatedDies() as $r) {
        echo "    - ID {$r->id}: {$r->part_number} (accum: {$r->accumulation_stroke}, alert: " . ($r->ppm_alert_status ?? '-') . ")" . PHP_EOL;
    }
    echo PHP_EOL;
}
