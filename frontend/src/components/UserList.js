import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Typography,
  Paper,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Custom styling for the table header
const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1976D2",
  "& th": {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

// Custom styling for table rows
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#E3F2FD",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#BBDEFB",
  },
  "&:hover": {
    backgroundColor: "#64B5F6",
  },
}));

function UserList() {
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch all users on component mount
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;

      if (!token) {
        throw new Error("No token found, please log in again.");
      }

      const response = await axios.get(`${API_URL}/users`, {
        // Removed query parameters
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllUsers(response.data);
    } catch (err) {
      console.error("⚠️ Fetch Error:", err.response?.data || err);
      setError(`Failed to fetch users. Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Function to handle filtering
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allUsers]; // Start with all users

      // Apply search filter
      if (filter.trim() !== "") {
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(filter.toLowerCase()) ||
            user.email.toLowerCase().includes(filter.toLowerCase()) ||
            (user.address &&
              user.address.toLowerCase().includes(filter.toLowerCase()))
        );
      }

      // Apply role filter
      if (roleFilter !== "") {
        filtered = filtered.filter((user) => user.role === roleFilter);
      }

      setFilteredUsers(filtered);
    };

    applyFilters();
  }, [allUsers, filter, roleFilter]);

  // Handle search filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Handle role dropdown change
  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
  };

  // Role-based color style
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return { color: "#D32F2F", fontWeight: "bold" };
      case "owner":
        return { color: "#1976D2", fontWeight: "bold" };
      case "user":
        return { color: "#388E3C", fontWeight: "bold" };
      default:
        return {};
    }
  };

  return (
    <Paper sx={{ padding: 3, marginTop: 2, backgroundColor: "#F5F5F5" }}>
      <TextField
        label="Search Users"
        variant="outlined"
        value={filter}
        onChange={handleFilterChange}
        fullWidth
        margin="normal"
        sx={{ backgroundColor: "white", borderRadius: "5px" }}
      />

      <FormControl
        fullWidth
        margin="normal"
        sx={{ backgroundColor: "white", borderRadius: "5px" }}
      >
        <InputLabel id="role-filter-label">Filter by Role</InputLabel>
        <Select
          labelId="role-filter-label"
          id="role-filter"
          value={roleFilter}
          label="Filter by Role"
          onChange={handleRoleChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="Owner">Owner</MenuItem>
          <MenuItem value="User">User</MenuItem>
        </Select>
      </FormControl>

      {loading && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <CircularProgress />
        </div>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {filteredUsers.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Store Rating</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <StyledTableRow key={user.id}>
                 
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address || "N/A"}</TableCell>
                  <TableCell sx={getRoleColor(user.role)}>
                    {user.role}
                  </TableCell>
                  <TableCell>
                    {user.role === "Owner" && user.average_store_rating !== null
                      ? user.average_store_rating
                      : "N/A"}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !loading && <Typography>No users found.</Typography>
      )}
    </Paper>
  );
}

export default UserList;
