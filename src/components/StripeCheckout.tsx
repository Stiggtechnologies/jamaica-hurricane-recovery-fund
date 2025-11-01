import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeCheckoutProps {
  amount: number;
  currency: string;
  donationType: 'one-time' | 'recurring';
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function StripeCheckout({
  amount,
  currency,
  donationType,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!amount || amount <= 0) {
      onError?.('Please enter a valid amount');
      return;
    }

    setIsProcessing(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            donationType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      const result = await stripe.redirectToCheckout({
        sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Checkout error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isProcessing || !amount || amount <= 0}
      className="w-full bg-jamaican-green text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isProcessing ? (
        <>
          <Loader className="animate-spin mr-2" size={20} />
          Processing...
        </>
      ) : (
        'Complete Donation with Stripe'
      )}
    </button>
  );
}
