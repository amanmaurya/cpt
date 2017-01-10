var express = require('express');
var router = express.Router();
var busboy = require('connect-busboy');
var parse = require('csv-parse');
var fs = require('fs');
var form = require('reformed');
var auth = require('../lib/auth');
var mysql = require('../lib/mysql.js');
var util = require('../lib/util.js');
var math = require('mathjs');
var Converter = require("csvtojson").Converter;
var path = require('path');
var findKey = require('lodash.findkey');
var _ = require('underscore');


router.use(function(req, res, next) {
    var role = req.session.role;
    if (auth.isUserValidated(req)&&req.session!=undefined) {
        if ((auth.isAdmin(req) || auth.isQCUser(req)) && auth.isAdmin(req))
            next();
        else
            res.redirect('/');
    } else {
        res.redirect('/');
    }
});

router.get('/', function(req, res, next) {
    res.render('qc/upload', {
        name: req.session.email,fname:req.session.name,
        adminUser: auth.isAdmin(req),
        msg: 0
    });
});

router.post('/upload', busboy(), form({
    processedFile: {
        filename: true,
        required: true
    },
    merchantFile: {
        filename: true,
        required: true
    },
    sheetNumber: {
        required: true
    },
    headerNumber: {
        required: true
    }
}), function(req, res) {
    //console.log("hgsfsaghf dhsafdhgsad dhfshgdsad dhggfsahd hdfsdsad ");

    if (req.body.image_path == undefined) {
        req.session.qcimagepath = '';
    } else {
        req.session.qcimagepath = req.body.image_path;
    }
    var d = new Date();
    var currentTime = new Date();

        var currentOffset = currentTime.getTimezoneOffset();

        var ISTOffset = 330;   // IST offset UTC +5:30 

        var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);

    req.session.stime=d.toUTCString();
    req.session.flnm = req.body.fname;
    var processedFile = req.files.processedFile.path;
    var merchantFile = req.files.merchantFile.path;
   //console.log("csv file path:---------",processedFile);

//        var converter = new Converter({delimiter: "auto"});
//     var filepath1=path.join(__dirname,"../public/images/hard.csv");
//     console.log("csv file path:---------",filepath1);
//       converter.fromFile(processedFile,function(err,result){
//         console.log("csv error",err);
//             console.log("csv file path:---------",result);
// });

    /*var processedParser = parse({
        // delimiter: ";"
        auto_parse: true, // Ensures that numeric values remain numeric
    columns: true,
    delimiter: ';',
   // quote: '',
    relax: true,
   // rowDelimiter: '\n', // This is an issue, I had to set the \n here as 'auto' wasn't working, nor was 'windows'.  Maybe look at auto-detecting line endings?
    //skip_empty_lines: true
    }, function(err, processedData) {
        //console.log("csv result orig",processedData);
        /*  var amit = [];
          for(each in processedData){
            var ret = {};
              for(var key in each){
                ret[each[key]] = key;
              }
              amit.push(ret);
          }
         console.log("amit",amit); */
          // function swap(json){
          //     var ret = {};
          //     for(var key in json){
          //       ret[json[key]] = key;
          //     }
          //     return ret;
          //   }

        //console.log("csv result",amit);
var sheetNumber1 = parseInt(req.body.sheetNumber);
var csvheaderRowNumber = parseInt(req.body.headerNumber) - 1;
          require('excel-parser').parse({
        inFile: processedFile,
        worksheet: sheetNumber1
        }, function(err, result) {
      
           
            //res.redirect('/qc/compare');

        
   
        if (err) {
           console.log("csv",err);
            return res.status(200).json({
                message: 'Provided csv file is not loadable please check if its correct'

            });
           
        }

         headers = result[0];

            parsedcsvlData = result.slice(csvheaderRowNumber+1);
           // req.session.qcExcelHeaders = headers;
           // req.session.qcParsedExcelData = parsedExcelData;

         req.session.csvHeader = headers;
        // console.log("polestar",processedData[0]);
        req.session.headers = headers;
        console.log("error se bahar 1",headers);
            //console.log('req.session.csvHeader', req.session.csvHeader)
        // if (processedData[0].indexOf('Category Id 1') == -1) {
        //     res.render('qc/upload', {
        //         name: req.session.email,fname:req.session.name,
        //         adminUser: auth.isAdmin(req),
        //         msg: 1
        //     });
        // } else {
             // console.log("else 1");

      
             // console.log("header arry",csvmainheader);
            // req.session.csvHeader =csvmainheader;
            req.session.qcParsedCSVData = parsedcsvlData;    //.slice(1);                        //processedData.slice(1);
             //console.log("sshshshshshhshshs",req.session.qcParsedCSVData);


function findKey(obj, value){
    var key;

    _.each(_.keys(obj), function(k){
      var v = obj[k];
      if (v === value){
        key = k;
      }
    });

    return key;
}
            var indexMerchant = findKey(req.session.csvHeader,"Merchant Id");    //                processedData[0].indexOf('Merchant Id');
           // var indexMerchant = 56;
            req.session.qcmerchantID = req.session.qcParsedCSVData[0][indexMerchant];
            req.session.merchantId = req.session.qcParsedCSVData[0][indexMerchant];
            //console.log("fsehhdfshgfjajajajajheader",indexMerchant);
           // var indexCategoryID = processedData[0].indexOf('Category Id 1');
           var amit1 =findKey(req.session.csvHeader,"Category Id 1");
           var category1 = req.session.qcParsedCSVData[1][""+amit1+""];
           //console.log("fsehhdfshgfjajajajaj",amit1,req.session.csvHeader,category1);
          // console.log("fsehhdfshgfjajajajaj",category1);
           var indexCategoryID =category1;
            //var category1 = req.session.qcParsedCSVData[0][indexCategoryID];
           // var category1 = 5030;
            var query = {
                sql: 'call usp_getemplateByCat_rs(?)',
                values: [category1]
            };
            mysql(query, function(err, r) {
                // console.log("2");
                if (err) {
                    console.log(err);
                    res.redirect('/qc/upload');
                } else {

                   console.log("else 2",r);

                    req.session.selectedTemplate = r[0][0].Template;
                     //console.log("jksssjksss",r[0][0].Template)
                    req.session.indexCategoryID = indexCategoryID;
                    req.session.qcParsedCSVData[0][indexCategoryID];
                  //  console.log("jkrsssss",indexMerchant,merchantID)
                    // var categoryID=
                    if (parsedcsvlData.length > 0)
                        var categoryID = parsedcsvlData.slice(1).map(function(x, i) {
                            return x[indexCategoryID];
                        });
                    //console.log('categoryID', categoryID);
                    var sheetNumber = parseInt(req.body.sheetNumber, 10);
                    var headerRowNumber = parseInt(req.body.headerNumber) - 1;
                    map_clumn(req, res);
                    excelParser(merchantFile, sheetNumber, headerRowNumber, req, res);
                    // res.redirect('/qc/compare11');

                }
            });

        // }
    });
    //fs.createReadStream(processedFile).pipe(processedParser);
});

router.get('/compare_files', function(req, res, next) {
    res.send('Reached!!!!');
});

function excelParser(filename, sheetNumber, headerRowNumber, req, res) {
    var headers, parsedExcelData;
    require('excel-parser').parse({
        inFile: filename,
        worksheet: sheetNumber
    }, function(err, result) {
        if (err) {
            console.error(err);
            res.send(err);
        } else {
            headers = result[headerRowNumber];

            parsedExcelData = result.slice(headerRowNumber + 1);
            req.session.qcExcelHeaders = headers;
            req.session.qcParsedExcelData = parsedExcelData;
            //res.redirect('/qc/compare');

        }
    });
}


router.get('/compare11', function(req, res) {


    res.render('qc/compare', {
        csvHeader: req.session.csvHeader,
        csvData: req.session.qcParsedCSVData,
        excelHeader: req.session.qcExcelHeaders,
        excelData: req.session.qcParsedExcelData,
        name: req.session.email,fname:req.session.name,
        adminUser: auth.isAdmin(req),
        qcimagepath: req.session.qcimagepath,
        merchantID: req.session.qcmerchantID
    });
});

function map_clumn(req, res) {
    var selectedTemplate = req.session.selectedTemplate;
    var excelHeaders = req.session.headers;
    var query = {
        sql: 'call usp_getattribute_rs(?)',
        values: [selectedTemplate]
    };
    mysql(query, function(err, r) {
        if (err) {
            console.log(err);
            res.redirect('/qc/upload');
        } else {
            var templateHeaders = r[0].map(function(obj) {
                return obj.Attribute;
            });
            var csvHeaders = req.session.csvHeader;
           // console.log('csvHeaders',templateHeaders)
            // console.log('csvHeaders',csvHeaders)
            var originalMapping = {};
            for (var i = 0; i < templateHeaders.length; i++) {

                var index = templateHeaders.indexOf(csvHeaders[i]);

                if (index > -1) {
                    originalMapping[i] = templateHeaders[index];
                } else if (csvHeaders[i] == 'Category Id 1') {
                    var index1 = templateHeaders.indexOf('Category Id');
                    originalMapping[i] = templateHeaders[index1];
                }
            }
           // console.log('jsonObj',originalMapping)
            var mapping = util.swapKeyValueInObject(originalMapping);
            req.session.excelTemplateColumnMapping = originalMapping;
            req.session.templateExcelColumnMapping = mapping;
            req.session.indexOfCategoryColumn = mapping['Category Id'];
            req.session.templateHeaders = templateHeaders;
            //console.log('mapping',mapping)
            //console.log(req.session.indexOfCategoryColumn, req.session.excelTemplateColumnMapping, req.session.templateExcelColumnMapping)
            mysql({
                sql: 'call usp_getverticalID(?)',
                values: [req.session.selectedTemplate]
            }, function(e, rv) {
                if (e) {
                    console.log(e);
                } else {
                    req.session.VerticalID = rv[0][0].VerticalID;
                 // console.log("map column sadfasfsdafsdasfag");
                    setTimeout(function() {
                        map_categories(req, res);
                    }, 2000);

                }
            });




        }
    });

}

function map_categories(req, res) {
    
    var parsedExcelData = req.session.qcParsedCSVData;
    var categoryIdColumn = req.session.indexOfCategoryColumn;
    var uniqueCategories = getUniqueCategories(parsedExcelData, categoryIdColumn);
    var selectedTemplate = req.session.selectedTemplate;
   // console.log("categoryIdColumn",categoryIdColumn);
    mysql({
            sql: 'call usp_getcategory_rs(?)',
            values: [selectedTemplate]
        },
        function(err, r1) {
            if (err) {

                console.log(err);
                res.redirect('/qc/map_categories');

            } else {
                //  console.log("map categries else 1 shgdsdsa");
                // console.log('rrrrrrr',r[0].length,r);

                var t = [],
                    l2 = {};
                var r = r1[0].forEach(function(e, i) {
                    var category = e.Category;
                     //console.log("catagriesssssssssss",category)
                    if (category) {
                        t.push(category);

                        l2[category.split('(')[0]] = e.CategoryL2;
                    }
                  
                });
                req.session.categoryL2Map = l2;
                //console.log('l2',l2)
                var categoryNames = {};
                var nameToCode = {};
                for (var i = 0; i < uniqueCategories.length; i++) {
                    //console.log('r[0]',r[0])
                    for (var k = 0; k < r1[0].length; k++) {
                        if (r1[0][k].CategoryCode == uniqueCategories[i]) {

                            categoryNames[r1[0][k].Category.split('(')[0]] = r1[0][k].Category.split('(')[0];
                            nameToCode[r1[0][k].Category.split('(')[0]] = uniqueCategories[i];
                        }
                    };

                }
                //console.log("map categries shgdsdsa after for");
                req.session.excelTemplateCategoryMapping = categoryNames;
                req.session.nameToCode = nameToCode;
                req.session.attributes = {};
                 //console.log('categoryNames',categoryNames);
                 //console.log("map categries shgdsdsa ummmmmmmmmmmmm",uniqueCategories);
                return res.redirect('/qc/map_false_values');
               // res.render('users/map_categories', {categoriesFromExcel: uniqueCategories, categoriesFromDatabase: t.sort(),adminUser: auth.isAdmin(req),name:req.session.email,QCUser: auth.isQCUser(req)});
            }
        });
}




router.get('/map_false_values', function(req, res, next) {
   // console.log("jai mata di  map false value");
    var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
    var selectedTemplate = req.session.selectedTemplate;
    var categories = getCategories(excelTemplateCategoryMapping).removeDuplicates();

    req.session.finalCategories = categories;
   // console.log("final template",req.session.finalCategories);
    var parsedExcelData = req.session.qcParsedCSVData;
    getAllListOfValues({
        categories: categories,
        template: selectedTemplate
    }, function(err, r) {
        if (err) {
            console.log(err);
            res.render('something_went_wrong', {
                message: 'make sure you mapped correct values',
                adminUser: auth.isAdmin(req),
                name: req.session.email,fname:req.session.name,
                QCUser: auth.isQCUser(req)
            });
        } else {
            console.log("in elese in  mapfalse value");
            r = generateValidationData(r);

            req.session.validationDataByL2 = generateValidationDataL2(r);
            var w = getWrongValues(r, parsedExcelData);
            res.render('qc/false_values', {
                wrongValues: w,
                validValues: r,
                adminUser: auth.isAdmin(req),
                name: req.session.email,fname:req.session.name,
                QCUser: auth.isQCUser(req)
            });
        }

        function generateValidationDataL2(r) {
            var categories = Object.keys(r);
            var l2 = req.session.categoryL2Map;
            var l2Validations = {};
            categories.forEach(function(category, index) {
                if (!(l2Validations[l2[category]])) {
                    l2Validations[l2[category]] = r[category];
                }
            });
            return l2Validations;
        }

        function generateValidationData(r) {
            var i = 0,
                result = {};
            var categories = Object.keys(r);
            categories.forEach(function(category, index) {
                var x;
                result[category] || (result[category] = {});
                x = r[category];
                var columnList = result[category];
                x.forEach(function(row, index) {
                    var columnName = row.ColumnName;
                    var value = row.ListValue;
                    columnList[columnName] || (columnList[columnName] = []);
                    columnList[columnName].push(value);
                });
            });
            return result;
        }

        function getWrongValues(validJsonValues, parsedExcelData) {
            // console.log('validJsonValues',validJsonValues)
            var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
            var nameToCode = req.session.nameToCode;
            var excelTemplateColumnMapping = req.session.excelTemplateColumnMapping;
            var excelColumns = util.getObjectKeys(excelTemplateColumnMapping);
            var categoryIndex = req.session.indexOfCategoryColumn;
            var wrongData = {},
                attributeName, attributes, listOfInvalidValues;

            for (var i = 0; i < parsedExcelData.length; i++) {
                var row = parsedExcelData[i];
                var categoryNameInExcel = row[categoryIndex];
                // console.log('req.session.nameToCode',parsedExcelData.length);
                categoryNameInExcel = getKeyByValue(nameToCode, categoryNameInExcel);
                var category = excelTemplateCategoryMapping[categoryNameInExcel];


                //console.log('categoryNameInExcel',categoryNameInExcel)
                //console.log('excelTemplateCategoryMapping',excelTemplateCategoryMapping)
                excelColumns.forEach(function(columnIndex, index) {
                    var cellData = row[columnIndex];
                    if (cellData && (!isValid(cellData, columnIndex))) {
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
                // console.log('category',category)
                // console.log("cellData",cellData);
                 //console.log('excelTemplateColumnMapping',excelTemplateColumnMapping)
                var validColumnList = validJsonValues[category];
                var attributeName = excelTemplateColumnMapping[columnIndex]
                    //console.log('validColumnList',validColumnList)
                    //console.log('attributeName',attributeName)
                var listOfValidValues = validColumnList[attributeName];
                if (listOfValidValues && listOfValidValues.length > 0)
                    var list = listOfValidValues.slice(0).map(function(x, i) {
                        return x.toLowerCase();
                    });
                var cellD = cellData ;   //.toLowerCase();
                return (list && list.indexOf(cellD) > -1) ? true : false;
            }
        };
    });

    function getCategories(e) {
        var keys = Object.keys(e);
        var categories = [];
        for (var key in e) {
            categories.push(e[key]);
        }
        return categories;
    }
});

router.post('/map_false_values', function(req, res, next) {
    var falseValueMapping = req.body;
    var categories = req.session.finalCategories;
    mysql('select Value from t_columnvalues', function(e, _colorValues) {
        if (e) {
            console.log(e);
        } else {
            mysql('select MappedValue from t_columnvalues', function(e, _colorFilterValues) {
                if (e) {
                    console.log(e);
                } else {
                    mysql('call usp_getdispatchreturntime_rs', function(e, r) {
                        if (e) {
                            console.log(e);
                        } else {
                            var timeByCategory = getReturnTimeAndReturnPolicy(r[0], categories);
                            var merchantId = req.session.merchantId;
                            mysql({
                                sql: 'call usp_getdispatchbymerchant_rs(?)',
                                values: [merchantId]
                            }, function(e, r) {
                                if (e) {
                                    console.log(e)
                                } else {
                                    var selectedTemplate = req.session.selectedTemplate;
                                    var categories = req.session.finalCategories;
                                    var l = req.session.categoryL2Map;
                                    mysql({
                                        sql: 'call usp_getDefaultExpressionByTemplate_rs(?)',
                                        values: [selectedTemplate]
                                    }, function(e, defaultexpr) {
                                        if (e) {
                                            console.log(e);
                                        } else {
                                            var defaultexpr = getDefaultExpression(defaultexpr[0], categories, l);
                                            req.session.defaultexpression = defaultexpr;
                                            //console.log(req.session.defaultexpression);
                                            var dispatchByMerchant ='12:00' 
                                            //r[0][0].DispatchTime;
                                            var colorValueFilterMap = {};
                                            _colorValues.forEach(function(x, i) {
                                                var key = String(_colorValues[i].Value).toLowerCase();
                                                colorValueFilterMap[key] = _colorFilterValues[i].MappedValue;
                                            });
                                            //console.log('falseValueMapping', falseValueMapping)
                                            req.session.sheetData = generateFinalData(falseValueMapping, req, timeByCategory, dispatchByMerchant, colorValueFilterMap);
                                            res.redirect('/qc/compare');
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



router.get('/compare', function(req, res, next) {
    var sheetData = req.session.sheetData;
    var sheetHeaders = req.session.csvHeader;
    var excelHeaders = req.session.headers;
    var validationData = req.session.validationDataByL2;
    var selectedTemplate = req.session.selectedTemplate;
    var attributes = req.session.attributes;
    mysql({
            sql: 'call usp_getattributesbyrule_rs(?,?)',
            values: [selectedTemplate, 'NOT NULL']
        },
        function(e, r) {
            if (e) {
                console.log(e);
            } else {
                var categories = req.session.finalCategories;
                var l = req.session.categoryL2Map;
                var notNulls = getNotNulls(r[0], categories, l);
                mysql({
                    sql: 'call usp_getAttributeByExpression(?)',
                    values: [selectedTemplate]
                }, function(e, expr) {
                    if (e) {
                        console.log(err);
                    } else {
                        var expression = getExpression(expr[0], categories, l);
                        //console.log(expression);
                        mysql({
                                sql: 'call usp_getcategorycodebytemplatename_rs(?)',
                                values: [selectedTemplate]
                            },
                            function(err, categoryCode) {
                                if (err) {
                                    console.log(err);
                                    res.render('something_went_wrong', {
                                        message: 'Unable to get category code from database.',
                                        error: err,
                                        adminUser: auth.isAdmin(req),
                                        name: req.session.email,fname:req.session.name,
                                        QCUser: auth.isQCUser(req)
                                    });
                                } else {
                                    var categoryCodes = {};
                                    categoryCode[0].forEach(function(x, i) {
                                        categoryCodes[x.categoryName] = x.categoryCode;
                                    })
                                    var attributeKeys = Object.keys(attributes);
                                    mysql({
                                            sql: 'call usp_getattributebytemplatename_rs(?)',
                                            values: [selectedTemplate]
                                        },
                                        function(_err, _result) {
                                            if (_err) {
                                                console.log(_err);
                                                res.render('something_went_wrong', {
                                                    message: 'Unable to get category code from database.',
                                                    error: err,
                                                    adminUser: auth.isAdmin(req),
                                                    name: req.session.email,fname:req.session.name,
                                                    QCUser: auth.isQCUser(req)
                                                });
                                            } else {
                                                var merchid = req.session.merchantId;
                                                mysql({
                                                    sql: 'call usp_gerbrandbymerchant_rs(?)',
                                                    values: [merchid]
                                                }, function(e, brand) {
                                                    if (e) {
                                                        console.log(e);
                                                    } else {
                                                        var brands = getBrands(brand[0]);
                                                        console.log(brands);
                                                        var attrsFromDb = _result[0].map(function(obj, objIndex) {
                                                            return obj.attributeName;
                                                        });
                                                      // console.log("datasg@@@@",req.session.templateHeaders);
                                                        //.log('dataSheetData', sheetData);
                                                        //console.log("compair",attributeKeys)
                                                        res.render('qc/compare', {
                                                            excelHeader: req.session.qcExcelHeaders,
                                                            excelData: req.session.qcParsedExcelData,
                                                            sheetData: sheetData,
                                                            //sheetHeaders: sheetHeaders.concat(attributeKeys),
                                                           sheetHeaders: req.session.templateHeaders,
                                                            validationData: validationData,
                                                            notNulls: notNulls,
                                                            attributes: attributes,
                                                            categoryCodes: categoryCodes,
                                                            attributesFromDatabase: attrsFromDb,
                                                            flnam: req.session.flnm,
                                                            uid: req.session.uid,
                                                            adminUser: auth.isAdmin(req),
                                                            name: req.session.email,fname:req.session.name,
                                                            expression: expression,
                                                            QCUser: auth.isQCUser(req),
                                                            brands: brands,
                                                            imagepath: req.session.qcimagepath,
                                                            nameToCode: req.session.nameToCode,
                                                            merchantId: req.session.merchantId,
                                                            csvHeader: req.session.csvHeader,
                                                            csvData: req.session.qcParsedCSVData,

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



function getBrands(x) {
    var temp = {};
    x.forEach(function(elem, index) {
        temp['Brands'] || (temp['Brands'] = []);
        var index = temp['Brands'].indexOf(elem.Brand);
        if (index == -1) {
            temp['Brands'].push(elem.Brand);
        }
    });
    return temp;
}

function getDefaultExpression(x, categories, l) {
    var temp = {};
    var nm = ''
    var cat = '';
    var L2s = categories.map(function(category, index) {
        return l[category];
    });
    x.forEach(function(elem, index) {
        if (L2s.indexOf(elem.Categoryname) > -1) {
            nm = elem.Name;
            x.forEach(function(elem, index) {
                if (elem.Name == nm) {
                    temp[nm] || (temp[nm] = []);
                    if (temp[nm].indexOf(elem.Expression) == -1) {
                        temp[nm].push(elem.Expression);
                    }
                }
            });
        }
    });
    return temp;
}

function getExpression(x, categories, l) {
    var temp = {};
    var nm = ''
    var cat = '';
    var L2s = categories.map(function(category, index) {
        return l[category];
    });
    x.forEach(function(elem, index) {
        if (L2s.indexOf(elem.Categoryname) > -1) {
            nm = elem.Name;
            x.forEach(function(elem, index) {
                if (elem.Name == nm) {
                    temp[nm] || (temp[nm] = []);
                    if (temp[nm].indexOf(elem.Expression) == -1) {
                        temp[nm].push(elem.Expression);
                    }
                }
            });
        }
    });
    return temp;
}

function getNotNulls(x, categories, l) {
    var temp = {};
    var L2s = categories.map(function(category, index) {
        return l[category];
    });
    x.forEach(function(elem, index) {
        if (L2s.indexOf(elem.Categoryname) > -1) {
            if (elem.Categoryname && elem.Categoryname) {
                temp[elem.Categoryname] || (temp[elem.Categoryname] = []);
                temp[elem.Categoryname].push(elem.Name);
            }
        }
    });
    return temp;
}

router.post('/add_log', function(req, res, next) {
    //console.log(req.session.selectedTemplate);
    var query = {
        sql: 'call usp_addlog_nr(?,?,?,?,?,?)',
        values: [req.body.userid, req.body.flname, req.body.totaldata, req.body.error, req.body.correct, req.session.selectedTemplate]
    }
    mysql(query, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.json(result[0]);
        }
    });
});



function getUniqueCategories(data, columnNumber) {
    var categories = [];
//console.log("hgdsghdsghdjojo",columnNumber);
    data.forEach(function(d) {
        categories.push(d[""+columnNumber+""]);
    });

    var uniqueCategories = categories.removeDuplicates();
 //console.log("unique categories ddddddddd","column",categories);
    return uniqueCategories;
}

function getAllListOfValues(obj, cb) {

    var categories = obj.categories;
    var template = obj.template;
    var counter = categories.length;
    var errored = false;
    var listOfValues = {};
    categories.forEach(function(category, index) {
        mysql({
            sql: 'call usp_getlov_rs(?, ?)',
            values: [template, category]
        }, function(err, r) {
            if (errored) return;
            if (err) {
                errored = true;
                return cb(err);
            }
            listOfValues[category] = r[0];

            if (--counter == 0) {
                cb(null, listOfValues);
            }
        });
    });
}

function generateFinalData(falseValueMapping, req, timeByCategory, dispatchByMerchant, colorValueFilterMap) {
    var l2 = req.session.categoryL2Map;
    //console.log("jaimata di",l2);
    var data = req.session.qcParsedCSVData;

    var dataSheetData = {};
    var attributeKeys = Object.keys(req.session.attributes)
        .filter(function(x, i) {
            return x.substring(x.length - 5, x.length) != 'Input';
        });
    //var excelHeaders = req.session.csvHeader;
     //headers;
       var csvmainheader=[];
        var i=0;     
             Object.keys(req.session.csvHeader).forEach(function(key){
              
              csvmainheader[i]=req.session.csvHeader[""+key+""];
              i++;
                   // <- obj is undefined !!
        });
             var excelHeaders = csvmainheader;
    var templateColumns = csvmainheader;
    var excelTemplateCategoryMapping = req.session.excelTemplateCategoryMapping;
    //console.log("genrat");
    //console.log(excelTemplateCategoryMapping);
    var templateExcelColumnMapping = req.session.templateExcelColumnMapping;
    //console.log('templateExcelColumnMapping', templateExcelColumnMapping)
    var mappedColumns = Object.keys(templateExcelColumnMapping);
    var categoryIdColumnNumber = req.session.indexOfCategoryColumn;
    var falseValueKeys = Object.keys(falseValueMapping);
    //console.log("false*********************************");
    //console.log(falseValueMapping,falseValueKeys);
    var merchantId = req.session.merchantId;
    data.forEach(function(row, dataIndex) {
        if (attributeKeys.length > 0) {
            var dataRow = new Array(templateColumns.length + attributeKeys.length);
        } else {
            var dataRow = new Array(templateColumns.length);
        }
        var categoryId = row[categoryIdColumnNumber];
        categoryId = getKeyByValue(req.session.nameToCode, categoryId)

        var _categoryId = excelTemplateCategoryMapping[categoryId];
        var colorIndex=0;
        var price = row[templateExcelColumnMapping['Price']];
       // console.log("dsadfsadf",templateColumns);
        if (templateColumns.indexOf('Color') > -1) {
            colorIndex = templateExcelColumnMapping['Color'];
        }
        var colorValuesLower = Object.keys(colorValueFilterMap).map(function(x, i) {
            return String(x).toLowerCase();
        });
      //  console.log("temp data column",templateColumns); 
        templateColumns.forEach(function(t, i) {

            dataRow[i] = createFinalCell(categoryId,
                _categoryId,
                dataRow,
                row,
                t,
                colorValueFilterMap,
                colorIndex,
                colorValuesLower, price, excelHeaders);

        });
       // console.log('dataRowattributeKeys', attributeKeys)
        if (attributeKeys.length > 0) {
            var len = templateColumns.length;
            attributeKeys.forEach(function(x, i) {
                 //console.log("data row ",x);
                dataRow[len + i] = row[excelHeaders.indexOf(x)];
                //console.log("data row ",dataRow);
            });
        }
         //console.log('categoryId11', categoryId);
        categoryId = excelTemplateCategoryMapping[categoryId];
        //console.log('jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjexcelTemplateCategoryMapping', excelTemplateCategoryMapping)
        //console.log('categoryId', categoryId, 'l2[catego,ryId]', l2[categoryId],"datarow",dataRow);

        if (l2[categoryId]) {
           
            dataSheetData[l2[categoryId]] || (dataSheetData[l2[categoryId]] = []);
            dataSheetData[l2[categoryId]].push(dataRow);
            //console.log("sadssafsagf",l2[categoryId]);
           // console.log("sadssafsagf",dataRow);
            //console.log(dataSheetData[l2[categoryId]]);
        }
    });
    //console.log(dataSheetData['Saree']);
     //console.log("jks data",dataSheetData);
    return dataSheetData;

    function createFinalCell(categoryId,
        _categoryId,
        dataRow,
        row,
        t,
        colorValueFilterMap,
        colorIndex,
        colorValuesLower, price, excelHeaders) {
        var excelmapping = req.session.templateExcelColumnMapping;
        var changedValue;

        var cellValue = row[templateExcelColumnMapping[t]];
       // console.log("row values",row[templateExcelColumnMapping['Category Id 1']]);
       // console.log()
        var falseValueKey = _categoryId + t + cellValue;
        var defaultexpression = req.session.defaultexpression;
        var expr = Object.keys(defaultexpression);
        //console.log('t',t)
        if (expr.indexOf(t) > -1) {

            var finals = 0;
            var ind;
            var validation1 = defaultexpression[t];
            validation1.forEach(function(valid) {
                var validation = valid;
                var columns = validation.split(/[^A-Za-z]/)
                    .filter(function(x) {
                        return x.length > 0;
                    });
                var changedValidation = valid;
                var columnIndexes = [];
                if (columns.indexOf('max') > -1 || columns.indexOf('min') > -1 || columns.indexOf('round') > -1) {
                    ind = columns.indexOf('max');
                    columns.splice(ind, 1);
                    ind = columns.indexOf('min');
                    columns.splice(ind, 1);
                    ind = columns.indexOf('round');
                    columns.splice(ind, 1);
                }
                columns.forEach(function(column) {
                    var columnIndex = excelmapping[column];
                    columnIndexes.push(columnIndex);
                    if (!!row[columnIndex] != false && row[columnIndex] != /^([^\s])/ && !(/^[a-zA-Z]+$/.test(row[columnIndex]) && columnIndex != -1)) {
                        changedValidation = changedValidation.replace(column, row[columnIndex]);
                    } else {
                        changedValidation = "";
                    }
                });
                if (changedValidation != '') {
                    var final1 = math.eval(changedValidation);
                    changedValue = final1;
                }
            });
        } else if (t == 'Status') {
            changedValue = 'Active';
        } else if (t == 'Merchant Id') {
            changedValue = merchantId;
        } else if (t == 'Managed By Paytm') {
            changedValue = 'Yes';
        } else if (t == 'Max. Dispatch Time') {
            changedValue = dispatchByMerchant ? dispatchByMerchant : '';
            //console.log('changedValue');
            // console.log(dispatchByMerchant, changedValue)
        } else if (t == 'Max Return Time') {
            changedValue = timeByCategory[_categoryId] ?
                timeByCategory[_categoryId].returnTime : '';
        } else if (t == 'Return Policy Id') {
            changedValue = timeByCategory[_categoryId] ?
                timeByCategory[_categoryId].returnPolicyId : '';
        } else if (t == 'Vertical Id') {
            changedValue = req.session.VerticalID;
        } else if (t == 'Category Id 1') {
            //console.log("1",cellValue);
           changedValue = "saree";
        } else if (t == 'Description') {

            changedValue = cellValue;              //.replace(/\t+/g, " ");
            changedValue = changedValue;             //.replace(/(\r\n|\n|\r)/gm, " ");
           // changedValue = sentenceCase(changedValue);

        } else if (t == 'Product Name') {

            changedValue = cellValue.replace(/\t+/g, " ");
            changedValue = changedValue.replace(/(\r\n|\n|\r)/gm, " ");

        } else if (t == 'Color Filter') {
            var colorVal = String(row[colorIndex]).toLowerCase();
            if (colorVal && colorVal != '' &&
                colorValuesLower.indexOf(colorVal) > -1) {
                changedValue = colorValueFilterMap[colorVal];
            } else {
                changedValue = '';
            }
        } else if (t == 'Product Weight') {

            if (cellValue != '' && typeof(cellValue) != undefined) {
                changedValue = parseFloat(cellValue)
            } else {
                changedValue = cellValue
            }
            //console.log(t,cellValue,changedValue)
        } else if (mappedColumns.indexOf(t) > -1) {
            if (falseValueKeys.indexOf(falseValueKey) > -1) {
                changedValue = (falseValueMapping[falseValueKey] == '--ignore') ? cellValue : falseValueMapping[falseValueKey];
                if (t == 'Material') {
                    changedValue = sentenceCase(changedValue.toLowerCase());
                    //console.log(changedValue);
                }
            } else {
                changedValue = cellValue;
            }
        } else {
            changedValue = '';
        }
        if (t == 'Material') {
            changedValue = sentenceCase(changedValue.toLowerCase());
            //console.log(changedValue);
        }
        return changedValue;
    }
}

function sentenceCase(string) {
    var n = string.split(".");
    var vfinal = ""
    for (i = 0; i < n.length; i++) {
        var spaceput = ""
        var spaceCount = n[i].replace(/^(\s*).*$/, "$1").length;
        n[i] = n[i].replace(/^\s+/, "");
        var newstring = n[i].charAt(n[i]).toUpperCase() + n[i].slice(1);
        for (j = 0; j < spaceCount; j++)
            spaceput = spaceput + " ";
        vfinal = vfinal + spaceput + newstring + ".";
    }
    vfinal = vfinal.substring(0, vfinal.length - 1);
    // console.log(vfinal);
    return (vfinal);
}

function getReturnTimeAndReturnPolicy(x, categories) {
    var timeByCategory = {};
    x.forEach(function(row, index) {
        if (categories.indexOf(row.Category) > -1) {
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
    for (i = 0; i < this.length; i++) {
        if (x[i] == x[i + 1]) {
            continue
        }
        temp[temp.length] = x[i];
    }
    return temp;
}

function getKeyByValue(object, value) {
    // console.log('in fiiun')
    //console.log(object,value)
    //console.log(Object.keys(object).find(key => object[key] === value))
    for (var key in object){
        if(object[key] === value)
           // console.log(key);
            return key;
    }
    //return Object.keys(object).find(key => object[key] === value);
}

/*Object.prototype.getKeyByValue = function getKeyByValue( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
}
*/
module.exports = router;