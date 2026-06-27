import { Route, Switch, useLocation } from "wouter";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Pricing from "./pages/Pricing";
import Analyze from "./pages/Analyze";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const bareRoutes = ["/login", "/register"];

export default function App() {
  const [loc] = useLocation();
  const bare = bareRoutes.includes(loc);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      {!bare && <Navbar />}
      <main className="relative z-10">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/analyze" component={Analyze} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {!bare && <Footer />}
    </div>
  );
}
