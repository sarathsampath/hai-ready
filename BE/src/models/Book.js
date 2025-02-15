import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    recommended: {
        type: Boolean,
        default: false
    },
    imageUrl: {
        type: String,
        trim: true,
        default: '' // Default empty string if no image URL is provided
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
