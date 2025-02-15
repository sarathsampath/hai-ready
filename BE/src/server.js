import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { protect, authorize } from "./middleware/auth.js";
import bookRoutes from "./routes/book.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const mongoURL = process.env.MONGODB_URI;

if (!mongoURL) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(mongoURL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", bookRoutes);

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Sign up endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const user = new User({
      username,
      password,
      role: role || "User",
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      user: {
        username: user.username,
        role: user.role,
      },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected Admin Routes
app.get("/api/admin/inventory", protect, authorize("Admin"), (req, res) => {
  res.json({ message: "Admin inventory management access granted" });
});

// Protected User Routes
app.get("/api/user/cart", protect, authorize("User"), (req, res) => {
  res.json({ message: "User cart access granted" });
});

app.get("/api/user/recommendations", protect, authorize("User"), (req, res) => {
  res.json({ message: "User recommendations access granted" });
});

// Route accessible by both Admin and User
app.get("/api/profile", protect, authorize("Admin", "User"), (req, res) => {
  res.json({
    message: "Profile access granted",
    user: {
      username: req.user.username,
      role: req.user.role,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
