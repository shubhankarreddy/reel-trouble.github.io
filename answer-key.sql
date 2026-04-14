-- ═══════════════════════════════════════════════════════════════════════
-- Reel Trouble — Answer Key
-- SQL Detective Game · Sakila Video Database
-- 98 canonical solutions across 7 cases
-- ═══════════════════════════════════════════════════════════════════════
--
-- Engine: SQLite (via SQL.js in-browser)
-- Note:   SQLite differs from MySQL in a few places —
--           YEAR(col)          → strftime('%Y', col)
--           DATE_FORMAT(col)   → strftime('%Y-%m', col)
--           DATEDIFF(a, b)     → julianday(a) - julianday(b)
--           DAYOFWEEK(col)     → CAST(strftime('%w', col) AS INTEGER)
--           HOUR(col)          → CAST(strftime('%H', col) AS INTEGER)
-- ═══════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────
-- CASE 1 — New Kid on the Block  (Customer Data Audit)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | The Roster
SELECT first_name, last_name, email
FROM customer;

-- Q2 | Store One Roll Call
SELECT first_name, last_name, email
FROM customer
WHERE store_id = 1;

-- Q3 | Alphabetical Order
SELECT first_name, last_name, email
FROM customer
ORDER BY last_name ASC;

-- Q4 | Head Count
SELECT count(*) AS total_customers
FROM customer;

-- Q5 | Store Breakdown
SELECT store_id, count(*) AS customer_count
FROM customer
GROUP BY store_id;

-- Q6 | Ghost Customers
SELECT customer_id, first_name, last_name, email
FROM customer
WHERE active = 0;

-- Q7 | Missing Contacts
SELECT customer_id, first_name, last_name, email
FROM customer
WHERE email IS NULL;

-- Q8 | Fresh Faces
SELECT customer_id, first_name, last_name, create_date
FROM customer
ORDER BY create_date DESC
LIMIT 10;

-- Q9 | City Hotspots
SELECT ci.city, count(*) AS customer_count
FROM customer c
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
GROUP BY ci.city
ORDER BY customer_count DESC
LIMIT 5;

-- Q10 | The Full Picture
SELECT c.first_name, c.last_name, ci.city, co.country
FROM customer c
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
JOIN country co ON ci.country_id = co.country_id;

-- Q11 | Global Reach
SELECT co.country, count(*) AS customer_count
FROM customer c
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
JOIN country co ON ci.country_id = co.country_id
GROUP BY co.country
ORDER BY customer_count DESC;

-- Q12 | Class of 2006
-- MySQL: WHERE YEAR(create_date) = 2006
-- SQLite: strftime returns text, so compare with quotes
SELECT customer_id, first_name, last_name, create_date
FROM customer
WHERE strftime('%Y', create_date) = '2006';

-- Q13 | Active Percentage
SELECT store_id,
       count(*) AS total,
       sum(active) AS active_count,
       round(sum(active) * 100.0 / count(*), 2) AS active_pct
FROM customer
GROUP BY store_id;

-- Q14 | Data Dupes
SELECT a.address_id, a.address, count(*) AS customer_count
FROM customer c
JOIN address a ON c.address_id = a.address_id
GROUP BY a.address_id, a.address
HAVING count(*) > 1;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 2 — Follow the Money  (Revenue Reporting)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | The Bottom Line
SELECT sum(amount) AS total_revenue
FROM payment;

-- Q2 | Transaction Count
SELECT count(*) AS total_payments
FROM payment;

-- Q3 | Average Ticket
SELECT round(avg(amount), 2) AS avg_payment
FROM payment;

-- Q4 | Big Spender
SELECT max(amount) AS max_payment
FROM payment;

-- Q5 | Staff Revenue
SELECT s.staff_id, s.first_name, s.last_name, sum(p.amount) AS total_revenue
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q6 | Store vs Store
SELECT s.store_id, sum(p.amount) AS total_revenue
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.store_id;

-- Q7 | Rental Volume
SELECT i.store_id, count(*) AS rental_count
FROM rental r
JOIN inventory i ON r.inventory_id = i.inventory_id
GROUP BY i.store_id;

-- Q8 | Peak Month
-- MySQL: DATE_FORMAT(payment_date, '%Y-%m')
-- SQLite: strftime('%Y-%m', col)
SELECT strftime('%Y-%m', payment_date) AS month, sum(amount) AS total_revenue
FROM payment
GROUP BY month
ORDER BY total_revenue DESC
LIMIT 1;

-- Q9 | July Deep Dive
SELECT date(payment_date) AS day, sum(amount) AS daily_revenue
FROM payment
WHERE strftime('%Y-%m', payment_date) = '2005-07'
GROUP BY day
ORDER BY day;

-- Q10 | Side by Side
SELECT strftime('%Y-%m', p.payment_date) AS month, s.store_id, sum(p.amount) AS revenue
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY month, s.store_id
ORDER BY month, s.store_id;

-- Q11 | Revenue per Rental
SELECT s.store_id, round(sum(p.amount) / count(DISTINCT p.rental_id), 2) AS avg_per_rental
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.store_id;

-- Q12 | Above Average
SELECT payment_id, customer_id, amount
FROM payment
WHERE amount > (SELECT avg(amount) FROM payment);

-- Q13 | Running Total
SELECT month, monthly_revenue,
       sum(monthly_revenue) OVER (ORDER BY month) AS cumulative_revenue
FROM (
  SELECT strftime('%Y-%m', payment_date) AS month, sum(amount) AS monthly_revenue
  FROM payment
  GROUP BY month
) sub;

-- Q14 | Revenue Rankings
SELECT strftime('%Y-%m', payment_date) AS month,
       sum(amount) AS total_revenue,
       rank() OVER (ORDER BY sum(amount) DESC) AS revenue_rank
FROM payment
GROUP BY month;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 3 — Dead on Arrival  (Catalog ROI)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | The Catalog
SELECT title, rental_rate
FROM film;

-- Q2 | Family Friendly
SELECT title, rating
FROM film
WHERE rating = 'PG';

-- Q3 | Rating Breakdown
SELECT rating, count(*) AS film_count
FROM film
GROUP BY rating
ORDER BY film_count DESC;

-- Q4 | Pricey Replacement
SELECT title, replacement_cost
FROM film
ORDER BY replacement_cost DESC
LIMIT 1;

-- Q5 | Genre Count
SELECT c.name AS category, count(*) AS film_count
FROM film_category fc
JOIN category c ON fc.category_id = c.category_id
GROUP BY c.name
ORDER BY film_count DESC;

-- Q6 | Most Stocked
SELECT f.title, count(*) AS copy_count
FROM inventory i
JOIN film f ON i.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY copy_count DESC
LIMIT 1;

-- Q7 | Rental Counts
SELECT f.title, count(r.rental_id) AS rental_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY f.film_id, f.title
ORDER BY rental_count DESC;

-- Q8 | Top 10 Hits
SELECT f.title, count(r.rental_id) AS rental_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY f.film_id, f.title
ORDER BY rental_count DESC
LIMIT 10;

-- Q9 | Genre Performance
SELECT c.name AS category, count(r.rental_id) AS rental_count
FROM film_category fc
JOIN category c ON fc.category_id = c.category_id
JOIN inventory i ON fc.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY c.name
ORDER BY rental_count DESC;

-- Q10 | Dead Inventory
SELECT f.film_id, f.title
FROM film f
WHERE f.film_id NOT IN (
  SELECT DISTINCT i.film_id
  FROM inventory i
  JOIN rental r ON i.inventory_id = r.inventory_id
)
ORDER BY f.title;

-- Q11 | Single Store Films
SELECT f.title, count(DISTINCT i.store_id) AS store_count
FROM film f
JOIN inventory i ON f.film_id = i.film_id
GROUP BY f.film_id, f.title
HAVING count(DISTINCT i.store_id) = 1
ORDER BY f.title;

-- Q12 | Category Averages
SELECT c.name AS category, round(avg(rental_count), 2) AS avg_rentals
FROM (
  SELECT fc.category_id, f.film_id, count(r.rental_id) AS rental_count
  FROM film f
  JOIN film_category fc ON f.film_id = fc.film_id
  LEFT JOIN inventory i ON f.film_id = i.film_id
  LEFT JOIN rental r ON i.inventory_id = r.inventory_id
  GROUP BY fc.category_id, f.film_id
) sub
JOIN category c ON sub.category_id = c.category_id
GROUP BY c.name
ORDER BY avg_rentals DESC;

-- Q13 | Category Rankings
SELECT c.name AS category, f.title,
       count(r.rental_id) AS rental_count,
       rank() OVER (PARTITION BY c.name ORDER BY count(r.rental_id) DESC) AS category_rank
FROM film f
JOIN film_category fc ON f.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
LEFT JOIN inventory i ON f.film_id = i.film_id
LEFT JOIN rental r ON i.inventory_id = r.inventory_id
GROUP BY c.name, f.film_id, f.title;

-- Q14 | Dead Weight Percentage
WITH film_rentals AS (
  SELECT f.film_id, count(r.rental_id) AS rental_count
  FROM film f
  LEFT JOIN inventory i ON f.film_id = i.film_id
  LEFT JOIN rental r ON i.inventory_id = r.inventory_id
  GROUP BY f.film_id
)
SELECT c.name AS category,
       count(*) AS total_films,
       sum(CASE WHEN fr.rental_count = 0 THEN 1 ELSE 0 END) AS never_rented,
       round(sum(CASE WHEN fr.rental_count = 0 THEN 1 ELSE 0 END) * 100.0 / count(*), 2) AS dead_pct
FROM film_category fc
JOIN category c ON fc.category_id = c.category_id
JOIN film_rentals fr ON fc.film_id = fr.film_id
GROUP BY c.name
ORDER BY dead_pct DESC;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 4 — Gone Cold  (Customer Churn)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | Day One
SELECT min(rental_date) AS first_rental
FROM rental;

-- Q2 | Last Activity
SELECT max(rental_date) AS last_rental
FROM rental;

-- Q3 | Year Over Year
SELECT strftime('%Y', rental_date) AS year, count(*) AS rental_count
FROM rental
GROUP BY year;

-- Q4 | Active Renters
SELECT DISTINCT c.customer_id, c.first_name, c.last_name
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id;

-- Q5 | Lifetime Rentals
SELECT c.customer_id, c.first_name, c.last_name, count(*) AS rental_count
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY rental_count DESC;

-- Q6 | 2005 Champions
SELECT c.customer_id, c.first_name, c.last_name, count(*) AS rental_count
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
WHERE strftime('%Y', r.rental_date) = '2005'
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY rental_count DESC
LIMIT 10;

-- Q7 | Average Engagement
SELECT round(avg(cnt), 2) AS avg_rentals_per_customer
FROM (SELECT count(*) AS cnt FROM rental GROUP BY customer_id) sub;

-- Q8 | Power Users
SELECT c.customer_id, c.first_name, c.last_name, count(*) AS rental_count
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING count(*) > 30
ORDER BY rental_count DESC;

-- Q9 | Last Seen
SELECT c.customer_id, c.first_name, c.last_name, max(r.rental_date) AS last_rental
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY last_rental DESC;

-- Q10 | The Disappeared
SELECT DISTINCT c.customer_id, c.first_name, c.last_name
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
WHERE strftime('%Y', r.rental_date) = '2005'
  AND c.customer_id NOT IN (
    SELECT DISTINCT customer_id FROM rental
    WHERE strftime('%Y', rental_date) = '2006'
  );

-- Q11 | Gone 6 Months
-- MySQL: DATEDIFF(date1, date2)
-- SQLite: julianday(date1) - julianday(date2)
SELECT c.customer_id, c.first_name, c.last_name, max(r.rental_date) AS last_rental
FROM customer c
JOIN rental r ON c.customer_id = r.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING julianday((SELECT max(rental_date) FROM rental)) - julianday(max(r.rental_date)) > 180;

-- Q12 | Lost Whales
SELECT c.customer_id, c.first_name, c.last_name,
       sum(p.amount) AS total_spent,
       max(r.rental_date) AS last_rental
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
JOIN rental r ON c.customer_id = r.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING julianday((SELECT max(rental_date) FROM rental)) - julianday(max(r.rental_date)) > 90
ORDER BY total_spent DESC
LIMIT 20;

-- Q13 | Customer Lifespan
WITH spans AS (
  SELECT c.customer_id, c.first_name, c.last_name,
         min(r.rental_date) AS first_rental,
         max(r.rental_date) AS last_rental
  FROM customer c
  JOIN rental r ON c.customer_id = r.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
)
SELECT customer_id, first_name, last_name, first_rental, last_rental,
       round((julianday(last_rental) - julianday(first_rental)) / 30, 1) AS months_active
FROM spans
ORDER BY months_active DESC;

-- Q14 | Churn Segments
WITH customer_activity AS (
  SELECT c.customer_id, c.first_name, c.last_name,
         max(r.rental_date) AS last_rental,
         julianday((SELECT max(rental_date) FROM rental)) - julianday(max(r.rental_date)) AS days_since
  FROM customer c
  JOIN rental r ON c.customer_id = r.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
)
SELECT customer_id, first_name, last_name, last_rental,
       round(days_since, 0) AS days_since_last,
       CASE
         WHEN days_since <= 30  THEN 'Active'
         WHEN days_since <= 90  THEN 'At Risk'
         ELSE                        'Churned'
       END AS status
FROM customer_activity
ORDER BY days_since;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 5 — The Whale  (Customer Lifetime Value)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | Customer Spend
SELECT c.customer_id, c.first_name, c.last_name, sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;

-- Q2 | Number One
SELECT c.customer_id, c.first_name, c.last_name, sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC
LIMIT 1;

-- Q3 | Top 10 Spenders
SELECT c.customer_id, c.first_name, c.last_name, sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC
LIMIT 10;

-- Q4 | Average Customer Value
SELECT round(avg(total_spent), 2) AS avg_customer_spend
FROM (SELECT sum(amount) AS total_spent FROM payment GROUP BY customer_id) sub;

-- Q5 | Spend and Rentals
SELECT c.customer_id, c.first_name, c.last_name,
       sum(p.amount) AS total_spent,
       count(p.payment_id) AS total_rentals
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC;

-- Q6 | Spend per Rental
SELECT c.customer_id, c.first_name, c.last_name,
       round(sum(p.amount) / count(p.payment_id), 2) AS avg_per_rental
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY avg_per_rental DESC;

-- Q7 | Top Spenders by Store
SELECT c.customer_id, c.first_name, c.last_name, c.store_id, sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name, c.store_id
ORDER BY total_spent DESC
LIMIT 10;

-- Q8 | Store Champions
SELECT * FROM (
  SELECT c.customer_id, c.first_name, c.last_name, c.store_id,
         sum(p.amount) AS total_spent,
         row_number() OVER (PARTITION BY c.store_id ORDER BY sum(p.amount) DESC) AS rn
  FROM customer c
  JOIN payment p ON c.customer_id = p.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name, c.store_id
) ranked
WHERE rn <= 5;

-- Q9 | Above Average Spenders
SELECT c.customer_id, c.first_name, c.last_name, sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING sum(p.amount) > (
  SELECT avg(total_spent)
  FROM (SELECT sum(amount) AS total_spent FROM payment GROUP BY customer_id) sub
)
ORDER BY total_spent DESC;

-- Q10 | Full Profile
SELECT c.customer_id, c.first_name, c.last_name,
       ci.city, co.country,
       sum(p.amount) AS total_spent
FROM customer c
JOIN payment p ON c.customer_id = p.customer_id
JOIN address a ON c.address_id = a.address_id
JOIN city ci ON a.city_id = ci.city_id
JOIN country co ON ci.country_id = co.country_id
GROUP BY c.customer_id, c.first_name, c.last_name, ci.city, co.country
ORDER BY total_spent DESC
LIMIT 10;

-- Q11 | Whale's Timeline
SELECT strftime('%Y-%m', payment_date) AS month, sum(amount) AS monthly_spend
FROM payment
WHERE customer_id = 526
GROUP BY month
ORDER BY month;

-- Q12 | Top 10 Percent
SELECT customer_id, first_name, last_name, total_spent
FROM (
  SELECT c.customer_id, c.first_name, c.last_name,
         sum(p.amount) AS total_spent,
         ntile(10) OVER (ORDER BY sum(p.amount) DESC) AS decile
  FROM customer c
  JOIN payment p ON c.customer_id = p.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
) ranked
WHERE decile = 1;

-- Q13 | Value Rankings
SELECT customer_id, first_name, last_name, total_spent,
       rank() OVER (ORDER BY total_spent DESC) AS value_rank,
       sum(total_spent) OVER (ORDER BY total_spent DESC) AS running_total
FROM (
  SELECT c.customer_id, c.first_name, c.last_name, sum(p.amount) AS total_spent
  FROM customer c
  JOIN payment p ON c.customer_id = p.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
) sub;

-- Q14 | Customer Segments
SELECT
  CASE
    WHEN quartile = 1 THEN 'High Value'
    WHEN quartile = 2 THEN 'Mid-High'
    WHEN quartile = 3 THEN 'Mid-Low'
    ELSE                    'Low'
  END AS segment,
  count(*) AS customer_count,
  round(sum(total_spent), 2) AS segment_revenue
FROM (
  SELECT c.customer_id, sum(p.amount) AS total_spent,
         ntile(4) OVER (ORDER BY sum(p.amount) DESC) AS quartile
  FROM customer c
  JOIN payment p ON c.customer_id = p.customer_id
  GROUP BY c.customer_id
) sub
GROUP BY quartile
ORDER BY quartile;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 6 — Staff Under the Lens  (Staff Performance & Fraud Detection)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | The Two Managers
SELECT s.staff_id, s.first_name, s.last_name, s.store_id
FROM staff s;

-- Q2 | Payment Totals
SELECT s.staff_id, s.first_name, s.last_name, sum(p.amount) AS total_revenue
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q3 | Rental Volume
SELECT s.staff_id, s.first_name, s.last_name, count(*) AS rental_count
FROM rental r
JOIN staff s ON r.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q4 | Average Transaction
SELECT s.staff_id, s.first_name, s.last_name, round(avg(p.amount), 2) AS avg_payment
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q5 | Monthly Breakdown
SELECT s.first_name, strftime('%Y-%m', p.payment_date) AS month, sum(p.amount) AS revenue
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, month
ORDER BY month, s.first_name;

-- Q6 | Customer Reach
SELECT s.staff_id, s.first_name, s.last_name, count(DISTINCT r.customer_id) AS unique_customers
FROM rental r
JOIN staff s ON r.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q7 | High-Value Transactions
SELECT s.staff_id, s.first_name, s.last_name, count(*) AS high_value_count
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
WHERE p.amount > 5
GROUP BY s.staff_id, s.first_name, s.last_name;

-- Q8 | Busiest Days
-- MySQL: DAYOFWEEK(col) → 1=Sun … 7=Sat
-- SQLite: CAST(strftime('%w', col) AS INTEGER) → 0=Sun … 6=Sat
SELECT s.first_name,
       CASE CAST(strftime('%w', r.rental_date) AS INTEGER)
         WHEN 0 THEN 'Sunday'
         WHEN 1 THEN 'Monday'
         WHEN 2 THEN 'Tuesday'
         WHEN 3 THEN 'Wednesday'
         WHEN 4 THEN 'Thursday'
         WHEN 5 THEN 'Friday'
         WHEN 6 THEN 'Saturday'
       END AS day_of_week,
       count(*) AS rental_count
FROM rental r
JOIN staff s ON r.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, day_of_week
ORDER BY s.first_name, rental_count DESC;

-- Q9 | Category Performance
SELECT s.store_id, c.name AS category, count(*) AS rental_count
FROM rental r
JOIN staff s ON r.staff_id = s.staff_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film_category fc ON i.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
GROUP BY s.store_id, c.name
ORDER BY s.store_id, rental_count DESC;

-- Q10 | Missing Payments
SELECT r.rental_id, r.rental_date, r.customer_id, r.staff_id
FROM rental r
LEFT JOIN payment p ON r.rental_id = p.rental_id
WHERE p.payment_id IS NULL;

-- Q11 | After Hours
-- MySQL: HOUR(col)
-- SQLite: CAST(strftime('%H', col) AS INTEGER)
SELECT payment_id, customer_id, staff_id, amount, payment_date
FROM payment
WHERE CAST(strftime('%H', payment_date) AS INTEGER) < 8
   OR CAST(strftime('%H', payment_date) AS INTEGER) >= 22;

-- Q12 | Month Over Month
WITH monthly AS (
  SELECT s.staff_id, s.first_name,
         strftime('%Y-%m', p.payment_date) AS month,
         sum(p.amount) AS revenue
  FROM payment p
  JOIN staff s ON p.staff_id = s.staff_id
  GROUP BY s.staff_id, s.first_name, month
)
SELECT first_name, month, revenue,
       lag(revenue) OVER (PARTITION BY staff_id ORDER BY month) AS prev_month,
       round(revenue - lag(revenue) OVER (PARTITION BY staff_id ORDER BY month), 2) AS revenue_change
FROM monthly
ORDER BY first_name, month;

-- Q13 | Performance Rank
SELECT s.first_name,
       strftime('%Y-%m', p.payment_date) AS month,
       sum(p.amount) AS revenue,
       rank() OVER (PARTITION BY strftime('%Y-%m', p.payment_date) ORDER BY sum(p.amount) DESC) AS monthly_rank
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.staff_id, s.first_name, month
ORDER BY month, monthly_rank;

-- Q14 | Revenue Share
WITH monthly AS (
  SELECT s.staff_id, s.first_name,
         strftime('%Y-%m', p.payment_date) AS month,
         sum(p.amount) AS revenue
  FROM payment p
  JOIN staff s ON p.staff_id = s.staff_id
  GROUP BY s.staff_id, s.first_name, month
)
SELECT first_name, month, revenue,
       sum(revenue) OVER (PARTITION BY month) AS month_total,
       round(revenue * 100.0 / sum(revenue) OVER (PARTITION BY month), 2) AS revenue_pct
FROM monthly
ORDER BY month, first_name;


-- ───────────────────────────────────────────────────────────────────────
-- CASE 7 — The Final Verdict  (Executive Report)
-- ───────────────────────────────────────────────────────────────────────

-- Q1 | The Big Three
SELECT
  (SELECT sum(amount)  FROM payment) AS total_revenue,
  (SELECT count(*)     FROM rental)  AS total_rentals,
  (SELECT count(*)     FROM customer) AS total_customers;

-- Q2 | Store Split
SELECT s.store_id,
       sum(p.amount) AS total_revenue,
       count(DISTINCT p.rental_id) AS total_rentals
FROM payment p
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY s.store_id;

-- Q3 | Catalog Overview
SELECT count(*) AS total_films,
       round(avg(rental_rate), 2) AS avg_rental_rate,
       round(avg(replacement_cost), 2) AS avg_replacement_cost
FROM film;

-- Q4 | Customer Census
SELECT store_id,
       count(*) AS total,
       sum(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
       sum(CASE WHEN active = 0 THEN 1 ELSE 0 END) AS inactive
FROM customer
GROUP BY store_id;

-- Q5 | Revenue Drivers
SELECT f.title, sum(p.amount) AS revenue
FROM payment p
JOIN rental r ON p.rental_id = r.rental_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film f ON i.film_id = f.film_id
GROUP BY f.film_id, f.title
ORDER BY revenue DESC
LIMIT 5;

-- Q6 | Genre Revenue
SELECT c.name AS category, sum(p.amount) AS revenue
FROM payment p
JOIN rental r ON p.rental_id = r.rental_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film_category fc ON i.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
GROUP BY c.name
ORDER BY revenue DESC
LIMIT 5;

-- Q7 | Revenue Timeline
SELECT strftime('%Y-%m', payment_date) AS month, sum(amount) AS revenue
FROM payment
GROUP BY month
ORDER BY month;

-- Q8 | Growth Curve
SELECT strftime('%Y-%m', create_date) AS month, count(*) AS new_customers
FROM customer
GROUP BY month
ORDER BY month;

-- Q9 | Inventory Utilization
SELECT round(
  count(DISTINCT CASE WHEN r.rental_id IS NOT NULL THEN i.inventory_id END) * 100.0
  / count(DISTINCT i.inventory_id), 2
) AS utilization_pct
FROM inventory i
LEFT JOIN rental r ON i.inventory_id = r.inventory_id;

-- Q10 | Financial Risk
SELECT f.title, f.replacement_cost
FROM film f
WHERE f.replacement_cost > 20
  AND f.film_id NOT IN (
    SELECT DISTINCT i.film_id
    FROM inventory i
    JOIN rental r ON i.inventory_id = r.inventory_id
  )
ORDER BY f.replacement_cost DESC;

-- Q11 | Retention Rate
SELECT round(
  (SELECT count(DISTINCT customer_id) FROM rental
   WHERE strftime('%Y', rental_date) = '2005'
     AND customer_id IN (
       SELECT DISTINCT customer_id FROM rental
       WHERE strftime('%Y', rental_date) = '2006'
     )
  ) * 100.0
  / (SELECT count(DISTINCT customer_id) FROM rental
     WHERE strftime('%Y', rental_date) = '2005'),
  2
) AS retention_pct;

-- Q12 | Category × Store
SELECT c.name AS category, s.store_id, sum(p.amount) AS revenue
FROM payment p
JOIN rental r ON p.rental_id = r.rental_id
JOIN inventory i ON r.inventory_id = i.inventory_id
JOIN film_category fc ON i.film_id = fc.film_id
JOIN category c ON fc.category_id = c.category_id
JOIN staff s ON p.staff_id = s.staff_id
GROUP BY c.name, s.store_id
ORDER BY c.name, s.store_id;

-- Q13 | Store Scorecard
WITH store_stats AS (
  SELECT s.store_id,
         sum(p.amount) AS total_revenue,
         count(DISTINCT p.rental_id) AS total_rentals,
         count(DISTINCT r.customer_id) AS total_customers
  FROM payment p
  JOIN staff s ON p.staff_id = s.staff_id
  JOIN rental r ON p.rental_id = r.rental_id
  GROUP BY s.store_id
)
SELECT store_id,
       round(total_revenue, 2) AS total_revenue,
       total_rentals,
       total_customers,
       round(total_revenue / total_rentals, 2) AS avg_per_rental
FROM store_stats;

-- Q14 | Star Power
SELECT a.first_name, a.last_name, sum(p.amount) AS total_revenue
FROM actor a
JOIN film_actor fa ON a.actor_id = fa.actor_id
JOIN inventory i ON fa.film_id = i.film_id
JOIN rental r ON i.inventory_id = r.inventory_id
JOIN payment p ON r.rental_id = p.rental_id
GROUP BY a.actor_id, a.first_name, a.last_name
ORDER BY total_revenue DESC
LIMIT 1;


-- ═══════════════════════════════════════════════════════════════════════
-- End of answer-key.sql
-- ═══════════════════════════════════════════════════════════════════════
