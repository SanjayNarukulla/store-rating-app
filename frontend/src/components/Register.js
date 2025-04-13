import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Container, TextField, Button, Typography, Paper } from "@mui/material";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "User",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error on change
  };

  const validate = () => {
    const newErrors = {};

    // Name validation (min 20, max 60 chars)
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 20) {
      newErrors.name = "Name must be at least 20 characters";
    } else if (formData.name.length > 60) {
      newErrors.name = "Name must be less than 60 characters";
    }

    // Email validation (standard email format)
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation (8-16 chars, at least one uppercase letter and one special character)
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = "Password must be between 8 and 16 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must include at least one uppercase letter";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      newErrors.password =
        "Password must include at least one special character";
    }

    // Address validation (max 400 characters)
    if (formData.address.length > 400) {
      newErrors.address = "Address must be less than 400 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
            value={formData.name}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            type="email"
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.email}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.password}
            error={!!errors.password}
            helperText={errors.password}
            required
          />
          <TextField
            type="text"
            name="address"
            label="Address"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={formData.address}
            error={!!errors.address}
            helperText={errors.address}
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
