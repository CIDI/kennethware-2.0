// $(window).load(function(){

//     var jcrop_api;
//     var i, ac;
//     var originalWidth = 0,
//         originalHeight = 0,
//         aspectRatio = 0,
//         displayHeight = 0,
//         displayWidth = 0;

//     initJcrop();

//     function initJcrop()//{{{
//         {
//             $('#cropbox').Jcrop({
//                 onSelect: updateCoords,
//                 boxWidth: 630, 
//                 boxHeight: 500
//             }, function() {
//                 jcrop_api = this;
//             });
//             // jcrop_api = $.Jcrop('#cropbox');

//             $('#can_click,#can_move,#can_size')
//             .attr('checked','checked');

//             $('#ar_lock,#size_lock,#bg_swap').attr('checked',false);

//         }
//     //}}}


//     // A handler to kill the action
//     // Probably not necessary, but I like it
//     function nothing(e) {
//         e.stopPropagation();
//         e.preventDefault();
//         return false;
//     }
//     function updateCoords(c) {
//         $('#x').val(c.x);
//         $('#y').val(c.y);
//         $('#w').val(c.w);
//         originalWidth = c.w;
//         $('#h').val(c.h);
//         originalHeight = c.h;
//         aspectRatio = c.w/c.h;
//         $('#formSubmit').removeClass('disabled');
//         if ($('.ratio').hasClass('active')) {
//             $('#targetWidth').val(Math.round(c.w));
//             $('#targetHeight').val(Math.round(c.h));
//         }
//     }
//     function checkSizes(ratioString) {
//         var imageWidth = parseInt($('.width').text(), 10),
//             imageHeight = parseInt($('.width').text(), 10),
//             ratio = ratioString.split('|'),
//             themeWidth = parseInt(ratio[0], 10),
//             themeHeight = parseInt(ratio[1], 10);
//             if (imageWidth > themeWidth && imageHeight > themeHeight) {
//                 return true;
//             }
//     }
//     $('#targetWidth').focusout(function (e) {
//         var targetWidth = parseInt($(this).val(), 10),
//             targetHeight = targetWidth/aspectRatio;

//         if(targetWidth > displayWidth){
//             $('#targetHeight').val(Math.round(targetHeight));
//         } else {
//             $('#targetHeight').val(displayHeight);
//             $('#targetWidth').val(displayWidth);
//         }
//     });
//     $('#targetHeight').focusout(function (e) {
//         var targetHeight = parseInt($(this).val(), 10),
//             targetWidth = targetHeight*aspectRatio;
//         if(targetHeight > displayHeight){
//             $('#targetWidth').val(Math.round(targetWidth));
//         } else {
//             $('#targetHeight').val(displayHeight);
//             $('#targetWidth').val(displayWidth);
//         }
//     });
//     $("#cropForm").submit(function (e) {
//       if ($("#h").val() === "") {
//         alert('You must select an area to crop');
//         return;
//       }
//     });
//     // $('.aspectRatio_1x1').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 1/1 });
//     //     jcrop_api.setSelect([ 50, 50, 250, 250 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.aspectRatio_4x3').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 4/3 });
//     //     jcrop_api.setSelect([ 20, 20, 240, 180 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.aspectRatio_5x4').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 4/5 });
//     //     jcrop_api.setSelect([ 20, 20, 240, 300 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.aspectRatio_7x5').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 7/5 });
//     //     jcrop_api.setSelect([ 20, 20, 250, 350 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.aspectRatio_3x2').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 2/3 });
//     //     jcrop_api.setSelect([ 20, 20, 200, 300 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.aspectRatio_16x9').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ aspectRatio: 16/9 });
//     //     jcrop_api.setSelect([ 50, 50, 340, 200 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('No Minimum Size');
//     //     displayHeight = 0;
//     //     displayWidth = 0;
//     // });
//     // $('.originalBanner').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ 
//     //         aspectRatio: 215/64,
//     //         minSize: [860, 256]
//     //     });
//     //     jcrop_api.setSelect([ 50, 100, 910, 256 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     $('#sizeRestriction').html('Minimum Size: 860 x 256');
//     //     displayHeight = 313;
//     //     displayWidth = 1050;
//     //     $('#targetHeight').val(displayHeight);
//     //     $('#targetWidth').val(displayWidth);
//     // });
//     // $('.kl_fp_squares_16x9').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ 
//     //         aspectRatio: 16/9,
//     //         minSize: [576, 324]
//     //     });
//     //     jcrop_api.setSelect([ 50, 100, 910, 256 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     displayHeight = 324;
//     //     displayWidth = 576;
//     //     $('#targetHeight').val(displayHeight);
//     //     $('#targetWidth').val(displayWidth);
//     // });
//     // $('.kl_fp_squares_1x1').click(function (e) {
//     //     e.preventDefault();
//     //     jcrop_api.setOptions({ 
//     //         aspectRatio: 1/1,
//     //         minSize: [320, 320]
//     //     });
//     //     jcrop_api.setSelect([ 50, 50, 370, 370 ]);
//     //     jcrop_api.focus();
//     //     $('.btn.active').removeClass('active');
//     //     $(this).addClass('active');
//     //     displayHeight = 320;
//     //     displayWidth = 320;
//     //     $('#targetHeight').val(displayHeight);
//     //     $('#targetWidth').val(displayWidth);
//     // });

//     $('.freeTransform').click(function (e) {
//         jcrop_api.setOptions({
//             aspectRatio: 0,
//             minSize: [ 0, 0 ]
//         });
//         jcrop_api.focus();
//         $('.btn.active').removeClass('active');
//         $(this).addClass('active');
//         $('#sizeRestriction').html('No Minimum Size');
//         displayHeight = 0;
//         displayWidth = 0;
//     });
// });