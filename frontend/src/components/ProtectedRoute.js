import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("ProtectedRoute - User:", user);
  }, [user]);

  if (!user || !allowedRoles.includes(user.role)) {
    console.warn("Access Denied. Redirecting to Login...");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
