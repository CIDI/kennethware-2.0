/*jslint browser: true, sloppy: true, eqeq: false, vars: false, maxerr: 15, indent: 4, plusplus: true */
/*global alert, $, jQuery, primaryTemplate, secondaryTemplate, canvasURL, courseID  */
$(function () {
    'use strict';
    if (primaryTemplate === false) {
        $(".primaryPageInput").prop("checked", false).prop("disabled", true);
        $(".primaryPage").append('<span class="addPrimaryWrapper"> (<a href="' + canvasURL + '/courses/' + courseID + '/wiki/primary-template" class="addPrimaryTemplate" target="_blank">Add</a>)</span>');
    }
    $('.addPrimaryTemplate').click(function () {
        $(".primaryPageInput").prop("checked", true).prop("disabled", false);
        $('.addPrimaryWrapper').remove();
    });
    if (secondaryTemplate === false) {
        $('.secondaryPageControls').hide();
        $(".secondaryPageAddSection").html('No Secondary Template Page (<a href="' + canvasURL + '/courses/' + courseID + '/wiki/secondary-template" class="addSecondaryTemplate" target="_blank">Add</a>)');
    } else {
        $('.secondaryPageControls').show();
        $('.secondaryPageAddSection').hide();
    }
    $('.addSecondaryTemplate').click(function () {
        $('.secondaryPageControls').show();
        $('.secondaryPageAddSection').hide();
    });
    console.log("Primary: " + primaryTemplate);
    console.log("Secondary: " + secondaryTemplate);
    $("#moduleCount").focus();
    function countControls() {
        var connectedInput, currentNum, newNum;
        $(".countIncrease").click(function (e) {
            e.preventDefault();
            connectedInput = $(this).attr("rel");
            currentNum = parseInt($(connectedInput).text());
            newNum = currentNum + 1;
            if (currentNum < 5) {
                $(connectedInput).text(newNum);
            }
        });
        $(".countDecrease").click(function (e) {
            e.preventDefault();
            connectedInput = $(this).attr("rel");
            currentNum = parseInt($(connectedInput).text());
            newNum = currentNum - 1;
            if (currentNum > 0) {
                $(connectedInput).text(newNum);
            }
        });
    }
    countControls();
    $('.showHelp').click(function (e) {
        e.preventDefault();
        $('.helpText').slideToggle(function () {
            if ($('.helpText').is(':visible')) {
                $('.showHelp').html('<i class="fa fa-question-circle"></i> Hide Help');
            } else {
                $('.showHelp').html('<i class="fa fa-question-circle"></i> Show Help');
            }
        });
    });
    $("#moduleCount").keydown(function (event) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(event.keyCode, [46, 8, 9, 27, 13, 190]) !== -1 ||
                // Allow: Ctrl+A
                (event.keyCode === 65 && event.ctrlKey === true) ||
                // Allow: home, end, left, right
                (event.keyCode >= 35 && event.keyCode <= 39)) {
                 // let it happen, don't do anything
            return;
        } else {
            // Ensure that it is a number and stop the keypress
            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        }
    });
    $("#moduleCount").keyup(function () {
        var moduleCount = parseInt($(this).val());
        if (moduleCount > 20) {
            $(".moduleCountMessage").html('<span class="alert">That is too many modules!</span>');
            $(this).val('20');
        } else {
            $(".moduleCountMessage").html("");
        }
    });
    // Create individual module sections to customize details
    $(".generateModuleList").click(function (e) {
        e.preventDefault();
        $("#moduleList").html("");
        var moduleCount = $("#moduleCount").val(),
            modulePrefix,
            primaryPage,
            assignmentCount,
            discussionCount,
            quizCount,
            secondaryPageSection,
            secondaryPageCount,
            i,
            moduleNum;
        if (moduleCount === "") {
            alert("Please input the number of modules you wish to create.");
            $("#moduleCount").focus();
        } else {
            $(".createModules").show();
            $(this).removeClass("btn-primary").addClass('btn-default').html('<i class="fa fa-refresh"></i> Re-Generate Module List');
            $(".customizeHeader").show();
            modulePrefix = $("#modulePrefix").find(":selected").val();
            primaryPage = "";
            assignmentCount = $("#assignmentCount").text();
            discussionCount = $("#discussionCount").text();
            quizCount = $("#quizCount").text();
            moduleNum = parseInt($("#startNumbering").val());
            if ($("#primaryPage").is(":checked")) {
                primaryPage = '<label class="primaryPage" style="margin-top:10px;">' +
                    '   <input type="checkbox" name="primaryPage" class="primaryPage" checked>' +
                    '   &nbsp; Primary Template Page' +
                    '</label>';
            }
            for (i = 1; i <= moduleCount; i++) {
                secondaryPageSection = "";
                if (secondaryTemplate === true) {
                    secondaryPageCount = $("#secondaryPageCount").text();
                    secondaryPageSection = '<li>' +
                        '   <div class="btn-group">' +
                        '      <a href="#" class="btn btn-default btn-xs countDecrease" rel="#mod' + moduleNum + ' .secondaryPageCount"><i class="fa fa-minus"></i></a>' +
                        '      <a href="#" class="btn btn-default btn-xs countIncrease" rel="#mod' + moduleNum + ' .secondaryPageCount"><i class="fa fa-plus"></i></a>' +
                        '   </div>' +
                        '   <span class="countInput input-mini secondaryPageCount">' + secondaryPageCount + '</span> Secondary Template Page' +
                        '</li>';
                }
                $('#moduleList').append('<div id="mod' + moduleNum + '" class="list-group-item module contentModule">' +
                    '   <div class="input-group">' +
                    '       <div class="input-group-addon modTitlePref"><strong>Module <span class="modNum">' + moduleNum + '</span> Title:</strong></div>' +
                    '       <input class="moduleTitleInput form-control" type="text" value="' + modulePrefix + ' ' + moduleNum + ': ">' +
                    '       <span class="moduleTitlePrefix hide">' + modulePrefix + ' ' + moduleNum + ':</span>' +
                    '   </div>' +
                        primaryPage +
                    '   <ul class="list-unstyled indModuleOptions">' +
                            secondaryPageSection +
                    '       <li>' +
                    '           <div class="btn-group">' +
                    '               <a href="#" class="btn btn-default btn-xs countDecrease" rel="#mod' + moduleNum + ' .assignmentCount"><i class="fa fa-minus"></i></a>' +
                    '               <a href="#" class="btn btn-default btn-xs countIncrease" rel="#mod' + moduleNum + ' .assignmentCount"><i class="fa fa-plus"></i></a>' +
                    '           </div>' +
                    '           <span class="countInput input-mini assignmentCount">' + assignmentCount + '</span> Assignments' +
                    '       </li>' +
                    '       <li>' +
                    '           <div class="btn-group">' +
                    '               <a href="#" class="btn btn-default btn-xs countDecrease" rel="#mod' + moduleNum + ' .discussionCount"><i class="fa fa-minus"></i></a>' +
                    '               <a href="#" class="btn btn-default btn-xs countIncrease" rel="#mod' + moduleNum + ' .discussionCount"><i class="fa fa-plus"></i></a>' +
                    '           </div>' +
                    '           <span class="countInput input-mini discussionCount">' + discussionCount + '</span> Discussions' +
                    '       </li>' +
                    '       <li>' +
                    '           <div class="btn-group">' +
                    '               <a href="#" class="btn btn-default btn-xs countDecrease" rel="#mod' + moduleNum + ' .quizCount"><i class="fa fa-minus"></i></a>' +
                    '               <a href="#" class="btn btn-default btn-xs countIncrease" rel="#mod' + moduleNum + ' .quizCount"><i class="fa fa-plus"></i></a>' +
                    '           </div>' +
                    '           <span class="countInput input-mini quizCount">' + quizCount + '</span> Quizzes' +
                    '       </li>' +
                    '   </ul>' +
                    '   <input type="hidden" name="moduleDetails[]" class="moduleDetails">' +
                    '</div>');
                moduleNum++;
            }
            countControls();
        }
    });
    $(".createModules").click(function (e) {
        e.preventDefault();
        // add link to front page if it is set to be created
        if ($('#frontPage').is(":checked")) {
            $('.createModules').after('<a href="' + canvasURL + '/courses/' + courseID + '/wiki/Home" class="btn btn-primary" style="margin-left: 5px;" target="_blank">Edit Front Page <i class="fa fa-external-link"></i></a>');
        }
        // Loop through new modules and compile the data to be processed
        $(".contentModule").each(function () {
            var modNum = $(this).find(".modNum").text(),
                moduleTitlePrefix = $(this).find(".moduleTitlePrefix").text(),
                moduleTitle = $(this).find(".moduleTitleInput").val(),
                primaryPage = false,
                secondaryPageCount = $(this).find(".secondaryPageCount").text(),
                assignmentCount = $(this).find(".assignmentCount").text(),
                discussionCount = $(this).find(".discussionCount").text(),
                quizCount = $(this).find(".quizCount").text();
            if ($("#primaryPage").is(":checked")) {
                primaryPage = true;
            }

            $(this).find(".moduleDetails").val(modNum +  " || " + moduleTitlePrefix + " || " +  moduleTitle +  " || " + primaryPage +  " || " + secondaryPageCount +  " || " + assignmentCount +  " || " + discussionCount +  " || " + quizCount);
            // Provide visual feedback that something is happening

        });
        // Provide visual feedback for form creation
        $(".createModules").html('<i class="fa fa-spinner fa-spin fa-large"></i> Adding Modules').addClass("disabled");
        // in order for the icon above to display, there needs to be a slight delay
        setTimeout(function () {
            $("#moduleForm").submit();
        }, 5);
    });
    // expand/collapse existing module details
    $('.expandExisting').click(function (e) {
        e.preventDefault();
        $('.panel-collapse').each(function () {
            $(this).attr('style', '').addClass('in');
        });
    });
    $('.collapseExisting').click(function (e) {
        e.preventDefault();
        $('.panel-collapse').each(function () {
            $(this).attr('style', '').removeClass('in');
        });
    });
    // Update an existing module
    $('.updateModule').click(function (e) {
        e.preventDefault();
        var moduleID = $(this).attr('rel'),
            currentSection = $('#collapse' + moduleID),
            moduleTitle = $(".moduleTitleInput", currentSection).val(),
            primaryPage = false,
            secondaryPageCount = $("#secondaryPageCount_" + moduleID, currentSection).text(),
            assignmentCount = $("#assignmentCount_" + moduleID, currentSection).text(),
            discussionCount = $("#discussionCount_" + moduleID, currentSection).text(),
            quizCount = $("#quizCount_" + moduleID, currentSection).text(),
            postUrl = 'wizard_update_module.php';
        if ($("#primaryPage"+moduleID).is(":checked")) {
            primaryPage = true;
        }
        // Provide visual feedback for form creation
        $(this).html('<i class="fa fa-spinner fa-spin fa-large"></i> Updating Module').addClass("disabled processing_" + moduleID);

        $.post(postUrl, {
            courseID: courseID,
            moduleID: moduleID,
            moduleTitle: moduleTitle,
            primaryPage: primaryPage,
            secondaryPageCount: secondaryPageCount,
            assignmentCount: assignmentCount,
            discussionCount: discussionCount,
            quizCount: quizCount
        }).done(function () {
            var totalModules = $('.panel-collapse').length,
                completedModules = $('.fa-check').length;
            $('.processing_' + moduleID).removeClass('disabled processing_' + moduleID).html('<i class="fa fa-check"></i> Module Updated');
            if ($('.updateAllExisting i').hasClass('fa-refresh')) {
                $('.updateAllExisting').html('<i class="fa fa-refresh fa-spin fa-large"></i> Updating ' + completedModules + '/' + totalModules + ' Modules');
            }

        });
    });
    // Update all existing modules
    $('.updateAllExisting').click(function (e) {
        e.preventDefault();
        var totalModules = $('.panel-collapse').length,
            completedModules = $('.fa-check').length;
        $(this).html('<i class="fa fa-refresh fa-spin fa-large"></i> Updating ' + completedModules + '/' + totalModules + ' Modules').addClass("disabled processing");
        $('.updateModule').each(function () {
            $(this).trigger('click');
        });

    }).ajaxComplete(function () {
        var totalModules = $('.panel-collapse').length,
            completedModules = $('.fa-check').length;
        if (totalModules === completedModules) {
            $('.updateAllExisting').removeClass('disabled').html('<i class="fa fa-check"></i> Modules Updated');
        }
    });
});