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

  if (!user || !allowedRoles.includes(user?.role)) {
    console.warn(
      `🚫 Access Denied for ${user?.role || "Guest"}. Redirecting...`
    );
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
