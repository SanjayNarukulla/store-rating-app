import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    
  }, [user]);

  if (!user || !user.role) {
    console.warn(`🚫 No valid user found. Redirecting to login...`);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles?.includes(user.role)) {
    console.warn(
      `🚫 Access Denied for ${user.role}. Redirecting to Unauthorized Page...`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
