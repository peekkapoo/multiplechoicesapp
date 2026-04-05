import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, CheckCircle2, XCircle, ChevronRight, ChevronLeft, 
  AlertCircle, RotateCcw, Shuffle, 
  Layers, Check, BookOpen, Search, Hash, Upload, Download, FileSpreadsheet, Moon, Sun, Zap,
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

const BrandMark = ({
  className = '',
  iconSize = 14,
  strokeWidth = 2.7,
  ariaLabel = 'BLUE logo',
}) => (
  <div
    role="img"
    aria-label={ariaLabel}
    className={`flex items-center justify-center rounded-[28%] bg-gradient-to-br from-sky-400 to-blue-700 ${className}`.trim()}
  >
    <Zap size={iconSize} className="text-white" strokeWidth={strokeWidth} />
  </div>
);

const BrandLockup = ({ isDarkTheme, className = '' }) => (
  <div className={`inline-flex flex-col items-center gap-3 ${className}`.trim()}>
    <BrandMark
      className="h-20 w-20 md:h-24 md:w-24 shadow-[0_14px_30px_rgba(14,165,233,0.30)]"
      iconSize={34}
      strokeWidth={2.6}
      ariaLabel="BLUE app logo"
    />
    <span
      className={`text-[1.7rem] md:text-[2rem] font-semibold leading-none tracking-[0.42em] pl-[0.42em] ${
        isDarkTheme ? 'text-[#24D4FF]' : 'text-[#149DE5]'
      }`}
    >
      BLUE
    </span>
  </div>
);

const AnimatedBackground = ({ isDarkTheme }) => (
  <div
    className="fixed inset-0 z-[-1] overflow-hidden transition-colors duration-500"
    style={{
      background: isDarkTheme
        ? 'linear-gradient(180deg, #040A14 0%, #07162A 60%, #0D2F62 100%)'
        : 'linear-gradient(180deg, #F2F8FF 0%, #F8FBFF 58%, #EEF5FF 100%)',
    }}
  >
    <div
      className="absolute top-[-14%] left-[-8%] w-[48%] h-[45%] rounded-full blur-[120px]"
      style={{ background: isDarkTheme ? 'rgba(14, 165, 233, 0.18)' : 'rgba(14, 165, 233, 0.22)' }}
    />
    <div
      className="absolute bottom-[-26%] right-[-12%] w-[62%] h-[60%] rounded-full blur-[150px]"
      style={{ background: isDarkTheme ? 'rgba(13, 47, 98, 0.24)' : 'rgba(34, 211, 238, 0.20)' }}
    />
    <div
      className="absolute top-[38%] left-[30%] w-[40%] h-[38%] rounded-full blur-[100px]"
      style={{ background: isDarkTheme ? 'rgba(34, 211, 238, 0.09)' : 'rgba(14, 165, 233, 0.08)' }}
    />
    <div
      className="absolute inset-0 opacity-45"
      style={{
        backgroundImage: isDarkTheme
          ? 'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.08) 1px, transparent 0)'
          : 'radial-gradient(circle at 1px 1px, rgba(14, 116, 144, 0.12) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    />
  </div>
);

const ThemeSwitch = ({ isDarkTheme, onToggleTheme }) => (
  <div className="fixed top-4 right-4 z-50">
    <button
      type="button"
      onClick={onToggleTheme}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-xl transition-all ${isDarkTheme ? 'border-sky-400/35 bg-slate-900/75 text-slate-100 hover:bg-slate-900' : 'border-sky-200 bg-white/80 text-[#0B1F3A] hover:bg-white'}`}
      aria-label={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${isDarkTheme ? 'bg-sky-500/20 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
        {isDarkTheme ? <Moon size={14} /> : <Sun size={14} />}
      </span>
      {isDarkTheme ? 'Dark mode' : 'Light mode'}
    </button>
  </div>
);

const CopyrightFooter = ({ isDarkTheme }) => (
  <footer className="w-full px-4 pb-4 pt-2 flex justify-center">
    <p className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] md:text-xs font-medium tracking-[0.08em] backdrop-blur-md ${isDarkTheme ? 'border-white/20 bg-slate-900/60 text-slate-200' : 'border-sky-200/80 bg-white/75 text-[#0B1F3A]'}`}>
      © 2026 by peekk_apoo. All rights reserved
    </p>
  </footer>
);

const Toggle = ({ enabled, setEnabled, label, icon, isDarkTheme }) => {
  const ToggleIcon = icon ?? Shuffle;

  return (
    <button
      type="button"
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors cursor-pointer ${isDarkTheme ? 'bg-[#121F34] border-slate-600 hover:bg-[#192A43]' : 'bg-white border-slate-300 hover:bg-slate-50'}`}
      onClick={() => setEnabled((prev) => !prev)}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <div className={`flex items-center gap-3 ${isDarkTheme ? 'text-slate-100' : 'text-[#0B1F3A]'}`}>
        <div className={`p-2 rounded-xl transition-colors ${enabled ? (isDarkTheme ? 'bg-sky-500/25 text-sky-200' : 'bg-sky-100 text-sky-700') : (isDarkTheme ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')}`}>
          <ToggleIcon size={20} />
        </div>
        <span className="font-medium text-sm md:text-base">{label}</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-[#0EA5E9]' : (isDarkTheme ? 'bg-slate-600' : 'bg-slate-300')}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </button>
  );
};

export default function App() {
  const [appState, setAppState] = useState('setup'); // 'setup', 'quiz', 'result', 'archive'
  const [isExcelReady, setIsExcelReady] = useState(typeof window !== 'undefined' && Boolean(window.XLSX));
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const savedTheme = localStorage.getItem('mc-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }

    return 'light';
  });
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mc-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  
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

  // --- EXCEL/CSV DATA MANAGEMENT FUNCTIONS ---
  const handleImportExcel = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const isCsvFile = fileExtension === 'csv';
    const supportedExtensions = ['xlsx', 'xls', 'csv'];

    if (!supportedExtensions.includes(fileExtension)) {
      alert('❌ Định dạng file chưa được hỗ trợ. Vui lòng chọn .xlsx, .xls hoặc .csv.');
      event.target.value = '';
      return;
    }

    if (!window.XLSX) {
      alert("Thư viện xử lý file đang tải. Vui lòng đợi 1 lát và thử lại.");
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let workbook;

        if (isCsvFile) {
          const csvText = String(e.target?.result || '').replace(/^\uFEFF/, '');
          const firstLine = csvText.split(/\r?\n/, 1)[0] || '';
          const commaCount = (firstLine.match(/,/g) || []).length;
          const semicolonCount = (firstLine.match(/;/g) || []).length;
          const delimiter = semicolonCount > commaCount ? ';' : ',';

          workbook = window.XLSX.read(csvText, {
            type: 'string',
            raw: true,
            FS: delimiter
          });
        } else {
          const data = new Uint8Array(e.target.result);
          workbook = window.XLSX.read(data, { type: 'array' });
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = window.XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const normalizeRowKeys = (row) => {
          return Object.entries(row).reduce((acc, [key, value]) => {
            const normalizedKey = String(key).replace(/^\uFEFF/, '').trim().toLowerCase();
            acc[normalizedKey] = value;
            return acc;
          }, {});
        };

        const getRowValue = (row, aliases) => {
          for (const alias of aliases) {
            const value = row[alias];
            if (value !== undefined && value !== null && String(value).trim() !== '') {
              return value;
            }
          }
          return '';
        };

        // Map các cột từ Excel/CSV sang Object của App
        const importedData = json.map((row, index) => {
          const normalizedRow = normalizeRowKeys(row);

          return {
            id: getRowValue(normalizedRow, ['no.', 'no', 'id']) || index + 1,
            section: getRowValue(normalizedRow, ['section']) || "Uncategorized",
            text: getRowValue(normalizedRow, ['question']) || "",
            options: {
              A: String(getRowValue(normalizedRow, ['option a', 'a'])),
              B: String(getRowValue(normalizedRow, ['option b', 'b'])),
              C: String(getRowValue(normalizedRow, ['option c', 'c'])),
              D: String(getRowValue(normalizedRow, ['option d', 'd']))
            },
            correctAnswer: String(getRowValue(normalizedRow, ['correct answer', 'answer'])).toUpperCase().trim(),
            explanation: String(getRowValue(normalizedRow, ['explanation']))
          };
        }).filter(q => q.text && q.text.trim() !== ""); // Lọc các dòng câu hỏi trống

        const fileTypeLabel = isCsvFile ? 'CSV' : 'Excel';

        if (importedData.length > 0) {
          setQuizData(importedData);
          setSelectedSections([...new Set(importedData.map((q) => q.section || 'Uncategorized'))]);
          localStorage.setItem('examData', JSON.stringify(importedData));
          
          alert(`✅ Import thành công ${importedData.length} câu hỏi từ file ${fileTypeLabel}!`);
        } else {
          alert("❌ File không có dữ liệu câu hỏi hợp lệ. Hãy kiểm tra lại các cột theo file mẫu.");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Lỗi: Không thể phân tích file. Vui lòng đảm bảo đây là file Excel (.xlsx, .xls) hoặc CSV (.csv) hợp lệ.");
      }
    };

    if (isCsvFile) {
      reader.readAsText(file, 'utf-8');
    } else {
      // Sử dụng ArrayBuffer để đọc chính xác file nhị phân của Excel
      reader.readAsArrayBuffer(file);
    }

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

  const appShellClass = `min-h-screen relative flex flex-col ${isDarkTheme ? 'text-slate-100' : 'text-[#0B1F3A]'}`;
  const glassCardClass = isDarkTheme
    ? 'bg-[#0B1220]/88 backdrop-blur-xl border border-sky-500/20 shadow-[0_24px_70px_rgba(2,6,23,0.55)]'
    : 'bg-white/96 backdrop-blur-xl border border-slate-200 shadow-[0_25px_70px_rgba(11,31,58,0.12)]';
  const softGlassCardClass = isDarkTheme
    ? 'bg-[#0E182A]/86 backdrop-blur-sm border border-slate-700/70'
    : 'bg-white/95 backdrop-blur-sm border border-slate-200';
  const panelSurfaceClass = isDarkTheme
    ? 'bg-[#0A1628]/90 border border-sky-500/25'
    : 'bg-[#F8FBFF] border border-sky-200';
  const mutedTextClass = isDarkTheme ? 'text-slate-300' : 'text-slate-700';
  const labelTextClass = isDarkTheme ? 'text-slate-100' : 'text-[#0B1F3A]';
  const setupInputClass = isDarkTheme
    ? 'w-full py-3 px-4 rounded-xl border border-slate-600 bg-[#0C1729] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#22D3EE] focus:ring-2 focus:ring-[#22D3EE]/30 transition-all font-medium'
    : 'w-full py-3 px-4 rounded-xl border border-slate-300 bg-white text-[#0B1F3A] placeholder-slate-500 focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium';
  const softButtonClass = isDarkTheme
    ? 'bg-[#132238] hover:bg-[#1A2D47] text-slate-100 border border-slate-600'
    : 'bg-white hover:bg-slate-50 text-[#0B1F3A] border border-slate-300';
  const outlineButtonClass = isDarkTheme
    ? 'bg-[#132238] hover:bg-[#1A2D47] text-slate-100 border border-slate-600'
    : 'bg-white hover:bg-slate-50 text-[#0B1F3A] border border-slate-300';
  const stickyHeaderClass = isDarkTheme
    ? 'bg-[#050C17]/88 border-b border-slate-700/70'
    : 'bg-white/95 border-b border-slate-200 shadow-[0_8px_30px_rgba(11,31,58,0.08)]';
  const archiveInputClass = isDarkTheme
    ? 'bg-[#0C1729] border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#22D3EE] transition-colors duration-200'
    : 'bg-white border border-slate-300 text-[#0B1F3A] placeholder-slate-500 focus:outline-none focus:border-[#0EA5E9] transition-colors duration-200';
  const primaryActionClass = 'bg-gradient-to-r from-[#0EA5E9] to-[#0D2F62] text-white hover:from-[#22D3EE] hover:to-[#0D2F62]';
  const successTextClass = isDarkTheme ? 'text-[#CFFBE8]' : 'text-[#0F7E5F]';
  const errorTextClass = isDarkTheme ? 'text-[#FFE0E8]' : 'text-[#B14862]';
  const successIconClass = isDarkTheme ? 'text-[#39D98A]' : 'text-[#149469]';
  const errorIconClass = isDarkTheme ? 'text-[#FF6F8F]' : 'text-[#C95674]';
  const successDotClass = isDarkTheme
    ? 'bg-[#39D98A] shadow-[0_0_10px_rgba(57,217,138,0.45)]'
    : 'bg-[#149469]';
  const errorDotClass = isDarkTheme
    ? 'bg-[#FF6F8F] shadow-[0_0_10px_rgba(255,111,143,0.42)]'
    : 'bg-[#C95674]';
  const successFrameClass = isDarkTheme
    ? 'bg-[#103E34]/76 border-[#2AA978]/80'
    : 'bg-[#E8F7F0] border-[#A8DCC8]';
  const errorFrameClass = isDarkTheme
    ? 'bg-[#43222F]/76 border-[#B95F78]/80'
    : 'bg-[#FCEEF2] border-[#E6B8C3]';
  const successBadgeClass = isDarkTheme
    ? 'text-[#DDFEF0] border-[#2EB17E]/84 bg-[#145140]/88'
    : 'text-[#0F7E5F] border-[#97D2BC] bg-[#DFF2EA]';
  const errorBadgeClass = isDarkTheme
    ? 'text-[#FFE7EE] border-[#C96E86]/84 bg-[#552B39]/88'
    : 'text-[#B14862] border-[#E0B3C0] bg-[#F8E7EC]';
  const successOptionClass = isDarkTheme
    ? 'bg-[#145140]/88 border-[#38C88C]/90 text-[#E2FFF2] shadow-[0_0_14px_rgba(57,217,138,0.22)]'
    : 'bg-[#E8F7F0] border-[#A2D8C3] text-[#0F7E5F]';
  const errorOptionClass = isDarkTheme
    ? 'bg-[#552B39]/88 border-[#D17A92]/90 text-[#FFE7EE] shadow-[0_0_14px_rgba(255,111,143,0.15)]'
    : 'bg-[#FCEEF2] border-[#E2B6C3] text-[#B14862]';
  const successGridClass = isDarkTheme
    ? 'border-[#2EB17E]/86 bg-[#145140]/86 text-[#E2FFF2]'
    : 'border-[#97D2BC] bg-[#DFF2EA] text-[#0F7E5F]';
  const errorGridClass = isDarkTheme
    ? 'border-[#C96E86]/86 bg-[#552B39]/86 text-[#FFE7EE]'
    : 'border-[#E0B3C0] bg-[#F8E7EC] text-[#B14862]';
  const statusReadyClass = isDarkTheme
    ? 'text-cyan-100 bg-cyan-500/20 border-cyan-400/35'
    : 'text-cyan-800 bg-cyan-100 border-cyan-200';
  const archiveToolbarClass = isDarkTheme
    ? 'rounded-2xl bg-[#0B1220]/88 border border-slate-700/70 shadow-[0_10px_30px_rgba(2,6,23,0.35)] p-3 sm:p-4'
    : 'rounded-2xl bg-white/97 border border-slate-200 shadow-[0_12px_28px_rgba(11,31,58,0.08)] p-3 sm:p-4';
  const archiveCardClass = isDarkTheme
    ? 'rounded-2xl p-5 transition-all duration-300 bg-[#0E182A]/86 border border-slate-700/70 hover:bg-[#16253B]'
    : 'rounded-2xl p-5 transition-all duration-300 bg-white border border-slate-200 shadow-[0_6px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] hover:-translate-y-[1px]';
  const archiveIndexClass = isDarkTheme
    ? 'bg-sky-500/20 border border-sky-500/30 text-sky-300'
    : 'bg-[#EAF4FF] border border-[#CFE3FF] text-[#0D2F62]';
  const archiveSectionBadgeClass = isDarkTheme
    ? 'bg-slate-800 border border-slate-600 text-slate-100'
    : 'bg-slate-100 border border-slate-200 text-[#0D2F62]';

  // Memoize archive processing so large question banks stay responsive while searching/sorting.
  const archiveData = useMemo(() => {
    if (appState !== 'archive') {
      return [];
    }

    const searchKeyword = archiveSearch.trim().toLowerCase();

    return quizData
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
  }, [appState, archiveSearch, archiveSectionFilter, archiveSortOrder, quizData]);

  // --- RENDERS ---

  if (appState === 'setup') {
    return (
      <div className={appShellClass}>
        <AnimatedBackground isDarkTheme={isDarkTheme} />
        <ThemeSwitch isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex items-center justify-center p-4 py-8 md:py-10">
          <div className={`max-w-2xl w-full rounded-[2rem] p-6 md:p-8 relative ${glassCardClass}`}>
          <div className="text-center mb-7">
            <div className="mx-auto mb-5 w-fit transform -rotate-1 hover:rotate-0 transition-transform">
              <BrandLockup isDarkTheme={isDarkTheme} />
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold bg-clip-text text-transparent ${isDarkTheme ? 'bg-gradient-to-r from-white to-sky-200' : 'bg-gradient-to-r from-[#0B1F3A] to-[#0EA5E9]'}`}>
              Exam Setup
            </h1>
            <p className={`mt-2 text-xs md:text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>Customize your testing experience or review the archive</p>
          </div>

          {/* --- EXCEL DATA MANAGER --- */}
          <div className={`mb-7 p-4 md:p-5 rounded-2xl ${panelSurfaceClass}`}>
            <div className="flex items-center justify-between mb-4">
              <label className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isDarkTheme ? 'text-sky-200' : 'text-[#0D2F62]'}`}>
                <FileSpreadsheet size={18} /> Quản lý Bộ Đề (Excel/CSV)
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-3 py-1 rounded-full border ${isDarkTheme ? 'bg-sky-500/20 text-sky-200 border-sky-500/30' : 'bg-sky-100 text-[#0D2F62] border-sky-200'}`}>
                  {quizData.length} Questions
                </span>
                <span className={`text-[10px] px-2 py-1 rounded-full border ${isExcelReady ? statusReadyClass : (isDarkTheme ? 'text-amber-200 bg-amber-500/20 border-amber-500/30' : 'text-amber-700 bg-amber-100 border-amber-200')}`}>
                  {isExcelReady ? 'Parser ready' : 'Loading parser...'}
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
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${isDarkTheme ? 'bg-[#132238] hover:bg-[#1A2D47] text-slate-100 border border-slate-600 hover:border-sky-500/40' : 'bg-white hover:bg-slate-50 text-[#0B1F3A] border border-slate-300 hover:border-sky-300'}`}
              >
                <Upload size={16} /> Import File (.xlsx, .xls, .csv)
              </button>
              <button 
                type="button"
                onClick={handleExportExcel}
                disabled={!isExcelReady}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${softButtonClass}`}
              >
                <Download size={16} /> Export File Mẫu
              </button>
            </div>
            <p className={`text-xs mt-3 text-center ${mutedTextClass}`}>
              {isExcelReady
                ? 'Tải file mẫu về, điền câu hỏi rồi import lại lên đây. Hỗ trợ .xlsx, .xls và .csv.'
                : 'Đang tải thư viện xử lý file, vui lòng đợi vài giây trước khi import/export.'}
            </p>
          </div>

          <div className="mb-7">
            <button 
              type="button"
              onClick={() => setAppState('archive')}
              className={`w-full p-3 rounded-2xl transition-all flex items-center justify-center gap-3 font-semibold ${isDarkTheme ? 'bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-200' : 'bg-sky-100/85 hover:bg-sky-100 border border-sky-300/70 text-[#0D2F62]'}`}
            >
              <BookOpen size={20} />
              View Full Archive ({quizData.length} Questions)
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider ${labelTextClass}`}>
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
                          ? (isDarkTheme ? 'bg-[#0EA5E9]/30 border-[#22D3EE]/40 text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]' : 'bg-sky-100 border-sky-300 text-[#0B1F3A] shadow-[0_10px_24px_rgba(14,165,233,0.16)]')
                          : (isDarkTheme ? 'bg-[#111E33]/85 border-slate-600 text-slate-200 hover:bg-[#192A43] hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-[#0B1F3A]')
                      }`}
                    >
                      <span className="truncate mr-2">{sec}</span>
                      {isSelected && <Check size={16} className={`shrink-0 ${isDarkTheme ? 'text-cyan-300' : 'text-sky-700'}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider ${labelTextClass}`}>
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
                  className={setupInputClass}
                />
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider ${labelTextClass}`}>
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
                  className={`${setupInputClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <Toggle
                  enabled={isUnlimitedTime}
                  setEnabled={setUnlimitedTimeEnabled}
                  label="Không giới hạn thời gian"
                  icon={Clock}
                  isDarkTheme={isDarkTheme}
                />
                <p className={`text-xs ${mutedTextClass}`}>
                  {isUnlimitedTime
                    ? 'Chế độ hiện tại: Không giới hạn thời gian.'
                    : timeLimitInput.trim() !== ''
                      ? `Chế độ hiện tại: ${timeLimitInput} phút làm bài.`
                      : 'Chế độ hiện tại: 1 phút cho mỗi câu hỏi.'}
                </p>
              </div>
            </div>

            <div>
              <label className={`flex items-center gap-2 text-sm font-semibold mb-4 uppercase tracking-wider ${labelTextClass}`}>
                <Shuffle size={16} /> Randomize Elements
              </label>
              <div className="space-y-3">
                <Toggle enabled={isShuffleQs} setEnabled={setIsShuffleQs} label="Shuffle Question Order" icon={Shuffle} isDarkTheme={isDarkTheme} />
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={startQuiz}
            disabled={maxQuestionCount === 0}
            className={`w-full mt-8 py-3 rounded-2xl font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${primaryActionClass} ${isDarkTheme ? 'shadow-[0_0_20px_rgba(14,165,233,0.4)] hover:shadow-[0_0_30px_rgba(14,165,233,0.55)]' : 'shadow-[0_12px_30px_rgba(14,165,233,0.30)] hover:shadow-[0_18px_40px_rgba(14,165,233,0.36)]'}`}
          >
            Start Exam 
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          </div>
        </div>
        <CopyrightFooter isDarkTheme={isDarkTheme} />
      </div>
    );
  }

  // APP STATE: ARCHIVE
  if (appState === 'archive') {
    return (
      <div className={appShellClass}>
        <AnimatedBackground isDarkTheme={isDarkTheme} />
        <ThemeSwitch isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
        
        <div className={`sticky top-0 z-40 backdrop-blur-xl px-4 py-4 sm:px-8 ${stickyHeaderClass}`}>
          <div className={`max-w-5xl mx-auto ${archiveToolbarClass}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <button 
                  type="button"
                  onClick={() => setAppState('setup')}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${outlineButtonClass}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className={`text-lg md:text-xl font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>
                    <BrandMark className="h-6 w-6 shrink-0 shadow-[0_6px_14px_rgba(14,165,233,0.32)]" /> Question Archive
                  </h2>
                  <p className={`text-xs ${mutedTextClass}`}>Total: {quizData.length} questions loaded</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 w-full lg:w-auto lg:min-w-[540px]">
                <div className="relative">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkTheme ? 'text-slate-300' : 'text-slate-500'}`} />
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    className={`w-full rounded-lg py-2.5 pl-9 pr-4 text-sm ${archiveInputClass}`}
                  />
                </div>
                <select 
                  value={archiveSectionFilter}
                  onChange={(e) => setArchiveSectionFilter(e.target.value)}
                  className={`rounded-lg py-2.5 px-3 text-sm max-w-[180px] truncate ${archiveInputClass}`}
                >
                  <option value="ALL">All Sections</option>
                  {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={archiveSortOrder}
                  onChange={(e) => setArchiveSortOrder(e.target.value)}
                  className={`rounded-lg py-2.5 px-3 text-sm ${archiveInputClass}`}
                >
                  <option value="A_Z">A → Z</option>
                  <option value="Z_A">Z → A</option>
                  <option value="QUESTION_ASC">Q 1 → 99</option>
                  <option value="QUESTION_DESC">Q 99 → 1</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {archiveData.length === 0 ? (
              <div className={`text-center py-20 rounded-2xl ${softGlassCardClass} ${mutedTextClass}`}>
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No questions found matching your criteria.</p>
              </div>
            ) : (
              archiveData.map((q) => (
                <div key={`${q.id}-${q.section}-${q.text.slice(0, 24)}`} className={archiveCardClass}>
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${archiveIndexClass}`}>
                      Q{q.id}
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded mb-3 inline-block ${archiveSectionBadgeClass}`}>
                        {q.section || "Uncategorized"}
                      </span>
                      <h3 className={`text-base md:text-lg font-semibold mb-4 leading-8 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>{q.text}</h3>
                      
                      <div className="space-y-2 mb-4">
                        {Object.keys(q.options).map(optKey => (
                          <div 
                            key={optKey} 
                            className={`p-3 rounded-lg border text-[15px] leading-7 flex gap-3 ${
                              optKey === q.correctAnswer 
                                ? successOptionClass
                                : (isDarkTheme ? 'bg-[#121F34] border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-700')
                            }`}
                          >
                            <span className="font-bold shrink-0">{optKey}.</span>
                            <span>{q.options[optKey]}</span>
                            {optKey === q.correctAnswer && <CheckCircle2 size={18} className={`ml-auto shrink-0 ${successIconClass}`} />}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className={`rounded-lg p-4 text-sm ${isDarkTheme ? 'bg-indigo-900/30 border border-indigo-500/20 text-indigo-200' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                          <strong className={`flex items-center gap-2 mb-1 ${isDarkTheme ? 'text-indigo-300' : 'text-[#0D2F62]'}`}>
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
        <CopyrightFooter isDarkTheme={isDarkTheme} />
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
      <div className={appShellClass}>
        <AnimatedBackground isDarkTheme={isDarkTheme} />
        <ThemeSwitch isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
        <div className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className={`rounded-[2rem] p-6 md:p-8 ${glassCardClass}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#0EA5E9] to-[#0D2F62] ${isDarkTheme ? 'shadow-[0_0_30px_rgba(14,165,233,0.5)]' : 'shadow-[0_10px_30px_rgba(14,165,233,0.35)]'}`}>
                    <span className="text-2xl md:text-3xl font-bold text-white">{scorePercentage}%</span>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold mb-1 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>Exam Completed</h2>
                    <p className={`text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>Review answers below (wrong answers are shown first).</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setAppState('setup')}
                  className={`w-full md:w-auto py-3 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${outlineButtonClass}`}
                >
                  <RotateCcw size={18} /> Back to Setup
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className={`rounded-2xl p-4 ${softGlassCardClass}`}>
                  <p className={`text-sm mb-1 ${mutedTextClass}`}>Correct</p>
                  <p className={`text-xl font-bold ${successTextClass}`}>{correctCount}</p>
                </div>
                <div className={`rounded-2xl p-4 ${softGlassCardClass}`}>
                  <p className={`text-sm mb-1 ${mutedTextClass}`}>Wrong</p>
                  <p className={`text-xl font-bold ${errorTextClass}`}>{wrongCount}</p>
                </div>
                <div className={`rounded-2xl p-4 ${softGlassCardClass}`}>
                  <p className={`text-sm mb-1 ${mutedTextClass}`}>Total</p>
                  <p className={`text-xl font-bold ${isDarkTheme ? 'text-sky-300' : 'text-[#0D2F62]'}`}>{activeQuizData.length}</p>
                </div>
                <div className={`rounded-2xl p-4 ${softGlassCardClass}`}>
                  <p className={`text-sm mb-1 ${mutedTextClass}`}>Time Used</p>
                  <p className={`text-xl font-bold ${isDarkTheme ? 'text-sky-400' : 'text-sky-700'}`}>{timeUsedLabel}</p>
                </div>
              </div>
            </div>

            <div className={`rounded-[2rem] p-5 md:p-6 ${glassCardClass}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>Answer Review</h3>
              <div className="space-y-4">
                {reviewedAnswers.map((item) => (
                  <div
                    key={`${item.question.id}-${item.idx}`}
                    className={`rounded-2xl border p-4 md:p-5 ${
                      item.isCorrect
                        ? successFrameClass
                        : errorFrameClass
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold ${isDarkTheme ? 'bg-slate-800 border border-slate-600 text-white' : 'bg-white text-[#0B1F3A] border border-sky-100'}`}>
                          {item.idx + 1}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${isDarkTheme ? 'bg-slate-800 border border-slate-600 text-slate-100' : 'bg-sky-100 text-[#0D2F62]'}`}>
                          {item.question.section || 'Uncategorized'}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          item.isCorrect
                            ? successBadgeClass
                            : errorBadgeClass
                        }`}
                      >
                        {item.isCorrect ? 'Correct' : 'Wrong'}
                      </span>
                    </div>

                    <h4 className={`text-base md:text-lg font-semibold leading-8 mb-4 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>
                      {item.question.text}
                    </h4>

                    <div className="space-y-2 mb-4">
                      {Object.entries(item.question.options || {}).map(([optKey, optText]) => {
                        const isCorrectOption = optKey === item.question.correctAnswer;
                        const isSelectedWrong = item.selectedAnswer === optKey && !item.isCorrect;

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-lg border text-[15px] leading-7 flex gap-3 ${
                              isCorrectOption
                                ? successOptionClass
                                : isSelectedWrong
                                  ? errorOptionClass
                                  : (isDarkTheme ? 'bg-[#121F34] border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-700')
                            }`}
                          >
                            <span className="font-bold shrink-0">{optKey}.</span>
                            <span>{String(optText)}</span>
                            {isCorrectOption && <CheckCircle2 size={18} className={`ml-auto shrink-0 ${successIconClass}`} />}
                            {isSelectedWrong && <XCircle size={18} className={`ml-auto shrink-0 ${errorIconClass}`} />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-sm mb-3">
                      <span className={mutedTextClass}>Your answer: </span>
                      <span className={`font-semibold ${isDarkTheme ? 'text-slate-100' : 'text-[#0B1F3A]'}`}>
                        {item.selectedAnswer || 'Not answered'}
                      </span>
                      <span className={mutedTextClass}> | Correct answer: </span>
                      <span className={`font-semibold ${successTextClass}`}>{item.question.correctAnswer}</span>
                    </div>

                    <div className={`rounded-lg p-4 text-sm ${isDarkTheme ? 'bg-indigo-900/30 border border-indigo-500/20 text-indigo-200' : 'bg-sky-50 border border-sky-200 text-slate-700'}`}>
                      <strong className={`flex items-center gap-2 mb-1 ${isDarkTheme ? 'text-indigo-300' : 'text-[#0D2F62]'}`}>
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
        <CopyrightFooter isDarkTheme={isDarkTheme} />
      </div>
    );
  }

  // APP STATE: QUIZ
  const currentQuestion = activeQuizData[currentQuestionIdx];
  // An toàn: nếu filter/dữ liệu rỗng, ngăn UI sập
  if (!currentQuestion) {
     return (
        <div className={appShellClass}>
          <AnimatedBackground isDarkTheme={isDarkTheme} />
          <ThemeSwitch isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
          <div className="flex-1 flex items-center justify-center flex-col gap-4 p-4 text-center">
            <AlertCircle size={48} className={errorIconClass} />
            <p>Lỗi không tải được câu hỏi. Xin thử tải lại trang hoặc kiểm tra file Excel.</p>
            <button
              type="button"
              onClick={() => setAppState('setup')}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${primaryActionClass}`}
            >
              Về màn hình thiết lập
            </button>
          </div>
          <CopyrightFooter isDarkTheme={isDarkTheme} />
        </div>
     );
  }

  const hasAnsweredCurrent = !!userAnswers[currentQuestionIdx];
  const selectedOriginalKey = userAnswers[currentQuestionIdx];
  const isCorrectAnswer = selectedOriginalKey === currentQuestion?.correctAnswer;

  const getOptionGlassClass = (optOriginalKey) => {
    if (!hasAnsweredCurrent) {
      return isDarkTheme
        ? 'bg-[#122038] border-slate-600 hover:bg-[#1A2E4A] hover:border-sky-400/50 cursor-pointer text-slate-100'
        : 'bg-white border-sky-100 hover:bg-sky-50 hover:border-sky-300 cursor-pointer text-slate-700';
    }
    if (optOriginalKey === currentQuestion.correctAnswer) {
      return successOptionClass;
    }
    if (optOriginalKey === selectedOriginalKey && !isCorrectAnswer) {
      return errorOptionClass;
    }
    return isDarkTheme
      ? 'bg-[#111D31] border-slate-700 opacity-70 cursor-not-allowed text-slate-300'
      : 'bg-slate-100 border-slate-200 opacity-65 cursor-not-allowed text-slate-500';
  };

  const getGridBtnClass = (idx) => {
    let base = 'w-9 h-9 rounded-xl flex items-center justify-center font-medium text-xs md:text-sm transition-all border ';
    if (idx === currentQuestionIdx) {
      base += `ring-2 ring-[#0EA5E9] ring-offset-2 ${isDarkTheme ? 'ring-offset-slate-900' : 'ring-offset-white'} scale-110 `;
    }
    
    if (!userAnswers[idx]) {
      if (idx === currentQuestionIdx) {
        return base + (isDarkTheme ? 'border-sky-500 bg-sky-500/20 text-sky-300' : 'border-sky-400 bg-sky-100 text-sky-700');
      }

      return base + (isDarkTheme ? 'border-slate-600 bg-[#122038] text-slate-200 hover:bg-[#1A2E4A]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50');
    }
    
    const isAnsCorrect = userAnswers[idx] === activeQuizData[idx].correctAnswer;
    if (isAnsCorrect) {
      return base + successGridClass;
    }

    return base + errorGridClass;
  };

  return (
    <div className={appShellClass}>
      <AnimatedBackground isDarkTheme={isDarkTheme} />
      <ThemeSwitch isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <header className={`backdrop-blur-md border-b px-4 md:px-6 py-3 flex justify-between items-center shrink-0 z-10 ${isDarkTheme ? 'bg-[#081222]/92 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => {
                if(window.confirm('Bạn có chắc chắn muốn thoát? Kết quả hiện tại sẽ bị hủy.')) setAppState('setup');
              }}
              className={`p-2 rounded-lg transition-colors border ${isDarkTheme ? 'bg-[#132238] hover:bg-[#1A2D47] text-slate-100 border-slate-600' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'}`}
            >
              <RotateCcw size={18} />
            </button>
            <div>
              <div className="hidden sm:flex items-center gap-2">
                <BrandMark className="h-6 w-6 shrink-0 shadow-[0_6px_14px_rgba(14,165,233,0.32)]" />
                <h2 className={`font-bold text-base md:text-lg tracking-wide ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>EXAM ROOM</h2>
              </div>
              <p className={`text-xs font-medium px-2 py-1 rounded-md inline-block mt-1 ${isDarkTheme ? 'text-sky-300 bg-sky-500/20' : 'text-sky-700 bg-sky-100'}`}>
                {currentQuestion.section || "Uncategorized"}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border shadow-inner font-mono text-base ${isDarkTheme ? 'bg-[#111E33] text-sky-300 border-slate-600' : 'bg-white text-sky-700 border-slate-300'}`}>
            <Clock size={18} />
            {quizTimeLimitSeconds === null ? `No limit · ${formatTime(elapsedSeconds)}` : formatTime(timeRemaining)}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth scrollbar-hide z-10">
          <div className="max-w-4xl mx-auto pb-10">
            <div className={`mb-8 rounded-3xl p-5 md:p-6 shadow-xl ${softGlassCardClass}`}>
              <div className="flex items-start gap-5">
                <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0D2F62] text-white font-bold text-base ${isDarkTheme ? 'shadow-[0_0_15px_rgba(14,165,233,0.4)]' : 'shadow-[0_10px_20px_rgba(14,165,233,0.3)]'}`}>
                  {currentQuestionIdx + 1}
                </div>
                <h3 className={`text-lg md:text-xl leading-8 font-semibold mt-1 ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>
                  {currentQuestion.text}
                </h3>
              </div>
            </div>

            <div className="space-y-3 pl-0 md:pl-14">
              {currentQuestion.displayOptions?.map((opt, index) => {
                const label = LABELS[index];
                const isCorrectOption = opt.originalKey === currentQuestion.correctAnswer;
                return (
                  <button
                    type="button"
                    key={`${opt.originalKey}-${index}`}
                    onClick={() => handleSelectAnswer(opt.originalKey)}
                    disabled={hasAnsweredCurrent}
                    aria-label={`Chọn đáp án ${label}`}
                    className={`w-full text-left relative p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 backdrop-blur-sm group disabled:pointer-events-none ${getOptionGlassClass(opt.originalKey)}`}
                  >
                    <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm border group-hover:scale-105 transition-transform ${isDarkTheme ? 'bg-[#1C2E49] text-slate-100 border-slate-600' : 'bg-sky-50 text-sky-700 border-slate-300'}`}>
                      {label}
                    </div>
                    <div className="mt-1 flex-1">
                      <p className={`leading-7 text-[15px] md:text-base ${hasAnsweredCurrent && isCorrectOption ? 'font-bold' : 'font-medium'}`}>
                        {opt.text}
                      </p>
                    </div>
                    
                    {hasAnsweredCurrent && isCorrectOption && (
                      <CheckCircle2 className={`shrink-0 mt-1 ${successIconClass}`} size={24} />
                    )}
                    {hasAnsweredCurrent && opt.originalKey === selectedOriginalKey && !isCorrectAnswer && (
                      <XCircle className={`shrink-0 mt-1 ${errorIconClass}`} size={24} />
                    )}
                  </button>
                );
              })}
            </div>

            <div className={`transition-all duration-700 ease-out overflow-hidden mt-8 pl-0 md:pl-14 ${hasAnsweredCurrent ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className={`backdrop-blur-md rounded-2xl p-5 shadow-inner relative overflow-hidden ${isDarkTheme ? 'bg-indigo-900/40 border border-indigo-500/30' : 'bg-white border border-sky-200'}`}>
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#22D3EE] to-[#0D2F62]"></div>
                <h4 className={`font-bold flex items-center gap-2 mb-3 ${isDarkTheme ? 'text-indigo-300' : 'text-[#0D2F62]'}`}>
                  <AlertCircle size={18} /> Detailed Explanation
                </h4>
                <p className={`leading-7 text-[15px] md:text-base ${isDarkTheme ? 'text-slate-200' : 'text-slate-700'}`}>
                  {currentQuestion.explanation || "Không có giải thích cho câu hỏi này."}
                </p>
              </div>
            </div>
            
            <div className="mt-10 pb-12 flex justify-between items-center pl-0 md:pl-14">
              <button 
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                disabled={currentQuestionIdx === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed ${softButtonClass}`}
              >
                <ChevronLeft size={18} /> Previous
              </button>

              <button 
                type="button"
                onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                disabled={currentQuestionIdx === activeQuizData.length - 1}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed ${primaryActionClass} ${isDarkTheme ? 'hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'hover:shadow-[0_10px_24px_rgba(14,165,233,0.3)]'}`}
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`w-full md:w-72 backdrop-blur-2xl border-l flex flex-col shrink-0 h-64 md:h-auto z-20 ${isDarkTheme ? 'bg-[#081120]/95 border-slate-700' : 'bg-white/96 border-slate-200'}`}>
        <div className={`p-5 ${isDarkTheme ? 'border-b border-slate-700' : 'border-b border-slate-200'}`}>
          <h3 className={`font-bold tracking-wide ${isDarkTheme ? 'text-white' : 'text-[#0B1F3A]'}`}>Progress Panel</h3>
          <div className={`flex gap-4 mt-4 text-xs font-medium ${isDarkTheme ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${successDotClass}`}></span> Correct</div>
            <div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${errorDotClass}`}></span> Wrong</div>
            <div className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${isDarkTheme ? 'bg-slate-500 border border-slate-400' : 'bg-slate-200 border border-slate-300'}`}></span> Pending</div>
          </div>
          <p className={`text-xs mt-3 ${mutedTextClass}`}>
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

        <div className={`p-5 shrink-0 ${isDarkTheme ? 'border-t border-slate-700 bg-[#070F1C]' : 'border-t border-slate-200 bg-white'}`}>
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
            className={`w-full py-3 rounded-2xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${isDarkTheme ? 'bg-white hover:bg-slate-200 text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : `${primaryActionClass} shadow-[0_10px_24px_rgba(14,165,233,0.25)]`}`}
          >
            Submit Exam <CheckCircle2 size={18} />
          </button>
        </div>
      </div>

      </div>
      <CopyrightFooter isDarkTheme={isDarkTheme} />
    </div>
  );
}