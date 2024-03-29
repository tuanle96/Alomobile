'use strict';
var dashboard = require('./dashboard');
var product = require('./product');
var category = require('./category');
var brand = require('./brand');
var user = require('./user');
var type = require('./type');
var role = require('./role');
var review = require('./review');
var order = require('./order');
var cron = require('./cron');
var promotion = require('./promotion');

module.exports = {
    dashboard: dashboard,
    product: product,
    category: category,
    brand: brand,
    user: user,
    type: type,
    role: role,
    review: review,
    order: order,
    cron: cron,
    promotion: promotion
}