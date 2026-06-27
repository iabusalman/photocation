import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from './AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;
const APPLE_REDIRECT_URI = import.meta.env.VITE_APPLE_REDIRECT_URI;

interface Props {
  redirectTo?: string;
}

/**
 * Renders "Continue with Google" and "Continue with Apple" buttons backed by
 * Google Identity Services and Sign in with Apple JS. Both produce an identity
 * token that is exchanged with the backend for a Photocation session.
 */
export default function SocialLogin({ redirectTo = '/' }: Props) {
  const { signInWithToken } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // ── Google ──────────────────────────────────────────────
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError(null);
        setBusy(true);
        try {
          const { token, user } = await api.loginGoogle(response.credential);
          signInWithToken(token, user);
          navigate(redirectTo);
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      },
    });

    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
        locale: 'ar',
      });
    }
  }, [navigate, redirectTo, signInWithToken]);

  // ── Apple ───────────────────────────────────────────────
  useEffect(() => {
    if (!APPLE_CLIENT_ID || !window.AppleID?.auth) return;
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: 'name email',
      redirectURI: APPLE_REDIRECT_URI,
      usePopup: true,
    });
  }, []);

  async function handleApple() {
    if (!window.AppleID?.auth) {
      setError('Apple Sign-In غير متاح حالياً');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const data = await window.AppleID.auth.signIn();
      const identityToken: string = data.authorization.id_token;
      const fullName = data.user?.name
        ? { givenName: data.user.name.firstName, familyName: data.user.name.lastName }
        : undefined;
      const { token, user } = await api.loginApple(identityToken, fullName);
      signInWithToken(token, user);
      navigate(redirectTo);
    } catch (e: any) {
      // Apple throws when the user cancels the popup — ignore that case.
      if (e?.error !== 'popup_closed_by_user') {
        setError((e as Error)?.message || 'تعذّر تسجيل الدخول عبر Apple');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-3">
      {!GOOGLE_CLIENT_ID && (
        <p className="text-xs text-amber-600">
          ⚠️ لم يتم ضبط VITE_GOOGLE_CLIENT_ID — زر Google لن يظهر.
        </p>
      )}
      <div ref={googleBtnRef} className="flex justify-center" />

      <button onClick={handleApple} disabled={busy} className="btn bg-black text-white hover:bg-slate-800">
        <AppleIcon />
        المتابعة عبر Apple
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 1.43c0 1.14-.42 2.22-1.18 3.05-.84.93-2.2 1.65-3.32 1.56-.13-1.12.43-2.3 1.13-3.05.8-.86 2.21-1.49 3.37-1.56zM20.9 17.3c-.5 1.14-.74 1.65-1.39 2.66-.9 1.41-2.18 3.18-3.76 3.19-1.4.01-1.76-.92-3.66-.91-1.9.01-2.29.93-3.69.92-1.58-.01-2.79-1.6-3.7-3.01C2.3 16.3 2 11.8 4.06 9.42c.96-1.13 2.36-1.85 3.66-1.85 1.34 0 2.18.92 3.66.92 1.44 0 2.32-.93 3.86-.93 1.16 0 2.39.63 3.27 1.72-2.87 1.57-2.4 5.66-.31 7.02z" />
    </svg>
  );
}
