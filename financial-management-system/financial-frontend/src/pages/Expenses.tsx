import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../lib/api';
import { validateDate, validateAmount, validateCategory, validateDescription, validateFile, validateForm } from '../lib/validation';

// Categories derived from earlier Costs page
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

type Expense = {
	_id?: string;
	id?: string;
	date: string; // yyyy-mm-dd
	category: string;
	description: string;
	amount: number;
	documentPath?: string;
	documentName?: string; // UI only
};

export default function Expenses() {
	const [items, setItems] = useState<Expense[]>([]);
	const [editing, setEditing] = useState<Expense | null>(null);
	const [budget, setBudget] = useState<number>(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [formData, setFormData] = useState({
		date: '',
		category: '',
		description: '',
		amount: '',
		document: null as File | null,
	});

	useEffect(() => {
		void (async () => {
			try {
				const b = await api.get('/budget');
				setBudget(Number(b.data?.amount || 0));
			} catch {}
			await fetchAll();
		})();
	}, []);

	useEffect(() => {
		const id = setTimeout(async () => {
			try { await api.post('/budget', { amount: budget || 0 }); } catch {}
		}, 500);
		return () => clearTimeout(id);
	}, [budget]);

	async function fetchAll() {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get('/expenses');
			setItems(res.data);
		} catch (e: any) {
			setError(e?.response?.data?.message || 'Failed to load expenses');
		} finally {
			setLoading(false);
		}
	}

	const totals = useMemo(() => {
		const now = new Date();
		const month = now.getMonth();
		const year = now.getFullYear();
		let monthly = 0;
		let yearly = 0;
		for (const it of items) {
			const d = new Date(it.date);
			if (d.getFullYear() === year) {
				yearly += it.amount;
				if (d.getMonth() === month) monthly += it.amount;
			}
		}
		return { monthly, yearly };
	}, [items]);

	const remaining = Math.max(0, (budget || 0) - totals.monthly);

	const filteredItems = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter(it => {
			const dateStr = String(it.date).slice(0,10);
			const fields = [
				dateStr,
				it.category || '',
				it.description || '',
				String(it.amount ?? ''),
				it.documentPath ? it.documentPath.split('/').pop() || '' : ''
			].join(' ').toLowerCase();
			return fields.includes(q);
		});
	}, [items, query]);

	function resetForm() {
		setEditing(null);
		setFormData({
			date: '',
			category: '',
			description: '',
			amount: '',
			document: null,
		});
		setFormErrors({});
	}

	async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setSuccess(null);
		setFormErrors({});

		// Validate form data
		const validationRules = {
			date: [validateDate],
			category: [(value: string) => validateCategory(value, EXPENSE_CATEGORIES)],
			description: [validateDescription],
			amount: [validateAmount],
			document: [(value: File | null) => validateFile(value, { maxSize: 10, allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'], required: false })],
		};

		const errors = validateForm(formData, validationRules);
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		const formEl = e.currentTarget;
		const form = new FormData(formEl);
		try {
			const isEditing = Boolean(editing?._id);
			if (isEditing && editing?._id) {
				const res = await api.put(`/expenses/${editing._id}`, form);
				// optimistic update
				setItems(prev => prev.map(it => it._id === editing._id ? res.data : it));
			} else {
				const res = await api.post('/expenses', form);
				// optimistic insert at top
				setItems(prev => [res.data, ...prev]);
			}
			// success
			formEl.reset();
			resetForm();
			setSuccess('Expense ' + (Boolean(editing?._id) ? 'updated' : 'added') + ' successfully');
			setTimeout(() => setSuccess(null), 3000);
			// background refresh (ignore errors)
			try { await fetchAll(); } catch {}
		} catch (err: any) {
			const msg = err?.response?.data?.message || err?.message || 'Save failed';
			setError(msg);
		}
	}

	function onEdit(it: Expense) {
		setEditing({ ...it, documentName: it.documentPath ? it.documentPath.split('/').pop() : undefined });
		setFormData({
			date: it.date?.slice(0, 10) || '',
			category: it.category || '',
			description: it.description || '',
			amount: String(it.amount || ''),
			document: null,
		});
		setFormErrors({});
	}

	async function onDelete(id?: string) {
		if (!id) return;
		setError(null);
		try {
			await api.delete(`/expenses/${id}`);
			if (editing?._id === id) resetForm();
			await fetchAll();
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Delete failed');
		}
	}

	return (
		<div className="space-y-6">
			<PageHeader
				title="Expenses"
				description="Add, view, edit, and delete expense records with categories and uploads."
				actions={
					<div className="flex items-center gap-2">
						<input
							className="w-40 rounded border px-3 py-2 text-sm"
							type="number"
							placeholder="Monthly budget (LKR)"
							value={budget || ''}
							onChange={e => setBudget(parseFloat(e.target.value) || 0)}
						/>
						<Badge variant={remaining === 0 && budget > 0 ? 'danger' : 'success'}>
							{budget > 0 ? `Remaining: LKR ${remaining.toFixed(2)}` : 'No budget set'}
						</Badge>
					</div>
				}
			/>

			<Card>
				<CardHeader>
					<h3 className="font-medium">{editing ? 'Edit Expense' : 'Add Expense'}</h3>
				</CardHeader>
				<CardBody>
					{success ? (
						<div className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
							{success}
						</div>
					) : null}
					<form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
						<Input
							name="date"
							label="Date"
							type="date"
							required
							value={formData.date}
							onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
							validation={[validateDate]}
							error={formErrors.date}
						/>
						<Select
							name="category"
							label="Category"
							required
							value={formData.category}
							onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
							options={EXPENSE_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
							validation={[(value: string) => validateCategory(value, EXPENSE_CATEGORIES)]}
							error={formErrors.category}
						/>
						<Input
							name="description"
							label="Description"
							type="text"
							placeholder="e.g., Fuel refill"
							value={formData.description}
							onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
							validation={[validateDescription]}
							error={formErrors.description}
						/>
						<Input
							name="amount"
							label="Amount (LKR)"
							type="number"
							required
							step="0.01"
							min="0"
							value={formData.amount}
							onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
							validation={[validateAmount]}
							error={formErrors.amount}
						/>
						<div className="md:col-span-2">
							<label className="block text-sm text-gray-700">
								Upload Document (optional)
							</label>
							<input 
								name="document" 
								className={`mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 ${
									formErrors.document 
										? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
										: 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
								}`}
								type="file" 
								accept=".pdf,.jpg,.jpeg,.png"
								onChange={(e) => {
									const file = e.target.files?.[0] || null;
									setFormData(prev => ({ ...prev, document: file }));
									// Clear error on change
									if (formErrors.document) {
										setFormErrors(prev => ({ ...prev, document: '' }));
									}
								}}
							/>
							{formErrors.document && (
								<p className="mt-1 text-sm text-red-600">{formErrors.document}</p>
							)}
							{editing?.documentName ? <p className="mt-1 text-xs text-gray-500">Current: {editing.documentName}</p> : null}
						</div>
						<div className="md:col-span-2 flex items-center gap-2">
							<Button type="submit">{editing ? 'Save Changes' : 'Add Expense'}</Button>
							{editing ? <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button> : null}
						</div>
					</form>
				</CardBody>
			</Card>

			<Card className="overflow-hidden">
				<CardHeader className="flex items-center justify-between">
					<h3 className="font-medium">Records</h3>
					<div className="flex items-center gap-3">
						<input
							className="w-56 rounded border px-3 py-2 text-sm"
							placeholder="Search by date, category, description, amount"
							value={query}
							onChange={e => setQuery(e.target.value)}
						/>
						<div className="text-sm text-gray-600">This month: LKR {totals.monthly.toFixed(2)} • Year: LKR {totals.yearly.toFixed(2)}</div>
					</div>
				</CardHeader>
				<CardBody className="p-0">
					<div className="max-h-96 overflow-auto">
						<Table>
							<THead>
								<tr>
									<TH>Date</TH>
									<TH>Category</TH>
									<TH>Description</TH>
									<TH>Amount (LKR)</TH>
									<TH>Document</TH>
									<TH>Actions</TH>
								</tr>
							</THead>
							<TBody>
								{loading ? (
									<TR><TD className="py-6 text-center" colSpan={6}>Loading...</TD></TR>
								) : filteredItems.length === 0 ? (
									<TR>
										<TD className="py-6 text-center text-gray-500" colSpan={6}>{items.length === 0 ? 'No expenses yet.' : 'No matching results.'}</TD>
									</TR>
								) : (
									filteredItems.map(it => (
										<TR key={it._id ?? it.id} className="hover:bg-emerald-50">
											<TD>{String(it.date).slice(0,10)}</TD>
											<TD><Badge>{it.category}</Badge></TD>
											<TD>{it.description}</TD>
											<TD>LKR {Number(it.amount).toFixed(2)}</TD>
											<TD>{it.documentPath ? <a className="text-emerald-700 underline" href={it.documentPath} target="_blank">View</a> : '-'}</TD>
											<TD>
												<Button size="sm" variant="secondary" className="mr-2" onClick={() => onEdit(it)}>Edit</Button>
												<Button size="sm" variant="danger" onClick={() => onDelete(it._id as string)}>Delete</Button>
											</TD>
										</TR>
									))
								)}
							</TBody>
						</Table>
					</div>
				</CardBody>
			</Card>
			{error ? <p className="text-sm text-red-600">{error}</p> : null}
		</div>
	);
}
