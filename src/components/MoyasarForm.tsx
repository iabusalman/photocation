import { useEffect, useRef } from "react";
import type { SubscribeInit } from "../lib/api";
import { loadScript, loadStyle } from "../lib/loadScript";

const PUBLISHABLE_KEY = import.meta.env.VITE_MOYASAR_PUBLISHABLE_KEY;
const MOYASAR_CSS = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.css";
const MOYASAR_JS = "https://cdn.moyasar.com/mpf/1.15.0/moyasar.js";

/**
 * Mounts the hosted Moyasar payment form. The Moyasar SDK is loaded on demand
 * (only here, not on every page) so it never blocks initial render.
 */
export default function MoyasarForm({ init }: { init: SubscribeInit }) {
  const mounted = useRef(false);

  useEffect(() => {
    const key = init.publishableKey || PUBLISHABLE_KEY;
    if (mounted.current || !key) return;
    mounted.current = true;
    loadStyle(MOYASAR_CSS);
    loadScript(MOYASAR_JS)
      .then(() => {
        if (!window.Moyasar) return;
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
      })
      .catch(() => {});
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
