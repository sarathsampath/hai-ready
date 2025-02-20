import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import Book from "../models/Book.js";

const router = express.Router();

// Create a new book
router.post("/books", protect, authorize("Admin"), async (req, res) => {
  try {
    const { title, author, stockQuantity, recommended, imageUrl, description } =
      req.body;

    if (
      !title ||
      !author ||
      typeof stockQuantity !== "number" ||
      stockQuantity < 0
    ) {
      return res
        .status(400)
        .json({ error: "Please provide valid book details" });
    }

    const book = new Book({
      title,
      author,
      stockQuantity,
      recommended: recommended || false,
      imageUrl: imageUrl || "",
      description: description || "",
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to create book" });
  }
});

// Update book details
router.put("/books/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const { title, author, stockQuantity, recommended, imageUrl, description } =
      req.body;
    const updates = {};

    if (title) updates.title = title;
    if (author) updates.author = author;
    if (typeof stockQuantity === "number" && stockQuantity >= 0)
      updates.stockQuantity = stockQuantity;
    if (typeof recommended === "boolean") updates.recommended = recommended;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (description !== undefined) updates.description = description;

    const book = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to update book" });
  }
});

// Get a single book by ID
router.get(
  "/books/:id",
  protect,
  authorize("Admin", "User"),
  async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }
      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  }
);

// Get all books
router.get('/books', async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Update book stock
router.patch(
  "/books/:id/stock",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { stockQuantity } = req.body;
      if (typeof stockQuantity !== "number" || stockQuantity < 0) {
        return res.status(400).json({ error: "Invalid stock quantity" });
      }

      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { stockQuantity },
        { new: true }
      );

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to update stock" });
    }
  }
);

// Update book recommendation status
router.patch(
  "/books/:id/recommend",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const { recommended } = req.body;
      if (typeof recommended !== "boolean") {
        return res.status(400).json({ error: "Invalid recommendation status" });
      }

      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { recommended },
        { new: true }
      );

      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to update recommendation status" });
    }
  }
);

// Delete recommendation
router.delete(
  "/inventory/delete-recommendation/:id",
  protect,
  authorize("Admin"),
  async (req, res) => {
    try {
      const book = await Book.findByIdAndUpdate(
        req.params.id,
        { recommended: false },
        { new: true }
      );

      if (!book) {
        return res.status(400).json({ error: "Book not found" });
      }

      res.status(200).json({
        message: "Recommendation removed successfully",
        book,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove recommendation" });
    }
  }
);

// Add feedback to a book
router.post("/books/:id/feedback", protect, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.length > 500) {
      return res
        .status(400)
        .json({ error: "Feedback must be between 1 and 500 characters" });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $push: { feedback: { content } } },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Failed to add feedback" });
  }
});

// Delete a book
router.delete("/books/:id", protect, authorize("Admin"), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default router;
