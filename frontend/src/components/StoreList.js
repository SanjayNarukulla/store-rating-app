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

const API_URL = process.env.REACT_APP_API_URL;

// Styled table components
const StyledTableHead = styled(TableHead)({
  backgroundColor: "#1976D2",
  "& th": {
    color: "#ffffff",
    fontWeight: "bold",
  },
});

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

const StoreList = () => {
  const [allStores, setAllStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_URL}/stores`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setAllStores(response.data);
      console.log(response.data)
      
    } catch (err) {
      setError("Error fetching stores. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores(); // Fetch all stores on mount
  }, [fetchStores]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...allStores];

      if (filter.trim() !== "") {
        filtered = filtered.filter(
          (store) =>
            store.name.toLowerCase().includes(filter.toLowerCase()) ||
            store.email.toLowerCase().includes(filter.toLowerCase()) ||
            (store.address &&
              store.address.toLowerCase().includes(filter.toLowerCase()))
        );
      }

      setFilteredStores(filtered);
    };

    applyFilters();
  }, [allStores, filter]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  return (
    <Paper sx={{ padding: 3, marginTop: 2, backgroundColor: "#F5F5F5" }}>
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

      {filteredStores.length > 0 ? (
        <TableContainer component={Paper} sx={{ marginTop: 2 }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Owner ID</TableCell>
                <TableCell>Average Rating</TableCell> {/* New Column */}
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {filteredStores.map((store) => (
                <StyledTableRow key={store.id}>
                  
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.email}</TableCell>
                  <TableCell>{store.address || "N/A"}</TableCell>
                  <TableCell>{store.owner_id}</TableCell>
                  <TableCell>
                    {store.average_rating !== null
                      ? `${parseFloat(store.average_rating).toFixed(1)} ⭐`
                      : "N/A"}
                  </TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        !loading && <Typography>No stores found.</Typography>
      )}
    </Paper>
  );
};

export default StoreList;
