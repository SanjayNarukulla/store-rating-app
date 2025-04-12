import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function AddUser() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      address: "",
      role: "User", // Default role set
    },
  });

  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [error, setError] = useState(""); // ✅ Error state
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;
      console.log(token)
      await axios.post(`${API_URL}/users`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User added successfully!");
      reset(); // ✅ Clear form after success
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Add New User
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name Field */}
        <Controller
          name="name"
          control={control}
          rules={{ required: "Name is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Full Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              margin="normal"
            />
          )}
        />

        {/* Email Field */}
        <Controller
          name="email"
          control={control}
          rules={{
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email format",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
            />
          )}
        />

        {/* Password Field */}
        <Controller
          name="password"
          control={control}
          rules={{
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              margin="normal"
            />
          )}
        />

        {/* Address Field */}
        <Controller
          name="address"
          control={control}
          rules={{ required: "Address is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Address"
              fullWidth
              error={!!errors.address}
              helperText={errors.address?.message}
              margin="normal"
            />
          )}
        />

        {/* Role Selection Field */}
        <Controller
          name="role"
          control={control}
          rules={{ required: "Role is required" }}
          render={({ field }) => (
            <TextField
              select
              {...field}
              label="Role"
              fullWidth
              error={!!errors.role}
              helperText={errors.role?.message}
              margin="normal"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Owner">Owner</MenuItem>
            </TextField>
          )}
        />

        {/* Submit Button */}
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
            "Add User"
          )}
        </Button>
      </form>
    </Paper>
  );
}

export default AddUser;
