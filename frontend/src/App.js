import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AddStore from "./components/AddStore";
import AddUser from "./components/AddUser";

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </Router>
  );
}

function MainContent() {
  const location = useLocation();

  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Redirect root ("/") to "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/add-store" element={<AddStore />} />
          <Route path="/add-user" element={<AddUser />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["User"]} />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["Owner"]} />}>
          <Route
            path="/store-owner-dashboard"
            element={<StoreOwnerDashboard />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
