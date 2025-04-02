import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = process.env.REACT_APP_API_URL; // Load API URL from .env

// Styled container
const StyledPaper = styled(Paper)({
  padding: "25px",
  marginTop: "20px",
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
});

// Styled search input
const SearchBar = styled(TextField)({
  width: "100%",
  marginBottom: "20px",
});

// Styled list
const StyledList = styled(List)({
  backgroundColor: "#F8F9FA",
  borderRadius: "10px",
  padding: "15px",
});

// Styled list items with hover effect
const StyledListItem = styled(ListItem)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#E3F2FD",
  marginBottom: "12px",
  borderRadius: "10px",
  padding: "15px",
  transition: "0.3s",
  "&:hover": {
    backgroundColor: "#BBDEFB",
    transform: "scale(1.02)",
  },
});

// Styled rating select dropdown
const StyledSelect = styled(Select)({
  backgroundColor: "white",
  borderRadius: "5px",
  padding: "5px",
  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
});

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [error, setError] = useState("");

  // Memoizing fetchStores function using useCallback to avoid unnecessary re-renders
  const fetchStores = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stores`);
      setStores(response.data);
      fetchStoreRatings(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to fetch stores.");
    }
  }, []); // No dependencies because it doesn't rely on external values

  // Fetch average ratings for each store
  const fetchStoreRatings = async (storeList) => {
    try {
      const ratingsData = {};
      for (let store of storeList) {
        const response = await axios.get(`${API_BASE_URL}/ratings/${store.id}`);
        ratingsData[store.id] = response.data.average_rating
          ? response.data.average_rating.toFixed(1)
          : "No Ratings Yet";
      }
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching store ratings:", error);
      setError("Failed to fetch ratings.");
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (storeId, rating) => {
    try {
      await axios.post(
        `${API_BASE_URL}/ratings`,
        { store_id: storeId, rating },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setUserRatings((prevRatings) => ({
        ...prevRatings,
        [storeId]: rating,
      }));
      fetchStores(); // Refresh stores after rating submission
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Failed to submit rating.");
    }
  };

  // Filter stores based on search input
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch stores when component mounts
  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <StyledPaper>
      <Typography variant="h5" sx={{ color: "#1976D2", fontWeight: "bold" }}>
        User Dashboard
      </Typography>

      {/* Search Bar */}
      <SearchBar
        label="Search by name or address..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Error Message */}
      {error && <Typography color="error">{error}</Typography>}

      <Typography variant="h6" sx={{ marginBottom: "15px", color: "#1976D2" }}>
        Available Stores
      </Typography>

      <StyledList>
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <StyledListItem key={store.id}>
              {/* Store Name & Address */}
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {store.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{ color: "gray" }}>
                    {store.address}
                  </Typography>
                }
              />

              {/* Average Rating */}
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  ⭐ {ratings[store.id]}
                </Typography>
              </Box>

              {/* Rating Input Dropdown */}
              <FormControl size="small">
                <StyledSelect
                  value={userRatings[store.id] || ""}
                  onChange={(e) =>
                    handleRatingSubmit(store.id, parseInt(e.target.value))
                  }
                  displayEmpty
                >
                  <MenuItem value="">Rate</MenuItem>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>
            </StyledListItem>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", p: 2 }}>
            No stores found.
          </Typography>
        )}
      </StyledList>
    </StyledPaper>
  );
}

export default UserDashboard;
