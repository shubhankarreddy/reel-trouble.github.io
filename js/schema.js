// ─────────────────────────────────────────────
// Reel Trouble — Schema Reference Data
// ─────────────────────────────────────────────

window.SCHEMA = [
  {
    name: "customer",
    columns: [
      { name: "customer_id", type: "INTEGER", pk: true },
      { name: "store_id", type: "INTEGER", fk: "store.store_id" },
      { name: "first_name", type: "TEXT" },
      { name: "last_name", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "address_id", type: "INTEGER", fk: "address.address_id" },
      { name: "active", type: "INTEGER" },
      { name: "create_date", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "rental",
    columns: [
      { name: "rental_id", type: "INTEGER", pk: true },
      { name: "rental_date", type: "TEXT" },
      { name: "inventory_id", type: "INTEGER", fk: "inventory.inventory_id" },
      { name: "customer_id", type: "INTEGER", fk: "customer.customer_id" },
      { name: "return_date", type: "TEXT" },
      { name: "staff_id", type: "INTEGER", fk: "staff.staff_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "payment",
    columns: [
      { name: "payment_id", type: "INTEGER", pk: true },
      { name: "customer_id", type: "INTEGER", fk: "customer.customer_id" },
      { name: "staff_id", type: "INTEGER", fk: "staff.staff_id" },
      { name: "rental_id", type: "INTEGER", fk: "rental.rental_id" },
      { name: "amount", type: "REAL" },
      { name: "payment_date", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "film",
    columns: [
      { name: "film_id", type: "INTEGER", pk: true },
      { name: "title", type: "TEXT" },
      { name: "description", type: "TEXT" },
      { name: "release_year", type: "INTEGER" },
      { name: "language_id", type: "INTEGER", fk: "language.language_id" },
      { name: "original_language_id", type: "INTEGER" },
      { name: "rental_duration", type: "INTEGER" },
      { name: "rental_rate", type: "REAL" },
      { name: "length", type: "INTEGER" },
      { name: "replacement_cost", type: "REAL" },
      { name: "rating", type: "TEXT" },
      { name: "special_features", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "film_actor",
    columns: [
      { name: "actor_id", type: "INTEGER", fk: "actor.actor_id" },
      { name: "film_id", type: "INTEGER", fk: "film.film_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "film_category",
    columns: [
      { name: "film_id", type: "INTEGER", fk: "film.film_id" },
      { name: "category_id", type: "INTEGER", fk: "category.category_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "film_text",
    columns: [
      { name: "film_id", type: "INTEGER", pk: true },
      { name: "title", type: "TEXT" },
      { name: "description", type: "TEXT" }
    ]
  },
  {
    name: "actor",
    columns: [
      { name: "actor_id", type: "INTEGER", pk: true },
      { name: "first_name", type: "TEXT" },
      { name: "last_name", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "category",
    columns: [
      { name: "category_id", type: "INTEGER", pk: true },
      { name: "name", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "inventory",
    columns: [
      { name: "inventory_id", type: "INTEGER", pk: true },
      { name: "film_id", type: "INTEGER", fk: "film.film_id" },
      { name: "store_id", type: "INTEGER", fk: "store.store_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "language",
    columns: [
      { name: "language_id", type: "INTEGER", pk: true },
      { name: "name", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "staff",
    columns: [
      { name: "staff_id", type: "INTEGER", pk: true },
      { name: "first_name", type: "TEXT" },
      { name: "last_name", type: "TEXT" },
      { name: "address_id", type: "INTEGER", fk: "address.address_id" },
      { name: "email", type: "TEXT" },
      { name: "store_id", type: "INTEGER", fk: "store.store_id" },
      { name: "active", type: "INTEGER" },
      { name: "username", type: "TEXT" },
      { name: "password", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "store",
    columns: [
      { name: "store_id", type: "INTEGER", pk: true },
      { name: "manager_staff_id", type: "INTEGER", fk: "staff.staff_id" },
      { name: "address_id", type: "INTEGER", fk: "address.address_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "address",
    columns: [
      { name: "address_id", type: "INTEGER", pk: true },
      { name: "address", type: "TEXT" },
      { name: "address2", type: "TEXT" },
      { name: "district", type: "TEXT" },
      { name: "city_id", type: "INTEGER", fk: "city.city_id" },
      { name: "postal_code", type: "TEXT" },
      { name: "phone", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "city",
    columns: [
      { name: "city_id", type: "INTEGER", pk: true },
      { name: "city", type: "TEXT" },
      { name: "country_id", type: "INTEGER", fk: "country.country_id" },
      { name: "last_update", type: "TEXT" }
    ]
  },
  {
    name: "country",
    columns: [
      { name: "country_id", type: "INTEGER", pk: true },
      { name: "country", type: "TEXT" },
      { name: "last_update", type: "TEXT" }
    ]
  }
];
