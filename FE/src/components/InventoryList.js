import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import "./InventoryList.css";

const InventoryList = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingStock, setEditingStock] = useState({});
    const [editingImageUrl, setEditingImageUrl] = useState({});
    const [editingDescription, setEditingDescription] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [editingBook, setEditingBook] = useState(null);

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

  const handleStockChange = (bookId, value) => {
    setEditingStock((prev) => ({
      ...prev,
      [bookId]: value,
    }));
  };

    const handleStockDoubleClick = (bookId, currentStock) => {
        setEditingStock(prev => ({
            ...prev,
            [bookId]: currentStock.toString()
        }));
    };

    const handleStockIncrement = async (bookId, currentStock) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            await axios.patch(
                `${API_URL}/books/${bookId}/stock`,
                { stockQuantity: currentStock + 1 },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchBooks();
        } catch (err) {
            setError('Failed to update stock. Please try again.');
            console.error('Error updating stock:', err);
        }
    };

    const handleStockDecrement = async (bookId, currentStock) => {
        if (currentStock <= 0) return;
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            await axios.patch(
                `${API_URL}/books/${bookId}/stock`,
                { stockQuantity: currentStock - 1 },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchBooks();
        } catch (err) {
            setError('Failed to update stock. Please try again.');
            console.error('Error updating stock:', err);
        }
    };

  const updateStock = async (bookId) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      const newStock = parseInt(editingStock[bookId]);

      if (isNaN(newStock) || newStock < 0) {
        setError("Stock quantity must be a positive number");
        return;
      }

            await axios.patch(
                `${API_URL}/books/${bookId}/stock`,
                { stockQuantity: newStock },
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSuccessMessage('Stock updated successfully');
            setEditingStock(prev => ({ ...prev, [bookId]: '' }));
            fetchBooks();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to update stock. Please try again.');
            console.error('Error updating stock:', err);
        }
    };

    const handleEdit = (book) => {
        setEditingBook(book);
        setEditingImageUrl(prev => ({ ...prev, [book._id]: book.imageUrl || '' }));
        setEditingDescription(prev => ({ ...prev, [book._id]: book.description || '' }));
    };

    const handleUpdate = async (bookId) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth'));
            const token = auth?.token;
            
            const updates = {
                imageUrl: editingImageUrl[bookId],
                description: editingDescription[bookId]
            };

            await axios.put(
                `${API_URL}/books/${bookId}`,
                updates,
                { headers: { Authorization: `Bearer ${token}` }}
            );

            setSuccessMessage('Book updated successfully');
            setEditingBook(null);
            setEditingImageUrl(prev => ({ ...prev, [bookId]: '' }));
            setEditingDescription(prev => ({ ...prev, [bookId]: '' }));
            fetchBooks();

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to update book. Please try again.');
            console.error('Error updating book:', err);
        }
    };

  const deleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const token = auth?.token;
      await axios.delete(`${API_URL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMessage("Book deleted successfully");
      fetchBooks();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete book. Please try again.");
      console.error("Error deleting book:", err);
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
            <div className="inventory-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Inventory Management</h2>
            </div>

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
                                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '';
                                            e.target.className = 'book-image placeholder';
                                            e.target.innerHTML = 'No Image';
                                        }}
                                    />
                                ) : (
                                    <div className="book-image placeholder" style={{ width: '100px', height: '150px' }}>No Image</div>
                                )}
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>
                                <div className="stock-control">
                                    <button 
                                        className="stock-button"
                                        onClick={() => handleStockDecrement(book._id, book.stockQuantity)}
                                        disabled={book.stockQuantity <= 0}
                                    >
                                        -
                                    </button>
                                    {editingStock[book._id] !== undefined ? (
                                        <input
                                            type="number"
                                            className="stock-value editing"
                                            value={editingStock[book._id]}
                                            onChange={(e) => handleStockChange(book._id, e.target.value)}
                                            onBlur={() => {
                                                if (editingStock[book._id] !== undefined) {
                                                    updateStock(book._id);
                                                }
                                            }}
                                            min="0"
                                        />
                                    ) : (
                                        <span 
                                            className="stock-value"
                                            onDoubleClick={() => handleStockDoubleClick(book._id, book.stockQuantity)}
                                        >
                                            {book.stockQuantity}
                                        </span>
                                    )}
                                    <button 
                                        className="stock-button"
                                        onClick={() => handleStockIncrement(book._id, book.stockQuantity)}
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                            <td>
                                <div className="description-control">
                                        <span>{book.description || "No description for the book"}</span>
                                    <span>{book.description}</span>
                                </div>
                            </td>
                            <td>
                                <div className="action-icons">
                                    <button 
                                        className="icon-button edit"
                                        onClick={() => handleEdit(book)}
                                        title="Edit"
                                    >
                                        ✎
                                    </button>
                                    <button 
                                        className="icon-button delete"
                                        onClick={() => deleteBook(book._id)}
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {editingBook && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3>Edit Book</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Image URL:</label>
                            <input
                                type="text"
                                value={editingImageUrl[editingBook._id] || ''}
                                onChange={(e) => setEditingImageUrl(prev => ({
                                    ...prev,
                                    [editingBook._id]: e.target.value
                                }))}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label>Description:</label>
                            <textarea
                                value={editingDescription[editingBook._id] || ''}
                                onChange={(e) => setEditingDescription(prev => ({
                                    ...prev,
                                    [editingBook._id]: e.target.value
                                }))}
                                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingBook(null)}
                                style={{ backgroundColor: '#6c757d' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdate(editingBook._id)}
                                style={{ backgroundColor: '#007bff' }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryList;
