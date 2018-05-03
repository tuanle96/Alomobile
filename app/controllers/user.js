'use strict';

var userApi = require('../api/index').user;
var orderApi = require('../api/index').order;
var reviewApi = require('../api/index').review;

var signIn = (user, result) => {
    userApi.signIn(user, (response) => {
        return result(response);
    });
}/***/

var signUp = (user, result) => {
    userApi.signUp(user, (response) => {
        return result(response);
    });
}/***/

var verify = (token, cb) => {
    userApi.verify(token, (response) => {
        return cb(response);
    });
}

var pushValidToken = (token, id, cb) => {
    userApi.pushValidToken(token, id, (r) => {
        return cb(r);
    });
}

var pushInvalidToken = (token, user, cb) => {
    userApi.pushInvalidToken(token, (r) => {
        return cb(r);
    });
}

var signOut = (token, cb) => {
    userApi.signOut(token, (r) => {
        return cb(r);
    });
}

var requireForgetPassword = (email, cb) => {
    userApi.requireForgetPassword(email, (r) => {
        return cb(r);
    });
}

var recoveryPassword = (email, token, newPassword, cb) => {
    userApi.recoveryPassword(email, token, newPassword, (r) => {
        return cb(r);
    });
}

var canRecoveryPassword = (email, token, cb) => {
    userApi.canRecoveryPassword(email, token, (r) => {
        return cb(r);
    });
}

var signOutAllDevices = (id, cb) => {
    userApi.signOutAllDevices(id, (r) => {
        return cb(r);
    });
}

var editUser = (id, user, cb) => {
    userApi.editUser(id, user, (result) => {
        return cb(result);
    });
}

var getMyOrders = (id, cb) => {
    orderApi.getMyOrders(id, (result) => {
        return cb(result)
    });
}

var getMyReviews = (id, cb) => {
    reviewApi.getMyReviews(id, (result) => {
        return cb(result)
    })
}

module.exports = {
    signIn: signIn,
    signUp: signUp,
    signOut: signOut,
    verify: verify,
    pushValidToken: pushValidToken,
    pushInvalidToken: pushInvalidToken,
    requireForgetPassword: requireForgetPassword,
    recoveryPassword: recoveryPassword,
    canRecoveryPassword: canRecoveryPassword,
    signOutAllDevices: signOutAllDevices,
    editUser: editUser,
    getMyOrders: getMyOrders,
    getMyReviews: getMyReviews
}