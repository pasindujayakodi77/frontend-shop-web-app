import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";

// Register chart elements once for this demo page
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const stats = [
	{ label: "Monthly Revenue", value: "$84,200", detail: "+18% vs last month" },
	{ label: "Average Order Value", value: "$62.40", detail: "4.2 items per order" },
	{ label: "Net Margin", value: "26.4%", detail: "+2.1 pts vs last month" },
];

const products = [
	{ name: "Carbon Fiber Sneaker", sku: "SN-204", stock: 48, price: "$129", velocity: "+22%" },
	{ name: "Everyday Tote", sku: "BG-118", stock: 92, price: "$58", velocity: "+9%" },
	{ name: "Minimal Watch", sku: "WT-303", stock: 35, price: "$199", velocity: "+15%" },
	{ name: "Athletic Hoodie", sku: "HD-077", stock: 64, price: "$74", velocity: "+11%" },
];

const recentSales = [
	{ order: "#1045", customer: "Alex R.", total: "$184", status: "Paid", channel: "Web" },
	{ order: "#1044", customer: "Dakota S.", total: "$246", status: "Paid", channel: "POS" },
	{ order: "#1043", customer: "Morgan K.", total: "$98", status: "Paid", channel: "Web" },
	{ order: "#1042", customer: "Lee P.", total: "$312", status: "Paid", channel: "Wholesale" },
];

const salesTrend = {
	labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
	datasets: [
		{
			label: "Sales",
			data: [9200, 11340, 10480, 12950, 14880, 17240, 15320],
			backgroundColor: "rgba(56, 189, 248, 0.7)",
			borderColor: "rgba(56, 189, 248, 1)",
			borderWidth: 1,
			rounded: true,
		},
	],
};

const revenueVsExpenses = {
	labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
	datasets: [
		{
			label: "Revenue",
			data: [62000, 68400, 71200, 75400, 79900, 84200],
			backgroundColor: "rgba(52, 211, 153, 0.75)",
			borderColor: "rgba(52, 211, 153, 1)",
			borderWidth: 1,
		},
		{
			label: "Expenses",
			data: [44800, 46200, 48900, 50800, 52700, 56600],
			backgroundColor: "rgba(248, 113, 113, 0.75)",
			borderColor: "rgba(248, 113, 113, 1)",
			borderWidth: 1,
		},
	],
};

const expenseMix = {
	labels: ["Inventory", "Marketing", "Operations", "Logistics", "SaaS"],
	datasets: [
		{
			label: "Expense Mix",
			data: [42, 18, 16, 14, 10],
			backgroundColor: [
				"rgba(59, 130, 246, 0.8)",
				"rgba(167, 139, 250, 0.8)",
				"rgba(74, 222, 128, 0.8)",
				"rgba(244, 114, 182, 0.8)",
				"rgba(248, 180, 0, 0.8)",
			],
			borderColor: [
				"rgba(59, 130, 246, 1)",
				"rgba(167, 139, 250, 1)",
				"rgba(74, 222, 128, 1)",
				"rgba(244, 114, 182, 1)",
				"rgba(248, 180, 0, 1)",
			],
			borderWidth: 1,
		},
	],
};

const DemoPage = () => {
	return (
		<div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
			<div className="pointer-events-none absolute inset-0 select-none">
				<div className="absolute -top-40 -left-28 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
				<div className="absolute top-1/3 right-16 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
				<div className="absolute -bottom-52 right-0 h-96 w-96 rounded-full bg-sky-500/12 blur-[110px]" />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
				<div className="rounded-2xl border border-sky-400/20 bg-gradient-to-r from-sky-600/30 via-cyan-500/20 to-emerald-400/20 px-6 py-4 shadow-[0_22px_120px_-48px_rgba(14,165,233,0.55)] backdrop-blur">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="text-xs uppercase tracking-[0.18em] text-slate-100/80">Demo mode</p>
							<h1 className="text-xl font-semibold text-slate-50">You're viewing a demo. Sign up to manage your own shop!</h1>
						</div>
						<a
							href="/signup"
							className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2 text-sm font-semibold text-slate-50 shadow-lg shadow-slate-900/60 transition hover:scale-[1.02]"
						>
							Sign Up Now
						</a>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_120px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl ring-1 ring-white/5">
					<div className="flex flex-col gap-2">
						<p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dashboard preview</p>
						<h2 className="text-3xl font-semibold text-slate-50">ShopFlow Control Center</h2>
						<p className="text-sm text-slate-400">Explore live-style data, charts, and cards powered by sample numbers.</p>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{stats.map((stat) => (
						<div key={stat.label} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
							<p className="text-xs uppercase tracking-[0.1em] text-slate-400">{stat.label}</p>
							<p className="mt-2 text-3xl font-semibold text-slate-50">{stat.value}</p>
							<p className="text-sm text-emerald-300/90">{stat.detail}</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5 lg:col-span-2">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-slate-100">Weekly Sales</h3>
							<span className="text-xs text-slate-400">Auto-generated demo data</span>
						</div>
						<div className="h-80">
							<Bar
								data={salesTrend}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: { labels: { color: "#e2e8f0" } },
										title: { display: false },
									},
									scales: {
										x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
										y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
									},
								}}
							/>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
						<h3 className="text-lg font-semibold text-slate-100 mb-4">Expense Mix</h3>
						<div className="h-80 flex items-center justify-center">
							<Pie
								data={expenseMix}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: { position: "bottom", labels: { color: "#e2e8f0" } },
										title: { display: false },
									},
								}}
							/>
						</div>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-lg font-semibold text-slate-100">Revenue vs Expenses</h3>
						<span className="text-xs text-slate-400">6-month outlook</span>
					</div>
					<div className="h-80">
						<Bar
							data={revenueVsExpenses}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: { labels: { color: "#e2e8f0" } },
									title: { display: false },
								},
								scales: {
									x: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
									y: { ticks: { color: "#cbd5e1" }, grid: { color: "rgba(148,163,184,0.2)" } },
								},
							}}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-100">Top Products</h3>
							<span className="text-xs text-slate-400">Velocity vs last week</span>
						</div>
						<div className="space-y-3">
							{products.map((product) => (
								<div key={product.sku} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/50 px-4 py-3">
									<div>
										<p className="text-sm font-semibold text-slate-100">{product.name}</p>
										<p className="text-xs text-slate-400">SKU {product.sku}</p>
									</div>
									<div className="flex items-center gap-4 text-sm">
										<span className="text-slate-200">{product.price}</span>
										<span className="text-slate-400">Stock {product.stock}</span>
										<span className="text-emerald-300 font-semibold">{product.velocity}</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-[0_18px_80px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/5">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-slate-100">Recent Sales</h3>
							<span className="text-xs text-slate-400">Demo orders</span>
						</div>
						<div className="space-y-3">
							{recentSales.map((sale) => (
								<div key={sale.order} className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-800/50 px-4 py-3">
									<div>
										<p className="text-sm font-semibold text-slate-100">Order {sale.order}</p>
										<p className="text-xs text-slate-400">{sale.customer} • {sale.channel}</p>
									</div>
									<div className="flex items-center gap-3 text-sm">
										<span className="font-semibold text-slate-50">{sale.total}</span>
										<span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">{sale.status}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DemoPage;
