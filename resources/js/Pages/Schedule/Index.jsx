import React, { useState, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';

export default function ScheduleIndex({ auth, year, scheduleData, customers, tonnages, filters }) {
    const [selectedYear, setSelectedYear] = useState(year);
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [customerId, setCustomerId] = useState(filters?.customer_id || '');
    const [tonnageId, setTonnageId] = useState(filters?.tonnage_id || '');
    const [editingCell, setEditingCell] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all' | 'needs_schedule' | 'already_scheduled' | 'status_scheduled' | 'lot4_check'
    const tableRef = useRef(null);

    const isMtnDies = ['admin', 'mtn_dies'].includes(auth.user.role);
    const canEditSchedule = ['admin', 'mtn_dies'].includes(auth.user.role);
    const canUseScheduleStatusFilters = ['admin', 'mtn_dies', 'ppic', 'production'].includes(auth.user.role);

    const getLatestScheduleStatus = (die) => {
        const monthlyEntries = Object.entries(die.monthly_data || {})
            .sort(([monthA], [monthB]) => Number(monthA) - Number(monthB));

        let latestStatus = null;

        monthlyEntries.forEach(([, monthData]) => {
            (monthData?.status || []).forEach((status) => {
                if (status) {
                    latestStatus = status;
                }
            });
        });

        return latestStatus;
    };

    const hasOnlyScheduledInStatus = (die) => {
        return getLatestScheduleStatus(die) === 'Scheduled In';
    };

    const hasDoneStatus = (die) => {
        return Object.values(die.monthly_data || {}).some((monthData) =>
            (monthData?.status || []).some((status) => status === 'Done')
        );
    };

    const isDoneTabActive = scheduleFilter === 'status_scheduled';
    const is4LotCheckTabActive = scheduleFilter === 'lot4_check';

    const formatYmdToDm = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
    };

    const getPpmSequenceByCell = (die) => {
        const sequenceMap = {};
        let sequence = 0;

        for (let monthIdx = 0; monthIdx < months.length; monthIdx++) {
            for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
                const status = die.monthly_data?.[monthIdx + 1]?.status?.[weekIdx];

                if (status === 'Done') {
                    sequence += 1;
                    sequenceMap[`${monthIdx}-${weekIdx}`] = sequence;
                }
            }
        }

        return sequenceMap;
    };

    const shouldShowDoneCell = (die, monthIdx, weekIdx) => {
        if (!isDoneTabActive) {
            return true;
        }

        const status = die.monthly_data?.[monthIdx + 1]?.status?.[weekIdx];
        return status === 'Done';
    };


    //     const hasOnlyDoneStatus = (die) => {
//     // Cek semua status di monthly_data, jika ada yang bukan 'Done', return false
//     return Object.values(die.monthly_data || {}).every(month =>
//         (month.status || []).every(status => !status || status === 'Done')
//     );
// };
    

    // Count dies that need scheduling
    const needsScheduleCount = scheduleData?.reduce((sum, g) =>
        sum + (g.dies?.filter(d => d.needs_scheduling).length || 0), 0
    ) || 0;

    // Count dies already scheduled
    const alreadyScheduledCount = scheduleData?.reduce((sum, g) =>
        sum + (g.dies?.filter(d => hasOnlyScheduledInStatus(d)).length || 0), 0
    ) || 0;

    const statusScheduledCount = scheduleData?.reduce((sum, g) =>
        sum + (g.dies?.filter(d => hasDoneStatus(d)).length || 0), 0
    ) || 0;

    const lot4CheckCount = scheduleData?.reduce((sum, g) =>
        sum + (g.dies?.filter(d => Number(d.is_4lot_check) === 1).length || 0), 0
    ) || 0;

    const hasVisibleScheduleFilters = alreadyScheduledCount > 0 || statusScheduledCount > 0 || lot4CheckCount > 0 || (isMtnDies && needsScheduleCount > 0);
    const summaryGridCols = isMtnDies ? 'grid-cols-8' : canUseScheduleStatusFilters ? 'grid-cols-7' : 'grid-cols-4';

    // Filter schedule data based on active filter
    const filteredScheduleData = scheduleFilter === 'all'
        ? scheduleData
        : scheduleData?.map(group => ({
            ...group,
            dies: group.dies?.filter(d =>
                scheduleFilter === 'needs_schedule' ? d.needs_scheduling
                : scheduleFilter === 'already_scheduled' ? hasOnlyScheduledInStatus(d)
                : scheduleFilter === 'status_scheduled' ? hasDoneStatus(d)
                : scheduleFilter === 'lot4_check' ? Number(d.is_4lot_check) === 1
                : true
            ) || [],
        })).filter(group => group.dies.length > 0);

    const { data, setData, post, processing, reset } = useForm({
        die_id: '',
        year: year,
        month: '',
        week: '',
        field: '',
        value: '',
    });

    const months = [
        { name: 'Jan', short: 'Jan' },
        { name: 'Feb', short: 'Feb' },
        { name: 'Mar', short: 'Mar' },
        { name: 'Apr', short: 'Apr' },
        { name: 'May', short: 'May' },
        { name: 'Jun', short: 'Jun' },
        { name: 'Jul', short: 'Jul' },
        { name: 'Aug', short: 'Aug' },
        { name: 'Sep', short: 'Sep' },
        { name: 'Oct', short: 'Oct' },
        { name: 'Nov', short: 'Nov' },
        { name: 'Dec', short: 'Dec' },
    ];

    const weeks = ['I', 'II', 'III', 'IV'];

    const handleFilter = () => {
        router.get(route('schedule.index'), {
            year: selectedYear,
            month: selectedMonth || undefined,
            date: selectedDate || undefined,
            customer_id: customerId || undefined,
            tonnage_id:  tonnageId || undefined,
        }, {
            preserveState:  true,
        });
    };

    const clearFilters = () => {
        const currentYear = new Date().getFullYear();

        setSelectedYear(currentYear);
        setSelectedMonth('');
        setSelectedDate('');
        setCustomerId('');
        setTonnageId('');
        setScheduleFilter('all');

        router.get(route('schedule.index'));
    };

    const handleCellClick = (die, monthIdx, weekIdx, field, currentValue) => {
        setEditingCell({
            die,
            month: monthIdx + 1,
            week: weekIdx + 1,
            field,
            currentValue,
        });
        setData({
            die_id: die.id,
            year: selectedYear,
            month: monthIdx + 1,
            week: weekIdx + 1,
            field: field,
            value: currentValue || '',
        });
        setShowEditModal(true);
    };

    const handleSaveCell = (e) => {
        e.preventDefault();
        post(route('schedule.update-cell'), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingCell(null);
                reset();
            },
            preserveScroll: true,
        });
    };

    const getFieldLabel = (field) => {
        switch (field) {
            case 'forecast': return 'Forecast Stroke';
            case 'plan': return 'Plan Week (1-4)';
            case 'stroke': return 'Accumulation Stroke At PPM';
            case 'ppm_date': return 'PPM Date';
            case 'lot4_check_date': return '4 Lot Check Date';
            case 'pic': return 'PIC (Person In Charge)';
            default: return field;
        }
    };

    const getFieldType = (field) => {
        switch (field) {
            case 'forecast':
            case 'stroke':
            case 'plan':
                return 'number';
            case 'ppm_date':
            case 'lot4_check_date':
                return 'date';
            default:
                return 'text';
        }
    };

    const renderEditableCell = (die, monthIdx, weekIdx, field, value, displayValue) => {
        const isEditable = canEditSchedule && ['forecast', 'plan', 'stroke', 'ppm_date', 'lot4_check_date', 'pic'].includes(field);

        return (
            <td
                key={`${die.id}-${field}-${monthIdx}-${weekIdx}`}
                className={`border px-1 py-1 text-center ${isEditable ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                onClick={() => isEditable && handleCellClick(die, monthIdx, weekIdx, field, value)}
                title={isEditable ? 'Click to edit' : ''}
            >
                {displayValue}
            </td>
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'red':  return 'bg-red-100 text-red-800';
            case 'orange': return 'bg-orange-100 text-orange-800';
            case 'green': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderCell = (value, type = 'text') => {
        if (value === null || value === undefined || value === '') {
            return <span className="text-gray-300">-</span>;
        }

        if (type === 'actual' && value === true) {
            return <span className="text-xl">●</span>;
        }

        if (type === 'plan' && value) {
            return (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-600 text-white text-xs font-bold rounded">
                    {value}
                </span>
            );
        }

        if (type === 'forecast' && value) {
            return <span className="text-xs">{value}</span>;
        }

        if (type === 'stroke' && value) {
            return <span className="text-xs font-medium text-blue-600">{value}</span>;
        }

        if (type === 'schedule_status' && value) {
            const statusClasses = value === 'Done'
                ? 'bg-green-100 text-green-700 border-green-200'
                : 'bg-amber-100 text-amber-700 border-amber-200';

            return (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${statusClasses}`}>
                    {value}
                </span>
            );
        }

        return <span className="text-xs">{value}</span>;
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    📅 PPM Schedule Calendar
                </h2>
            }
        >
            <Head title="PPM Schedule" />

            <div className="py-4 px-4">
                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target. value)}
                                className="rounded-md border-gray-300 text-sm w-24"
                            >
                                {[2023, 2024, 2025, 2026, 2027]. map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-28"
                            >
                                <option value="">All Months</option>
                                {months.map((month, idx) => (
                                    <option key={month.name} value={idx + 1}>{month.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-40"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Customer</label>
                            <select
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-40"
                            >
                                <option value="">All Customers</option>
                                {customers?. map((c) => (
                                    <option key={c.id} value={c.id}>{c. code} - {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Tonnage</label>
                            <select
                                value={tonnageId}
                                onChange={(e) => setTonnageId(e.target.value)}
                                className="rounded-md border-gray-300 text-sm w-40"
                            >
                                <option value="">All Tonnages</option>
                                {tonnages?.map((t) => (
                                    <option key={t.id} value={t.id}>{t.tonnage} (Grade {t.grade})</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                🔍 Apply Filter
                            </button>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Schedule Status Filters */}
                    {canUseScheduleStatusFilters && hasVisibleScheduleFilters && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 mr-1">Filter:</span>
                            <button
                                onClick={() => setScheduleFilter('all')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                    scheduleFilter === 'all'
                                        ? 'bg-gray-700 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                }`}
                            >
                                📋 All
                            </button>
                            {isMtnDies && needsScheduleCount > 0 && (
                                <button
                                    onClick={() => setScheduleFilter(scheduleFilter === 'needs_schedule' ? 'all' : 'needs_schedule')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        scheduleFilter === 'needs_schedule'
                                            ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                                            : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                                    }`}
                                >
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                    </span>
                                    🔔 Needs Scheduling ({needsScheduleCount})
                                </button>
                            )}
                            {alreadyScheduledCount > 0 && (
                                <button
                                    onClick={() => setScheduleFilter(scheduleFilter === 'already_scheduled' ? 'all' : 'already_scheduled')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        scheduleFilter === 'already_scheduled'
                                            ? 'bg-green-600 text-white shadow-md ring-2 ring-green-300'
                                            : 'bg-green-50 text-green-800 border border-green-300 hover:bg-green-100'
                                    }`}
                                >
                                    ✅  Already Scheduled ({alreadyScheduledCount})
                                </button>
                            )}
                            {statusScheduledCount > 0 && (
                                <button
                                    onClick={() => setScheduleFilter(scheduleFilter === 'status_scheduled' ? 'all' : 'status_scheduled')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        scheduleFilter === 'status_scheduled'
                                            ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                                            : 'bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100'
                                    }`}
                                >
                                    📌 Done PPM ({statusScheduledCount})
                                </button>
                            )}
                            {lot4CheckCount > 0 && (
                                <button
                                    onClick={() => setScheduleFilter(scheduleFilter === 'lot4_check' ? 'all' : 'lot4_check')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                        scheduleFilter === 'lot4_check'
                                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                                            : 'bg-indigo-50 text-indigo-800 border border-indigo-300 hover:bg-indigo-100'
                                    }`}
                                >
                                    <i className="fas fa-layer-group"></i>
                                    <span>4 Lot Check ({lot4CheckCount})</span>
                                </button>
                            )}
                            {scheduleFilter !== 'all' && (
                                <span className="text-xs text-gray-500 ml-2">
                                    {scheduleFilter === 'needs_schedule'
                                        ? 'Showing dies that have a LOT date but have not been scheduled for PPM yet'
                                        : scheduleFilter === 'already_scheduled'
                                            ? 'Showing dies that currently have PPM status Scheduled In'
                                            : scheduleFilter === 'lot4_check'
                                                ? 'Showing only dies marked as 4 Lot Check'
                                                : 'Showing only Done PPM cells (Scheduled In is hidden)'
                                    }
                                </span>
                            )}
                        </div>
                    )}

                    {/* Edit hint */}
                    {canEditSchedule && (
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">💡 Tip:</span>
                            <span>Click on Stroke, PPM Date, 4 Lot Check Date, or PIC cells to edit them</span>
                        </div>
                    )}
                </div>

                {/* Schedule Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                    {/* Title Header */}
                    <div className="bg-green-700 text-white text-center py-3">
                        <h3 className="text-lg font-bold">SCHEDULE</h3>
                        <h4 className="text-md">PREVENTIVE MAINTENANCE DIES</h4>
                        <p className="text-green-200 text-sm mt-1">Year:  {selectedYear}</p>
                    </div>

                    {/* Scrollable Table Container */}
                    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]" ref={tableRef}>
                        <table className="min-w-full border-collapse text-xs">
                            {/* Header Row 1 - Month Names */}
                            <thead className="sticky top-0 z-30">
                                <tr className="bg-green-600 text-white">
                                    <th className="border border-green-500 px-2 py-2 text-center sticky left-0 bg-green-600 z-40 min-w-[40px]" rowSpan={2}>NO</th>
                                    <th className="border border-green-500 px-2 py-2 text-left sticky left-[40px] bg-green-600 z-40 min-w-[180px]" rowSpan={2}>NAME/PART<br/>NUMBER DIE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[50px]" rowSpan={2}>MODEL</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[45px]" rowSpan={2}>TOTAL<br/>DIE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[100px]" rowSpan={2}>ACCUMULATION</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[140px]" rowSpan={2}>PPM<br/>CONDITION</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[70px]" rowSpan={2}>LAST<br/>STROKE</th>
                                    <th className="border border-green-500 px-2 py-2 text-center min-w-[60px]" rowSpan={2}>PLAN</th>
                                    {months.map((month, idx) => (
                                        <th key={month.name} className="border border-green-500 px-1 py-2 text-center min-w-[120px]" colSpan={4}>
                                            {month. name}
                                        </th>
                                    ))}
                                </tr>
                                {/* Header Row 2 - Week Numbers */}
                                <tr className="bg-green-500 text-white">
                                    {months.map((month) => (
                                        weeks.map((week, idx) => (
                                            <th key={`${month.name}-${week}`} className="border border-green-400 px-1 py-1 text-center min-w-[30px]">
                                                {week}
                                            </th>
                                        ))
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredScheduleData?. length > 0 ? (
                                    filteredScheduleData.map((group, groupIndex) => (
                                        <React.Fragment key={`group-${groupIndex}`}>
                                            {/* Group Header */}
                                            <tr className="bg-green-100">
                                                <td colSpan={8 + 48} className="border px-3 py-2 font-semibold text-green-800 sticky left-0 bg-green-100 z-10">
                                                    {group.customer} ({group.tonnage})
                                                </td>
                                            </tr>

                                            {/* Dies in Group */}
                                            {group.dies?. map((die, dieIndex) => (
                                                <React.Fragment key={`die-${die.id}`}>
                                                    {(() => {
                                                        const rowSpan = is4LotCheckTabActive ? 6 : 4;
                                                        const ppmSequenceByCell = getPpmSequenceByCell(die);

                                                        return (
                                                        <>
                                                    {/* Row 1: Part Number + PPM Date */}
                                                    <tr key={`${die.id}-1`} className={`border-t-2 border-gray-300 hover:bg-gray-50 ${die.needs_scheduling ? 'bg-amber-50/60' : ''}`}>
                                                        <td className={`border px-2 py-1 text-center font-medium sticky left-0 z-10 ${die.needs_scheduling ? 'bg-amber-50 border-l-4 border-l-amber-400' : 'bg-gray-50'}`} rowSpan={rowSpan}>
                                                            {groupIndex * 100 + dieIndex + 1}
                                                        </td>
                                                        <td className={`border px-2 py-1 sticky left-[40px] z-10 ${die.needs_scheduling ? 'bg-amber-50' : 'bg-white'}`}>
                                                            <div className="flex items-center gap-1">
                                                                <a href={route('dies.show', die.encrypted_id)} className="text-blue-600 hover:underline font-medium">
                                                                    {die.part_number}
                                                                </a>
                                                                {die.needs_scheduling && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-white animate-pulse" title={`LOT Date: ${die.last_lot_date} (by ${die.last_lot_date_set_by})`}>
                                                                        📅 SCHEDULE
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={rowSpan}>
                                                            {die.model}
                                                        </td>
                                                        <td className="border px-2 py-1 text-center bg-gray-50" rowSpan={rowSpan}>
                                                            {die.total_die}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            ACCUMULATION STROKE
                                                        </td>
                                                        {/* PPM Condition Column */}
                                                        <td className="border px-1 py-1 bg-gray-50" rowSpan={rowSpan}>
                                                            <div className="space-y-1">
                                                                {/* Condition 1 */}
                                                                <div className={`flex items-center gap-1 text-[10px] ${
                                                                    die.ppm_conditions_info?.condition_1?.is_active
                                                                        ? 'text-blue-700 font-semibold'
                                                                        : 'text-gray-400'
                                                                }`}>
                                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                                                        die.ppm_conditions_info?.condition_1?.is_active
                                                                            ? 'bg-blue-500 text-white'
                                                                            : 'bg-gray-200 text-gray-500'
                                                                    }`}>1</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <span>Std</span>
                                                                            <span>{die.ppm_conditions_info?.condition_1?.target?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                                                            <div
                                                                                className={`h-1 rounded-full ${
                                                                                    die.ppm_conditions_info?.condition_1?.percentage >= 100 ? 'bg-red-500' :
                                                                                    die.ppm_conditions_info?.condition_1?.percentage >= 75 ? 'bg-orange-500' : 'bg-blue-500'
                                                                                }`}
                                                                                style={{ width: `${Math.min(die.ppm_conditions_info?.condition_1?.percentage || 0, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Condition 2 */}
                                                                <div className={`flex items-center gap-1 text-[10px] ${
                                                                    die.ppm_conditions_info?.condition_2?.is_active
                                                                        ? 'text-purple-700 font-semibold'
                                                                        : 'text-gray-400'
                                                                }`}>
                                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                                                        die.ppm_conditions_info?.condition_2?.is_active
                                                                            ? 'bg-purple-500 text-white'
                                                                            : 'bg-gray-200 text-gray-500'
                                                                    }`}>2</span>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between">
                                                                            <span>PPM#{(die.ppm_count || 0) + 1}</span>
                                                                            <span>{die.ppm_conditions_info?.condition_2?.target?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1">
                                                                            <div
                                                                                className={`h-1 rounded-full ${
                                                                                    die.ppm_conditions_info?.condition_2?.percentage >= 100 ? 'bg-red-500' :
                                                                                    die.ppm_conditions_info?.condition_2?.percentage >= 75 ? 'bg-orange-500' : 'bg-purple-500'
                                                                                }`}
                                                                                style={{ width: `${Math.min(die.ppm_conditions_info?.condition_2?.percentage || 0, 100)}%` }}
                                                                            ></div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Both conditions indicator */}
                                                                {die.ppm_trigger_condition?.type === 'both' && (
                                                                    <div className="text-[8px] text-center text-orange-600 font-medium">
                                                                        ⚡ Final
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border px-2 py-1 text-center">
                                                            {/* <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(die.ppm_status)}`}>
                                                                {die.accumulation_stroke?. toLocaleString()}
                                                            </span> */}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            PPM Date
                                                        </td>
                                                        {/* PPM Date cells - Editable */}
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => {
                                                                if (!shouldShowDoneCell(die, monthIdx, weekIdx)) {
                                                                    return (
                                                                        <td
                                                                            key={`${die.id}-ppm-date-hidden-${monthIdx}-${weekIdx}`}
                                                                            className="border px-1 py-1 text-center bg-gray-50"
                                                                        >
                                                                            {renderCell(null)}
                                                                        </td>
                                                                    );
                                                                }

                                                                const value = die.monthly_data?.[monthIdx + 1]?.ppm_date?.[weekIdx];
                                                                return renderEditableCell(
                                                                    die, monthIdx, weekIdx, 'ppm_date', value,
                                                                    renderCell(value)
                                                                );
                                                            })
                                                        ))}
                                                    </tr>

                                                    {/* Row 2: Part Name + Accumulation Stroke At PPM */}
                                                    <tr key={`${die.id}-2`} className={`hover:bg-gray-50 ${die.needs_scheduling ? 'bg-amber-50/40' : ''}`}>
                                                        <td className={`border px-2 py-1 text-gray-600 text-xs sticky left-[40px] z-10 max-w-[180px] ${die.needs_scheduling ? 'bg-amber-50' : 'bg-white'}`} title={die.part_name}>
                                                            <div className="truncate">{die.part_name}</div>
                                                            {die.last_lot_date && (
                                                                <div className="text-[10px] text-purple-600 mt-0.5 flex items-center gap-1" title={`Set by ${die.last_lot_date_set_by}`}>
                                                                    📅 LOT: {die.last_lot_date}
                                                                </div>
                                                            )}
                                                            {die.ppm_scheduled_date && (
                                                                <div className="text-[10px] text-green-600 mt-0.5 flex items-center gap-1" title={`Scheduled by ${die.ppm_scheduled_by}`}>
                                                                    ✅ Scheduled: {die.ppm_scheduled_date}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            ACCUMULATION ALL STROKE
                                                        </td>
                                                        <td className="border px-2 py-1 text-center text-xs">
                                                            {die.total_stroke_at_ppm? die.total_stroke_at_ppm.toLocaleString() : '-'}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Accumulation<br/>Stroke At PPM
                                                        </td>
                                                        {/* Accumulation Stroke At PPM cells - Editable */}
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => {
                                                                if (!shouldShowDoneCell(die, monthIdx, weekIdx)) {
                                                                    return (
                                                                        <td
                                                                            key={`${die.id}-stroke-hidden-${monthIdx}-${weekIdx}`}
                                                                            className="border px-1 py-1 text-center bg-gray-50"
                                                                        >
                                                                            {renderCell(null)}
                                                                        </td>
                                                                    );
                                                                }

                                                                const value = die.monthly_data?.[monthIdx + 1]?.stroke?.[weekIdx];
                                                                return renderEditableCell(
                                                                    die, monthIdx, weekIdx, 'stroke', value,
                                                                    renderCell(value, 'stroke')
                                                                );
                                                            })
                                                        ))}
                                                    </tr>

                                                    {/* Row 3: Status */}
                                                    <tr key={`${die.id}-3`} className="hover:bg-gray-50">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            STATUS
                                                        </td>
                                                        <td className="border px-2 py-1 text-center text-xs font-medium">
                                                            -
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Status
                                                        </td>
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => {
                                                                if (!shouldShowDoneCell(die, monthIdx, weekIdx)) {
                                                                    return (
                                                                        <td
                                                                            key={`${die.id}-status-hidden-${monthIdx}-${weekIdx}`}
                                                                            className="border px-1 py-1 text-center bg-gray-50"
                                                                        >
                                                                            {renderCell(null)}
                                                                        </td>
                                                                    );
                                                                }

                                                                const value = die.monthly_data?.[monthIdx + 1]?.status?.[weekIdx];

                                                                return (
                                                                    <td
                                                                        key={`${die.id}-status-${monthIdx}-${weekIdx}`}
                                                                        className="border px-1 py-1 text-center"
                                                                    >
                                                                        {renderCell(value, 'schedule_status')}
                                                                    </td>
                                                                );
                                                            })
                                                        ))}
                                                    </tr>

                                                    {is4LotCheckTabActive && (
                                                        <tr key={`${die.id}-5`} className="hover:bg-indigo-50/40">
                                                            <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                            <td className="border px-2 py-1 text-xs text-indigo-700 font-semibold">
                                                                4 LOT CHECK
                                                            </td>
                                                            <td className="border px-2 py-1 text-center text-xs font-medium text-indigo-700">
                                                                {die.done_history_dates?.length
                                                                    ? die.done_history_dates.map(formatYmdToDm).join(', ')
                                                                    : '-'}
                                                            </td>
                                                            <td className="border px-2 py-1 text-xs bg-indigo-50 font-medium">
                                                                4 Lot Check Date
                                                            </td>
                                                            {months.map((_, monthIdx) => (
                                                                weeks.map((_, weekIdx) => {
                                                                    const value = die.monthly_data?.[monthIdx + 1]?.lot4_check_date?.[weekIdx];

                                                                    return renderEditableCell(
                                                                        die,
                                                                        monthIdx,
                                                                        weekIdx,
                                                                        'lot4_check_date',
                                                                        value,
                                                                        renderCell(value)
                                                                    );
                                                                })
                                                            ))}
                                                        </tr>
                                                    )}

                                                    {is4LotCheckTabActive && (
                                                        <tr key={`${die.id}-6`} className="hover:bg-indigo-50/40">
                                                            <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                            <td className="border px-2 py-1 text-xs text-indigo-700 font-semibold">
                                                                PPM KE-
                                                            </td>
                                                            <td className="border px-2 py-1 text-center text-xs font-bold text-indigo-700">
                                                                {die.ppm_count || 0}
                                                            </td>
                                                            <td className="border px-2 py-1 text-xs bg-indigo-50 font-medium">
                                                                PPM Ke-
                                                            </td>
                                                            {months.map((_, monthIdx) => (
                                                                weeks.map((_, weekIdx) => {
                                                                    const sequence = ppmSequenceByCell[`${monthIdx}-${weekIdx}`];

                                                                    return (
                                                                        <td
                                                                            key={`${die.id}-ppm-seq-${monthIdx}-${weekIdx}`}
                                                                            className="border px-1 py-1 text-center"
                                                                        >
                                                                            {renderCell(sequence)}
                                                                        </td>
                                                                    );
                                                                })
                                                            ))}
                                                        </tr>
                                                    )}

                                                    {/* Row 4: PIC */}
                                                    <tr key={`${die.id}-4`} className="hover:bg-gray-50 border-b-2 border-gray-200">
                                                        <td className="border px-2 py-1 sticky left-[40px] bg-white z-10"></td>
                                                        <td className="border px-2 py-1 text-xs text-gray-600">
                                                            CONTROL STROKE
                                                        </td>
                                                        <td className="border px-2 py-1 text-center text-xs font-medium">
                                                            {die. control_stroke?.toLocaleString()}
                                                        </td>
                                                        <td className="border px-2 py-1 text-xs bg-gray-50 font-medium">
                                                            Pic
                                                        </td>
                                                        {/* PIC cells - Editable */}
                                                        {months.map((_, monthIdx) => (
                                                            weeks.map((_, weekIdx) => {
                                                                if (!shouldShowDoneCell(die, monthIdx, weekIdx)) {
                                                                    return (
                                                                        <td
                                                                            key={`${die.id}-pic-hidden-${monthIdx}-${weekIdx}`}
                                                                            className="border px-1 py-1 text-center bg-gray-50"
                                                                        >
                                                                            {renderCell(null)}
                                                                        </td>
                                                                    );
                                                                }

                                                                const value = die.monthly_data?.[monthIdx + 1]?.pic?.[weekIdx];
                                                                return renderEditableCell(
                                                                    die, monthIdx, weekIdx, 'pic', value,
                                                                    renderCell(value)
                                                                );
                                                            })
                                                        ))}
                                                    </tr>
                                                    </>
                                                        );
                                                    })()}
                                                </React.Fragment>
                                            ))}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8 + 48} className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📅</span>
                                                <p>No schedule data found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="bg-gray-50 px-4 py-3 border-t flex flex-wrap items-center gap-6 text-sm">
                        <span className="font-medium text-gray-700">Legend:</span>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">5000</span>
                            <span>Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">4500</span>
                            <span>Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">2000</span>
                            <span>OK</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4 border-l pl-4">
                            <span className="bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Cell</span>
                            <span>Click to Edit</span>
                        </div>
                        {isMtnDies && (
                            <div className="flex items-center gap-2 ml-4 border-l pl-4">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-white">📅 SCHEDULE</span>
                                <span>Needs PPM Scheduling</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className={`mt-4 grid gap-4 ${summaryGridCols}`}>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total Part Number</div>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-sm p-4 text-center border border-green-200">
                        <div className="text-2xl font-bold text-green-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'green').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-green-700">OK Status</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg shadow-sm p-4 text-center border border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'orange').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-orange-700">Warning</div>
                    </div>
                    <div className="bg-red-50 rounded-lg shadow-sm p-4 text-center border border-red-200">
                        <div className="text-2xl font-bold text-red-600">
                            {scheduleData?.reduce((sum, g) => sum + (g.dies?.filter(d => d.ppm_status === 'red').length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-red-700">Critical</div>
                    </div>
                    {canUseScheduleStatusFilters && (
                        <>
                            {isMtnDies && (
                                <div
                                    onClick={() => setScheduleFilter(scheduleFilter === 'needs_schedule' ? 'all' : 'needs_schedule')}
                                    className={`rounded-lg shadow-sm p-4 text-center border cursor-pointer transition hover:shadow-md ${
                                        needsScheduleCount > 0 ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                                    } ${scheduleFilter === 'needs_schedule' ? 'ring-2 ring-amber-400' : ''}`}
                                >
                                    <div className={`text-2xl font-bold ${needsScheduleCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {needsScheduleCount}
                                    </div>
                                    <div className="text-sm text-amber-700">🔔 Needs Scheduling</div>
                                </div>
                            )}
                            <div
                                onClick={() => setScheduleFilter(scheduleFilter === 'already_scheduled' ? 'all' : 'already_scheduled')}
                                className={`rounded-lg shadow-sm p-4 text-center border cursor-pointer transition hover:shadow-md ${
                                    alreadyScheduledCount > 0 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                                } ${scheduleFilter === 'already_scheduled' ? 'ring-2 ring-green-400' : ''}`}
                            >
                                <div className={`text-2xl font-bold ${alreadyScheduledCount > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                    {alreadyScheduledCount}
                                </div>
                                <div className="text-sm text-green-700">✅ Already Scheduled</div>
                            </div>
                            <div
                                onClick={() => setScheduleFilter(scheduleFilter === 'status_scheduled' ? 'all' : 'status_scheduled')}
                                className={`rounded-lg shadow-sm p-4 text-center border cursor-pointer transition hover:shadow-md ${
                                    statusScheduledCount > 0 ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                                } ${scheduleFilter === 'status_scheduled' ? 'ring-2 ring-blue-400' : ''}`}
                            >
                                <div className={`text-2xl font-bold ${statusScheduledCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {statusScheduledCount}
                                </div>
                                <div className="text-sm text-blue-700">📌 Done PPM</div>
                            </div>
                            <div
                                onClick={() => setScheduleFilter(scheduleFilter === 'lot4_check' ? 'all' : 'lot4_check')}
                                className={`rounded-lg shadow-sm p-4 text-center border cursor-pointer transition hover:shadow-md ${
                                    lot4CheckCount > 0 ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50 border-gray-200'
                                } ${scheduleFilter === 'lot4_check' ? 'ring-2 ring-indigo-400' : ''}`}
                            >
                                <div className={`text-2xl font-bold ${lot4CheckCount > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {lot4CheckCount}
                                </div>
                                <div className="text-sm text-indigo-700">
                                    <i className="fas fa-layer-group mr-1"></i>4 Lot Check
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {canEditSchedule && showEditModal && editingCell && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    ✏️ Edit Schedule
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingCell(null);
                                        reset();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-500">Die:</span>
                                        <span className="ml-2 font-medium">{editingCell.die.part_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Month/Week:</span>
                                        <span className="ml-2 font-medium">
                                            {months[editingCell.month - 1]?.name} / Week {weeks[editingCell.week - 1]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSaveCell}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {getFieldLabel(editingCell.field)}
                                    </label>
                                    <input
                                        type={getFieldType(editingCell.field)}
                                        value={data.value}
                                        onChange={(e) => setData('value', e.target.value)}
                                        className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder={`Enter ${getFieldLabel(editingCell.field).toLowerCase()}`}
                                        autoFocus
                                    />
                                    {editingCell.field === 'plan' && (
                                        <p className="mt-1 text-xs text-gray-500">Enter week number (1-4) to mark as planned</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('value', '');
                                        }}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingCell(null);
                                            reset();
                                        }}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Saving...' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
