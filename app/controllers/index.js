'use strict';
var order = require('./order');
var product = require('./product');
var user = require('./user');
var homepage = require('./homepage');
var category = require('./category');

module.exports = {
    order: order,
    user: user,
    product: product,
    homepage: homepage,
    category: category
}