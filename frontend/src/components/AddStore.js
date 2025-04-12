import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function AddStore() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    control, // Import control for Select component
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [ownerOptions, setOwnerOptions] = useState([]);
  const [fetchOwnersError, setFetchOwnersError] = useState("");

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setFetchOwnersError("");
        const storedAuth = JSON.parse(localStorage.getItem("auth"));
        const token = storedAuth?.token;
        const response = await axios.get(`${API_URL}/users?role=Owner`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOwnerOptions(
          response.data.map((owner) => ({ id: owner.id, name: owner.name }))
        );
      } catch (err) {
        console.error("Error fetching owners:", err);
        setFetchOwnersError("Failed to load valid Owner IDs.");
      }
    };

    fetchOwners();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;
      await axios.post(`${API_URL}/stores`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Store added successfully!");
      reset();
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

        {/* Owner ID as Dropdown */}
        <FormControl
          fullWidth
          margin="normal"
          error={!!errors.owner_id || !!fetchOwnersError}
        >
          <InputLabel id="owner-id-label">Owner</InputLabel>
          <Select
            labelId="owner-id-label"
            id="owner_id"
            {...register("owner_id", { required: "Owner is required" })}
            label="Owner"
          >
            {ownerOptions.map((owner) => (
              <MenuItem key={owner.id} value={owner.id}>
                {owner.name} (ID: {owner.id})
              </MenuItem>
            ))}
          </Select>
          {errors.owner_id && (
            <FormHelperText>{errors.owner_id.message}</FormHelperText>
          )}
          {fetchOwnersError && (
            <FormHelperText error>{fetchOwnersError}</FormHelperText>
          )}
          {!ownerOptions.length && !fetchOwnersError && (
            <FormHelperText>Loading available owners...</FormHelperText>
          )}
          {!ownerOptions.length && fetchOwnersError && (
            <FormHelperText error>
              Could not load owners. Please try again.
            </FormHelperText>
          )}
          {ownerOptions.length === 0 &&
            !errors.owner_id &&
            !fetchOwnersError && (
              <FormHelperText>No owners available to assign.</FormHelperText>
            )}
        </FormControl>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading || ownerOptions.length === 0}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Add Store"
          )}
        </Button>
        {ownerOptions.length === 0 && !fetchOwnersError && (
          <Typography
            variant="caption"
            color="error"
            display="block"
            sx={{ mt: 1 }}
          >
            No owners available. You need to create an 'Owner' user first.
          </Typography>
        )}
      </form>
    </Paper>
  );
}

export default AddStore;
