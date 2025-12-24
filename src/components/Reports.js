import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailySalesChart, setDailySalesChart] = useState(null);

  useEffect(() => {
    fetchMonthlySummary();
  }, []);

  const fetchMonthlySummary = () => {
    try {
      setLoading(true);
      
      // Get sales data from localStorage
      const savedSales = localStorage.getItem("sales");
      const sales = savedSales ? JSON.parse(savedSales) : [];
      
      // Get products data from localStorage
      const savedProducts = localStorage.getItem("products");
      const products = savedProducts ? JSON.parse(savedProducts) : [];

      // Calculate current month's data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate.getMonth() === currentMonth && 
               saleDate.getFullYear() === currentYear;
      });

      // Calculate metrics
      let totalSales = monthlySales.length;
      let revenue = 0;
      let profit = 0;
      let expenses = 0;
      const productSalesMap = {};

      monthlySales.forEach(sale => {
        revenue += sale.totalRevenue || 0;
        profit += sale.totalProfit || 0;
        
        // Calculate expenses (cost of goods sold)
        if (sale.products) {
          sale.products.forEach(product => {
            expenses += (product.costPrice || 0) * (product.quantity || 0);
            
            // Track product sales
            const productId = product.productId;
            if (!productSalesMap[productId]) {
              productSalesMap[productId] = {
                id: productId,
                name: product.productName,
                quantity: 0,
                revenue: 0
              };
            }
            productSalesMap[productId].quantity += product.quantity || 0;
            productSalesMap[productId].revenue += (product.sellingPrice || 0) * (product.quantity || 0);
          });
        }
      });

      // Get top products
      const topProducts = Object.values(productSalesMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      const netProfit = profit;

      const data = {
        totalSales,
        revenue,
        profit,
        expenses,
        netProfit,
        topProducts
      };

      setReportData(data);
      generateDailySalesChart(sales);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load report data');
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

      // Initialize daily sales array
      const dailySales = Array(daysInMonth).fill(0);

      // Calculate sales for each day
      sales.forEach(sale => {
        const saleDate = new Date(sale.date);
        if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
          const day = saleDate.getDate() - 1; // 0-indexed
          dailySales[day] += sale.totalRevenue || 0;
        }
      });

      // Create chart data
      const chartData = {
        labels: Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label: 'Daily Sales ($)',
            data: dailySales,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          }
        ]
      };

      setDailySalesChart(chartData);
    } catch (err) {
      console.error('Error generating chart:', err);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Monthly Sales Report', 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add metrics
    doc.setFontSize(12);
    let yPos = 45;
    
    doc.text(`Total Sales: ${reportData.totalSales || 0}`, 14, yPos);
    yPos += 10;
    doc.text(`Revenue: $${reportData.revenue?.toFixed(2) || '0.00'}`, 14, yPos);
    yPos += 10;
    doc.text(`Profit: $${reportData.profit?.toFixed(2) || '0.00'}`, 14, yPos);
    yPos += 10;
    doc.text(`Expenses: $${reportData.expenses?.toFixed(2) || '0.00'}`, 14, yPos);
    yPos += 10;
    doc.text(`Net Profit: $${reportData.netProfit?.toFixed(2) || '0.00'}`, 14, yPos);
    
    // Add top products table
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      yPos += 20;
      doc.text('Top Products', 14, yPos);
      
      const tableData = reportData.topProducts.map((product, index) => [
        index + 1,
        product.name || 'N/A',
        product.quantity || 0,
        `$${product.revenue?.toFixed(2) || '0.00'}`
      ]);
      
      doc.autoTable({
        startY: yPos + 5,
        head: [['#', 'Product Name', 'Quantity Sold', 'Revenue']],
        body: tableData,
      });
    }
    
    doc.save('monthly-sales-report.pdf');
  };

  const downloadExcel = () => {
    if (!reportData) return;

    // Create worksheet data
    const metricsData = [
      ['Monthly Sales Report'],
      [],
      ['Metric', 'Value'],
      ['Total Sales', reportData.totalSales || 0],
      ['Revenue', `$${reportData.revenue?.toFixed(2) || '0.00'}`],
      ['Profit', `$${reportData.profit?.toFixed(2) || '0.00'}`],
      ['Expenses', `$${reportData.expenses?.toFixed(2) || '0.00'}`],
      ['Net Profit', `$${reportData.netProfit?.toFixed(2) || '0.00'}`],
      [],
      ['Top Products'],
      ['#', 'Product Name', 'Quantity Sold', 'Revenue']
    ];

    // Add top products data
    if (reportData.topProducts && reportData.topProducts.length > 0) {
      reportData.topProducts.forEach((product, index) => {
        metricsData.push([
          index + 1,
          product.name || 'N/A',
          product.quantity || 0,
          `$${product.revenue?.toFixed(2) || '0.00'}`
        ]);
      });
    }

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(metricsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Monthly Report');

    // Save file
    XLSX.writeFile(wb, 'monthly-sales-report.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Error Loading Report</h2>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={fetchMonthlySummary}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Monthly Sales Report</h1>
              <p className="text-gray-600 mt-2">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={downloadPDF}
                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={downloadExcel}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Sales */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {reportData?.totalSales || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ${reportData?.revenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Profit</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ${reportData?.profit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Expenses</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  ${reportData?.expenses?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Net Profit</p>
                <p className={`text-3xl font-bold mt-2 ${
                  (reportData?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${reportData?.netProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Sales Trend - Current Month</h2>
          {dailySalesChart ? (
            <div className="h-96">
              <Line
                data={dailySalesChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: {
                          size: 14
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'Sales Performance Over Time',
                      font: {
                        size: 16
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Sales: $${context.parsed.y.toFixed(2)}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toFixed(0);
                        }
                      },
                      title: {
                        display: true,
                        text: 'Sales Amount ($)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Day of Month'
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-600">Loading chart data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Products</h2>
          {reportData?.topProducts && reportData.topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity Sold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.topProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 
                            'bg-blue-500'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ${product.revenue?.toFixed(2) || '0.00'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600">No product data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;