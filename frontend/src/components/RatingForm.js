import { useState } from "react";
import axios from "axios";
import {
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

// ✅ Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function RatingForm({ storeId }) {
  const [rating, setRating] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert("Please select a rating.");
      return;
    }

    try {
      await axios.post(`${API_URL}/ratings`, { storeId, rating });
      alert("Rating submitted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit rating.");
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2, textAlign: "center" }}
    >
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Rating</InputLabel>
        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
          <MenuItem value="1">1 ⭐</MenuItem>
          <MenuItem value="2">2 ⭐⭐</MenuItem>
          <MenuItem value="3">3 ⭐⭐⭐</MenuItem>
          <MenuItem value="4">4 ⭐⭐⭐⭐</MenuItem>
          <MenuItem value="5">5 ⭐⭐⭐⭐⭐</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" sx={{ ml: 2 }}>
        Submit Rating
      </Button>
    </Box>
  );
}

export default RatingForm;
