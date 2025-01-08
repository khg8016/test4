import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const stripe = {
  async redirectToCheckout(credits: number) {
    try {
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-token')}`,
        },
        body: JSON.stringify({ credits }),
      });

      const { sessionId, error } = await response.json();
      
      if (error) throw new Error(error);
      if (!sessionId) throw new Error('Failed to create checkout session');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Failed to load Stripe');

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (redirectError) throw redirectError;
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  }
};