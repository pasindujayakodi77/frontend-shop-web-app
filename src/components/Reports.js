import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Line } from "react-chartjs-2";
import { clearUserData, isGuestMode } from "../utils/auth";
import { expensesAPI, productsAPI, salesAPI } from "../utils/api";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySalesChart, setDailySalesChart] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const guest = isGuestMode();
    setIsGuest(guest);

    if (guest) {
      seedGuestData();
      return;
    }

    fetchMonthlySummary();
  }, []);

  const seedGuestData = () => {
    setReportData({
      totalSales: 42,
      revenue: 84200,
      profit: 27800,
      expenses: 31600,
      netProfit: -3800,
      topProducts: [
        { id: "demo-1", name: "Carbon Fiber Sneaker", quantity: 48, revenue: 6192 },
        { id: "demo-2", name: "Everyday Tote", quantity: 92, revenue: 5336 },
        { id: "demo-3", name: "Minimal Watch", quantity: 35, revenue: 6965 },
      ],
      productsCount: 128,
    });

    setDailySalesChart({
      labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
      datasets: [
        {
          label: "Daily Sales (LKR)",
          data: [2800, 4200, 3900, 5200, 6100, 4800, 7300],
          borderColor: "#22d3ee",
          backgroundColor: "rgba(34, 211, 238, 0.15)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#22d3ee",
          pointBorderColor: "#0f172a",
          pointBorderWidth: 2,
        },
      ],
    });

    setError(null);
    setLoading(false);
  };

  const fetchMonthlySummary = async () => {
    try {
      setLoading(true);
      const [salesData, productsData, expensesData] = await Promise.all([salesAPI.getAll(), productsAPI.getAll(), expensesAPI.getAll()]);

      const sales = Array.isArray(salesData) ? salesData : [];
      const productsResponse = productsData.products || productsData;
      const products = Array.isArray(productsResponse) ? productsResponse : [];
      const expenses = Array.isArray(expensesData) ? expensesData : [];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlySales = sales.filter((sale) => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      });

      let totalSales = monthlySales.length;
      let revenue = 0;
      let profit = 0;
      let costOfGoodsSold = 0;
      const productSalesMap = {};

      monthlySales.forEach((sale) => {
        revenue += sale.totalRevenue || 0;
        profit += sale.totalProfit || 0;

        if (sale.products) {
          sale.products.forEach((product) => {
            costOfGoodsSold += (product.costPrice || 0) * (product.quantity || 0);

            const productId = product.productId;
            if (!productSalesMap[productId]) {
              productSalesMap[productId] = {
                id: productId,
                name: product.productName,
                quantity: 0,
                revenue: 0,
              };
            }
            productSalesMap[productId].quantity += product.quantity || 0;
            productSalesMap[productId].revenue += (product.sellingPrice || 0) * (product.quantity || 0);
          });
        }
      });

      const monthlyExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });

      const totalExpenses = monthlyExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const netProfit = profit - totalExpenses;

      setReportData({
        totalSales,
        revenue,
        profit,
        expenses: totalExpenses + costOfGoodsSold,
        netProfit,
        topProducts,
        productsCount: products.length,
      });

      generateDailySalesChart(sales);
      setError(null);
    } catch (err) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to load report data. Please make sure you are logged in and the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const generateDailySalesChart = (sales) => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      const dailySales = Array(daysInMonth).fill(0);

      sales.forEach((sale) => {
        const saleDate = new Date(sale.date);
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
          const day = saleDate.getDate() - 1;
          dailySales[day] += sale.totalRevenue || 0;
        }
      });

      setDailySalesChart({
        labels: Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: "Daily Sales (LKR)",
            data: dailySales,
            borderColor: "#22d3ee",
            backgroundColor: "rgba(34, 211, 238, 0.15)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: "#22d3ee",
            pointBorderColor: "#0f172a",
            pointBorderWidth: 2,
          },
        ],
      });
    } catch (err) {
      console.error("Error generating chart:", err);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Monthly Sales Report", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.setFontSize(12);
    let yPos = 45;

    doc.text(`Total Sales: ${reportData.totalSales || 0}`, 14, yPos);
    yPos += 10;
    doc.text(`Revenue: ${formatCurrency(reportData.revenue)}`, 14, yPos);
    yPos += 10;
    doc.text(`Profit: ${formatCurrency(reportData.profit)}`, 14, yPos);
    yPos += 10;
    doc.text(`Expenses: ${formatCurrency(reportData.expenses)}`, 14, yPos);
    yPos += 10;
    doc.text(`Net Profit: ${formatCurrency(reportData.netProfit)}`, 14, yPos);

    if (reportData.topProducts && reportData.topProducts.length > 0) {
      yPos += 20;
      doc.text("Top Products", 14, yPos);

      const tableData = reportData.topProducts.map((product, index) => [
        index + 1,
        product.name || "N/A",
        product.quantity || 0,
        formatCurrency(product.revenue),
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [["#", "Product Name", "Quantity Sold", "Revenue"]],
        body: tableData,
      });
    }

    doc.save("monthly-sales-report.pdf");
  };

  const downloadExcel = () => {
    if (!reportData) return;

    const metricsData = [
      ["Monthly Sales Report"],
      [],
      ["Metric", "Value"],
      ["Total Sales", reportData.totalSales || 0],
      ["Revenue", formatCurrency(reportData.revenue)],
      ["Profit", formatCurrency(reportData.profit)],
      ["Expenses", formatCurrency(reportData.expenses)],
      ["Net Profit", formatCurrency(reportData.netProfit)],
      [],
      ["Top Products"],
      ["#", "Product Name", "Quantity Sold", "Revenue"],
    ];

    if (reportData.topProducts && reportData.topProducts.length > 0) {
      reportData.topProducts.forEach((product, index) => {
        metricsData.push([index + 1, product.name || "N/A", product.quantity || 0, formatCurrency(product.revenue)]);
      });
    }

    const ws = XLSX.utils.aoa_to_sheet(metricsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");
    XLSX.writeFile(wb, "monthly-sales-report.xlsx");
  };

  const handleLogout = () => {
    if (isGuest) {
      localStorage.removeItem("guest_mode");
      navigate("/");
      return;
    }
    clearUserData();
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatCurrency = (amount) => `LKR ${(parseFloat(amount || 0)).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-cyan-400"></div>
          <p className="text-sm text-slate-400">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex items-center justify-center px-4 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800/70 bg-slate-900/70 p-8 backdrop-blur-xl shadow-[0_24px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-50 mb-2">Error Loading Report</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchMonthlySummary}
            className="btn-primary px-5 py-2 text-sm"
          >
            Retry
          </button>
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
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reports</p>
                <h1 className="text-2xl font-semibold text-slate-50">Monthly Sales Report</h1>
                <p className="text-sm text-slate-400">Generated on {new Date().toLocaleDateString()}</p>
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
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={downloadPDF}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Download PDF
            </button>
            <button
              onClick={downloadExcel}
              className="btn-secondary px-5 py-2.5 text-sm"
            >
              Download Excel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Sales" value={reportData?.totalSales || 0} accent="from-cyan-400 to-blue-500" />
            <MetricCard title="Revenue" value={formatCurrency(reportData?.revenue)} accent="from-emerald-400 to-cyan-500" />
            <MetricCard title="Expenses" value={formatCurrency(reportData?.expenses)} accent="from-rose-400 to-amber-400" />
            <MetricCard
              title="Net Profit"
              value={formatCurrency(reportData?.netProfit)}
              accent={(reportData?.netProfit || 0) >= 0 ? "from-emerald-400 to-cyan-500" : "from-rose-400 to-orange-400"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SummaryCard label="Average Sale" value={
              reportData?.totalSales ? formatCurrency((reportData.revenue || 0) / reportData.totalSales) : formatCurrency(0)
            } />
            <SummaryCard label="Products Tracked" value={reportData?.productsCount || 0} muted />
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trend</p>
                <h2 className="text-lg font-semibold text-slate-50">Daily Sales - Current Month</h2>
              </div>
            </div>
            {dailySalesChart ? (
              <div className="h-96">
                <Line
                  data={dailySalesChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: { color: "#cbd5e1", font: { size: 13 } },
                      },
                      title: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => `Sales: ${formatCurrency(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: "#94a3b8",
                          callback: (value) => `LKR ${value}`,
                        },
                        grid: { color: "rgba(255,255,255,0.05)" },
                      },
                      x: {
                        ticks: { color: "#94a3b8" },
                        grid: { color: "rgba(255,255,255,0.03)" },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-slate-400">Loading chart data...</div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Leaderboard</p>
                <h2 className="text-lg font-semibold text-slate-50">Top Products</h2>
              </div>
            </div>

            {reportData?.topProducts && reportData.topProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-800/80 text-slate-300">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Rank</th>
                      <th className="px-6 py-3 text-left font-semibold">Product Name</th>
                      <th className="px-6 py-3 text-left font-semibold">Quantity Sold</th>
                      <th className="px-6 py-3 text-left font-semibold">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {reportData.topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-slate-800/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-slate-900 ${
                              index === 0
                                ? "bg-gradient-to-br from-amber-300 to-amber-500"
                                : index === 1
                                ? "bg-gradient-to-br from-slate-300 to-slate-500"
                                : index === 2
                                ? "bg-gradient-to-br from-orange-300 to-orange-500"
                                : "bg-gradient-to-br from-cyan-300 to-blue-500"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-100 whitespace-nowrap">{product.name || "N/A"}</td>
                        <td className="px-6 py-4 text-slate-200 whitespace-nowrap">{product.quantity || 0}</td>
                        <td className="px-6 py-4 text-emerald-200 font-semibold whitespace-nowrap">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-slate-400">No product data available.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, accent }) => (
  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
    <p className="text-sm text-slate-400">{title}</p>
    <div className="mt-2 flex items-center justify-between">
      <p className="text-3xl font-semibold text-slate-50">{value}</p>
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent}`} />
    </div>
  </div>
);

const SummaryCard = ({ label, value, muted = false }) => (
  <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_80px_-45px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
    <p className="text-sm text-slate-400">{label}</p>
    <p className={`text-2xl font-semibold ${muted ? "text-slate-200" : "text-emerald-200"}`}>{value}</p>
  </div>
);

export default Reports;