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

function StoreList() {
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch stores with debounced search
  const fetchStores = useCallback(
    debounce(async (searchTerm) => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${API_URL}/stores?search=${searchTerm}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setStores(response.data);
      } catch (err) {
        setError("Failed to fetch stores.");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    fetchStores(""); // Fetch stores on mount
  }, []);

  // Handle search input change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    fetchStores(e.target.value);
  };

  return (
    <Paper sx={{ padding: 3, marginTop: 2, backgroundColor: "#F5F5F5" }}>
      <Typography variant="h5" gutterBottom sx={{ color: "#1976D2" }}>
        Store List
      </Typography>

      <TextField
        label="Search Stores"
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

      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}

      {stores.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Owner ID</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {stores.map((store) => (
                <StyledTableRow key={store.id}>
                  <TableCell sx={{ fontWeight: "bold" }}>{store.id}</TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell>{store.address || "N/A"}</TableCell>
                  <TableCell>{store.owner_id}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography>No stores found.</Typography>
      )}
    </Paper>
  );
}

export default StoreList;
