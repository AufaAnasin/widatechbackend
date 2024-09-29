const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InvoiceProduct = sequelize.define('InvoiceProduct', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = InvoiceProduct;