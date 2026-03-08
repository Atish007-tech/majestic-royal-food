const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

// Catch unhandled errors so Render logs them before exiting with status 1
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! Shutting down...', err);
    process.exit(1);
});

const db = require('./config/db'); // Database connection

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api', require('./routes/orderRoutes'));

// Production static serving
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API Running');
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
