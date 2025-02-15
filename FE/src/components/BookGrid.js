import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "./BookGrid.css";

export const FeedbackModal = ({ isOpen, onClose, bookId, onSubmit }) => {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const charLimit = 500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.length === 0) {
      setError("Feedback cannot be empty");
      return;
    }
    if (feedback.length > charLimit) {
      setError("Feedback exceeds character limit");
      return;
    }
    await onSubmit(feedback);
    setFeedback("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Add Recommendation</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value);
              setError("");
            }}
            placeholder="Enter your recommendation (max 500 characters)"
            rows="4"
          />
          <div className="char-counter">
            {feedback.length}/{charLimit} characters
            {feedback.length > charLimit && (
              <span className="error-text"> (Limit exceeded)</span>
            )}
          </div>
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={feedback.length === 0 || feedback.length > charLimit}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BookGrid = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmitFeedback = async (content) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      await axios.post(
        `${API_URL}/books/${selectedBookId}/feedback`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBooks(); // Refresh books to show new feedback
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  const fetchBooks = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      const response = await axios.get(`${API_URL}/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch books. Please try again later.");
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return <div className="book-grid-container">Loading...</div>;
  }

  if (error) {
    return <div className="book-grid-container">{error}</div>;
  }

  return (
    <div className="book-grid-container">
      <div className="book-grid">
        {books.map((book) => (
          <div
            key={book._id}
            className="book-card"
            onClick={() => navigate(`/book/${book._id}`)}
            style={{ cursor: "pointer" }}
          >
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="book-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                  e.target.className = "book-image placeholder";
                }}
              />
            ) : (
              <div className="book-image placeholder">No Image</div>
            )}
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <p className="book-description">
                {book.description || "No description available"}
              </p>
              {book.stockQuantity === 0 && (
                <p className="out-of-stock">Out of Stock</p>
              )}
              <button
                className="add-note"
                onClick={() => {
                  setSelectedBookId(book._id);
                  setModalOpen(true);
                }}
              >
                + Add Recommendation
              </button>
            </div>
          </div>
        ))}
      </div>
      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedBookId(null);
        }}
        bookId={selectedBookId}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};

export default BookGrid;
