import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

// Load the PayPal JS SDK once (USD — PayPal does not support SAR).
let sdkPromise: Promise<void> | null = null;
function loadPayPalSdk(): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      CLIENT_ID,
    )}&currency=USD`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("تعذّر تحميل PayPal"));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

interface Props {
  subscriptionId: string;
  onSuccess: () => void;
}

export default function PayPalButtons({ subscriptionId, onSuccess }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;
    loadPayPalSdk()
      .then(() => {
        if (cancelled || rendered.current || !ref.current || !window.paypal) return;
        rendered.current = true;
        window.paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal" },
            createOrder: () =>
              api.paypalCreateOrder(subscriptionId).then((r) => r.orderId),
            onApprove: (data: { orderID: string }) =>
              api
                .paypalCapture(data.orderID, subscriptionId)
                .then(() => onSuccess())
                .catch((e) => setError((e as Error).message)),
            onError: () => setError("تعذّر إتمام الدفع عبر PayPal"),
          })
          .render(ref.current);
      })
      .catch((e) => setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [subscriptionId, onSuccess]);

  if (!CLIENT_ID) {
    return (
      <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
        ⚠️ PayPal غير مُفعّل (VITE_PAYPAL_CLIENT_ID).
      </div>
    );
  }
  return (
    <div>
      <div ref={ref} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
