import React from "react";

const features = [
	{
		title: "Inventory Tracking",
		description: "Real-time stock visibility with smart reorder alerts and low-stock nudges.",
	},
	{
		title: "Sales Management",
		description: "Lightning-fast checkout flows, discounts, and multi-channel order syncing.",
	},
	{
		title: "Expense Tracking",
		description: "Categorize spend, attach receipts, and watch cash flow in one dashboard.",
	},
	{
		title: "Analytics Dashboard",
		description: "KPIs at a glance with trends, forecasts, and daily pulse metrics ready to share.",
	},
	{
		title: "Monthly Reports",
		description: "Automated summaries with revenue, margin, and cost breakdowns in your inbox.",
	},
	{
		title: "Multi-Shop Support",
		description: "Manage locations from one place with unified catalogs and role-based access.",
	},
];

const steps = [
	{
		title: "Connect & Import",
		description: "Bring products, sales, and expenses from spreadsheets or your POS in minutes.",
	},
	{
		title: "Automate the Busywork",
		description: "Set rules for stock alerts, tax handling, and recurring expenses so you stay hands-off.",
	},
	{
		title: "Monitor & Grow",
		description: "Track performance, spot trends, and ship decisions faster with live insights.",
	},
];

const LandingPage = () => {
	return (
		<div className="min-h-screen bg-[#050506] text-gray-100">
			<div className="absolute inset-0 overflow-hidden">
				<div className="pointer-events-none absolute -top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#121317]/50 via-[#0b0c10]/70 to-[#0d0e12]/60 blur-3xl" />
				<div className="pointer-events-none absolute bottom-[-12rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-[#111217]/55 via-[#0b0b0f]/50 to-[#0d0e12]/60 blur-3xl" />
			</div>

			<div className="relative mx-auto max-w-6xl px-6 pb-24">
				{/* Navigation */}
				<header className="sticky top-0 z-20 -mx-6 mb-12 border-b border-white/5 bg-[#050506]/85 backdrop-blur">
					<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
						<div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
							
							<span className="text-gray-50">Shop Flow</span>
						</div>
						<nav className="hidden items-center gap-8 text-sm font-medium text-gray-200 md:flex">
							<a href="/#features" className="transition-colors hover:text-gray-100">
								Features
							</a>
							<a href="/#demo" className="transition-colors hover:text-gray-100">
								Demo
							</a>
							<a href="/login" className="transition-colors hover:text-gray-100">
								Login
							</a>
						</nav>
						<div className="flex items-center gap-3">
							<a
									href="/login"
									className="hidden btn-secondary px-4 py-2 text-sm font-semibold md:inline-flex"
								>
								Login
							</a>
								<a
									href="/signup"
									className="btn-primary px-4 py-2 text-sm"
								>
								Sign Up
							</a>
						</div>
					</div>
				</header>

				{/* Hero */}
				<section className="relative grid items-center gap-10 md:grid-cols-2 md:gap-14">
					<div className="space-y-6">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0e12]/90 px-4 py-2 text-xs font-semibold text-gray-200 shadow-inner shadow-black/40">
							<span className="h-2 w-2 rounded-full bg-[#22c55e]" />
							<span>Live retail intelligence for modern shops</span>
						</div>
						<h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-50 md:text-5xl lg:text-6xl">
							Keep every sale, expense, and decision in one sleek workspace.
						</h1>
						<p className="max-w-xl text-lg text-gray-300/80">
							Nova Retail OS combines inventory, sales, and spend into a single command center with automation-first workflows and beautiful reporting.
						</p>
						<div className="flex flex-wrap gap-3">
							<a
								href="/guest"
								className="btn-primary px-6 py-3 text-sm"
							>
								Try Free Demo
							</a>
							<a
								href="/signup"
								className="btn-secondary px-6 py-3 text-sm font-semibold"
							>
								Get Started
							</a>
						</div>
						<div className="flex flex-wrap gap-6 text-sm text-gray-300/70">
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-[#22c55e]" />
								<span>Setup in under 5 minutes</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
								<span>No credit card required</span>
							</div>
						</div>
					</div>

					<div className="relative">
						<div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-[#121317]/50 to-[#0c0d12]/60 blur-3xl" />
						<div className="absolute -right-10 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-tl from-[#111217]/55 to-[#0d0e12]/60 blur-3xl" />
						<div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0e12]/80 p-6 shadow-2xl shadow-black/60 backdrop-blur">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-300">Today</p>
									<p className="text-3xl font-semibold text-gray-50">LKR 12,480</p>
									<p className="text-xs text-[#22c55e]">+18% vs last week</p>
								</div>
								<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-2xl font-bold text-[#a0f0c2]">
									↑
								</div>
							</div>
							<div className="mt-6 grid grid-cols-3 gap-4 text-xs text-gray-200/80">
								<div className="space-y-2 rounded-xl border border-white/5 bg-[#0f1014] p-3">
									<p className="text-gray-300">Inventory</p>
									<p className="text-lg font-semibold text-gray-50">In Sync</p>
									<p className="text-[11px] text-[#22c55e]">Auto-replenish on</p>
								</div>
								<div className="space-y-2 rounded-xl border border-white/5 bg-[#0f1014] p-3">
									<p className="text-gray-300">Sales</p>
									<p className="text-lg font-semibold text-gray-50">+32%</p>
									<p className="text-[11px] text-[#67e8f9]">7-day velocity</p>
								</div>
								<div className="space-y-2 rounded-xl border border-white/5 bg-[#0f1014] p-3">
									<p className="text-gray-300">Expenses</p>
									<p className="text-lg font-semibold text-gray-50">-9%</p>
									<p className="text-[11px] text-[#fbbf24]">Smart controls</p>
								</div>
							</div>
							<div className="mt-6 rounded-xl bg-gradient-to-r from-[#0f141c] via-[#0c1118] to-[#0f141c] p-4 text-sm text-gray-200/80">
								Automations are active: nightly sync, receipt OCR, and anomaly watch.
							</div>
						</div>
					</div>
				</section>

				{/* Features */}
				<section id="features" className="relative mt-24 space-y-10">
					<div className="flex flex-col gap-3 text-center">
						<h2 className="text-3xl font-semibold text-gray-50 md:text-4xl">Powerful out of the box</h2>
						<p className="text-gray-300/80">
							Six essentials your shop needs to stay lean, informed, and always ready for the next rush.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<div
								key={feature.title}
								className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d0e12]/80 p-5 shadow-lg shadow-black/50 transition hover:-translate-y-1 hover:border-white/20 hover:shadow-black/70"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition duration-500 group-hover:opacity-10" />
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-[#a0f0c2]">
									•
								</div>
								<h3 className="mt-4 text-lg font-semibold text-gray-50">{feature.title}</h3>
								<p className="mt-2 text-sm text-gray-300/80">{feature.description}</p>
							</div>
						))}
					</div>
				</section>

				{/* How it works */}
				<section id="demo" className="relative mt-24 space-y-10">
					<div className="flex flex-col gap-3 text-center">
						<h2 className="text-3xl font-semibold text-gray-50 md:text-4xl">How it works</h2>
						<p className="text-gray-300/80">
							From connect to launch in three quick steps.
						</p>
					</div>
					<div className="grid gap-6 md:grid-cols-3">
						{steps.map((step, idx) => (
							<div
								key={step.title}
								className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d0e12]/80 p-6 shadow-lg shadow-black/50"
							>
								<div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0" />
								<div className="relative flex items-center gap-3 text-sm font-semibold text-gray-200">
									<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-lg text-[#a0f0c2]">
										{idx + 1}
									</span>
									{step.title}
								</div>
								<p className="relative mt-3 text-sm text-gray-300/80">{step.description}</p>
							</div>
						))}
					</div>
				</section>

				{/* Final CTA */}
				<section id="signup" className="relative mt-24 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d0f11] via-[#0a0b0d] to-[#0d0f11] px-8 py-12 shadow-2xl shadow-black/50">
					<div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
					<div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-white/8 blur-3xl" />
					<div className="relative flex flex-col items-start gap-4 text-left md:flex-row md:items-center md:justify-between">
						<div className="space-y-3">
							<h3 className="text-3xl font-semibold text-gray-50 md:text-4xl">Start your free trial</h3>
							<p className="text-gray-300 md:max-w-xl">
								Launch with full features, guided onboarding, and automation templates built for busy teams.
							</p>
						</div>
						<a
							href="/signup"
							className="btn-primary px-6 py-3 text-sm"
						>
							Start Your Free Trial
						</a>
					</div>
				</section>
			</div>
		</div>
	);
};

export default LandingPage;
