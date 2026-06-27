import { useEffect, useRef } from 'react';
import type { PaymentInit } from '../api/client';

const PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;

interface Props {
  init: PaymentInit;
}

/**
 * Mounts the hosted Moyasar payment form. The form creates the payment with
 * Moyasar directly (using the publishable key) and then redirects the browser
 * to the callback URL, where the backend verifies the result server-side.
 */
export default function MoyasarForm({ init }: Props) {
  const mounted = useRef(false);

  useEffect(() => {
    // Guard against double-init under React StrictMode.
    if (mounted.current) return;
    if (!window.Moyasar) return;
    const key = init.publishableKey || PUBLISHABLE_KEY;
    if (!key) return;

    mounted.current = true;
    window.Moyasar.init({
      element: '.moyasar-form',
      amount: init.amount,
      currency: init.currency,
      description: init.description,
      publishable_api_key: key,
      callback_url: init.callbackUrl,
      methods: ['creditcard', 'applepay', 'stcpay'],
      metadata: init.metadata,
    });
  }, [init]);

  const key = init.publishableKey || PUBLISHABLE_KEY;

  if (!key) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
        ⚠️ لم يتم ضبط مفتاح Moyasar العام (VITE_MOYASAR_PUBLISHABLE_KEY).
        أضِف المفتاح لعرض نموذج الدفع.
      </div>
    );
  }

  return <div className="moyasar-form" />;
}
