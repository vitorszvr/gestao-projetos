// State management
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// DOM Elements
const form = document.getElementById('form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const dateInput = document.getElementById('date');
const radioInputs = document.querySelectorAll('input[name="type"]');
const radioLabels = document.querySelectorAll('.radio-label');
const tbody = document.getElementById('transaction-tbody');
const emptyState = document.getElementById('empty-state');
const table = document.getElementById('transactions-table');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const totalBalanceEl = document.getElementById('total-balance');

// Initialize
function init() {
    setupEventListeners();
    updateUI();
}

// Event Listeners
function setupEventListeners() {
    form.addEventListener('submit', handleAddTransaction);
    
    // Setup custom radio button styling
    radioInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            radioLabels.forEach(label => label.classList.remove('selected'));
            e.target.closest('.radio-label').classList.add('selected');
        });
    });
}

// Add Transaction
function handleAddTransaction(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const type = document.querySelector('input[name="type"]:checked')?.value;

    if (!description || isNaN(amount) || !date || !type) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    const transaction = {
        id: crypto.randomUUID(),
        description,
        amount,
        date,
        type
    };

    transactions.push(transaction);
    saveToLocalStorage();
    
    // Reset form
    form.reset();
    radioLabels.forEach(label => label.classList.remove('selected'));
    
    // Default focus back to description
    descriptionInput.focus();

    updateUI();
}

// Delete Transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToLocalStorage();
    updateUI();
}
// Expose functions globally for inline HTML event handlers (e.g. onclick)
window.deleteTransaction = deleteTransaction;

// Save to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format Currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format Date
function formatDate(dateString) {
    // Handling timezone issues with standard Date parsing
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Update UI
function updateUI() {
    renderTransactions();
    updateDashboard();
}

// Render Transactions List
function renderTransactions() {
    tbody.innerHTML = '';

    if (transactions.length === 0) {
        table.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    table.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Sort by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedTransactions.forEach(t => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${t.description}</td>
            <td class="amount ${t.type}">${formatCurrency(t.amount)}</td>
            <td>${formatDate(t.date)}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="type-badge ${t.type}">${t.type === 'income' ? 'Receita' : 'Despesa'}</span>
                    <button class="btn-delete" onclick="window.deleteTransaction('${t.id}')" title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Update Dashboard Cards
function updateDashboard() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    totalIncomeEl.innerText = formatCurrency(income);
    totalExpenseEl.innerText = formatCurrency(expense);
    totalBalanceEl.innerText = formatCurrency(balance);
}

// Run app
init();
