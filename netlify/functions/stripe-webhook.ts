import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY!, {
  apiVersion: '2020-08-27'
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const stripeSignature = event.headers['stripe-signature'];

  try {
    if (!stripeSignature) {
      throw new Error('Missing Stripe signature');
    }

    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      stripeSignature,
      process.env.VITE_STRIPE_WEBHOOK_SECRET!
    );

    console.log('Received webhook event:', stripeEvent.type);

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      console.log('Session data:', session);
      
      if (session.payment_status === 'paid') {
        const userId = session.client_reference_id;
        if (!userId) {
          throw new Error('Invalid session data: missing user ID');
        }

        // Get credits from metadata
        const credits = parseInt(session.metadata?.credits || '0', 10);
        if (!credits) {
          throw new Error('Invalid credits amount');
        }

        console.log(`Processing credits: ${credits} for user ${userId}`);

        // Add credits to user's balance
        const { error: creditsError } = await supabase.rpc('add_credits', {
          user_id: userId,
          amount: credits,
          description: '크레딧 구매'
        });

        if (creditsError) {
          console.error('Failed to add credits:', creditsError);
          throw creditsError;
        }

        console.log(`Successfully added ${credits} credits to user ${userId}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error: any) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: error.message || 'Webhook processing failed' 
      })
    };
  }
};