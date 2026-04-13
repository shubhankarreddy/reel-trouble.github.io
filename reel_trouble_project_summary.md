# REEL TROUBLE — Full Project Summary
> Hand this document to Opus. Everything needed to build the game is here.

---

## WHAT WE ARE BUILDING

A browser-based, gamified SQL learning game called **Reel Trouble**. Students learn MySQL by solving real business problems at a fictional video rental store. No backend. No installation. Runs entirely in the browser using React + SQL.js (SQLite in WebAssembly). Progress saved via localStorage.

**Distributed to students as a hosted URL. Nothing to install.**

---

## TECH STACK

| Layer | Technology |
|---|---|
| Frontend | React (single page, screen-by-screen) |
| SQL Engine | SQL.js (SQLite via WebAssembly) |
| Data | Sakila database exported as CSVs, bundled with the app |
| Progress | localStorage (no login, device-local save) |
| Hosting | Netlify / Vercel / GitHub Pages (static, free) |
| Fonts | Choose distinctive, non-generic fonts — see UI spec |

**Important:** SQL.js uses SQLite syntax, not MySQL. When writing SQL answers, use SQLite-compatible syntax. Avoid MySQL-specific functions like `DATE_FORMAT()`. Use `strftime()` instead. All other concepts — SELECT, WHERE, GROUP BY, JOINs, subqueries, CTEs, window functions — work identically.

---

## DATABASE — SAKILA

Standard MySQL Sakila sample database. 16 tables.

### Tables and key columns

```
film          — film_id, title, description, release_year, language_id,
                rental_duration, rental_rate, length, replacement_cost,
                rating, special_features

film_text     — film_id, title, description

film_actor    — actor_id, film_id

film_category — film_id, category_id

actor         — actor_id, first_name, last_name

category      — category_id, name

language      — language_id, name

inventory     — inventory_id, film_id, store_id

rental        — rental_id, rental_date, inventory_id, customer_id,
                return_date, staff_id

payment       — payment_id, customer_id, staff_id, rental_id,
                amount, payment_date

customer      — customer_id, store_id, first_name, last_name, email,
                address_id, active, create_date

staff         — staff_id, first_name, last_name, address_id, email,
                store_id, active, username

store         — store_id, manager_staff_id, address_id

address       — address_id, address, district, city_id, postal_code, phone

city          — city_id, city, country_id

country       — country_id, country
```

### Key staff data (only 2 staff — central to the story)
- Staff 1: **Mike Hillyer**, Store 1
- Staff 2: **Jon Stephens**, Store 2

---

## STORY AND NARRATIVE

### Setting
Year: 2005. Netflix is mailing DVDs. Blockbuster is wobbling. **Sakila Video**, a two-store rental chain, is bleeding revenue. Owner **Frank Sakila** has just hired you as his first-ever data analyst.

Frank is old school. He prints emails. He doesn't trust spreadsheets. But he trusts numbers — if you can find them.

He suspects something is wrong. Revenue is down. Inventory is off. One of his two managers — Mike or Jon — might be the problem. Or the data might just be messy. Your job: find out.

### Narrative voice
- Frank speaks in short, direct sentences. Impatient. Worried. Occasionally impressed.
- Questions are delivered as tasks Frank drops on your desk — memos, phone calls, sticky notes.
- Each correct answer unlocks a narrative beat. The story progresses.
- Wrong answers get a Frank reaction — frustrated but not cruel.

### The arc across 7 cases
1. Frank introduces you. The data is messy. First red flags.
2. Revenue report reveals Store 1 is outperforming Store 2 significantly.
3. Catalog audit — dozens of films have never been rented.
4. Customer churn — high-value customers vanished 6 months ago.
5. One customer's rental history is suspicious.
6. Staff performance breakdown — the numbers point at Jon.
7. Full report. Frank confronts Jon. The truth is more complicated than expected.

> NOTE FOR OPUS: The "twist" in Case 7 is that Jon's store has worse numbers not because of fraud but because of a genuinely worse film inventory — someone made bad procurement decisions. The data tells a business story, not a crime story. Keep it grounded in real business reality.

---

## CASE MAP — 7 CASES, 100 QUESTIONS

### Structure per case
Each case has ~14 questions in 4 difficulty bands:

```
Warm-up   (Q1–Q4)   — SELECT, WHERE, basic filters, single table
Current   (Q5–Q9)   — GROUP BY, aggregations, simple JOINs
Rapids    (Q10–Q12) — Subqueries, multi-table JOINs, date logic
Waterfall (Q13–Q14) — CTEs, window functions, real business insight
```

---

### CASE 1 — "New Kid on the Block"
**Business problem:** Customer data audit. Who are our customers? Are our records clean?
**Tables:** customer, address, city, country
**Frank's brief:** "I need to know who's in our system before I can trust anything else."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | List all customers — first name, last name, email | SELECT, basic columns |
| 2 | Warm-up | Find all customers from the store 1 | WHERE |
| 3 | Warm-up | List customers sorted by last name A-Z | ORDER BY |
| 4 | Warm-up | How many total customers do we have? | COUNT |
| 5 | Current | How many customers per store? | GROUP BY |
| 6 | Current | List customers who are currently inactive | WHERE, boolean filter |
| 7 | Current | Find customers whose email is missing | WHERE IS NULL |
| 8 | Current | List the top 10 most recently registered customers | ORDER BY, LIMIT |
| 9 | Current | Which cities do most of our customers come from? Top 5. | JOIN, GROUP BY, ORDER BY |
| 10 | Rapids | Full customer list with their city and country | 3-table JOIN |
| 11 | Rapids | How many customers do we have per country? | JOIN, GROUP BY |
| 12 | Rapids | Find customers registered in 2006 | date filter |
| 13 | Waterfall | Which store has more active customers as a percentage of total? | subquery or CTE |
| 14 | Waterfall | List customers who share an address (possible data error) | self-join or GROUP BY HAVING |

---

### CASE 2 — "Follow the Money"
**Business problem:** Revenue reporting. How much did we make, when, and where?
**Tables:** payment, rental, staff, store
**Frank's brief:** "My accountant is asking questions I can't answer. Pull the numbers."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | What is the total revenue across all payments? | SUM |
| 2 | Warm-up | How many payments were made in total? | COUNT |
| 3 | Warm-up | What is the average payment amount? | AVG |
| 4 | Warm-up | What is the highest single payment ever made? | MAX |
| 5 | Current | Total revenue per staff member | GROUP BY staff_id |
| 6 | Current | Total revenue per store | JOIN staff, GROUP BY store_id |
| 7 | Current | How many rentals did each store process? | JOIN, GROUP BY |
| 8 | Current | Which month had the highest total revenue? | strftime, GROUP BY |
| 9 | Current | Daily revenue for the month of July 2005 | date filter, GROUP BY |
| 10 | Rapids | Revenue per store per month — side by side | JOIN, GROUP BY multiple |
| 11 | Rapids | Average revenue per rental by store | JOIN, AVG |
| 12 | Rapids | Find all payments above the average payment amount | subquery |
| 13 | Waterfall | Running total of revenue over time (cumulative) | window function SUM OVER |
| 14 | Waterfall | Revenue rank by month — which month ranks #1, #2, #3 | window function RANK |

---

### CASE 3 — "Dead on Arrival"
**Business problem:** Catalog ROI. Which films earn their shelf space? Which are dead weight?
**Tables:** film, inventory, rental, film_category, category, language
**Frank's brief:** "I'm paying to stock 1000 films. I want to know which ones nobody touches."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | List all films with their title and rental rate | SELECT |
| 2 | Warm-up | Find all films rated PG | WHERE |
| 3 | Warm-up | How many films do we have per rating category? | GROUP BY |
| 4 | Warm-up | What is the most expensive film to replace? | MAX, ORDER BY |
| 5 | Current | How many films are in each category? | JOIN film_category + category |
| 6 | Current | Which film has the most copies in inventory? | JOIN, GROUP BY, ORDER BY |
| 7 | Current | How many times has each film been rented? | JOIN inventory + rental |
| 8 | Current | Top 10 most rented films | JOIN, GROUP BY, LIMIT |
| 9 | Current | Which film category generates the most rentals? | 3-table JOIN, GROUP BY |
| 10 | Rapids | Films that have never been rented (dead inventory) | LEFT JOIN, WHERE IS NULL |
| 11 | Rapids | Films available in only one store | JOIN, GROUP BY, HAVING |
| 12 | Rapids | Average rental count per film category | JOIN, AVG subquery |
| 13 | Waterfall | Rank films by rental count within each category | window RANK PARTITION BY |
| 14 | Waterfall | For each category, what percentage of films have never been rented? | CTE + JOIN |

---

### CASE 4 — "Gone Cold"
**Business problem:** Customer churn. Who used to rent regularly and then stopped?
**Tables:** customer, rental, payment, address, city
**Frank's brief:** "We had regulars. Good customers. Now they're gone. Find them."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | When was the first ever rental in our system? | MIN |
| 2 | Warm-up | When was the most recent rental? | MAX |
| 3 | Warm-up | How many rentals happened in 2005 vs 2006? | GROUP BY year |
| 4 | Warm-up | List customers who have made at least one rental | JOIN, DISTINCT |
| 5 | Current | Total rentals per customer — all time | GROUP BY customer_id |
| 6 | Current | Which customers rented the most in 2005? | filter + GROUP BY |
| 7 | Current | Average number of rentals per customer | subquery + AVG |
| 8 | Current | Customers who rented more than 30 times | GROUP BY, HAVING |
| 9 | Current | Last rental date for each customer | GROUP BY, MAX |
| 10 | Rapids | Customers who rented in 2005 but not in 2006 | subquery / NOT IN |
| 11 | Rapids | Customers whose last rental was over 6 months before the latest date in data | date arithmetic |
| 12 | Rapids | Top 20 customers by total spend who haven't rented recently | JOIN + subquery |
| 13 | Waterfall | For each customer, number of months between first and last rental | CTE, date diff |
| 14 | Waterfall | Classify customers as Active / At Risk / Churned based on last rental date | CTE + CASE WHEN |

---

### CASE 5 — "The Whale"
**Business problem:** Customer lifetime value. Who are our most valuable customers?
**Tables:** customer, payment, rental, address, city, country
**Frank's brief:** "Who is our single most valuable customer? I want to send them a letter."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | Total amount spent by each customer | SUM, GROUP BY |
| 2 | Warm-up | Who is the top spending customer? | ORDER BY, LIMIT 1 |
| 3 | Warm-up | Top 10 customers by total spend | ORDER BY, LIMIT |
| 4 | Warm-up | Average spend per customer | AVG subquery |
| 5 | Current | Total spend + total rentals per customer | JOIN, GROUP BY |
| 6 | Current | Average spend per rental by customer | derived column |
| 7 | Current | Which store do top 10 customers belong to? | JOIN |
| 8 | Current | Top customers per store (top 5 from each) | GROUP BY, LIMIT per group |
| 9 | Current | Customers who spent more than the average customer | subquery |
| 10 | Rapids | Full profile of top 10 customers — name, city, country, total spend | 4-table JOIN |
| 11 | Rapids | Month-by-month spend for the top customer | filter + GROUP BY date |
| 12 | Rapids | Customers in the top 10% by spend | NTILE or subquery with percentile |
| 13 | Waterfall | Rank all customers by lifetime value with running total | RANK + SUM OVER |
| 14 | Waterfall | Customer segments — High Value / Mid / Low based on spend quartile | NTILE(4) window function |

---

### CASE 6 — "Staff Under the Lens"
**Business problem:** Staff performance and fraud detection. Mike vs Jon — what do the numbers say?
**Tables:** staff, payment, rental, store, customer
**Frank's brief:** "I need to know if one of my managers is the problem or if I just gave them a bad store."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | List both staff members with their store | SELECT, JOIN |
| 2 | Warm-up | Total payments processed by each staff member | GROUP BY staff_id |
| 3 | Warm-up | Total rentals handled by each staff member | GROUP BY |
| 4 | Warm-up | Average payment amount processed by each staff | AVG, GROUP BY |
| 5 | Current | Revenue per staff member per month | GROUP BY staff + month |
| 6 | Current | Number of unique customers served by each staff | COUNT DISTINCT |
| 7 | Current | Which staff member handles more high-value payments (above $5)? | WHERE + GROUP BY |
| 8 | Current | Busiest day of week for each staff member | strftime weekday, GROUP BY |
| 9 | Current | Staff performance by film category — which categories does each store rent more? | multi-table JOIN |
| 10 | Rapids | Are there rentals with no corresponding payment? (red flag) | LEFT JOIN, WHERE IS NULL |
| 11 | Rapids | Payments processed outside of normal hours (before 8am or after 10pm) | time filter |
| 12 | Rapids | Month-over-month revenue change per staff member | CTE + LAG |
| 13 | Waterfall | Rank each staff member's monthly performance over time | window RANK |
| 14 | Waterfall | Compare each staff member's revenue as % of total revenue per month | CTE + window SUM |

---

### CASE 7 — "The Final Verdict"
**Business problem:** Full executive report. Every metric Frank needs before he makes a decision.
**Tables:** All 16 tables
**Frank's brief:** "My accountant, my lawyer, and my potential buyer are sitting in that room. I need everything."

| Q# | Band | Business Task | Core Concept |
|---|---|---|---|
| 1 | Warm-up | Total revenue, total rentals, total customers — one query | multiple aggregations |
| 2 | Warm-up | Revenue and rentals split by store | GROUP BY store |
| 3 | Warm-up | Full film catalog summary — total films, avg rental rate, avg replacement cost | aggregations |
| 4 | Warm-up | Customer summary — total, active, inactive, per store | GROUP BY, CASE |
| 5 | Current | Top 5 films by revenue generated | JOIN rental+payment, GROUP BY |
| 6 | Current | Top 5 categories by revenue | multi-join + GROUP BY |
| 7 | Current | Monthly revenue trend — full timeline | GROUP BY month |
| 8 | Current | Customer acquisition per month | GROUP BY create_date month |
| 9 | Current | Inventory utilisation — % of inventory rented at least once | subquery |
| 10 | Rapids | Films with high replacement cost that have never been rented (financial risk) | LEFT JOIN + WHERE |
| 11 | Rapids | Customer retention rate — % who rented in both 2005 and 2006 | two subqueries / CTE |
| 12 | Rapids | Revenue per film category per store | 4-table JOIN, GROUP BY two cols |
| 13 | Waterfall | Full store comparison — all KPIs side by side using CTEs | multi-CTE |
| 14 | Waterfall | Identify the top actor whose films generate the most rental revenue | 5-table JOIN + GROUP BY |

---

## SCORING SYSTEM

```
Correct answer       → +100 XP
First attempt bonus  → +50 XP
Clean query bonus    → +25 XP (no unnecessary columns, no SELECT *)
3-question streak    → 1.5x multiplier on next question
Hint used            → -25 XP
Wrong answer         → 0 XP, unlimited retries
Skip question        → 0 XP, case still progresses
```

### Rank thresholds
```
0–499      → Intern
500–1499   → Junior Analyst
1500–2999  → Senior Analyst
3000–4999  → Lead Analyst
5000+      → The Detective
```

### Hint system
Each question has 2 hints:
- Hint 1 (−25 XP): Points toward the right table or clause
- Hint 2 (−25 XP): Shows partial query structure

---

## UI SPECIFICATION

### Design direction
**"Warm analytics tool"** — feels like a well-designed internal tool at a real company. Professional, approachable, not a textbook, not a hacker terminal. Think Retool meets Duolingo. Clean, purposeful, a little personality.

### Colors
```
Background base      #f8fafc  (off-white)
Surface / cards      #ffffff
Primary teal         #0d9488
Primary teal dark    #0f766e
Amber accent         #f59e0b
Text primary         #1e293b
Text secondary       #64748b
Border               #e2e8f0
SOLVED stamp         #ef4444
Success green        #10b981
Error red            #ef4444
```

### Typography
- Do NOT use Inter, Roboto, Arial, or Space Grotesk
- Choose a distinctive display font for case titles / headings
- Monospace font for SQL editor (Fira Code, JetBrains Mono, or similar)
- Clean, readable serif or distinctive sans for body/question text

### Screen layout (desktop only)
```
┌─────────────────────────────────────────────────────────┐
│  TOP BAR: Case name │ XP bar │ Rank badge │ Streak 🔥   │
├──────────────────────────┬──────────────────────────────┤
│                          │                              │
│  LEFT PANEL              │  RIGHT PANEL                 │
│  - Frank's memo/brief    │  - SQL Editor (terminal)     │
│  - Question as evidence  │  - RUN button                │
│    card                  │  - Results table             │
│  - Hint button           │  - SUBMIT button             │
│  - Progress within case  │  - Feedback message          │
│                          │                              │
├──────────────────────────┴──────────────────────────────┤
│  BOTTOM: Case progress dots  │  Schema reference toggle │
└─────────────────────────────────────────────────────────┘
```

### Key UI interactions
- Question delivered as a "memo" or "sticky note" from Frank
- SQL editor is always visible, never hidden
- RUN executes query, shows result table immediately
- SUBMIT compares result to expected, awards XP
- SOLVED stamp (red, rotated slightly) appears on completed cards
- Case completion shows a narrative resolution screen before next case
- Schema reference is a toggleable sidebar showing table columns
- Progress is auto-saved to localStorage after every question

### What to avoid
- Dark hacker terminal aesthetic
- Generic purple gradients
- Excessive animations
- Anything that feels like a quiz app or flashcard tool

---

## VALIDATION LOGIC

For each question, store:
```js
{
  id: "c1q1",
  expected_rows: [...],         // pre-computed result rows
  expected_columns: [...],      // column names in order
  match_type: "exact" | "order_insensitive" | "top_n"
}
```

Validation rules:
- `exact` — rows and order must match
- `order_insensitive` — same rows, any order (most questions)
- `top_n` — correct top N rows (for LIMIT questions where ties are possible)
- Column names must match (case insensitive)
- Extra columns = wrong (encourages clean queries, needed for clean query bonus)

---

## PROGRESS / SAVE SYSTEM

Using localStorage. Structure:
```js
{
  currentCase: 3,
  currentQuestion: 7,
  totalXP: 1250,
  rank: "Senior Analyst",
  streak: 2,
  completedQuestions: {
    "c1q1": { xp: 175, attempts: 1, hintsUsed: 0 },
    "c1q2": { xp: 100, attempts: 2, hintsUsed: 1 },
    ...
  }
}
```

On game load — check localStorage, resume from last position. Option to reset progress.

---

## DATA LOADING

Sakila CSVs are bundled with the app. On first load:
1. Fetch each CSV file
2. Parse with PapaParse
3. Load into SQL.js in-memory SQLite database
4. Show loading screen while this happens
5. Once loaded, game starts

All 16 tables are loaded. Full Sakila dataset — small enough (under 10mb total CSVs) to load in-browser without issues.

---

## WHAT OPUS MUST PRODUCE

1. **All 100 SQL answers** — verified correct against Sakila SQLite schema, one per question in the table above
2. **All 100 hint texts** — 2 hints per question
3. **All 100 narrative texts** — Frank's brief for each question (1-3 sentences, business framing)
4. **Frank's case opening monologue** — one paragraph per case, sets the scene
5. **Case closing narrative** — one paragraph per case, reveals the story beat
6. **The React game** — fully functional, all questions, scoring, progress save, SQL.js integration

---

## RULES FOR OPUS

- SQL answers must be SQLite-compatible (no MySQL-specific functions)
- Use `strftime('%Y-%m', payment_date)` not `DATE_FORMAT()`
- Use `||` for string concatenation not `CONCAT()`
- Every SQL answer must be tested mentally against the actual Sakila schema above
- No question should repeat a concept already fully covered in the same difficulty band
- Narrative must feel like a real workplace — Frank is a boss, not a teacher
- Do not write questions that teach SQL — write questions that solve business problems
- Code written like a human developer — lowercase SQL, no banner comments
- React code should be clean, componentised, production-grade

---

## FILES TO PRODUCE

```
/game
  index.html
  /src
    App.jsx
    /components
      TopBar.jsx
      CaseBrief.jsx
      QuestionCard.jsx
      SqlEditor.jsx
      ResultsTable.jsx
      SchemaReference.jsx
      CaseComplete.jsx
      RankBadge.jsx
    /data
      questions.js      ← all 100 questions, hints, expected results, narratives
      schema.js         ← table definitions for reference panel
    /hooks
      useProgress.js    ← localStorage save/load
      useSqlJs.js       ← SQL.js initialisation and query runner
    /styles
      global.css
  /public
    /data
      customer.csv
      rental.csv
      payment.csv
      film.csv
      film_actor.csv
      film_category.csv
      actor.csv
      category.csv
      inventory.csv
      staff.csv
      store.csv
      address.csv
      city.csv
      country.csv
      language.csv
      film_text.csv
```
