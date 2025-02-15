import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './InventoryList.css';

const InventoryList = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingStock, setEditingStock] = useState({});
    const [editingImageUrl, setEditingImageUrl] = useState({});
    const [editingDescription, setEditingDescription] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [disabledInputs, setDisabledInputs] = useState({});

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

    const handleStockChange = (bookId, value) => {
        setEditingStock(prev => ({
            ...prev,
            [bookId]: value
        }));
    };

    const handleImageUrlChange = (bookId, value) => {
        setEditingImageUrl(prev => ({
            ...prev,
            [bookId]: value
        }));
    };

    const handleDescriptionChange = (bookId, value) => {
        setEditingDescription(prev => ({
            ...prev,
            [bookId]: value
        }));
    };

    const updateImageUrl = async (bookId) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            const newImageUrl = editingImageUrl[bookId];

            await axios.put(
                `${API_URL}/books/${bookId}`,
                { imageUrl: newImageUrl },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSuccessMessage('Image URL updated successfully');
            setEditingImageUrl(prev => ({ ...prev, [bookId]: '' }));
            fetchBooks();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to update image URL. Please try again.');
            console.error('Error updating image URL:', err);
        }
    };

    const updateStock = async (bookId) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            const newStock = parseInt(editingStock[bookId]);

            if (isNaN(newStock) || newStock < 0) {
                setError('Stock quantity must be a positive number');
                return;
            }

            await axios.patch(
                `${API_URL}/books/${bookId}/stock`,
                { stockQuantity: newStock },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            // Disable the input and button for this book
            setDisabledInputs(prev => ({
                ...prev,
                [bookId]: true
            }));

            setSuccessMessage('Stock updated successfully');
            setEditingStock(prev => ({ ...prev, [bookId]: newStock.toString() }));
            fetchBooks();

            // Re-enable the input after 5 seconds
            setTimeout(() => {
                setDisabledInputs(prev => ({
                    ...prev,
                    [bookId]: false
                }));
                setSuccessMessage('');
            }, 5000);
        } catch (err) {
            setError('Failed to update stock. Please try again.');
            console.error('Error updating stock:', err);
        }
    };

    const updateDescription = async (bookId) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            const newDescription = editingDescription[bookId];

            await axios.put(
                `${API_URL}/books/${bookId}`,
                { description: newDescription },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSuccessMessage('Description updated successfully');
            setEditingDescription(prev => ({ ...prev, [bookId]: '' }));
            fetchBooks();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to update description. Please try again.');
            console.error('Error updating description:', err);
        }
    };

    const deleteBook = async (bookId) => {
        if (!window.confirm('Are you sure you want to delete this book?')) {
            return;
        }

        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            await axios.delete(
                `${API_URL}/books/${bookId}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSuccessMessage('Book deleted successfully');
            fetchBooks();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to delete book. Please try again.');
            console.error('Error deleting book:', err);
        }
    };

    if (loading) {
        return <div className="inventory-loading">Loading...</div>;
    }

    if (error) {
        return <div className="inventory-error">{error}</div>;
    }

    return (
        <div className="inventory-container">
            <h2>Inventory Management</h2>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <table className="inventory-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Stock</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map(book => (
                        <tr key={book._id}>
                            <td>
                                {book.imageUrl ? (
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className="book-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                            e.target.className = 'book-image placeholder';
                                            e.target.innerHTML = 'No Image';
                                        }}
                                    />
                                ) : (
                                    <div className="book-image placeholder">No Image</div>
                                )}
                                <div className="image-url-control">
                                    <input
                                        type="text"
                                        value={editingImageUrl[book._id] || ''}
                                        onChange={(e) => handleImageUrlChange(book._id, e.target.value)}
                                        placeholder="Enter image URL"
                                    />
                                    <button
                                        onClick={() => updateImageUrl(book._id)}
                                        disabled={!editingImageUrl[book._id]}
                                    >
                                        Update
                                    </button>
                                </div>
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>
                                <div className="stock-control">
                                    <span>{book.stockQuantity}</span>
                                    <div className="stock-update">
                                        <input
                                            type="number"
                                            min="0"
                                            value={editingStock[book._id] || ''}
                                            onChange={(e) => handleStockChange(book._id, e.target.value)}
                                            placeholder="New stock"
                                            disabled={disabledInputs[book._id]}
                                        />
                                        <button
                                            onClick={() => updateStock(book._id)}
                                            disabled={!editingStock[book._id] || disabledInputs[book._id]}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="description-control">
                                    <span>{book.description}</span>
                                    <div className="description-update">
                                        <textarea
                                            value={editingDescription[book._id] || ''}
                                            onChange={(e) => handleDescriptionChange(book._id, e.target.value)}
                                            placeholder="Enter description"
                                        />
                                        <button
                                            onClick={() => updateDescription(book._id)}
                                            disabled={!editingDescription[book._id]}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteBook(book._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InventoryList;
