function sheet(data, headers, validators, category, tempHeaders, hots, imagepath, containerflag, csvContainer) {
    //var container = document.querySelector('[id="'+category.replace(/[^a-z0-9]/gi, '_')+'"]');
    //$(".se-pre-con").fadeIn("slow");
    // console.log('hots is',hots);
// console.log(imagepath)
height=400
    var maxsize1=1270;
    if (!containerflag) {
       
        var container = document.querySelector('[id="' + category.replace(/[^a-z0-9]/gi, '_') + '"]');
    } else {
       maxsize1=620;
      
        var container = document.querySelector('[id="' + category.replace(/[^a-z0-9]/gi, '_') + '"]');
        

    }
       var maxPossibleRows = data.length;
    // console.log(csvContainer)
    if(csvContainer!=''&csvContainer!=undefined){
      container=csvContainer
      maxsize1=620;
      height=maxPossibleRows * 25
    }
    // console.log(maxsize1)
    var imageColumn=0;
     imageColumn = headers.indexOf('image');
    if(imageColumn==-1){
        imageColumn = headers.indexOf('Image Name');  
    }
    // console.log("validators jai jai jai",validators);
 
    var hot = new Handsontable(container, {
        data: data,
        columns: validators,
        startRows: 0,
        startCols: 1,
        manualColumnResize: true,
        manualRowResize: true,
        minSpareRows: 0,
        minSpareCols: 0,
        maxRows:maxPossibleRows,
        height: height,
        width: maxsize1,
        colHeaders: tempHeaders,
        rowHeaders: true,
        columnSorting: true,
        sorting: true,
        formulas: true,
        rowHeights: 23,
        contextMenu: true,
        //nativeScrollbars: true,
        // hiddenColumns: {},
        // columns: [0],
        indicators: true,
        search: true,
        filters: true,
        dropdownMenu: ['filter_by_condition', 'filter_action_bar'],
        // copyable:false,

        sortIndicator: true,
          
    afterInit: function() {
      $("#wait").css("display", "block");
      },
      beforeRender: function () {
         $("#wait").css("display", "block");
      },
      afterRender: function () { 
        setTimeout(function(){ $("#wait").css("display", "none"); }, 3000);        
      },

        afterOnCellMouseDown: function(e, coords, td) {
          // console.log(coords)
            if (coords.col == imageColumn) {
              
                var imagePath1 = td.textContent;
                var ext=imagePath1.split('.')
                console.log(ext,ext.length)
                if(ext.length>1)
               {
                if(imagePath1.indexOf("http://")==0 ||imagePath1.length>1000 || imagePath1.indexOf("https://")==0  || imagePath1.indexOf(":")==0) {
                 $('#imagediv').html('');
                 $('#imagediv').append('<img id="modal-image" height="300px" width="570px">');
                 $("#modal-image").attr("src", imagePath1);
                 $('.sli1').addClass('hide')
                 $('#image-modal').modal('toggle');
            }
            else{
                 imagePath1 = imagepath + '/' + imagePath1;
                    // showImage(imagePath1);
            // imagePath1='file:///'+imagePath1;
             $("#modal-image").attr("src",'../Link to ImageSrc/'+ imagePath1);
             $('.sli1').addClass('hide')
                $('#image-modal').modal('toggle');  
            }
               }else{
                  // console.log(ext,'hahah')
                    showImage(imagePath1,imagepath)
               }
                //console.log("jai jai jai",imagePath1);var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/')
               
            }
            // else if( td.style.color == 'blue'){
               
            //    // console.log(coords)
            //    var data= hot.getDataAtCell(coords.row, coords.col)

            //    getspellcheckcell(data,headers[coords.col])
            //    hot.selectCell(coords.row, coords.col)
            // }
        },
        beforeKeyDown: function(e) {

            // if (e.keyCode < 37 || e.keyCode > 40)
            //     return;
            // var edit = hot.getActiveEditor();
            // if (!edit || !edit._opened) return;
            // if (e.keyCode == 37 && edit.TEXTAREA.selectionStart > 0)
            //     return;
            // if (e.keyCode == 39 && edit.TEXTAREA.selectionEnd < edit.TEXTAREA.value.length)
            //     return;
            // var selection = hot.getSelected();
            // if (selection && selection.length > 1) {
            //     var row = selection[0];
            //     var col = selection[1];
            //     hot.selectCell(row, col);
               
            // }
        }

      
    });
    setTimeout(function() {
      // console.log('hots ub==in time',hots);
        hot.validateCells(function() {});

       $('.se-pre-con').hide();
    }, 35);
    (hots[category] = hot);
          // console.log('hots ub======= in time',hots);

    $('.push').click(function () {
      // alert('sddssd',this)
    data = hot.getData();
});
    
    function bindDumpButton() {
      $('body').on('click', 'button[name=dump]', function () {
        var dump = $(this).data('dump');
        var $container = $(dump);
      });
    }
  bindDumpButton();
  $(".se-pre-con").fadeOut("slow");
}

function jq(i) {
    return "#" + i.replace(/(:|\.|\[|\]|,)/g, "\\$1");
}