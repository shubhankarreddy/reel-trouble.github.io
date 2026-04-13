// ─────────────────────────────────────────────
// Reel Trouble — Main Application
// React (CDN) + SQL.js game engine
// ─────────────────────────────────────────────

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
        const SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
        });
        const database = new SQL.Database();

        const tables = [
          "actor", "address", "category", "city", "country", "customer",
          "film", "film_actor", "film_category", "film_text", "inventory",
          "language", "payment", "rental", "staff", "store"
        ];

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

        for (const table of tables) {
          database.run(createStatements[table]);
        }

        // Load data from TSV files
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
          setLoadProgress(Math.round(((i) / tables.length) * 100));

          const resp = await fetch(`public/data/${table}.csv`);
          const text = await resp.text();
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
  return React.createElement('div', { className: 'loading-screen' },
    React.createElement('h1', null, 'Reel Trouble'),
    React.createElement('p', null, 'Loading Sakila database...'),
    React.createElement('div', { className: 'loading-bar-track' },
      React.createElement('div', { className: 'loading-bar-fill', style: { width: `${progress}%` } })
    ),
    React.createElement('p', null, `${progress}%`)
  );
}

function TopBar({ caseData, progress, onHome, onToggleSchema }) {
  const rank = getRank(progress.totalXP);
  const nextRankXP = getNextRankXP(progress.totalXP);
  const prevRankXP = RANKS.reduce((acc, r) => progress.totalXP >= r.threshold ? r.threshold : acc, 0);
  const pct = nextRankXP > prevRankXP ? ((progress.totalXP - prevRankXP) / (nextRankXP - prevRankXP)) * 100 : 100;
  const homeLabel = caseData ? `Home / Case ${caseData.id}` : 'Home';

  return React.createElement('div', { className: 'top-bar' },
    React.createElement('div', { className: 'top-bar-head' },
      React.createElement('div', { className: 'top-bar-copy' },
        React.createElement('span', { className: 'case-label' }, caseData ? `Case ${caseData.id}: ${caseData.title}` : 'Reel Trouble'),
        caseData && React.createElement('span', { className: 'case-subtitle' }, caseData.subtitle)
      ),
      React.createElement('div', { className: 'top-bar-badges' },
        React.createElement('span', { className: 'rank-badge' }, rank),
        progress.streak >= 3 && React.createElement('span', { className: 'streak-badge' }, `${progress.streak} streak`)
      )
    ),
    React.createElement('div', { className: 'top-bar-progress' },
      React.createElement('span', { className: 'xp-text' }, `${progress.totalXP} XP`),
      React.createElement('div', { className: 'xp-bar-track' },
        React.createElement('div', { className: 'xp-bar-fill', style: { width: `${Math.min(pct, 100)}%` } })
      )
    ),
    React.createElement('div', { className: 'top-bar-actions' },
      React.createElement('button', {
        type: 'button',
        className: 'btn btn-top-bar btn-top-bar-secondary',
        onClick: onHome
      }, homeLabel),
      React.createElement('button', {
        type: 'button',
        className: 'btn btn-top-bar',
        onClick: onToggleSchema
      }, 'Schema')
    )
  );
}

function CaseBrief({ text }) {
  const [open, setOpen] = useState(false);
  return React.createElement('div', { className: 'case-brief' },
    React.createElement('button', { className: 'case-brief-toggle', onClick: () => setOpen(!open) },
      React.createElement('span', { className: `chevron ${open ? 'open' : ''}` }, '\u25B6'),
      "Frank's Brief"
    ),
    open && React.createElement('div', { className: 'case-brief-body fade-in' }, text)
  );
}

function QuestionCard({ question, caseId, isCompleted, isSkipped, hintsUsed, onUseHint }) {
  return React.createElement('div', { className: 'question-card fade-in', style: { position: 'relative' } },
    isCompleted && React.createElement('div', { className: 'solved-stamp stamp-animate' }, 'SOLVED'),
    React.createElement('div', { className: 'question-header' },
      React.createElement('div', null,
        React.createElement('span', { className: 'question-number' }, `Case ${caseId} \u00B7 Question ${parseInt(question.id.replace(/c\dq/, ''))}`),
        React.createElement('span', { className: `band-tag ${question.band}`, style: { marginLeft: '0.5rem' } }, question.band),
        isSkipped && !isCompleted && React.createElement('span', {
          className: 'question-state skipped',
          style: { marginLeft: '0.5rem' }
        }, 'Skipped earlier')
      )
    ),
    React.createElement('h2', { className: 'question-title' }, question.title),
    React.createElement('div', { className: 'memo-card' },
      React.createElement('p', null, question.narrative)
    ),
    React.createElement('p', { className: 'task-text' }, question.task),
    React.createElement('div', { className: 'hints-section' },
      question.hints.map((hint, i) =>
        React.createElement('div', { key: i },
          hintsUsed > i
            ? React.createElement('div', { className: 'hint-text fade-in' }, `Hint ${i + 1}: ${hint}`)
            : React.createElement('button', {
                className: 'hint-btn',
                onClick: () => onUseHint(i),
                disabled: i > 0 && hintsUsed < i
              }, `Hint ${i + 1} (-25 XP)`)
        )
      )
    )
  );
}

function ProgressDots({ questions, completedQuestions, skippedQuestions, currentIdx, onSelect }) {
  return React.createElement('div', { className: 'progress-section' },
    questions.map((q, i) => {
      const done = !!completedQuestions[q.id];
      const skipped = !!skippedQuestions[q.id];
      const isCurrent = i === currentIdx;
      return React.createElement('div', {
        key: q.id,
        className: `progress-dot ${done ? 'completed' : ''} ${skipped ? 'skipped' : ''} ${isCurrent ? 'current' : ''}`,
        onClick: () => onSelect(i),
        title: `${q.title}${done ? ' (solved)' : skipped ? ' (skipped)' : ''}`
      }, i + 1);
    })
  );
}

function ResultsTable({ result }) {
  if (!result) return React.createElement('div', { className: 'results-empty' }, 'Run a query to see results');
  if (result.error) return React.createElement('div', { className: 'results-error' }, result.error);
  if (!result.columns || result.columns.length === 0) return React.createElement('div', { className: 'results-empty' }, 'Query returned no results');

  const maxRows = 200;
  const displayRows = result.rows.slice(0, maxRows);

  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', height: '100%' } },
    React.createElement('div', { className: 'results-header' },
      React.createElement('span', null, `${result.rows.length} rows${result.rows.length > maxRows ? ` (showing ${maxRows})` : ''}`),
      React.createElement('span', null, `${result.columns.length} columns`)
    ),
    React.createElement('div', { className: 'results-table-wrap' },
      React.createElement('table', { className: 'results-table' },
        React.createElement('thead', null,
          React.createElement('tr', null,
            result.columns.map((col, i) => React.createElement('th', { key: i }, col))
          )
        ),
        React.createElement('tbody', null,
          displayRows.map((row, i) =>
            React.createElement('tr', { key: i },
              row.map((cell, j) => React.createElement('td', { key: j }, cell === null ? 'NULL' : String(cell)))
            )
          )
        )
      )
    )
  );
}

function SchemaPanel({ onClose }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (name) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  return React.createElement('div', { className: 'schema-overlay', onClick: onClose },
    React.createElement('div', { className: 'schema-panel', onClick: e => e.stopPropagation() },
      React.createElement('div', { className: 'schema-header' },
        React.createElement('h2', null, 'Schema Reference'),
        React.createElement('button', {
          type: 'button',
          className: 'schema-close-btn',
          onClick: onClose
        }, 'Close')
      ),
      React.createElement('div', { className: 'schema-content' },
        window.SCHEMA.map(table =>
          React.createElement('div', { key: table.name, className: 'schema-table-block' },
            React.createElement('div', { className: 'schema-table-name', onClick: () => toggle(table.name) },
              React.createElement('span', null, expanded[table.name] ? '\u25BC' : '\u25B6'),
              table.name
            ),
            expanded[table.name] && React.createElement('div', { className: 'schema-columns fade-in' },
              table.columns.map(col =>
                React.createElement('div', { key: col.name, className: 'schema-col' },
                  React.createElement('span', { className: 'col-name' }, col.name),
                  React.createElement('span', { className: 'col-type' }, col.type),
                  col.pk && React.createElement('span', { className: 'col-pk' }, 'PK'),
                  col.fk && React.createElement('span', { className: 'col-fk' }, `\u2192 ${col.fk}`)
                )
              )
            )
          )
        )
      )
    )
  );
}

function CaseIntro({ caseData, onStart, onBack }) {
  return React.createElement('div', { className: 'overlay-screen' },
    React.createElement('div', { className: 'overlay-card fade-in' },
      React.createElement('div', { className: 'case-num' }, `Case ${caseData.id} of 7`),
      React.createElement('h1', null, caseData.title),
      React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } }, caseData.subtitle),
      React.createElement('p', { className: 'narrative' }, caseData.opening),
      React.createElement('p', { style: { fontSize: '0.8rem', color: 'var(--text-secondary)' } },
        `Tables: ${caseData.tables.join(', ')}`
      ),
      React.createElement('div', { className: 'overlay-actions' },
        React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: onBack }, 'Back to Cases'),
        React.createElement('button', { type: 'button', className: 'btn btn-submit', onClick: onStart }, 'Start Investigation')
      )
    )
  );
}

function CaseComplete({ caseData, stats, onContinue, onHome, isLast }) {
  return React.createElement('div', { className: 'overlay-screen' },
    React.createElement('div', { className: 'overlay-card fade-in' },
      React.createElement('div', { className: 'case-num' }, `Case ${caseData.id} Complete`),
      React.createElement('h1', null, caseData.title),
      React.createElement('div', { className: 'stats-row' },
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'stat-value' }, stats.questionsAnswered),
          React.createElement('div', { className: 'stat-label' }, 'Answered')
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'stat-value' }, stats.xpEarned),
          React.createElement('div', { className: 'stat-label' }, 'XP Earned')
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'stat-value' }, stats.skippedCount),
          React.createElement('div', { className: 'stat-label' }, 'Skipped')
        ),
        React.createElement('div', { className: 'stat' },
          React.createElement('div', { className: 'stat-value' }, stats.perfectAnswers),
          React.createElement('div', { className: 'stat-label' }, 'First Try')
        )
      ),
      React.createElement('p', { className: 'narrative' }, caseData.closing),
      React.createElement('div', { className: 'overlay-actions' },
        React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: onHome }, 'Back to Cases'),
        React.createElement('button', { type: 'button', className: 'btn btn-next', onClick: onContinue },
          isLast ? 'See Final Results' : 'Next Case'
        )
      )
    )
  );
}

function CaseSelect({ progress, onSelectCase, onReset }) {
  return React.createElement('div', { className: 'case-select-screen' },
    React.createElement('h1', null, 'Reel Trouble'),
    React.createElement('p', { className: 'tagline' }, 'SQL mysteries at Sakila Video'),
    React.createElement('div', { style: { display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'center' } },
      React.createElement('span', { className: 'rank-badge', style: { fontSize: '0.85rem', padding: '0.3rem 0.8rem' } },
        getRank(progress.totalXP)
      ),
      React.createElement('span', { className: 'xp-text' }, `${progress.totalXP} XP`)
    ),
    React.createElement('div', { className: 'case-grid' },
      window.CASES.map((c, i) => {
        const unlocked = progress.unlockedCases.includes(i);
        const questions = c.questions;
        const answered = questions.filter(q => progress.completedQuestions[q.id]).length;
        const skipped = questions.filter(q => progress.skippedQuestions?.[q.id]).length;
        const resolved = answered + skipped;
        const completed = resolved === questions.length;
        const progressText = !unlocked
          ? 'Locked'
          : skipped > 0
            ? `${resolved} / ${questions.length} resolved · ${skipped} skipped`
            : `${answered} / ${questions.length} answered`;
        return React.createElement('div', {
          key: c.id,
          className: `case-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''}`,
          onClick: () => unlocked && onSelectCase(i)
        },
          React.createElement('div', { className: 'card-num' }, `Case ${c.id}`),
          React.createElement('h3', null, c.title),
          React.createElement('div', { className: 'card-sub' }, c.subtitle),
          React.createElement('div', { className: 'card-progress' },
            progressText
          )
        );
      })
    ),
    React.createElement('div', { className: 'reset-link', onClick: onReset }, 'Reset all progress')
  );
}

function GameComplete({ progress, onReset, onHome }) {
  return React.createElement('div', { className: 'game-complete' },
    React.createElement('h1', null, 'Case Closed'),
    React.createElement('div', { className: 'final-rank' }, getRank(progress.totalXP)),
    React.createElement('div', { className: 'final-xp' }, `${progress.totalXP} XP`),
    React.createElement('p', null, window.CASES[6].closing),
    React.createElement('div', { className: 'overlay-actions' },
      React.createElement('button', { type: 'button', className: 'btn btn-secondary', onClick: onHome }, 'Back to Cases'),
      React.createElement('button', { type: 'button', className: 'btn btn-submit', onClick: onReset }, 'Play Again')
    )
  );
}

// ── Main App ──
function App() {
  const { db, loading, loadProgress, error, runQuery } = useSqlJs();
  const { progress, updateProgress, resetProgress } = useProgress();

  // View states: 'select' | 'intro' | 'playing' | 'case-complete' | 'game-complete'
  const [view, setView] = useState('select');
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [sqlText, setSqlText] = useState('');
  const [result, setResult] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showSchema, setShowSchema] = useState(false);
  const textareaRef = useRef(null);
  const didBootstrapRef = useRef(false);

  const currentCase = window.CASES[activeCaseIdx];
  const currentQuestion = currentCase?.questions[activeQuestionIdx];
  const isQuestionCompleted = currentQuestion ? !!progress.completedQuestions[currentQuestion.id] : false;
  const isQuestionSkipped = currentQuestion ? !!progress.skippedQuestions?.[currentQuestion.id] : false;

  // Focus textarea when question changes
  useEffect(() => {
    if (view === 'playing' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeQuestionIdx, view]);

  useEffect(() => {
    if (view !== 'playing' && showSchema) {
      setShowSchema(false);
    }
  }, [showSchema, view]);

  useEffect(() => {
    if (loading || didBootstrapRef.current) return;
    didBootstrapRef.current = true;

    if (!hasSavedProgress(progress)) return;

    if (allCasesResolved(progress)) {
      setView('game-complete');
      return;
    }

    const resumeCaseIdx = getResumeCaseIndex(progress);
    const resumeCase = window.CASES[resumeCaseIdx];
    const resumeQuestionIdx = getResumeQuestionIndex(resumeCase, progress);
    const resumeQuestionId = resumeCase.questions[resumeQuestionIdx]?.id;

    setActiveCaseIdx(resumeCaseIdx);
    setActiveQuestionIdx(resumeQuestionIdx);
    setHintsUsed(progress.completedQuestions[resumeQuestionId]?.hintsUsed || 0);
    setView('playing');
  }, [loading, progress]);

  function handleSelectCase(idx) {
    setActiveCaseIdx(idx);
    const caseQuestions = window.CASES[idx].questions;
    const preferredQuestionIdx = getPreferredQuestionIndex(window.CASES[idx], progress, 0);
    const preferredQuestionId = caseQuestions[preferredQuestionIdx]?.id;

    setActiveQuestionIdx(preferredQuestionIdx);
    setSqlText('');
    setResult(null);
    setFeedback(null);
    setHintsUsed(progress.completedQuestions[preferredQuestionId]?.hintsUsed || 0);
    setAttempts(0);
    updateProgress({ currentCase: idx, currentQuestion: preferredQuestionIdx });
    setView('intro');
  }

  function handleStartCase() {
    setView('playing');
  }

  function handleGoHome() {
    setShowSchema(false);
    setResult(null);
    setFeedback(null);
    setSqlText('');
    setView('select');
  }

  function handleRun() {
    if (!sqlText.trim()) return;
    const res = runQuery(sqlText.trim());
    setResult(res);
    setFeedback(null);
  }

  function handleSubmit() {
    if (!sqlText.trim() || !currentQuestion) return;

    const userResult = runQuery(sqlText.trim());
    setResult(userResult);

    if (userResult.error) {
      setFeedback({ correct: false, message: userResult.error });
      return;
    }

    // Run the expected query
    const expectedResult = runQuery(currentQuestion.sql);
    if (expectedResult.error) {
      setFeedback({ correct: false, message: "Internal error running expected query. Please try again." });
      return;
    }

    const validation = fullValidate(userResult, expectedResult, currentQuestion);
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (validation.correct) {
      // Calculate XP
      let xp = 100;
      if (newAttempts === 1) xp += 50; // first attempt bonus
      // Clean query bonus: no SELECT *, no extra columns
      const userSql = sqlText.toLowerCase();
      if (!userSql.includes('select *') && userResult.columns.length === currentQuestion.expected_columns.length) {
        xp += 25;
      }
      xp -= hintsUsed * 25;
      // Streak multiplier
      const newStreak = progress.streak + 1;
      if (progress.streak >= 3) xp = Math.round(xp * 1.5);
      xp = Math.max(xp, 0);

      const newCompleted = {
        ...progress.completedQuestions,
        [currentQuestion.id]: { xp, attempts: newAttempts, hintsUsed }
      };
      const newSkipped = { ...(progress.skippedQuestions || {}) };
      delete newSkipped[currentQuestion.id];
      const progressSnapshot = {
        ...progress,
        completedQuestions: newCompleted,
        skippedQuestions: newSkipped
      };

      // Check if case is now complete
      const allDone = isCaseResolved(currentCase, progressSnapshot);

      // Unlock next case
      const newUnlocked = [...progress.unlockedCases];
      if (allDone && activeCaseIdx + 1 < window.CASES.length && !newUnlocked.includes(activeCaseIdx + 1)) {
        newUnlocked.push(activeCaseIdx + 1);
      }

      updateProgress({
        totalXP: progress.totalXP + xp,
        streak: newStreak,
        completedQuestions: newCompleted,
        skippedQuestions: newSkipped,
        currentCase: activeCaseIdx,
        currentQuestion: activeQuestionIdx,
        unlockedCases: newUnlocked
      });

      setFeedback({ correct: true, message: `Correct! +${xp} XP`, xp });
    } else {
      updateProgress({ streak: 0 });
      setFeedback({ correct: false, message: validation.message });
    }
  }

  function handleSkip() {
    if (!currentQuestion) return;

    if (progress.completedQuestions[currentQuestion.id]) {
      goToNextQuestion(progress);
      return;
    }

    const newSkipped = {
      ...(progress.skippedQuestions || {}),
      [currentQuestion.id]: true
    };

    updateProgress({ streak: 0, skippedQuestions: newSkipped });
    goToNextQuestion({ ...progress, streak: 0, skippedQuestions: newSkipped });
  }

  function handleNextAfterCorrect() {
    const allDone = isCaseResolved(currentCase, progress);
    if (allDone) {
      if (activeCaseIdx >= window.CASES.length - 1) {
        setView('game-complete');
      } else {
        setView('case-complete');
      }
    } else {
      goToNextQuestion();
    }
  }

  function goToNextQuestion(progressSnapshot = progress) {
    const caseQuestions = currentCase.questions;
    let nextIdx = activeQuestionIdx + 1;
    if (nextIdx >= caseQuestions.length) {
      // Check if all done
      const allDone = isCaseResolved(currentCase, progressSnapshot);
      if (allDone) {
        if (activeCaseIdx >= window.CASES.length - 1) {
          setView('game-complete');
        } else {
          setView('case-complete');
        }
        return;
      }
      // Find first unresolved
      nextIdx = caseQuestions.findIndex(q => !isQuestionResolved(progressSnapshot, q.id));
      if (nextIdx < 0) nextIdx = 0;
    }

    const nextQuestionId = caseQuestions[nextIdx]?.id;
    setActiveQuestionIdx(nextIdx);
    setSqlText('');
    setResult(null);
    setFeedback(null);
    setHintsUsed(progressSnapshot.completedQuestions[nextQuestionId]?.hintsUsed || 0);
    setAttempts(0);
    updateProgress({ currentCase: activeCaseIdx, currentQuestion: nextIdx });
  }

  function handleSelectQuestion(idx) {
    const questionId = currentCase.questions[idx]?.id;
    setActiveQuestionIdx(idx);
    setSqlText('');
    setResult(null);
    setFeedback(null);
    setHintsUsed(progress.completedQuestions[questionId]?.hintsUsed || 0);
    setAttempts(0);
    updateProgress({ currentCase: activeCaseIdx, currentQuestion: idx });
  }

  function handleUseHint(hintIdx) {
    if (hintIdx <= hintsUsed) setHintsUsed(hintIdx + 1);
  }

  function handleCaseComplete() {
    const nextIdx = activeCaseIdx + 1;
    if (nextIdx >= window.CASES.length) {
      setView('game-complete');
    } else {
      handleSelectCase(nextIdx);
    }
  }

  function handleKeyDown(e) {
    // Ctrl/Cmd + Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      setSqlText(value.substring(0, start) + '  ' + value.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  }

  function getCaseStats() {
    const questions = currentCase.questions;
    const answered = questions.filter(q => progress.completedQuestions[q.id]);
    const skipped = questions.filter(q => progress.skippedQuestions?.[q.id]);
    return {
      questionsAnswered: answered.length,
      skippedCount: skipped.length,
      xpEarned: answered.reduce((sum, q) => sum + (progress.completedQuestions[q.id]?.xp || 0), 0),
      perfectAnswers: answered.filter(q => progress.completedQuestions[q.id]?.attempts === 1).length
    };
  }

  // ── Render ──
  if (loading) return React.createElement(LoadingScreen, { progress: loadProgress });
  if (error) return React.createElement('div', { className: 'loading-screen' },
    React.createElement('h1', null, 'Error'),
    React.createElement('p', null, error)
  );

  if (view === 'select') {
    return React.createElement(CaseSelect, {
      progress,
      onSelectCase: handleSelectCase,
      onReset: () => { resetProgress(); setView('select'); }
    });
  }

  if (view === 'game-complete') {
    return React.createElement(GameComplete, {
      progress,
      onReset: () => { resetProgress(); setView('select'); },
      onHome: handleGoHome
    });
  }

  if (view === 'intro') {
    return React.createElement(React.Fragment, null,
      React.createElement(CaseIntro, { caseData: currentCase, onStart: handleStartCase, onBack: handleGoHome })
    );
  }

  if (view === 'case-complete') {
    return React.createElement(CaseComplete, {
      caseData: currentCase,
      stats: getCaseStats(),
      onContinue: handleCaseComplete,
      onHome: handleGoHome,
      isLast: activeCaseIdx >= window.CASES.length - 1
    });
  }

  // Playing view
  return React.createElement('div', { id: 'game' },
    React.createElement(TopBar, {
      caseData: currentCase,
      progress,
      onHome: handleGoHome,
      onToggleSchema: () => setShowSchema(prev => !prev)
    }),
    React.createElement('div', { className: 'main-layout' },
      // Left panel
      React.createElement('div', { className: 'left-panel' },
        React.createElement(CaseBrief, { text: currentCase.opening }),
        currentQuestion && React.createElement(QuestionCard, {
          question: currentQuestion,
          caseId: currentCase.id,
          isCompleted: isQuestionCompleted,
          isSkipped: isQuestionSkipped,
          hintsUsed,
          onUseHint: handleUseHint
        }),
        React.createElement(ProgressDots, {
          questions: currentCase.questions,
          completedQuestions: progress.completedQuestions,
          skippedQuestions: progress.skippedQuestions || {},
          currentIdx: activeQuestionIdx,
          onSelect: handleSelectQuestion
        })
      ),
      // Right panel
      React.createElement('div', { className: 'right-panel' },
        React.createElement('div', { className: 'editor-section' },
          React.createElement('div', { className: 'editor-toolbar' },
            React.createElement('div', { className: 'editor-toolbar-left' }, 'SQL Editor \u00B7 Ctrl+Enter to run'),
            React.createElement('div', { className: 'editor-toolbar-right' },
              React.createElement('button', { className: 'btn btn-skip', onClick: handleSkip }, 'Skip'),
              React.createElement('button', { className: 'btn btn-run', onClick: handleRun }, '\u25B6 Run'),
              !isQuestionCompleted
                ? React.createElement('button', {
                    className: 'btn btn-submit',
                    onClick: handleSubmit,
                    disabled: !sqlText.trim()
                  }, 'Submit')
                : React.createElement('button', {
                    className: 'btn btn-next',
                    onClick: handleNextAfterCorrect
                  }, 'Next \u2192')
            )
          ),
          React.createElement('div', { className: 'sql-editor-wrapper' },
            React.createElement('textarea', {
              ref: textareaRef,
              className: 'sql-textarea',
              value: sqlText,
              onChange: e => setSqlText(e.target.value),
              onKeyDown: handleKeyDown,
              placeholder: 'Write your SQL query here...',
              spellCheck: false
            })
          ),
          feedback && React.createElement('div', { className: `feedback ${feedback.correct ? 'correct' : 'wrong'}` },
            React.createElement('span', null, feedback.correct ? '\u2713' : '\u2717'),
            React.createElement('span', null, feedback.message),
            feedback.xp && React.createElement('span', { className: 'xp-earned' }, `+${feedback.xp} XP`)
          ),
          React.createElement('div', { className: 'results-section' },
            React.createElement(ResultsTable, { result })
          )
        )
      )
    ),
    showSchema && React.createElement(SchemaPanel, { onClose: () => setShowSchema(false) })
  );
}

// ── Mount ──
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
