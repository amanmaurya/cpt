var dictionary = new Typo( "en_US" );
function searchReplacesplel(data, headers, sheet, hots, validators, tempHeaders) {
  // console.log(hots[currentCategory].getData())
  // console.log(data)
    var currentCategory = document.getElementsByClassName('active')[1].textContent.trim();
    // for (var i = 0; i < data.length; i+3) {
    //     console.log(i+1,i+2,i+3)
    // }
    if(data[1].value!='--ignore'){
        var searchedTerm = data[0].value;
  var replaceTerm = data[1].value;
  var columnName = data[2].value;
  var currentData = hots[currentCategory].getData();
   var columnIndex = headers.indexOf(columnName);

    currentData.forEach(function(row, index) {
      // for (var i = 0; i < Things.length; i++) {
      //   Things[i]
      // }
      var columnValue = row[columnIndex]; 
      var columnLowerValue = String(columnValue).toLowerCase();
      var indexOfValue = columnLowerValue.indexOf(String(searchedTerm).toLowerCase());
      if (isMatch(columnLowerValue, String(searchedTerm).toLowerCase())) {
        var re =new RegExp("\\b"+searchedTerm+"\\b", "i") //new RegExp(searchedTerm, 'gi');
        currentData[index][columnIndex] = String(columnValue).replace(re, replaceTerm);
      } 
    });
    setTimeout(sheet(currentData, headers, validators[currentCategory], currentCategory, tempHeaders, hots), 0);
    }

  
};

function isMatch(searchOnString, searchText) {
  searchText = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return searchOnString.match(new RegExp("\\b"+searchText+"\\b", "i")) != null;
}


function getspellcheck(data, headers, hots) {
$('.se-pre-con').show();
// console.log($('.se-pre-con'),'aaaaaaaa')
// alert(1)
  var currentCategory = document.getElementsByClassName('active')[1].textContent.trim();
  var columnName = data[0].value;
  // var searchedTerm = data[1].value;
  // var replaceTerm = data[2].value.length != 0 ? data[2].value : 'ALL_VALUES';
  var currentData = hots[currentCategory].getData();
  // console.log(searchedTerm,replaceTerm,columnName)

  var columnIndex = headers.indexOf(columnName);
  var colval=unique(getCol(currentData,columnIndex))
  var sugges={};
  for (var i = 0; i < colval.length; i++) {
   var  colvalsplit=colval[i].split(' ')
    for (var j = 0; j < colvalsplit.length; j++) {
      var su1=dictionary.suggest(colvalsplit[j])

       if(!dictionary.check(colvalsplit[j]))
       sugges[colvalsplit[j]]=su1;
        
    }
    
  }
  
  // console.log(sugges)

  drawsuggetion(sugges,columnName)


// console.log( "Spelling suggestions for 'mispeling': " + array_of_suggestions.join( ', ' ) );
  // setTimeout(sheet(currentData, headers, validators[currentCategory], currentCategory, tempHeaders, hots), 0);
};
function drawsuggetion(data,columnName){
  var html=''
  // console.log(data)
                var coles = Object.keys(data);
               
            
                if(coles.length>0){
                for(var k = 0; k < coles.length; k++) {
                   var col = coles[k]
                        html+='<form id="formd'+k+'"><div class="col-md-6">'
                        html+='<h6>'+col+'</h6>'
                        html+='</div>'
                        html+='<div class="col-md-6">'
                        html+='<input class="hide"  name="searched_term" value="'+col+'" required/>'
                        var validList = data[col]

                        html+='<input name="replaced_term"  type="text" list="da'+col+'" class="col-md-6 input-sm form-control small-dropdowns suggest-drop" autocomplete="off" onchange="changespl1elling(\''+col+'\')" value="--ignore" /> '
                          html+='<datalist id="da'+col+'">'
                                 html+='<option  value="--ignore">--ignore</option>'
                        for (var l = 0; l < validList.length; l++) {
                           html+='<option  value="'+validList[l]+'">'+validList[l]+'</option>'


                        }

                         html+='</datalist>'
                          html+='<input class="hide"   name="column_name" value="'+columnName+'" required/>'

                         html+='</div></form>';

                
            }
            $('#spell-chec-div-length').val(k);
            $('#spell-chec-div').html(html);
            // changesplelling()
            }else{
                $('#spell-chec-div').html('')
               $.notify({
                    // options
                    message: 'No suggestion word Found'
                }, {
                    // settings
                    type: 'warning'
                });
            }
           $('.se-pre-con').hide(); 
           // console.log($('.se-pre-con'),'aaaaaaaa')          
}
function drawsuggetioncell(data,columnName){
  var html=''
  
                var coles = Object.keys(data);
                
            
                if(coles.length>0){
                  var k;
                for(k = 0; k < coles.length; k++) {
                   var col = coles[k]
                   // console.log(col)
                        html+='<form id="form'+k+'"><div class="col-md-6">'
                        html+='<h6>'+col+'</h6>'
                        html+='</div>'
                        html+='<div class="col-md-6">'
                        html+='<input class="hide"  name="searched_term" value="'+col+'" required/>'
                        var validList = data[col]

                        // html+='<select name="replaced_term" id="'+col+'" onchange="changespl1elling(\''+col+'\')" class="col-md-6 input-sm form-control small-dropdowns suggest-drop">'
                        html+='<input name="replaced_term"  type="text" list="da'+col+'" class="col-md-6 input-sm form-control small-dropdowns suggest-drop" autocomplete="off" onchange="changespl1elling(\''+col+'\')" value="--ignore" /> '
                          html+='<datalist id="da'+col+'">'
                                 html+='<option  value="--ignore">--ignore</option>'
                        for (var l = 0; l < validList.length; l++) {
                           html+='<option  value="'+validList[l]+'">'+validList[l]+'</option>'


                        }

                         html+='</datalist>'
                          html+='<input class="hide"   name="column_name" value="'+columnName+'" required/>'

                         html+='</div></form>';

                
            }
            // alert(1)
            // console.log('asas',$('#spell-chec-divcell'))
            $('#spell-chec-divcell-length').val(k);
            $('#spell-chec-divcell').html(html);
            $('#spell-check-modal1').modal('show');
            }else{
                $('#spell-chec-divcell').html('')
               $.notify({
                    // options
                    message: 'No suggestion word Found'
                }, {
                    // settings
                    type: 'warning'
                });
            }
             // alert(1)
                      
}
function getCol(matrix, col) {
        //    console.log('matrix','col',col)
        var column = [];
        for (var i = 0; i < matrix.length; i++) {
            column.push(matrix[i][col]);
        }
        // console.log('column',column)
        return column;
    };
function  unique(arra1) {
    var arr = [];
    for(var i = 0; i < arra1.length; i++) {
        if(!arr.contains(arra1[i])) {
            arr.push(arra1[i]);
        }
    }
    return arr; 
};

  Array.prototype.contains =function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
function changespl1elling(id){
  // alert(1+id)
   changesplelling(id)
};
function getspellcheckcell(data, columnName) {
  // console.log(data, columnName)

  // var columnIndex = headers.indexOf(columnName);
  var colval=unique(data.split(' '))
  // console.log(colval)
  var sugges={};
  for (var i = 0; i < colval.length; i++) {
   var  colvalsplit=colval[i]
    
      var su1=dictionary.suggest(colvalsplit)
      // if(su1.length>0)
      if(!dictionary.check(colvalsplit))
       sugges[colvalsplit]=su1;
        
    
    
  }
  
  // console.log(sugges)

  drawsuggetioncell(sugges,columnName)


// console.log( "Spelling suggestions for 'mispeling': " + array_of_suggestions.join( ', ' ) );
  // setTimeout(sheet(currentData, headers, validators[currentCategory], currentCategory, tempHeaders, hots), 0);
};