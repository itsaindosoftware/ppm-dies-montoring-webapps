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
    const [printImageFile, setPrintImageFile] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [editForm, setEditForm] = useState({
        ppm_date: '',
        pic: '',
        maintenance_type: 'routine',
        process_type: '',
        checklist_results: [],
        work_performed: '',
        parts_replaced: '',
        findings: '',
        recommendations: '',
        checked_by: '',
        approved_by: '',
        illustration_image: null,
    });
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

    const latestHistoryByPartAndProcess = [...sortedHistories]
        .sort((a, b) => {
            const aTime = a?.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b?.created_at ? new Date(b.created_at).getTime() : 0;
            if (aTime === bTime) {
                return (b?.id || 0) - (a?.id || 0);
            }
            return bTime - aTime;
        })
        .reduce((acc, history) => {
            const key = `${history?.die?.part_number || '-'}__${history?.process_type || '-'}`;
            if (!acc.some((item) => `${item?.die?.part_number || '-'}__${item?.process_type || '-'}` === key)) {
                acc.push(history);
            }
            return acc;
        }, []);

    const [activeHistoryId, setActiveHistoryId] = useState(latestHistoryByPartAndProcess[0]?.id || null);

    const processTabs = latestHistoryByPartAndProcess.reduce((acc, history) => {
        const key = `${history?.die?.part_number || '-'}__${history?.process_type || 'unknown'}`;
        if (!acc.find((tab) => tab.key === key)) {
            acc.push({
                key,
                process_type: history.process_type,
                label: `${history?.die?.part_number || '-'} - ${getProcessTypeLabel(history.process_type)}`,
                historyId: history.id,
            });
        }
        return acc;
    }, []);

    useEffect(() => {
        setActiveHistoryId(latestHistoryByPartAndProcess[0]?.id || null);
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

    const activeHistory = latestHistoryByPartAndProcess.find((item) => item.id === activeHistoryId) || latestHistoryByPartAndProcess[0] || null;
    const activeChecklist = activeHistory?.checklist_results || [];

    useEffect(() => {
        if (!activeHistory) {
            return;
        }

        setEditForm({
            ppm_date: activeHistory.ppm_date || '',
            pic: activeHistory.pic || '',
            maintenance_type: activeHistory.maintenance_type || 'routine',
            process_type: activeHistory.process_type || '',
            checklist_results: (activeHistory.checklist_results || []).map((item) => ({ ...item })),
            work_performed: activeHistory.work_performed || '',
            parts_replaced: activeHistory.parts_replaced || '',
            findings: activeHistory.findings || '',
            recommendations: activeHistory.recommendations || '',
            checked_by: activeHistory.checked_by || '',
            approved_by: activeHistory.approved_by || '',
            illustration_image: null,
        });

        if (!printImageFile) {
            setPrintIllustrationSrc(activeHistory.illustration_url || '');
        }
    }, [activeHistoryId, ppmHistories?.data]);

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
        setFormError('');
        setShowPrintImageModal(false);
        setTimeout(() => {
            window.print();
        }, 80);
    };

    const handlePrintImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setPrintImageFile(file);

        const reader = new FileReader();
        reader.onload = () => {
            setPrintIllustrationSrc(String(reader.result || ''));
        };
        reader.readAsDataURL(file);
    };

    const buildUpdatePayload = (history, overrides = {}) => {
        return {
            ppm_date: overrides.ppm_date ?? history?.ppm_date ?? '',
            pic: overrides.pic ?? history?.pic ?? '',
            maintenance_type: overrides.maintenance_type ?? history?.maintenance_type ?? 'routine',
            process_type: overrides.process_type ?? history?.process_type ?? '',
            checklist_results: overrides.checklist_results ?? history?.checklist_results ?? [],
            work_performed: overrides.work_performed ?? history?.work_performed ?? '',
            parts_replaced: overrides.parts_replaced ?? history?.parts_replaced ?? '',
            findings: overrides.findings ?? history?.findings ?? '',
            recommendations: overrides.recommendations ?? history?.recommendations ?? '',
            checked_by: overrides.checked_by ?? history?.checked_by ?? '',
            approved_by: overrides.approved_by ?? history?.approved_by ?? '',
            ...(overrides.illustration_image ? { illustration_image: overrides.illustration_image } : {}),
        };
    };

    const handleEditInputChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleChecklistFieldChange = (index, field, value) => {
        setEditForm((prev) => {
            const nextChecklist = [...(prev.checklist_results || [])];
            const currentItem = nextChecklist[index] || {};

            nextChecklist[index] = {
                ...currentItem,
                [field]: value,
            };

            return {
                ...prev,
                checklist_results: nextChecklist,
            };
        });
    };

    const handleEditImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setEditForm((prev) => ({
            ...prev,
            illustration_image: file,
        }));

        const reader = new FileReader();
        reader.onload = () => {
            setPrintIllustrationSrc(String(reader.result || ''));
            setPrintImageFile(file);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitEdit = (event) => {
        event.preventDefault();

        if (!activeHistory) {
            return;
        }

        setIsSaving(true);
        setFormError('');

        router.post(route('ppm-form.update', activeHistory.id), buildUpdatePayload(activeHistory, editForm), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
            },
            onError: () => {
                setFormError('Gagal menyimpan data. Pastikan field wajib sudah terisi.');
            },
            onFinish: () => {
                setIsSaving(false);
            },
        });
    };

    const handlePrintNow = () => {
        if (!activeHistory) {
            return;
        }

        setFormError('');

        if (printImageFile) {
            setIsSaving(true);
            router.post(
                route('ppm-form.update', activeHistory.id),
                buildUpdatePayload(activeHistory, { illustration_image: printImageFile }),
                {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowPrintImageModal(false);
                        setPrintImageFile(null);
                        setTimeout(() => {
                            window.print();
                        }, 80);
                    },
                    onError: () => {
                        setFormError('Upload gambar gagal disimpan ke database.');
                    },
                    onFinish: () => {
                        setIsSaving(false);
                    },
                }
            );

            return;
        }

        setShowPrintImageModal(false);
        setTimeout(() => {
            window.print();
        }, 80);
    };

    const filledChecklistCount = (editForm.checklist_results || []).filter((item) => item?.result).length;
    const totalChecklistCount = (editForm.checklist_results || []).length;

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

                                html,
                                body {
                                    width: 210mm;
                                    height: 297mm;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    overflow: hidden !important;
                                }

                                body * {
                                    visibility: hidden !important;
                                }

                                .print-only,
                                .print-only * {
                                    visibility: visible !important;
                                }

                                .print-only {
                                    position: fixed;
                                    inset: 0;
                                    background: #fff;
                                    z-index: 9999;
                                    padding: 8mm;
                                    margin: 0;
                                    box-sizing: border-box;
                                    overflow: hidden;
                                    display: flex;
                                    justify-content: center;
                                    align-items: flex-start;
                                }

                                .print-sheet {
                                    width: 194mm;
                                    height: 281mm;
                                    max-width: 194mm;
                                    max-height: 281mm;
                                    border: 2px solid #111;
                                    color: #111;
                                    background: #fff;
                                    font-family: Arial, Helvetica, sans-serif;
                                    display: flex;
                                    flex-direction: column;
                                    overflow: hidden;
                                    page-break-after: avoid;
                                    break-after: avoid-page;
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
                                    padding: 1px 2px;
                                    vertical-align: top;
                                }

                                .print-compact {
                                    font-size: 8px;
                                    line-height: 1.05;
                                }

                                .print-keep-together {
                                    page-break-inside: avoid;
                                    break-inside: avoid-page;
                                }

                                .print-sheet * {
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
                                        const isActive = activeHistory?.id === tab.historyId;
                                        return (
                                            <button
                                                key={tab.key}
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
                                            <div className="flex items-center justify-between gap-3">
                                                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                                                    INSPECTION CHECK - {getProcessTypeLabel(activeHistory.process_type)}
                                                </h4>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFormError('');
                                                        setShowEditModal(true);
                                                    }}
                                                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600"
                                                >
                                                    Edit Data
                                                </button>
                                            </div>
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

                                        {activeHistory.illustration_url && (
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                                <p className="text-xs font-semibold text-gray-500 mb-2">Illustration (tersimpan)</p>
                                                <img
                                                    src={activeHistory.illustration_url}
                                                    alt="PPM Illustration"
                                                    className="max-h-48 w-auto rounded border border-gray-200"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="hidden print:block p-2 text-[11px] leading-tight">
                                <div className="print-only">
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
                                                    <span>TOLERANCE</span><span>:</span><span>1 Lot</span>
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
                                                        <td className="h-16 text-center align-bottom pb-1">{activeHistory?.ppm_date || '-'}</td>
                                                        <td className="h-16 text-center align-bottom pb-1">{activeHistory?.checked_by || '-'}</td>
                                                        <td className="h-16 text-center align-bottom pb-1">{activeHistory?.approved_by || '-'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
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

                                            {formError && (
                                                <p className="text-xs text-red-600">{formError}</p>
                                            )}
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
                                                disabled={isSaving}
                                                className="px-3 py-1.5 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {isSaving ? 'Menyimpan...' : 'Simpan & Print'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showEditModal && activeHistory && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[65]">
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                        INSPECTION CHECK - {getProcessTypeLabel(editForm.process_type || activeHistory.process_type)}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {activeHistory?.die?.part_number || '-'} - {activeHistory?.die?.part_name || '-'}
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Editing PPM-{activeHistory?.id || '-'}
                                                        </span>
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowEditModal(false)}
                                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                                >
                                                    x
                                                </button>
                                            </div>

                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">PART NAME:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{activeHistory?.die?.part_name || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">PM ID:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">PPM-{activeHistory?.id || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">PART No.:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{activeHistory?.die?.part_number || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">DIES No.:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{activeHistory?.die?.qty_die || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">MODEL:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{activeHistory?.die?.model || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">CUSTOMER:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{activeHistory?.die?.customer || '-'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">TOTAL STROKE:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{Number(activeHistory?.stroke_at_ppm || activeHistory?.die?.total_stroke || 0).toLocaleString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">STANDARD:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">{Number(standardStrokeValue || 0).toLocaleString()} STROKE</span>
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmitEdit} className="space-y-4">
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            PPM Date *
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={String(editForm.ppm_date || '').slice(0, 10)}
                                                            onChange={(e) => handleEditInputChange('ppm_date', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            PIC *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editForm.pic}
                                                            onChange={(e) => handleEditInputChange('pic', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            required
                                                            maxLength={100}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Maintenance Type *
                                                        </label>
                                                        <select
                                                            value={editForm.maintenance_type}
                                                            onChange={(e) => handleEditInputChange('maintenance_type', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            required
                                                        >
                                                            <option value="routine">Routine</option>
                                                            <option value="repair">Repair</option>
                                                            <option value="overhaul">Overhaul</option>
                                                            <option value="emergency">Emergency</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            PROCESS *
                                                        </label>
                                                        <select
                                                            value={editForm.process_type}
                                                            onChange={(e) => handleEditInputChange('process_type', e.target.value)}
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:text-gray-300 text-sm font-semibold bg-gray-100 dark:bg-gray-800"
                                                            disabled
                                                        >
                                                            <option value="">-- Select Process --</option>
                                                            <option value="blank_pierce">Blank Pierce</option>
                                                            <option value="draw">Draw</option>
                                                            <option value="embos">Embos</option>
                                                            <option value="trim">Trim</option>
                                                            <option value="form">Form</option>
                                                            <option value="flang">Flang</option>
                                                            <option value="restrike">Restrike</option>
                                                            <option value="pierce">Pierce</option>
                                                            <option value="cam_pierce">Cam Pierce</option>
                                                        </select>
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                            Process type locked - editing: {getProcessTypeLabel(editForm.process_type)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {totalChecklistCount > 0 && (
                                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                                        <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
                                                            <h4 className="font-semibold text-sm">
                                                                CHECK LIST ITEM - {getProcessTypeLabel(editForm.process_type)}
                                                            </h4>
                                                            <span
                                                                className={`text-xs px-2 py-1 rounded font-medium ${
                                                                    filledChecklistCount === totalChecklistCount
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-indigo-500 text-white'
                                                                }`}
                                                            >
                                                                {filledChecklistCount} / {totalChecklistCount} filled
                                                            </span>
                                                        </div>

                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-100 dark:bg-gray-700">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-12">No.</th>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">CHECK LIST ITEM</th>
                                                                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 w-24" colSpan="2">
                                                                        Inspection Result
                                                                    </th>
                                                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 w-40">Remark</th>
                                                                </tr>
                                                                <tr>
                                                                    <th></th>
                                                                    <th></th>
                                                                    <th className="px-2 py-1 text-center text-xs text-gray-500 dark:text-gray-400 w-12">Normal</th>
                                                                    <th className="px-2 py-1 text-center text-xs text-gray-500 dark:text-gray-400 w-12">Unusual</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>

                                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                                {(editForm.checklist_results || []).map((item, index) => (
                                                                    <tr key={`edit-checklist-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}>
                                                                        <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 text-center align-top">
                                                                            {item.item_no || index + 1}
                                                                        </td>
                                                                        <td className="px-3 py-2 align-top">
                                                                            <p className="text-sm text-gray-900 dark:text-gray-100">{item.description || '-'}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                                                {getChecklistTranslation(editForm.process_type, item.item_no)}
                                                                            </p>
                                                                        </td>
                                                                        <td className="px-2 py-2 text-center align-top">
                                                                            <input
                                                                                type="radio"
                                                                                name={`edit_checklist_${index}`}
                                                                                checked={item.result === 'normal'}
                                                                                onChange={() => handleChecklistFieldChange(index, 'result', 'normal')}
                                                                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                                            />
                                                                        </td>
                                                                        <td className="px-2 py-2 text-center align-top">
                                                                            <input
                                                                                type="radio"
                                                                                name={`edit_checklist_${index}`}
                                                                                checked={item.result === 'unusual'}
                                                                                onChange={() => handleChecklistFieldChange(index, 'result', 'unusual')}
                                                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                                                            />
                                                                        </td>
                                                                        <td className="px-2 py-2 align-top">
                                                                            <input
                                                                                type="text"
                                                                                value={item.remark || ''}
                                                                                onChange={(e) => handleChecklistFieldChange(index, 'remark', e.target.value)}
                                                                                placeholder="..."
                                                                                className="w-full rounded border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 text-xs py-1 px-2"
                                                                            />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Additional Notes</h4>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Work Performed
                                                            </label>
                                                            <textarea
                                                                value={editForm.work_performed}
                                                                onChange={(e) => handleEditInputChange('work_performed', e.target.value)}
                                                                rows="2"
                                                                placeholder="Describe the work performed..."
                                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                                Parts Replaced
                                                            </label>
                                                            <textarea
                                                                value={editForm.parts_replaced}
                                                                onChange={(e) => handleEditInputChange('parts_replaced', e.target.value)}
                                                                rows="2"
                                                                placeholder="List parts replaced..."
                                                                className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Note:</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400"># Cleaning Dies Lower & Upper</p>
                                                    <p className="text-xs text-blue-600 dark:text-blue-400"># Check All Bolt Lower & Upper Dies</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Checked By
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editForm.checked_by}
                                                            onChange={(e) => handleEditInputChange('checked_by', e.target.value)}
                                                            placeholder="e.g., Mr. Kammee"
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            maxLength={100}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Approved By
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={editForm.approved_by}
                                                            onChange={(e) => handleEditInputChange('approved_by', e.target.value)}
                                                            placeholder="e.g., Mr. Manop"
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                            maxLength={100}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Findings
                                                        </label>
                                                        <textarea
                                                            value={editForm.findings}
                                                            onChange={(e) => handleEditInputChange('findings', e.target.value)}
                                                            rows="2"
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                            Recommendations
                                                        </label>
                                                        <textarea
                                                            value={editForm.recommendations}
                                                            onChange={(e) => handleEditInputChange('recommendations', e.target.value)}
                                                            rows="2"
                                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Illustration Image
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={handleEditImageChange}
                                                        className="w-full text-sm"
                                                    />
                                                </div>

                                                {formError && (
                                                    <p className="text-xs text-red-600">{formError}</p>
                                                )}

                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        Note: Anda sedang mengedit riwayat PPM. Pastikan checklist terisi sesuai kondisi aktual.
                                                    </p>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEditModal(false)}
                                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isSaving || (totalChecklistCount > 0 && filledChecklistCount !== totalChecklistCount)}
                                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {isSaving ? 'Saving...' : `Complete ${getProcessTypeLabel(editForm.process_type)}`}
                                                    </button>
                                                </div>
                                            </form>
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
