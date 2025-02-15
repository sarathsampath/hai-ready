import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './BookGrid.css';

const BookGrid = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
                const response = await axios.get(`${API_URL}/books`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch books. Please try again later.');
            console.error('Error fetching books:', err);
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
                {books.map(book => (
                    <div key={book._id} className="book-card">
                        {book.imageUrl ? (
                            <img
                                src={book.imageUrl}
                                alt={book.title}
                                className="book-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.className = 'book-image placeholder';
                                }}
                            />
                        ) : (
                            <div className="book-image placeholder">No Image</div>
                        )}
                        <div className="book-info">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">{book.author}</p>
                            <p className="book-description">{book.description || 'No description available'}</p>
                            {book.stockQuantity === 0 && (
                                <p className="out-of-stock">Out of Stock</p>
                            )}
                            <button className="add-note" onClick={() => {
                                // Add note functionality can be implemented here
                            }}>+ Add Note</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookGrid;
