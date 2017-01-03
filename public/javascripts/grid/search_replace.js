function searchReplace(data, headers, sheet, hots, validators, tempHeaders) {
  // console.log(hots[currentCategory].getData())
  var currentCategory = document.getElementsByClassName('active')[1].textContent.trim();
  var searchedTerm = data[0].value;
  var replaceTerm = data[1].value;
  var columnName = data[2].value.length != 0 ? data[2].value : 'ALL_VALUES';
  var currentData = hots[currentCategory].getData();
  if (String(searchedTerm[searchedTerm.length - 1]).trim() == '*') {
    var str = searchedTerm.substring(0, searchedTerm.length-1);
    currentData.forEach(function(row, rowIndex) {
      row.forEach(function(cell, cellIndex) {
        var temp = new RegExp(str+'(.*)$', 'gi');
        if (temp.exec(String(cell))) {
          currentData[rowIndex][cellIndex] = String(cell).replace(temp, " " + replaceTerm);
        }
      });
    }); 
  } else if (columnName != 'ALL_VALUES') {
    var columnIndex = headers.indexOf(columnName);
    currentData.forEach(function(row, index) {
      var columnValue = row[columnIndex]; 
      var columnLowerValue = String(columnValue).toLowerCase();
      var indexOfValue = columnLowerValue.indexOf(String(searchedTerm).toLowerCase());
      if (indexOfValue > -1) {
        var re = new RegExp(searchedTerm, 'gi');
        currentData[index][columnIndex] = String(columnValue).replace(re, replaceTerm);
      } 
    });
  } else {
    currentData.forEach(function(row, rowIndex) {
      row.forEach(function(cell, cellIndex) {
        var columnLowerValue = String(cell).toLowerCase();
        var indexOfValue = columnLowerValue.indexOf(String(searchedTerm).toLowerCase());
        if (indexOfValue > -1) {
          var re = new RegExp(searchedTerm, 'gi');
          currentData[rowIndex][cellIndex] = String(cell).replace(re, replaceTerm);
        }
      });
    }); 
  }
  setTimeout(sheet(currentData, headers, validators[currentCategory], currentCategory, tempHeaders, hots), 0);
}
