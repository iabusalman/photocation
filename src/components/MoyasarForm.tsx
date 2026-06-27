import { useEffect, useRef } from "react";
import type { SubscribeInit } from "../lib/api";

const PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;

/**
 * Mounts the hosted Moyasar payment form. The form creates the payment with
 * Moyasar directly (publishable key) and then redirects to the callback URL,
 * where the backend verifies the result server-side.
 */
export default function MoyasarForm({ init }: { init: SubscribeInit }) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current || !window.Moyasar) return;
    const key = init.publishableKey || PUBLISHABLE_KEY;
    if (!key) return;
    mounted.current = true;
    window.Moyasar.init({
      element: ".moyasar-form",
      amount: init.amount,
      currency: init.currency,
      description: init.description,
      publishable_api_key: key,
      callback_url: init.callbackUrl,
      methods: ["creditcard", "applepay", "stcpay"],
      metadata: init.metadata,
    });
  }, [init]);

  const key = init.publishableKey || PUBLISHABLE_KEY;
  if (!key) {
    return (
      <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
        ⚠️ لم يتم ضبط مفتاح Moyasar العام (VITE_MOYASAR_PUBLISHABLE_KEY).
      </div>
    );
  }
  return <div className="moyasar-form" />;
}
