import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
 const [user, setUser] = useState(() => {
   try {
     const storedAuth = localStorage.getItem("auth");
     console.log("📂 Retrieved from Local Storage:", storedAuth);
     const parsedAuth = storedAuth ? JSON.parse(storedAuth) : null;
     return parsedAuth?.token && parsedAuth?.role ? parsedAuth : null;
   } catch (error) {
     console.error("❌ Error parsing auth data:", error);
     return null;
   }
 });

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const login = async (role, token) => {
    try {
      const authData = { role, token };
      localStorage.setItem("auth", JSON.stringify(authData));
      setUser(authData);
      console.log("✅ Auth Data Stored:", localStorage.getItem("auth"));
      // Wait for the state update before navigating
      await new Promise((resolve) => setTimeout(resolve, 100));

      navigate(
        role === "Admin"
          ? "/admin-dashboard"
          : role === "User"
          ? "/user-dashboard"
          : role === "Owner"
          ? "/store-owner-dashboard"
          : "/"
      );
    } catch (error) {
      console.error("❌ Login error:", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("auth");
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
