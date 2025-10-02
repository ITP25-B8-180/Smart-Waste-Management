import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../lib/api';
import { useState } from 'react';
import { validateEmail, validatePassword, validateForm } from '../lib/validation';

export default function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setFormErrors({});

		// Validate form data
		const validationRules = {
			email: [validateEmail],
			password: [validatePassword],
		};

		const errors = validateForm({ email, password }, validationRules);
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		setLoading(true);
		try {
			await api.post('/auth/login', { email, password });
			navigate('/dashboard');
		} catch (err: any) {
			setError(err?.response?.data?.message || 'Login failed');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-sky-100 p-4">
			<div className="w-full max-w-sm rounded-2xl border bg-white/90 backdrop-blur p-6 shadow-lg">
				<h2 className="text-xl font-semibold">Financial Officer Login</h2>
				<form className="mt-4 space-y-4" onSubmit={onSubmit}>
					<Input
						name="email"
						label="Email"
						type="email"
						placeholder="you@example.com"
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
						placeholder="••••••••"
						required
						value={password}
						onChange={setPassword}
						validation={[validatePassword]}
						error={formErrors.password}
					/>
					{error ? <p className="text-sm text-red-600">{error}</p> : null}
					<Button className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</Button>
				</form>
			</div>
		</div>
	);
}
