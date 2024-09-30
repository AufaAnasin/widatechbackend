const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });
const router = express.Router();

// POST Create Product
router.post('/products', async (req, res) => {
    const upload = multer({ storage }).single('image');

    // Use multer to handle the file upload
    upload(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(400).json({
                status_code: 400,
                message: "File upload error",
                error: uploadError.message
            });
        }

        try {
            const { name, stock, price } = req.body;

            console.log('Received data:', { name, stock, price });

            // Validate input
            if (!name || !stock || !price) {
                // If validation fails, delete uploaded file
                if (req.file) {
                    fs.unlinkSync(req.file.path); // Delete the file
                }
                return res.status(400).json({
                    status_code: 400,
                    message: "Invalid input",
                    error: "Name, stock, and price are required."
                });
            }

            // Ensure stock is an integer and price is a decimal
            const stockInt = parseInt(stock);
            const priceDecimal = parseFloat(price);

            if (isNaN(stockInt) || isNaN(priceDecimal)) {
                // If validation fails, delete uploaded file
                if (req.file) {
                    fs.unlinkSync(req.file.path); // Delete the file
                }
                return res.status(400).json({
                    status_code: 400,
                    message: "Invalid input",
                    error: "Stock must be an integer and price must be a decimal."
                });
            }

            const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

            // Create the product in the database
            const newProduct = await Product.create({
                name,
                stock: stockInt,
                price: priceDecimal,
                image: imagePath
            });

            return res.status(201).json({
                status_code: 201,
                message: "Product created successfully",
                data: {
                    productId: newProduct.id,
                    productName: newProduct.name,
                    stock: newProduct.stock,
                    price: newProduct.price,
                    image: newProduct.image
                }
            });
        } catch (error) {
            console.error('Error creating product:', error);
            
            // If there's a database error, delete the uploaded file
            if (req.file) {
                fs.unlinkSync(req.file.path); // Delete the file
            }

            return res.status(500).json({
                status_code: 500,
                message: "Unexpected error",
                error: "An unexpected error occurred. Please try again later."
            });
        }
    });
});

// GET All Products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        const responseData = products.map(product => ({
            productId: product.id,
            productName: product.name,
            stock: product.stock,
            price: product.price,
            image: product.image
        }));

        return res.status(200).json({
            status_code: 200,
            message: "Success",
            data: responseData
        });
    } catch (error) {
        console.error('Error retrieving products:', error);
        return res.status(500).json({
            status_code: 500,
            message: "Error retrieving products",
            error: error.message
        });
    }
});

// GET Product Suggestions for Autocomplete
router.get('/products/search', async (req, res) => {
    const query = req.query.query || '';

    try {
        const products = await Product.findAll();
        
        // Filter products based on the query, matching product names that start with the input string
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().startsWith(query.toLowerCase())
        );

        const responseData = filteredProducts.map(product => ({
            productId: product.id,
            productName: product.name,
            stock: product.stock,
            price: product.price,
            image: product.image
        }));

        return res.status(200).json({
            status_code: 200,
            message: "Success",
            data: responseData
        });
    } catch (error) {
        console.error('Error retrieving product suggestions:', error);
        return res.status(500).json({
            status_code: 500,
            message: "Error retrieving product suggestions",
            error: error.message
        });
    }
});

module.exports = router;