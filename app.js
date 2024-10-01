require('dotenv').config();
const express = require('express');
const sequelize = require('./config/db'); 
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const cors = require('cors');
const path = require('path'); // Import path module

const app = express();
const APP_PORT = process.env.PORT;


app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', invoiceRoutes);
app.use('/api', productRoutes);

sequelize.sync({ force: true })
    .then(() => {
        console.log('Database synchronized successfully!');

        // Start the Express server after successful database connection
        app.listen(APP_PORT, () => {
            console.log(`Server is running on http://localhost:${APP_PORT}`);
            console.log(`Connected to database: ${process.env.DB_DATABASE}`);
        });
    })
    .catch(err => {
        console.error('Error synchronizing the database:', err);
    });

module.exports = app;