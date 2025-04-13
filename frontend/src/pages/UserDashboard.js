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
  Button, // Import Button for password update
} from "@mui/material";
import { styled } from "@mui/material/styles";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  maxWidth: 800, // Adjust max width for better layout
  margin: "20px auto", // Center the paper
}));

const DashboardHeader = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(3),
  textAlign: "center", // Center the header
}));

const PasswordUpdateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end", // Align to the right
  marginBottom: theme.spacing(2),
}));

const PasswordUpdateButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: "none", // Remove the border
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const PasswordInputContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  alignItems: "flex-start", // Align items to the start by default
}));

const PasswordSubmitButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  border: "none", // Remove the border
  "&:hover": {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(3),
}));

// Container for the list of stores, with a light blue background and padding
const StoreListContainer = styled(List)(({ theme }) => ({
  backgroundColor: '#e0f7fa', // Light blue background color
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2), // Added more padding for spacing
  maxHeight: '80vh', // Optional: If you want the list to be scrollable
  overflowY: 'auto', // Optional: Makes the container scrollable if content exceeds height
}));

// Style for each store item in the list
const StoreListItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: theme.palette.background.paper,
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[2],
  transition: theme.transitions.create(["background-color", "transform"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    backgroundColor: theme.palette.info.main,
    transform: "scale(1.02)", // Slightly increase the scale for hover effect
  },
}));

// Style for the store information text (name and address)
const StoreInfo = styled(ListItemText)(({ theme }) => ({
  "& .MuiTypography-primary": {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
  },
  "& .MuiTypography-secondary": {
    color: theme.palette.text.secondary,
  },
}));

// Rating box style (aligning the rating text and dropdown)
const RatingBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2), // Increased gap for better spacing
}));

// Rating text style for the star rating
const RatingText = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
  color: theme.palette.warning.dark,
}));

// Custom styled select dropdown for ratings
const RatingSelect = styled(Select)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  padding: theme.spacing(1),
  minWidth: 120,
}));

// Optional: Custom styling for the MenuItem inside the RatingSelect component
const MenuItemStyled = styled(MenuItem)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightRegular,
  color: theme.palette.text.primary,
}));

function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [error, setError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswordInputs, setShowPasswordInputs] = useState(false);

  // 👇 move this ABOVE fetchStores
  const fetchStoreRatings = useCallback(async (storeList) => {
    try {
      const ratingsData = {};
      for (let store of storeList) {
        const response = await axios.get(`${API_BASE_URL}/ratings/${store.id}`);
        const avgRating = Number(response.data.average_rating);
        ratingsData[store.id] = !isNaN(avgRating)
          ? avgRating.toFixed(1)
          : "No Ratings Yet";
      }
      setRatings(ratingsData);
      console.log("Fetched Store Ratings:", ratingsData);
    } catch (error) {
      console.error("Error fetching store ratings:", error);
      setError("Failed to fetch ratings.");
    }
  }, []);

  // 👇 now declare this — it will no longer error
  const fetchStores = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stores`);
      setStores(response.data);
      fetchStoreRatings(response.data);
      fetchUserRatings(response.data);
    } catch (error) {
      console.error("Error fetching stores:", error);
      setError("Failed to fetch stores.");
    }
  }, [fetchStoreRatings]);

  const fetchUserRatings = useCallback(async () => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      if (!storedAuth || !storedAuth.token) {
        console.log("User not authenticated, skipping user ratings fetch.");
        return;
      }
      const token = storedAuth.token;
      const response = await axios.get(`${API_BASE_URL}/ratings/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Raw user ratings data:", response.data);

      // Check if the data is an object and convert it into an array of objects
      if (
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data)
      ) {
        const ratingsArray = Object.entries(response.data).map(
          ([store_id, rating]) => ({
            store_id: parseInt(store_id), // Ensure store_id is a number
            rating,
          })
        );

        // Now ratingsArray will be in the expected format
        const ratingsMap = {};
        ratingsArray.forEach((ratingObj) => {
          ratingsMap[ratingObj.store_id] = ratingObj.rating;
        });

        setUserRatings(ratingsMap);
        console.log("Fetched User Ratings:", ratingsMap);
      } else {
        console.log("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching all user ratings:", error);
    }
  }, []);

  const handleRatingSubmit = async (storeId, rating) => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      if (!storedAuth || !storedAuth.token) {
        setError("Unauthorized: Token is missing.");
        return;
      }
      const token = storedAuth.token;
      await axios.post(
        `${API_BASE_URL}/ratings`,
        { store_id: storeId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserRatings((prev) => ({ ...prev, [storeId]: rating }));
      console.log("Submitted Rating:", { storeId, rating });
      fetchStores(); // Re-fetch to update UI
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Failed to submit rating.");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      if (!storedAuth || !storedAuth.token) {
        setPasswordMessage("Unauthorized: Token missing.");
        return;
      }
      const token = storedAuth.token;
      await axios.put(
        `${API_BASE_URL}/users/update-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(oldPassword);
      console.log(newPassword);
      setPasswordMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setShowPasswordInputs(false); // Hide password inputs after successful update
    } catch (error) {
      console.error("Password update failed:", error);
      setPasswordMessage(
        error.response?.data?.message || "Failed to update password."
      );
    }
  };

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  return (
    <StyledPaper>
      <DashboardHeader variant="h5">User Dashboard</DashboardHeader>

      <PasswordUpdateContainer>
        {!showPasswordInputs ? (
          <PasswordUpdateButton
            onClick={() => setShowPasswordInputs(true)}
            variant="contained"
            size="small"
          >
            Update Password
          </PasswordUpdateButton>
        ) : (
          <PasswordInputContainer>
            <TextField
              label="Current Password"
              type="password"
              fullWidth
              size="small"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 1 }}
            />
            <PasswordSubmitButton
              onClick={handlePasswordUpdate}
              variant="contained"
              size="small"
            >
              Submit
            </PasswordSubmitButton>
          </PasswordInputContainer>
        )}
        {passwordMessage && (
          <Typography
            sx={{ mt: 1 }}
            color={passwordMessage.includes("success") ? "success" : "error"}
          >
            {passwordMessage}
          </Typography>
        )}
      </PasswordUpdateContainer>

      <SearchBar
        label="Search by name or address..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Typography
        variant="h6"
        sx={{ marginBottom: "1rem", color: "#1976D2", fontWeight: "bold" }}
      >
        Available Stores
      </Typography>

      <StoreListContainer>
        {filteredStores.length > 0 ? (
          filteredStores.map((store) => (
            <StoreListItem key={store.id}>
              <StoreInfo primary={store.name} secondary={store.address} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <RatingBox>
                  <RatingText>⭐ {ratings[store.id]}</RatingText>
                </RatingBox>
                <FormControl size="small">
                  <RatingSelect
                    value={
                      userRatings[store.id] !== undefined
                        ? userRatings[store.id]
                        : ""
                    }
                    onChange={(e) =>
                      handleRatingSubmit(store.id, parseInt(e.target.value))
                    }
                    displayEmpty
                  >
                    <MenuItemStyled value="">
                      {userRatings[store.id] !== undefined
                        ? "Modify Rating"
                        : "Rate"}
                    </MenuItemStyled>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItemStyled key={num} value={num}>
                        {num}
                      </MenuItemStyled>
                    ))}
                  </RatingSelect>
                </FormControl>
                {userRatings[store.id] !== undefined && (
                  <Typography variant="body2" color="textSecondary">
                    Your Rating: {userRatings[store.id]}
                  </Typography>
                )}
              </Box>
            </StoreListItem>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", p: 2 }}>
            No stores found.
          </Typography>
        )}
      </StoreListContainer>
    </StyledPaper>
  );
}

export default UserDashboard;
