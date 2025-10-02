import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../lib/api';
import { validateName, validateEmail, validatePassword, validateForm } from '../lib/validation';

export default function Register() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setFormErrors({});

		// Validate form data
		const validationRules = {
			name: [validateName],
			email: [validateEmail],
			password: [validatePassword],
		};

		const errors = validateForm({ name, email, password }, validationRules);
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		setLoading(true);
		try {
			await api.post('/auth/register', { name, email, password, role: 'financial_officer' });
			await api.post('/auth/login', { email, password });
			navigate('/dashboard');
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Register failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-100 p-4">
			<div className="w-full max-w-sm rounded-2xl border bg-white/90 backdrop-blur p-6 shadow-lg">
				<h2 className="text-xl font-semibold">Create Financial Officer</h2>
				<form className="mt-4 space-y-4" onSubmit={onSubmit}>
					<Input
						name="name"
						label="Name"
						type="text"
						required
						value={name}
						onChange={setName}
						validation={[validateName]}
						error={formErrors.name}
					/>
					<Input
						name="email"
						label="Email"
						type="email"
						required
						value={email}
						onChange={setEmail}
						validation={[validateEmail]}
						error={formErrors.email}
					/>
					<Input
						name="password"
						label="Password"
						type="password"
						required
						value={password}
						onChange={setPassword}
						validation={[validatePassword]}
						error={formErrors.password}
					/>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<Button className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</Button>
				</form>
			</div>
		</div>
	);
}
