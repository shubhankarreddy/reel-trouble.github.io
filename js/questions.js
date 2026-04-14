// ─────────────────────────────────────────────
// Reel Trouble — 100 Questions across 7 Cases
// SQLite-compatible answers verified against Sakila
// ─────────────────────────────────────────────

const CASES = [
  // ── CASE 1: New Kid on the Block ──────────────────
  {
    id: 1,
    title: "New Kid on the Block",
    subtitle: "Customer Data Audit",
    tables: ["customer", "address", "city", "country"],
    opening: `You walk into Sakila Video on your first day. Frank Sakila is behind the counter, squinting at a printout. He doesn't look up. "You the data person? Good. Sit down." He drops a manila folder on your desk. "Before I trust you with anything important, I need to know our customer list is clean. Who's in our system? Are the records even right? I've been running this place for years and I still don't know basic things about who walks through my door. Fix that."`,
    closing: `You slide the report across Frank's desk. He reads it slowly, nodding. "So we've got 599 customers, almost all active, spread across dozens of countries." He pauses. "No missing emails. That's something." He looks up. "Alright, new kid. You can count. Let's see if you can follow the money." He reaches for another folder.`,
    questions: [
      {
        id: "c1q1",
        band: "warm-up",
        title: "The Roster",
        narrative: "Frank drops a sticky note on your monitor: \"I need a list of every customer we have. Name and email. Don't make it fancy.\"",
        task: "List all customers — first name, last name, and email.",
        sql: `select first_name, last_name, email from customer`,
        expected_columns: ["first_name", "last_name", "email"],
        match_type: "order_insensitive",
        hints: [
          "You only need the customer table. Think about which columns to SELECT.",
          "SELECT first_name, last_name, email FROM ..."
        ]
      },
      {
        id: "c1q2",
        band: "warm-up",
        title: "Store One Roll Call",
        narrative: "Frank's on the phone with Store 1's manager. \"How many people do we have at your location? Hang on, let me get the new analyst to check.\"",
        task: "Find all customers who belong to store 1.",
        sql: `select first_name, last_name, email from customer where store_id = 1`,
        expected_columns: ["first_name", "last_name", "email"],
        match_type: "order_insensitive",
        hints: [
          "Filter the customer table using a WHERE clause on store_id.",
          "SELECT first_name, last_name, email FROM customer WHERE store_id = ..."
        ]
      },
      {
        id: "c1q3",
        band: "warm-up",
        title: "Alphabetical Order",
        narrative: "\"The accountant wants the customer list sorted. Last name, A to Z. Don't ask me why — just do it.\"",
        task: "List all customers sorted by last name A–Z.",
        sql: `select first_name, last_name, email from customer order by last_name asc`,
        expected_columns: ["first_name", "last_name", "email"],
        match_type: "exact",
        hints: [
          "Use ORDER BY on the last_name column.",
          "SELECT first_name, last_name, email FROM customer ORDER BY last_name ASC"
        ]
      },
      {
        id: "c1q4",
        band: "warm-up",
        title: "Head Count",
        narrative: "Frank leans in your doorway. \"Simple question. How many customers total? Just the number.\"",
        task: "How many total customers do we have?",
        sql: `select count(*) as total_customers from customer`,
        expected_columns: ["total_customers"],
        match_type: "exact",
        hints: [
          "Use an aggregate function that counts rows.",
          "SELECT COUNT(*) AS total_customers FROM customer"
        ]
      },
      {
        id: "c1q5",
        band: "current",
        title: "Store Breakdown",
        narrative: "\"I've got two stores. I want to know the split. How many customers belong to each?\"",
        task: "How many customers per store?",
        sql: `select store_id, count(*) as customer_count from customer group by store_id`,
        expected_columns: ["store_id", "customer_count"],
        match_type: "order_insensitive",
        hints: [
          "GROUP BY store_id and count the rows in each group.",
          "SELECT store_id, COUNT(*) AS customer_count FROM customer GROUP BY store_id"
        ]
      },
      {
        id: "c1q6",
        band: "current",
        title: "Ghost Customers",
        narrative: "Frank circles a word on his printout: INACTIVE. \"Some of these people haven't come back. Pull me the inactive ones.\"",
        task: "List customers who are currently inactive.",
        sql: `select customer_id, first_name, last_name, email from customer where active = 0`,
        expected_columns: ["customer_id", "first_name", "last_name", "email"],
        match_type: "order_insensitive",
        hints: [
          "The active column is 1 for active, 0 for inactive. Filter with WHERE.",
          "SELECT customer_id, first_name, last_name, email FROM customer WHERE active = 0"
        ]
      },
      {
        id: "c1q7",
        band: "current",
        title: "Missing Contacts",
        narrative: "\"If we can't email them, we can't reach them. Find anyone with a missing email address.\"",
        task: "Find customers whose email is missing.",
        sql: `select customer_id, first_name, last_name, email from customer where email is null`,
        expected_columns: ["customer_id", "first_name", "last_name", "email"],
        match_type: "order_insensitive",
        hints: [
          "Use IS NULL to check for missing values — not = NULL.",
          "SELECT customer_id, first_name, last_name, email FROM customer WHERE email IS NULL"
        ]
      },
      {
        id: "c1q8",
        band: "current",
        title: "Fresh Faces",
        narrative: "\"Who signed up most recently? Give me the last 10 people who registered.\"",
        task: "List the 10 most recently registered customers.",
        sql: `select customer_id, first_name, last_name, create_date from customer order by create_date desc limit 10`,
        expected_columns: ["customer_id", "first_name", "last_name", "create_date"],
        match_type: "top_n",
        hints: [
          "Sort by create_date in descending order, then use LIMIT.",
          "SELECT ... FROM customer ORDER BY create_date DESC LIMIT 10"
        ]
      },
      {
        id: "c1q9",
        band: "current",
        title: "City Hotspots",
        narrative: "\"Where are our customers actually located? Give me the top 5 cities. I want to know where our people are.\"",
        task: "Which cities do most of our customers come from? Show top 5.",
        sql: `select ci.city, count(*) as customer_count from customer c join address a on c.address_id = a.address_id join city ci on a.city_id = ci.city_id group by ci.city order by customer_count desc limit 5`,
        expected_columns: ["city", "customer_count"],
        match_type: "top_n",
        hints: [
          "You need to JOIN customer → address → city, then GROUP BY city.",
          "SELECT ci.city, COUNT(*) ... FROM customer c JOIN address a ON c.address_id = a.address_id JOIN city ci ON a.city_id = ci.city_id GROUP BY ci.city ORDER BY ... DESC LIMIT 5"
        ]
      },
      {
        id: "c1q10",
        band: "rapids",
        title: "The Full Picture",
        narrative: "\"I want the complete customer list — name, city, and country. The whole picture. My lawyer needs it for some compliance thing.\"",
        task: "Full customer list with their city and country.",
        sql: `select c.first_name, c.last_name, ci.city, co.country from customer c join address a on c.address_id = a.address_id join city ci on a.city_id = ci.city_id join country co on ci.country_id = co.country_id`,
        expected_columns: ["first_name", "last_name", "city", "country"],
        match_type: "order_insensitive",
        hints: [
          "You need a 3-table JOIN chain: customer → address → city → country.",
          "SELECT c.first_name, c.last_name, ci.city, co.country FROM customer c JOIN address a ON ... JOIN city ci ON ... JOIN country co ON ..."
        ]
      },
      {
        id: "c1q11",
        band: "rapids",
        title: "Global Reach",
        narrative: "Frank slides a world map across the desk. \"How many customers per country? I'm curious how international we really are.\"",
        task: "How many customers do we have per country?",
        sql: `select co.country, count(*) as customer_count from customer c join address a on c.address_id = a.address_id join city ci on a.city_id = ci.city_id join country co on ci.country_id = co.country_id group by co.country order by customer_count desc`,
        expected_columns: ["country", "customer_count"],
        match_type: "order_insensitive",
        hints: [
          "Same JOIN chain as before (customer → address → city → country), but now GROUP BY country.",
          "... JOIN country co ON ci.country_id = co.country_id GROUP BY co.country ORDER BY customer_count DESC"
        ]
      },
      {
        id: "c1q12",
        band: "rapids",
        title: "Class of 2006",
        narrative: "\"Pull me everyone who registered in 2006. I want to know if we're still growing.\"",
        task: "Find customers who registered in 2006.",
        sql: `select customer_id, first_name, last_name, create_date from customer where strftime('%Y', create_date) = '2006'`,
        expected_columns: ["customer_id", "first_name", "last_name", "create_date"],
        match_type: "order_insensitive",
        hints: [
          "Use strftime('%Y', create_date) to extract the year from a date.",
          "SELECT ... FROM customer WHERE strftime('%Y', create_date) = '2006'"
        ]
      },
      {
        id: "c1q13",
        band: "waterfall",
        title: "Active Percentage",
        narrative: "\"Don't just tell me how many are active — tell me the percentage. I want to compare the two stores. Which one keeps customers engaged?\"",
        task: "Which store has more active customers as a percentage of total?",
        sql: `select store_id, count(*) as total, sum(active) as active_count, round(sum(active) * 100.0 / count(*), 2) as active_pct from customer group by store_id`,
        expected_columns: ["store_id", "total", "active_count", "active_pct"],
        match_type: "order_insensitive",
        hints: [
          "Use SUM(active) for the active count, COUNT(*) for total, then divide for the percentage.",
          "SELECT store_id, COUNT(*) AS total, SUM(active) AS active_count, ROUND(SUM(active) * 100.0 / COUNT(*), 2) AS active_pct FROM customer GROUP BY store_id"
        ]
      },
      {
        id: "c1q14",
        band: "waterfall",
        title: "Data Dupes",
        narrative: "\"My gut says there are duplicate records in here. Find any customers who share the same address. That's either a data entry error or something weird.\"",
        task: "List addresses shared by more than one customer.",
        sql: `select a.address_id, a.address, count(*) as customer_count from customer c join address a on c.address_id = a.address_id group by a.address_id, a.address having count(*) > 1`,
        expected_columns: ["address_id", "address", "customer_count"],
        match_type: "order_insensitive",
        hints: [
          "GROUP BY address_id and use HAVING to filter groups with more than one customer.",
          "SELECT a.address_id, a.address, COUNT(*) AS customer_count FROM customer c JOIN address a ON ... GROUP BY a.address_id, a.address HAVING COUNT(*) > 1"
        ]
      }
    ]
  },

  // ── CASE 2: Follow the Money ──────────────────
  {
    id: 2,
    title: "Follow the Money",
    subtitle: "Revenue Reporting",
    tables: ["payment", "rental", "staff", "store", "inventory"],
    opening: `Frank walks in with a coffee and a frown. "My accountant just called. He's asking questions I can't answer. How much did we make last month? Last year? Which store made more?" He drops a stack of crumpled receipts on your desk. "I used to track this on paper. That's not working anymore. Pull the numbers. I need to know where every dollar went."`,
    closing: `Frank stares at the revenue breakdown. Store 1 and Store 2 are surprisingly close — within a few hundred dollars of each other. But July 2005 was the big month. Revenue peaked and then fell off a cliff. "That July number," Frank mutters. "We were busy. Real busy. Then something changed." He folds the paper and puts it in his pocket. "Next I want to know about the product."`,
    questions: [
      {
        id: "c2q1",
        band: "warm-up",
        title: "The Bottom Line",
        narrative: "Frank's accountant is on hold. \"What's the total? All payments, all time. Just the number.\"",
        task: "What is the total revenue across all payments?",
        sql: `select sum(amount) as total_revenue from payment`,
        expected_columns: ["total_revenue"],
        match_type: "exact",
        hints: [
          "Use the SUM() aggregate function on the amount column.",
          "SELECT SUM(amount) AS total_revenue FROM payment"
        ]
      },
      {
        id: "c2q2",
        band: "warm-up",
        title: "Transaction Count",
        narrative: "\"How many individual payments do we have on record? Every single transaction.\"",
        task: "How many payments were made in total?",
        sql: `select count(*) as total_payments from payment`,
        expected_columns: ["total_payments"],
        match_type: "exact",
        hints: [
          "COUNT(*) gives you the total number of rows.",
          "SELECT COUNT(*) AS total_payments FROM payment"
        ]
      },
      {
        id: "c2q3",
        band: "warm-up",
        title: "Average Ticket",
        narrative: "\"What does the average customer pay per transaction? I need to know our average ticket size.\"",
        task: "What is the average payment amount?",
        sql: `select round(avg(amount), 2) as avg_payment from payment`,
        expected_columns: ["avg_payment"],
        match_type: "exact",
        hints: [
          "Use AVG() and ROUND() for a clean number.",
          "SELECT ROUND(AVG(amount), 2) AS avg_payment FROM payment"
        ]
      },
      {
        id: "c2q4",
        band: "warm-up",
        title: "Big Spender",
        narrative: "\"What's the biggest single payment anyone ever made? I'm curious.\"",
        task: "What is the highest single payment ever made?",
        sql: `select max(amount) as max_payment from payment`,
        expected_columns: ["max_payment"],
        match_type: "exact",
        hints: [
          "MAX() finds the largest value in a column.",
          "SELECT MAX(amount) AS max_payment FROM payment"
        ]
      },
      {
        id: "c2q5",
        band: "current",
        title: "Staff Revenue",
        narrative: "\"I have two staff members processing payments. How much has each one brought in?\"",
        task: "Total revenue per staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, sum(p.amount) as total_revenue from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "total_revenue"],
        match_type: "order_insensitive",
        hints: [
          "JOIN payment with staff on staff_id, then GROUP BY staff member.",
          "SELECT s.staff_id, s.first_name, s.last_name, SUM(p.amount) AS total_revenue FROM payment p JOIN staff s ON ... GROUP BY ..."
        ]
      },
      {
        id: "c2q6",
        band: "current",
        title: "Store vs Store",
        narrative: "\"Forget the staff — tell me the revenue per store. Which location is making more money?\"",
        task: "Total revenue per store.",
        sql: `select s.store_id, sum(p.amount) as total_revenue from payment p join staff s on p.staff_id = s.staff_id group by s.store_id`,
        expected_columns: ["store_id", "total_revenue"],
        match_type: "order_insensitive",
        hints: [
          "JOIN payment to staff to get store_id, then GROUP BY store_id.",
          "SELECT s.store_id, SUM(p.amount) AS total_revenue FROM payment p JOIN staff s ON p.staff_id = s.staff_id GROUP BY s.store_id"
        ]
      },
      {
        id: "c2q7",
        band: "current",
        title: "Rental Volume",
        narrative: "\"Revenue is one thing. Volume is another. How many rentals did each store actually process?\"",
        task: "How many rentals did each store process?",
        sql: `select i.store_id, count(*) as rental_count from rental r join inventory i on r.inventory_id = i.inventory_id group by i.store_id`,
        expected_columns: ["store_id", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN rental to inventory to get store_id, then GROUP BY store_id.",
          "SELECT i.store_id, COUNT(*) AS rental_count FROM rental r JOIN inventory i ON r.inventory_id = i.inventory_id GROUP BY i.store_id"
        ]
      },
      {
        id: "c2q8",
        band: "current",
        title: "Peak Month",
        narrative: "\"Was there a month we crushed it? Tell me which month had the highest revenue ever.\"",
        task: "Which month had the highest total revenue?",
        sql: `select strftime('%Y-%m', payment_date) as month, sum(amount) as total_revenue from payment group by month order by total_revenue desc limit 1`,
        expected_columns: ["month", "total_revenue"],
        match_type: "exact",
        hints: [
          "Use strftime('%Y-%m', payment_date) to extract year-month, then GROUP BY and ORDER BY.",
          "SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount) AS total_revenue FROM payment GROUP BY month ORDER BY total_revenue DESC LIMIT 1"
        ]
      },
      {
        id: "c2q9",
        band: "current",
        title: "July Deep Dive",
        narrative: "\"July 2005 was our biggest month. Break it down day by day — I want to see the pattern.\"",
        task: "Daily revenue for the month of July 2005.",
        sql: `select date(payment_date) as day, sum(amount) as daily_revenue from payment where strftime('%Y-%m', payment_date) = '2005-07' group by day order by day`,
        expected_columns: ["day", "daily_revenue"],
        match_type: "exact",
        hints: [
          "Filter to July 2005 with strftime, then GROUP BY DATE(payment_date).",
          "SELECT DATE(payment_date) AS day, SUM(amount) AS daily_revenue FROM payment WHERE strftime('%Y-%m', payment_date) = '2005-07' GROUP BY day ORDER BY day"
        ]
      },
      {
        id: "c2q10",
        band: "rapids",
        title: "Side by Side",
        narrative: "\"I want to see both stores, month by month, side by side. Show me the full revenue timeline per store.\"",
        task: "Revenue per store per month.",
        sql: `select strftime('%Y-%m', p.payment_date) as month, s.store_id, sum(p.amount) as revenue from payment p join staff s on p.staff_id = s.staff_id group by month, s.store_id order by month, s.store_id`,
        expected_columns: ["month", "store_id", "revenue"],
        match_type: "exact",
        hints: [
          "JOIN payment to staff for store_id, GROUP BY month and store_id.",
          "SELECT strftime('%Y-%m', p.payment_date) AS month, s.store_id, SUM(p.amount) AS revenue FROM payment p JOIN staff s ON ... GROUP BY month, s.store_id ORDER BY month, s.store_id"
        ]
      },
      {
        id: "c2q11",
        band: "rapids",
        title: "Revenue per Rental",
        narrative: "\"Are both stores charging the same per rental? What's the average revenue per rental at each store?\"",
        task: "Average revenue per rental by store.",
        sql: `select s.store_id, round(sum(p.amount) / count(distinct p.rental_id), 2) as avg_per_rental from payment p join staff s on p.staff_id = s.staff_id group by s.store_id`,
        expected_columns: ["store_id", "avg_per_rental"],
        match_type: "order_insensitive",
        hints: [
          "Divide total revenue by number of distinct rentals per store.",
          "SELECT s.store_id, ROUND(SUM(p.amount) / COUNT(DISTINCT p.rental_id), 2) AS avg_per_rental FROM payment p JOIN staff s ON ... GROUP BY s.store_id"
        ]
      },
      {
        id: "c2q12",
        band: "rapids",
        title: "Above Average",
        narrative: "\"Flag every payment that's above our average. I want to see who's paying more than typical.\"",
        task: "Find all payments above the average payment amount.",
        sql: `select payment_id, customer_id, amount from payment where amount > (select avg(amount) from payment)`,
        expected_columns: ["payment_id", "customer_id", "amount"],
        match_type: "order_insensitive",
        hints: [
          "Use a subquery in the WHERE clause to calculate the average.",
          "SELECT payment_id, customer_id, amount FROM payment WHERE amount > (SELECT AVG(amount) FROM payment)"
        ]
      },
      {
        id: "c2q13",
        band: "waterfall",
        title: "Running Total",
        narrative: "\"Show me revenue building up over time. I want to watch the number grow — a running total, month by month.\"",
        task: "Running total of revenue over time (cumulative by month).",
        sql: `select month, monthly_revenue, sum(monthly_revenue) over (order by month) as cumulative_revenue from (select strftime('%Y-%m', payment_date) as month, sum(amount) as monthly_revenue from payment group by month) sub`,
        expected_columns: ["month", "monthly_revenue", "cumulative_revenue"],
        match_type: "exact",
        hints: [
          "First get monthly revenue in a subquery, then use SUM() OVER (ORDER BY month) for the running total.",
          "SELECT month, monthly_revenue, SUM(monthly_revenue) OVER (ORDER BY month) AS cumulative_revenue FROM (SELECT strftime(...) AS month, SUM(amount) AS monthly_revenue FROM payment GROUP BY month) sub"
        ]
      },
      {
        id: "c2q14",
        band: "waterfall",
        title: "Revenue Rankings",
        narrative: "\"Rank the months. Best month is #1, worst is last. I want to know the pecking order.\"",
        task: "Revenue rank by month — which month ranks #1, #2, #3?",
        sql: `select strftime('%Y-%m', payment_date) as month, sum(amount) as total_revenue, rank() over (order by sum(amount) desc) as revenue_rank from payment group by month`,
        expected_columns: ["month", "total_revenue", "revenue_rank"],
        match_type: "exact",
        hints: [
          "Use RANK() OVER (ORDER BY SUM(amount) DESC) as a window function.",
          "SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount) AS total_revenue, RANK() OVER (ORDER BY SUM(amount) DESC) AS revenue_rank FROM payment GROUP BY month"
        ]
      }
    ]
  },

  // ── CASE 3: Dead on Arrival ──────────────────
  {
    id: 3,
    title: "Dead on Arrival",
    subtitle: "Catalog ROI",
    tables: ["film", "inventory", "rental", "film_category", "category", "language"],
    opening: `Frank's pacing behind his desk. "I'm paying to stock a thousand films. A thousand. You know what shelf space costs?" He stops and looks at you. "I want to know which films are pulling their weight and which ones are just sitting there collecting dust. Dead inventory. Money on the shelf doing nothing." He taps the desk. "Find the dead weight."`,
    closing: `You hand Frank the report. 42 films have never been rented. Not once. Frank reads the list slowly, his jaw tightening. "ALICE FANTASIA. APOLLO TEEN. Never rented. And I'm paying replacement cost on these?" He circles a number. "Sports and Animation — those are our money categories. But we've got dead films in every category." He looks up. "Next question: who used to rent from us and stopped?"`,
    questions: [
      {
        id: "c3q1",
        band: "warm-up",
        title: "The Catalog",
        narrative: "Frank points at a shelf overflowing with DVDs. \"List every film we carry and what we charge to rent it.\"",
        task: "List all films with their title and rental rate.",
        sql: `select title, rental_rate from film`,
        expected_columns: ["title", "rental_rate"],
        match_type: "order_insensitive",
        hints: [
          "Simple SELECT from the film table — just title and rental_rate.",
          "SELECT title, rental_rate FROM film"
        ]
      },
      {
        id: "c3q2",
        band: "warm-up",
        title: "Family Friendly",
        narrative: "\"A school group called. They want PG films only. Pull that list.\"",
        task: "Find all films rated PG.",
        sql: `select title, rating from film where rating = 'PG'`,
        expected_columns: ["title", "rating"],
        match_type: "order_insensitive",
        hints: [
          "Filter the film table with WHERE rating = 'PG'.",
          "SELECT title, rating FROM film WHERE rating = 'PG'"
        ]
      },
      {
        id: "c3q3",
        band: "warm-up",
        title: "Rating Breakdown",
        narrative: "\"How many films do we have in each rating? G, PG, R — the whole spread.\"",
        task: "How many films do we have per rating category?",
        sql: `select rating, count(*) as film_count from film group by rating order by film_count desc`,
        expected_columns: ["rating", "film_count"],
        match_type: "order_insensitive",
        hints: [
          "GROUP BY rating and COUNT the films in each group.",
          "SELECT rating, COUNT(*) AS film_count FROM film GROUP BY rating ORDER BY film_count DESC"
        ]
      },
      {
        id: "c3q4",
        band: "warm-up",
        title: "Pricey Replacement",
        narrative: "\"If a film gets damaged, we pay replacement cost. What's the most expensive one we'd have to replace?\"",
        task: "What is the most expensive film to replace?",
        sql: `select title, replacement_cost from film order by replacement_cost desc limit 1`,
        expected_columns: ["title", "replacement_cost"],
        match_type: "exact",
        hints: [
          "ORDER BY replacement_cost DESC and LIMIT 1.",
          "SELECT title, replacement_cost FROM film ORDER BY replacement_cost DESC LIMIT 1"
        ]
      },
      {
        id: "c3q5",
        band: "current",
        title: "Genre Count",
        narrative: "\"How many films in each genre? I want to know if our catalog is balanced or if we're heavy on one type.\"",
        task: "How many films are in each category?",
        sql: `select c.name as category, count(*) as film_count from film_category fc join category c on fc.category_id = c.category_id group by c.name order by film_count desc`,
        expected_columns: ["category", "film_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN film_category with category, then GROUP BY category name.",
          "SELECT c.name AS category, COUNT(*) AS film_count FROM film_category fc JOIN category c ON fc.category_id = c.category_id GROUP BY c.name ORDER BY film_count DESC"
        ]
      },
      {
        id: "c3q6",
        band: "current",
        title: "Most Stocked",
        narrative: "\"Which film do we have the most copies of? Someone ordered a lot of something.\"",
        task: "Which film has the most copies in inventory?",
        sql: `select f.title, count(*) as copy_count from inventory i join film f on i.film_id = f.film_id group by f.film_id, f.title order by copy_count desc limit 1`,
        expected_columns: ["title", "copy_count"],
        match_type: "exact",
        hints: [
          "JOIN film and inventory, GROUP BY film, ORDER BY count DESC, LIMIT 1.",
          "SELECT f.title, COUNT(*) AS copy_count FROM inventory i JOIN film f ON i.film_id = f.film_id GROUP BY f.film_id, f.title ORDER BY copy_count DESC LIMIT 1"
        ]
      },
      {
        id: "c3q7",
        band: "current",
        title: "Rental Counts",
        narrative: "\"For every film, how many times has it been rented? The full list.\"",
        task: "How many times has each film been rented?",
        sql: `select f.title, count(r.rental_id) as rental_count from film f join inventory i on f.film_id = i.film_id join rental r on i.inventory_id = r.inventory_id group by f.film_id, f.title order by rental_count desc`,
        expected_columns: ["title", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN film → inventory → rental, then GROUP BY film.",
          "SELECT f.title, COUNT(r.rental_id) AS rental_count FROM film f JOIN inventory i ON ... JOIN rental r ON ... GROUP BY f.film_id, f.title"
        ]
      },
      {
        id: "c3q8",
        band: "current",
        title: "Top 10 Hits",
        narrative: "\"Give me the top 10 most popular films by rental count. Our greatest hits.\"",
        task: "Top 10 most rented films.",
        sql: `select f.title, count(r.rental_id) as rental_count from film f join inventory i on f.film_id = i.film_id join rental r on i.inventory_id = r.inventory_id group by f.film_id, f.title order by rental_count desc limit 10`,
        expected_columns: ["title", "rental_count"],
        match_type: "top_n",
        hints: [
          "Same as the previous query but add LIMIT 10.",
          "... GROUP BY f.film_id, f.title ORDER BY rental_count DESC LIMIT 10"
        ]
      },
      {
        id: "c3q9",
        band: "current",
        title: "Genre Performance",
        narrative: "\"Forget individual films. Which genre category gets rented the most overall?\"",
        task: "Which film category generates the most rentals?",
        sql: `select c.name as category, count(r.rental_id) as rental_count from film_category fc join category c on fc.category_id = c.category_id join inventory i on fc.film_id = i.film_id join rental r on i.inventory_id = r.inventory_id group by c.name order by rental_count desc`,
        expected_columns: ["category", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN film_category → category, and film_category → inventory → rental. GROUP BY category name.",
          "SELECT c.name AS category, COUNT(r.rental_id) AS rental_count FROM film_category fc JOIN category c ON ... JOIN inventory i ON fc.film_id = i.film_id JOIN rental r ON ... GROUP BY c.name ORDER BY rental_count DESC"
        ]
      },
      {
        id: "c3q10",
        band: "rapids",
        title: "Dead Inventory",
        narrative: "Frank slams his coffee down. \"I want every film that has NEVER been rented. Not once. That's money sitting on a shelf doing absolutely nothing.\"",
        task: "Films that have never been rented.",
        sql: `select f.film_id, f.title from film f where f.film_id not in (select distinct i.film_id from inventory i join rental r on i.inventory_id = r.inventory_id) order by f.title`,
        expected_columns: ["film_id", "title"],
        match_type: "order_insensitive",
        hints: [
          "Find films whose film_id doesn't appear in the set of rented film_ids (through inventory+rental).",
          "SELECT f.film_id, f.title FROM film f WHERE f.film_id NOT IN (SELECT DISTINCT i.film_id FROM inventory i JOIN rental r ON i.inventory_id = r.inventory_id)"
        ]
      },
      {
        id: "c3q11",
        band: "rapids",
        title: "Single Store Films",
        narrative: "\"Some films are only stocked at one store. Find them — maybe that's why one store does better than the other.\"",
        task: "Films available in only one store.",
        sql: `select f.title, count(distinct i.store_id) as store_count from film f join inventory i on f.film_id = i.film_id group by f.film_id, f.title having count(distinct i.store_id) = 1 order by f.title`,
        expected_columns: ["title", "store_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN film and inventory, GROUP BY film, HAVING COUNT(DISTINCT store_id) = 1.",
          "SELECT f.title, COUNT(DISTINCT i.store_id) AS store_count FROM film f JOIN inventory i ON ... GROUP BY f.film_id, f.title HAVING COUNT(DISTINCT i.store_id) = 1"
        ]
      },
      {
        id: "c3q12",
        band: "rapids",
        title: "Category Averages",
        narrative: "\"What's the average number of rentals per film in each category? I want to compare genres fairly.\"",
        task: "Average rental count per film, grouped by category.",
        sql: `select c.name as category, round(avg(rental_count), 2) as avg_rentals from (select fc.category_id, f.film_id, count(r.rental_id) as rental_count from film f join film_category fc on f.film_id = fc.film_id left join inventory i on f.film_id = i.film_id left join rental r on i.inventory_id = r.inventory_id group by fc.category_id, f.film_id) sub join category c on sub.category_id = c.category_id group by c.name order by avg_rentals desc`,
        expected_columns: ["category", "avg_rentals"],
        match_type: "order_insensitive",
        hints: [
          "First get rental count per film (subquery), then AVG by category.",
          "Use a subquery to count rentals per film, then wrap it and GROUP BY category with AVG()."
        ]
      },
      {
        id: "c3q13",
        band: "waterfall",
        title: "Category Rankings",
        narrative: "\"Within each genre, rank the films by how many times they've been rented. I want to see the best and worst in each category.\"",
        task: "Rank films by rental count within each category.",
        sql: `select c.name as category, f.title, count(r.rental_id) as rental_count, rank() over (partition by c.name order by count(r.rental_id) desc) as category_rank from film f join film_category fc on f.film_id = fc.film_id join category c on fc.category_id = c.category_id left join inventory i on f.film_id = i.film_id left join rental r on i.inventory_id = r.inventory_id group by c.name, f.film_id, f.title`,
        expected_columns: ["category", "title", "rental_count", "category_rank"],
        match_type: "order_insensitive",
        hints: [
          "Use RANK() OVER (PARTITION BY category ORDER BY count DESC) as a window function.",
          "SELECT c.name AS category, f.title, COUNT(r.rental_id) AS rental_count, RANK() OVER (PARTITION BY c.name ORDER BY COUNT(r.rental_id) DESC) AS category_rank FROM film f JOIN film_category fc ON ... JOIN category c ON ... LEFT JOIN inventory i ON ... LEFT JOIN rental r ON ... GROUP BY c.name, f.film_id, f.title"
        ]
      },
      {
        id: "c3q14",
        band: "waterfall",
        title: "Dead Weight Percentage",
        narrative: "\"For each category, what percentage of films have never been rented? I want to know which genres have the most dead weight.\"",
        task: "For each category, percentage of films never rented.",
        sql: `with film_rentals as (select f.film_id, count(r.rental_id) as rental_count from film f left join inventory i on f.film_id = i.film_id left join rental r on i.inventory_id = r.inventory_id group by f.film_id) select c.name as category, count(*) as total_films, sum(case when fr.rental_count = 0 then 1 else 0 end) as never_rented, round(sum(case when fr.rental_count = 0 then 1 else 0 end) * 100.0 / count(*), 2) as dead_pct from film_category fc join category c on fc.category_id = c.category_id join film_rentals fr on fc.film_id = fr.film_id group by c.name order by dead_pct desc`,
        expected_columns: ["category", "total_films", "never_rented", "dead_pct"],
        match_type: "order_insensitive",
        hints: [
          "Use a CTE to get rental count per film, then join with categories and calculate the percentage of zero-rental films.",
          "WITH film_rentals AS (SELECT f.film_id, COUNT(r.rental_id) AS rental_count FROM film f LEFT JOIN inventory i ON ... LEFT JOIN rental r ON ... GROUP BY f.film_id) SELECT c.name, ..., ROUND(SUM(CASE WHEN rental_count = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS dead_pct FROM film_category fc JOIN ... GROUP BY c.name"
        ]
      }
    ]
  },

  // ── CASE 4: Gone Cold ──────────────────
  {
    id: 4,
    title: "Gone Cold",
    subtitle: "Customer Churn",
    tables: ["customer", "rental", "payment", "address", "city"],
    opening: `Frank is standing at the window, watching an empty parking lot. "We used to have regulars. People who came in every week. Families. Film buffs. They knew us by name." He turns around. "Now the parking lot's half empty and I don't know where they went. Did they move? Did we lose them? I need you to dig into the rental history and tell me who stopped coming — and when."`,
    closing: `The numbers don't lie. 441 customers rented in 2005 but never came back in 2006. The retention rate is just 26%. Frank reads the report quietly. "So three out of four customers from 2005 just... vanished." He sits back. "I thought we were a community. Turns out we were a convenience." He pauses. "Alright. If we're losing people, I at least want to know who our best ones are. The ones still spending."`,
    questions: [
      {
        id: "c4q1",
        band: "warm-up",
        title: "Day One",
        narrative: "\"When did this whole thing start? When was our very first rental?\"",
        task: "When was the first ever rental in our system?",
        sql: `select min(rental_date) as first_rental from rental`,
        expected_columns: ["first_rental"],
        match_type: "exact",
        hints: [
          "Use MIN() on the rental_date column.",
          "SELECT MIN(rental_date) AS first_rental FROM rental"
        ]
      },
      {
        id: "c4q2",
        band: "warm-up",
        title: "Last Activity",
        narrative: "\"And the most recent? When was the last time someone rented anything?\"",
        task: "When was the most recent rental?",
        sql: `select max(rental_date) as last_rental from rental`,
        expected_columns: ["last_rental"],
        match_type: "exact",
        hints: [
          "Use MAX() on rental_date.",
          "SELECT MAX(rental_date) AS last_rental FROM rental"
        ]
      },
      {
        id: "c4q3",
        band: "warm-up",
        title: "Year Over Year",
        narrative: "\"Compare 2005 and 2006. How many rentals each year? I need to see the trend.\"",
        task: "How many rentals happened in 2005 vs 2006?",
        sql: `select strftime('%Y', rental_date) as year, count(*) as rental_count from rental group by year`,
        expected_columns: ["year", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "Use strftime('%Y', rental_date) to extract the year, then GROUP BY.",
          "SELECT strftime('%Y', rental_date) AS year, COUNT(*) AS rental_count FROM rental GROUP BY year"
        ]
      },
      {
        id: "c4q4",
        band: "warm-up",
        title: "Active Renters",
        narrative: "\"How many customers have actually rented something? Not just registered — actually rented.\"",
        task: "List customers who have made at least one rental.",
        sql: `select distinct c.customer_id, c.first_name, c.last_name from customer c join rental r on c.customer_id = r.customer_id`,
        expected_columns: ["customer_id", "first_name", "last_name"],
        match_type: "order_insensitive",
        hints: [
          "JOIN customer with rental and use DISTINCT to avoid duplicates.",
          "SELECT DISTINCT c.customer_id, c.first_name, c.last_name FROM customer c JOIN rental r ON c.customer_id = r.customer_id"
        ]
      },
      {
        id: "c4q5",
        band: "current",
        title: "Lifetime Rentals",
        narrative: "\"How many rentals has each customer made? All time. The full history.\"",
        task: "Total rentals per customer.",
        sql: `select c.customer_id, c.first_name, c.last_name, count(*) as rental_count from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name order by rental_count desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN customer with rental, GROUP BY customer, COUNT the rentals.",
          "SELECT c.customer_id, c.first_name, c.last_name, COUNT(*) AS rental_count FROM customer c JOIN rental r ON ... GROUP BY c.customer_id, c.first_name, c.last_name ORDER BY rental_count DESC"
        ]
      },
      {
        id: "c4q6",
        band: "current",
        title: "2005 Champions",
        narrative: "\"Who were our top renters in 2005? The people who kept us alive that year.\"",
        task: "Top 10 customers by rental count in 2005.",
        sql: `select c.customer_id, c.first_name, c.last_name, count(*) as rental_count from customer c join rental r on c.customer_id = r.customer_id where strftime('%Y', r.rental_date) = '2005' group by c.customer_id, c.first_name, c.last_name order by rental_count desc limit 10`,
        expected_columns: ["customer_id", "first_name", "last_name", "rental_count"],
        match_type: "top_n",
        hints: [
          "Filter rentals to 2005 with WHERE, then GROUP BY customer and LIMIT 10.",
          "... WHERE strftime('%Y', r.rental_date) = '2005' GROUP BY ... ORDER BY rental_count DESC LIMIT 10"
        ]
      },
      {
        id: "c4q7",
        band: "current",
        title: "Average Engagement",
        narrative: "\"What's the average number of rentals per customer? I want to know what 'normal' looks like.\"",
        task: "Average number of rentals per customer.",
        sql: `select round(avg(cnt), 2) as avg_rentals_per_customer from (select count(*) as cnt from rental group by customer_id) sub`,
        expected_columns: ["avg_rentals_per_customer"],
        match_type: "exact",
        hints: [
          "First count rentals per customer in a subquery, then take the AVG.",
          "SELECT ROUND(AVG(cnt), 2) AS avg_rentals_per_customer FROM (SELECT COUNT(*) AS cnt FROM rental GROUP BY customer_id) sub"
        ]
      },
      {
        id: "c4q8",
        band: "current",
        title: "Power Users",
        narrative: "\"Find the heavy hitters — anyone who rented more than 30 times. Those are our power users.\"",
        task: "Customers who rented more than 30 times.",
        sql: `select c.customer_id, c.first_name, c.last_name, count(*) as rental_count from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name having count(*) > 30 order by rental_count desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "GROUP BY customer and use HAVING COUNT(*) > 30 to filter groups.",
          "... GROUP BY c.customer_id, c.first_name, c.last_name HAVING COUNT(*) > 30 ORDER BY rental_count DESC"
        ]
      },
      {
        id: "c4q9",
        band: "current",
        title: "Last Seen",
        narrative: "\"When was the last time each customer rented? I want to see who's gone quiet.\"",
        task: "Last rental date for each customer.",
        sql: `select c.customer_id, c.first_name, c.last_name, max(r.rental_date) as last_rental from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name order by last_rental desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "last_rental"],
        match_type: "order_insensitive",
        hints: [
          "Use MAX(rental_date) and GROUP BY customer.",
          "SELECT c.customer_id, c.first_name, c.last_name, MAX(r.rental_date) AS last_rental FROM customer c JOIN rental r ON ... GROUP BY ... ORDER BY last_rental DESC"
        ]
      },
      {
        id: "c4q10",
        band: "rapids",
        title: "The Disappeared",
        narrative: "Frank's voice drops. \"Find me everyone who rented in 2005 but never came back in 2006. Those are the ones we lost.\"",
        task: "Customers who rented in 2005 but not in 2006.",
        sql: `select distinct c.customer_id, c.first_name, c.last_name from customer c join rental r on c.customer_id = r.customer_id where strftime('%Y', r.rental_date) = '2005' and c.customer_id not in (select distinct customer_id from rental where strftime('%Y', rental_date) = '2006')`,
        expected_columns: ["customer_id", "first_name", "last_name"],
        match_type: "order_insensitive",
        hints: [
          "Use a subquery with NOT IN — find 2005 renters who aren't in the set of 2006 renters.",
          "SELECT DISTINCT c.customer_id, c.first_name, c.last_name FROM customer c JOIN rental r ON ... WHERE strftime('%Y', r.rental_date) = '2005' AND c.customer_id NOT IN (SELECT DISTINCT customer_id FROM rental WHERE strftime('%Y', rental_date) = '2006')"
        ]
      },
      {
        id: "c4q11",
        band: "rapids",
        title: "Gone 6 Months",
        narrative: "\"Who hasn't rented in over 6 months — compared to our most recent rental date? Those customers are basically gone.\"",
        task: "Customers whose last rental was over 6 months before the most recent rental in the system.",
        sql: `select c.customer_id, c.first_name, c.last_name, max(r.rental_date) as last_rental from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name having julianday((select max(rental_date) from rental)) - julianday(max(r.rental_date)) > 180`,
        expected_columns: ["customer_id", "first_name", "last_name", "last_rental"],
        match_type: "order_insensitive",
        hints: [
          "Use julianday() to calculate the difference in days. 6 months ≈ 180 days.",
          "... HAVING julianday((SELECT MAX(rental_date) FROM rental)) - julianday(MAX(r.rental_date)) > 180"
        ]
      },
      {
        id: "c4q12",
        band: "rapids",
        title: "Lost Whales",
        narrative: "\"Here's what scares me — top spenders who stopped coming. Find the top 20 by total spend whose last rental was more than 3 months old.\"",
        task: "Top 20 customers by total spend who haven't rented recently (last rental > 90 days before latest date).",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent, max(r.rental_date) as last_rental from customer c join payment p on c.customer_id = p.customer_id join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name having julianday((select max(rental_date) from rental)) - julianday(max(r.rental_date)) > 90 order by total_spent desc limit 20`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent", "last_rental"],
        match_type: "top_n",
        hints: [
          "JOIN customer with payment and rental, GROUP BY customer, HAVING on date difference, ORDER BY spend DESC.",
          "... HAVING julianday((SELECT MAX(rental_date) FROM rental)) - julianday(MAX(r.rental_date)) > 90 ORDER BY total_spent DESC LIMIT 20"
        ]
      },
      {
        id: "c4q13",
        band: "waterfall",
        title: "Customer Lifespan",
        narrative: "\"For each customer, how many months between their first and last rental? I want to know how long people stick with us.\"",
        task: "For each customer, months between first and last rental.",
        sql: `with spans as (select c.customer_id, c.first_name, c.last_name, min(r.rental_date) as first_rental, max(r.rental_date) as last_rental from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name) select customer_id, first_name, last_name, first_rental, last_rental, round((julianday(last_rental) - julianday(first_rental)) / 30, 1) as months_active from spans order by months_active desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "first_rental", "last_rental", "months_active"],
        match_type: "order_insensitive",
        hints: [
          "Use a CTE with MIN and MAX rental dates, then calculate the difference using julianday() divided by 30.",
          "WITH spans AS (SELECT ..., MIN(r.rental_date) AS first_rental, MAX(r.rental_date) AS last_rental FROM customer c JOIN rental r ON ... GROUP BY ...) SELECT ..., ROUND((julianday(last_rental) - julianday(first_rental)) / 30, 1) AS months_active FROM spans"
        ]
      },
      {
        id: "c4q14",
        band: "waterfall",
        title: "Churn Segments",
        narrative: "\"Segment every customer: Active, At Risk, or Churned. Based on when they last rented compared to our most recent date.\"",
        task: "Classify customers as Active / At Risk / Churned based on last rental date.",
        sql: `with customer_activity as (select c.customer_id, c.first_name, c.last_name, max(r.rental_date) as last_rental, julianday((select max(rental_date) from rental)) - julianday(max(r.rental_date)) as days_since from customer c join rental r on c.customer_id = r.customer_id group by c.customer_id, c.first_name, c.last_name) select customer_id, first_name, last_name, last_rental, round(days_since, 0) as days_since_last, case when days_since <= 30 then 'Active' when days_since <= 90 then 'At Risk' else 'Churned' end as status from customer_activity order by days_since`,
        expected_columns: ["customer_id", "first_name", "last_name", "last_rental", "days_since_last", "status"],
        match_type: "order_insensitive",
        hints: [
          "Use a CTE to calculate days since last rental for each customer, then CASE WHEN for segmentation.",
          "WITH customer_activity AS (SELECT ..., julianday((SELECT MAX(rental_date) FROM rental)) - julianday(MAX(r.rental_date)) AS days_since FROM ... GROUP BY ...) SELECT ..., CASE WHEN days_since <= 30 THEN 'Active' WHEN days_since <= 90 THEN 'At Risk' ELSE 'Churned' END AS status FROM customer_activity"
        ]
      }
    ]
  },

  // ── CASE 5: The Whale ──────────────────
  {
    id: 5,
    title: "The Whale",
    subtitle: "Customer Lifetime Value",
    tables: ["customer", "payment", "rental", "address", "city", "country"],
    opening: `Frank's holding a letter. Actual pen-and-paper letter. "I want to write a thank-you note to our best customer. Old school, I know. But first I need to know who that is." He puts the letter down. "Not just the person who rents the most — the person who SPENDS the most. Total lifetime value. I want to know who our whales are, where they're from, and which store they belong to."`,
    closing: `Karl Seal. $221.55 in lifetime spend. That's your whale. Frank reads the name and nods slowly. "Karl Seal. Cape Coral. I think I remember him." He picks up the pen. "The top 10 are spread across both stores, which is good. But look at this —" he points at the data. "Most of them are heavy renters too. Loyal people." He seals the envelope. "Now let's look at the staff."`,
    questions: [
      {
        id: "c5q1",
        band: "warm-up",
        title: "Customer Spend",
        narrative: "\"Total amount spent by each customer. Every dollar, all time.\"",
        task: "Total amount spent by each customer.",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name order by total_spent desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent"],
        match_type: "order_insensitive",
        hints: [
          "JOIN customer with payment, GROUP BY customer, SUM the amount.",
          "SELECT c.customer_id, c.first_name, c.last_name, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON ... GROUP BY ... ORDER BY total_spent DESC"
        ]
      },
      {
        id: "c5q2",
        band: "warm-up",
        title: "Number One",
        narrative: "\"Who spent the most? Just one name. That's who gets the letter.\"",
        task: "Who is the top spending customer?",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name order by total_spent desc limit 1`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent"],
        match_type: "exact",
        hints: [
          "Same as total spend per customer, but add LIMIT 1.",
          "... ORDER BY total_spent DESC LIMIT 1"
        ]
      },
      {
        id: "c5q3",
        band: "warm-up",
        title: "Top 10 Spenders",
        narrative: "\"Actually, give me the top 10. I'll send them all a coupon.\"",
        task: "Top 10 customers by total spend.",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name order by total_spent desc limit 10`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent"],
        match_type: "top_n",
        hints: [
          "ORDER BY total_spent DESC LIMIT 10.",
          "... ORDER BY total_spent DESC LIMIT 10"
        ]
      },
      {
        id: "c5q4",
        band: "warm-up",
        title: "Average Customer Value",
        narrative: "\"What does the average customer spend total? I want a baseline to compare against.\"",
        task: "Average total spend per customer.",
        sql: `select round(avg(total_spent), 2) as avg_customer_spend from (select sum(amount) as total_spent from payment group by customer_id) sub`,
        expected_columns: ["avg_customer_spend"],
        match_type: "exact",
        hints: [
          "First SUM per customer in a subquery, then AVG that.",
          "SELECT ROUND(AVG(total_spent), 2) AS avg_customer_spend FROM (SELECT SUM(amount) AS total_spent FROM payment GROUP BY customer_id) sub"
        ]
      },
      {
        id: "c5q5",
        band: "current",
        title: "Spend and Rentals",
        narrative: "\"For each customer, I want both — how much they spent AND how many times they rented.\"",
        task: "Total spend and total rentals per customer.",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent, count(p.payment_id) as total_rentals from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name order by total_spent desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent", "total_rentals"],
        match_type: "order_insensitive",
        hints: [
          "SUM(amount) for spend, COUNT(payment_id) for rental count, same GROUP BY.",
          "SELECT ..., SUM(p.amount) AS total_spent, COUNT(p.payment_id) AS total_rentals FROM customer c JOIN payment p ON ... GROUP BY ..."
        ]
      },
      {
        id: "c5q6",
        band: "current",
        title: "Spend per Rental",
        narrative: "\"Some people rent a lot of cheap films. Others rent fewer but expensive ones. What's each customer's average spend per rental?\"",
        task: "Average spend per rental by customer.",
        sql: `select c.customer_id, c.first_name, c.last_name, round(sum(p.amount) / count(p.payment_id), 2) as avg_per_rental from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name order by avg_per_rental desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "avg_per_rental"],
        match_type: "order_insensitive",
        hints: [
          "Divide SUM(amount) by COUNT(payment_id) for each customer.",
          "SELECT ..., ROUND(SUM(p.amount) / COUNT(p.payment_id), 2) AS avg_per_rental FROM customer c JOIN payment p ON ... GROUP BY ..."
        ]
      },
      {
        id: "c5q7",
        band: "current",
        title: "Top Spenders by Store",
        narrative: "\"Which store do our top 10 spenders belong to? I want to know which location keeps the whales.\"",
        task: "Top 10 customers by spend with their store.",
        sql: `select c.customer_id, c.first_name, c.last_name, c.store_id, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name, c.store_id order by total_spent desc limit 10`,
        expected_columns: ["customer_id", "first_name", "last_name", "store_id", "total_spent"],
        match_type: "top_n",
        hints: [
          "Add store_id to the SELECT and GROUP BY from your spend query.",
          "SELECT c.customer_id, c.first_name, c.last_name, c.store_id, SUM(p.amount) AS total_spent FROM ... GROUP BY c.customer_id, c.first_name, c.last_name, c.store_id ORDER BY total_spent DESC LIMIT 10"
        ]
      },
      {
        id: "c5q8",
        band: "current",
        title: "Store Champions",
        narrative: "\"Top 5 spenders from EACH store. I want to compare the best customers side by side.\"",
        task: "Top 5 customers per store by spend.",
        sql: `select * from (select c.customer_id, c.first_name, c.last_name, c.store_id, sum(p.amount) as total_spent, row_number() over (partition by c.store_id order by sum(p.amount) desc) as rn from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name, c.store_id) ranked where rn <= 5`,
        expected_columns: ["customer_id", "first_name", "last_name", "store_id", "total_spent", "rn"],
        match_type: "order_insensitive",
        hints: [
          "Use ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY spend DESC) then filter to top 5.",
          "SELECT * FROM (SELECT ..., ROW_NUMBER() OVER (PARTITION BY c.store_id ORDER BY SUM(p.amount) DESC) AS rn FROM ... GROUP BY ...) ranked WHERE rn <= 5"
        ]
      },
      {
        id: "c5q9",
        band: "current",
        title: "Above Average Spenders",
        narrative: "\"Who spends more than the average customer? I want to know how many 'above average' customers we have.\"",
        task: "Customers who spent more than the average customer total.",
        sql: `select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name having sum(p.amount) > (select avg(total_spent) from (select sum(amount) as total_spent from payment group by customer_id) sub) order by total_spent desc`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent"],
        match_type: "order_insensitive",
        hints: [
          "Use a subquery in HAVING to compare each customer's spend against the average.",
          "... HAVING SUM(p.amount) > (SELECT AVG(total_spent) FROM (SELECT SUM(amount) AS total_spent FROM payment GROUP BY customer_id) sub)"
        ]
      },
      {
        id: "c5q10",
        band: "rapids",
        title: "Full Profile",
        narrative: "\"For the top 10, I want everything. Name, city, country, total spend. The full picture.\"",
        task: "Full profile of top 10 customers — name, city, country, total spend.",
        sql: `select c.customer_id, c.first_name, c.last_name, ci.city, co.country, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id join address a on c.address_id = a.address_id join city ci on a.city_id = ci.city_id join country co on ci.country_id = co.country_id group by c.customer_id, c.first_name, c.last_name, ci.city, co.country order by total_spent desc limit 10`,
        expected_columns: ["customer_id", "first_name", "last_name", "city", "country", "total_spent"],
        match_type: "top_n",
        hints: [
          "4-table JOIN: customer → address → city → country, plus payment. GROUP BY all non-aggregated columns.",
          "SELECT c.customer_id, c.first_name, c.last_name, ci.city, co.country, SUM(p.amount) AS total_spent FROM customer c JOIN payment p ON ... JOIN address a ON ... JOIN city ci ON ... JOIN country co ON ... GROUP BY ... ORDER BY total_spent DESC LIMIT 10"
        ]
      },
      {
        id: "c5q11",
        band: "rapids",
        title: "Whale's Timeline",
        narrative: "\"Show me Karl Seal's spending month by month. I want to see when he was most active.\"",
        task: "Month-by-month spend for the top customer (customer_id 526).",
        sql: `select strftime('%Y-%m', payment_date) as month, sum(amount) as monthly_spend from payment where customer_id = 526 group by month order by month`,
        expected_columns: ["month", "monthly_spend"],
        match_type: "exact",
        hints: [
          "Filter to customer_id 526, GROUP BY month using strftime.",
          "SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount) AS monthly_spend FROM payment WHERE customer_id = 526 GROUP BY month ORDER BY month"
        ]
      },
      {
        id: "c5q12",
        band: "rapids",
        title: "Top 10 Percent",
        narrative: "\"Which customers are in the top 10% by spend? That's our VIP list.\"",
        task: "Customers in the top 10% by total spend.",
        sql: `select customer_id, first_name, last_name, total_spent from (select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent, ntile(10) over (order by sum(p.amount) desc) as decile from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name) ranked where decile = 1`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent"],
        match_type: "order_insensitive",
        hints: [
          "Use NTILE(10) to divide customers into deciles by spend, then filter to the top decile.",
          "SELECT ... FROM (SELECT ..., NTILE(10) OVER (ORDER BY SUM(p.amount) DESC) AS decile FROM ... GROUP BY ...) ranked WHERE decile = 1"
        ]
      },
      {
        id: "c5q13",
        band: "waterfall",
        title: "Value Rankings",
        narrative: "\"Rank every customer by lifetime value. And show a running total — I want to see how the revenue accumulates across customers.\"",
        task: "Rank all customers by lifetime value with running total.",
        sql: `select customer_id, first_name, last_name, total_spent, rank() over (order by total_spent desc) as value_rank, sum(total_spent) over (order by total_spent desc) as running_total from (select c.customer_id, c.first_name, c.last_name, sum(p.amount) as total_spent from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id, c.first_name, c.last_name) sub`,
        expected_columns: ["customer_id", "first_name", "last_name", "total_spent", "value_rank", "running_total"],
        match_type: "order_insensitive",
        hints: [
          "Use RANK() and SUM() OVER (ORDER BY total_spent DESC) as window functions on a subquery.",
          "SELECT ..., RANK() OVER (ORDER BY total_spent DESC) AS value_rank, SUM(total_spent) OVER (ORDER BY total_spent DESC) AS running_total FROM (SELECT ... SUM(p.amount) AS total_spent FROM ... GROUP BY ...) sub"
        ]
      },
      {
        id: "c5q14",
        band: "waterfall",
        title: "Customer Segments",
        narrative: "\"Segment all customers into four tiers: High Value, Mid-High, Mid-Low, and Low. Based on spend quartiles. I want to see how much of our revenue comes from each tier.\"",
        task: "Customer segments — High Value / Mid-High / Mid-Low / Low based on spend quartile.",
        sql: `select case when quartile = 1 then 'High Value' when quartile = 2 then 'Mid-High' when quartile = 3 then 'Mid-Low' else 'Low' end as segment, count(*) as customer_count, round(sum(total_spent), 2) as segment_revenue from (select c.customer_id, sum(p.amount) as total_spent, ntile(4) over (order by sum(p.amount) desc) as quartile from customer c join payment p on c.customer_id = p.customer_id group by c.customer_id) sub group by quartile order by quartile`,
        expected_columns: ["segment", "customer_count", "segment_revenue"],
        match_type: "exact",
        hints: [
          "Use NTILE(4) to split customers into quartiles by spend, then label with CASE WHEN.",
          "SELECT CASE WHEN quartile = 1 THEN 'High Value' ... END AS segment, COUNT(*) AS customer_count, ROUND(SUM(total_spent), 2) AS segment_revenue FROM (SELECT ..., NTILE(4) OVER (ORDER BY SUM(p.amount) DESC) AS quartile FROM ... GROUP BY ...) sub GROUP BY quartile"
        ]
      }
    ]
  },

  // ── CASE 6: Staff Under the Lens ──────────────────
  {
    id: 6,
    title: "Staff Under the Lens",
    subtitle: "Staff Performance & Fraud Detection",
    tables: ["staff", "payment", "rental", "store", "customer", "inventory", "film", "film_category", "category"],
    opening: `Frank closes the office door. He doesn't sit down. "I need to talk about my managers. Mike runs Store 1. Jon runs Store 2." He pauses. "The numbers are close — too close in some ways, off in others. I can't tell if Jon is underperforming or if he just got dealt a bad hand." He leans in. "I'm not accusing anyone of anything. But I need to see the data. Staff performance, payment patterns, the works. If there's something wrong, I need to know before my accountant finds it."`,
    closing: `The data tells a story Frank didn't expect. Mike and Jon process nearly identical volumes. Revenue is close. There are zero rentals without payments — no fraud signal. But when you break it down by film category, the stores diverge. Store 2's inventory is heavier on lower-performing categories. "So it's not Jon," Frank says slowly. "It's the inventory he was given." He stares at the report. "Someone made bad purchasing decisions for Store 2. And Jon's been working with a weaker hand this whole time." He folds the paper. "One more report. Then I make my decision."`,
    questions: [
      {
        id: "c6q1",
        band: "warm-up",
        title: "The Two Managers",
        narrative: "\"Let's start simple. Show me both staff members and which store they run.\"",
        task: "List both staff members with their store.",
        sql: `select s.staff_id, s.first_name, s.last_name, s.store_id from staff s`,
        expected_columns: ["staff_id", "first_name", "last_name", "store_id"],
        match_type: "order_insensitive",
        hints: [
          "Simple SELECT from the staff table.",
          "SELECT s.staff_id, s.first_name, s.last_name, s.store_id FROM staff s"
        ]
      },
      {
        id: "c6q2",
        band: "warm-up",
        title: "Payment Totals",
        narrative: "\"Total payments processed by each staff member. Who brought in more money?\"",
        task: "Total payments processed by each staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, sum(p.amount) as total_revenue from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "total_revenue"],
        match_type: "order_insensitive",
        hints: [
          "JOIN payment with staff, GROUP BY staff, SUM the amounts.",
          "SELECT s.staff_id, s.first_name, s.last_name, SUM(p.amount) AS total_revenue FROM payment p JOIN staff s ON ... GROUP BY ..."
        ]
      },
      {
        id: "c6q3",
        band: "warm-up",
        title: "Rental Volume",
        narrative: "\"How many rentals did each staff member process? Not revenue — just the count.\"",
        task: "Total rentals handled by each staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, count(*) as rental_count from rental r join staff s on r.staff_id = s.staff_id group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "JOIN rental with staff, GROUP BY staff, COUNT the rentals.",
          "SELECT s.staff_id, s.first_name, s.last_name, COUNT(*) AS rental_count FROM rental r JOIN staff s ON ... GROUP BY ..."
        ]
      },
      {
        id: "c6q4",
        band: "warm-up",
        title: "Average Transaction",
        narrative: "\"What's the average payment amount each staff member processes? Are they renting the same types of films?\"",
        task: "Average payment amount per staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, round(avg(p.amount), 2) as avg_payment from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "avg_payment"],
        match_type: "order_insensitive",
        hints: [
          "Use AVG(amount) instead of SUM, same GROUP BY.",
          "SELECT s.staff_id, s.first_name, s.last_name, ROUND(AVG(p.amount), 2) AS avg_payment FROM payment p JOIN staff s ON ... GROUP BY ..."
        ]
      },
      {
        id: "c6q5",
        band: "current",
        title: "Monthly Breakdown",
        narrative: "\"Revenue per staff member, broken down by month. I want to see the trend for each.\"",
        task: "Revenue per staff member per month.",
        sql: `select s.first_name, strftime('%Y-%m', p.payment_date) as month, sum(p.amount) as revenue from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, month order by month, s.first_name`,
        expected_columns: ["first_name", "month", "revenue"],
        match_type: "exact",
        hints: [
          "GROUP BY staff and month (strftime), ORDER BY month, then staff first_name.",
          "SELECT s.first_name, strftime('%Y-%m', p.payment_date) AS month, SUM(p.amount) AS revenue FROM payment p JOIN staff s ON ... GROUP BY s.staff_id, s.first_name, month ORDER BY month, s.first_name"
        ]
      },
      {
        id: "c6q6",
        band: "current",
        title: "Customer Reach",
        narrative: "\"How many unique customers has each staff member served? I want to know their reach.\"",
        task: "Number of unique customers served by each staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, count(distinct r.customer_id) as unique_customers from rental r join staff s on r.staff_id = s.staff_id group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "unique_customers"],
        match_type: "order_insensitive",
        hints: [
          "Use COUNT(DISTINCT customer_id) to count unique customers.",
          "SELECT s.staff_id, s.first_name, s.last_name, COUNT(DISTINCT r.customer_id) AS unique_customers FROM rental r JOIN staff s ON ... GROUP BY ..."
        ]
      },
      {
        id: "c6q7",
        band: "current",
        title: "High-Value Transactions",
        narrative: "\"Which staff member handles more high-value payments — anything above $5?\"",
        task: "Count of payments above $5 per staff member.",
        sql: `select s.staff_id, s.first_name, s.last_name, count(*) as high_value_count from payment p join staff s on p.staff_id = s.staff_id where p.amount > 5 group by s.staff_id, s.first_name, s.last_name`,
        expected_columns: ["staff_id", "first_name", "last_name", "high_value_count"],
        match_type: "order_insensitive",
        hints: [
          "Add WHERE amount > 5 before the GROUP BY.",
          "SELECT s.staff_id, s.first_name, s.last_name, COUNT(*) AS high_value_count FROM payment p JOIN staff s ON ... WHERE p.amount > 5 GROUP BY ..."
        ]
      },
      {
        id: "c6q8",
        band: "current",
        title: "Busiest Days",
        narrative: "\"Which day of the week is busiest for each staff member? Are there scheduling patterns?\"",
        task: "Busiest day of the week for each staff member.",
        sql: `select s.first_name, case cast(strftime('%w', r.rental_date) as integer) when 0 then 'Sunday' when 1 then 'Monday' when 2 then 'Tuesday' when 3 then 'Wednesday' when 4 then 'Thursday' when 5 then 'Friday' when 6 then 'Saturday' end as day_of_week, count(*) as rental_count from rental r join staff s on r.staff_id = s.staff_id group by s.staff_id, s.first_name, day_of_week order by s.first_name, rental_count desc`,
        expected_columns: ["first_name", "day_of_week", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "Use strftime('%w', rental_date) to get day of week (0=Sunday), then GROUP BY staff and day.",
          "SELECT s.first_name, CASE CAST(strftime('%w', r.rental_date) AS INTEGER) WHEN 0 THEN 'Sunday' ... END AS day_of_week, COUNT(*) AS rental_count FROM rental r JOIN staff s ON ... GROUP BY s.staff_id, s.first_name, day_of_week"
        ]
      },
      {
        id: "c6q9",
        band: "current",
        title: "Category Performance",
        narrative: "\"Break it down by film category for each store. I want to see which genres each store rents more of.\"",
        task: "Rental count by film category per store.",
        sql: `select s.store_id, c.name as category, count(*) as rental_count from rental r join staff s on r.staff_id = s.staff_id join inventory i on r.inventory_id = i.inventory_id join film_category fc on i.film_id = fc.film_id join category c on fc.category_id = c.category_id group by s.store_id, c.name order by s.store_id, rental_count desc`,
        expected_columns: ["store_id", "category", "rental_count"],
        match_type: "order_insensitive",
        hints: [
          "Multi-table JOIN: rental → staff, rental → inventory → film_category → category. GROUP BY store_id and category.",
          "SELECT s.store_id, c.name AS category, COUNT(*) AS rental_count FROM rental r JOIN staff s ON ... JOIN inventory i ON ... JOIN film_category fc ON ... JOIN category c ON ... GROUP BY s.store_id, c.name ORDER BY s.store_id, rental_count DESC"
        ]
      },
      {
        id: "c6q10",
        band: "rapids",
        title: "Missing Payments",
        narrative: "Frank lowers his voice. \"Are there any rentals with NO payment? That's a red flag. Could be an error. Could be worse.\"",
        task: "Rentals with no corresponding payment.",
        sql: `select r.rental_id, r.rental_date, r.customer_id, r.staff_id from rental r left join payment p on r.rental_id = p.rental_id where p.payment_id is null`,
        expected_columns: ["rental_id", "rental_date", "customer_id", "staff_id"],
        match_type: "order_insensitive",
        hints: [
          "LEFT JOIN rental with payment, then WHERE payment_id IS NULL.",
          "SELECT r.rental_id, r.rental_date, r.customer_id, r.staff_id FROM rental r LEFT JOIN payment p ON r.rental_id = p.rental_id WHERE p.payment_id IS NULL"
        ]
      },
      {
        id: "c6q11",
        band: "rapids",
        title: "After Hours",
        narrative: "\"Payments outside normal hours — before 8 AM or after 10 PM. Could be nothing. Could be something.\"",
        task: "Payments processed outside normal hours (before 8 AM or after 10 PM).",
        sql: `select payment_id, customer_id, staff_id, amount, payment_date from payment where cast(strftime('%H', payment_date) as integer) < 8 or cast(strftime('%H', payment_date) as integer) >= 22`,
        expected_columns: ["payment_id", "customer_id", "staff_id", "amount", "payment_date"],
        match_type: "order_insensitive",
        hints: [
          "Use strftime('%H', payment_date) to extract the hour, then filter.",
          "SELECT ... FROM payment WHERE CAST(strftime('%H', payment_date) AS INTEGER) < 8 OR CAST(strftime('%H', payment_date) AS INTEGER) >= 22"
        ]
      },
      {
        id: "c6q12",
        band: "rapids",
        title: "Month Over Month",
        narrative: "\"Show me the month-over-month revenue change for each staff member. Are they trending up or down?\"",
        task: "Month-over-month revenue change per staff member.",
        sql: `with monthly as (select s.staff_id, s.first_name, strftime('%Y-%m', p.payment_date) as month, sum(p.amount) as revenue from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, month) select first_name, month, revenue, lag(revenue) over (partition by staff_id order by month) as prev_month, round(revenue - lag(revenue) over (partition by staff_id order by month), 2) as revenue_change from monthly order by first_name, month`,
        expected_columns: ["first_name", "month", "revenue", "prev_month", "revenue_change"],
        match_type: "exact",
        hints: [
          "Use a CTE for monthly revenue per staff, then LAG() window function for the previous month. ORDER BY first_name, month.",
          "WITH monthly AS (SELECT ..., strftime('%Y-%m', ...) AS month, SUM(...) AS revenue FROM ... GROUP BY ...) SELECT ..., LAG(revenue) OVER (PARTITION BY staff_id ORDER BY month) AS prev_month, revenue - LAG(...) ... AS revenue_change FROM monthly ORDER BY first_name, month"
        ]
      },
      {
        id: "c6q13",
        band: "waterfall",
        title: "Performance Rank",
        narrative: "\"Rank each staff member's monthly revenue over time. I want to see who wins each month.\"",
        task: "Rank each staff member's monthly revenue.",
        sql: `select s.first_name, strftime('%Y-%m', p.payment_date) as month, sum(p.amount) as revenue, rank() over (partition by strftime('%Y-%m', p.payment_date) order by sum(p.amount) desc) as monthly_rank from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, month order by month, monthly_rank`,
        expected_columns: ["first_name", "month", "revenue", "monthly_rank"],
        match_type: "exact",
        hints: [
          "Use RANK() OVER (PARTITION BY month ORDER BY revenue DESC).",
          "SELECT s.first_name, strftime('%Y-%m', ...) AS month, SUM(p.amount) AS revenue, RANK() OVER (PARTITION BY ... ORDER BY SUM(p.amount) DESC) AS monthly_rank FROM payment p JOIN staff s ON ... GROUP BY ... ORDER BY month"
        ]
      },
      {
        id: "c6q14",
        band: "waterfall",
        title: "Revenue Share",
        narrative: "\"For each month, what percentage of total revenue did each staff member contribute? I want to see the split.\"",
        task: "Each staff member's revenue as percentage of monthly total.",
        sql: `with monthly as (select s.staff_id, s.first_name, strftime('%Y-%m', p.payment_date) as month, sum(p.amount) as revenue from payment p join staff s on p.staff_id = s.staff_id group by s.staff_id, s.first_name, month) select first_name, month, revenue, sum(revenue) over (partition by month) as month_total, round(revenue * 100.0 / sum(revenue) over (partition by month), 2) as revenue_pct from monthly order by month, first_name`,
        expected_columns: ["first_name", "month", "revenue", "month_total", "revenue_pct"],
        match_type: "exact",
        hints: [
          "Use a CTE for monthly revenue, then SUM() OVER (PARTITION BY month) for the monthly total, and divide.",
          "WITH monthly AS (...) SELECT first_name, month, revenue, SUM(revenue) OVER (PARTITION BY month) AS month_total, ROUND(revenue * 100.0 / SUM(revenue) OVER (PARTITION BY month), 2) AS revenue_pct FROM monthly"
        ]
      }
    ]
  },

  // ── CASE 7: The Final Verdict ──────────────────
  {
    id: 7,
    title: "The Final Verdict",
    subtitle: "Executive Report",
    tables: ["All 16 tables"],
    opening: `Frank's wearing a tie. First time you've seen that. "My accountant, my lawyer, and a potential buyer are sitting in the conference room." He straightens the tie in the reflection of the monitor. "I need everything. Total revenue. Total customers. Store comparison. The works. This is the report that decides what happens to Sakila Video." He looks at you. "Make it count."`,
    closing: `The report lands on the conference table. Every number tells a story: $67,406 in total revenue. 599 customers. 16,044 rentals. Store 2 actually edges out Store 1 in revenue despite having fewer customers — but the inventory data reveals why Jon's store felt underperforming. It wasn't the manager. It was the catalog he was given. Frank reads the final page about GINA DEGENERES — the actor whose films generated the most revenue. He almost smiles. "You know what the data says? It says this business is worth saving. It just needs someone who reads the numbers." He shakes your hand. "That someone is you. Welcome aboard, Detective."`,
    questions: [
      {
        id: "c7q1",
        band: "warm-up",
        title: "The Big Three",
        narrative: "Frank straightens his tie. \"Total revenue. Total rentals. Total customers. One query. Go.\"",
        task: "Total revenue, total rentals, and total customers in one query.",
        sql: `select (select sum(amount) from payment) as total_revenue, (select count(*) from rental) as total_rentals, (select count(*) from customer) as total_customers`,
        expected_columns: ["total_revenue", "total_rentals", "total_customers"],
        match_type: "exact",
        hints: [
          "Use scalar subqueries — each aggregate in its own SELECT from its own table.",
          "SELECT (SELECT SUM(amount) FROM payment) AS total_revenue, (SELECT COUNT(*) FROM rental) AS total_rentals, (SELECT COUNT(*) FROM customer) AS total_customers"
        ]
      },
      {
        id: "c7q2",
        band: "warm-up",
        title: "Store Split",
        narrative: "\"Revenue and rentals by store. The buyer wants to know which location performs better.\"",
        task: "Revenue and rental count split by store.",
        sql: `select s.store_id, sum(p.amount) as total_revenue, count(distinct p.rental_id) as total_rentals from payment p join staff s on p.staff_id = s.staff_id group by s.store_id`,
        expected_columns: ["store_id", "total_revenue", "total_rentals"],
        match_type: "order_insensitive",
        hints: [
          "JOIN payment with staff for store_id, GROUP BY store.",
          "SELECT s.store_id, SUM(p.amount) AS total_revenue, COUNT(DISTINCT p.rental_id) AS total_rentals FROM payment p JOIN staff s ON ... GROUP BY s.store_id"
        ]
      },
      {
        id: "c7q3",
        band: "warm-up",
        title: "Catalog Overview",
        narrative: "\"Full catalog summary. How many films, average rental rate, average replacement cost.\"",
        task: "Film catalog summary — total films, average rental rate, average replacement cost.",
        sql: `select count(*) as total_films, round(avg(rental_rate), 2) as avg_rental_rate, round(avg(replacement_cost), 2) as avg_replacement_cost from film`,
        expected_columns: ["total_films", "avg_rental_rate", "avg_replacement_cost"],
        match_type: "exact",
        hints: [
          "Three aggregate functions on the film table.",
          "SELECT COUNT(*) AS total_films, ROUND(AVG(rental_rate), 2) AS avg_rental_rate, ROUND(AVG(replacement_cost), 2) AS avg_replacement_cost FROM film"
        ]
      },
      {
        id: "c7q4",
        band: "warm-up",
        title: "Customer Census",
        narrative: "\"Customer breakdown by store — total, active, inactive. The lawyer needs this for due diligence.\"",
        task: "Customer summary — total, active, and inactive per store.",
        sql: `select store_id, count(*) as total, sum(case when active = 1 then 1 else 0 end) as active, sum(case when active = 0 then 1 else 0 end) as inactive from customer group by store_id`,
        expected_columns: ["store_id", "total", "active", "inactive"],
        match_type: "order_insensitive",
        hints: [
          "Use CASE WHEN inside SUM() to count active and inactive separately.",
          "SELECT store_id, COUNT(*) AS total, SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active, SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive FROM customer GROUP BY store_id"
        ]
      },
      {
        id: "c7q5",
        band: "current",
        title: "Revenue Drivers",
        narrative: "\"Top 5 films by revenue generated. Which titles actually made us money?\"",
        task: "Top 5 films by total revenue.",
        sql: `select f.title, sum(p.amount) as revenue from payment p join rental r on p.rental_id = r.rental_id join inventory i on r.inventory_id = i.inventory_id join film f on i.film_id = f.film_id group by f.film_id, f.title order by revenue desc limit 5`,
        expected_columns: ["title", "revenue"],
        match_type: "top_n",
        hints: [
          "JOIN payment → rental → inventory → film, GROUP BY film, ORDER BY revenue.",
          "SELECT f.title, SUM(p.amount) AS revenue FROM payment p JOIN rental r ON ... JOIN inventory i ON ... JOIN film f ON ... GROUP BY f.film_id, f.title ORDER BY revenue DESC LIMIT 5"
        ]
      },
      {
        id: "c7q6",
        band: "current",
        title: "Genre Revenue",
        narrative: "\"Top 5 categories by revenue. What genres are making us the most money?\"",
        task: "Top 5 film categories by revenue.",
        sql: `select c.name as category, sum(p.amount) as revenue from payment p join rental r on p.rental_id = r.rental_id join inventory i on r.inventory_id = i.inventory_id join film_category fc on i.film_id = fc.film_id join category c on fc.category_id = c.category_id group by c.name order by revenue desc limit 5`,
        expected_columns: ["category", "revenue"],
        match_type: "top_n",
        hints: [
          "JOIN payment → rental → inventory → film_category → category, GROUP BY category.",
          "SELECT c.name AS category, SUM(p.amount) AS revenue FROM payment p JOIN rental r ON ... JOIN inventory i ON ... JOIN film_category fc ON ... JOIN category c ON ... GROUP BY c.name ORDER BY revenue DESC LIMIT 5"
        ]
      },
      {
        id: "c7q7",
        band: "current",
        title: "Revenue Timeline",
        narrative: "\"Monthly revenue trend, start to finish. The accountant needs to see the full picture.\"",
        task: "Monthly revenue trend — full timeline.",
        sql: `select strftime('%Y-%m', payment_date) as month, sum(amount) as revenue from payment group by month order by month`,
        expected_columns: ["month", "revenue"],
        match_type: "exact",
        hints: [
          "GROUP BY month using strftime, ORDER BY month.",
          "SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount) AS revenue FROM payment GROUP BY month ORDER BY month"
        ]
      },
      {
        id: "c7q8",
        band: "current",
        title: "Growth Curve",
        narrative: "\"How many new customers registered each month? Show me the growth curve.\"",
        task: "Customer acquisition per month.",
        sql: `select strftime('%Y-%m', create_date) as month, count(*) as new_customers from customer group by month order by month`,
        expected_columns: ["month", "new_customers"],
        match_type: "exact",
        hints: [
          "GROUP BY month from create_date using strftime.",
          "SELECT strftime('%Y-%m', create_date) AS month, COUNT(*) AS new_customers FROM customer GROUP BY month ORDER BY month"
        ]
      },
      {
        id: "c7q9",
        band: "current",
        title: "Inventory Utilization",
        narrative: "\"What percentage of our inventory has been rented at least once? Are we using what we've got?\"",
        task: "Percentage of inventory items rented at least once.",
        sql: `select round(count(distinct case when r.rental_id is not null then i.inventory_id end) * 100.0 / count(distinct i.inventory_id), 2) as utilization_pct from inventory i left join rental r on i.inventory_id = r.inventory_id`,
        expected_columns: ["utilization_pct"],
        match_type: "exact",
        hints: [
          "LEFT JOIN inventory with rental, count distinct inventory_ids that have rentals vs total.",
          "SELECT ROUND(COUNT(DISTINCT CASE WHEN r.rental_id IS NOT NULL THEN i.inventory_id END) * 100.0 / COUNT(DISTINCT i.inventory_id), 2) AS utilization_pct FROM inventory i LEFT JOIN rental r ON ..."
        ]
      },
      {
        id: "c7q10",
        band: "rapids",
        title: "Financial Risk",
        narrative: "\"Films with high replacement cost that have NEVER been rented. That's money at risk — expensive shelf decorations.\"",
        task: "Films with replacement cost above $20 that have never been rented.",
        sql: `select f.title, f.replacement_cost from film f where f.replacement_cost > 20 and f.film_id not in (select distinct i.film_id from inventory i join rental r on i.inventory_id = r.inventory_id) order by f.replacement_cost desc`,
        expected_columns: ["title", "replacement_cost"],
        match_type: "order_insensitive",
        hints: [
          "Filter film by replacement_cost > 20 and film_id NOT IN the set of rented films.",
          "SELECT f.title, f.replacement_cost FROM film f WHERE f.replacement_cost > 20 AND f.film_id NOT IN (SELECT DISTINCT i.film_id FROM inventory i JOIN rental r ON ...) ORDER BY f.replacement_cost DESC"
        ]
      },
      {
        id: "c7q11",
        band: "rapids",
        title: "Retention Rate",
        narrative: "\"What percentage of customers who rented in 2005 also rented in 2006? That's our retention rate.\"",
        task: "Customer retention rate — percentage who rented in both 2005 and 2006.",
        sql: `select round( (select count(distinct customer_id) from rental where strftime('%Y', rental_date) = '2005' and customer_id in (select distinct customer_id from rental where strftime('%Y', rental_date) = '2006')) * 100.0 / (select count(distinct customer_id) from rental where strftime('%Y', rental_date) = '2005'), 2) as retention_pct`,
        expected_columns: ["retention_pct"],
        match_type: "exact",
        hints: [
          "Count customers in both years divided by count of 2005 customers, times 100.",
          "SELECT ROUND((SELECT COUNT(DISTINCT customer_id) FROM rental WHERE year = '2005' AND customer_id IN (SELECT ... WHERE year = '2006')) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM rental WHERE year = '2005'), 2) AS retention_pct"
        ]
      },
      {
        id: "c7q12",
        band: "rapids",
        title: "Category × Store",
        narrative: "\"Revenue per category, per store. I want to see which store has better-performing genres.\"",
        task: "Revenue per film category per store.",
        sql: `select c.name as category, s.store_id, sum(p.amount) as revenue from payment p join rental r on p.rental_id = r.rental_id join inventory i on r.inventory_id = i.inventory_id join film_category fc on i.film_id = fc.film_id join category c on fc.category_id = c.category_id join staff s on p.staff_id = s.staff_id group by c.name, s.store_id order by c.name, s.store_id`,
        expected_columns: ["category", "store_id", "revenue"],
        match_type: "order_insensitive",
        hints: [
          "Multi-table JOIN: payment → rental → inventory → film_category → category, and payment → staff for store. GROUP BY category and store.",
          "SELECT c.name AS category, s.store_id, SUM(p.amount) AS revenue FROM payment p JOIN rental r ON ... JOIN inventory i ON ... JOIN film_category fc ON ... JOIN category c ON ... JOIN staff s ON ... GROUP BY c.name, s.store_id"
        ]
      },
      {
        id: "c7q13",
        band: "waterfall",
        title: "Store Scorecard",
        narrative: "\"Full store comparison. Every KPI side by side. This is the slide that decides everything.\"",
        task: "Full store comparison — revenue, rentals, customers, avg per rental — using CTEs.",
        sql: `with store_stats as (select s.store_id, sum(p.amount) as total_revenue, count(distinct p.rental_id) as total_rentals, count(distinct r.customer_id) as total_customers from payment p join staff s on p.staff_id = s.staff_id join rental r on p.rental_id = r.rental_id group by s.store_id) select store_id, round(total_revenue, 2) as total_revenue, total_rentals, total_customers, round(total_revenue / total_rentals, 2) as avg_per_rental from store_stats`,
        expected_columns: ["store_id", "total_revenue", "total_rentals", "total_customers", "avg_per_rental"],
        match_type: "order_insensitive",
        hints: [
          "Use a CTE to calculate all metrics per store, then SELECT from it.",
          "WITH store_stats AS (SELECT s.store_id, SUM(p.amount) AS total_revenue, COUNT(DISTINCT ...) AS total_rentals, COUNT(DISTINCT ...) AS total_customers FROM payment p JOIN staff s ON ... JOIN rental r ON ... GROUP BY s.store_id) SELECT store_id, ..., ROUND(total_revenue / total_rentals, 2) AS avg_per_rental FROM store_stats"
        ]
      },
      {
        id: "c7q14",
        band: "waterfall",
        title: "Star Power",
        narrative: "\"One last question. Which actor's films generate the most rental revenue? I want the name for the buyer's presentation.\"",
        task: "Top actor by total rental revenue generated.",
        sql: `select a.first_name, a.last_name, sum(p.amount) as total_revenue from actor a join film_actor fa on a.actor_id = fa.actor_id join inventory i on fa.film_id = i.film_id join rental r on i.inventory_id = r.inventory_id join payment p on r.rental_id = p.rental_id group by a.actor_id, a.first_name, a.last_name order by total_revenue desc limit 1`,
        expected_columns: ["first_name", "last_name", "total_revenue"],
        match_type: "exact",
        hints: [
          "5-table JOIN: actor → film_actor → inventory → rental → payment. GROUP BY actor, ORDER BY revenue.",
          "SELECT a.first_name, a.last_name, SUM(p.amount) AS total_revenue FROM actor a JOIN film_actor fa ON ... JOIN inventory i ON fa.film_id = i.film_id JOIN rental r ON ... JOIN payment p ON ... GROUP BY a.actor_id, a.first_name, a.last_name ORDER BY total_revenue DESC LIMIT 1"
        ]
      }
    ]
  }
];

// Make available globally
window.CASES = CASES;
