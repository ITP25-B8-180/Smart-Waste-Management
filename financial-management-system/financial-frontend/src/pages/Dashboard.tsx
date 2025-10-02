import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import PieChart from '../components/ui/PieChart';
import BarChart from '../components/ui/BarChart';
import Select from '../components/ui/Select';
import api from '../lib/api';
// reports export removed from dashboard; use Reports page instead

// Expense categories with colors
const EXPENSE_CATEGORIES = [
    'Fuel',
    'Maintenance', 
    'Insurance',
    'Driver Wages',
    'Admin Salaries',
    'Event Staff',
    'Bins / Permits',
    'Disposal Fees',
];

const CATEGORY_COLORS = [
    '#ef4444', // Fuel - Red
    '#f97316', // Maintenance - Orange  
    '#eab308', // Insurance - Yellow
    '#22c55e', // Driver Wages - Green
    '#06b6d4', // Admin Salaries - Cyan
    '#8b5cf6', // Event Staff - Purple
    '#ec4899', // Bins / Permits - Pink
    '#6b7280', // Disposal Fees - Gray
];

function Metric({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
	return (
		<Card className="p-6">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-gray-500">{label}</p>
					<p className="mt-2 text-3xl font-bold">{value}</p>
				</div>
				<div className={`text-4xl md:text-5xl leading-none ${accent}`}>{icon}</div>
			</div>
			<div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
				<div className={`h-full w-1/3 rounded-full ${accent.includes('emerald') ? 'bg-emerald-400' : accent.includes('sky') ? 'bg-sky-400' : 'bg-amber-400'}`}></div>
			</div>
		</Card>
	);
}

type Expense = { _id: string; date: string; category: string; description: string; amount: number; documentPath?: string };
type Income = { _id: string; date: string; category: string; description: string; amount: number; documentPath?: string };
type ReportData = {
    monthly: { expenses: number; incomes: number };
    yearly: { expenses: number; incomes: number };
};

export default function Dashboard() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [budget, setBudget] = useState<number>(0);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    // report actions removed; use Reports page instead
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        void load();
    }, []);

    async function load() {
        setError(null);
        try {
            const [expRes, incRes, budRes, reportRes] = await Promise.all([
                api.get('/expenses'),
                api.get('/incomes'),
                api.get('/budget'),
                api.get('/reports/summary'),
            ]);
            setExpenses(expRes.data);
            setIncomes(incRes.data);
            setBudget(Number(budRes.data?.amount || 0));
            setReportData(reportRes.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load data');
        }
    }

    const totals = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        let expMonthly = 0, expYearly = 0, incMonthly = 0, incYearly = 0;
        for (const it of expenses) {
            const d = new Date(it.date);
            if (d.getFullYear() === year) {
                expYearly += it.amount;
                if (d.getMonth() === month) expMonthly += it.amount;
            }
        }
        for (const it of incomes) {
            const d = new Date(it.date);
            if (d.getFullYear() === year) {
                incYearly += it.amount;
                if (d.getMonth() === month) incMonthly += it.amount;
            }
        }
        return { expMonthly, expYearly, incMonthly, incYearly };
    }, [expenses, incomes]);

    // Expense category breakdown
    const expenseCategories = useMemo(() => {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        let monthlyExpenses = expenses.filter(exp => {
            const d = new Date(exp.date);
            return d.getFullYear() === year && d.getMonth() === month;
        });
        
        // Apply category filter if not 'all'
        if (selectedCategory !== 'all') {
            monthlyExpenses = monthlyExpenses.filter(exp => exp.category === selectedCategory);
        }
        
        const categoryTotals = EXPENSE_CATEGORIES.map((category, index) => {
            const total = monthlyExpenses
                .filter(exp => exp.category === category)
                .reduce((sum, exp) => sum + exp.amount, 0);
            
            return {
                label: category,
                value: total,
                color: CATEGORY_COLORS[index],
            };
        }).filter(cat => cat.value > 0); // Only show categories with expenses
        
        return categoryTotals;
    }, [expenses, selectedCategory]);

    // Top expense categories
    const topExpenseCategories = useMemo(() => {
        return [...expenseCategories]
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); // Top 5 categories
    }, [expenseCategories]);

    // Export and generate functions removed; use Reports page

    // Overall totals (all-time)
    const overall = useMemo(() => {
        const income = incomes.reduce((s, x) => s + Number(x.amount || 0), 0);
        const expense = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
        const max = Math.max(1, income, expense);
        return { income, expense, max };
    }, [expenses, incomes]);

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Dashboard" 
                description="Overview of incomes and expenses with category breakdowns." 
                actions={
                    <div className="flex items-center gap-3">
                        <Select
                            name="categoryFilter"
                            label="Filter by Category"
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            options={[
                                { value: 'all', label: 'All Categories' },
                                ...EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))
                            ]}
                            className="w-48"
                        />
                    </div>
                }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Metric icon="💵" label="Monthly Income" value={`LKR ${totals.incMonthly.toFixed(2)}`} accent="text-emerald-600" />
                <Metric icon="💸" label="Monthly Expenses" value={`LKR ${totals.expMonthly.toFixed(2)}`} accent="text-sky-600" />
                <Metric icon="🎯" label="Budget (Monthly)" value={`LKR ${budget.toFixed(2)}`} accent="text-amber-600" />
            </div>

            {/* Report Generation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Report Card */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            📊 Monthly Report
                            <span className="text-sm text-gray-500">({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {reportData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Income</p>
                                        <p className="font-semibold text-emerald-600">LKR {reportData.monthly.incomes.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Expenses</p>
                                        <p className="font-semibold text-sky-600">LKR {reportData.monthly.expenses.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-gray-500 text-sm">Net</p>
                                    <p className={`font-semibold ${reportData.monthly.incomes - reportData.monthly.expenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        LKR {(reportData.monthly.incomes - reportData.monthly.expenses).toFixed(2)}
                                    </p>
                                </div>
                                {/* Report actions removed; use Reports page */}
                            </div>
                        ) : (
                            <p className="text-gray-500">Loading report data...</p>
                        )}
                    </CardBody>
                </Card>

                {/* Yearly Report Card */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            📈 Yearly Report
                            <span className="text-sm text-gray-500">({new Date().getFullYear()})</span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {reportData ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Income</p>
                                        <p className="font-semibold text-emerald-600">LKR {reportData.yearly.incomes.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Expenses</p>
                                        <p className="font-semibold text-sky-600">LKR {reportData.yearly.expenses.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-gray-500 text-sm">Net</p>
                                    <p className={`font-semibold ${reportData.yearly.incomes - reportData.yearly.expenses >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        LKR {(reportData.yearly.incomes - reportData.yearly.expenses).toFixed(2)}
                                    </p>
                                </div>
                                {/* Report actions removed; use Reports page */}
                            </div>
                        ) : (
                            <p className="text-gray-500">Loading report data...</p>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Expense Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart - Monthly Expense Categories */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            🥧 Monthly Expense Breakdown
                            <span className="text-sm text-gray-500">
                                ({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                {selectedCategory !== 'all' && ` • ${selectedCategory}`})
                            </span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {expenseCategories.length > 0 ? (
                            <PieChart data={expenseCategories} size={250} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p>No expenses this month</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Bar Chart - Top Expense Categories */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            📊 Top Expense Categories
                            <span className="text-sm text-gray-500">
                                This Month
                                {selectedCategory !== 'all' && ` • ${selectedCategory}`}
                            </span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {topExpenseCategories.length > 0 ? (
                            <BarChart data={topExpenseCategories} maxHeight={200} />
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📈</div>
                                    <p>No expense data available</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Category Summary Cards */}
            {expenseCategories.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            💰 Expense Categories Summary
                            <span className="text-sm text-gray-500">
                                Monthly Totals
                                {selectedCategory !== 'all' && ` • ${selectedCategory}`}
                            </span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {expenseCategories.map((category, index) => (
                                <div key={index} className="p-4 rounded-lg border">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-4 h-4 rounded-full" 
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-700">{category.label}</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                LKR {category.value.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Card>
                <CardHeader>
                    <h3 className="font-medium">Overall • Income vs Expense</h3>
                </CardHeader>
                <CardBody>
                    {(() => {
                        const total = Math.max(0, overall.income + overall.expense);
                        const incomePct = total === 0 ? 0.5 : overall.income / total;
                        const expensePct = 1 - incomePct;
                        const gradient = `conic-gradient(#10b981 0 ${incomePct * 360}deg, #0ea5e9 ${incomePct * 360}deg 360deg)`;
                        return (
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                <div className="relative" style={{ width: 220, height: 220 }}>
                                    <div className="rounded-full" style={{ width: '100%', height: '100%', backgroundImage: gradient }} />
                                    <div className="absolute inset-6 rounded-full bg-white/95 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500">Net</div>
                                            <div className={`text-lg font-semibold ${overall.income - overall.expense >= 0 ? 'text-emerald-700' : 'text-sky-700'}`}>LKR {(overall.income - overall.expense).toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded bg-emerald-500"></span> Income: LKR {overall.income.toFixed(2)} ({(incomePct * 100).toFixed(1)}%)</div>
                                    <div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded bg-sky-500"></span> Expenses: LKR {overall.expense.toFixed(2)} ({(expensePct * 100).toFixed(1)}%)</div>
                                </div>
                            </div>
                        );
                    })()}
                </CardBody>
            </Card>
        </div>
    );
}
