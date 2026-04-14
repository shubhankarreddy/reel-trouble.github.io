// ─────────────────────────────────────────────
// Reel Trouble — Main Application
// React (CDN) + SQL.js game engine
// ──────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback } = React;

// ── Constants ──
const RANKS = [
  { threshold: 0, name: "Intern" },
  { threshold: 500, name: "Junior Analyst" },
  { threshold: 1500, name: "Senior Analyst" },
  { threshold: 3000, name: "Lead Analyst" },
  { threshold: 5000, name: "The Detective" }
];

const STORAGE_KEY = "reel_trouble_save";
const MOBILE_BREAKPOINT = 820;
const SQL_JS_VERSION = "1.10.3";
const SQL_WASM_CDN_BASE = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/`;
const SQL_WASM_SCRIPT_URL = `${SQL_WASM_CDN_BASE}sql-wasm.js`;
const SQL_ASM_SCRIPT_URL = `https://cdnjs.cloudflare.com/ajax/libs/sql.js/${SQL_JS_VERSION}/sql-asm.js`;
const TABLES = [
  "actor", "address", "category", "city", "country", "customer",
  "film", "film_actor", "film_category", "film_text", "inventory",
  "language", "payment", "rental", "staff", "store"
];

let sqlJsLoaderPromise = null;

function appendScriptOnce(src, isReady = null) {
  if (typeof isReady === 'function' && isReady()) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find(script => script.src === src);
    const script = existing || document.createElement('script');
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out loading ${src}`));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    }

    function handleLoad() {
      script.dataset.loaded = 'true';
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error(`Failed to load ${src}`));
    }

    if (existing?.dataset.loaded === 'true') {
      cleanup();
      resolve();
      return;
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (typeof isReady === 'function' && isReady()) {
      script.dataset.loaded = 'true';
      cleanup();
      resolve();
      return;
    }

    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

async function loadSqlJsLibrary() {
  if (sqlJsLoaderPromise) return sqlJsLoaderPromise;

  sqlJsLoaderPromise = (async () => {
    let wasmError = null;

    try {
      await appendScriptOnce(SQL_WASM_SCRIPT_URL, () => typeof window.initSqlJs === 'function');
      const SQL = await window.initSqlJs({
        locateFile: file => `${SQL_WASM_CDN_BASE}${file}`
      });
      return { SQL, engine: 'wasm' };
    } catch (error) {
      wasmError = error;
      console.warn("SQL.js WASM load failed, falling back to asm.js.", error);
    }

    try {
      await appendScriptOnce(SQL_ASM_SCRIPT_URL);
      const SQL = await window.initSqlJs();
      return { SQL, engine: 'asm' };
    } catch (asmError) {
      const message = [
        "Unable to load the SQL engine.",
        wasmError?.message,
        asmError?.message
      ].filter(Boolean).join(" ");
      throw new Error(message);
    }
  })();

  try {
    return await sqlJsLoaderPromise;
  } catch (error) {
    sqlJsLoaderPromise = null;
    throw error;
  }
}

function getAssetCandidateUrls(relativePath) {
  const candidates = [new URL(relativePath, window.location.href).toString()];
  const pathSegments = window.location.pathname.split('/').filter(Boolean);

  if (pathSegments.length > 0) {
    candidates.push(`${window.location.origin}/${pathSegments[0]}/${relativePath}`);
  }

  candidates.push(`${window.location.origin}/${relativePath}`);
  return [...new Set(candidates)];
}

async function fetchTextWithFallback(relativePath) {
  let lastError = null;

  for (const url of getAssetCandidateUrls(relativePath)) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      lastError = new Error(`Failed to load ${relativePath} from ${url}: ${error.message}`);
    }
  }

  throw lastError || new Error(`Failed to load ${relativePath}`);
}

function getRank(xp) {
  let rank = RANKS[0].name;
  for (const r of RANKS) {
    if (xp >= r.threshold) rank = r.name;
  }
  return rank;
}

function getNextRankXP(xp) {
  for (const r of RANKS) {
    if (xp < r.threshold) return r.threshold;
  }
  return RANKS[RANKS.length - 1].threshold;
}

function isQuestionResolved(progress, questionId) {
  return !!progress.completedQuestions?.[questionId] || !!progress.skippedQuestions?.[questionId];
}

function getFirstUnresolvedQuestionIndex(caseData, progress) {
  return caseData.questions.findIndex(q => !isQuestionResolved(progress, q.id));
}

function getFirstSkippedQuestionIndex(caseData, progress) {
  return caseData.questions.findIndex(q => !!progress.skippedQuestions?.[q.id]);
}

function getPreferredQuestionIndex(caseData, progress, fallback = 0) {
  const unresolvedIdx = getFirstUnresolvedQuestionIndex(caseData, progress);
  if (unresolvedIdx >= 0) return unresolvedIdx;

  const skippedIdx = getFirstSkippedQuestionIndex(caseData, progress);
  if (skippedIdx >= 0) return skippedIdx;

  return fallback;
}

function isCaseResolved(caseData, progress) {
  return caseData.questions.every(q => isQuestionResolved(progress, q.id));
}

function hasSavedProgress(progress) {
  return (
    progress.totalXP > 0 ||
    Object.keys(progress.completedQuestions || {}).length > 0 ||
    Object.keys(progress.skippedQuestions || {}).length > 0 ||
    progress.currentCase > 0 ||
    progress.currentQuestion > 0 ||
    (progress.unlockedCases || []).length > 1
  );
}

function allCasesResolved(progress) {
  return window.CASES.every(caseData => isCaseResolved(caseData, progress));
}

function getResumeCaseIndex(progress) {
  const savedCaseIdx = Math.min(Math.max(progress.currentCase || 0, 0), window.CASES.length - 1);
  const savedCase = window.CASES[savedCaseIdx];

  if (savedCase && !isCaseResolved(savedCase, progress)) {
    return savedCaseIdx;
  }

  const firstOpenCaseIdx = window.CASES.findIndex(caseData => !isCaseResolved(caseData, progress));
  return firstOpenCaseIdx >= 0 ? firstOpenCaseIdx : savedCaseIdx;
}

function getResumeQuestionIndex(caseData, progress) {
  const savedQuestionIdx = Math.min(
    Math.max(progress.currentQuestion || 0, 0),
    caseData.questions.length - 1
  );
  const savedQuestion = caseData.questions[savedQuestionIdx];

  if (savedQuestion && !isQuestionResolved(progress, savedQuestion.id)) {
    return savedQuestionIdx;
  }

  return getPreferredQuestionIndex(caseData, progress, savedQuestionIdx);
}

// ── Progress Hook ──
function useProgress() {
  const defaultState = {
    currentCase: 0,
    currentQuestion: 0,
    totalXP: 0,
    streak: 0,
    completedQuestions: {},
    skippedQuestions: {},
    unlockedCases: [0]
  };

  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultState;
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) {}
  }, [progress]);

  const updateProgress = useCallback((updates) => {
    setProgress(prev => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(defaultState);
  }, []);

  return { progress, updateProgress, resetProgress };
}

// ── SQL.js Hook ──
function useSqlJs() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const { SQL, engine } = await loadSqlJsLibrary();
        const database = new SQL.Database();
        console.info(`SQL.js initialized with ${engine}.`);

        // Create tables
        const createStatements = {
          actor: `CREATE TABLE actor (actor_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, last_update TEXT)`,
          address: `CREATE TABLE address (address_id INTEGER PRIMARY KEY, address TEXT, address2 TEXT, district TEXT, city_id INTEGER, postal_code TEXT, phone TEXT, last_update TEXT)`,
          category: `CREATE TABLE category (category_id INTEGER PRIMARY KEY, name TEXT, last_update TEXT)`,
          city: `CREATE TABLE city (city_id INTEGER PRIMARY KEY, city TEXT, country_id INTEGER, last_update TEXT)`,
          country: `CREATE TABLE country (country_id INTEGER PRIMARY KEY, country TEXT, last_update TEXT)`,
          customer: `CREATE TABLE customer (customer_id INTEGER PRIMARY KEY, store_id INTEGER, first_name TEXT, last_name TEXT, email TEXT, address_id INTEGER, active INTEGER, create_date TEXT, last_update TEXT)`,
          film: `CREATE TABLE film (film_id INTEGER PRIMARY KEY, title TEXT, description TEXT, release_year INTEGER, language_id INTEGER, original_language_id INTEGER, rental_duration INTEGER, rental_rate REAL, length INTEGER, replacement_cost REAL, rating TEXT, special_features TEXT, last_update TEXT)`,
          film_actor: `CREATE TABLE film_actor (actor_id INTEGER, film_id INTEGER, last_update TEXT)`,
          film_category: `CREATE TABLE film_category (film_id INTEGER, category_id INTEGER, last_update TEXT)`,
          film_text: `CREATE TABLE film_text (film_id INTEGER PRIMARY KEY, title TEXT, description TEXT)`,
          inventory: `CREATE TABLE inventory (inventory_id INTEGER PRIMARY KEY, film_id INTEGER, store_id INTEGER, last_update TEXT)`,
          language: `CREATE TABLE language (language_id INTEGER PRIMARY KEY, name TEXT, last_update TEXT)`,
          payment: `CREATE TABLE payment (payment_id INTEGER PRIMARY KEY, customer_id INTEGER, staff_id INTEGER, rental_id INTEGER, amount REAL, payment_date TEXT, last_update TEXT)`,
          rental: `CREATE TABLE rental (rental_id INTEGER PRIMARY KEY, rental_date TEXT, inventory_id INTEGER, customer_id INTEGER, return_date TEXT, staff_id INTEGER, last_update TEXT)`,
          staff: `CREATE TABLE staff (staff_id INTEGER PRIMARY KEY, first_name TEXT, last_name TEXT, address_id INTEGER, email TEXT, store_id INTEGER, active INTEGER, username TEXT, password TEXT, last_update TEXT)`,
          store: `CREATE TABLE store (store_id INTEGER PRIMARY KEY, manager_staff_id INTEGER, address_id INTEGER, last_update TEXT)`
        };

        for (const table of TABLES) {
          database.run(createStatements[table]);
        }

        // Load data from TSV files
        for (let i = 0; i < TABLES.length; i++) {
          const table = TABLES[i];
          setLoadProgress(Math.round((i / TABLES.length) * 100));

          const text = await fetchTextWithFallback(`public/data/${table}.csv`);
          const lines = text.trim().split('\n');
          if (lines.length < 2) continue;

          const headers = lines[0].split('\t');
          const colCount = headers.length;

          // Batch insert
          const placeholders = headers.map(() => '?').join(',');
          const insertSql = `INSERT INTO ${table} (${headers.join(',')}) VALUES (${placeholders})`;

          database.run("BEGIN TRANSACTION");
          for (let j = 1; j < lines.length; j++) {
            const vals = lines[j].split('\t');
            if (vals.length !== colCount) continue;
            const cleaned = vals.map(v => v === 'NULL' || v === '' ? null : v);
            try { database.run(insertSql, cleaned); } catch (e) { /* skip bad rows */ }
          }
          database.run("COMMIT");
        }

        setLoadProgress(100);
        setDb(database);
        setLoading(false);
      } catch (e) {
        console.error("SQL.js init error:", e);
        setError(e.message);
        setLoading(false);
      }
    }
    init();
  }, []);

  const runQuery = useCallback((sql) => {
    if (!db) return { error: "Database not loaded" };
    try {
      const results = db.exec(sql);
      if (results.length === 0) return { columns: [], rows: [] };
      return { columns: results[0].columns, rows: results[0].values };
    } catch (e) {
      return { error: e.message };
    }
  }, [db]);

  return { db, loading, loadProgress, error, runQuery };
}

// ── Validation ──
function validateAnswer(userResult, question) {
  if (userResult.error) return { correct: false, message: userResult.error };
  if (!userResult.columns || !userResult.rows) return { correct: false, message: "No results returned." };

  const expected = question.expected_columns;
  const userCols = userResult.columns.map(c => c.toLowerCase());
  const expectedCols = expected.map(c => c.toLowerCase());

  // Check columns match
  if (userCols.length !== expectedCols.length) {
    return { correct: false, message: `Expected ${expectedCols.length} columns (${expected.join(', ')}), got ${userCols.length} (${userResult.columns.join(', ')}).` };
  }
  for (let i = 0; i < expectedCols.length; i++) {
    if (userCols[i] !== expectedCols[i]) {
      return { correct: false, message: `Column mismatch: expected "${expected[i]}", got "${userResult.columns[i]}".` };
    }
  }

  return { correct: true, message: "Correct!" };
}

function fullValidate(userResult, expectedResult, question) {
  const colCheck = validateAnswer(userResult, question);
  if (!colCheck.correct) return colCheck;

  // Compare actual data
  const userRows = userResult.rows;
  const expectedRows = expectedResult.rows;

  if (question.match_type === "exact") {
    if (userRows.length !== expectedRows.length) {
      return { correct: false, message: `Expected ${expectedRows.length} rows, got ${userRows.length}.` };
    }
    for (let i = 0; i < expectedRows.length; i++) {
      for (let j = 0; j < expectedRows[i].length; j++) {
        if (String(userRows[i]?.[j] ?? '') !== String(expectedRows[i]?.[j] ?? '')) {
          return { correct: false, message: `Row ${i + 1} doesn't match expected result. Check your query logic.` };
        }
      }
    }
  } else if (question.match_type === "order_insensitive") {
    if (userRows.length !== expectedRows.length) {
      return { correct: false, message: `Expected ${expectedRows.length} rows, got ${userRows.length}.` };
    }
    const sortFn = (a, b) => String(a).localeCompare(String(b));
    const userSorted = userRows.map(r => r.map(String).join('|')).sort(sortFn);
    const expectedSorted = expectedRows.map(r => r.map(String).join('|')).sort(sortFn);
    for (let i = 0; i < userSorted.length; i++) {
      if (userSorted[i] !== expectedSorted[i]) {
        return { correct: false, message: "The rows don't match the expected result. Check your query logic." };
      }
    }
  } else if (question.match_type === "top_n") {
    if (userRows.length < expectedRows.length) {
      return { correct: false, message: `Expected at least ${expectedRows.length} rows, got ${userRows.length}.` };
    }
    for (let i = 0; i < expectedRows.length; i++) {
      for (let j = 0; j < expectedRows[i].length; j++) {
        if (String(userRows[i]?.[j] ?? '') !== String(expectedRows[i]?.[j] ?? '')) {
          return { correct: false, message: `Row ${i + 1} doesn't match. Check your ordering.` };
        }
      }
    }
  }

  return { correct: true, message: "Correct!" };
}

// ── Components ──

function LoadingScreen({ progress }) {
  return React.createElement('div', { className: 'loading-screen*&��^u�+n����