require('dotenv').config();
const express = require('express');
const { Product, Invoice, InvoiceProduct } = require('./models');
const sequelize = require('./config/db'); 
const productRoutes = require('./routes/productRoutes')
const invoiceRoutes = require('./routes/invoiceRoutes')

const app = express();
const APP_PORT = process.env.PORT;

app.use(express.json());

//routes
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