import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "User",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, formData);
      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center", mt: 5 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Register
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            type="text"
            name="name"
            label="Name"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            type="email"
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <TextField
            type="text"
            name="address"
            label="Address"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Register
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#1976D2", fontWeight: "bold" }}>
            Login here
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default Register;
