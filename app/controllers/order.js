'use strict';

var orderApi = require('../api/order');

var initOrder = (parameters, cb) => {
    orderApi.initOrder(parameters, (response) => {
        return cb(response);
    });
}

var verify = (id, cb) => {
    orderApi.verify(id, (result) => {
        return cb(result);
    });
}

var updateOrder = (order, parameters, cb) => {
    orderApi.updateOrder(order, parameters, (result) => {
        return cb(result)
    })
}

var getOrder = (id, cb) => {
    orderApi.getOrder(id, (result) => {
        return cb(result)
    });
}

var requestPayment = (id, method, cb) => {
    orderApi.requestPayment(id, method, (result) => {
        return cb(result);
    });
}

var compareCurrentOrder = (id, currentProducts, requestProducts) => {
    if (currentProducts.length != requestProducts.length) {
        deleteOrder(id, (cb) => {

        });
        return false
    } else {
        for (let i = 0; i < currentProducts.length; i++) {
            const currentProduct = currentProducts[i];

            var requestProduct = requestProducts.find(e => {
                return e.id == currentProduct.id && currentProduct.color.hex == e.color && Number.parseInt(currentProduct.quantity) == Number.parseInt(e.quantity);
            });

            if (!requestProduct) {
                deleteOrder(id, (cb) => { })
                return false
            }
        }
        return true
    }

    return true
}

var deleteOrder = (id, cb) => {
    orderApi.deleteOrder(id, (result) => {
        return cb(result);
    })
}


module.exports = {
    initOrder: initOrder,
    verify: verify,
    updateOrder: updateOrder,
    getOrder: getOrder,
    requestPayment: requestPayment,
    compareCurrentOrder: compareCurrentOrder,
    deleteOrder: deleteOrder
}