const express = require('express');
const router = express.Router();
const { Invoice, InvoiceProduct, Product } = require('../models'); // Adjust the models import as per your structure

// Helper function to calculate the total price of the invoice
const calculateTotal = (products) => {
    return products.reduce((total, product) => total + product.productPrice * product.quantity, 0);
};

// GET All Invoices
router.get('/invoice', async (req, res) => {
    try {
        // Fetch all invoices with associated products via InvoiceProduct
        const invoices = await Invoice.findAll({
            include: [{
                model: InvoiceProduct,
                include: [Product] // Ensure Product is included in InvoiceProduct
            }]
        });

        const response = invoices.map(invoice => {
            const products = invoice.InvoiceProducts.map(ip => ({
                productId: ip.productId,
                productPrice: ip.Product.price,
                quantity: ip.quantity,
                total: ip.Product.price * ip.quantity,
                image: ip.Product.image
            }));

            return {
                id: invoice.id,
                customerName: invoice.customerName,
                salespersonName: invoice.salespersonName,
                total: calculateTotal(products),
                date: invoice.date,
                notes: invoice.notes,
                product: products
            };
        });

        return res.status(200).json({
            status_code: 200,
            message: "Success",
            data: response
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return res.status(500).json({
            status_code: 500,
            message: "Error fetching invoices",
            error: error.message
        });
    }
});

// GET Invoice by ID
router.get('/invoice/:id', async (req, res) => {
  try {
      const invoiceId = req.params.id;

      // Fetch the invoice by ID with associated products via InvoiceProduct
      const invoice = await Invoice.findByPk(invoiceId, {
          include: [{
              model: InvoiceProduct,
              include: [Product] // Ensure Product is included in InvoiceProduct
          }]
      });

      if (!invoice) {
          return res.status(404).json({
              status_code: 404,
              message: `Invoice with ID ${invoiceId} not found`,
          });
      }

      const products = invoice.InvoiceProducts.map(ip => ({
          productId: ip.productId,
          productPrice: ip.Product.price,
          quantity: ip.quantity,
          total: ip.Product.price * ip.quantity,
          image: ip.Product.image
      }));

      const response = {
          id: invoice.id,
          customerName: invoice.customerName,
          salespersonName: invoice.salespersonName,
          total: calculateTotal(products),
          date: invoice.date,
          notes: invoice.notes,
          product: products
      };

      return res.status(200).json({
          status_code: 200,
          message: "Success",
          data: response
      });
  } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.status(500).json({
          status_code: 500,
          message: "Error fetching invoice",
          error: error.message
      });
  }
});

// POST Invoice
router.post('/invoice', async (req, res) => {
    try {
      const { customerName, salespersonName, date, notes, product } = req.body;
  
      // Initialize total invoice amount
      let totalAmount = 0;
  
      // Loop through the products selected by the user
      for (let i = 0; i < product.length; i++) {
        const { productId, quantity } = product[i];
  
        // Find the product by ID
        const foundProduct = await Product.findByPk(productId);
  
        if (!foundProduct) {
          return res.status(404).json({
            status_code: 404,
            message: `Product with ID ${productId} not found`,
          });
        }
  
        // Check if there's enough stock
        if (foundProduct.stock < quantity) {
          return res.status(400).json({
            status_code: 400,
            message: `Insufficient stock for product ${foundProduct.name}. Available stock: ${foundProduct.stock}`,
          });
        }
  
        // Calculate total amount for the product
        const productTotal = foundProduct.price * quantity;
  
        // Decrease the product stock
        foundProduct.stock -= quantity;
        await foundProduct.save(); // Save the updated stock to the database
  
        // Add the product total to the invoice total
        totalAmount += productTotal;
      }
  
      // Now create the invoice in the database
      const newInvoice = await Invoice.create({
        customerName,
        salespersonName,
        date,
        total: totalAmount,
        notes,
      });
  
      // Create InvoiceProduct entries
      for (let i = 0; i < product.length; i++) {
        const { productId, quantity } = product[i];
        const foundProduct = await Product.findByPk(productId);
  
        await InvoiceProduct.create({
          invoiceId: newInvoice.id,
          productId: productId,
          quantity: quantity,
          productPrice: foundProduct.price,
          total: foundProduct.price * quantity,
        });
      }
  
      // Return success response with the newly created invoice
      return res.status(200).json({
        status_code: 200,
        message: "Success",
        data: {
          invoiceId: newInvoice.id,
          customerName,
          salespersonName,
          total: totalAmount,
          date,
          notes,
          product,
        },
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.status(500).json({
        status_code: 500,
        message: "Error creating invoice",
        error: error.message,
      });
    }
  });

module.exports = router;