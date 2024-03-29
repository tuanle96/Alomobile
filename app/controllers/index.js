'use strict';
var order = require('./order');
var product = require('./product');
var user = require('./user');
var homepage = require('./homepage');
var category = require('./category');
var brand = require('./brand');
var review = require('./review');
var redis = require('./redis');

module.exports = {
    order: order,
    user: user,
    product: product,
    homepage: homepage,
    category: category,
    brand: brand,
    review: review,
    redis: redis
}