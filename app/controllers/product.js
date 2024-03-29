'use strict';

var productApi = require('../api/index').product;

var getProducts = (result) => {
    productApi.getProducts(null, (response) => {
        return result(response);
    });
}

var getProductById = (id, result) => {
    productApi.getProductById(id, (response) => {
        return result(response);
    });
}

var getNewProducts = (limit, result) => {
    productApi.getNewProducts(limit, (response) => {
        return result(response);
    });
}

var getSpecialProducts = (limit, result) => {
    productApi.getSpecialProducts(limit, (response) => {
        return result(response);
    });
}

var getProductsByType = (id, limit, result) => {
    productApi.getProductsByType(id, limit, (response) => {
        return result(response);
    });
}

var getProductsByCategory = (idCategory, idRootCategory, limit = 15, result) => {
    productApi.getProductsByCategory(idCategory, idRootCategory, limit, (response) => {
        return result(response);
    });
}

var getHotProducts = (limit, result) => {
    productApi.getHotProducts(limit, (response) => {
        return result(response);
    });
}

var getCountProducts = (result) => {
    productApi.getCountProducts((response) => {
        return result(response.count || 0);
    });
}

var searchProduct = (text, result) => {
    productApi.searchProducts(text, (response) => {
        return result(response);
    });
}

var reviewProduct = (user, review, result) => {
    productApi.reviewProduct(user, review, (cb) => {
        return result(cb);
    });
}

module.exports = {
}