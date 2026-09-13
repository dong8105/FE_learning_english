import { Filter, BookOpen, Layers, Star, FolderTree, ChevronDown } from "lucide-react"
import { useState, useMemo } from "react"

const UnitSelector = ({ selectedGroup, onSelectGroup, words = [] }) => {
    // 1. Khóa học (Units 1-12)
    const basicUnits = Array.from({ length: 12 }, (_, i) => i + 1);
    
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

    // 3. Nhóm tổng (Master Groups)
    // Map: master_group -> Set(sub_group)
    const masterGroupsMap = useMemo(() => {
        const map = new Map();
        words.forEach(w => {
            if (w.master_group) {
                if (!map.has(w.master_group)) {
                    map.set(w.master_group, new Set());
                }
                if (w.sub_group) {
                    map.get(w.master_group).add(w.sub_group);
                }
            }
        });
        return map;
    }, [words]);

    const masterGroupNames = Array.from(masterGroupsMap.keys()).sort();

    const currentMode = selectedGroup?.type || 'all';

    return (
        <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-150 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 rounded-xl">
                    <Filter size={18} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-slate-200">Lọc từ vựng</h3>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Chọn nhóm để bắt đầu luyện tập</p>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap flex-1 justify-end">
                {/* Mode tabs switcher */}
                <div className="flex bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-xl w-fit border border-gray-200/50 dark:border-slate-700/50 transition-colors">
                    <button 
                        onClick={() => onSelectGroup({ type: 'all' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                            currentMode === 'all' 
                                ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm' 
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Star size={13} /> Tất cả
                    </button>
                    <button 
                        onClick={() => onSelectGroup({ type: 'unit', id: 1 })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                            currentMode === 'unit' 
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <BookOpen size={13} /> Khóa học
                    </button>
                    <button 
                        onClick={() => onSelectGroup({ type: 'daily', id: extraTopicsList[0]?.id || 13 })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                            currentMode === 'daily' 
                                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <Layers size={13} /> Hàng ngày
                    </button>
                    <button 
                        onClick={() => {
                            if (masterGroupNames.length > 0) {
                                onSelectGroup({ type: 'master', masterName: masterGroupNames[0] });
                            } else {
                                onSelectGroup({ type: 'master', masterName: '' });
                            }
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                            currentMode === 'master' 
                                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <FolderTree size={13} /> Nhóm tổng
                    </button>
                </div>

                {/* Sub selectors */}
                {currentMode === 'unit' && (
                    <div className="relative animate-fade-in">
                        <select
                            className="appearance-none pl-3 pr-8 py-1.5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/40 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-bold cursor-pointer min-w-[150px] shadow-sm transition-all"
                            value={selectedGroup.id || 1}
                            onChange={(e) => onSelectGroup({ type: 'unit', id: parseInt(e.target.value, 10) })}
                        >
                            {basicUnits.map(unit => (
                                <option key={unit} value={unit} className="bg-white dark:bg-slate-800 font-medium">
                                    Unit {unit}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" />
                    </div>
                )}

                {currentMode === 'daily' && (
                    <div className="relative animate-fade-in">
                        <select
                            className="appearance-none pl-3 pr-8 py-1.5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200/50 dark:border-indigo-800/40 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold cursor-pointer min-w-[180px] shadow-sm transition-all"
                            value={selectedGroup.id || 13}
                            onChange={(e) => onSelectGroup({ type: 'daily', id: parseInt(e.target.value, 10) })}
                        >
                            {extraTopicsList.map(topic => (
                                <option key={topic.id} value={topic.id} className="bg-white dark:bg-slate-800 font-medium">
                                    Chủ đề {topic.id - 12}: {topic.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                    </div>
                )}

                {currentMode === 'master' && (
                    <div className="flex gap-2 animate-fade-in flex-wrap items-center">
                        {masterGroupNames.length === 0 ? (
                            <div className="py-1 px-3 text-gray-400 dark:text-slate-500 text-xs italic">
                                Chưa có nhóm tổng nào.
                            </div>
                        ) : (
                            <>
                                <div className="relative">
                                    <select
                                        className="appearance-none pl-3 pr-8 py-1.5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/40 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold cursor-pointer min-w-[160px] shadow-sm transition-all"
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
                                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                                </div>

                                {selectedGroup.masterName && masterGroupsMap.get(selectedGroup.masterName)?.size > 0 && (
                                    <div className="relative">
                                        <select
                                            className="appearance-none pl-3 pr-8 py-1.5 bg-teal-50/50 dark:bg-teal-900/10 border border-teal-200/50 dark:border-teal-800/40 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/30 text-teal-700 dark:text-teal-400 text-xs font-bold cursor-pointer min-w-[160px] shadow-sm transition-all"
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
                                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-teal-500 pointer-events-none" />
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
