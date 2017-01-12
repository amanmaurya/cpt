// function showImage(imagePath) {
//     $.ajax({
//         data: {
//             'path': '/' + imagePath
//         },
//         url: '/users/getFiles',
//         method: 'GET',
//         success: function(data) {

//             $('#imagediv').html('');
//             $('#imagediv').append(data);
//             //$("#modal-image").attr("src", data)
//             $('#image-modal').modal('show');


//         }
//     });
// };

function showImage(imagePath, imagepath1) {
    console.log(imagePath, imagepath1);
    //TODO: change the imagePath in production
    allimage = [];
    $("#slideshow_image").attr('src', '');
    $.ajax({
        data: {
            'path': imagePath
        },
        url: '/users/getfolderFiles',
        method: 'POST',
        success: function(data) {
            console.log(data)
            if (data.length != 0) {
                for (var j = 0; j < data.length; j++) {
                    var temp = data[j];
                    var completepath = temp.split('/');
                    var image = completepath[completepath.length - 1];
                    var image = '/Link to ImageSrc/' + imagepath1 + '/' + imagePath + '/' + image;
                    allimage.push(image);
                }
                $("#modal-image").attr('src', allimage[0]);
                $('#image-modal').modal('toggle');
                $('.sli1').removeClass('hide')
                
            } else {
                
                $.notify({
                    // options
                    message: 'No Image Found'
                }, {
                    // settings
                    type: 'warning'
                });
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {

            $.notify({
                    // options
                    message: 'Path not found'
                }, {
                    // settings
                    type: 'alert'
                });
        }
    });
}