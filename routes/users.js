var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var form = require('reformed');
var auth = require('../lib/auth.js');
var mysql = require('../lib/mysql.js');
var util = require('../lib/util.js');
var math = require('mathjs');
var fs = require('fs');
var path = require('path');
var readDir = require('readdir');
var dictionary = require('dictionary-en-us');
var nspell = require('nspell');

router.use(function (req, res, next) {
    // console.log('user ssssssssss', req.session)
    var role = req.session.role;
    if(auth.isUserValidated(req) && req.session != undefined) {
        next();
    } else {
        req.session.destroy();
        res.redirect('/');
    }
});

router.get('/changePassword', function (req, res, next) {
    res.render('users/changepassword', {
        adminUser: auth.isAdmin(req),
        name: req.session.email,
        fname: req.session.name,
        QCUser: auth.isQCUser(req)
    })
});

router.post('/change_passeord', function (req, res, next) {
    var query = {
        sql: 'call usp_chengepassword_nr(?,?)',
        values: [req.session.email, req.body.newp]
    }
    mysql(query, function (e, r) {
        if(e) {
            console.log(e);
        } else {
            res.redirect('/users/logout');
        }
    });
});

router.get('/upload_template', function (req, res, next) {
    var query = 'select name from t_template';
    mysql(query, function (err, r) {
        if(err) {
            console.log(err);
            res.redirect('/users/upload_template');
        } else {
            var templates = r.map(function (e) {
                return e.name;
            });
            req.session.templates = templates;
            res.render('users/upload_template', {
                templates: templates,
                adminUser: auth.isAdmin(req),
                name: req.session.email,
                fname: req.session.name,
                QCUser: auth.isQCUser(req)
            });
        }
    });
});

router.post('/upload_template',
    busboy(),
    form({
        template: {
            filename: true,
            required: true
        },
        selected_template: {
            required: true
        },
        sheet_number: {
            required: true
        },
        header_row_number: {
            required: true
        },
        merchant_id: {
            required: true
        }
    }),
    function (req, res, next) {
        //console.log("sassdsd",req.body.image_path);
        // console.log(req.body)
        if(req.body.image_path == undefined) {
            req.session.imagepath = '';
        } else {
            req.session.imagepath = req.body.image_path;
            // createfolder(req.body.image_path);
        }
        var d = new Date();
        var currentTime = new Date();

        var currentOffset = currentTime.getTimezoneOffset();

        var ISTOffset = 330; // IST offset UTC +5:30 

        var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

        req.session.stime = ISTTime;
        //console.log('req.session.stime',req.session.stime)
        var filename = req.files.template.path;
        req.session.flnm = req.body.fname;
        var sheetNumber = parseInt(req.body.sheet_number);
        var headerRowNumber = parseInt(req.body.header_row_number) - 1;
        req.session.selectedTemplate = req.body.selected_template;
        req.session.merchantId = parseInt(req.body.merchant_id, 10);
        if(sheetNumber) {

            excelParser(filename, sheetNumber, headerRowNumber, req, res);
        }

    });

router.get('/map_columns', function (req, res, next) {
    var selectedTemplate = req.session.selectedTemplate;
    // console.log('selectedTemplate is', req.session.selectedTemplate)
    var excelHeaders = req.session.headers;

    var email = req.session.email;
    var auto;
    var merchantcode = req.session.merchantId;



    var query1 = "select * from t_merchantcolmap where emailId='" + email + "' and template='" + selectedTemplate + "' and merchantcode='" + merchantcode + "';";
    mysql(query1, function (err, result) {
        if(err) {
            console.log(err);
        } else {

            auto = result;
        }
    });
    var excelHeaders = req.session.headers;
    var query = {
        sql: 'call usp_getattribute_rs(?)',
        values: [selectedTemplate]
    };
    mysql(query, function (err, r) {
        if(err) {
            console.log(err);
            res.redirect('/users/upload_template');
        } else {
            var templateHeaders = r[0].map(function (obj) {
                return obj.Attribute;
            });

            req.session.templateHeaders = templateHeaders;
            res.render('users/map_columns', {
                excelHeaders: excelHeaders,
                t: r[0],
                adminUser: auth.isAdmin(req),
                name: req.session.email,
                fname: req.session.name,
                QCUser: auth.isQCUser(req),
                tmp: req.session.selectedTemplate,
                merchantcode: req.session.merchantId,
                autofilldata: auto
            });
        }
    });
});

router.post('/map_columns', function (req, res, next) {
    var originalMapping = util.removeKeysFromObjectWhereValueIs(req.body, '--select');
    var mapping = util.swapKeyValueInObject(originalMapping);
    // console.log("orignal mapping-----", originalMapping, mapping);
    req.session.excelTemplateColumnMapping = originalMapping;
    req.session.templateExcelColumnMapping = mapping;
    req.session.indexOfCategoryColumn = mapping['Category Id'];
    mysql({
        sql: 'call usp_getverticalID(?)',
        values: [req.session.selectedTemplate]
    }, function (e, rv) {
        if(e) {
            console.log(e);
        } else {
            req.session.VerticalID = rv[0][0].VerticalID;
            res.redirect('/users/map_categories');
        }
    });

});

router.get('/map_categories', function (req, res, next) {
    var parsedExcelData = req.session.parsedExcelData;
    var categoryIdColumn = req.session.indexOfCategoryColumn;
    var uniqueCategories = getUniqueCategories(parsedExcelData, categoryIdColumn);
    var selectedTemplate = req.session.selectedTemplate;
    mysql({
            sql: 'call usp_getcategory_rs(?)',
            values: [selectedTemplate]
        },
        function (err, r) {
            if(err) {
                console.log(err);
                res.redirect('/users/map_categories');
            } else {
                var t = [],
                    l2 = {};
                r = r[0].forEach(function (e, i) {
                    var category = e.Category;
                    // console.log(category)
                    if(category) {
                        t.push(category);

                        l2[category.split('(')[0]] = e.CategoryL2;
                    }
                });
                req.session.categoryL2Map = l2;
                //console.log('req.session.categoryL2Map',req.session.categoryL2Map)
                res.render('users/map_categories', {
                    categoriesFromExcel: uniqueCategories,
                    categoriesFromDatabase: t.sort(),
                    adminUser: auth.isAdmin(req),
                    name: req.session.email,
                    fname: req.session.name,
                    QCUser: auth.isQCUser(req)
                });
            }
        });
});

router.post('/map_categories', function (req, res, next) {
    // console.log("jai mata di");
    var categoryNames = {};
    var nameToCode = {};
    for(var key in req.body) {
        //  console.log('categoryNamesreq.body',req.body[key])
        if(req.body[key] != "") {
            var a = req.body[key].split('(');

            categoryNames[key] = a[0];
            nameToCode[a[0]] = a[1].split(')')[0];
        }
    }

    req.session.excelTemplateCategoryMapping = categoryNames;
    // console.log('categoryNames',categoryNames)
    req.session.nameToCode = nameToCode;
    // console.log('nameToCode',nameToCode)

    res.redirect('/users/map_attribute');
});

router.get('/map_attribute', function (req, res) {

    var excelHeaders = req.session.headers;
    var mappedExcelHeaders = Object.keys(req.session.excelTemplateColumnMapping)
        .map(function (x, i) {
            return excelHeaders[x];
        });
    var _attributes = excelHeaders.filter(function (x, i) {
        return mappedExcelHeaders.indexOf(x) == -1;
    });
    var attributes = _attributes.removeDuplicates();
    //      if(attributes.length != 0) {
    //     res.render('users/map_attr', {
    //         headers: attributes,
    //         adminUser: auth.isAdmin(req),
    //         name: req.session.email,
    //         fname: req.session.name,
    //         QCUser: auth.isQCUser(req)
    //     });
    // } else {
    //     req.session.attributes = attributes;
    //     res.redirect('/users/map_false_values');
    // }
       mysql({
        sql: 'call usp_getmerchantAttribut(?)',
        values: [req.session.merchantId]
    }, function (e, rv) {
        if(e) {
            console.log(e);
        } else {
            // console.log(attributes,Object.keys(rv[0][0]),rv[0])
            if(attributes.length != 0) {
        res.render('users/map_attr', {
            headers: attributes,
            merchant:rv[0],
            merchanthead:Object.keys(rv[0][0]),
            adminUser: auth.isAdmin(req),
            name: req.session.email,
            fname: req.session.name,
            QCUser: auth.isQCUser(req)
        });
    } else {
        req.session.attributes = attributes;
        res.redirect('/users/map_false_values');
    }
            
        }
    });
    
});

router.post('/map_attrs', function (req, res) {
    // console.log(req.body)
    var attributes = util.removeKeysFromObjectWhereValueIs(req.body, '');
    // console.log(attributes)
    var attrKeys = Object.keys(attributes);
    for(var key in attributes) {
        var temp = key + 'Input';
        if(attrKeys.indexOf(temp) > -1) {
            attributes[key] = attributes[temp];
        }
    }
    req.session.attributes = attributes;
     aa = util.removeKeysFromObjectWhereValueIs_custome(attributes)
     // console.log('aa',aa)
     req.session.attributes =aa[1]
      req.session.merchant_attributes =aa[0]
    // console.log("jogendra singh djsssssssssssssssss",attributes);
    res.redirect('/users/map_false_values');
});

router.get('/map_false_values', function (req, res, next) {
    var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
    var selectedTemplate = req.session.selectedTemplate;
    var categories = getCategories(excelTemplateCategoryMapping).removeDuplicates();

    req.session.finalCategories = categories;
    //console.log(req.session.finalCategories);
    var parsedExcelData = req.session.parsedExcelData;
    getAllListOfValues({
        categories: categories,
        template: selectedTemplate
    }, function (err, r) {
        if(err) {
            console.log(err);
            res.render('something_went_wrong', {
                message: 'make sure you mapped correct values',
                adminUser: auth.isAdmin(req),
                name: req.session.email,
                fname: req.session.name,
                QCUser: auth.isQCUser(req)
            });
        } else {

            r = generateValidationData(r);

            req.session.validationDataByL2 = generateValidationDataL2(r);
            var w = getWrongValues(r, parsedExcelData);
            res.render('users/false_values', {
                wrongValues: w,
                validValues: r,
                adminUser: auth.isAdmin(req),
                name: req.session.email,
                fname: req.session.name,
                QCUser: auth.isQCUser(req)
            });
        }

        function generateValidationDataL2(r) {
            var categories = Object.keys(r);
            var l2 = req.session.categoryL2Map;
            var l2Validations = {};
            categories.forEach(function (category, index) {
                if(!(l2Validations[l2[category]])) {
                    l2Validations[l2[category]] = r[category];
                }
            });
            return l2Validations;
        }

        function generateValidationData(r) {
            var i = 0,
                result = {};
            var categories = Object.keys(r);
            //console.log('generateValidationData categories',categories)
            categories.forEach(function (category, index) {
                var x;
                result[category] || (result[category] = {});
                x = r[category];
                var columnList = result[category];
                x.forEach(function (row, index) {
                    var columnName = row.ColumnName;
                    var value = row.ListValue;
                    columnList[columnName] || (columnList[columnName] = []);
                    columnList[columnName].push(value);
                });
            });
            //console.log('result of generateValidationData ',result)
            return result;

        }

        function getWrongValues(validJsonValues, parsedExcelData) {
            // console.log('validJsonValues',validJsonValues);
            var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
            var excelTemplateColumnMapping = req.session.excelTemplateColumnMapping;
            var excelColumns = util.getObjectKeys(excelTemplateColumnMapping);
            var categoryIndex = req.session.indexOfCategoryColumn;
            var wrongData = {},
                attributeName, attributes, listOfInvalidValues;
            // console.log('excelTemplateCategoryMapping',excelTemplateCategoryMapping)     
            for(var i = 0; i < parsedExcelData.length; i++) {
                var row = parsedExcelData[i];
                var categoryNameInExcel = row[categoryIndex];
                //console.log('row',row)   

                //console.log('excelTemplateCategoryMapping',excelTemplateCategoryMapping;)     
                var category = excelTemplateCategoryMapping[categoryNameInExcel];


                //console.log('category',category);
                if(typeof category != 'undefined')
                    excelColumns.forEach(function (columnIndex, index) {
                        var cellData = row[columnIndex];
                        if(cellData && (!isValid(cellData, columnIndex))) {
                            wrongData[category] || (wrongData[category] = {});
                            attributeName = excelTemplateColumnMapping[columnIndex];
                            attributes = wrongData[category];
                            attributes[attributeName] || (attributes[attributeName] = {});
                            listOfInvalidValues = attributes[attributeName];
                            listOfInvalidValues[cellData] = true;
                        }
                    });
            }

            return wrongData;

            function isValid(cellData, columnIndex) {
                var validColumnList = validJsonValues[category];
                var attributeName = excelTemplateColumnMapping[columnIndex]
                var listOfValidValues = validColumnList[attributeName];
                if(listOfValidValues && listOfValidValues.length > 0)
                    var list = listOfValidValues.slice(0).map(function (x, i) {
                        return x.toLowerCase();
                    });
                var cellD = cellData.toLowerCase();
                return(list && list.indexOf(cellD) > -1) ? true : false;
            }
        };
    });

    function getCategories(e) {
        var keys = Object.keys(e);
        var categories = [];
        for(var key in e) {
            categories.push(e[key]);
        }
        //console.log("categories of data",categories);
        return categories;
    }
});

router.post('/map_false_values', function (req, res, next) {
    var falseValueMapping = req.body;
    var categories = req.session.finalCategories;
    mysql('select Value from t_columnvalues', function (e, _colorValues) {
        if(e) {
            console.log(e);
        } else {
            mysql('select MappedValue from t_columnvalues', function (e, _colorFilterValues) {
                if(e) {
                    console.log(e);
                } else {
                    mysql('call usp_getdispatchreturntime_rs', function (e, r) {
                        if(e) {
                            console.log(e);
                        } else {
                            var timeByCategory = getReturnTimeAndReturnPolicy(r[0], categories);
                            var merchantId = req.session.merchantId;
                            mysql({
                                sql: 'call usp_getdispatchbymerchant_rs(?)',
                                values: [merchantId]
                            }, function (e, r) {
                                if(e) {
                                    console.log(e)
                                } else {
                                    var selectedTemplate = req.session.selectedTemplate;
                                    var categories = req.session.finalCategories;
                                    var l = req.session.categoryL2Map;
                                    mysql({
                                        sql: 'call usp_getDefaultExpressionByTemplate_rs(?)',
                                        values: [selectedTemplate]
                                    }, function (e, defaultexpr) {
                                        if(e) {
                                            console.log(e);
                                        } else {
                                            var defaultexpr = getDefaultExpression(defaultexpr[0], categories, l);
                                            req.session.defaultexpression = defaultexpr;
                                            //console.log(req.session.defaultexpression);
                                            var dispatchByMerchant = r[0][0]; //[0].DispatchTime;
                                            var atttr = r[1];
                                            var colorValueFilterMap = {};
                                            _colorValues.forEach(function (x, i) {
                                                var key = String(_colorValues[i].Value).toLowerCase();
                                                colorValueFilterMap[key] = _colorFilterValues[i].MappedValue;
                                            });
                                            //console.log('falseValueMapping', req)
                                            req.session.sheetData =
                                                generateFinalData(falseValueMapping,
                                                    req,
                                                    timeByCategory,
                                                    dispatchByMerchant,
                                                    colorValueFilterMap, atttr);
                                            res.redirect('/users/data_sheet');
                                        }
                                    });
                                };
                            });
                        }
                    });
                }
            });
        }
    });
});

// router.get('/spelcheck', function (req, res, next) {
//     var sheetData = req.session.sheetData;
//     var sheetHeaders = req.session.templateHeaders;
//     var fileds = Object.keys(sheetData)
//     console.log('categories', fileds)
//     console.log('headers', sheetHeaders)
//         // console.log('sadsad',sheetData)

//     var newset = {};
//     dictionary(function (err, dict) {
//         if(err) {
//             throw err;
//         }

//         var spell = nspell(dict);


//         for(var i = 0; i < fileds.length; i++) {
//             console.log(fileds[i])
//             var data = sheetData[fileds[i]]

//             newset[fileds[i]] = {};
//             for(var j = 0; j < sheetHeaders.length; j++) {
//                 if(sheetHeaders[j] != 'Category Id' && sheetHeaders[j] != 'MRP'&&sheetHeaders[j] != 'Price') {
//                     newset[fileds[i]][sheetHeaders[j]] = {};
//                     var newr = util.unique(util.getCol(data, j));
//                     if(newr.length>0 &&newr[0]!='')
//                     for(var k = 0; k < newr.length; k++) {
//                         var suggest = spell.suggest(newr[k])
//                             // console.log(newr[k],suggest)
//                             if(suggest.length>0){
//                                 newset[fileds[i]][sheetHeaders[j]][newr[k]] = []
//                         newset[fileds[i]][sheetHeaders[j]][newr[k]] = suggest;
//                             }
                        
//                         // console.log(newset[fileds[i]][sheetHeaders[j]][newr[k]])
//                     }
//                     // console.log(newset[fileds[i]][sheetHeaders[j]],newset[fileds[i]][sheetHeaders[j]].length)
//                     if(JSON.stringify(newset[fileds[i]][sheetHeaders[j]])=='{}'){
//                         delete newset[fileds[i]][sheetHeaders[j]]
//                         // newset[fileds[i]][sheetHeaders[j]]
//                     }
//                 }




//             }
//         }

//         // console.log('newset',newset.Smartphones.Brand.Iphone)
//         // console.log('newset',newset)

//         res.render('users/spelcheck', {
//             data: newset,
//             adminUser: auth.isAdmin(req),
//             name: req.session.email,
//             fname: req.session.name,
//             QCUser: auth.isQCUser(req)
//         });
//     });

//     function toObject(arr) {
//         var rv = {};
//         for(var i = 0; i < arr.length; ++i)
//             rv[i] = arr[i];
//         return rv;
//     }

// });

// router.post('/map_spelcheck', function (req, res, next) {
//     var falseValueMapping = util.removeKeysFromObjectWhereValueIs(req.body, '--select')
//     console.log(falseValueMapping)
//     // var categories = req.session.finalCategories;
    
// });

router.get('/data_sheet', function (req, res, next) {
    var sheetData = req.session.sheetData;
    var sheetHeaders = req.session.templateHeaders;
    var excelHeaders = req.session.headers;
    var validationData = req.session.validationDataByL2;
    var selectedTemplate = req.session.selectedTemplate;
    var attributes = req.session.attributes;
    var merchaattrib=req.session.merchant_attributes;
    // console.log('headers', sheetHeaders)
    // console.log('sadsad', sheetData)
    mysql({
            sql: 'call usp_getattributesbyrule_rs(?,?)',
            values: [selectedTemplate, 'NOT NULL']
        },
        function (e, r) {
            if(e) {
                console.log(e);
            } else {
                var categories = req.session.finalCategories;
                var l = req.session.categoryL2Map;
                var notNulls = getNotNulls(r[0], categories, l);
                mysql({
                    sql: 'call usp_getAttributeByExpression(?)',
                    values: [selectedTemplate]
                }, function (e, expr) {
                    if(e) {
                        console.log(err);
                    } else {
                        var expression = getExpression(expr[0], categories, l);
                        // console.log('expression',expression);
                        mysql({
                                sql: 'call usp_getcategorycodebytemplatename_rs(?)',
                                values: [selectedTemplate]
                            },
                            function (err, categoryCode) {
                                if(err) {
                                    console.log(err);
                                    res.render('something_went_wrong', {
                                        message: 'Unable to get category code from database.',
                                        error: err,
                                        adminUser: auth.isAdmin(req),
                                        name: req.session.email,
                                        fname: req.session.name,
                                        QCUser: auth.isQCUser(req)
                                    });
                                } else {
                                    var categoryCodes = {};
                                    categoryCode[0].forEach(function (x, i) {
                                        categoryCodes[x.categoryName] = x.categoryCode;
                                    })
                                    var attributeKeys = Object.keys(attributes);
                                    var merchaattributeKeys = Object.keys(merchaattrib);
                                    // console.log(attributeKeys,merchaattributeKeys)
                                    mysql({
                                            sql: 'call usp_getattributebytemplatename_rs(?)',
                                            values: [selectedTemplate]
                                        },
                                        function (_err, _result) {
                                            if(_err) {
                                                console.log(_err);
                                                res.render('something_went_wrong', {
                                                    message: 'Unable to get category code from database.',
                                                    error: err,
                                                    adminUser: auth.isAdmin(req),
                                                    name: req.session.email,
                                                    fname: req.session.name,
                                                    QCUser: auth.isQCUser(req)
                                                });
                                            } else {
                                                var merchid = req.session.merchantId;
                                                mysql({
                                                    sql: 'call usp_gerbrandbymerchant_rs(?)',
                                                    values: [merchid]
                                                }, function (e, brand) {
                                                    if(e) {
                                                        //  console.log(e);
                                                    } else {
                                                        var brands = getBrands(brand[0]);
                                                        // console.log('brands',brands);
                                                        var attrsFromDb = _result[0].map(function (obj, objIndex) {
                                                            return obj.attributeName;
                                                        });
                                                        //console.log("datasg@@@@"+Object.keys(sheetData));
                                                        // console.log( 'sheetHeaders---',sheetHeaders,
                                                        //    'attributeKeys---', sheetHeaders.concat(attributeKeys),
                                                        //     'validationData---', validationData,
                                                        //    'notNulls--', notNulls,
                                                        //     'attributes--', attributes,
                                                        //     'categoryCodes--',categoryCodes,
                                                        //     'attrsFromDb--', attrsFromDb)
                                                        // console.log("datasg@@@@" + sheetHeaders.concat(attributeKeys));
                                                        res.render('users/data_sheet', {
                                                            sheetData: sheetData,
                                                            sheetHeaders: sheetHeaders.concat(attributeKeys).concat(merchaattributeKeys),
                                                            validationData: validationData,
                                                            notNulls: notNulls,
                                                            attributes: attributes,
                                                            merchant_attributes:merchaattrib,
                                                            categoryCodes: categoryCodes,
                                                            attributesFromDatabase: attrsFromDb,
                                                            flnam: req.session.flnm,
                                                            uid: req.session.uid,
                                                            adminUser: auth.isAdmin(req),
                                                            name: req.session.email,
                                                            fname: req.session.name,
                                                            expression: expression,
                                                            QCUser: auth.isQCUser(req),
                                                            brands: brands,
                                                            imagepath: req.session.imagepath,
                                                            nameToCode: req.session.nameToCode,
                                                            merchantId: req.session.merchantId,
                                                            categories1: req.session.finalCategories,

                                                        });
                                                    }
                                                });
                                            }
                                        });
                                }
                            });
                    }
                });

            }
        });
});

router.get('/logout', function (req, res, next) {
    req.app.locals.emails = req.app.locals.emails.filter(function (el) {
        if(el.uid == req.session.email) {
            return false
        } else {
            return true
        };
    });
    // console.log(req.session.uid,req.app.locals.emails )
    req.session.destroy();
    res.redirect('/');
});

function getBrands(x) {
    var temp = {};
    x.forEach(function (elem, index) {
        temp['Brands'] || (temp['Brands'] = []);
        var index = temp['Brands'].indexOf(elem.Brand);
        if(index == -1) {
            temp['Brands'].push(elem.Brand);
        }
    });
    return temp;
}

function getDefaultExpression(x, categories, l) {
    var temp = {};
    var nm = ''
    var cat = '';
    var L2s = categories.map(function (category, index) {
        return l[category];
    });
    x.forEach(function (elem, index) {
        if(L2s.indexOf(elem.Categoryname) > -1) {
            nm = elem.Name;
            x.forEach(function (elem, index) {
                if(elem.Name == nm) {
                    temp[nm] || (temp[nm] = []);
                    if(temp[nm].indexOf(elem.Expression) == -1) {
                        temp[nm].push(elem.Expression);
                    }
                }
            });
        }
    });
    return temp;
}

function getExpression(x, categories, l) {
    // console.log('getExpression', x,categories, l)
    var temp = {};
    var nm = ''
    var cat = '';
    var L2s = categories.map(function (category, index) {
        return l[category];
    });
    // console.log('L2s',L2s)
    x.forEach(function (elem, index) {
        if(L2s.indexOf(elem.Categoryname) > -1) {
            nm = elem.Name;
            nm1 = elem.Categoryname;
            x.forEach(function (elem, index) {
                if(elem.Name == nm && nm1 == elem.Categoryname) {
                    temp[nm] || (temp[nm] = []);
                    if(temp[nm].indexOf(elem.Expression) == -1) {
                        temp[nm].push(elem.Expression);
                    }
                }
            });
        }
    });
    // console.log('temp',temp)
    return temp;
}

function getNotNulls(x, categories, l) {
    var temp = {};
    var L2s = categories.map(function (category, index) {
        return l[category];
    });
    x.forEach(function (elem, index) {
        if(L2s.indexOf(elem.Categoryname) > -1) {
            if(elem.Categoryname && elem.Categoryname) {
                temp[elem.Categoryname] || (temp[elem.Categoryname] = []);
                temp[elem.Categoryname].push(elem.Name);
            }
        }
    });
    return temp;
}

router.post('/add_log', function (req, res, next) {
    //console.log(req.session.selectedTemplate);
    // console.log('req.body.ftyp',req.body.ftype)
    if(req.body.ftype == 1) {
        var temp = req.session.selectedTemplate;
        var type = 1;
    } else {
        var temp = "----";
        var type = 2;
    }
    var query = {
        sql: 'call usp_addlog_nr(?,?,?,?,?,?,?,?)',
        values: [req.body.userid, req.body.flname, req.body.totaldata, req.body.error, req.body.correct, temp, type, req.session.stime]
    }
    mysql(query, function (err, result) {
        if(err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});

function excelParser(filename, sheetNumber, headerRowNumber, req, res) {
    var headers, parsedExcelData;


    require('excel-parser').parse({
        inFile: filename,
        worksheet: sheetNumber
    }, function (err, result) {
        if(err) {
            console.error(err);
            res.render('/something_went_wrong', {
                message: 'An error occured! Make sure the entries entered/mapped are correct. Also make sure while *counting sheet number* you had all the sheets unhidden in excel and you counted it correctly.',
                error: err,
                adminUser: auth.isAdmin(req),
                name: req.session.email,
                fname: req.session.name,
                QCUser: auth.isQCUser(req)
            });
        } else {
            headers = result[headerRowNumber]
            parsedExcelData = result.slice(headerRowNumber + 1);
            req.session.headers = headers;
            req.session.parsedExcelData = parsedExcelData;
            // console.log('excel data*******************');
            //console.log(parsedExcelData);
            // console.log('redirect')
            // res.json({'flag':1})
            res.redirect('/users/map_columns');
        }
    });
}

function getUniqueCategories(data, columnNumber) {
    var categories = [];
    data.forEach(function (d) {
        categories.push(d[columnNumber]);
    });

    var uniqueCategories = categories.removeDuplicates();
    return uniqueCategories;
}

function getAllListOfValues(obj, cb) {
    var categories = obj.categories;
    var template = obj.template;
    var counter = categories.length;
    var errored = false;
    var listOfValues = {};
    categories.forEach(function (category, index) {
        mysql({
            sql: 'call usp_getlov_rs(?, ?)',
            values: [template, category]
        }, function (err, r) {
            if(errored) return;
            if(err) {
                errored = true;
                return cb(err);
            }
            listOfValues[category] = r[0];

            if(--counter == 0) {
                cb(null, listOfValues);
            }
        });
    });
}

function generateFinalData(falseValueMapping,
    req,
    timeByCategory,
    dispatchByMerchant,
    colorValueFilterMap, atttr) {
    var l2 = req.session.categoryL2Map;
    //console.log(l2);
    var data = req.session.parsedExcelData;

    var dataSheetData = {};
    var attributeKeys = Object.keys(req.session.attributes)
        .filter(function (x, i) {
            return x.substring(x.length - 5, x.length) != 'Input';
        });
console.log('attributeKeys',attributeKeys)
    var merchantatt= Object.keys(req.session.merchant_attributes)
        .filter(function (x, i) {
            return x.substring(x.length - 5, x.length) != 'Input';
        });
      // console.log('merchantatt',merchantatt)
    var excelHeaders = req.session.headers;
    var templateColumns = req.session.templateHeaders;
    var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
    //console.log("genrat");
    //console.log(excelTemplateCategoryMapping);
    var templateExcelColumnMapping = req.session.templateExcelColumnMapping;
    var mappedColumns = Object.keys(templateExcelColumnMapping);
    var categoryIdColumnNumber = req.session.indexOfCategoryColumn;
    var falseValueKeys = Object.keys(falseValueMapping);
    //console.log("false*********************************");
    //console.log(falseValueMapping,falseValueKeys);
    var merchantId = req.session.merchantId;
    data.forEach(function (row, dataIndex) {

        if(attributeKeys.length > 0) {
            var dataRow = new Array(templateColumns.length + attributeKeys.length+merchantatt.length);
        } else {
            var dataRow = new Array(templateColumns.length);
        }
        // console.log('length',templateColumns.length + attributeKeys.length+merchantatt.length,dataRow.length)
        var categoryId = row[categoryIdColumnNumber];
        var _categoryId = excelTemplateCategoryMapping[categoryId];
        var colorIndex;
        var price = row[templateExcelColumnMapping['Price']];
        if(templateColumns.indexOf('Color') > -1) {
            colorIndex = templateExcelColumnMapping['Color'];
        }
        var colorValuesLower = Object.keys(colorValueFilterMap).map(function (x, i) {
            return String(x).toLowerCase();
        });
        templateColumns.forEach(function (t, i) {
            dataRow[i] = createFinalCell(categoryId,
                _categoryId,
                dataRow,
                row,
                t,
                colorValueFilterMap,
                colorIndex,
                colorValuesLower, price, excelHeaders, atttr);

        });
        if(attributeKeys.length > 0) {
            var len = templateColumns.length;
            attributeKeys.forEach(function (x, i) {
                dataRow[len + i] = row[excelHeaders.indexOf(x)];
            });
        }

        if(merchantatt.length > 0) {
            var len = templateColumns.length+attributeKeys.length;
            merchantatt.forEach(function (x, i) {
                // console.log(x, i,req.session.merchant_attributes,req.session.merchant_attributes[x])
                dataRow[len + i] = req.session.merchant_attributes[x];
            });
        }
        // console.log(dataRow)
        categoryId = excelTemplateCategoryMapping[categoryId];
        if(l2[categoryId]) {
            dataSheetData[l2[categoryId]] || (dataSheetData[l2[categoryId]] = []);
            dataSheetData[l2[categoryId]].push(dataRow);

        }
    });
    // console.log("jks data",dataSheetData);
    return dataSheetData;

    function createFinalCell(categoryId,
        _categoryId,
        dataRow,
        row,
        t,
        colorValueFilterMap,
        colorIndex,
        colorValuesLower, price, excelHeaders, atttr) {
        var excelmapping = req.session.templateExcelColumnMapping;
        var changedValue;
        var cellValue = row[templateExcelColumnMapping[t]];
        var falseValueKey = _categoryId + t + cellValue;
        var defaultexpression = req.session.defaultexpression;
        var expr = Object.keys(defaultexpression);

        if(expr.indexOf(t) > -1) {

            var finals = 0;
            var ind;
            var validation1 = defaultexpression[t];
            validation1.forEach(function (valid) {
                var validation = valid;
                var columns = validation.split(/[^A-Za-z]/)
                    .filter(function (x) {
                        return x.length > 0;
                    });
                var changedValidation = valid;
                var columnIndexes = [];
                if(columns.indexOf('max') > -1 || columns.indexOf('min') > -1 || columns.indexOf('round') > -1) {
                    ind = columns.indexOf('max');
                    columns.splice(ind, 1);
                    ind = columns.indexOf('min');
                    columns.splice(ind, 1);
                    ind = columns.indexOf('round');
                    columns.splice(ind, 1);
                }
                columns.forEach(function (column) {
                    var columnIndex = excelmapping[column];
                    columnIndexes.push(columnIndex);
                    if(!!row[columnIndex] != false && row[columnIndex] != /^([^\s])/ && !(/^[a-zA-Z]+$/.test(row[columnIndex]) && columnIndex != -1)) {
                        changedValidation = changedValidation.replace(column, row[columnIndex]);
                    } else {
                        changedValidation = "";
                    }
                });
                if(changedValidation != '') {
                    var final1 = math.eval(changedValidation);
                    changedValue = final1;
                }
            });
        } else if(t == 'Status') {
            changedValue = 'Active';
        } else if(t == 'Merchant Id') {
            changedValue = merchantId;
        } else if(t == 'Managed By Paytm') {
            changedValue = 'Yes';
        }
        /*else if (t == 'Max. Dispatch Time') {
                   //changedValue = dispatchByMerchant ? dispatchByMerchant : '';
                  //console.log('changedValue',atttr);
                    //console.log(dispatchByMerchant);
               }*/
        else if(t == 'Max Return Time') {
            changedValue = timeByCategory[_categoryId] ?
                timeByCategory[_categoryId].returnTime : '';
        } else if(t == 'Return Policy Id') {
            changedValue = timeByCategory[_categoryId] ?
                timeByCategory[_categoryId].returnPolicyId : '';
        } else if(t == 'Vertical Id') {
            changedValue = req.session.VerticalID;
        } else if(t == 'Category Id') {
            changedValue = excelTemplateCategoryMapping[cellValue];
        } else if(t == 'Description') {

            changedValue = typeof (cellValue) == 'undefined' ? '' : cellValue.replace(/\t+/g, " ");
            changedValue = typeof (changedValue) == 'undefined' ? '' : changedValue.replace(/(\r\n|\n|\r)/gm, " ");
            changedValue = sentenceCase(changedValue);

        } else if(t == 'Product Name') {

            changedValue = typeof (cellValue) == 'undefined' ? '' : cellValue.replace(/\t+/g, " ");
            changedValue = typeof (changedValue) == 'undefined' ? '' : changedValue.replace(/(\r\n|\n|\r)/gm, " ");

        } else if(t == 'Color Filter') {
            var colorVal = String(row[colorIndex]).toLowerCase();
            if(colorVal && colorVal != '' &&
                colorValuesLower.indexOf(colorVal) > -1) {
                changedValue = colorValueFilterMap[colorVal];
            } else {
                changedValue = '';
            }
        } else if(t == 'Product Weight') {

            if(cellValue != '' && typeof (cellValue) != undefined) {
                changedValue = parseFloat(cellValue)
            } else {
                changedValue = cellValue
            }
            //console.log(t,cellValue,changedValue)
        } else if(mappedColumns.indexOf(t) > -1) {
            if(falseValueKeys.indexOf(falseValueKey) > -1) {
                changedValue = (falseValueMapping[falseValueKey] == '--ignore') ? cellValue : falseValueMapping[falseValueKey];
                if(t == 'Material') {
                    changedValue = sentenceCase(changedValue.toLowerCase());
                    //console.log(changedValue);
                }
            } else {
                changedValue = cellValue;
            }
        } else {
            changedValue = '';
        }
        if(t == 'Material') {
            changedValue = sentenceCase(changedValue.toLowerCase());
            //console.log(changedValue);
        }
        for(var i = 0; i < atttr.length; i++) {
            if(t == atttr[i].Name) {
                var makestr = 'attr' + atttr[i].attrId
                changedValue = dispatchByMerchant[makestr];
            }
        }
        return changedValue;
    }
}

function sentenceCase(string) {
    var n = string.split(".");
    var vfinal = ""
    for(i = 0; i < n.length; i++) {
        var spaceput = ""
        var spaceCount = n[i].replace(/^(\s*).*$/, "$1").length;
        n[i] = n[i].replace(/^\s+/, "");
        var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
        for(j = 0; j < spaceCount; j++)
            spaceput = spaceput + " ";
        vfinal = vfinal + spaceput + newstring + ".";
    }
    vfinal = vfinal.substring(0, vfinal.length - 1);
    // console.log(vfinal);
    return(vfinal);
}

function getReturnTimeAndReturnPolicy(x, categories) {
    var timeByCategory = {};
    x.forEach(function (row, index) {
        if(categories.indexOf(row.Category) > -1) {
            timeByCategory[row.Category] = {
                returnTime: row.return_time,
                returnPolicyId: row.Returnpolicyid
            }
        }
    })
    return timeByCategory;
}

Array.prototype.removeDuplicates = function removeDuplicates() {
    var temp = new Array();
    var x = this.slice(0).sort();
    for(i = 0; i < this.length; i++) {
        if(x[i] == x[i + 1]) {
            continue
        }
        temp[temp.length] = x[i];
    }
    return temp;
}

router.get('/getFiles', function (req, res, next) {

    var query = require('url').parse(req.url, true).query;

    var imgfolderpath = query.path;
    var pic1 = imgfolderpath.split('/');
    var pic = pic1[pic1.length - 1];
    if(pic.indexOf('@') == 0) {
        pic = pic.slice(1);
    }
    //var imgfolderpath = path.join(__dirname, '../public' + imgfolderpath);
    req.sessionimagefolderpath = imgfolderpath;

    dir1 = imgfolderpath.split('/@');
    imgpath = dir1[0] + "/" + pic;
    //console.log("imgpath",imgpath);
    fs.readFile(imgpath, function (err, data) {
        if(data != undefined) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write('<img height="300" width="570" src="data:image/jpeg;base64,')
            res.write(new Buffer(data).toString('base64'));
            res.end('"/>');
        } else {
            res.json('Image path invalid');
        }
    });

});

function createfolder(imagepath, callback) {
    var fileName = [];
    fileName = getFiles1(imagepath);
    // console.log("sadsad",fileName[0]);

    uploadimage = './public/Link to ImageSrc/jssp';
    if(!fs.existsSync(uploadimage)) {
        fs.mkdirSync(uploadimage);
    }
    for(var i = 0; i < fileName.length; i++) {
        // console.log("sadsadlenth",fileName[i]);
        var filename1 = fileName[i].split("/");
        var len = filename1.length - 1;
        fs.readFile('/' + fileName[i], function (err, data) {
            if(err) throw err;
            fs.writeFile(uploadimage + "/" + filename1[len], data, function (err) {
                if(err) throw err;
                // console.log('It\'s saved!');
            });
        });
    }
}

function getImages(imageDir, callback) {
    var fileType = '.jpg',
        files = [],
        i;
    fs.readdir(imageDir, function (err, list) {
        for(i = 0; i < list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]);
                //store the file name into the array files
                // console.log(file[i]);
            }
        }
        callback(err, files);
    });
}

function getFiles1(dir) {
    fileList = [];
    var files = readDir.readSync('/' + dir);
    //console.log('show img in folder1',files);
    for(var i in files) {
        if(!files.hasOwnProperty(i)) continue;
        var name = '/' + dir + '/' + files[i];
        //console.log('show img in folderccccc1',name);
        if(!fs.statSync(name).isDirectory()) {
            fileList.push(name);
        }
    }
    //console.log('show img in folder',fileList);
    return fileList;
}

function getFiles(dir) {
    fileList = [];
    var files = fs.readdirSync(dir);
    for(var i in files) {
        if(!files.hasOwnProperty(i)) continue;
        var name = dir + '/' + files[i];
        if(!fs.statSync(name).isDirectory()) {
            fileList.push(name);
        }
    }
    return fileList;
}

router.post('/getfolderFiles', function (req, res, next) {
    var query = require('url').parse(req.url, true).query;
    var imgfolderpath = req.body.path;
    var sespath = '';
    if(req.body.flag != 1) {
        sespath = req.session.imagepath;
    } else {
        sespath = ''
    }
    var imgfolderpath = path.resolve('./public/Link to ImageSrc/' + sespath + '/' + imgfolderpath + '/');
    var images = getFiles(imgfolderpath);
    // console.log('imgfolderpath', imgfolderpath)
    //console.log('images', images)
    res.json(images);
});



router.post('/checkMerchat', function (req, res, next) {
    var query = {
            sql: 'call usp_checkMerchant_rs(?)',
            values: [req.body.id]
        }
        //console.log(query)
    mysql(query, function (e, r) {
        if(e) {
            console.log(e);
        } else {
            //console.log('usp_checkMerchant_rs',r[0])
            res.json(r[0]);
        }
    });
});


/*-----manu code------*/
router.post('/user_merchant_attributemapp', function (req, res, next) {
    var query = {
        sql: 'call usp_user_merchant_attributemapp(?,?,?,?)',
        values: [
            req.body.email,
            req.body.template,
            req.body.merchantCode,
            req.body.mermap
        ]
    }
    mysql(query, function (e, r) {
        if(e) {
            console.log(e);
        } else {
            // console.log('usp_user_merchant_attributemapp',r)
            // res.json(r[0]);
        }
    });
});

module.exports = router;