import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearUserData } from "../utils/auth";
import { expensesAPI } from "../utils/api";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({ description: "", amount: "", category: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      setExpenses([]);
      alert("Failed to load expenses. Please make sure you are logged in and the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.amount || !formData.category) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (editingId !== null) {
        await expensesAPI.update(editingId, formData);
        setEditingId(null);
      } else {
        const newExpense = { date: new Date().toISOString(), ...formData };
        await expensesAPI.create(newExpense);
      }

      await fetchExpenses();
      setFormData({ description: "", amount: "", category: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense. Please try again.");
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
    });
    setEditingId(expense._id || expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesAPI.delete(id);
      await fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ description: "", amount: "", category: "" });
    setShowForm(false);
  };

  const handleLogout = () => {
    clearUserData();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatCurrency = (amount) => `LKR ${parseFloat(amount || 0).toFixed(2)}`;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <p className="text-sm text-slate-400">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0b0b] text-slate-100">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <header className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_24px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-[#0d0e12] text-gray-50 shadow-[0_12px_36px_-18px_rgba(0,0,0,0.85)]">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 7.5h9.5a3 3 0 0 1 0 6H10a3 3 0 0 0 0 6h9" />
                  <circle cx="5" cy="7.5" r="1.6" />
                  <circle cx="10" cy="16.5" r="1.6" />
                  <circle cx="19" cy="13.5" r="1.6" />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Expenses</p>
                <h1 className="text-2xl font-semibold text-slate-50">Expense Management</h1>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <p className="text-sm text-slate-400">Total Expenses</p>
              <p className="text-3xl font-semibold text-rose-200">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <p className="text-sm text-slate-400">Recorded Entries</p>
              <p className="text-3xl font-semibold text-slate-50">{expenses.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
              <p className="text-sm text-slate-400">Avg Expense</p>
              <p className="text-3xl font-semibold text-cyan-200">
                {expenses.length === 0 ? formatCurrency(0) : formatCurrency(totalExpenses / expenses.length)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-800/60">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Capture</p>
                <h2 className="text-lg font-semibold text-slate-50">{editingId !== null ? "Edit Expense" : "Add Expense"}</h2>
              </div>
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className="btn-primary px-4 py-2 text-sm"
              >
                {showForm ? "Hide Form" : "New Expense"}
              </button>
            </div>

            {showForm && (
              <div className="px-6 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="description" className="block text-sm text-slate-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                        placeholder="Software subscription, repairs, etc."
                      />
                    </div>
                    <div>
                      <label htmlFor="amount" className="block text-sm text-slate-300 mb-2">
                        Amount (LKR)
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label htmlFor="category" className="block text-sm text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-slate-800/70 bg-slate-800/70 px-4 py-2.5 text-slate-100 focus:border-cyan-400/80 focus:ring-2 focus:ring-cyan-500/30"
                      >
                        <option value="">Select Category</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Salaries">Salaries</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="btn-primary px-5 py-2.5 text-sm"
                    >
                      {editingId !== null ? "Update Expense" : "Add Expense"}
                    </button>
                    {editingId !== null && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-secondary px-5 py-2.5 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">History</p>
                <h2 className="text-lg font-semibold text-slate-50">Expense History</h2>
              </div>
            </div>

            {expenses.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400">
                No expenses recorded yet. Add your first expense to get insights.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Description</th>
                      <th className="px-6 py-3 text-left font-semibold">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold">Category</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {expenses.map((expense) => (
                      <tr key={expense._id || expense.id} className="hover:bg-slate-800/50">
                        <td className="px-6 py-4 text-slate-100 whitespace-nowrap">{formatDate(expense.date)}</td>
                        <td className="px-6 py-4 text-slate-300">{expense.description}</td>
                        <td className="px-6 py-4 text-rose-200 font-semibold whitespace-nowrap">{formatCurrency(expense.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-100">
                            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-rose-400 to-cyan-400" />
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(expense)}
                              className="btn-ghost px-3 py-1.5 text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id || expense.id)}
                              className="btn-danger px-3 py-1.5 text-xs font-semibold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Expenses;
