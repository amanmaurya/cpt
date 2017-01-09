function filters(headers, validators, sheet, hots, tempHeaders) {
  //console.log(hots)
  var filterColumns = [];
  var currentCategory = document.getElementsByClassName('active')[1].textContent;
  var hot = hots[currentCategory];
  //console.log(hot)
  var data = hot.getData();
  headers.forEach(function(x, i) {
    var columnName = x;
    x = document.getElementById(x);
    var value = x.value;
    if (value.length != 0 || !!value) {
      filterColumns.push({
        columnId: columnName,
        value: value
      });
    }
  });
  //console.log(filterColumns, hots, headers, data);
  var filteredData = showFilteredData(filterColumns, hot, headers, data); 
  sheet(filteredData, headers, validators[currentCategory], currentCategory, tempHeaders,hots);
}

function filters1(headers, validators, sheet, hots, tempHeaders,cur,imagepath,flag) {
 // console.log("sheet",sheet)
  var filterColumns = [];
  var currentCategory = cur  ;                               //document.getElementsByClassName('active')[1].textContent;
  //alert(currentCategory);
  //var hot = hots[currentCategory];
  //console.log(hot)
  var data = hots;
  headers.forEach(function(x, i) {
    var columnName = x;
    //console.log(x);
    //x = document.getElementById(x);
    //alert($("#".concat(i)).val());
    var value = $("#".concat(i)).val();

    //if (value.length != 0 || !!value) {
      filterColumns.push({
        columnId: columnName,
        value: value
      });
   // }
  });
    if(filteredData==undefined){
  filteredData=[];  
  }
 
  var filteredData = showFilteredData(filterColumns, hots, headers, data); 
  sheet(filteredData, headers, validators[currentCategory], currentCategory, tempHeaders, hots,imagepath,flag);
  // console.log('fdsfsfsdf',filteredData);
}

function showFilteredData(f, hot, headers, data) {
  var filteredData = [];
  var columnIndexes = [];
  var values = [];
  f.forEach(function(x, i) {
    values.push(x.value)
    columnIndexes.push(headers.indexOf(x.columnId));
  });
//console.log("count",Object.keys(columnIndexes).length);
  data.forEach(function(row, rowIndex) {
    var count = Object.keys(columnIndexes).length;   //-1;
    columnIndexes.forEach(function(cell, i) {
      var cell = String(row[cell]).toLowerCase();
      var val = String(values[i]).toLowerCase();
      if (cell.indexOf(val) > -1){count--;}
        
    })
    if (count == 0){ filteredData.push(row);
      
    }
  });
  
  return filteredData;
}
