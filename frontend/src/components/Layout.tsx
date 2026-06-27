import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Layout() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-brand-700">
            <span className="text-2xl">📸</span> Photocation
          </Link>

          <nav className="flex items-center gap-2 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              الباقات
            </NavLink>
            {user && (
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                حجوزاتي
              </NavLink>
            )}
            {user ? (
              <div className="flex items-center gap-2 ps-2">
                <span className="hidden text-slate-600 sm:inline">{user.name || user.email}</span>
                <button onClick={signOut} className="btn-ghost px-3 py-2 text-sm">
                  خروج
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary px-4 py-2 text-sm">
                تسجيل الدخول
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Photocation — جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
