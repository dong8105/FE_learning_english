import { FileJson, Plus, Search, Trash2, Volume2, Database, UploadCloud, Save, FolderTree, BookOpen } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import { vocabularyApi } from "../api/vocabularyApi";

const WordManager = ({ words, onAddWord, onDeleteWord, onRefreshData, speak }) => {
    // Thêm từ thủ công
    const [newEG, setNewEG] = useState('');
    const [newVN, setNewVN] = useState('');
    const [newIPA, setNewIPA] = useState('');
    const [newCategory, setNewCategory] = useState('');
    
    // Group classification
    const [groupType, setGroupType] = useState('unit'); // 'unit', 'daily', 'master'
    const [newUnit, setNewUnit] = useState('');
    const [newDailyTopic, setNewDailyTopic] = useState('');
    const [newMasterGroup, setNewMasterGroup] = useState('');
    const [newSubGroup, setNewSubGroup] = useState('');
    
    // Tìm kiếm và hiển thị
    const [searchTerm, setSearchTerm] = useState("");
    const [dataFile, setDataFile] = useState([]);

    const handleAddWord = (e) => {
        e.preventDefault();
        if (newEG && newVN && newCategory) {
            let finalUnit = null;
            let finalMaster = null;
            let finalSub = null;

            if (groupType === 'unit') {
                if (!newUnit) {
                    toast.warning("Vui lòng nhập Unit!");
                    return;
                }
                finalUnit = parseInt(newUnit, 10);
            } else if (groupType === 'daily') {
                if (!newDailyTopic) {
                    toast.warning("Vui lòng nhập số Chủ đề!");
                    return;
                }
                finalUnit = parseInt(newDailyTopic, 10) + 12;
            } else if (groupType === 'master') {
                if (!newMasterGroup) {
                    toast.warning("Vui lòng nhập Tên Nhóm Tổng!");
                    return;
                }
                finalMaster = newMasterGroup;
                finalSub = newSubGroup || null;
            }

            onAddWord({
                en: newEG,
                vi: newVN,
                ipa: newIPA,
                category: newCategory,
                unit: finalUnit,
                master_group: finalMaster,
                sub_group: finalSub
            });

            toast.success(`Đã thêm từ "${newEG}" thành công! 🎉`);

            setNewEG('');
            setNewVN('');
            setNewIPA('');
            // Không xóa các trường phân loại để người dùng nhập liên tục các từ trong cùng nhóm
            // setNewCategory('');
            // setNewUnit('');
            // setNewMasterGroup('');
            // setNewSubGroup('');
        } else {
            toast.warning("Vui lòng nhập đủ các trường bắt buộc!");
        }
    }

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith('.json')) {
            e.target.value = null;
            toast.info("Vui lòng chọn đúng định dạng file .json!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const fileContent = event.target?.result;
                const parsedData = JSON.parse(fileContent);

                if (Array.isArray(parsedData)) {
                    toast.success(`Đã đọc thành công ${parsedData.length} từ vựng!`);
                    setDataFile(parsedData);
                } else {
                    toast.error("File JSON không hợp lệ. Dữ liệu phải là một mảng (array).");
                }
            } catch (error) {
                toast.error("File JSON có lỗi cú pháp (thiếu dấu phẩy, ngoặc...).");
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    }

    const saveData = async () => {
        try {
            const response = await vocabularyApi.addDataFile(dataFile);
            if (onRefreshData) {
                onRefreshData(); 
            }
            toast.success('Đã lưu dữ liệu vào hệ thống thành công! 🎉');
            setDataFile([]);
        } catch (error) {
            toast.error("Đã xảy ra lỗi khi lưu dữ liệu.");
        }
    }

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 30;

    const filteredWords = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return words;
        return words.filter(w =>
            (w.en && w.en.toLowerCase().includes(q)) ||
            (w.vi && w.vi.toLowerCase().includes(q))
        );
    }, [words, searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const totalPages = Math.ceil(filteredWords.length / pageSize) || 1;
    const paginatedWords = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredWords.slice(start, start + pageSize);
    }, [filteredWords, currentPage]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Title */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Database size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-gray-800 dark:text-white">Quản lý Từ vựng</h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Thêm mới, nhập từ file JSON và quản lý danh sách từ vựng</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel: Add Single Word */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
                        <Plus className="text-blue-500" size={20} /> Thêm Từ Thủ Công
                    </h2>

                    <form onSubmit={handleAddWord} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Từ vựng (EN) *</label>
                                <input type="text" className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" placeholder="VD: Hello" value={newEG} onChange={e => setNewEG(e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nghĩa (VN) *</label>
                                <input type="text" className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" placeholder="VD: Xin chào" value={newVN} onChange={e => setNewVN(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phiên âm (IPA)</label>
                                <input type="text" className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" placeholder="VD: /həˈloʊ/" value={newIPA} onChange={e => setNewIPA(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Từ loại *</label>
                                <input type="text" className="w-full p-3 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition dark:text-white" placeholder="VD: Noun, Verb..." value={newCategory} onChange={e => setNewCategory(e.target.value)} required />
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <FolderTree size={16} className="text-emerald-500" /> Phân Loại Nâng Cao
                            </h3>
                            
                            {/* Group Type Selector */}
                            <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit transition-colors mb-4">
                                <button
                                    type="button"
                                    onClick={() => setGroupType('unit')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${groupType === 'unit' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Khóa học
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGroupType('daily')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${groupType === 'daily' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Hàng ngày
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGroupType('master')}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${groupType === 'master' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Nhóm Tổng
                                </button>
                            </div>

                            {/* Conditional Inputs */}
                            {groupType === 'unit' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">Khóa học (Unit) *</label>
                                    <input type="number" className="w-full p-3 border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white" placeholder="Nhập số Unit (VD: 1, 2, 3...)" value={newUnit} onChange={e => setNewUnit(e.target.value)} min="1" max="12" />
                                </div>
                            )}

                            {groupType === 'daily' && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">Chủ đề Hàng ngày *</label>
                                    <input type="number" className="w-full p-3 border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-white" placeholder="Nhập số Chủ đề (VD: 1, 2, 3...)" value={newDailyTopic} onChange={e => setNewDailyTopic(e.target.value)} min="1" />
                                </div>
                            )}

                            {groupType === 'master' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nhóm Tổng (Master) *</label>
                                        <input type="text" className="w-full p-3 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition dark:text-white" placeholder="VD: IELTS Vocabulary" value={newMasterGroup} onChange={e => setNewMasterGroup(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nhóm Con (Sub)</label>
                                        <input type="text" className="w-full p-3 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition dark:text-white" placeholder="VD: Week 1" value={newSubGroup} onChange={e => setNewSubGroup(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="w-full mt-6 bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2">
                            <Plus size={20} /> Thêm Vào Từ Điển
                        </button>
                    </form>
                </div>

                {/* Panel: Import JSON & Data File Preview */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
                        <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-2">
                            <UploadCloud className="text-indigo-500" size={20} /> Nhập Hàng Loạt (JSON)
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Tải lên file định dạng .json chứa mảng danh sách các từ vựng.</p>
                        
                        <div className="flex items-center gap-4">
                            <label className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50 px-6 py-4 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition font-bold inline-flex items-center gap-2 w-full justify-center">
                                <FileJson size={20} /> Chọn File JSON
                                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {dataFile.length > 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border-2 border-green-500 shadow-sm transition-colors flex-1 flex flex-col max-h-[500px]">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">File đang chờ xử lý</h2>
                                    <p className="text-sm font-bold text-green-500">{dataFile.length} từ hợp lệ</p>
                                </div>
                                <button
                                    onClick={saveData}
                                    className="bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 px-6 font-bold transition shadow-md shadow-green-500/20 flex items-center gap-2"
                                >
                                    <Save size={18} /> Lưu Data
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {dataFile.map((word, index) => (
                                        <div key={index} className="flex flex-col bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-100 dark:border-slate-700">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold text-gray-800 dark:text-white">{word.en}</span>
                                                <span className="text-sm font-medium text-gray-600 dark:text-slate-300">{word.vi}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-300">{word.category}</span>
                                                {word.unit && word.unit <= 12 && !word.master_group && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">Unit {word.unit}</span>}
                                                {word.unit && word.unit > 12 && !word.master_group && <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">Chủ đề {word.unit - 12}</span>}
                                                {word.master_group && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-bold">{word.master_group}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* List All Words */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors mt-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Kho Từ Vựng</h2>
                        <p className="text-sm font-bold text-blue-500">{words.length} từ hiện có</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm từ tiếng Anh hoặc Việt..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Từ vựng</th>
                                <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Nghĩa</th>
                                <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider">Phân loại</th>
                                <th className="px-4 py-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {paginatedWords.map((word) => (
                                <tr key={word.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition opacity-0 group-hover:opacity-100 shrink-0"
                                                onClick={() => speak(word.en)}
                                            >
                                                <Volume2 size={16} />
                                            </button>
                                            <div>
                                                <div className="font-bold text-gray-800 dark:text-white">{word.en}</div>
                                                <div className="text-xs text-gray-400 italic">{word.ipa}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">
                                        {word.vi}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="text-[11px] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded-md text-gray-600 dark:text-slate-400">{word.category}</span>
                                            {word.unit && word.unit <= 12 && !word.master_group && <span className="text-[11px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">Unit {word.unit}</span>}
                                            {word.unit && word.unit > 12 && !word.master_group && <span className="text-[11px] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md font-bold">Chủ đề {word.unit - 12}</span>}
                                            {word.master_group && <span className="text-[11px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">{word.master_group}</span>}
                                            {word.sub_group && <span className="text-[11px] bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md font-bold">{word.sub_group}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            className="text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-2 opacity-0 group-hover:opacity-100 transition"
                                            onClick={() => onDeleteWord(word.id)}
                                            title="Xóa từ này"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredWords.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-400">Không tìm thấy từ vựng nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredWords.length > pageSize && (
                    <div className="px-6 py-3.5 border-t border-gray-150 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400 bg-gray-50/50 dark:bg-slate-800/30">
                        <div>
                            Hiển thị <span className="font-bold text-gray-700 dark:text-white">{(currentPage - 1) * pageSize + 1} - {Math.min(filteredWords.length, currentPage * pageSize)}</span> trong tổng số <span className="font-bold text-gray-700 dark:text-white">{filteredWords.length.toLocaleString()}</span> từ
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
                            >
                                Trang trước
                            </button>
                            <span className="font-bold px-2 text-gray-700 dark:text-white">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WordManager;
