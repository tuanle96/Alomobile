var express = require('express');
var router = express.Router();

var Product = require('../app/controllers/index').product;

router.get('/product/list', (req, res) => {
    Product.getProducts((response) => {
        res.json(response);
    });
});

router.get('/product/listNew/', (req, res) => {
    Product.getNewProducts(10, (response) => {
        res.json(response);
    });
});

router.get('/product/listNew/limit=:limit', (req, res) => {
    Product.getNewProducts(req.params.limit, (response) => {
        res.json(response);
    });
});

router.get("/product/listSpecial", (req, res) => {
    Product.getSpecialProducts(10, (response) => {
        res.json(response);
    });
});

router.get("/product/listSpecial/limit=:limit", (req, res) => {
    Product.getSpecialProducts(parseInt(req.params.limit), (response) => {
        res.json(response);
    });
});

router.get("/product/listHot", (req, res) => {
    Product.getHotProducts(20, (response) => {
        res.json(response);
    });
});

router.get("/product/listHot/limit=:limit", (req, res) => {
    Product.getHotProducts(parseInt(req.params.limit), (response) => {
        res.json(response);
    });
});

router.get('/product/type/:type', (req, res) => {
    Product.getProductsByType(req.params.type, 10, (response) => {
        res.json(response);
    });
});

router.get('/product/type/:type/limit=:limit', (req, res) => {
    Product.getProductsByType(req.params.type, parseInt(req.params.limit), (response) => {
        res.json(response);
    });
});

router.get('/product/getCount', (req, res) => {
    Product.getCountProducts((response) => {
        res.json(response);
    });
});

router.get('/products/search/text=:text', (req, res) => {
    Product.searchProduct(req.params.text, (result) => {
        res.json(result)
    });
});

router.get('^\/[a-zA-Z0-9]{1,}-[a-zA-z0-9-+]{1,}$', (req, res) => {
    var des = req.url;
    if (des) {
        var t = des.split('-');

        if (!t) {
            res.redirect('/');
            return
        }

        var id = t[t.length - 1];

        if (!id) {
            res.redirect('/');
            return
        }

        Product.getProductById(id, (result) => {

            if (result.error) {
                res.redirect('/');
                return
            } 

            var product = result.product;
            if (!product) {
                res.redirect('/');
                return
            }

            res.render('detail-product', {
                data: {
                    title: product.name,
                    product: product
                }
            });            
        });
    } else {
        res.redirect('/');
    }
});

router.get('\/danh-muc\/[a-zA-Z-0-9\/]{1,}', (req, res) => {
    var url = req.url;
    if (url) {
        var t = url.split('/');
        if (t) {
            var alias = t[t.length - 1];
            if (alias) {
                Product.searchProduct(alias, (result) => {
                    res.json(result)
                })
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/');
        }
    } else {
        res.redirect('/');
    }
});

module.exports = router;