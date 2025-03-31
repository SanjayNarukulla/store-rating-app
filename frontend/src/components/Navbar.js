import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976D2" }}>
      <Toolbar>
        {/* App Name */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Store Rating App
        </Typography>

        {/* Conditional Navigation Links */}
        {role === "Admin" && (
          <Button color="inherit" onClick={() => navigate("/admin-dashboard")}>
            Admin Dashboard
          </Button>
        )}
        {role === "User" && (
          <Button color="inherit" onClick={() => navigate("/user-dashboard")}>
            User Dashboard
          </Button>
        )}
        {role === "Owner" && (
          <Button
            color="inherit"
            onClick={() => navigate("/store-owner-dashboard")}
          >
            Store Owner Dashboard
          </Button>
        )}

        {/* Logout Button */}
        <Button
          color="inherit"
          onClick={handleLogout}
          sx={{ marginLeft: "10px" }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
