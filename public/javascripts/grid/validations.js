function getValidations(validationData, sheetHeaders, notNulls, expression, brands) {

  var validators = {};
  var categories = Object.keys(validationData);
  var validNull = function(value, callback) {
     console.log("check brand value",value);
    var val = notNullValidation(value);
    setTimeout(function() {
      if (val) callback(true);
      else callback(false);
    });
  };
  var notNullValidation = function(value) {
      if(!!value!=false && value!=/^([^\s])/) return true;
      else return false;
  }
  var inDropDown = function(list, value) {
    return list.indexOf(value) > -1;
  }
  var checkRestrict = function(value, callback){
    var val = checkBrands(value);
     setTimeout(function() {
      if (val) callback(true);
      else callback(false);
    },1000);
  }
  var checkBrands = function(value){
  
    var Brands = brands['Brands'];
    var flag = true;
    if(Brands!=undefined){
    Brands.forEach(function(brand){
      var b1=brand.toLowerCase();
      var val = value.toLowerCase();
      if(b1 == val){
        flag = false;
      }
    });
  }
    return flag;
  }

  var validexp = function(value, callback){
    setTimeout(function(){
      callback(true);
    },1000);
  }

  categories.forEach(function(category, index) {

    var notNull = notNulls[category];
    var expr = Object.keys(expression);
    validators[category] = sheetHeaders.map(function(columnName, i) {
      // console.log(notNull && notNull.indexOf(columnName) == -1 && validationData && validationData[category] || validationData[category][columnName])
      if(expr && expr.indexOf(columnName) > -1){
        return {data: i, allowInvalid: true, validator: validexp, renderer: expressionValueRenderer, strict: true};
      }
      if(columnName == 'Brand'){
        return {data: i, allowInvalid: true, validator: checkRestrict, strict: true};
      }
      /*if (columnName == 'Image Name' || columnName == 'image' || columnName == 'Image') {
        return {data: i, allowInvalid: true,  renderer: coverRenderer, strict: true};}*/
      if (columnName == 'MRP' || columnName == 'Price') {
        return {data: i, allowInvalid: true, validator: validatePrice, renderer: defaultValueRenderer, strict: true};
      } else if (notNull && notNull.indexOf(columnName) > -1 && validationData && validationData[category] && validationData[category][columnName]) {
        var list = validationData[category][columnName]; 
        return {data: i, type: 'autocomplete', validator: validValueInList, source: list, allowInvalid: true, strict: true};
        var validValueInList = function(value, callback) {
          setTimeout(function() {
            if (inDropDown(list, value)) callback(true);
            else callback(false);
         });
        }
      } else if (notNull && notNull.indexOf(columnName) == -1 && validationData && validationData[category] || validationData[category][columnName]) {
        var list = validationData[category][columnName]; 
        console.log(columnName, i,list)
        return {data: i, type: 'autocomplete',  source: list, allowInvalid: false, strict: true};
      } else if(notNull && notNull.indexOf(columnName) > -1){
        return {data: i, allowInvalid: true, validator: validNull, strict: true};
      } else {
        return {data: i, allowInvalid: true};
      }
    }); 
  });
 
  return validators;




  function defaultValueRenderer(instance, td, row, col, prop, value, cellProperties) {
    var args = arguments;
    var mrpColumnIndex = sheetHeaders.indexOf('MRP');
    var priceColumnIndex = sheetHeaders.indexOf('Price');
    var rowData = instance.getData()[row];
    if (!mrpPriceCheck(instance, row)) {
      if(col == mrpColumnIndex || col == priceColumnIndex)
        td.style.color = 'RED';
    }
    Handsontable.renderers.TextRenderer.apply(this, args);
  }

  function validatePrice(value, callback) {
    setTimeout(function(){
      if (parseInt(value) > 0 && /^([^\s])/.test(value)) {
        callback(true);
      } else callback(false);
    }, 1000)
  }

  function mrpPriceCheck(instance, row) {
    //10 is mrp and 11 is price
    var mrpColumnIndex = sheetHeaders.indexOf('MRP');
    var priceColumnIndex = sheetHeaders.indexOf('Price');
    var rowData = instance.getData()[row];
    if (parseFloat(rowData[mrpColumnIndex]) < parseFloat(rowData[priceColumnIndex]))
      return false;
    return true;
  }

    function coverRenderer(instance, td, row, col, prop, value, cellProperties) {
    var escaped = Handsontable.helper.stringify(value);
   // alert("jai mata di");
    if (escaped.indexOf('http') === 0) {
      var $img = $('<img>');
      $img.attr('src', value);
      $img.on('mousedown', function (event) {
        event.preventDefault(); //prevent selection quirk
      });
      $(td).empty().append($img); //empty is needed because you are rendering to an existing cell
    }
    else {
      Handsontable.TextCell.renderer.apply(this, arguments); //render as text
    }
    return td;
  };

   function expressionValueRenderer(instance, td, row, col, prop, value, cellProperties) {
    var args = arguments;
    var rowData = instance.getData()[row];
    var vs = Object.keys(expression);
    vs.forEach(function(v) {
      var validation1 = expression[v];
      // console.log(validation1)
      validation1.forEach(function(valid){
        var validation=valid;
        var columns = validation.split(/[^A-Za-z]/)
        .filter(function(x) {return x.length > 0;});
        var changedValidation = valid;

        var columnIndexes = [];
        columns.forEach(function(column) {
          var columnIndex = sheetHeaders.indexOf(column);
          columnIndexes.push(columnIndex);
          if(!!rowData[columnIndex]!=false && rowData[columnIndex]!=/^([^\s])/ && !(/^[a-zA-Z]+$/.test(rowData[columnIndex]) && columnIndex != -1)){
            changedValidation = changedValidation.replace(column, rowData[columnIndex]);
          }
          else{
            changedValidation="";
          }
        });
        var setToColumn = sheetHeaders.indexOf(v);
        if(changedValidation != ''){
          //console.log(changedValidation)
          rowData.map(function(x, i) {
           
            if (i == setToColumn) {
              var final1=eval(changedValidation);
              if(!final1){
                if(col == sheetHeaders.indexOf(v))
                {
                  td.style.color = 'RED';
                }
              }
            } 
          });
        }
     });
      
      Handsontable.renderers.TextRenderer.apply(this, args);
  });  
    
  }
}

