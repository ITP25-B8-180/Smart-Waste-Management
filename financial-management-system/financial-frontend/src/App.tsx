import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.tsx';
import Expenses from './pages/Expenses.tsx';
import Incomes from './pages/Incomes.tsx';
import Reports from './pages/Reports.tsx';
// Removed authentication pages
import Layout from './components/Layout.tsx';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Auth routes removed */}
				<Route element={<Layout />}>
					<Route index element={<Navigate to="/dashboard" replace />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/expenses" element={<Expenses />} />
					<Route path="/incomes" element={<Incomes />} />
					<Route path="/reports" element={<Reports />} />
				</Route>
				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
