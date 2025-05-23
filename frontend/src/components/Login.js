import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false); // ✅ Added loading state
  const [error, setError] = useState(""); // ✅ Display error messages
  const { login } = useContext(AuthContext); // ✅ Using AuthContext
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.data.token || !res.data.user) {
        throw new Error("Invalid response from server");
      }

      login(res.data.user.role, res.data.token);

      // ✅ Redirect based on role (handled in AuthContext)
      const roleRedirects = {
        Admin: "/admin-dashboard",
        User: "/user-dashboard",
        Owner: "/store-owner-dashboard",
      };
      navigate(roleRedirects[res.data.user.role] || "/");
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      setError(
        error.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center", mt: 5 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Login
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            type="email"
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.email}
            required
            helperText={
              formData.email &&
              !validateEmail(formData.email) &&
              "Invalid email format"
            }
            error={formData.email && !validateEmail(formData.email)}
            sx={{ mb: 2 }}
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.password}
            required
            sx={{ mb: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#1976D2", fontWeight: "bold" }}>
            Register here
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Login;
