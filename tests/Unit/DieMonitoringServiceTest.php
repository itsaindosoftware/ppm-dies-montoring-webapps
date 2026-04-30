<?php

namespace Tests\Unit;

use App\Models\Customer;
use App\Models\DieModel;
use App\Models\MachineModel;
use App\Models\ProductionLog;
use App\Models\TonnageStandard;
use App\Services\DieMonitoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DieMonitoringServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_counts_only_qualified_4_lot_check_dies_for_dashboard(): void
    {
        [$customer, $machineModel] = $this->createDieDependencies();

        $groupLead = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/164-T86-K000-50',
            'group_name' => 'GROUP-A',
            'is_4lot_check' => true,
        ]);
        $groupPeer = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/164-T86-X000-50',
            'group_name' => 'GROUP-A',
            'is_4lot_check' => false,
        ]);
        $standaloneQualified = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/154-3M0-3000',
            'group_name' => null,
            'is_4lot_check' => true,
        ]);
        $unqualifiedGroupLead = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/154-3M0-3001',
            'group_name' => 'GROUP-B',
            'is_4lot_check' => true,
        ]);
        $unqualifiedGroupPeer = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/154-3M0-3002',
            'group_name' => 'GROUP-B',
            'is_4lot_check' => false,
        ]);
        $standaloneUnqualified = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '66114/154-3M0-3003',
            'group_name' => null,
            'is_4lot_check' => true,
        ]);

        $this->createProductionLogs($groupLead, 2);
        $this->createProductionLogs($groupPeer, 2);
        $this->createProductionLogs($standaloneQualified, 4);
        $this->createProductionLogs($unqualifiedGroupLead, 2);
        $this->createProductionLogs($unqualifiedGroupPeer, 1);
        $this->createProductionLogs($standaloneUnqualified, 3);

        $service = app(DieMonitoringService::class);

        $this->assertSame(3, $service->getQualified4LotCheckCount());
    }

    public function test_it_counts_non_flagged_member_if_same_group_has_flagged_member(): void
    {
        [$customer, $machineModel] = $this->createDieDependencies();

        $groupLead = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '764B1-B000P',
            'group_name' => '764B1',
            'is_4lot_check' => true,
        ]);
        $groupPeer = $this->createDie($customer->id, $machineModel->id, [
            'part_number' => '764B1-C000P',
            'group_name' => '764B1',
            'is_4lot_check' => false,
        ]);

        // Group milestone reached from combined logs across both members.
        $this->createProductionLogs($groupLead, 2);
        $this->createProductionLogs($groupPeer, 2);

        $service = app(DieMonitoringService::class);

        // Both members in group 764B1 are counted.
        $this->assertSame(2, $service->getQualified4LotCheckCount());
    }

    public function test_it_only_counts_dies_on_4_lot_multiples(): void
    {
        [$customer, $machineModel] = $this->createDieDependencies();

        $groupLeadMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => 'GROUP-C',
            'is_4lot_check' => true,
        ]);
        $groupPeerMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => 'GROUP-C',
            'is_4lot_check' => false,
        ]);
        $groupLeadNonMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => 'GROUP-D',
            'is_4lot_check' => true,
        ]);
        $groupPeerNonMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => 'GROUP-D',
            'is_4lot_check' => false,
        ]);
        $standaloneMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => null,
            'is_4lot_check' => true,
        ]);
        $standaloneNonMilestone = $this->createDie($customer->id, $machineModel->id, [
            'group_name' => null,
            'is_4lot_check' => true,
        ]);

        $this->createProductionLogs($groupLeadMilestone, 4);
        $this->createProductionLogs($groupPeerMilestone, 4);
        $this->createProductionLogs($groupLeadNonMilestone, 3);
        $this->createProductionLogs($groupPeerNonMilestone, 2);
        $this->createProductionLogs($standaloneMilestone, 8);
        $this->createProductionLogs($standaloneNonMilestone, 5);

        $service = app(DieMonitoringService::class);

        // GROUP-C (8 lots) counts 2 dies, standalone 8 lots counts 1 die.
        $this->assertSame(3, $service->getQualified4LotCheckCount());
    }

    private function createDieDependencies(): array
    {
        $tonnage = TonnageStandard::create([
            'tonnage' => '800T',
            'grade' => 'A',
            'type' => 'Progressive',
            'standard_stroke' => 6000,
            'lot_size' => 1500,
        ]);

        $customer = Customer::create([
            'code' => 'HMMI',
            'name' => 'Hyundai',
            'is_active' => true,
        ]);

        $machineModel = MachineModel::create([
            'code' => '2JX',
            'name' => '2JX Press',
            'tonnage_standard_id' => $tonnage->id,
            'is_active' => true,
        ]);

        return [$customer, $machineModel];
    }

    private function createDie(int $customerId, int $machineModelId, array $overrides = []): DieModel
    {
        static $sequence = 1;

        $die = DieModel::create(array_merge([
            'part_number' => sprintf('PART-%03d', $sequence),
            'part_name' => sprintf('Part %03d', $sequence),
            'machine_model_id' => $machineModelId,
            'customer_id' => $customerId,
            'qty_die' => 1,
            'line' => '800T',
            'lot_size' => 1500,
            'ppm_standard' => 6000,
            'status' => 'active',
            'is_4lot_check' => false,
        ], $overrides));

        $sequence++;

        return $die;
    }

    private function createProductionLogs(DieModel $die, int $count): void
    {
        for ($index = 0; $index < $count; $index++) {
            ProductionLog::create([
                'die_id' => $die->id,
                'production_date' => now()->subDays($index)->toDateString(),
                'shift' => 1,
                'line' => $die->line,
                'running_process' => 'Auto',
                'output_qty' => 100,
            ]);
        }
    }
}