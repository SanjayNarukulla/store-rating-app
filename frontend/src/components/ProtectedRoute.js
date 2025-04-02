import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    console.log(
      `🔒 ProtectedRoute: Checking access for ${user?.role || "Guest"}`
    );
  }, [user]);

  if (!user) {
    console.warn(`🚫 No user found. Redirecting to login...`);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    console.warn(`🚫 Access Denied for ${user.role}. Redirecting...`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
