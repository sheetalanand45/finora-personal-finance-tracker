import { useEffect, useMemo, useState } from "react";
import Auth from "./Auth";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  ChartNoAxesCombined,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Trash2,
  PiggyBank,
  Menu,
  X,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";
import "./App.css";

const STORAGE_KEYS = {
  transactions: "finora-transactions",
  budget: "finora-monthly-budget",
};

const initialTransactions = [
  {
    id: "sample-1",
    title: "Monthly Salary",
    category: "Salary",
    type: "income",
    amount: 45000,
    date: "2026-10-01",
  },
  {
    id: "sample-2",
    title: "Grocery Shopping",
    category: "Food",
    type: "expense",
    amount: 1800,
    date: "2026-10-03",
  },
  {
    id: "sample-3",
    title: "Internet Bill",
    category: "Bills",
    type: "expense",
    amount: 799,
    date: "2026-10-05",
  },
  {
    id: "sample-4",
    title: "Freelance Project",
    category: "Freelance",
    type: "income",
    amount: 5000,
    date: "2026-10-08",
  },
  {
    id: "sample-5",
    title: "Transportation",
    category: "Transport",
    type: "expense",
    amount: 650,
    date: "2026-10-10",
  },
];

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Freelance",
  "Other",
];

const colors = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#0ea5e9",
  "#64748b",
];

const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const todayString = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const currentMonthString = () => todayString().slice(0, 7);

function readStoredTransactions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.transactions);
    return saved === null ? initialTransactions : JSON.parse(saved);
  } catch (error) {
    console.error("Unable to load transactions:", error);
    return initialTransactions;
  }
}

function readStoredBudget() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.budget);
    const value = Number(saved);
    return saved !== null && Number.isFinite(value) && value > 0
      ? value
      : 15000;
  } catch {
    return 15000;
  }
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(readStoredBudget);
  const [budgetInput, setBudgetInput] = useState(String(readStoredBudget()));
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState(currentMonthString());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [aiInsights, setAiInsights] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("finora-user"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!currentUser) return;

    const loadTransactions = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load transactions");
        }

        setTransactions(
          (data.transactions || []).map((transaction) => ({
            ...transaction,
            id: transaction._id,
          }))
        );
      } catch (error) {
        console.error("Error loading transactions:", error);
      }
    };

    loadTransactions();
  }, [currentUser]);

  const [form, setForm] = useState({
    title: "",
    category: "Food",
    type: "expense",
    amount: "",
    date: todayString(),
  });

  useEffect(() => {
    if (!currentUser) return;

    const loadBudget = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/budget", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load budget");
        }

        setBudget(data.budget ?? 0);
      } catch (error) {
        console.error("Error loading budget:", error);
      }
    };

    loadBudget();
  }, [currentUser]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const expenses = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const monthTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          String(transaction.date).slice(0, 7) === currentMonthString()
      ),
    [transactions]
  );

  const monthlyTotals = useMemo(() => {
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const expenses = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return { income, expenses, balance: income - expenses };
  }, [monthTransactions]);

  const monthlyTrendData = useMemo(() => {
    const totalsByMonth = {};

    transactions.forEach((transaction) => {
      const month = String(transaction.date).slice(0, 7);
      if (!month) return;

      if (!totalsByMonth[month]) {
        totalsByMonth[month] = { month, income: 0, expenses: 0 };
      }

      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        totalsByMonth[month].income += amount;
      } else if (transaction.type === "expense") {
        totalsByMonth[month].expenses += amount;
      }
    });

    return Object.values(totalsByMonth)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      balance: item.income - item.expenses,
      label: new Date(`${item.month}-15T12:00:00`).toLocaleDateString(
        "en-IN",
        { month: "short", year: "2-digit" }
      ),
    }));
  }, [transactions]);

  const categoryData = useMemo(() => {
    const grouped = {};

    monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        grouped[transaction.category] =
          (grouped[transaction.category] || 0) +
          Number(transaction.amount || 0);
      });

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [monthTransactions]);

  const availableMonths = useMemo(() => {
    const months = new Set(
      transactions.map((transaction) => String(transaction.date).slice(0, 7))
    );

    months.add(currentMonthString());
    return [...months].filter(Boolean).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
          !query ||
          String(transaction.title).toLowerCase().includes(query) ||
          String(transaction.category).toLowerCase().includes(query);

        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;

        const matchesCategory =
          categoryFilter === "all" || transaction.category === categoryFilter;

        const matchesMonth =
          !monthFilter ||
          String(transaction.date).slice(0, 7) === monthFilter;

        const matchesStart = !startDate || transaction.date >= startDate;
        const matchesEnd = !endDate || transaction.date <= endDate;

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesMonth &&
          matchesStart &&
          matchesEnd
        );
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [
    transactions,
    search,
    typeFilter,
    categoryFilter,
    monthFilter,
    startDate,
    endDate,
  ]);

  const budgetPercent =
    budget > 0 ? Math.min((monthlyTotals.expenses / budget) * 100, 100) : 0;

  const isOverBudget = monthlyTotals.expenses > budget;
  const remainingBudget = budget - monthlyTotals.expenses;

  // Rule-based insights shown before AI insights are generated.
  const insights = useMemo(() => {
    const expenseTransactions = monthTransactions.filter(
      (transaction) => transaction.type === "expense"
    );

    const categoryTotals = expenseTransactions.reduce(
      (totals, transaction) => {
        const category = transaction.category || "Other";
        totals[category] =
          (totals[category] || 0) + Number(transaction.amount || 0);
        return totals;
      },
      {}
    );

    const topCategory = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const items = [];

    if (expenseTransactions.length === 0) {
      items.push({
        title: "Start tracking your spending",
        message:
          "Add an expense this month to see personalized spending insights.",
        type: "info",
      });
    } else if (isOverBudget) {
      items.push({
        title: "Monthly budget exceeded",
        message: `You are ${currency(
          Math.abs(remainingBudget)
        )} over your monthly budget. Review recent expenses to find areas to reduce.`,
        type: "warning",
      });
    } else if (budgetPercent >= 80) {
      items.push({
        title: "You're getting close to your budget",
        message: `${Math.round(
          budgetPercent
        )}% of your monthly budget is used. You have ${currency(
          remainingBudget
        )} left.`,
        type: "warning",
      });
    } else {
      items.push({
        title: "You're within your budget",
        message: `${currency(
          remainingBudget
        )} of your monthly budget remains. Keep monitoring your spending.`,
        type: "success",
      });
    }

    if (topCategory) {
      items.push({
        title: `Highest spending: ${topCategory[0]}`,
        message: `${currency(
          topCategory[1]
        )} spent in this category this month.`,
        type: "info",
      });
    }

    if (monthlyTotals.income > 0) {
      const savingsRate =
        ((monthlyTotals.income - monthlyTotals.expenses) /
          monthlyTotals.income) *
        100;

      items.push({
        title: "Monthly savings snapshot",
        message:
          savingsRate >= 0
            ? `You have kept ${Math.round(
                savingsRate
              )}% of this month's income after recorded expenses.`
            : "Your recorded expenses are higher than this month's income.",
        type: savingsRate >= 0 ? "success" : "warning",
      });
    }

    return items;
  }, [
    monthTransactions,
    isOverBudget,
    remainingBudget,
    budgetPercent,
    monthlyTotals,
  ]);

  // AI function is defined inside App, not inside useMemo.
  const generateAIInsights = () => {
  const incomeAmount = monthlyTotals.income;
  const expenseAmount = monthlyTotals.expenses;
  const budgetAmount = Number(budget) || 0;
  const savings = monthlyTotals.balance;

  const budgetUsage =
    budgetAmount > 0 ? (expenseAmount / budgetAmount) * 100 : 0;

  const topCategory = [...categoryData].sort(
    (a, b) => b.value - a.value
  )[0];

  const messages = [];

  if (incomeAmount <= 0) {
    messages.push("Add income this month to get a savings analysis.");
  } else if (savings > 0) {
    messages.push(`You have ${currency(savings)} left after this month's expenses.`);
  } else if (savings < 0) {
    messages.push(
      `Your expenses exceed your income by ${currency(Math.abs(savings))}. Review non-essential spending.`
    );
  } else {
    messages.push("Your income and expenses are currently equal.");
  }

  if (budgetAmount > 0) {
    if (budgetUsage > 100) {
      messages.push(
        `You are ${currency(expenseAmount - budgetAmount)} over your monthly budget.`
      );
    } else {
      messages.push(
        `You have used ${Math.round(budgetUsage)}% of your budget, with ${currency(budgetAmount - expenseAmount)} remaining.`
      );
    }
  } else {
    messages.push("Set a monthly budget to compare it with your spending.");
  }

  if (topCategory) {
    messages.push(
      `Your highest-spending category is ${topCategory.name} at ${currency(topCategory.value)}.`
    );
  }

  setAiInsights(messages.join("\n\n"));
};

async function saveTransactionToBackend(transaction) {
  const token = localStorage.getItem("token"); // use your actual login token key

  if (!token) {
    throw new Error("Please log in before saving a transaction.");
  }

  const response = await fetch("http://localhost:5000/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(transaction),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not save transaction.");
  }

  return data.transaction;
}

  async function addTransaction(event) {
    event.preventDefault();
    const amount = Number(form.amount);

    if (!form.title.trim()) {
      toast.error("Enter a transaction description.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }

    if (!form.date) {
      toast.error("Choose a transaction date.");
      return;
    }

    const newTransaction = {
      ...form,
      title: form.title.trim(),
      amount,
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    };

    try {
      const savedTransaction = await saveTransactionToBackend(newTransaction);

      setTransactions((current) => [
        {
          ...savedTransaction,
          id: savedTransaction._id,
        },
        ...current,
      ]);
    } catch (error) {
      toast.error(error.message);
      return;
    }
    setForm({
      title: "",
      category: "Food",
      type: "expense",
      amount: "",
      date: todayString(),
    });
    setShowForm(false);
    setAiInsights("");
    toast.success("Transaction added successfully!");
  }

  async function deleteTransaction(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete transaction");
      }

      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
      toast.success("Transaction deleted.");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error.message || "Could not delete transaction.");
    }
  }

  async function saveBudget(event) {
    event.preventDefault();

    const value = Number(budgetInput);

    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Enter a valid monthly budget greater than zero.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/budget", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save budget");
      }

      setBudget(value);
      setBudgetInput(String(value));
      setAiInsights("");
      toast.success("Monthly budget saved to your account.");
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error(error.message || "Could not save budget.");
    }
  }

  function exportCSV() {
    if (filteredTransactions.length === 0) {
      toast.error("There are no transactions to export.");
      return;
    }

    const headers = [
      "Description",
      "Type",
      "Category",
      "Amount (INR)",
      "Date",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.title,
      transaction.type,
      transaction.category,
      Number(transaction.amount).toFixed(2),
      transaction.date,
    ]);

    const escapeCell = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `finora-transactions-${todayString()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded.");
  }

  function exportPDF() {
    window.print();
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setMonthFilter(currentMonthString());
    setStartDate("");
    setEndDate("");
  }

  if (!currentUser) {
    return <Auth onAuthenticated={setCurrentUser} />;
  }

  return (
    <div className="app-shell">
      <Toaster position="top-right" />

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={23} />
          </div>
          <span>
            Finora<span className="brand-dot">.</span>
          </span>
          <button
            className="icon-button mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="nav-menu">
          <a
            href="#dashboard"
            className="nav-item active"
            onClick={() => setMenuOpen(false)}
          >
            <LayoutDashboard size={19} /> Dashboard
          </a>
          <a
            href="#transactions"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            <ArrowLeftRight size={19} /> Transactions
          </a>
          <a
            href="#analytics"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            <ChartNoAxesCombined size={19} /> Analytics
          </a>
          <a
            href="#budget"
            className="nav-item"
            onClick={() => setMenuOpen(false)}
          >
            <PiggyBank size={19} /> Budget Planner
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">F</div>
            <div>
              <strong>{currentUser.name || "My Account"}</strong>
              <span>{currentUser.email || "Personal Finance"}</span>
            </div>
          </div>
          <a href="#settings" className="nav-item settings-link">
            <Settings size={19} /> Settings
          </a>
          <button
            className="nav-item logout-button"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("finora-user");
              setCurrentUser(null);
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>
          <div className="topbar-right">
            <span className="today-date">
              {new Date().toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <div className="avatar top-avatar">F</div>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR FINANCIAL OVERVIEW</p>
            <h1>Good to see you! 👋</h1>
            <p className="subtitle">
              Here's what's happening with your money.
            </p>
          </div>
          <button
            className="primary-button"
            onClick={() => setShowForm((current) => !current)}
          >
            <Plus size={19} /> Add Transaction
          </button>
        </section>

        {showForm && (
          <section className="panel form-panel">
            <div className="section-heading">
              <div>
                <h2>New Transaction</h2>
                <p>Enter the details of your income or expense.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form className="transaction-form" onSubmit={addTransaction}>
              <label>
                Description
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Grocery shopping"
                  maxLength={100}
                  required
                />
              </label>
              <label>
                Amount (₹)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </label>
              <label>
                Transaction Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      type: event.target.value,
                      category:
                        event.target.value === "income" ? "Salary" : "Food",
                    })
                  }
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                >
                  {categories
                    .filter((category) =>
                      form.type === "income"
                        ? ["Salary", "Freelance", "Other"].includes(category)
                        : !["Salary", "Freelance"].includes(category)
                    )
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={form.date}
                  max={todayString()}
                  onChange={(event) =>
                    setForm({ ...form, date: event.target.value })
                  }
                  required
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={17} /> Save Transaction
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Balance</span>
              <span className="stat-icon purple">
                <Wallet size={20} />
              </span>
            </div>
            <h2>{currency(totals.balance)}</h2>
            <p className="stat-note">All recorded income minus expenses</p>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Income</span>
              <span className="stat-icon green">
                <TrendingUp size={20} />
              </span>
            </div>
            <h2>{currency(totals.income)}</h2>
            <p className="stat-note">All recorded income</p>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Total Expenses</span>
              <span className="stat-icon orange">
                <TrendingDown size={20} />
              </span>
            </div>
            <h2>{currency(totals.expenses)}</h2>
            <p className="stat-note">All recorded expenses</p>
          </article>
          <article className="stat-card">
            <div className="stat-top">
              <span>Monthly Budget</span>
              <span className="stat-icon blue">
                <PiggyBank size={20} />
              </span>
            </div>
            <h2>{currency(budget)}</h2>
            <p className="stat-note">
              {Math.round(budgetPercent)}% of this month's budget used
            </p>
          </article>
        </section>

        <section className="panel insights-panel" id="insights">
          <div className="section-heading">
            <div>
              <h2>
                <Sparkles size={19} /> AI Insights
              </h2>
              <p>
                Helpful observations based on your recorded transactions.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={generateAIInsights}
              disabled={aiLoading}
            >
              <Sparkles size={16} />
              {aiLoading ? "Generating..." : "Generate AI insights"}
            </button>
          </div>

          {aiInsights ? (
            <div className="ai-generated-insights">
              <p>{aiInsights}</p>
            </div>
          ) : (
            <div className="insights-list">
              {insights.map((insight, index) => (
                <article
                  className={`insight-card insight-${insight.type}`}
                  key={`${insight.title}-${index}`}
                >
                  <span className="insight-indicator" />
                  <div>
                    <strong>{insight.title}</strong>
                    <p>{insight.message}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="insights-note">
            AI-generated insights are based on your monthly income, expenses,
            budget, and category totals.
          </p>
        </section>

        <section className="content-grid">
          <article className="panel chart-panel" id="analytics">
            <div className="section-heading">
              <div>
                <h2>Expense Breakdown</h2>
                <p>Current-month expenses by category.</p>
              </div>
              <span className="pill">This month</span>
            </div>

            {categoryData.length > 0 ? (
              <>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={68}
                        outerRadius={105}
                        paddingAngle={4}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={colors[index % colors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => currency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-center">
                    <span>Monthly expenses</span>
                    <strong>{currency(monthlyTotals.expenses)}</strong>
                  </div>
                </div>
                <div className="legend-list">
                  {categoryData.map((item, index) => (
                    <div className="legend-item" key={item.name}>
                      <span
                        className="legend-dot"
                        style={{
                          background: colors[index % colors.length],
                        }}
                      />
                      <span>{item.name}</span>
                      <strong>{currency(item.value)}</strong>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <ChartNoAxesCombined size={36} />
                <p>No expense data for this month yet.</p>
                <span>Add an expense to see your chart.</span>
              </div>
            )}
          </article>

          <article className="panel chart-panel">
            <div className="section-heading">
              <div>
                <h2>Income vs Expenses</h2>
                <p>Monthly trends across your recorded transactions.</p>
              </div>
            </div>

            {monthlyTrendData.length > 0 ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTrendData}
                    margin={{ top: 10, right: 12, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis
                      tickFormatter={(value) =>
                        new Intl.NumberFormat("en-IN", {
                          notation: "compact",
                          maximumFractionDigits: 1,
                        }).format(value)
                      }
                    />
                    <Tooltip formatter={(value) => currency(value)} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#14b8a6" />
                    <Bar dataKey="expenses" name="Expenses" fill="#f97316" />
                    <Bar dataKey="balance" name="Net Balance" fill="#a78bfa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="empty-state">
                <ChartNoAxesCombined size={36} />
                <p>No transaction data available yet.</p>
                <span>Add income or expenses to see the trend.</span>
              </div>
            )}
          </article>

          <article className="panel budget-panel budget-panel-wide" id="budget">
            <div className="section-heading">
              <div>
                <h2>Budget Planner</h2>
                <p>Track spending for the current month.</p>
              </div>
              <span className="budget-emoji">🎯</span>
            </div>

            <div className="budget-total">
              <span>Monthly spending</span>
              <strong>{currency(monthlyTotals.expenses)}</strong>
              <span className="muted">of {currency(budget)}</span>
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${
                  isOverBudget ? "over-budget" : ""
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <div className="budget-stats">
              <span>{Math.round(budgetPercent)}% used</span>
              <strong className={isOverBudget ? "danger-text" : ""}>
                {isOverBudget
                  ? `${currency(Math.abs(remainingBudget))} over budget`
                  : `${currency(remainingBudget)} remaining`}
              </strong>
            </div>

            {isOverBudget && (
              <p className="budget-warning">
                You've exceeded your budget. Review your spending.
              </p>
            )}

            <form className="budget-form" onSubmit={saveBudget}>
              <label htmlFor="budgetInput">Set monthly budget (₹)</label>
              <div className="budget-input-row">
                <input
                  id="budgetInput"
                  type="number"
                  min="1"
                  step="0.01"
                  value={budgetInput}
                  onChange={(event) => setBudgetInput(event.target.value)}
                  required
                />
                <button type="submit" className="secondary-button">
                  Update
                </button>
              </div>
            </form>

            <div className="budget-tip">
              <span>💡</span>
              <p>
                Your monthly budget is saved to your account and restored when you log in.
              </p>
            </div>
          </article>
        </section>

        <section className="panel transactions-panel" id="transactions">
          <div className="section-heading transaction-heading">
            <div>
              <h2>Transaction History</h2>
              <p>
                Search, filter, export, and manage income and expenses.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setShowForm(true);
                document
                  .getElementById("dashboard")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <Plus size={17} /> Add New
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search description or category..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search transactions"
              />
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter transaction type"
            >
              <option value="all">All types</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter category"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              aria-label="Filter month"
            >
              <option value="">All months</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {new Date(`${month}-15T12:00:00`).toLocaleDateString(
                    "en-IN",
                    { month: "long", year: "numeric" }
                  )}
                </option>
              ))}
            </select>
          </div>

          <div className="table-toolbar date-filter-toolbar">
            <label className="date-filter">
              From{" "}
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="date-filter">
              To{" "}
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <button className="secondary-button" onClick={resetFilters}>
              <RotateCcw size={16} /> Reset filters
            </button>
            <div className="export-actions">
              <button className="secondary-button" onClick={exportCSV}>
                <Download size={16} /> Export CSV
              </button>
              <button className="secondary-button" onClick={exportPDF}>
                <Printer size={16} /> Save as PDF
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>TRANSACTION</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transaction-title">
                        <span
                          className={`transaction-symbol ${transaction.type}`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp size={17} />
                          ) : (
                            <TrendingDown size={17} />
                          )}
                        </span>
                        <strong>{transaction.title}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {transaction.category}
                      </span>
                    </td>
                    <td>
                      {transaction.date && !Number.isNaN(new Date(transaction.date).getTime())
                      ? new Date(transaction.date).toLocaleDateString("en-IN")
                      : "—"}
                    </td>
                    <td
                      className={
                        transaction.type === "income"
                          ? "income-amount"
                          : "expense-amount"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {currency(transaction.amount)}
                    </td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => deleteTransaction(transaction.id)}
                        aria-label={`Delete ${transaction.title}`}
                        title="Delete transaction"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="no-results">
                      No matching transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transaction{transactions.length === 1 ? "" : "s"}
          </div>
        </section>

        <section className="panel settings-panel" id="settings">
          <div className="section-heading">
            <div>
              <h2>Data & Settings</h2>
              <p>Your transactions and budget are saved to your account.</p>
            </div>
          </div>
          <div className="settings-actions">
            <button className="secondary-button" onClick={exportCSV}>
              <Download size={16} /> Back up transactions (CSV)
            </button>

            <button
              className="secondary-button"
              onClick={async () => {
              if (
                !window.confirm(
                  "Delete ALL transactions? This cannot be undone."
                )
              ) {
                return;
              }

              try {
                const response = await fetch("http://localhost:5000/api/transactions", {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.message || "Could not clear transactions");
                }

                setTransactions([]);
                setAiInsights("");
                toast.success("All transactions cleared.");
              } catch (error) {
                console.error("Error clearing transactions:", error);
                toast.error(error.message || "Could not clear transactions.");
              }
            }}
            >
              <Trash2 size={16} /> Clear all transactions
            </button>
          </div>
        </section>

        <footer className="footer">
          <span>Finora · Personal Finance Tracker</span>
          <span>Manage your money with confidence.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;