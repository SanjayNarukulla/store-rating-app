import { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

// Custom styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3), // Increased padding
  marginTop: theme.spacing(4), // Increased margin top
  backgroundColor: theme.palette.grey[100], // Lighter background
  borderRadius: theme.shape.borderRadius,
  maxWidth: 600, // Adjusted max width for better readability
  margin: "30px auto", // Center the paper with more top margin
}));

const DashboardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(3), // More space below title
  textAlign: "center",
}));

const AverageRatingBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2), // Consistent padding
  borderRadius: theme.shape.borderRadius,
  textAlign: "center",
  fontWeight: theme.typography.fontWeightBold,
  fontSize: theme.typography.h6.fontSize,
  marginBottom: theme.spacing(3), // More space below average rating
}));

const PasswordUpdateButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingInline: theme.spacing(3), // Optional: makes button width look balanced
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  textTransform: "none", // Keeps text readable (not all caps)
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const PasswordFormBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2), // Space between password fields and button
}));

const StyledList = styled(List)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[100],
  display: "block", // ensures vertical layout
}));

const RatingLabel = styled("span")(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

// Style for the Box container to align items horizontally (User and Rating side by side)
const RatingInfoContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center", // Align items vertically in the center
  gap: theme.spacing(2), // Space between user and rating info
}));

function StoreOwnerDashboard() {
  const [averageRating, setAverageRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const storedAuth = JSON.parse(localStorage.getItem("auth"));
        const token = storedAuth?.token;

        if (!token) {
          throw new Error("No valid token found. Please log in again.");
        }

        const response = await axios.get(
          `${API_URL}/ratings/owner/average-rating`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        );

        if (response.data) {
          setAverageRating(parseFloat(response.data.average_rating) || 0);
          setRatings(response.data.ratings || []);
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to fetch ratings. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  const handlePasswordUpdate = async () => {
    setPasswordMessage("");

    if (!oldPassword || !newPassword) {
      setPasswordMessage("Please fill in both fields.");
      return;
    }

    try {
      const storedAuth = JSON.parse(localStorage.getItem("auth"));
      const token = storedAuth?.token;

      if (!token) {
        throw new Error("Unauthorized. Please log in again.");
      }

      const response = await axios.put(
        `${API_URL}/users/update-password`,
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordMessage(response.data.message || "Password updated!");
      setOldPassword("");
      setNewPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordMessage(
        error.response?.data?.message || "Failed to update password."
      );
    }
  };

  return (
    <StyledPaper>
      <DashboardTitle variant="h4">Store Owner Dashboard</DashboardTitle>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <PasswordUpdateButton
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          {showPasswordForm ? "Cancel Password Update" : "Update Password"}
        </PasswordUpdateButton>
      </Box>

      {showPasswordForm && (
        <PasswordFormBox mt={3}>
          <TextField
            label="Old Password"
            type="password"
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordUpdate}
            fullWidth
          >
            Submit
          </Button>
          {passwordMessage && (
            <Typography
              sx={{ mt: 2, textAlign: "center" }}
              color={
                passwordMessage.toLowerCase().includes("success")
                  ? "green"
                  : "error"
              }
            >
              {passwordMessage}
            </Typography>
          )}
        </PasswordFormBox>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ mt: 3, textAlign: "center" }}>
          {error}
        </Typography>
      ) : (
        <>
          <AverageRatingBox>
            Average Rating: {averageRating.toFixed(1)} ⭐
          </AverageRatingBox>
          <Typography
            variant="h6"
            sx={{ marginBottom: "1rem", color: "#1976D2" }}
          >
            Customer Ratings
          </Typography>
          {ratings.length === 0 ? (
            <Typography sx={{ textAlign: "center", mt: 2 }}>
              No ratings yet.
            </Typography>
          ) : (
            <StyledList>
              {ratings.map((rating, index) => (
                <StyledListItem key={index}>
                  <Box>
                    <Typography>
                      <RatingLabel>User:</RatingLabel> {rating.user_name}
                    </Typography>
                    <Typography>
                      <RatingLabel>Rating:</RatingLabel> {rating.rating} ⭐
                    </Typography>
                  </Box>
                </StyledListItem>
              ))}
            </StyledList>
          )}
        </>
      )}
    </StyledPaper>
  );
}

export default StoreOwnerDashboard;
