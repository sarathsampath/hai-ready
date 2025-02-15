import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Book from '../models/Book.js';

const router = express.Router();

// Create a new book
router.post('/books', protect, authorize('Admin'), async (req, res) => {
    try {
        const { title, author, stockQuantity, recommended, imageUrl } = req.body;

        if (!title || !author || typeof stockQuantity !== 'number' || stockQuantity < 0) {
            return res.status(400).json({ error: 'Please provide valid book details' });
        }

        const book = new Book({
            title,
            author,
            stockQuantity,
            recommended: recommended || false,
            imageUrl: imageUrl || ''
        });

        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create book' });
    }
});

// Update book details
router.put('/books/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const { title, author, stockQuantity, recommended, imageUrl } = req.body;
        const updates = {};

        if (title) updates.title = title;
        if (author) updates.author = author;
        if (typeof stockQuantity === 'number' && stockQuantity >= 0) updates.stockQuantity = stockQuantity;
        if (typeof recommended === 'boolean') updates.recommended = recommended;
        if (imageUrl !== undefined) updates.imageUrl = imageUrl;

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// Get all books
router.get('/books', protect, authorize('Admin'), async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Update book stock
router.patch('/books/:id/stock', protect, authorize('Admin'), async (req, res) => {
    try {
        const { stockQuantity } = req.body;
        if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
            return res.status(400).json({ error: 'Invalid stock quantity' });
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { stockQuantity },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update stock' });
    }
});

// Update book recommendation status
router.patch('/books/:id/recommend', protect, authorize('Admin'), async (req, res) => {
    try {
        const { recommended } = req.body;
        if (typeof recommended !== 'boolean') {
            return res.status(400).json({ error: 'Invalid recommendation status' });
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { recommended },
            { new: true }
        );

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update recommendation status' });
    }
});

// Delete recommendation
router.delete('/inventory/delete-recommendation/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { recommended: false },
            { new: true }
        );

        if (!book) {
            return res.status(400).json({ error: 'Book not found' });
        }

        res.status(200).json({
            message: 'Recommendation removed successfully',
            book
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove recommendation' });
    }
});

// Delete a book
router.delete('/books/:id', protect, authorize('Admin'), async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

export default router;
