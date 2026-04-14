// Case 1 pilot: LeetCode-style sample outputs rendered as a lightweight
// progressive enhancement after the main React app mounts.

(function () {
  const DEFAULT_NOTE = "Illustrative rows only. Your real query will run against the full Sakila data set.";
  const SAMPLE_OUTPUTS = {
    "1-1": {
      columns: ["first_name", "last_name", "email"],
      rows: [
        ["Mia", "Chen", "mia.chen@example.com"],
        ["Owen", "Patel", "owen.patel@example.com"],
        ["Ava", "Garcia", "ava.garcia@example.com"]
      ]
    },
    "1-2": {
      columns: ["first_name", "last_name", "email"],
      rows: [
        ["Jordan", "Lee", "jordan.lee@example.com"],
        ["Priya", "Nair", "priya.nair@example.com"],
        ["Lucas", "Hall", "lucas.hall@example.com"]
      ]
    },
    "1-3": {
      columns: ["first_name", "last_name", "email"],
      rows: [
        ["Lena", "Becker", "lena.becker@example.com"],
        ["Tariq", "Diaz", "tariq.diaz@example.com"],
        ["Nora", "Young", "nora.young@example.com"]
      ]
    },
    "1-4": {
      columns: ["total_customers"],
      rows: [[123]]
    },
    "1-5": {
      columns: ["store_id", "customer_count"],
      rows: [
        [1, 61],
        [2, 62]
      ]
    },
    "1-6": {
      columns: ["customer_id", "first_name", "last_name", "email"],
      rows: [
        [14, "Nina", "Shah", "nina.shah@example.com"],
        [39, "Marco", "Reed", "marco.reed@example.com"],
        [77, "Elena", "Torres", "elena.torres@example.com"]
      ]
    },
    "1-7": {
      columns: ["customer_id", "first_name", "last_name", "email"],
      rows: [
        [24, "Jules", "Kim", null],
        [58, "Marta", "Lopez", null]
      ]
    },
    "1-8": {
      columns: ["customer_id", "first_name", "last_name", "create_date"],
      rows: [
        [601, "Aisha", "Brooks", "2006-02-14 10:22:00"],
        [587, "Ben", "Carter", "2006-02-10 16:05:00"],
        [574, "Ivy", "Nguyen", "2006-02-08 09:41:00"]
      ]
    },
    "1-9": {
      columns: ["city", "customer_count"],
      rows: [
        ["Aurora", 18],
        ["Fairview", 15],
        ["Riverside", 13]
      ]
    },
    "1-10": {
      columns: ["first_name", "last_name", "city", "country"],
      rows: [
        ["Mia", "Chen", "Aurora", "Canada"],
        ["Owen", "Patel", "Pune", "India"],
        ["Ava", "Garcia", "Cordoba", "Argentina"]
      ]
    },
    "1-11": {
      columns: ["country", "customer_count"],
      rows: [
        ["Canada", 44],
        ["India", 31],
        ["Argentina", 20]
      ]
    },
    "1-12": {
      columns: ["customer_id", "first_name", "last_name", "create_date"],
      rows: [
        [601, "Aisha", "Brooks", "2006-02-14 10:22:00"],
        [587, "Ben", "Carter", "2006-02-10 16:05:00"],
        [574, "Ivy", "Nguyen", "2006-01-28 09:41:00"]
      ]
    },
    "1-13": {
      columns: ["store_id", "total", "active_count", "active_pct"],
      rows: [
        [1, 61, 55, 90.16],
        [2, 62, 54, 87.1]
      ]
    },
    "1-14": {
      columns: ["address_id", "address", "customer_count"],
      rows: [
        [12, "43 Elm St", 2],
        [41, "900 Harbor Ave", 3]
      ]
    },
    "2-1": {
      columns: ["total_revenue"],
      rows: [[67406.56]]
    },
    "2-2": {
      columns: ["total_payments"],
      rows: [[16044]]
    },
    "2-3": {
      columns: ["avg_payment"],
      rows: [[4.2]]
    },
    "2-4": {
      columns: ["max_payment"],
      rows: [[11.99]]
    },
    "2-5": {
      columns: ["staff_id", "first_name", "last_name", "total_revenue"],
      rows: [
        [1, "Mike", "Hillyer", 33690.12],
        [2, "Jon", "Stephens", 33716.44]
      ]
    },
    "2-6": {
      columns: ["store_id", "total_revenue"],
      rows: [
        [1, 33690.12],
        [2, 33716.44]
      ]
    },
    "2-7": {
      columns: ["store_id", "rental_count"],
      rows: [
        [1, 7998],
        [2, 8046]
      ]
    },
    "2-8": {
      columns: ["month", "total_revenue"],
      rows: [["2005-07", 11752.44]]
    },
    "2-9": {
      columns: ["day", "daily_revenue"],
      rows: [
        ["2005-07-01", 312.45],
        ["2005-07-02", 401.2],
        ["2005-07-03", 389.75]
      ]
    },
    "2-10": {
      columns: ["month", "store_id", "revenue"],
      rows: [
        ["2005-05", 1, 4820.5],
        ["2005-05", 2, 4954.75],
        ["2005-06", 1, 5411.3]
      ]
    },
    "2-11": {
      columns: ["store_id", "avg_per_rental"],
      rows: [
        [1, 4.21],
        [2, 4.19]
      ]
    },
    "2-12": {
      columns: ["payment_id", "customer_id", "amount"],
      rows: [
        [18, 5, 8.99],
        [42, 17, 7.99],
        [58, 21, 10.99]
      ]
    },
    "2-13": {
      columns: ["month", "monthly_revenue", "cumulative_revenue"],
      rows: [
        ["2005-05", 9634.25, 9634.25],
        ["2005-06", 10877.1, 20511.35],
        ["2005-07", 11752.44, 32263.79]
      ]
    },
    "2-14": {
      columns: ["month", "total_revenue", "revenue_rank"],
      rows: [
        ["2005-07", 11752.44, 1],
        ["2005-06", 10877.1, 2],
        ["2005-08", 10122.83, 3]
      ]
    }
  };

  let queued = false;

  function ensureStyles() {
    if (document.getElementById("sample-output-pilot-styles")) return;

    const style = document.createElement("style");
    style.id = "sample-output-pilot-styles";
    style.textContent = `
      .sample-output-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }
      .sample-output-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.6rem;
        padding: 0.55rem 0.8rem;
        background: #eef6f5;
        border-bottom: 1px solid #e2e8f0;
      }
      .sample-output-title {
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.72rem;
        font-weight: 700;
        color: #0f766e;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .sample-output-badge {
        background: #ccfbf1;
        color: #0f766e;
        padding: 0.15rem 0.5rem;
        border-radius: 999px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .sample-output-note {
        padding: 0.7rem 0.8rem 0;
        color: #64748b;
        font-size: 0.78rem;
        line-height: 1.5;
      }
      .sample-output-wrap {
        overflow-x: auto;
        padding: 0.65rem 0.8rem 0.8rem;
      }
      .sample-output-table {
        width: 100%;
        min-width: 240px;
        border-collapse: collapse;
      }
      .sample-output-table th {
        padding: 0.35rem 0.45rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        color: #64748b;
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.35px;
        white-space: nowrap;
      }
      .sample-output-table td {
        padding: 0.38rem 0.45rem;
        border-bottom: 1px solid #e9eef5;
        color: #1e293b;
        font-family: "JetBrains Mono", "Fira Code", monospace;
        font-size: 0.76rem;
        white-space: nowrap;
      }
      .sample-output-table tbody tr:last-child td {
        border-bottom: none;
      }
    `;

    document.head.appendChild(style);
  }

  function getQuestionKey() {
    const label = document.querySelector(".question-card .question-number");
    if (!label) return null;

    const match = label.textContent.match(/Case\s+(\d+).*Question\s+(\d+)/i);
    if (!match) return null;

    return `${match[1]}-${match[2]}`;
  }

  function buildCell(tagName, text) {
    const cell = document.createElement(tagName);
    cell.textContent = text === null ? "NULL" : String(text);
    return cell;
  }

  function buildSampleCard(sample, key) {
    const card = document.createElement("div");
    card.className = "sample-output-card sample-output-card--pilot";
    card.dataset.sampleKey = key;

    const header = document.createElement("div");
    header.className = "sample-output-header";

    const title = document.createElement("span");
    title.className = "sample-output-title";
    title.textContent = "Sample Output";

    const badge = document.createElement("span");
    badge.className = "sample-output-badge";
    badge.textContent = "Illustrative";

    header.appendChild(title);
    header.appendChild(badge);

    const note = document.createElement("p");
    note.className = "sample-output-note";
    note.textContent = sample.note || DEFAULT_NOTE;

    const wrap = document.createElement("div");
    wrap.className = "sample-output-wrap";

    const table = document.createElement("table");
    table.className = "sample-output-table";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    sample.columns.forEach((column) => {
      headRow.appendChild(buildCell("th", column));
    });
    thead.appendChild(headRow);

    const tbody = document.createElement("tbody");
    sample.rows.forEach((row) => {
      const bodyRow = document.createElement("tr");
      row.forEach((value) => {
        bodyRow.appendChild(buildCell("td", value));
      });
      tbody.appendChild(bodyRow);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrap.appendChild(table);

    card.appendChild(header);
    card.appendChild(note);
    card.appendChild(wrap);

    return card;
  }

  function syncSampleOutput() {
    queued = false;
    ensureStyles();

    const questionCard = document.querySelector(".question-card");
    if (!questionCard) return;

    const existingNativeCard = questionCard.querySelector(".sample-output-card:not(.sample-output-card--pilot)");
    if (existingNativeCard) return;

    const existingPilotCard = questionCard.querySelector(".sample-output-card--pilot");
    const taskText = questionCard.querySelector(".task-text");
    const key = getQuestionKey();
    const sample = key ? SAMPLE_OUTPUTS[key] : null;

    if (!taskText || !sample) {
      existingPilotCard?.remove();
      return;
    }

    if (existingPilotCard?.dataset.sampleKey === key) {
      return;
    }

    existingPilotCard?.remove();
    taskText.insertAdjacentElement("afterend", buildSampleCard(sample, key));
  }

  function queueSync() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(syncSampleOutput);
  }

  const observer = new MutationObserver(queueSync);

  function start() {
    queueSync();
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
