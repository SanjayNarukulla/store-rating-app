require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const statsRoutes = require("./routes/stats");
const userRoutes = require("./routes/userRoutes");

const app = express();

// ✅ Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:3000", // ✅ Allow local frontend
  process.env.FRONTEND_URL, // ✅ Allow deployed frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS Error: Not allowed by CORS", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ✅ Middleware
app.use(express.json()); // JSON parsing
app.use(morgan("dev")); // Logging

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/users", userRoutes);

// ✅ Serve React Frontend in Production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");

  console.log("📂 Checking React build path:", buildPath);

  // Check if the build folder exists
  const fs = require("fs");
  if (!fs.existsSync(path.join(buildPath, "index.html"))) {
    console.error(
      "❌ React build not found. Did you run `npm run build` in frontend?"
    );
  } else {
    console.log("✅ React build found!");
  }

  // Serve the static files
  app.use(express.static(buildPath));

  // Serve index.html for all frontend routes
  app.get("*", (req, res) => {
    console.log("⚡ Serving React frontend:", req.url);
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ✅ Root Route (Health Check)
app.get("/", (req, res) => {
  res.json({ message: "✅ API is running smoothly 🚀" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
