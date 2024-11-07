function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "../../index.html";
    }).catch(() => {
        alert('Erro ao fazer logout');
    });
}

let transactions = [];
const stockData = {
    "iPhone 14": { quantity: 4, price: 7599 },
    "iPhone 14 Pro": { quantity: 3, price: 9499 },
    "iPhone 14 Plus": { quantity: 8, price: 8599 },
    "iPhone 14 Pro Max": { quantity: 6, price: 10499 },
    "iPhone 15": { quantity: 7, price: 8599 },
    "iPhone 15 Pro": { quantity: 3, price: 10499 },
    "iPhone 15 Plus": { quantity: 8, price: 9599 },
    "iPhone 15 Pro Max": { quantity: 6, price: 11499 }
};

let balance = calculateInitialBalance(); // Inicializa o saldo baseado no valor total do estoque

function calculateInitialBalance() {
    return Object.values(stockData).reduce((sum, item) => sum + (item.quantity * item.price), 0);
}

document.getElementById("transaction-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const transactionType = document.getElementById("transaction-type").value;
    const model = document.getElementById("model").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const price = stockData[model].price;

    if (transactionType === "buy") {
        // Compra: Aumentar estoque e diminuir saldo
        stockData[model].quantity += quantity;
        const totalCost = price * quantity;
        transactions.push({ type: "Compra", model, quantity, price, total: -totalCost });
        balance -= totalCost; // Diminuir saldo com o custo da compra
    } else if (transactionType === "sell") {
        // Venda: Diminuir estoque e aumentar saldo
        if (stockData[model].quantity < quantity) {
            alert("Estoque insuficiente para venda.");
            return;
        }
        stockData[model].quantity -= quantity;
        const totalSale = price * quantity;
        transactions.push({ type: "Venda", model, quantity, price, total: totalSale });
        balance += totalSale; // Aumentar saldo com o total da venda
    }

    updateFinancialSummary();
    updateTransactionsList();
    updateStockList();
    document.getElementById("transaction-form").reset();
});

function updateFinancialSummary() {
    const totalIncomes = transactions.filter(t => t.type === "Venda").reduce((sum, t) => sum + t.total, 0);
    const totalExpenses = transactions.filter(t => t.type === "Compra").reduce((sum, t) => sum + Math.abs(t.total), 0);
    
    document.getElementById("total-incomes").textContent = totalIncomes.toFixed(2);
    document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
    document.getElementById("balance").textContent = balance.toFixed(2); // Atualiza o saldo com o valor acumulado
}

function updateTransactionsList() {
    const transactionsList = document.getElementById("transactions-list");
    transactionsList.innerHTML = "";

    transactions.forEach(transaction => {
        const li = document.createElement("li");
        li.textContent = `${transaction.type}: ${transaction.model} - Qtd: ${transaction.quantity} - Total: R$ ${transaction.total.toFixed(2)}`;
        transactionsList.appendChild(li);
    });
}

function updateStockList() {
    const stockList = document.getElementById("inventory-tab").querySelector("tbody");
    stockList.innerHTML = "";

    Object.entries(stockData).forEach(([model, data]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${model}</td><td>${data.quantity}</td><td>${data.price.toFixed(2)}</td>`;
        stockList.appendChild(row);
    });
}

function showTab(tabId) {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
}

// Atualiza a lista de estoque ao carregar a página
updateStockList();
updateFinancialSummary(); // Atualiza o resumo financeiro com o saldo inicial
