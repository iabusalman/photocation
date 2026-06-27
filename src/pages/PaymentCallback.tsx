import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type Status = "verifying" | "paid" | "failed";

/**
 * Landing page after the Moyasar redirect. Reads the payment id from the query
 * string and asks the backend to verify it server-side (the source of truth).
 */
export default function PaymentCallback() {
  const { refresh } = useAuth();
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("id");
    const subscriptionId =
      params.get("metadata[subscriptionId]") ||
      sessionStorage.getItem("photocation.pendingSub");

    if (!paymentId || !subscriptionId) {
      setStatus("failed");
      setMessage("بيانات الدفع غير مكتملة.");
      return;
    }

    api
      .verifyPayment(paymentId, subscriptionId)
      .then(async (r) => {
        if (r.activated) {
          setStatus("paid");
          sessionStorage.removeItem("photocation.pendingSub");
          await refresh();
        } else {
          setStatus("failed");
          setMessage(params.get("message") || "لم يكتمل الدفع.");
        }
      })
      .catch((e) => {
        setStatus("failed");
        setMessage((e as Error).message);
      });
  }, [refresh]);

  return (
    <section className="grid min-h-screen place-items-center px-4">
      <div className="card max-w-lg p-10 text-center">
        {status === "verifying" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
            <h1 className="mt-4 text-2xl font-extrabold">جارٍ التحقق من الدفع…</h1>
          </>
        )}
        {status === "paid" && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-accent-green" />
            <h1 className="mt-4 text-2xl font-extrabold">تم تفعيل اشتراكك!</h1>
            <p className="mt-2 text-slate-500">شكراً لك. يمكنك الآن تحليل المزيد من الصور.</p>
            <Link href="/analyze" className="btn-primary mt-6">
              ابدأ التحليل
            </Link>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-4 text-2xl font-extrabold">تعذّر إتمام الدفع</h1>
            {message && <p className="mt-2 text-slate-500">{message}</p>}
            <Link href="/pricing" className="btn-ghost mt-6">
              العودة للأسعار
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
