import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import "./BookDetails.css";
import { FeedbackModal } from "./BookGrid";

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBook = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      const response = await axios.get(`${API_URL}/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch book details. Please try again later.");
      console.error("Error fetching book:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (content) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      await axios.post(
        `${API_URL}/books/${id}/feedback`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchBook(); // Refresh book to show new feedback
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  if (loading) {
    return <div className="book-details-container">Loading...</div>;
  }

  if (error) {
    return <div className="book-details-container">{error}</div>;
  }

  if (!book) {
    return <div className="book-details-container">Book not found</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="book-details-container">
      <div className="book-details-content">
        <div className="book-image-section">
          {book.imageUrl ? (
            <img
              src={book.imageUrl}
              alt={book.title}
              className="book-details-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "";
                e.target.className = "book-image-placeholder";
              }}
            />
          ) : (
            <div className="book-image-placeholder">No Image</div>
          )}
        </div>

        <div className="book-info-section">
          <h1 className="book-title">{book.title}</h1>
          <p className="book-author">by {book.author}</p>
          <p className="book-description">
            {book.description || "No description available"}
          </p>
          <div
            className={`stock-status ${
              book.stockQuantity > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {book.stockQuantity > 0
              ? `In Stock (${book.stockQuantity} available)`
              : "Out of Stock"}
          </div>
        </div>
      </div>

      <div className="feedback-section">
        <div className="feedback-header">
          <h2 className="feedback-title">Reader Recommendations</h2>
          <button
            className="add-feedback-btn"
            onClick={() => setModalOpen(true)}
          >
            + Add Recommendation
          </button>
        </div>

        <div className="feedback-list">
          {book.feedback && book.feedback.length > 0 ? (
            book.feedback
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((feedback, index) => (
                <div key={index} className="feedback-item">
                  <p className="feedback-content">{feedback.content}</p>
                  <p className="feedback-date">
                    {formatDate(feedback.createdAt)}
                  </p>
                </div>
              ))
          ) : (
            <p>No recommendations yet. Be the first to recommend!</p>
          )}
        </div>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bookId={id}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};

export default BookDetails;
