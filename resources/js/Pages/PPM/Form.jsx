import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { getProcessTypeLabel } from '@/Utils/PpmChecklistData';
// tinggal yang print pdf


export default function PpmFormIndex({ auth, ppmHistories, filters }) {
    const [showModal, setShowModal] = useState(true);
    const [ppmDate, setPpmDate] = useState(filters?.ppm_date || '');
    const [partNumber, setPartNumber] = useState(filters?.part_number || '');
    const [partName, setPartName] = useState(filters?.part_name || '');
    const [processName, setProcessName] = useState(filters?.process_name || '');
    const searchTimeout = useRef(null);

    const histories = ppmHistories?.data || [];
    const sortedHistories = [...histories].sort((a, b) => {
        const aTime = a?.created_at ? new Date(a.created_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bTime = b?.created_at ? new Date(b.created_at).getTime() : Number.MAX_SAFE_INTEGER;

        if (aTime === bTime) {
            return (a?.id || 0) - (b?.id || 0);
        }

        return aTime - bTime;
    });

    const [activeHistoryId, setActiveHistoryId] = useState(sortedHistories[0]?.id || null);

    const processTabs = sortedHistories.reduce((acc, history) => {
        const key = history.process_type || 'unknown';
        if (!acc.find((tab) => tab.process_type === key)) {
            acc.push({
                process_type: key,
                label: getProcessTypeLabel(history.process_type),
                historyId: history.id,
            });
        }
        return acc;
    }, []);

    useEffect(() => {
        setActiveHistoryId(sortedHistories[0]?.id || null);
    }, [ppmHistories?.data]);

    const applyFilters = (overrides = {}) => {
        const params = {
            ppm_date: ppmDate || undefined,
            part_number: partNumber || undefined,
            part_name: partName || undefined,
            process_name: processName || undefined,
            ...overrides,
        }; 

        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get(route('ppm-form.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            applyFilters();
        }, 350);

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [partNumber, partName, processName]);

    const handleDateChange = (value) => {
        setPpmDate(value);
        applyFilters({ ppm_date: value || undefined });
    };

    const clearFilters = () => {
        setPpmDate('');
        setPartNumber('');
        setPartName('');
        setProcessName('');
        router.get(route('ppm-form.index'));
    };

    const activeHistory = histories.find((item) => item.id === activeHistoryId) || histories[0] || null;
    const activeChecklist = activeHistory?.checklist_results || [];

    const handleCloseModal = () => {
        setShowModal(false);
        router.visit(route('dashboard'));
    };

    const handlePrintPdf = () => {
        window.print();
    };

    return (
        <AppLayout
            user={auth.user}
            header={<h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">PPM Form</h2>}
        >
            <Head title="PPM Form" />

            <div className="py-6 px-6">
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3">
                        <div className="w-full max-w-7xl h-[92vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">INSPECTION CHECK — PPM FORM (DONE)</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sumber data: tabel ppm_histories dengan status done.</p>
                                </div>
                                <div className="flex items-center gap-2 print:hidden">
                                    <button
                                        type="button"
                                        onClick={handlePrintPdf}
                                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                                    >
                                        Print PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 text-xl leading-none"
                                        aria-label="Close"
                                    >
                                        x
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">PPM Date</label>
                                    <input
                                        type="date"
                                        value={ppmDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Part Number</label>
                                    <input
                                        type="text"
                                        value={partNumber}
                                        onChange={(e) => setPartNumber(e.target.value)}
                                        placeholder="Search part number..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Part Name</label>
                                    <input
                                        type="text"
                                        value={partName}
                                        onChange={(e) => setPartName(e.target.value)}
                                        placeholder="Search part name..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">PPM Process</label>
                                    <input
                                        type="text"
                                        value={processName}
                                        onChange={(e) => setProcessName(e.target.value)}
                                        placeholder="Search process name..."
                                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="w-full px-3 py-2 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 print:hidden">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Data PPM Done</div>
                                {processTabs.length === 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Data tidak ditemukan.</div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {processTabs.map((tab) => {
                                        const isActive = activeHistory?.process_type === tab.process_type;
                                        return (
                                            <button
                                                key={tab.process_type}
                                                type="button"
                                                onClick={() => setActiveHistoryId(tab.historyId)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                {!activeHistory && (
                                    <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                        Pilih tab proses untuk melihat detail form.
                                    </div>
                                )}

                                {activeHistory && (
                                    <div className="space-y-4">
                                        <div className="rounded-xl bg-gray-50 dark:bg-gray-700/30 p-4 border border-gray-200 dark:border-gray-700">
                                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                                INSPECTION CHECK - {getProcessTypeLabel(activeHistory.process_type)}
                                            </h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                                                <div><span className="text-gray-500">Part Name:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.die?.part_name || '-'}</p></div>
                                                <div><span className="text-gray-500">Part No:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.die?.part_number || '-'}</p></div>
                                                <div><span className="text-gray-500">Model:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.die?.model || '-'}</p></div>
                                                <div><span className="text-gray-500">Customer:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.die?.customer || '-'}</p></div>
                                                <div><span className="text-gray-500">PPM Date:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.ppm_date || '-'}</p></div>
                                                <div><span className="text-gray-500">PIC:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.pic || '-'}</p></div>
                                                <div><span className="text-gray-500">Maintenance:</span><p className="font-semibold text-gray-800 dark:text-gray-100">{activeHistory.maintenance_type || '-'}</p></div>
                                                <div><span className="text-gray-500">Status:</span><p className="font-semibold text-green-600">{activeHistory.status || '-'}</p></div>
                                            </div>
                                        </div>

                                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                            <div className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold flex items-center justify-between">
                                                <span>CHECK LIST ITEM - {getProcessTypeLabel(activeHistory.process_type)}</span>
                                                <span className="text-xs bg-green-500 rounded px-2 py-0.5">{activeChecklist.length} items</span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-700/40 text-xs text-gray-600 dark:text-gray-300 uppercase">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left">No</th>
                                                            <th className="px-3 py-2 text-left">Check List Item</th>
                                                            <th className="px-3 py-2 text-left">Inspection Result</th>
                                                            <th className="px-3 py-2 text-left">Remark</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                        {activeChecklist.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-3 py-6 text-center text-gray-500 dark:text-gray-400">Checklist tidak tersedia.</td>
                                                            </tr>
                                                        )}
                                                        {activeChecklist.map((item, index) => (
                                                            <tr key={index}>
                                                                <td className="px-3 py-2">{item.item_no || index + 1}</td>
                                                                <td className="px-3 py-2">{item.description || '-'}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                                                        item.result === 'normal'
                                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                                                    }`}>
                                                                        {item.result || '-'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">{item.remark || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Work Performed</p>
                                                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{activeHistory.work_performed || '-'}</p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Parts Replaced</p>
                                                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{activeHistory.parts_replaced || '-'}</p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Checked By</p>
                                                <p className="text-gray-700 dark:text-gray-200">{activeHistory.checked_by || '-'}</p>
                                            </div>
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Approved By</p>
                                                <p className="text-gray-700 dark:text-gray-200">{activeHistory.approved_by || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {ppmHistories?.links?.length > 3 && (
                                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                                    {ppmHistories.links.map((link, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-2.5 py-1 text-xs rounded border ${
                                                link.active
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
