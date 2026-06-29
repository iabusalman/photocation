import { lazy, Suspense } from "react";
import { Route, Switch, useLocation } from "wouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";

// Code-split the non-home pages so the first load (mobile) stays light.
const Pricing = lazy(() => import("./pages/Pricing"));
const Analyze = lazy(() => import("./pages/Analyze"));
const Checkout = lazy(() => import("./pages/Checkout"));
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const bareRoutes = ["/login", "/register", "/payment/callback"];

function PageFallback() {
  return <div className="py-40 text-center text-slate-400">جارٍ التحميل…</div>;
}

export default function App() {
  const [loc] = useLocation();
  const bare = bareRoutes.includes(loc);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {!bare && <Navbar />}
      <main className="relative z-10">
        <Suspense fallback={<PageFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/analyze" component={Analyze} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/admin" component={Admin} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/payment/callback" component={PaymentCallback} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      {!bare && <Footer />}
    </div>
  );
}
