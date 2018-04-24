'use strict';

var session = require('express-session');
var event = require('events');
var mongoose = require('mongoose');
var _ = require('lodash');

var helper = require('../helpers/index').helper;
var User = require('../models/index').user;
var Product = require('../models/index').product;
var Brand = require('../models/index').brand;
var Category = require('../models/index').category;
var Review = require('../models/index').review;

var getProducts = (prevProduct, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product.find({
            created_at: {
                $lt: prevProduct == null ? Date.now() : (prevProduct == null ? Date.now() : prevProduct)
            }
        })
            .populate('brand')
            .limit(15)
            .sort('-created_at')
            .select('alias name brand images details status')
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getPrevProducts = (nextProduct, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product.find({
            created_at: {
                $gt: nextProduct == null ? Date.now() : (nextProduct == null ? Date.now() : nextProduct)
            }
        })
            .populate('brand')
            .limit(15)
            .select('alias name brand images details status')
            .sort('-created_at')
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getProductById = (id, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!id) {
            workflow.emit('response', 'Id product is required!');
        } else {
            workflow.emit('get-product');
        }
    });

    workflow.on('response', (response) => {
        return result(response)
    });

    workflow.on('get-product', () => {
        Product
            .findById(id)
            .populate({
                path: "brand"
            })
            .populate({
                path: "type"
            })
            .populate({
                path: "category.idRootCategory"
            })
            .exec((err, product) => {
                workflow.emit('response', {
                    error: err,
                    product: product
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getSpecialProducts = (limit, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product
            .find({})
            .limit(limit || 10)
            .sort('-created_at')
            .select('alias name images details status reviews')
            .populate({
                path: "reviews",
                model: "Review",
                match: { status: true }
            })
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getProductsByType = (idType, limit, result) => {

    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!idType) {
            workflow.emit('response', {
                error: "Type of product is required!"
            });
            return
        }

        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product
            .find({
                type: idType
            })
            .limit(limit || 15)
            .sort('-created_at')
            .select('alias name brand images details status reviews')
            .populate({
                path: "reviews",
                model: "Review",
                match: { status: true }
            })
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products || []
                });
            });

    });

    workflow.emit('validate-parameters');
}

var getProductsByCategory = (idCategory, idRootCategory, limit, result) => {

    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!idCategory) {
            workflow.emit('response', {
                error: "Category is required!"
            });
            return
        }

        if (!idRootCategory) {
            workflow.emit('response', {
                error: "Root category is required!"
            });
            return
        }

        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {

        if (idRootCategory == idCategory) {
            Product
                .find({
                    "category.idRootCategory": idRootCategory
                })
                .limit(parseInt(limit))
                .select('alias name brand images details status reviews created_at')
                .populate({
                    path: "reviews",
                    model: "Review",
                    match: { status: true }
                })
                .exec((err, products) => {
                    workflow.emit('response', {
                        error: err,
                        products: products
                    });
                });
        } else {
            Product
                .find({
                    "category.idCategory": idCategory,
                    "category.idRootCategory": idRootCategory
                })
                .limit(limit)
                .select('alias name brand images details status reviews')
                .populate({
                    path: "reviews",
                    model: "Review",
                    match: { status: true }
                })
                .exec((err, products) => {
                    workflow.emit('response', {
                        error: err,
                        products: products
                    });
                });
        }
    });

    workflow.emit('validate-parameters');
}

var getProductsByCategoryWithPagination = (idCategory, from, limit = 15, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!idCategory) {
            workflow.emit('response', {
                error: "Category is required!"
            });
            return
        }

        if (!from) {
            workflow.emit('response', {
                products: []
            });
            return
        }

        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {

        Product
            .find({
                "category.idRootCategory": idCategory,
                "created_at": {
                    $lte: from
                }
            })
            .limit(Number.parseInt(limit))
            .select('alias name brand images details status reviews created_at')
            .populate({
                path: "reviews",
                model: "Review",
                match: { status: true }
            })
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getNewProducts = (limit, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product
            .find({})
            .limit(parseInt(limit) || 10)
            .sort('-created_at')
            .select('alias name brand images details status reviews')
            .populate({
                path: "reviews",
                model: "Review",
                match: { status: true }
            })
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var getHotProducts = (limit, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-products', () => {
        Product
            .find({})
            .limit(limit || 10)
            .sort('-created_at')
            .select('alias name brand images details status reviews')
            .populate({
                path: "reviews",
                model: "Review",
                match: { status: true }
            })
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
}

var newProduct = (product, result) => {
    var workflow = new event.EventEmitter();

    var name = product.name;
    var alias = product.alias;
    var details = product.details;
    var brand = product.brand;
    var specifications = product.specifications;
    var images = product.newNames;
    var type = product.type;
    var descriptions = product.descriptions;
    var metaTitle = product.metaTitle;
    var metaKeyword = product.metaKeyword;
    var category = JSON.parse(product.category);

    workflow.on('validate-parameters', () => {
        if (!name) {
            workflow.emit('response', {
                error: "Please enter name of product"
            });
            return
        }
        if (!alias) {
            workflow.emit('response', {
                error: "Please enter alias of product"
            });
            return
        }
        if (!details) {
            workflow.emit('response', {
                error: "Please enter price, color and quantity of product"
            });
            return
        } else {
            if (typeof details == 'string') {
                details = [JSON.parse(details)];
            } else {
                details = details.map(detail => {
                    return JSON.parse(detail);
                });
            }
        }

        if (!images) {
            workflow.emit('response', {
                error: "Please provide images of product"
            });
            return
        }
        if (!type) {
            workflow.emit('response', {
                error: "Please choose type of product"
            });
            return
        }
        if (!brand) {
            workflow.emit('response', {
                error: "Please choose brand of product"
            });
            return
        }
        if (!descriptions) {
            workflow.emit('response', {
                error: "Please enter descriptions of product"
            });
            return
        }

        if (!(category.idRootCategory && category.idCategory)) {
            workflow.emit('response', {
                error: "Please choose category of product"
            });
            return
        }

        workflow.emit('new-product');

    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('new-product', () => {
        var newProduct = new Product();

        newProduct.name = name;
        newProduct.alias = alias;
        newProduct.details = details;
        newProduct.brand = brand;
        newProduct.category = category;
        newProduct.type = type;
        newProduct.descriptions = descriptions;
        newProduct.metaTitle = metaTitle;
        newProduct.metaKeyword = metaKeyword;

        if (specifications) {
            newProduct.specifications = JSON.parse(specifications);
        }

        newProduct.images = [];
        _.forEach(images, (image) => {
            var object = {}
            object._id = mongoose.Types.ObjectId();
            object.url = '/static/img/' + image;
            object.alt = name;

            newProduct.images.push(object);
        });

        newProduct.save((err) => {
            workflow.emit('response', {
                error: err
            });
        });
    });

    workflow.emit('validate-parameters');
}

var getCountProducts = (result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        workflow.emit('get-count-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('get-count-products', () => {
        Product.count({}, (err, count) => {
            workflow.emit('response', {
                error: err,
                count: count
            });
        });
    });

    workflow.emit('validate-parameters');
}

var editProduct = (product, result) => {

    var workflow = new event.EventEmitter();

    var id = product.id;
    var name = product.name;
    var alias = product.alias;
    var details = product.details;
    var brand = product.brand;
    var specifications = product.specifications;
    var newImages = product.newNames;
    var oldImages = product.originalImages;
    var type = product.type;
    var descriptions = product.descriptions;
    var metaTitle = product.metaTitle;
    var metaKeyword = product.metaKeyword;
    var category = JSON.parse(product.category);

    workflow.on('validate-parameters', () => {
        if (!name) {
            workflow.emit('response', {
                error: "Please enter name of product"
            });
            return
        }
        if (!alias) {
            workflow.emit('response', {
                error: "Please enter alias of product"
            });
            return
        }

        if (!newImages && !oldImages) {
            workflow.emit('response', {
                error: "Please provide images of product"
            });
            return
        } else {
            if (newImages && oldImages) {
                if (newImages.length + oldImages.length < 2) {
                    workflow.emit('response', {
                        error: "Please provide at least 2 images of product "
                    });
                    return
                }
            } else if (newImages && !oldImages) {
                if (newImages.length < 2) {
                    workflow.emit('response', {
                        error: "Please provide at least 2 images of product "
                    });
                    return
                }
            } else {
                if (oldImages.length < 2) {
                    workflow.emit('response', {
                        error: "Please provide at least 2 images of product "
                    });
                    return
                }
            }
        }

        if (!type) {
            workflow.emit('response', {
                error: "Please choose type of product"
            });
            return
        }
        if (!brand) {
            workflow.emit('response', {
                error: "Please choose brand of product"
            });
            return
        }
        if (!descriptions) {
            workflow.emit('response', {
                error: "Please enter descriptions of product"
            });
            return
        }

        if (!details) {
            workflow.emit('response', {
                error: "Please enter price, color and quantity of product"
            });
            return
        } else {
            if (typeof details == 'string') {
                details = [JSON.parse(details)];
            } else {
                details = details.map(detail => {
                    return JSON.parse(detail);
                });
            }
        }

        if (!(category.idRootCategory && category.idCategory)) {
            workflow.emit('response', {
                error: "Please choose category of product"
            });
            return
        }

        workflow.emit('processing-images');

    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('processing-images', () => {
        //processing for images
        var tempImages = [];
        var productImages = [];

        if (newImages) {
            newImages.forEach(element => {
                tempImages.push(element)
            });
        }

        if (oldImages) {
            oldImages.forEach(element => {
                tempImages.push(element);
            });
        }

        _.forEach(tempImages, (image) => {
            var object = {}
            object._id = mongoose.Types.ObjectId();
            object.url = '/static/img/' + image;
            object.alt = name;

            productImages.push(object);
        });

        workflow.emit('new-product', productImages);
    });

    workflow.on('new-product', (imagesEdited) => {

        if (specifications) {
            specifications = JSON.parse(specifications);
        }

        Product.findById(id, (err, product) => {
            if (err) {
                workflow.emit('response', {
                    error: err
                });
                return
            }

            if (!product) {
                workflow.emit('response', {
                    error: "Product not found"
                });
                return
            }

            product.name = name;
            product.alias = alias;
            product.brand = brand;
            product.metaKeyword = metaKeyword;
            product.metaTitle = metaTitle;
            product.category = category;
            product.type = type;
            product.descriptions = descriptions;
            product.images = imagesEdited;
            product.details = details;

            if (specifications) {
                product.specifications = specifications
            }

            product.save((err) => {
                workflow.emit('response', {
                    error: err
                });
            });
        });

    });

    workflow.emit('validate-parameters');
}

var deleteProduct = (id, result) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!id || id == 'undefined') {
            workflow.emit('response', {
                error: "Id of Product is required!"
            });
            return
        }

        workflow.emit('delete-product');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('delete-product', () => {
        Product.findByIdAndRemove(id, (err) => {
            workflow.emit('response', {
                error: err
            });
        });
    });

    workflow.emit('validate-parameters');
}

var searchProducts = (text, result) => {
    //name, price, brand, status, category, type

    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!text || text.length == 0) {
            workflow.emit('response', {
                error: "Please choose field to searching for products"
            });
            return
        }

        workflow.emit('search-products');
    });

    workflow.on('response', (response) => {
        return result(response);
    });

    workflow.on('search-products', () => {
        Product.find({
            $text: {
                $search: `/${text}/gi`,
                $caseSensitive: false
            }
        })
            .populate({
                path: "brand"
            })
            .populate({
                path: "type"
            })
            .populate({
                path: "category.idRootCategory"
            })
            .limit(15)
            .select('alias name brand images details status')
            .exec((err, products) => {
                workflow.emit('response', {
                    error: err,
                    products: products
                });
            });
    });

    workflow.emit('validate-parameters');
};

var getPreviewProduct = (id, cb) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!id) {
            workflow.emit('response', {
                error: "Id is required!"
            });
            return
        }

        workflow.emit('get');
    });

    workflow.on('response', (response) => {
        return cb(response);
    });

    workflow.on('get', () => {
        Product.findById(id).select('name brand alias images details').exec((err, product) => {
            workflow.emit('response', {
                error: err,
                product: product
            });
        });
    });

    workflow.emit('validate-parameters');
}

var reviewProduct = (user, review, cb) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!user) {
            workflow.emit('response', {
                error: "Vui lòng đăng nhập để sử dụng chức năng này!"
            });
            return
        }

        if (!review) {
            workflow.emit('response', {
                error: "Vui lòng nhập nhận xét!"
            });
            return
        } else {
            if (!review.product) {
                workflow.emit('response', {
                    error: "Sản phẩm vừa nhận xét không được tìm thấy!"
                });
                return
            }

            if (!review.star) {
                workflow.emit('response', {
                    error: "Vui lòng đánh giá chất lượng sản phẩm!"
                });
                return
            }

            if (!review.title) {
                workflow.emit('response', {
                    error: "Vui lòng nhập tiêu đề đánh giá!"
                });
                return
            }

            if (!review.content) {
                workflow.emit('response', {
                    error: "Vui lòng nhập nội dung đánh giá!"
                });
                return
            }
        }

        workflow.emit('review');

    });

    workflow.on('response', (response) => {
        return cb(response);
    });

    workflow.on('review', () => {
        Product.findById(review.product, (err, product) => {
            if (err || !product) {
                workflow.emit('response', {
                    error: "Sản phẩm không tìm thấy, vui lòng tải lại trang và thử lại."
                });
                return
            }

            var newReview = new Review({
                byUser: user._id,
                product: review.product,
                star: review.star,
                title: review.title,
                content: review.content
            });

            newReview.save((err) => {
                if (!err) {
                    var reviewsOfProduct = product.reviews || [];
                    var reviewsOfUser = user.reviews || [];
                    reviewsOfProduct.push(newReview._id);
                    reviewsOfUser.push(newReview._id);

                    product.reviews = reviewsOfProduct;
                    user.reviews = reviewsOfUser;

                    product.save((err) => {
                        user.save((err) => {
                            workflow.emit('response', {
                                error: err,
                                review: newReview
                            });
                        });
                    });
                }
            });
        });
    });

    workflow.emit('validate-parameters');
}

var getReviews = (cb) => {

}
var getReviewsWithProduct = (product, status = true, cb) => {
    var workflow = new event.EventEmitter();

    workflow.on('validate-parameters', () => {
        if (!product) {
            workflow.emit('response', {
                error: "Sản phẩm không được tìm thấy!"
            });
            return
        }

        workflow.emit('get-reviews');
    });

    workflow.on('get-reviews', () => {
        Product.findById(product).select('reviews').populate({
            path: "reviews",
            model: "Review",
            match: { status: 1 }
        }).exec((err, docs) => {
            if (docs) {
                Product.populate(docs, {
                    path: 'reviews.byUser',
                    model: 'User',
                    select: 'orders reviews email fullName'
                }, (err, docs2) => {
                    Product.populate(docs2, {
                        path: 'reviews.byUser.orders',
                        model: "Order",
                        select: 'products'
                    }, (err, product) => {
                        workflow.emit('response', {
                            error: err,
                            product: product
                        });
                    })
                });
            } else {
                workflow.emit('response', {
                    error: err
                });
            }
        });
    });

    workflow.on('response', (response) => {
        return cb(response)
    })
    workflow.emit('validate-parameters');
}

module.exports = {
    getProducts: getProducts,
    getProductById: getProductById,
    getProductsByType: getProductsByType,
    getHotProducts: getHotProducts,
    getSpecialProducts: getSpecialProducts,
    getProductsByCategory: getProductsByCategory,
    getNewProducts: getNewProducts,
    newProduct: newProduct,
    getCountProducts: getCountProducts,
    editProduct: editProduct,
    deleteProduct: deleteProduct,
    getPrevProducts: getPrevProducts,
    searchProducts: searchProducts,
    getPreviewProduct: getPreviewProduct,
    reviewProduct: reviewProduct,
    getReviews: getReviewsWithProduct,
    getProductsByCategoryWithPagination: getProductsByCategoryWithPagination
}