function includeJs(jsFilePath) {
    var js = document.createElement("script");

    js.type = "text/javascript";
    js.src = jsFilePath;

    document.body.appendChild(js);
}

includeJs("../javascripts/libraries/alasql.min.js");
//includeJs("../javascripts/grid/xlsx.js");
type = 1;

function exportCSV(currentInstances,
    sheetHeaders,
    excelHeaders,
    validationData,
    notNulls,
    attributes,
    categoryCodes,
    attrsFromDb, fname, userid, expression, brands, nameToCode, merchantId, csvFlag) {

    //console.log('currentInstances',currentInstances)
    //console.log('sheetHeaders',sheetHeaders)
    //console.log('excelHeaders',excelHeaders)
    //console.log('validationData',validationData)
    //console.log('notNulls',notNulls)
    //console.log('attributes',attributes)
    //console.log('categoryCodes',categoryCodes)

    attrsFromDb.forEach(function(x, i) {
        attributes[x] = x;
    });
    var attrib = Object.keys(attributes);
    var categories = Object.keys(currentInstances);
    var errorArray = [];
    var correctArray = [];
    var len = sheetHeaders.length - 1;
    var Headers = [];
    var rejectedColumnIndexesInCorrectRow = [];
    var categoryCodeIndex = sheetHeaders.indexOf('Category Id');

    removeEmptyAttributes(attrib, createCSVRows);

    function removeEmptyAttributes(attributes, cb) {
        var attribIndexes = attributes.map(function(attr, attrIndex) {
            return sheetHeaders.indexOf(attr);
        });
        var attribs = [];

        categories.forEach(function(category, categoryIndex) {
            var data = currentInstances[category].getData();
            var len = data.length - 1;
            data.forEach(function(row, rowIndex) {
                attribIndexes.every(function(cellValue, cellIndex) {
                    var attrExist = false;
                    if (attribs.indexOf(cellValue) == -1) {
                        if (row[cellValue] && String(row[cellValue]).trim() != '') {
                            attrExist = true;
                        }
                        if (attrExist) {
                            attribs.push(cellValue);

                            attribIndexes = attribIndexes.filter(function(attr, attrIndex) {
                                return attribs.indexOf(attr) == -1;
                            });
                        };
                        return true;
                    }
                });
            });
        });

        var _finalAttributes = attribs.map(function(x, i) {
            return sheetHeaders[x];
        });

        var finalAttributes = _finalAttributes.filter(function(x, i) {
            return !!x;
        });

        rejectedColumnIndexesInCorrectRow = attributes.filter(function(x, i) {
            return finalAttributes.indexOf(x) == -1;
        });

        setTimeout(function() {
            cb(finalAttributes, processRowsForCategory, downloadFinalData);
        }, 27);
    }

    function createCSVRows(finalAttributes, processRowsForThisCategory, cb) {
        (function() {
            var _categories = categories.concat();
            setTimeout(function() {
                var start = +new Date();
                do {
                    processRowsForCategory(_categories.shift(), finalAttributes);
                } while (_categories.length > 0 && (+new Date() - start < 50));
                if (_categories.length > 0) {
                    setTimeout(arguments.callee, 27);
                } else {
                    cb(errorArray, correctArray);
                }
            }, 27);
        })();
    }

    function processRowsForCategory(category, finalAttributes) {
        if (notNulls[category] != undefined) {
            var notNullIndexes = notNulls[category].map(function(e, i) {
                return sheetHeaders.indexOf(e);
            });
        }
        var expr = Object.keys(expression);
        var expressionIndex = expr.map(function(e, i) {
            return sheetHeaders.indexOf(e);
        });
        // console.log(expressionIndex);
        var validations = validationData[category];
        var data = currentInstances[category].getData().slice(0);
        Headers = reformatHeaders(attributes, sheetHeaders, finalAttributes).map(function(x, i) {
            if (x == 'Category Id') {
                return 'Category Id 1';
            } else if (x == 'Max Dispatch Time') {
                return 'Max. Dispatch Time';
            } else {
                return x;
            }
        });;
        var Brands = brands['Brands'];
        data.forEach(function(row, rowIndex) {
            var remarks = [];
            var areColumnsCorrect = row.map(function(column, columnIndex) {

                var columnHeaderName = sheetHeaders[columnIndex];

                if (expressionIndex.indexOf(columnIndex) > -1) {
                    var correct = true;
                    var validation1 = expression[columnHeaderName];
                    validation1.forEach(function(valid) {
                        var validation = valid;
                        var columns = validation.split(/[^A-Za-z]/)
                            .filter(function(x) {
                                return x.length > 0;
                            });
                        var changedValidation = valid;
                        var columnIndexes = [];
                        columns.forEach(function(column) {
                            var columnIndex = sheetHeaders.indexOf(column);
                            columnIndexes.push(columnIndex);
                            if (!!row[columnIndex] != false && row[columnIndex] != /^([^\s])/ && !(/^[a-zA-Z]+$/.test(row[columnIndex]) && columnIndex != -1)) {
                                changedValidation = changedValidation.replace(column, row[columnIndex]);
                            } else {
                                changedValidation = "";
                            }
                        });
                        var setToColumn = sheetHeaders.indexOf(columnHeaderName);
                        // console.log(column);
                        if (changedValidation != '') {
                            var final1 = eval(column,changedValidation);
                            if (!final1) {
                                remarks.push(columnHeaderName);
                                correct = false;
                            }
                        }
                    });
                }

                if (columnHeaderName == 'Brand') {
                    var correct = true;
                    if(Brands!=undefined){
                    Brands.forEach(function(brand) {
                        var b1 = brand.toLowerCase();
                       
                        var val = column.toLowerCase();
                        if (b1 == val) {
                            remarks.push('Brand is restricted for the Merchant');
                            correct = false;
                        }
                    });
                }
                }
                if (columnHeaderName == 'Error') {
                    var correct = true;
                    var errorIndex = sheetHeaders.indexOf('Error');
                    if (row[errorIndex] != '') {
                        correct = false;
                    }
                }

                if (columnHeaderName == 'MRP') {
                   // alert(column, columnIndex)
                    var correct = true;
                    var mrpIndex = sheetHeaders.indexOf('MRP');
                    var priceIndex = sheetHeaders.indexOf("Price");
                    var priceValue = parseFloat(row[priceIndex]);
                    var mrpValue = parseFloat(row[mrpIndex]);
                    if (rowIndex == 0) {
                    // console.log("mrp priice",priceValue, mrpValue)
                    }
                    if (isNaN(priceValue) || isNaN(mrpValue)) {

                        remarks.push('MRP PRICE validation failed');
                        correct = false;
                    }
                    if (priceValue > mrpValue) {
                        remarks.push('MRP PRICE validation failed');
                        correct = false;
                    }
                }

                

                if (notNullIndexes && notNullIndexes.indexOf(columnIndex) > -1 && validations[columnHeaderName]) {
                    var validValuesOfCurrentColumn = validations[columnHeaderName].map(function(x, i) {
                        return String(x).toLowerCase();
                    });
                }
                  if(columnHeaderName=='Color'){
                    console.log(column,'Color',validations[columnHeaderName])
                }

                if (notNullIndexes && notNullIndexes.indexOf(columnIndex) > -1 && validValuesOfCurrentColumn) {
                    // alert(columnHeaderName)
                  
                    if (validValuesOfCurrentColumn.indexOf(column.toLowerCase()) == -1) {
                        remarks.push(columnHeaderName);
                        var correct = false;
                    }
                } else if (notNullIndexes && notNullIndexes.indexOf(columnIndex) > -1) {
                    if (!(column || column != '')) {
                        remarks.push(columnHeaderName);
                        var correct = false;
                    }
                }else if(validations[columnHeaderName]){
                    // alert(1)
                    var validValuesOfCurrentColumn = validations[columnHeaderName].map(function(x, i) {
                        return String(x).toLowerCase();
                    });
                    if (validValuesOfCurrentColumn.indexOf(column.toLowerCase()) == -1) {
                        remarks.push(columnHeaderName);
                        var correct = false;
                    }
                }
                if (correct == undefined) {
                    correct = true;
                }
                //console.log(correct);
                return correct;
            });

            var lastIndex = areColumnsCorrect.length - 1;
            var isCorrect = areColumnsCorrect.filter(function(value, i) {
                return value === false;
            }).length > 0 ? false : true;

            var newRemarks = row.filter(function(column, columnIndex) {
                return !areColumnsCorrect[columnIndex];
            });

            if (isCorrect) {
                var afterRemovingRejectedColumns = row.filter(function(column, columnIndex) {
                    return rejectedColumnIndexesInCorrectRow.indexOf(columnIndex) == -1;
                });
                var count = 1;
            // console.log('dfdsfdf',attributes);
            // console.log('adsdasda',finalAttributes);
                var temp = reformat(attributes, sheetHeaders, afterRemovingRejectedColumns, finalAttributes);
                var newRow = temp.map(function(val, index) {
                   // console.log("console.logval",categoryCodeIndex,index,nameToCode[String(val).trim()]);
                    if (index == categoryCodeIndex) {
                        if ((val && String(val) != ''))
                            if (nameToCode[String(val).trim()]) {
                                return String(nameToCode[String(val).trim()]);
                            } else return String(val);
                    }
                    return val;
                });
               // var newRow=temp;
                //console.log("tempdsfdsfd",temp)
                correctArray.push(newRow);
            } else {
                //alert("jai ho");
                errorArray.push(row.concat("Following columns have wrong values in this row: " + String(remarks)));
                //console.log(row)
                //console.log('errorArray',errorArray)

            }
        });

        function reformatHeaders(attributes, headers, finalAttributes) {
           // console.log("hesderssssssssssss",finalAttributes);
            var keys = Object.keys(attributes);
            var l = 1;
            var temp = headers.map(function(x, i) {
                if (x == 'Description') {
                    return [x];  //['desc_1_title', 'desc_1_description']
                } else if (finalAttributes.indexOf(x) > -1) {//-1
                    return [x];//["desc_1_attrib_" + l + "_title", "desc_1_attrib_" + l++ + "_value"]
                }/* else if (keys.indexOf(x) > -1) {
                    return [];
                } */  else {
                    return [x];
                }
            });
            return [].concat.apply([], temp);
        }

        function reformat(hdrs, keys, vals, fAttrs) {
            var oKeys = Object.keys(hdrs)
            var temp = keys.map(function(key, idx) {
                var hdr = hdrs[key];
                var val = vals[idx];
                if (fAttrs.indexOf(hdr) > -1) {
                    return [val];//[hdr, val]
                } /*else if (oKeys.indexOf(hdr) > -1) {
                    return [];
                }*/ else {
                    return [val];
                }
            });


            return [].concat.apply([], temp);
        }
    }

    function downloadFinalData(errorArray, correctArray) {
        //type=13
      //  console.log('errorArray',errorArray)
        //console.log('correctArray',correctArray)
       // var alasql = require('alasql');
        addlog(errorArray, correctArray);
        var errorHeaders = sheetHeaders.slice(0);
        errorHeaders.push('Remarks');
        setTimeout(function() {
            errorArray.unshift(errorHeaders);
            if (!csvFlag) {
                //type=2;
               // alasql("SELECT * INTO CSV('QC_MCD_" + merchantId + ".csv') FROM ?", [errorArray]);
                 alasql('SELECT * INTO XLSX("QC_MCD_' + merchantId + '.xlsx",{headers:false}) FROM ?',[errorArray]);
            } else {
               // alasql("SELECT * INTO CSV('Processing_MCD_" + merchantId + ".csv') FROM ?", [errorArray]);
                 alasql('SELECT * INTO XLSX("Processing_MCD_' + merchantId + '.xlsx",{headers:false}) FROM ?',[errorArray]);
            }

        }, 27);
        setTimeout(function() {
            correctArray.unshift(Headers);
            if (!csvFlag) {
                //type=2;correctArray
               // alasql("SELECT * INTO CSV('QCDone_" + merchantId + ".csv') FROM ?", [correctArray]);
               alasql('SELECT * INTO XLSX("QCDone_' + merchantId + '.xlsx",{headers:false}) FROM ?',[correctArray]);
            } else {
                //alasql("SELECT * INTO CSV('WorkDone_" + merchantId + ".csv') FROM ?", [correctArray]);
                alasql('SELECT * INTO XLSX("WorkDone_' + merchantId + '.xlsx",{headers:false}) FROM ?',[correctArray]);
            }
        }, 27);
    }

    function addlog(errorArray, correctArray) {
        if (!csvFlag) {
            type = 2;
        }
        var totaldata = errorArray.length + correctArray.length;
        var url = window.location.origin.split("/")[3] ? window.location.origin : window.location.origin + '/users' + '/add_log';
        //alert(type)
        $.ajax({
            data: {
                "userid": userid,
                "flname": fname,
                "totaldata": totaldata,
                "error": errorArray.length,
                "correct": correctArray.length,
                'ftype': type
            },
            url: url,
            method: 'POST',
            success: function(data) {},
            dataType: 'JSON',
        });
    }
}

//http://www.mikesknowledgebase.com/pages/CSharp/ExportToExcel.htm
// alasql('SELECT * INTO XLSX("myfile.xlsx",{headers:true}) FROM ?',[data]);
//https://github.com/agershun/alasql/wiki/How-to-import-and-export-Excel-files-to-javascript-array