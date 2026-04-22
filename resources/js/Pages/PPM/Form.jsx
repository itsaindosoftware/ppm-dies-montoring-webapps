import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { getChecklistItems, getProcessTypeLabel } from '@/Utils/PpmChecklistData';
// tinggal yang print pdf


export default function PpmFormIndex({ auth, ppmHistories, filters }) {
    const [showModal, setShowModal] = useState(true);
    const [ppmDate, setPpmDate] = useState(filters?.ppm_date || '');
    const [partNumber, setPartNumber] = useState(filters?.part_number || '');
    const [partName, setPartName] = useState(filters?.part_name || '');
    const [processName, setProcessName] = useState(filters?.process_name || '');
    const [showPrintImageModal, setShowPrintImageModal] = useState(false);
    const [printIllustrationSrc, setPrintIllustrationSrc] = useState('');
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

    const normalizeResult = (value) => {
        const normalized = String(value || '').trim().toLowerCase();
        const isNormal = normalized === 'normal' || normalized === 'ok';
        const isUnusual = !!normalized && !isNormal;

        return { isNormal, isUnusual };
    };

    const printRowsCount = 12;
    const checklistRows = Array.from({ length: printRowsCount }, (_, index) => activeChecklist[index] || null);
    const standardStrokeValue = activeHistory?.die?.ppm_standard ?? activeHistory?.die?.standard_stroke ?? '-';

    const getChecklistTranslation = (processType, itemNo) => {
        if (!processType || !itemNo) {
            return '-';
        }

        const templateItems = getChecklistItems(processType);
        const found = templateItems.find((templateItem) => Number(templateItem.no) === Number(itemNo));

        return found?.description_id || '-';
    };

    const handleCloseModal = () => {
        setShowModal(false);
        router.visit(route('dashboard'));
    };

    const handlePrintPdf = () => {
        setShowPrintImageModal(true);
    };

    const handlePrintImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setPrintIllustrationSrc(String(reader.result || ''));
        };
        reader.readAsDataURL(file);
    };

    const handlePrintNow = () => {
        setShowPrintImageModal(false);
        setTimeout(() => {
            window.print();
        }, 80);
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
                        <style>{`
                            @media print {
                                @page {
                                    size: A4 portrait;
                                    margin: 8mm;
                                }

                                .print-sheet {
                                    width: 100%;
                                    min-height: 100%;
                                    border: 2px solid #111;
                                    color: #111;
                                    background: #fff;
                                    font-family: Arial, Helvetica, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                }

                                .print-border {
                                    border: 1px solid #111;
                                }

                                .print-border-thick {
                                    border: 2px solid #111;
                                }

                                .print-table {
                                    border-collapse: collapse;
                                    width: 100%;
                                }

                                .print-table th,
                                .print-table td {
                                    border: 1px solid #111;
                                    padding: 1px 3px;
                                    vertical-align: top;
                                }

                                .print-compact {
                                    font-size: 9px;
                                    line-height: 1.15;
                                }

                                .print-keep-together {
                                    page-break-inside: avoid;
                                    break-inside: avoid-page;
                                }
                            }
                        `}</style>
                        <div className="w-full max-w-7xl h-[92vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div></div>
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

                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-3 print:hidden">
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

                            <div className="flex-1 overflow-y-auto p-4 print:hidden">
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

                            <div className="hidden print:block p-2 text-[11px] leading-tight">
                                <div className="print-sheet">
                                    <div className="print-border-thick px-3 py-2">
                                        <div className="grid grid-cols-12 items-center gap-2">
                                            <div className="col-span-3">
                                                <img
                                                    src="/storage/logo-itsa2.png"
                                                    alt="Indonesia Thai Summit Auto"
                                                    className="h-14 w-auto object-contain"
                                                />
                                            </div>
                                            <div className="col-span-9 text-center">
                                                <h1 className="text-[18px] font-bold tracking-wide">INSPECTION CHECK PPM DIES</h1>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="print-border-thick border-t-0 px-2 py-2">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>PART NAME</span><span>:</span><span>{activeHistory?.die?.part_name || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>PART No.</span><span>:</span><span>{activeHistory?.die?.part_number || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>MODEL</span><span>:</span><span>{activeHistory?.die?.model || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>TOTAL STOKE</span><span>:</span><span>{activeHistory?.stroke_at_ppm || activeHistory?.die?.accumulation_stroke || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>PM ID</span><span>:</span><span>{activeHistory?.id || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>DIES No.</span><span>:</span><span>{activeHistory?.die?.qty_die || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>CUSTOMER</span><span>:</span><span>{activeHistory?.die?.customer || '-'}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>STANDARD STROKE</span><span>:</span><span>{standardStrokeValue}</span>
                                                </div>
                                                <div className="grid grid-cols-[85px_10px_1fr]">
                                                    <span>TOLERANSI</span><span>:</span><span>1 Lot</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-[85px_10px_1fr]">
                                            <span>PROCESS</span><span>:</span><span className="font-semibold">{getProcessTypeLabel(activeHistory?.process_type) || '-'}</span>
                                        </div>
                                    </div>

                                    <table className="print-table print-compact">
                                        <thead>
                                            <tr>
                                                <th rowSpan={2} className="w-[34px] text-center">No.</th>
                                                <th rowSpan={2} className="text-center">CHECKLIST ITEM</th>
                                                <th colSpan={2} className="w-[140px] text-center">Inspection result</th>
                                                <th rowSpan={2} className="w-[170px] text-center">Remark</th>
                                            </tr>
                                            <tr>
                                                <th className="w-[70px] text-center">Normal</th>
                                                <th className="w-[70px] text-center">Unusual</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {checklistRows.map((item, index) => {
                                                const resultFlags = normalizeResult(item?.result);

                                                return (
                                                    <tr key={`print-row-${index}`}>
                                                        <td className="text-center">{item?.item_no || index + 1}</td>
                                                        <td>
                                                            <div>{item?.description || '-'}</div>
                                                            <div className="text-[8px]">{item ? getChecklistTranslation(activeHistory?.process_type, item.item_no) : '-'}</div>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <span className="inline-flex items-center justify-center w-4 h-4 border border-black text-[10px]">
                                                                {resultFlags.isNormal ? 'v' : ''}
                                                            </span>
                                                        </td>
                                                        <td className="text-center align-middle">
                                                            <span className="inline-flex items-center justify-center w-4 h-4 border border-black text-[10px]">
                                                                {resultFlags.isUnusual ? 'v' : ''}
                                                            </span>
                                                        </td>
                                                        <td>{item?.remark || ''}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>

                                    <div className="print-keep-together">
                                        <div className="print-border-thick border-t-0 px-2 py-2">
                                            <div className="h-[110px] border border-gray-300 flex items-center justify-center overflow-hidden">
                                                {printIllustrationSrc ? (
                                                    <img
                                                        src={printIllustrationSrc}
                                                        alt="PPM Illustration"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-gray-500">No illustration image selected</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="print-border-thick border-t-0 px-2 py-2">
                                            <div className="font-semibold">Note</div>
                                            <div className="min-h-[34px] whitespace-pre-wrap">
                                                {activeHistory?.work_performed || activeHistory?.findings || '-'}
                                            </div>
                                        </div>

                                        <div className="print-border-thick border-t-0 px-2 py-2">
                                            <table className="print-table text-[11px]">
                                                <tbody>
                                                    <tr>
                                                        <td className="w-1/3 text-center">Date</td>
                                                        <td className="w-1/3 text-center">checked</td>
                                                        <td className="w-1/3 text-center">Approved</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="h-10 text-center">{activeHistory?.ppm_date || '-'}</td>
                                                        <td className="h-10 text-center">{activeHistory?.checked_by || '-'}</td>
                                                        <td className="h-10 text-center">{activeHistory?.approved_by || '-'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {ppmHistories?.links?.length > 3 && (
                                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 print:hidden">
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

                            {showPrintImageModal && (
                                <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 print:hidden">
                                    <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700">
                                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Upload / Ganti Gambar Untuk Print PDF</h4>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePrintImageChange}
                                                className="w-full text-sm"
                                            />

                                            <div className="h-44 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700/30">
                                                {printIllustrationSrc ? (
                                                    <img
                                                        src={printIllustrationSrc}
                                                        alt="Preview"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-500">Belum ada gambar dipilih</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPrintImageModal(false)}
                                                className="px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handlePrintNow}
                                                className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Lanjut Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
