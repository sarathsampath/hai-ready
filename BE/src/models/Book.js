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
    imageUrl: {
        type: String,
        trim: true,
        default: '' // Default empty string if no image URL is provided
    }
}, {
    timestamps: true
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
