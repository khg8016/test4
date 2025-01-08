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

  try {
    const token = event.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      throw new Error('인증 토큰이 없습니다');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('유효하지 않은 사용자입니다');
    }

    const { credits } = JSON.parse(event.body || '{}');
    if (!credits || credits <= 0) {
      throw new Error('유효하지 않은 크레딧 금액입니다');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: '크레딧',
            description: `${credits} 크레딧`
          },
          unit_amount: Math.ceil(credits / 100) * 100 // $1 per 100 credits
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${event.headers.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${event.headers.origin}/credits`,
      client_reference_id: user.id,
      metadata: {
        credits: credits.toString()
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error: any) {
    console.error('Checkout error:', error);
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: error.message || '결제 세션을 생성할 수 없습니다' 
      })
    };
  }
};