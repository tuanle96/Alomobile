'use strict';

const event = require('events');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('config');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');
const helper = require('../helpers/index').helper;

sgMail.setApiKey(config.get('mailbox.apiKey'));

var sendMail = (parameters, cb) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!parameters) {
            workflow.emit('response', {
                error: "Parameters is required!"
            });
            return
        } else {
            if (!parameters.to) {
                workflow.emit('response', {
                    error: "Email receiver is required!"
                });
                return
            }

            if (!parameters.subject) {
                workflow.emit('response', {
                    error: "Subject of email is required!"
                });
                return
            }

            if (!parameters.html) {
                workflow.emit('response', {
                    error: "Content of email is required!"
                });
                return
            }
        }

        workflow.emit('send-email');
    });

    workflow.on('response', (response) => {
        return cb(response);
    });

    workflow.on('send-email', () => {
        const mailData = {
            to: `${parameters.to}`,
            from: 'Alomobile <admin@alomobile.tech>',
            subject: `${parameters.subject}`,
            html: `${parameters.html}`
        };

        sgMail.send(mailData, (err, result) => {
            workflow.emit('response', {
                error: err,
                result: result
            });
        });

    });

    workflow.emit('validate-parameters');
}

var sendMailWithSignUp = (parameters, cb) => {

    var file = path.join(__dirname, '..', 'views', 'emailTemplates', 'registerAccount.html');
    fs.readFile(file, 'utf-8', (err, html) => {

        var $ = cheerio.load(html);   

        var fullName = `${parameters.fullName.firstName || ""} ${parameters.fullName.lastName || ""}`

        $('#welcomeFullName').html(`Chào ${fullName}`)    
        $('#email').html(parameters.to);
        
        var newParameters = {
            to: parameters.to,
            subject: parameters.subject,
            html: $.html()
        }

        sendMail(newParameters, (result) => {
            return cb(result);
        });
    });
}

var sendMailWithForgetPassword = (user, token, cb) => {
    var file = path.join(__dirname, '..', 'views', 'emailTemplates', 'resetPassword.html');
    fs.readFile(file, 'utf-8', (err, html) => {

        var $ = cheerio.load(html);   

        if (!user.fullName) {
            return cb({
                error: "Full name is required!"
            });
        }

        if (!user.email) {
            return cb({
                error: "Email is required!"
            });
        }

        if (!token) {
            return cb({
                error: "Token is required!"
            });
        }

        var fullName = `${user.fullName.firstName || ""} ${user.fullName.lastName || ""}`;
        var link = `https://www.alomobile.tech/quen-mat-khau?email=${user.email}&token=${token}`

        $('#fullName').html(`Chào ${fullName},`)    
        $('#link').attr('href', link);
        
        var newParameters = {
            to: user.email,
            subject: 'Khôi phục mật khẩu tài khoản Alomobile.',
            html: $.html()
        }

        sendMail(newParameters, (result) => {
            return cb(result);
        });
    });
}

var sendMailWithConfirmOrder = (parameters) => {
    var file = path.join(__dirname, '..', 'views', 'emailTemplates', 'order-confirm.html');
    fs.readFile(file, 'utf-8', (err, html) => {

        var $ = cheerio.load(html);   

        //fullname
        //address
        var user = parameters.byUser,
            products = parameters.products,
            toAddress = parameters.toAddress,
            promoCode = parameters.promoCode;

        var fullName = toAddress.fullName,
            phone = toAddress.phone,
            address = `${toAddress.address}, ${toAddress.state}, ${toAddress.city}`,
            email = user.email,
            note = parameters.note,
            checkoutMethod = parameters.checkoutMethod,
            id = parameters.alias;

        if (checkoutMethod) {
            switch (checkoutMethod) {
                case 'Cod':
                    checkoutMethod = "Thanh toán tiền mặt khi nhận hàng"
                    break;            
                default:
                    checkoutMethod = "Đã thanh toán trực tuyến"
                    break;
            }
        }

        $('.fullname_order').text(fullName);
        $('.id_order').text(id);
        $('.email_order').text(email);
        $('.fullAddress_order').text(address);
        $('.phone_order').text(phone);
        $('.shipping_method_order').text(checkoutMethod);
        $('#view-detail-order').attr('href', `https://alomobile.tech/tra-cuu-don-hang?email=${email}&id=${id}`);
        
        var subtotal = 0;

        var items = ''
        products.forEach(product => {

            var name = product.id.name,
                color = product.color,
                quantity = product.quantity,
                price = product.price;

                subtotal += quantity * price

            items += `
                <tr>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <span class="name name_product_order">${name} Hàng Chính Hãng</span>
                        <br> 
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <div class="color_product_order" style="background-color: ${color.hex}; border-radius: 50%; width: 20px; height: 20px; display: inline-block; border-width: 1px; border-style: solid; border-color: grey; margin: 5px" title="${color.name}">
                        </div>
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <span class="price_product_order">${helper.numberWithCommas(price)} VNĐ</span>
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px" class="quantity_product_order">${quantity}</td>
                    <td align="left" valign="top" style="padding:3px 9px" >
                        <span class="safe_product_order">0 VNĐ</span>
                    </td>
                    <td align="right" valign="top" style="padding:3px 9px">
                        <span class="subtotal_product_order">${helper.numberWithCommas(quantity * price)} VNĐ</span>
                    </td>
                </tr>
            `
        });

        $('#table_product').append(items);

        $('.discount_order').text("- " + helper.numberWithCommas(promoCode.discount || 0) + " VNĐ")
        $('.subtotal_order').text(helper.numberWithCommas(subtotal) + " VNĐ")
        $('.total_order').text(helper.numberWithCommas(subtotal - (promoCode.discount || 0)) + " VNĐ")
        
        var newParameters = {
            to: email,
            subject: `Xác nhận đơn hàng #${id}`,
            html: $.html()
        }

        sendMail(newParameters, (result) => {
            
        });
    });
}

var sendMailWithSuccessOrder = (parameters) => {
    var file = path.join(__dirname, '..', 'views', 'emailTemplates', 'order-success.html');
    fs.readFile(file, 'utf-8', (err, html) => {

        var $ = cheerio.load(html);   

        //fullname
        //address
        var user = parameters.byUser,
            products = parameters.products,
            toAddress = parameters.toAddress,
            promoCode = parameters.promoCode;

        var fullName = toAddress.fullName,
            phone = toAddress.phone,
            address = `${toAddress.address}, ${toAddress.state}, ${toAddress.city}`,
            email = user.email,
            note = parameters.note,
            checkoutMethod = parameters.checkoutMethod,
            id = parameters.alias;

        if (checkoutMethod) {
            switch (checkoutMethod) {
                case 'Cod':
                    checkoutMethod = "Thanh toán tiền mặt khi nhận hàng"
                    break;            
                default:
                    checkoutMethod = "Đã thanh toán trực tuyến"
                    break;
            }
        }

        $('.fullname_order').text(fullName);
        $('.id_order').text(id);
        $('.email_order').text(email);
        $('.fullAddress_order').text(address);
        $('.phone_order').text(phone);
        $('.shipping_method_order').text(checkoutMethod);
        $('#view-detail-order').attr('href', `https://alomobile.tech/tra-cuu-don-hang?email=${email}&id=${id}`);
        
        var subtotal = 0;

        var items = ''
        products.forEach(product => {
            var name = product.id.name,
                color = product.color,
                quantity = product.quantity,
                price = product.price;

                subtotal += quantity * price

            items += `
                <tr>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <span class="name name_product_order">${name} - Hàng Chính Hãng</span>
                        <br> 
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <div class="color_product_order" style="background-color: ${color.hex}; border-radius: 50%; width: 20px; height: 20px; display: inline-block; border-width: 1px; border-style: solid; border-color: grey; margin: 5px" title="${color.name}">
                        </div>
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px">
                        <span class="price_product_order">${helper.numberWithCommas(price)} VNĐ</span>
                    </td>
                    <td align="left" valign="top" style="padding:3px 9px" class="quantity_product_order">${quantity}</td>
                    <td align="left" valign="top" style="padding:3px 9px" >
                        <span class="safe_product_order">0 VNĐ</span>
                    </td>
                    <td align="right" valign="top" style="padding:3px 9px">
                        <span class="subtotal_product_order">${helper.numberWithCommas(quantity * price)} VNĐ</span>
                    </td>
                </tr>
            `
        });

        $('#table_product').append(items);

        $('.subtotal_order').text(helper.numberWithCommas(subtotal) + " VNĐ");
        $('.discount_order').text("- " + helper.numberWithCommas(promoCode.discount || 0) + " VNĐ");
        $('.total_order').text(helper.numberWithCommas(subtotal - (promoCode.discount || 0)) + " VNĐ");
        
        var newParameters = {
            to: email,
            subject: `Xác nhận đơn hàng #${id}`,
            html: $.html()
        }

        sendMail(newParameters, (result) => {
            
        });
    });
}

module.exports = {
    sendMail: sendMail,
    sendMailWithSignUp: sendMailWithSignUp,
    sendMailWithForgetPassword: sendMailWithForgetPassword, 
    sendMailWithConfirmOrder: sendMailWithConfirmOrder,
    sendMailWithSuccessOrder: sendMailWithSuccessOrder
}