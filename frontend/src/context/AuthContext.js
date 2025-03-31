import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    return token && role ? { role } : null;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({ role });
    } else {
      setUser(null);
    }
  }, []);

  const login = (role, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    setUser({ role });

    // ✅ Instead of useNavigate(), use window.location.href
    if (role === "Admin") window.location.href = "/admin-dashboard";
    else if (role === "User") window.location.href = "/user-dashboard";
    else if (role === "Owner") window.location.href = "/store-owner-dashboard";
    else window.location.href = "/";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    window.location.href = "/login"; // ✅ Ensures full page refresh
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
