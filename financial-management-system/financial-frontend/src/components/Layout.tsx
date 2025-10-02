import { NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
	`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
		isActive
			? 'bg-emerald-600 text-white shadow'
			: 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
	}`;

export default function Layout() {
	return (
		<div className="min-h-full">
			<header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
				<div className="container-app py-4 flex items-center justify-between">
					<h1 className="text-xl font-semibold text-gray-900">Smart Waste - Financial Management</h1>
					<div className="flex items-center gap-3" />
				</div>
			</header>
			<div className="container-app py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
				<aside className="md:col-span-1">
					<nav className="space-y-1">
						<NavLink to="/dashboard" className={navLinkClass}>
							<span className="text-2xl md:text-3xl leading-none">📊</span>
							<span className="text-base">Dashboard</span>
						</NavLink>
						<NavLink to="/expenses" className={navLinkClass}>
							<span className="text-2xl md:text-3xl leading-none">💸</span>
							<span className="text-base">Expenses</span>
						</NavLink>
						<NavLink to="/incomes" className={navLinkClass}>
							<span className="text-2xl md:text-3xl leading-none">💵</span>
							<span className="text-base">Incomes</span>
						</NavLink>
					<NavLink to="/reports" className={navLinkClass}>
						<span className="text-2xl md:text-3xl leading-none">🧾</span>
						<span className="text-base">Reports</span>
					</NavLink>
					</nav>
				</aside>
				<main className="md:col-span-3">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
