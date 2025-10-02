import nodemailer from 'nodemailer';

export function createTransport() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	return nodemailer.createTransport({ host, port, auth: user && pass ? { user, pass } : undefined });
}

export async function sendMail({ to, subject, text, html }) {
	const transporter = createTransport();
	return transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@smartwaste.local', to, subject, text, html });
}
