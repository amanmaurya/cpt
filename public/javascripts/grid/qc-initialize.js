function init1(container, data, tempHeaders, flag, imageFolderColumn, imagepath) {
    // console.log(container, data, tempHeaders, flag, imageFolderColumn, imagepath)
    if(flag == "csv") {
        tempHeaders.push('Error');
        for(var i = 0; i < data.length; i++) {}
    }
    var imageColumn = 0;
    imageColumn = tempHeaders.indexOf('image');

    imageFolderPath = 3;
    var maxPossibleRows = data.length;
    var hit = maxPossibleRows * 25;
    var myData = data;
    var hot1 = new Handsontable(container, {
        data: data,
        startRows: 0,
        startCols: 0,
        //manualColumnResize: true,
        // manualRowResize: true, 
        minSpareRows: 0,
        minSpareCols: 0,
        maxRows: maxPossibleRows,
        minRows: 100,
        height: hit,
         // rowHeaders: true,
        colHeaders: tempHeaders,
        columnSorting: true,
        sorting: true,
        search: true,
        manualColumnMove: true,
        manualRowMove: true,
        stretchH: 'all',
        contextMenu: true,
        search: true,
        filters: true,
        dropdownMenu: ['filter_by_condition', 'filter_action_bar'],
        // copyable:false,

        sortIndicator: true,
        // nativeScrollbars: true,
        afterOnCellMouseDown: function (e, coords, td) {
            // console.log(coords)
            if(coords.col == imageColumn) {

                var imagePath1 = td.textContent;
                var ext = imagePath1.split('.')
                console.log(ext, ext.length)
                if(ext.length > 1) {
                    if(imagePath1.indexOf("http://") == 0 || imagePath1.length > 1000 || imagePath1.indexOf("https://") == 0 || imagePath1.indexOf(":") == 0) {
                        $('#imagediv').html('');
                        $('#imagediv').append('<img id="modal-image" height="300px" width="570px">');
                        $("#modal-image").attr("src", imagePath1);
                        $('.sli1').addClass('hide')
                        $('#image-modal').modal('toggle');
                    } else {
                        imagePath1 = imagepath + '/' + imagePath1;
                        // showImage(imagePath1);
                        // imagePath1='file:///'+imagePath1;
                        $("#modal-image").attr("src", '../Link to ImageSrc/' + imagePath1);
                        $('.sli1').addClass('hide')
                        $('#image-modal').modal('toggle');
                    }
                } else {
                    // console.log(ext,'hahah')
                    showImage(imagePath1, imagepath)
                }
                //console.log("jai jai jai",imagePath1);var currentDirectory = window.location.pathname.split('/').slice(0, -1).join('/')

            }
        },

        beforeKeyDown: function (e, b, c) {
            console.log(e, b, c)
            var index = tempHeaders.indexOf('image');
            var selection = hot.getSelected();
            if(selection && selection.length > 1) {
                var row = selection[0];
                var col = selection[imageFolderColumn];
                var imagePath1 = hot.getDataAtCell(row, index);
                // if(imagepath != ''){
                //     imagePath1 = imagepath+'/'+imagePath1;
                //   }
                showImage(imagePath1, imagepath)
            }
            if(e.keyCode < 37 || e.keyCode > 40)
                return;
            var edit = hot.getActiveEditor();
            if(!edit || !edit._opened) return;
            if(e.keyCode == 37 && edit.TEXTAREA.selectionStart > 0)
                return;
            if(e.keyCode == 39 && edit.TEXTAREA.selectionEnd < edit.TEXTAREA.value.length)
                return;
            if(selection && selection.length > 1) {
                var row = selection[0];
                var col = selection[1];
                hot.selectCell(row, col);
            }
        }
    });
    // console.log(hot1.getData())
    setTimeout(function () {
        // console.log('hots ub==in time',hots);
        hot1.validateCells(function () {});

        $('.se-pre-con').hide();
    }, 35);

    if(flag == 'csv') {
        exportable = hot;
        var gridId = '#processedSheet';
        var searchInput = '#' + flag + '-input';
    } else {
        var gridId = '#excelSheet';
        var searchInput = '#' + flag + '-input';
    }

    $(searchInput).on('keyup', function (event) {
        var value = ('' + this.value).toLowerCase(),
            row, col, r_len, c_len, td;
        var example = $('#exampleGrid');
        var data = myData;
        var searcharray = [];
        if(value) {
            for(row = 0, r_len = data.length; row < r_len; row++) {
                for(col = 0, c_len = data[row].length; col < c_len; col++) {
                    if(data[row][col] == null) {
                        continue;
                    }
                    if(('' + data[row][col]).toLowerCase().indexOf(value) > -1) {
                        searcharray.push(data[row]);
                        break;
                    } else {}
                }
            }
            hot.loadData(searcharray);
        } else {
            hot.loadData(myData);
        }
    });
}