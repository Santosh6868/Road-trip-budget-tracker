let expenses = JSON.parse(localStorage.getItem('roadtrip_expenses')) || [];
let selectedPayer = 'Sai';
let chartInstance = null;

const members = ['Sai', 'Santosh', 'Siva', 'Srinu'];
const avatarClasses = {
  Sai: 'bg-sai',
  Santosh: 'bg-santosh',
  Siva: 'bg-siva',
  Srinu: 'bg-srinu'
};

// DOM Elements
const expenseForm = document.getElementById('expense-form');
const payerChips = document.getElementById('payer-chips');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const descriptionInput = document.getElementById('description');
const totalAmountDisplay = document.getElementById('total-amount');
const perPersonShareDisplay = document.getElementById('per-person-share');
const balancesList = document.getElementById('balances-list');
const historyList = document.getElementById('history-list');

// Chip Selector Logic
payerChips.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    document.querySelectorAll('#payer-chips .chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    selectedPayer = e.target.getAttribute('data-value');
  }
});

// Form Submission
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();

  if (!amount || amount <= 0) return;

  const newExpense = {
    id: Date.now(),
    payer: selectedPayer,
    amount: amount,
    category: category,
    description: description || category,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  };

  expenses.push(newExpense);
  saveAndRender();

  amountInput.value = '';
  descriptionInput.value = '';
});

// Delete Expense
function deleteExpense(id) {
  expenses = expenses.filter(item => item.id !== id);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('roadtrip_expenses', JSON.stringify(expenses));
  renderAll();
}

function renderAll() {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const sharePerPerson = totalSpent / members.length;

  // Update Total Display
  totalAmountDisplay.textContent = `₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  perPersonShareDisplay.textContent = `₹${sharePerPerson.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Calculate Total Spent per Person for Balances
  const totalsByPerson = { Sai: 0, Santosh: 0, Siva: 0, Srinu: 0 };
  expenses.forEach(item => {
    if (totalsByPerson[item.payer] !== undefined) {
      totalsByPerson[item.payer] += item.amount;
    }
  });

  // Render Settlement Balances
  balancesList.innerHTML = '';
  members.forEach(member => {
    const spent = totalsByPerson[member];
    const diff = spent - sharePerPerson;
    const row = document.createElement('div');
    row.className = 'item-row';

    let badgeHTML = '';
    if (diff > 0) {
      badgeHTML = `<span class="badge badge-owed">Gets Back ₹${diff.toFixed(2)}</span>`;
    } else if (diff < 0) {
      badgeHTML = `<span class="badge badge-owes">Owes ₹${Math.abs(diff).toFixed(2)}</span>`;
    } else {
      badgeHTML = `<span class="badge" style="background: rgba(255,255,255,0.15); color: #fff;">Settled</span>`;
    }

    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div class="person-avatar ${avatarClasses[member]}">${member[0]}</div>
        <span>${member}</span>
      </div>
      ${badgeHTML}
    `;
    balancesList.appendChild(row);
  });

  // Render History Log
  historyList.innerHTML = '';
  if (expenses.length === 0) {
    historyList.innerHTML = `<p style="text-align: center; color: var(--text-muted); font-size: 0.875rem;">No expenses recorded yet.</p>`;
  } else {
    [...expenses].reverse().forEach(item => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="person-avatar ${avatarClasses[item.payer]}">${item.payer[0]}</div>
          <div>
            <div style="font-weight: 600;">${item.description}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${item.payer} • ${item.category} • ${item.date}</div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <strong>₹${item.amount.toFixed(2)}</strong>
          <button class="btn-delete" onclick="deleteExpense(${item.id})">✕</button>
        </div>
      `;
      historyList.appendChild(row);
    });
  }

  // Update Chart
  updateChart();
}

function updateChart() {
  const categories = ['Fuel', 'Food', 'Stay', 'Toll', 'Other'];
  const categoryTotals = categories.map(cat => {
    return expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
  });

  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: categoryTotals,
        backgroundColor: ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ffffff', font: { size: 11 } }
        }
      }
    }
  });
}

// Initial render on load
renderAll();