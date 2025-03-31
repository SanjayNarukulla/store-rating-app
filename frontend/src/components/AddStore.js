import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function AddStore() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false); // ✅ Loading state
  const [error, setError] = useState(""); // ✅ Error state
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/stores`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Store added successfully!");
      reset(); // ✅ Clear form after success
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Error:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || "Failed to add store.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Add New Store
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Store Name */}
        <TextField
          label="Store Name"
          fullWidth
          {...register("name", { required: "Store name is required" })}
          error={!!errors.name}
          helperText={errors.name?.message}
          margin="normal"
        />

        {/* Email */}
        <TextField
          label="Email"
          fullWidth
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email format",
            },
          })}
          error={!!errors.email}
          helperText={errors.email?.message}
          margin="normal"
        />

        {/* Address */}
        <TextField
          label="Address"
          fullWidth
          {...register("address", { required: "Address is required" })}
          error={!!errors.address}
          helperText={errors.address?.message}
          margin="normal"
        />

        {/* Owner ID */}
        <TextField
          label="Owner ID"
          fullWidth
          {...register("owner_id", {
            required: "Owner ID is required",
            pattern: {
              value: /^[0-9]+$/,
              message: "Owner ID must be a number",
            },
          })}
          error={!!errors.owner_id}
          helperText={errors.owner_id?.message}
          margin="normal"
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
            "Add Store"
          )}
        </Button>
      </form>
    </Paper>
  );
}

export default AddStore;
