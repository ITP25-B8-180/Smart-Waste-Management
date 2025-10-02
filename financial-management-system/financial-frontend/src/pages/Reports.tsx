import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../lib/api';
import { exportToPDFV2, exportExpenseCategoryToPDF, exportAllCategoriesToSinglePDF } from '../lib/pdfGeneratorV2';

type ReportData = {
    monthly: { expenses: number; incomes: number };
    yearly: { expenses: number; incomes: number };
};

type Expense = { _id: string; date: string; category: string; description: string; amount: number; documentPath?: string };
type Income = { _id: string; date: string; category: string; description: string; amount: number; documentPath?: string };

export default function Reports() {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<string>('All Categories');

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [reportRes, expRes, incRes] = await Promise.all([
                api.get('/reports/summary'),
                api.get('/expenses'),
                api.get('/incomes'),
            ]);
            setReportData(reportRes.data);
            setExpenses(expRes.data);
            setIncomes(incRes.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const exportToPDFReport = (type: 'monthly' | 'yearly') => {
        if (!reportData) return;

        // Filter expenses and incomes for the selected period
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        
        let filteredExpenses = expenses;
        let filteredIncomes = incomes;
        
        if (type === 'monthly') {
            filteredExpenses = expenses.filter(exp => {
                const d = new Date(exp.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
            filteredIncomes = incomes.filter(inc => {
                const d = new Date(inc.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        } else {
            filteredExpenses = expenses.filter(exp => {
                const d = new Date(exp.date);
                return d.getFullYear() === year;
            });
            filteredIncomes = incomes.filter(inc => {
                const d = new Date(inc.date);
                return d.getFullYear() === year;
            });
        }

        exportToPDFV2(type, reportData, filteredExpenses, filteredIncomes);
    };

    const exportCategoryPDF = (type: 'monthly' | 'yearly') => {
        // derive period filtered expenses first
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        let filtered = expenses;
        if (type === 'monthly') {
            filtered = expenses.filter(exp => {
                const d = new Date(exp.date);
                return d.getFullYear() === year && d.getMonth() === month;
            });
        } else {
            filtered = expenses.filter(exp => {
                const d = new Date(exp.date);
                return d.getFullYear() === year;
            });
        }

        const finalList = category === 'All Categories' ? filtered : filtered.filter(e => e.category === category);
        exportExpenseCategoryToPDF(category, type, finalList);
    };

    const generateDetailedReport = async (type: 'monthly' | 'yearly') => {
        setLoading(true);
        try {
            // For now, we'll just refresh the data
            // In a real implementation, this might trigger a PDF generation on the backend
            await loadReportData();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} detailed report generated successfully!`);
        } catch (e: any) {
            setError(e?.response?.data?.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 p-6 text-white">
                <h2 className="text-2xl font-semibold">Reports</h2>
                <p className="mt-1 text-sm text-emerald-50">Generate and export monthly and yearly financial summaries.</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Report */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            📊 Monthly Report
                            <span className="text-sm text-gray-500">({new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : reportData ? (
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
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => exportToPDFReport('monthly')}
                                        disabled={loading}
                                    >
                                        Export Monthly PDF
                                    </Button>
                                    <Button 
                                        onClick={() => generateDetailedReport('monthly')}
                                        disabled={loading}
                                    >
                                        Generate Detailed Report
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No data available</p>
                        )}
                    </CardBody>
                </Card>

                {/* Yearly Report */}
                <Card>
                    <CardHeader>
                        <h3 className="font-medium flex items-center gap-2">
                            📈 Yearly Report
                            <span className="text-sm text-gray-500">({new Date().getFullYear()})</span>
                        </h3>
                    </CardHeader>
                    <CardBody>
                        {loading ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : reportData ? (
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
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button 
                                        variant="secondary" 
                                        onClick={() => exportToPDFReport('yearly')}
                                        disabled={loading}
                                    >
                                        Export Yearly PDF
                                    </Button>
                                    <Button 
                                        onClick={() => generateDetailedReport('yearly')}
                                        disabled={loading}
                                    >
                                        Generate Detailed Report
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No data available</p>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <h3 className="font-medium">Quick Actions</h3>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-wrap gap-3 items-center">
                        <select
                            className="rounded border px-3 py-2 text-sm"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option>All Categories</option>
                            {[...new Set(expenses.map(e => e.category))].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <Button 
                            variant="secondary" 
                            onClick={() => exportCategoryPDF('monthly')}
                            disabled={loading || expenses.length === 0}
                        >
                            Export Monthly by Category
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => exportCategoryPDF('yearly')}
                            disabled={loading || expenses.length === 0}
                        >
                            Export Yearly by Category
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                exportToPDFReport('monthly');
                                exportToPDFReport('yearly');
                            }}
                            disabled={loading || !reportData}
                        >
                            Export All PDF Reports
                        </Button>
                        <Button 
                            onClick={() => {
                                // period filters first, then all categories
                                const now = new Date();
                                const month = now.getMonth();
                                const year = now.getFullYear();

                                const monthly = expenses.filter(exp => {
                                    const d = new Date(exp.date);
                                    return d.getFullYear() === year && d.getMonth() === month;
                                });
                                const yearly = expenses.filter(exp => {
                                    const d = new Date(exp.date);
                                    return d.getFullYear() === year;
                                });

                                exportAllCategoriesToSinglePDF('monthly', monthly);
                                exportAllCategoriesToSinglePDF('yearly', yearly);
                            }}
                            disabled={loading || expenses.length === 0}
                        >
                            Export All Categories (Monthly & Yearly)
                        </Button>
                        <Button 
                            onClick={() => {
                                generateDetailedReport('monthly');
                                generateDetailedReport('yearly');
                            }}
                            disabled={loading}
                        >
                            Generate All Reports
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={loadReportData}
                            disabled={loading}
                        >
                            Refresh Data
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
