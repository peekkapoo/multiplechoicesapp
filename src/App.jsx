import { useState, useEffect, useRef } from 'react';
import { 
  Clock, CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  AlertCircle, RotateCcw, Settings2, Shuffle, 
  Layers, Check, BookOpen, Search, Hash, Upload, Download, FileSpreadsheet,
} from 'lucide-react';

// --- DEFAULT DATA MOCK ---
const defaultQuizData = [
  {
    id: 1,
    section: "SECTION 1",
    text: "In a processing contract, the term 'Processor' (bên nhận gia công) is correctly defined as:",
    options: {
      A: "The party that places the order and at whose request manufacturing is performed",
      B: "The party that performs one or several stages of the production process using materials supplied by the other party in order to receive remuneration",
      C: "The customs authority that monitors the processing activity",
      D: "The party that owns the brand/trademark of the finished products"
    },
    correctAnswer: "B",
    explanation: "According to the legal definition, the Processor (Contractor) is the party that performs manufacturing stages using part or whole of raw materials supplied by the Processee (at the latter's request) and receives remuneration in return."
  },
  {
    id: 2,
    section: "SECTION 2",
    text: "'Complete equipment' (thiết bị toàn bộ) in international trade is defined as:",
    options: {
      A: "A collection of machines, equipment, and tools necessary to perform certain technological processes, which may include auxiliary equipment",
      B: "Equipment imported without any accompanying installation or commissioning services",
      C: "Only the primary production machinery, excluding all auxiliary tools and equipment",
      D: "A single machine purchased to replace an outdated piece of equipment"
    },
    correctAnswer: "A",
    explanation: "Complete equipment refers to an integrated collection of machines, tools, and equipment needed to carry out specific technological processes."
  }
];

// --- UTILITY: Array Shuffle (Fisher-Yates) ---
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const LABELS = ['A', 'B', 'C', 'D'];

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-900">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] mix-blend-screen"></div>
    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-cyan-400/5 blur-[100px] mix-blend-screen"></div>
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRlcm4gaWQ9InNtYWxsR3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNMTAgMEwwIDBMMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ1cmwoI3NtYWxsR3JpZCkiLz48cGF0aCBkPSJNNDAgMEwwIDBMMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]"></div>
  </div>
);

const CopyrightFooter = () => (
  <footer className="w-full px-4 pb-4 pt-2 flex justify-center">
    <p className="whitespace-nowrap rounded-full border border-white/20 bg-slate-900/60 px-3 py-1.5 text-[11px] md:text-xs font-medium tracking-[0.08em] text-slate-200 backdrop-blur-md">
      © 2026 by peekk_apoo. All rights reserved
    </p>
  </footer>
);

const Toggle = ({ enabled, setEnabled, label, icon }) => {
  const ToggleIcon = icon ?? Shuffle;

  return (
    <button
      type="button"
      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={() => setEnabled((prev) => !prev)}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <div className="flex items-center gap-3 text-slate-200">
        <div className={`p-2 rounded-xl ${enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'} transition-colors`}>
          <ToggleIcon size={20} />
        </div>
        <span className="font-medium text-sm md:text-base">{label}</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-blue-500' : 'bg-slate-700'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </button>
  );
};

export default function App() {
  const [appState, setAppState] = useState('setup'); // 'setup', 'quiz', 'result', 'archive'
  const [isExcelReady, setIsExcelReady] = useState(typeof window !== 'undefined' && Boolean(window.XLSX));
  
  // Tải thư viện Excel (SheetJS) động vào trình duyệt
  useEffect(() => {
    if (window.XLSX) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.async = true;
    script.onload = () => setIsExcelReady(true);
    script.onerror = () => setIsExcelReady(false);

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  // --- DATABASE STATE ---
  const [quizData, setQuizData] = useState(() => {
    const savedData = localStorage.getItem('examData');
    if (savedData) {
      try { return JSON.parse(savedData); } catch { return defaultQuizData; }
    }
    return defaultQuizData;
  });

  // Tự động nhận diện danh sách Section từ file Excel
  const availableSections = [...new Set(quizData.map(q => q.section || "Uncategorized"))];

  // Setup Configuration State
  const [selectedSections, setSelectedSections] = useState(availableSections);
  const [questionCountInput, setQuestionCountInput] = useState(''); // Để trống = chọn tất cả
  const [isShuffleQs, setIsShuffleQs] = useState(false);
  const [timeLimitInput, setTimeLimitInput] = useState(''); // Để trống = mặc định 1 phút/câu
  const [isUnlimitedTime, setIsUnlimitedTime] = useState(false);

  // Active Quiz State
  const [activeQuizData, setActiveQuizData] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); 
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [quizTimeLimitSeconds, setQuizTimeLimitSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Archive State
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveSectionFilter, setArchiveSectionFilter] = useState('ALL');
  const [archiveSortOrder, setArchiveSortOrder] = useState('A_Z');

  const fileInputRef = useRef(null);

  // --- EXCEL DATA MANAGEMENT FUNCTIONS ---
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!window.XLSX) {
      alert("Thư viện xử lý Excel đang tải. Vui lòng đợi 1 lát và thử lại.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = window.XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = window.XLSX.utils.sheet_to_json(worksheet);

        // Map các cột từ Excel sang Object của App
        const importedData = json.map((row, index) => {
          return {
            id: row['No.'] || index + 1,
            section: row['Section'] || "Uncategorized",
            text: row['Question'] || "",
            options: {
              A: String(row['Option A'] || ""),
              B: String(row['Option B'] || ""),
              C: String(row['Option C'] || ""),
              D: String(row['Option D'] || "")
            },
            correctAnswer: String(row['Correct Answer'] || "").toUpperCase().trim(),
            explanation: String(row['Explanation'] || "")
          };
        }).filter(q => q.text && q.text.trim() !== ""); // Lọc các dòng câu hỏi trống

        if (importedData.length > 0) {
          setQuizData(importedData);
          setSelectedSections([...new Set(importedData.map((q) => q.section || 'Uncategorized'))]);
          localStorage.setItem('examData', JSON.stringify(importedData));
          
          alert(`✅ Import thành công ${importedData.length} câu hỏi từ file Excel!`);
        } else {
          alert("❌ File không có dữ liệu câu hỏi hợp lệ. Hãy kiểm tra lại các cột theo file mẫu.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi: Không thể phân tích file. Vui lòng đảm bảo đây là file Excel (.xlsx) hợp lệ.");
      }
    };
    // Sử dụng ArrayBuffer để đọc chính xác file nhị phân của Excel
    reader.readAsArrayBuffer(file);
    event.target.value = ''; // Reset input
  };

  const handleExportExcel = () => {
    if (!window.XLSX) {
      alert("Thư viện xử lý Excel đang tải. Vui lòng đợi 1 lát và thử lại.");
      return;
    }

    // Nếu không có dữ liệu, xuất 1 file mẫu mặc định
    let exportData = quizData;
    if (!exportData || exportData.length === 0) {
      exportData = defaultQuizData;
    }

    const templateData = exportData.map(q => ({
      "Section": q.section || "General",
      "No.": q.id,
      "Question": q.text,
      "Option A": q.options.A || "",
      "Option B": q.options.B || "",
      "Option C": q.options.C || "",
      "Option D": q.options.D || "",
      "Correct Answer": q.correctAnswer,
      "Explanation": q.explanation || ""
    }));

    const worksheet = window.XLSX.utils.json_to_sheet(templateData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "Quiz_Questions");
    
    // Tải xuống file Excel
    window.XLSX.writeFile(workbook, "Exam_Template_150MCQ.xlsx");
  };


  const handleSectionToggle = (sec) => {
    setSelectedSections(prev => {
      if (prev.includes(sec)) {
        if (prev.length === 1) return prev; // Bắt buộc phải chọn ít nhất 1 section
        return prev.filter(s => s !== sec);
      }
      return [...prev, sec];
    });
  };

  const setUnlimitedTimeEnabled = (updater) => {
    setIsUnlimitedTime((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;

      if (next) {
        setTimeLimitInput('');
      }

      return next;
    });
  };

  const maxQuestionCount = quizData.filter(
    (q) => selectedSections.includes(q.section || 'Uncategorized')
  ).length;

  const startQuiz = () => {
    // Lọc theo Section
    let filteredData = quizData.filter(q => selectedSections.includes(q.section || "Uncategorized"));

    if (isShuffleQs) filteredData = shuffleArray(filteredData);
    
    // Cắt số lượng câu hỏi theo Input
    const limit = Number.parseInt(questionCountInput, 10);

    if (!Number.isNaN(limit) && limit <= 0) {
      alert('Số lượng câu hỏi phải lớn hơn 0.');
      return;
    }

    if (!Number.isNaN(limit) && limit > maxQuestionCount) {
      alert(`Bạn chỉ có thể chọn tối đa ${maxQuestionCount} câu ở bộ lọc hiện tại.`);
      return;
    }

    if (!Number.isNaN(limit) && limit > 0) {
      filteredData = filteredData.slice(0, limit);
    }

    const processedData = filteredData.map(q => {
      let optsArray = Object.keys(q.options || {}).map(key => ({
        originalKey: key, 
        text: q.options[key]
      }));
      return { ...q, displayOptions: optsArray };
    });

    if (processedData.length === 0) {
      alert("Không có câu hỏi nào trong bộ lọc hiện tại.");
      return;
    }

    const customMinutes = Number.parseInt(timeLimitInput, 10);
    let selectedTimeLimitSeconds = processedData.length * 60;

    if (isUnlimitedTime) {
      selectedTimeLimitSeconds = null;
    } else if (timeLimitInput.trim() !== '') {
      if (Number.isNaN(customMinutes) || customMinutes <= 0) {
        alert('Thời gian làm bài phải là số phút lớn hơn 0.');
        return;
      }

      selectedTimeLimitSeconds = customMinutes * 60;
    }

    setActiveQuizData(processedData);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setElapsedSeconds(0);
    setQuizTimeLimitSeconds(selectedTimeLimitSeconds);
    setTimeRemaining(selectedTimeLimitSeconds ?? 0);
    setAppState('quiz');
  };

  useEffect(() => {
    if (appState !== 'quiz') return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (quizTimeLimitSeconds === null) {
        return;
      }

      setTimeRemaining((prev) => {
        if (typeof prev !== 'number') return 0;

        if (prev <= 1) {
          clearInterval(timer);
          setAppState('result');
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [appState, quizTimeLimitSeconds]);

  const finishQuiz = () => setAppState('result');

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectAnswer = (originalKey) => {
    if (userAnswers[currentQuestionIdx]) return;
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIdx]: originalKey }));
  };

  const correctCount = Object.keys(userAnswers).filter(
    idx => userAnswers[idx] === activeQuizData[idx]?.correctAnswer
  ).length;

  // --- RENDERS ---

  if (appState === 'setup') {
    return (
      <div className="min-h-screen font-sans text-slate-100 relative flex flex-col">
        <AnimatedBackground />

        <div className="flex-1 flex items-center justify-center p-4 py-8 md:py-10">
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-6 md:p-8 border border-white/20 relative">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg transform -rotate-6 hover:rotate-0 transition-transform">
              <Settings2 size={28} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Exam Setup
            </h1>
            <p className="text-blue-200/70 mt-2 text-xs md:text-sm">Customize your testing experience or review the archive</p>
          </div>

          {/* --- EXCEL DATA MANAGER --- */}
          <div className="mb-7 p-4 md:p-5 rounded-2xl bg-slate-900/40 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm font-bold text-indigo-300 uppercase tracking-wider">
                <FileSpreadsheet size={18} /> Quản lý Bộ Đề (Excel)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-indigo-500/20 text-indigo-200 px-3 py-1 rounded-full border border-indigo-500/30">
                  {quizData.length} Questions
                </span>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${isExcelReady ? 'text-emerald-200 bg-emerald-500/20 border-emerald-500/30' : 'text-amber-200 bg-amber-500/20 border-amber-500/30'}`}>
                  {isExcelReady ? 'Excel ready' : 'Loading Excel...'}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                ref={fileInputRef} 
                onChange={handleImportExcel} 
                className="hidden" 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isExcelReady}
                className="flex-1 py-2.5 bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200 border border-white/10 hover:border-indigo-500/30 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Upload size={16} /> Import Excel (.xlsx)
              </button>
              <button 
                type="button"
                onClick={handleExportExcel}
                disabled={!isExcelReady}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} /> Export File Mẫu
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              {isExcelReady
                ? 'Tải file mẫu về, điền câu hỏi rồi import lại lên đây.'
                : 'Đang tải thư viện Excel, vui lòng đợi vài giây trước khi import/export.'}
            </p>
          </div>

          <div className="mb-7">
            <button 
              type="button"
              onClick={() => setAppState('archive')}
              className="w-full p-3 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 transition-all flex items-center justify-center gap-3 text-indigo-200 font-semibold"
            >
              <BookOpen size={20} />
              View Full Archive ({quizData.length} Questions)
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                <Layers size={16} /> Select Sections
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableSections.map((sec) => {
                  const isSelected = selectedSections.includes(sec);
                  return (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => handleSectionToggle(sec)}
                      aria-pressed={isSelected}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between truncate ${
                        isSelected 
                          ? 'bg-blue-500/30 border-blue-400/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="truncate mr-2">{sec}</span>
                      {isSelected && <Check size={16} className="text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                <Hash size={16} /> Number of Questions
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="1"
                  max={maxQuestionCount}
                  value={questionCountInput}
                  onChange={(e) => setQuestionCountInput(e.target.value)}
                  placeholder={`Tối đa: ${maxQuestionCount} câu (Để trống = Lấy tất cả)`}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                <Clock size={16} /> Exam Time
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={timeLimitInput}
                  onChange={(e) => setTimeLimitInput(e.target.value)}
                  placeholder="Nhập số phút (để trống = 1 phút/câu)"
                  disabled={isUnlimitedTime}
                  className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Toggle
                  enabled={isUnlimitedTime}
                  setEnabled={setUnlimitedTimeEnabled}
                  label="Không giới hạn thời gian"
                  icon={Clock}
                />
                <p className="text-xs text-slate-500">
                  {isUnlimitedTime
                    ? 'Chế độ hiện tại: Không giới hạn thời gian.'
                    : timeLimitInput.trim() !== ''
                      ? `Chế độ hiện tại: ${timeLimitInput} phút làm bài.`
                      : 'Chế độ hiện tại: 1 phút cho mỗi câu hỏi.'}
                </p>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                <Shuffle size={16} /> Randomize Elements
              </label>
              <div className="space-y-3">
                <Toggle enabled={isShuffleQs} setEnabled={setIsShuffleQs} label="Shuffle Question Order" icon={Shuffle} />
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={startQuiz}
            disabled={maxQuestionCount === 0}
            className="w-full mt-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white rounded-2xl font-bold text-base md:text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Start Exam 
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          </div>
        </div>
        <CopyrightFooter />
      </div>
    );
  }

  // APP STATE: ARCHIVE
  if (appState === 'archive') {
    const searchKeyword = archiveSearch.trim().toLowerCase();

    const archiveData = quizData
      .filter((q) => {
        const matchesSection = archiveSectionFilter === 'ALL' || (q.section || 'Uncategorized') === archiveSectionFilter;
        const optionText = Object.values(q.options || {}).join(' ').toLowerCase();
        const explanationText = (q.explanation || '').toLowerCase();

        const matchesSearch =
          searchKeyword === '' ||
          q.text.toLowerCase().includes(searchKeyword) ||
          explanationText.includes(searchKeyword) ||
          optionText.includes(searchKeyword) ||
          String(q.id).includes(searchKeyword);

        return matchesSection && matchesSearch;
      })
      .sort((a, b) => {
        const textA = (a.text || '').toLowerCase();
        const textB = (b.text || '').toLowerCase();
        const compare = textA.localeCompare(textB, undefined, {
          sensitivity: 'base',
          numeric: true,
        });

        const idA = Number(a.id) || 0;
        const idB = Number(b.id) || 0;

        if (archiveSortOrder === 'QUESTION_ASC') {
          return idA - idB;
        }

        if (archiveSortOrder === 'QUESTION_DESC') {
          return idB - idA;
        }

        return archiveSortOrder === 'Z_A' ? -compare : compare;
      });

    return (
      <div className="min-h-screen font-sans flex flex-col relative text-slate-100">
        <AnimatedBackground />
        
        <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 sm:px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button 
                type="button"
                onClick={() => setAppState('setup')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10 shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" /> Question Archive
                </h2>
                <p className="text-xs text-slate-400">Total: {quizData.length} questions loaded</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <select 
                value={archiveSectionFilter}
                onChange={(e) => setArchiveSectionFilter(e.target.value)}
                className="bg-slate-800/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 shrink-0 max-w-[150px] truncate"
              >
                <option value="ALL">All Sections</option>
                {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={archiveSortOrder}
                onChange={(e) => setArchiveSortOrder(e.target.value)}
                className="bg-slate-800/50 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 shrink-0"
              >
                <option value="A_Z">A → Z</option>
                <option value="Z_A">Z → A</option>
                <option value="QUESTION_ASC">Q 1 → 99</option>
                <option value="QUESTION_DESC">Q 99 → 1</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {archiveData.length === 0 ? (
              <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-white/10">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No questions found matching your criteria.</p>
              </div>
            ) : (
              archiveData.map((q) => (
                <div key={`${q.id}-${q.section}-${q.text.slice(0, 24)}`} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center font-bold text-blue-300">
                      Q{q.id}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded text-slate-300 mb-3 inline-block">
                        {q.section || "Uncategorized"}
                      </span>
                      <h3 className="text-base md:text-lg text-white font-medium mb-4 leading-relaxed">{q.text}</h3>
                      
                      <div className="space-y-2 mb-4">
                        {Object.keys(q.options).map(optKey => (
                          <div 
                            key={optKey} 
                            className={`p-3 rounded-lg border text-sm flex gap-3 ${
                              optKey === q.correctAnswer 
                                ? 'bg-green-500/20 border-green-500/40 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.1)]' 
                                : 'bg-slate-800/50 border-white/5 text-slate-300'
                            }`}
                          >
                            <span className="font-bold shrink-0">{optKey}.</span>
                            <span>{q.options[optKey]}</span>
                            {optKey === q.correctAnswer && <CheckCircle2 size={18} className="text-green-400 ml-auto shrink-0" />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-200">
                          <strong className="flex items-center gap-2 mb-1 text-indigo-300">
                            <AlertCircle size={16}/> Explanation
                          </strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <CopyrightFooter />
      </div>
    );
  }

  // APP STATE: RESULT
  if (appState === 'result') {
    const scorePercentage = activeQuizData.length > 0 ? Math.round((correctCount / activeQuizData.length) * 100) : 0;
    const timeUsedLabel =
      quizTimeLimitSeconds === null
        ? `${formatTime(elapsedSeconds)} (No limit)`
        : formatTime(elapsedSeconds);

    const reviewedAnswers = activeQuizData
      .map((question, idx) => {
        const selectedAnswer = userAnswers[idx] ?? null;
        const isCorrect = selectedAnswer === question.correctAnswer;

        return {
          idx,
          question,
          selectedAnswer,
          isCorrect,
        };
      })
      .sort((a, b) => {
        if (a.isCorrect === b.isCorrect) {
          return a.idx - b.idx;
        }

        return a.isCorrect ? 1 : -1;
      });

    const wrongCount = reviewedAnswers.filter((item) => !item.isCorrect).length;

    return (
      <div className="min-h-screen font-sans text-slate-100 relative flex flex-col">
        <AnimatedBackground />
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-6 md:p-8 border border-white/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                    <span className="text-2xl md:text-3xl font-bold text-white">{scorePercentage}%</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Exam Completed</h2>
                    <p className="text-sm text-slate-300">Review answers below (wrong answers are shown first).</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setAppState('setup')}
                  className="w-full md:w-auto py-3 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Back to Setup
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Correct</p>
                  <p className="text-xl font-bold text-green-400">{correctCount}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Wrong</p>
                  <p className="text-xl font-bold text-red-400">{wrongCount}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Total</p>
                  <p className="text-xl font-bold text-blue-300">{activeQuizData.length}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Time Used</p>
                  <p className="text-xl font-bold text-blue-400">{timeUsedLabel}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-5 md:p-6 border border-white/20">
              <h3 className="text-lg font-bold text-white mb-4">Answer Review</h3>
              <div className="space-y-4">
                {reviewedAnswers.map((item) => (
                  <div
                    key={`${item.question.id}-${item.idx}`}
                    className={`rounded-2xl border p-4 md:p-5 ${
                      item.isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-sm font-bold text-white">
                          {item.idx + 1}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-white/10 text-slate-300">
                          {item.question.section || 'Uncategorized'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          item.isCorrect
                            ? 'text-emerald-200 border-emerald-500/40 bg-emerald-500/20'
                            : 'text-rose-200 border-rose-500/40 bg-rose-500/20'
                        }`}
                      >
                        {item.isCorrect ? 'Correct' : 'Wrong'}
                      </span>
                    </div>

                    <h4 className="text-base md:text-lg font-medium text-white leading-relaxed mb-4">
                      {item.question.text}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {Object.entries(item.question.options || {}).map(([optKey, optText]) => {
                        const isCorrectOption = optKey === item.question.correctAnswer;
                        const isSelectedWrong = item.selectedAnswer === optKey && !item.isCorrect;

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-lg border text-sm flex gap-3 ${
                              isCorrectOption
                                ? 'bg-green-500/20 border-green-500/40 text-green-100'
                                : isSelectedWrong
                                  ? 'bg-red-500/20 border-red-500/40 text-red-100'
                                  : 'bg-slate-800/40 border-white/10 text-slate-300'
                            }`}
                          >
                            <span className="font-bold shrink-0">{optKey}.</span>
                            <span>{String(optText)}</span>
                            {isCorrectOption && <CheckCircle2 size={18} className="text-green-400 ml-auto shrink-0" />}
                            {isSelectedWrong && <XCircle size={18} className="text-red-400 ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-sm mb-3">
                      <span className="text-slate-400">Your answer: </span>
                      <span className="font-semibold text-slate-100">
                        {item.selectedAnswer || 'Not answered'}
                      </span>
                      <span className="text-slate-400"> | Correct answer: </span>
                      <span className="font-semibold text-emerald-300">{item.question.correctAnswer}</span>
                    </div>

                    <div className="bg-indigo-900/30 border border-indigo-500/20 rounded-lg p-4 text-sm text-indigo-200">
                      <strong className="flex items-center gap-2 mb-1 text-indigo-300">
                        <AlertCircle size={16} /> Explanation
                      </strong>
                      {item.question.explanation?.trim() || 'Không có giải thích cho câu hỏi này.'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <CopyrightFooter />
      </div>
    );
  }

  // APP STATE: QUIZ
  const currentQuestion = activeQuizData[currentQuestionIdx];
  // An toàn: nếu filter/dữ liệu rỗng, ngăn UI sập
  if (!currentQuestion) {
     return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col relative">
          <div className="flex-1 flex items-center justify-center flex-col gap-4 p-4 text-center">
            <AlertCircle size={48} className="text-red-400" />
            <p>Lỗi không tải được câu hỏi. Xin thử tải lại trang hoặc kiểm tra file Excel.</p>
            <button type="button" onClick={() => setAppState('setup')} className="bg-blue-600 px-4 py-2 rounded-lg">Về màn hình thiết lập</button>
          </div>
          <CopyrightFooter />
        </div>
     );
  }

  const hasAnsweredCurrent = !!userAnswers[currentQuestionIdx];
  const selectedOriginalKey = userAnswers[currentQuestionIdx];
  const isCorrectAnswer = selectedOriginalKey === currentQuestion?.correctAnswer;

  const getOptionGlassClass = (optOriginalKey) => {
    if (!hasAnsweredCurrent) {
      return "bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-400/50 cursor-pointer text-slate-200";
    }
    if (optOriginalKey === currentQuestion.correctAnswer) {
      return "bg-green-500/20 border-green-500/50 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
    }
    if (optOriginalKey === selectedOriginalKey && !isCorrectAnswer) {
      return "bg-red-500/20 border-red-500/50 text-red-100";
    }
    return "bg-white/5 border-white/10 opacity-40 cursor-not-allowed text-slate-400";
  };

  const getGridBtnClass = (idx) => {
    let base = "w-9 h-9 rounded-xl flex items-center justify-center font-medium text-xs md:text-sm transition-all border ";
    if (idx === currentQuestionIdx) base += "ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900 scale-110 ";
    
    if (!userAnswers[idx]) {
      return base + (idx === currentQuestionIdx ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10");
    }
    
    const isAnsCorrect = userAnswers[idx] === activeQuizData[idx].correctAnswer;
    return base + (isAnsCorrect ? "border-green-500/50 bg-green-500/30 text-green-200" : "border-red-500/50 bg-red-500/30 text-red-200");
  };

  return (
    <div className="min-h-screen font-sans relative flex flex-col">
      <AnimatedBackground />

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-3 flex justify-between items-center shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                if(window.confirm('Bạn có chắc chắn muốn thoát? Kết quả hiện tại sẽ bị hủy.')) setAppState('setup');
              }}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors border border-white/5"
            >
              <RotateCcw size={18} />
            </button>
            <div>
              <h2 className="font-bold text-base md:text-lg text-white hidden sm:block tracking-wide">EXAM ROOM</h2>
              <p className="text-xs font-medium text-blue-300 bg-blue-500/20 px-2 py-1 rounded-md inline-block mt-1">
                {currentQuestion.section || "Uncategorized"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 text-blue-400 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner font-mono text-base">
            <Clock size={18} />
            {quizTimeLimitSeconds === null ? `No limit · ${formatTime(elapsedSeconds)}` : formatTime(timeRemaining)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto pb-10">
            <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-6 shadow-xl">
              <div className="flex items-start gap-5">
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-base shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  {currentQuestionIdx + 1}
                </div>
                <h3 className="text-lg md:text-xl leading-relaxed text-white font-medium mt-1">
                  {currentQuestion.text}
                </h3>
              </div>
            </div>

            <div className="space-y-3 pl-0 md:pl-14">
              {currentQuestion.displayOptions?.map((opt, index) => {
                const label = LABELS[index]; 
                return (
                  <button
                    type="button"
                    key={`${opt.originalKey}-${index}`}
                    onClick={() => handleSelectAnswer(opt.originalKey)}
                    disabled={hasAnsweredCurrent}
                    aria-label={`Chọn đáp án ${label}`}
                    className={`w-full text-left relative p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 backdrop-blur-sm group disabled:pointer-events-none ${getOptionGlassClass(opt.originalKey)}`}
                  >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white font-bold text-sm border border-white/10 group-hover:scale-105 transition-transform">
                      {label}
                    </div>
                    <div className="mt-1 flex-1">
                      <p className="leading-relaxed text-sm md:text-base">{opt.text}</p>
                    </div>
                    
                    {hasAnsweredCurrent && opt.originalKey === currentQuestion.correctAnswer && (
                      <CheckCircle2 className="text-green-400 shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" size={24} />
                    )}
                    {hasAnsweredCurrent && opt.originalKey === selectedOriginalKey && !isCorrectAnswer && (
                      <XCircle className="text-red-400 shrink-0 mt-1" size={24} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`transition-all duration-700 ease-out overflow-hidden mt-8 pl-0 md:pl-14 ${hasAnsweredCurrent ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="bg-indigo-900/40 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-400 to-indigo-500"></div>
                <h4 className="font-bold text-indigo-300 flex items-center gap-2 mb-3">
                  <AlertCircle size={18} /> Detailed Explanation
                </h4>
                <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                  {currentQuestion.explanation || "Không có giải thích cho câu hỏi này."}
                </p>
              </div>
            </div>
            
            <div className="mt-10 pb-12 flex justify-between items-center pl-0 md:pl-14">
              <button 
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                disabled={currentQuestionIdx === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
              >
                <ChevronLeft size={18} /> Previous
              </button>

              <button 
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                disabled={currentQuestionIdx === activeQuizData.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full md:w-72 bg-slate-900/60 backdrop-blur-2xl border-l border-white/10 flex flex-col shrink-0 h-64 md:h-auto z-20">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-bold text-white tracking-wide">Progress Panel</h3>
          <div className="flex gap-4 mt-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span> Correct</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span> Wrong</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-white/10"></span> Pending</div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Answered: {Object.keys(userAnswers).length}/{activeQuizData.length}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide pb-20">
          <div className="grid grid-cols-6 md:grid-cols-5 lg:grid-cols-5 gap-3">
            {activeQuizData.map((q, idx) => (
              <button
                type="button"
                key={`${q.id}-${idx}`}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={getGridBtnClass(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 border-t border-white/10 shrink-0 bg-slate-900/40">
          <button 
            type="button"
            onClick={() => {
              const unansweredCount = activeQuizData.length - Object.keys(userAnswers).length;

              if (unansweredCount > 0) {
                const shouldSubmit = window.confirm(
                  `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có muốn nộp bài ngay không?`
                );

                if (!shouldSubmit) return;
              }

              finishQuiz();
            }}
            className="w-full py-3 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex justify-center items-center gap-2"
          >
            Submit Exam <CheckCircle2 size={18} />
          </button>
        </div>
      </div>

      </div>
      <CopyrightFooter />
    </div>
  );
}