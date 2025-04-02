import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    return storedAuth
      ? { role: storedAuth.role, token: storedAuth.token }
      : null;
  });

  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem("auth"));
    if (storedAuth && storedAuth.token && storedAuth.role) {
      setUser({ role: storedAuth.role, token: storedAuth.token });
    } else {
      setUser(null);
    }
  }, []);

  const login = (role, token) => {
    const authData = { role, token };
    localStorage.setItem("auth", JSON.stringify(authData));
    setUser(authData);

    // ✅ Full page refresh ensures role-based redirection
    window.location.href =
      role === "Admin"
        ? "/admin-dashboard"
        : role === "User"
        ? "/user-dashboard"
        : role === "Owner"
        ? "/store-owner-dashboard"
        : "/";
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
    window.location.href = "/login"; // ✅ Ensures clean logout
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
