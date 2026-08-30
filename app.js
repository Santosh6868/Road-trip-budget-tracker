// Constants & Data
const PEOPLE = [
  { id: "sai", name: "Sai", bg: "bg-sai", color: "#10b981" },
  { id: "santosh", name: "Santosh", bg: "bg-santosh", color: "#0ea5e9" },
  { id: "siva", name: "Siva", bg: "bg-siva", color: "#f43f5e" },
  { id: "srinu", name: "Srinu", bg: "bg-srinu", color: "#f59e0b" }
];

const SUBCATEGORIES = {
  Accommodation: ["Late Checkout", "Misc", "Room Amount", "Room Service"],
  Food: ["Alcohol", "Breakfast", "Cool Drinks", "Dinner", "Lunch", "Snacks", "Tea/Coffee", "Water"],
  Fuel: ["Car Repairs", "Fuel", "Tolls (Cash)", "Tolls (Fastag)"],
  Miscellaneous: ["Miscellaneous"],
  Shopping: ["Artifacts", "Clothes", "Households", "Spices", "Toys"],
  Sightseeing: ["Boat Rides", "Entry Tickets", "Mobile/Camera Stand", "Rides", "Temple Tickets"],
  Smoke: ["Cigarette", "Medicine", "Wet Wipes"]
};

const CATEGORY_COLORS = {
  Accommodation: "#8b5cf6",
  Food: "#f59e0b",
  Fuel: "#ef4444",
  Miscellaneous: "#64748b",
  Shopping: "#ec4899",
  Sightseeing: "#06b6d4",
  Smoke: "#84cc16"
};

let expenses = JSON.parse(localStorage.getItem("trip-expenses") || "[]");
let selectedSplit = ["sai", "santosh", "siva", "srinu"];
let selectedPaymentMode = "UPI";

let totalSpentChartInstance = null;
let categoryChartInstance = null;

// DOM Elements
const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");
const expenseForm = document.getElementById("expense-form");
const splitChips = document.querySelectorAll("#split-chips .chip");
const paymentButtons = document.querySelectorAll("#payment-mode-buttons .btn-toggle");
const exportBtn = document.getElementById("export-btn");

// Initialize Lucide Icons
lucide.createIcons();

// Subcategory Dropdown Logic
categorySelect.addEventListener("change", (e) => {
  const cat = e.target.value;
  subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
  if (cat && SUBCATEGORIES[cat]) {
    SUBCATEGORIES[cat].forEach((sub) => {
      const opt = document.createElement("option");
      opt.value = sub;
      opt.textContent = sub;
      subcategorySelect.appendChild(opt);
    });
  }
});

// Split Selection Logic
splitChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const id = chip.getAttribute("data-id");
    if (selectedSplit.includes(id)) {
      if (selectedSplit.length > 1) {
        selectedSplit = selectedSplit.filter((item) => item !== id);
        chip.classList.remove("active");
      }
    } else {
      selectedSplit.push(id);
      chip.classList.add("active");
    }
  });
});

// Payment Mode Selection Logic
paymentButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    paymentButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedPaymentMode = btn.getAttribute("data-mode");
  });
});

// Submit Form Logic
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newExpense = {
    id: Date.now().toString(),
    category: categorySelect.value,
    subcategory: subcategorySelect.value,
    amount: parseFloat(document.getElementById("amount").value),
    paidBy: document.getElementById("paidBy").value,
    splitAmong: [...selectedSplit],
    paymentMode: selectedPaymentMode,
    location: document.getElementById("location").value,
    notes: document.getElementById("notes").value,
    date: new Date().toISOString()
  };

  expenses.unshift(newExpense);
  saveAndRender();

  // Reset form inputs
  expenseForm.reset();
  subcategorySelect.innerHTML = '<option value="">Select subcategory</option>';
  selectedSplit = ["sai", "santosh", "siva", "srinu"];
  splitChips.forEach((chip) => chip.classList.add("active"));
  selectedPaymentMode = "UPI";
  paymentButtons.forEach((b, i) => i === 0 ? b.classList.add("active") : b.classList.remove("active"));
});

// Delete Expense Logic
function deleteExpense(id) {
  expenses = expenses.filter((e) => e.id !== id);
  saveAndRender();
}

// Calculate & Render All Sections
function render() {
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const perPersonShare = totalSpent / 4;

  // 1. Total Display
  document.getElementById("total-spent-amount").textContent = `₹${totalSpent.toLocaleString("en-IN")}`;
  document.getElementById("total-expenses-count").textContent = `${expenses.length} expenses recorded`;
  document.getElementById("split-per-person").textContent = `₹${perPersonShare.toLocaleString("en-IN")}`;

  // 2. Calculate Person Spending
  const personPaidTotals = { sai: 0, santosh: 0, siva: 0, srinu: 0 };
  const personSplitShare = { sai: 0, santosh: 0, siva: 0, srinu: 0 };

  expenses.forEach((e) => {
    if (personPaidTotals[e.paidBy] !== undefined) {
      personPaidTotals[e.paidBy] += e.amount;
    }
    const splitCount = e.splitAmong.length || 1;
    const share = e.amount / splitCount;
    e.splitAmong.forEach((p) => {
      if (personSplitShare[p] !== undefined) {
        personSplitShare[p] += share;
      }
    });
  });

  // 3. Render Total Spent Pie Chart (By Payer)
  renderTotalSpentChart(personPaidTotals);

  // 4. Render Equal Split Balances
  const personBalancesContainer = document.getElementById("person-balances");
  personBalancesContainer.innerHTML = "";
  PEOPLE.forEach((p) => {
    const spent = personSplitShare[p.id] || 0;
    const diff = spent - perPersonShare;
    const isPositive = diff > 0;

    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div class="person-avatar ${p.bg}">${p.name.charAt(0)}</div>
        <span>${p.name}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <strong>₹${spent.toLocaleString("en-IN")}</strong>
        <span class="badge ${isPositive ? "badge-owes" : "badge-owed"}">
          ${diff === 0 ? "Settled" : (isPositive ? "Owes" : "Owed") + " ₹" + Math.abs(diff).toLocaleString("en-IN")}
        </span>
      </div>
    `;
    personBalancesContainer.appendChild(row);
  });

  // 5. Render Expense History
  const historyContainer = document.getElementById("expense-list");
  document.getElementById("history-count").textContent = `${expenses.length} entries`;
  historyContainer.innerHTML = "";

  if (expenses.length === 0) {
    historyContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 16px;">No expenses yet</p>';
  } else {
    expenses.forEach((e) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div>
          <strong>${e.subcategory || e.category}</strong>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">
            Paid by ${e.paidBy} • ${e.paymentMode}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong>₹${e.amount.toLocaleString("en-IN")}</strong>
          <button class="btn-delete" onclick="deleteExpense('${e.id}')">✕</button>
        </div>
      `;
      historyContainer.appendChild(row);
    });
  }

  // 6. Render Category Breakdown & Pie Chart
  const catTotals = {};
  expenses.forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });

  renderCategoryChart(catTotals);

  const catContainer = document.getElementById("category-breakdown");
  catContainer.innerHTML = "";
  Object.entries(catTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
    const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : 0;
    const row = document.createElement("div");
    row.className = "item-row";
    row.innerHTML = `
      <span>${cat}</span>
      <div>
        <span style="font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-right: 8px;">${pct}%</span>
        <strong>₹${amt.toLocaleString("en-IN")}</strong>
      </div>
    `;
    catContainer.appendChild(row);
  });
}

// Chart.js - Total Spent Pie Chart
function renderTotalSpentChart(paidData) {
  const ctx = document.getElementById("totalSpentChart").getContext("2d");
  const labels = PEOPLE.map(p => p.name);
  const data = PEOPLE.map(p => paidData[p.id] || 0);
  const colors = PEOPLE.map(p => p.color);

  if (totalSpentChartInstance) {
    totalSpentChartInstance.destroy();
  }

  totalSpentChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#ffffff", font: { size: 11 } } }
      }
    }
  });
}

// Chart.js - Category Pie Chart
function renderCategoryChart(catData) {
  const ctx = document.getElementById("categoryChart").getContext("2d");
  const labels = Object.keys(catData);
  const data = Object.values(catData);
  const colors = labels.map(l => CATEGORY_COLORS[l] || "#94a3b8");

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  categoryChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels.length ? labels : ["No Data"],
      datasets: [{
        data: data.length ? data : [1],
        backgroundColor: colors.length ? colors : ["rgba(255,255,255,0.2)"],
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#ffffff", font: { size: 11 } } }
      }
    }
  });
}

function saveAndRender() {
  localStorage.setItem("trip-expenses", JSON.stringify(expenses));
  render();
}

// Export to CSV Logic
exportBtn.addEventListener("click", () => {
  if (expenses.length === 0) {
    alert("No expenses to export!");
    return;
  }
  let csv = "Category,Subcategory,Amount (INR),Paid By,Payment Mode,Location,Notes\n";
  expenses.forEach((e) => {
    csv += `"${e.category}","${e.subcategory || ""}","${e.amount}","${e.paidBy}","${e.paymentMode}","${e.location || ""}","${e.notes || ""}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", `road-trip-expenses-${new Date().toISOString().split("T")[0]}.csv`);
  a.click();
});

// Initial Render
render();