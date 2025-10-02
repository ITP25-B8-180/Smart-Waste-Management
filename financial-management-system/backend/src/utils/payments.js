import Stripe from 'stripe';
import Razorpay from 'razorpay';

export function getStripe() {
	const key = process.env.STRIPE_SECRET_KEY;
	return key ? new Stripe(key, { apiVersion: '2024-06-20' }) : null;
}

export function getRazorpay() {
	const keyId = process.env.RAZORPAY_KEY_ID;
	const keySecret = process.env.RAZORPAY_KEY_SECRET;
	return keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;
}
