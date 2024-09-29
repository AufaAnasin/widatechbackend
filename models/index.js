const Product = require('./Product');
const Invoice = require('./Invoice');
const InvoiceProduct = require('./InvoiceProduct');


Invoice.belongsToMany(Product, { through: InvoiceProduct, foreignKey: 'invoiceId' });
Product.belongsToMany(Invoice, { through: InvoiceProduct, foreignKey: 'productId' });

Invoice.hasMany(InvoiceProduct, { foreignKey: 'invoiceId' });
InvoiceProduct.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Product.hasMany(InvoiceProduct, { foreignKey: 'productId' });
InvoiceProduct.belongsTo(Product, { foreignKey: 'productId' });

module.exports = { Product, Invoice, InvoiceProduct };