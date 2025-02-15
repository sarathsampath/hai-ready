import React, { useState, useEffect } from 'react';
import './AddBook.css';

const AddBook = ({ onClose, onBookAdded }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        stockQuantity: '',
        imageUrl: '',
        description: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    useEffect(() => {
        if (notification.message) {
            const timer = setTimeout(() => {
                setNotification({ message: '', type: '' });
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [notification.message]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.author.trim()) {
            newErrors.author = 'Author is required';
        }

        if (!formData.stockQuantity) {
            newErrors.stockQuantity = 'Stock quantity is required';
        } else if (isNaN(formData.stockQuantity) || parseInt(formData.stockQuantity) < 0) {
            newErrors.stockQuantity = 'Stock quantity must be a non-negative number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Remove empty imageUrl before sending
            const dataToSend = {
                ...formData,
                stockQuantity: parseInt(formData.stockQuantity),
                imageUrl: formData.imageUrl.trim() || undefined
            };

            const response = await fetch('http://localhost:7001/api/books', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('auth'))?.token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                throw new Error('Failed to add book');
            }

            setNotification({ message: 'Book added successfully!', type: 'success' });

            // Call the callbacks
            if (onBookAdded) onBookAdded();
            if (onClose) {
                setTimeout(() => {
                    onClose();
                }, 1500); // Close after showing success message briefly
            }
        } catch (error) {
            setNotification({ message: 'Error adding book: ' + error.message, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        return formData.title.trim() &&
               formData.author.trim() &&
               formData.stockQuantity &&
               !isNaN(formData.stockQuantity) &&
               parseInt(formData.stockQuantity) >= 0;
    };

    const Notification = ({ message, type }) => {
        if (!message) return null;
        return (
            <div className={`notification ${type}`}>
                {message}
            </div>
        );
    };

    return (
        <div className="add-book-container">
            <Notification message={notification.message} type={notification.type} />
            <div className="add-book-header">
                <h2>Add New Book</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="add-book-form">
                <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={errors.title ? 'error' : ''}
                    />
                    {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="author">Author *</label>
                    <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className={errors.author ? 'error' : ''}
                    />
                    {errors.author && <span className="error-message">{errors.author}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="stockQuantity">Stock Quantity *</label>
                    <input
                        type="number"
                        id="stockQuantity"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInputChange}
                        min="0"
                        className={errors.stockQuantity ? 'error' : ''}
                    />
                    {errors.stockQuantity && <span className="error-message">{errors.stockQuantity}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="imageUrl">Image URL</label>
                    <input
                        type="url"
                        id="imageUrl"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="submit-button"
                >
                    {isSubmitting ? 'Adding Book...' : 'Add Book'}
                </button>
            </form>
        </div>
    );
};

export default AddBook;
