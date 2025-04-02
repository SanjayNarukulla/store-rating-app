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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import debounce from "lodash.debounce";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Custom styling for the table header
const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1976D2", // Blue header
  "& th": {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

// Custom styling for table rows
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: "#E3F2FD", // Light blue
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#BBDEFB", // Slightly darker blue
  },
  "&:hover": {
    backgroundColor: "#64B5F6", // Highlight on hover
  },
}));

function UserList() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Users with Search Debounce
  const fetchUsers = useCallback(
    debounce(async (searchTerm) => {
      setLoading(true);
      setError("");
      try {
        const storedAuth = JSON.parse(localStorage.getItem("auth"));
        const token = storedAuth?.token;
        console.log("🔑 Token Sent:", token); // Debugging token

        if (!token) {
          throw new Error("No token found, please log in again.");
        }

        const response = await axios.get(
          `${API_URL}/users?search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Users Response:", response.data);
        setUsers(response.data);
      } catch (err) {
        console.error("⚠️ Fetch Error:", err.response?.data || err);
        setError(`Failed to fetch users. Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchUsers(""); // Fetch all users on mount
  }, [fetchUsers]);

  // Handle search filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    fetchUsers(e.target.value);
  };

  // Function to get role-based color
  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "admin":
        return { color: "#D32F2F", fontWeight: "bold" }; // Red
      case "owner":
        return { color: "#1976D2", fontWeight: "bold" }; // Blue
      case "user":
        return { color: "#388E3C", fontWeight: "bold" }; // Green
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
        sx={{
          backgroundColor: "white",
          borderRadius: "5px",
        }}
      />

      {loading && (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "20px" }}
        >
          <CircularProgress />
        </div>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {users.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {users.map((user) => (
                <StyledTableRow key={user.id}>
                  <TableCell sx={{ fontWeight: "bold" }}>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.address || "N/A"}</TableCell>
                  <TableCell sx={getRoleColor(user.role)}>
                    {user.role}
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
