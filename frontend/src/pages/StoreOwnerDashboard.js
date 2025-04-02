import { useEffect, useState } from "react";
import axios from "axios";
import {
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

// Custom styling
const StyledPaper = styled(Paper)({
  padding: "20px",
  marginTop: "20px",
  backgroundColor: "#F5F5F5",
});

const AverageRatingBox = styled("div")({
  backgroundColor: "#1976D2",
  color: "white",
  padding: "10px",
  borderRadius: "5px",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "18px",
  marginBottom: "15px",
});

const StyledList = styled(List)({
  backgroundColor: "white",
  borderRadius: "5px",
  padding: "10px",
});

const StyledListItem = styled(ListItem)({
  "&:nth-of-type(odd)": {
    backgroundColor: "#E3F2FD",
  },
  "&:nth-of-type(even)": {
    backgroundColor: "#BBDEFB",
  },
});

function StoreOwnerDashboard() {
  const [averageRating, setAverageRating] = useState(0);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        console.log("API Response:", response.data);

        if (response.data) {
          setAverageRating(parseFloat(response.data.average_rating) || 0);
          setRatings(response.data.ratings || []);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
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

  return (
    <StyledPaper>
      <Typography variant="h5" sx={{ color: "#1976D2", fontWeight: "bold" }}>
        Store Owner Dashboard
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <AverageRatingBox>
            Average Rating: {averageRating.toFixed(1)} ⭐
          </AverageRatingBox>

          <Typography
            variant="h6"
            sx={{ marginBottom: "10px", color: "#1976D2" }}
          >
            Customer Ratings
          </Typography>

          {ratings.length === 0 ? (
            <Typography>No ratings yet.</Typography>
          ) : (
            <StyledList>
              {ratings.map((rating, index) => (
                <StyledListItem key={index}>
                  <ListItemText
                    primary={<strong>{rating.user_name}</strong>}
                    secondary={`${rating.rating} ⭐`}
                  />
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
