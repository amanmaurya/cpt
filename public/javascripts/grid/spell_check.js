// var imported = document.createElement('script');
// imported.src = '/javascripts/Typo/typo/typo.js';
// document.head.appendChild(imported);
// var Typo = include("typo-js");
var dictionary = new Typo( "en_US" );
function getspellcheck(data, headers, hots) {

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
      if(su1.length>0)
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
  
                var coles = Object.keys(data);
               
            
                if(coles.length>0){
                for(var k = 0; k < coles.length; k++) {
                   var col = coles[k]
                        html+='<form id="form'+col+'"><div class="col-md-6">'
                        html+='<h6>'+col+'</h6>'
                        html+='</div>'
                        html+='<div class="col-md-6">'
                        html+='<input class="hide"  name="searched_term" value="'+col+'" required/>'
                        var validList = data[col]

                        html+='<select name="replaced_term" id="'+col+'" onchange="changespl1elling(\''+col+'\')" class="col-md-6 input-sm form-control small-dropdowns suggest-drop">'
                                 html+='<option>--ignore</option>'
                        for (var l = 0; l < validList.length; l++) {
                           html+='<option  value="'+validList[l]+'">'+validList[l]+'</option>'


                        }

                         html+='</select>'
                          html+='<input class="hide"   name="column_name" value="'+columnName+'" required/>'

                         html+='</div></form>';

                
            }
            $('#spell-chec-div').html(html);
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
}