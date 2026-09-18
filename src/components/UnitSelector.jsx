import { Filter, BookOpen, Layers, Star, FolderTree, ChevronDown, Target } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { useVisibility, isSpecialTopicGroup } from "../context/VisibilityContext"

const UnitSelector = ({ selectedGroup, onSelectGroup, words = [] }) => {
    const { isTopicVisible, isVocabCategoryVisible, isVocabCategoryHidden, shouldAdminBypass } = useVisibility();

    const showChuyende = isVocabCategoryVisible('chuyende');
    const showDaily = isVocabCategoryVisible('daily');
    const showMaster = isVocabCategoryVisible('master');

    // 1. Khóa học (Units 1-12)
    const basicUnits = useMemo(() => {
        const set = new Set(words.filter(w => typeof w.unit === 'number' && w.unit >= 1 && w.unit <= 12).map(w => w.unit));
        return Array.from(set).sort((a, b) => a - b);
    }, [words]);
    
    // 2. Hàng ngày (Units >= 13)
    const extraTopicsList = useMemo(() => {
        const uniqueUnits = [...new Set(words.map(w => w.unit))].filter(u => typeof u === 'number');
        const list = [
            { id: 13, name: "Động vật" },
            { id: 14, name: "Tính từ" },
            { id: 15, name: "Thời tiết & Kỳ nghỉ" },
            { id: 16, name: "Thiên nhiên & Tính từ" },
            { id: 17, name: "Đồ vật & Tiền tệ" },
            { id: 18, name: "Trang phục & Ngoại hình" },
            { id: 19, name: "Giao thông & Hoạt động" },
            { id: 20, name: "Địa điểm & Tính từ" },
            { id: 21, name: "Nghề nghiệp" }
        ];
        const extraTopicIds = new Set(list.map(t => t.id));
        uniqueUnits.forEach(u => {
            if (u >= 13 && !extraTopicIds.has(u)) {
                list.push({ id: u, name: `Chủ đề ${u - 12}` });
                extraTopicIds.add(u);
            }
        });
        list.sort((a, b) => a.id - b.id);
        return list;
    }, [words]);

    // 3. Phân loại Chuyên đề & Nhóm tổng
    const { specialGroupsMap, masterGroupsMap } = useMemo(() => {
        const specialMap = new Map();
        const masterMap = new Map();

        words.forEach(w => {
            if (w.master_group) {
                const targetMap = isSpecialTopicGroup(w.master_group) ? specialMap : masterMap;
                if (!targetMap.has(w.master_group)) {
                    targetMap.set(w.master_group, new Set());
                }
                if (w.sub_group) {
                    targetMap.get(w.master_group).add(w.sub_group);
                }
            }
        });
        return { specialGroupsMap: specialMap, masterGroupsMap: masterMap };
    }, [words]);

    const preferredSpecialOrder = [
        '600 Từ Vựng TOEIC',
        'Từ Vựng ETS 2026',
        '500 Từ Vựng TOEIC Mất Gốc',
        'Từ Vựng Tiếng Nhật Minna No Nihongo'
    ];

    const specialGroupNames = useMemo(() => {
        const names = Array.from(specialGroupsMap.keys()).filter(name => isTopicVisible(name));
        names.sort((a, b) => {
            const idxA = preferredSpecialOrder.indexOf(a);
            const idxB = preferredSpecialOrder.indexOf(b);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            if (idxA !== -1) return -1;
            if (idxB !== -1) return 1;
            return a.localeCompare(b);
        });
        return names;
    }, [specialGroupsMap, isTopicVisible]);

    const masterGroupNames = useMemo(() => {
        return Array.from(masterGroupsMap.keys()).sort();
    }, [masterGroupsMap]);

    const currentMode = selectedGroup?.type || 'all';
    const activeSpecialName = selectedGroup.specialName || specialGroupNames[0] || '';

    useEffect(() => {
        if (currentMode === 'unit' && basicUnits.length === 0) {
            onSelectGroup({ type: 'all' });
        }
        if (currentMode === 'chuyende' && (!showChuyende || specialGroupNames.length === 0)) {
            onSelectGroup({ type: 'all' });
        }
        if (currentMode === 'daily' && !showDaily) {
            onSelectGroup({ type: 'all' });
        }
        if (currentMode === 'master' && !showMaster) {
            onSelectGroup({ type: 'all' });
        }
    }, [currentMode, basicUnits.length, specialGroupNames.length, showChuyende, showDaily, showMaster, onSelectGroup]);

    return (
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200/90 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100/80 dark:border-indigo-900/30">
                    <Filter size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Lọc từ vựng</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Chọn nhóm để bắt đầu luyện tập</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap flex-1 justify-end">
                {/* Mode tabs switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit border border-slate-200/90 dark:border-slate-700/50 shadow-2xs transition-colors">
                    <button 
                        onClick={() => onSelectGroup({ type: 'all' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                            currentMode === 'all' 
                                ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-2xs border border-slate-200/80 dark:border-slate-600' 
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Star size={13} /> Tất cả
                    </button>

                    {showChuyende && specialGroupNames.length > 0 && (
                        <button 
                            onClick={() => {
                                onSelectGroup({ 
                                    type: 'chuyende', 
                                    specialName: activeSpecialName || specialGroupNames[0], 
                                    subName: '' 
                                });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                                currentMode === 'chuyende' 
                                    ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-400 shadow-2xs border border-purple-200/80 dark:border-purple-600' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Target size={13} /> Chuyên đề
                            {shouldAdminBypass && isVocabCategoryHidden('chuyende') && (
                                <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Đã ẩn</span>
                            )}
                        </button>
                    )}

                    {basicUnits.length > 0 && (
                        <button 
                            onClick={() => onSelectGroup({ type: 'unit', id: basicUnits[0] || 1 })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                                currentMode === 'unit' 
                                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-2xs border border-blue-200/80 dark:border-blue-600' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <BookOpen size={13} /> Khóa học
                        </button>
                    )}

                    {showDaily && (
                        <button 
                            onClick={() => onSelectGroup({ type: 'daily', id: extraTopicsList[0]?.id || 13 })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                                currentMode === 'daily' 
                                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-400 shadow-2xs border border-indigo-200/80 dark:border-indigo-600' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Layers size={13} /> Hàng ngày
                            {shouldAdminBypass && isVocabCategoryHidden('daily') && (
                                <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Đã ẩn</span>
                            )}
                        </button>
                    )}

                    {showMaster && (
                        <button 
                            onClick={() => {
                                if (masterGroupNames.length > 0) {
                                    onSelectGroup({ type: 'master', masterName: masterGroupNames[0], subName: '' });
                                } else {
                                    onSelectGroup({ type: 'master', masterName: '', subName: '' });
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                                currentMode === 'master' 
                                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-2xs border border-emerald-200/80 dark:border-emerald-600' 
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <FolderTree size={13} /> Nhóm tổng
                            {shouldAdminBypass && isVocabCategoryHidden('master') && (
                                <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">Đã ẩn</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Sub selectors */}
                {currentMode === 'chuyende' && (
                    <div className="flex gap-2 animate-fade-in flex-wrap items-center">
                        {specialGroupNames.length === 0 ? (
                            <div className="py-1 px-3 text-slate-500 dark:text-slate-400 text-xs italic">
                                Chưa có chuyên đề nào.
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-3 pr-8 py-1.5 bg-purple-50/80 dark:bg-purple-900/10 border border-purple-200/90 dark:border-purple-800/40 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 text-purple-900 dark:text-purple-300 text-xs font-bold cursor-pointer min-w-[170px] shadow-2xs hover:border-purple-300 transition-all"
                                        value={activeSpecialName}
                                        onChange={(e) => onSelectGroup({ type: 'chuyende', specialName: e.target.value, subName: '' })}
                                    >
                                        {specialGroupNames.map(name => (
                                            <option key={name} value={name} className="bg-white dark:bg-slate-800 font-medium">
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none" />
                                </div>

                                {activeSpecialName && specialGroupsMap.get(activeSpecialName)?.size > 0 && (
                                    <div className="relative">
                                        <select
                                            className="appearance-none pl-3 pr-8 py-1.5 bg-violet-50/80 dark:bg-violet-900/10 border border-violet-200/90 dark:border-violet-800/40 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/30 text-violet-900 dark:text-violet-300 text-xs font-bold cursor-pointer min-w-[180px] max-w-[280px] truncate shadow-2xs hover:border-violet-300 transition-all"
                                            value={selectedGroup.subName || ''}
                                            onChange={(e) => onSelectGroup({ type: 'chuyende', specialName: activeSpecialName, subName: e.target.value })}
                                        >
                                            <option value="" className="bg-white dark:bg-slate-800 font-medium">
                                                Tất cả bài ({specialGroupsMap.get(activeSpecialName)?.size} bài)
                                            </option>
                                            {Array.from(specialGroupsMap.get(activeSpecialName)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(sub => (
                                                <option key={sub} value={sub} className="bg-white dark:bg-slate-800 font-medium">
                                                    {sub}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-violet-600 pointer-events-none" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {currentMode === 'unit' && basicUnits.length > 0 && (
                    <div className="relative animate-fade-in">
                        <select
                            className="appearance-none pl-3 pr-8 py-1.5 bg-blue-50/80 dark:bg-blue-900/10 border border-blue-200/90 dark:border-blue-800/40 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 text-blue-900 dark:text-blue-400 text-xs font-bold cursor-pointer min-w-[150px] shadow-2xs hover:border-blue-300 transition-all"
                            value={selectedGroup.id || basicUnits[0]}
                            onChange={(e) => onSelectGroup({ type: 'unit', id: parseInt(e.target.value, 10) })}
                        >
                            {basicUnits.map(unit => (
                                <option key={unit} value={unit} className="bg-white dark:bg-slate-800 font-medium">
                                    Unit {unit}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                )}

                {currentMode === 'daily' && (
                    <div className="relative animate-fade-in">
                        <select
                            className="appearance-none pl-3 pr-8 py-1.5 bg-indigo-50/80 dark:bg-indigo-900/10 border border-indigo-200/90 dark:border-indigo-800/40 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-indigo-900 dark:text-indigo-400 text-xs font-bold cursor-pointer min-w-[180px] shadow-2xs hover:border-indigo-300 transition-all"
                            value={selectedGroup.id || 13}
                            onChange={(e) => onSelectGroup({ type: 'daily', id: parseInt(e.target.value, 10) })}
                        >
                            {extraTopicsList.map(topic => (
                                <option key={topic.id} value={topic.id} className="bg-white dark:bg-slate-800 font-medium">
                                    Chủ đề {topic.id - 12}: {topic.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
                    </div>
                )}

                {currentMode === 'master' && (
                    <div className="flex gap-2 animate-fade-in flex-wrap items-center">
                        {masterGroupNames.length === 0 ? (
                            <div className="py-1 px-3 text-slate-500 dark:text-slate-400 text-xs italic">
                                Chưa có nhóm tổng nào.
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-3 pr-8 py-1.5 bg-emerald-50/80 dark:bg-emerald-900/10 border border-emerald-200/90 dark:border-emerald-800/40 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-900 dark:text-emerald-400 text-xs font-bold cursor-pointer min-w-[160px] shadow-2xs hover:border-emerald-300 transition-all"
                                        value={selectedGroup.masterName || ''}
                                        onChange={(e) => onSelectGroup({ type: 'master', masterName: e.target.value, subName: '' })}
                                    >
                                        <option value="" disabled className="bg-white dark:bg-slate-800">-- Chọn Nhóm --</option>
                                        {masterGroupNames.map(name => (
                                            <option key={name} value={name} className="bg-white dark:bg-slate-800 font-medium">
                                                {name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                                </div>

                                {selectedGroup.masterName && masterGroupsMap.get(selectedGroup.masterName)?.size > 0 && (
                                    <div className="relative">
                                        <select
                                            className="appearance-none pl-3 pr-8 py-1.5 bg-teal-50/80 dark:bg-teal-900/10 border border-teal-200/90 dark:border-teal-800/40 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/30 text-teal-900 dark:text-teal-400 text-xs font-bold cursor-pointer min-w-[160px] shadow-2xs hover:border-teal-300 transition-all"
                                            value={selectedGroup.subName || ''}
                                            onChange={(e) => onSelectGroup({ type: 'master', masterName: selectedGroup.masterName, subName: e.target.value })}
                                        >
                                            <option value="" className="bg-white dark:bg-slate-800 font-medium">Tất cả nhóm con</option>
                                            {Array.from(masterGroupsMap.get(selectedGroup.masterName)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).map(sub => (
                                                <option key={sub} value={sub} className="bg-white dark:bg-slate-800 font-medium">
                                                    {sub}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
export default UnitSelector

