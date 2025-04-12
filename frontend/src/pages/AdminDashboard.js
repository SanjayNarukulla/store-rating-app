import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import StoreList from "../components/StoreList";
import UserList from "../components/UserList";
import { Link } from "react-router-dom";

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, stores: 0, ratings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem("auth"));
        const token = storedAuth?.token; // Extract token correctly
         // Debugging token

        if (!token) {
          throw new Error("No token found, please log in again.");
        }

        const response = await axios.get(`${API_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        
        setStats({
          users: response.data.totalUsers,
          stores: response.data.totalStores,
          ratings: response.data.totalRatings,
        });
      } catch (err) {
        console.error("⚠️ Fetch Error:", err.response?.data || err);
        setError("⚠️ Failed to fetch statistics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);


  return (
    <Paper sx={{ padding: 4, maxWidth: 1100, margin: "auto", mt: 3 }}>
      {/* Header */}
      <Typography variant="h4" align="center" gutterBottom>
        Admin Dashboard 🛠️
      </Typography>

      {/* Stats Section */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ textAlign: "center", mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#f1f1f1" }}>
              <Typography variant="h6">👥 Total Users</Typography>
              <Typography variant="h5">{stats.users}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#f1f1f1" }}>
              <Typography variant="h6">🏪 Total Stores</Typography>
              <Typography variant="h5">{stats.stores}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, bgcolor: "#f1f1f1" }}>
              <Typography variant="h6">⭐ Total Ratings</Typography>
              <Typography variant="h5">{stats.ratings}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Add Store & User Section */}
      <Box textAlign="center" sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/add-store"
          sx={{ mx: 1 }}
        >
          ➕ Add Store
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/add-user"
          sx={{ mx: 1 }}
        >
          ➕ Add User/Admin
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Store List & User List */}
      <Typography variant="h5" gutterBottom>
        📜 Store List
      </Typography>
      <StoreList />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        🧑‍💻 User List
      </Typography>
      <UserList />
    </Paper>
  );
}

export default AdminDashboard;
