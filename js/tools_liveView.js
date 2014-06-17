/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
/*global $, jQuery, alert, coursenum, console, klToolsVariables,
klToolsArrays */

// Copyright © 2014, Utah State University’s Center for Innovative Design & Instruction (CIDI) http://cidi.usu.edu
// All rights reserved.

// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the 
// following conditions are met:

// 1.   Redistributions of source code must retain the above copyright notice, this list of conditions and the 
//      following disclaimer.
// 2.   Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the 
//      following disclaimer in the documentation and/or other materials provided with the distribution.
// 3.   Neither the name of the owner nor the names of its contributors may be used to endorse or promote products 
//      derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, 
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE 
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF 
// THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// This page contains code for the live view of custom tools
$(function () {
    'use strict';
    var anchor, studentName, activePanel, activeTab, icons, modalTitle, today;
    // SHOW PAGES TITLE
    if ($('.kl_show_title').length === 0) {
        if ($('#kl_banner h2').length > 0) {
            $('h2.page-title').remove();
        } else {
            $('h2.page-title').hide();
        }
    }

    // STUDENT VERIFICATION FORM //
    if ($("#kl_student_verification").length > 0 && $(".student-version").length > 0) {
        $("#kl_student_verification").after('<p align="center" style="margin-top:20px;"><a href="#" class="icon-edit btn btn-success submitVerify">Click Here to Sign</a></p>');
        $(".student-assignment-overview").hide();
        $(".submit_assignment_link").hide();

        $("#verificationSuccess").hide();
        $("#verificationInstructions").hide();
        $(".submitVerify").click(function (e) {
            e.preventDefault();
            console.log("Clicked");
            if ($("#submission_body").length > 0) {
                $("#submission_body").text($("#kl_student_verification").text());
            } else {
                console.log("No Submission Field");
            }
            $("#submit_assignment").show();
        });
        if ($(".details:contains('Turned In!')").length > 0) {
            $("#kl_student_verification").hide();
            $(".submitVerify").hide();
            $("#verificationSuccess").show();
        }
    }
    if ($(".studentName").length > 0) {
        studentName = $(".emphasize-name").text();
        $(".studentName").html(studentName);
    }
    // CUSTOM ACCORDION //
    if ($('.kl_custom_accordion').length > 0) {
        if ($(".kl_acc_panel_heading").length > 0) {
            $(".kl_acc_panel_heading").each(function () {
                $(this).contents().wrap('<a href="#" />');
            });
        }
        icons = {
            header: "ui-icon-triangle-1-e",
            activeHeader: "ui-icon-triangle-1-s"
        };
        if ($('.kl_current_acc').length > 0) {
            activePanel = parseFloat($(".kl_acc_panel_heading.kl_current_acc").attr('class').replace('kl_panel_', '').replace(' kl_current_acc', ''));
        } else {
            activePanel = 0;
        }
        $(".kl_custom_accordion").accordion({
            heightStyle: "content",
            icons: icons,
            active: activePanel //which panel is open by default
        });
    }
    // CUSTOM TABS //
    // Original Tabs
    if ($('.custom-tabs').length > 0) {
        if ($('.custom-tabs .current').length > 0) {
            activeTab = $(".tab-list li.current").index();
            $('.custom-tabs').tabs({active: activeTab});
        } else {
            $('.custom-tabs').tabs();
        }
    }
    // Mobile Friendly Tabs
    if ($('.kl_tabbed_section').length > 0) {
        console.log('Tabbed Section found');
        // turn h4s into li's to create navigation section
        // Make sure the tab h3 titles are wrapped in <a href="#">

        if ($(".kl_tabbed_section h4").length > 0) {
            $(".kl_tabbed_section").prepend('<ul class="kl_temp_tab_list" />');
            $(".kl_tabbed_section h4").each(function () {
                var myTitle = $(this).html(),
                    myClass = $(this).attr('class'),
                    myTarget = myClass.replace(" current", "");
                $('.kl_temp_tab_list').append('<li class="' + myClass + '"><a href="#' + myTarget + '">' + myTitle + '</a>');
                $(this).remove();
            });
        }

        // initialize tabs
        if ($('.kl_tabbed_section .kl_current_tab').length > 0) {
            activeTab = $(".kl_temp_tab_list li.kl_current_tab").index();
            console.log(activeTab);
            $('.kl_tabbed_section').tabs({active: activeTab});
        } else {
            $('.kl_tabbed_section').tabs();
        }
    }

    // POPUP CONTENT //
    if ($('#kl_modal').length > 0) {
        $("#kl_modal").css("display", "none");
        modalTitle = $(".kl_modal_title").text();
        $("#kl_modal").attr("title", modalTitle);
        $(".kl_modal_title").remove();
        setTimeout(function () {
            $('.kl_modal_toggler').click(function (e) {
                e.preventDefault();
                $('#kl_modal').dialog({
                    modal: true,
                    width: 600,
                    buttons: {
                        Close: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            });
        }, 300);
    }
    // TOOLTIPS //
    if ($('.kl_tooltip_trigger').length > 0) {
        $(".kl_tooltip_trigger").each(function () {
            var tipTextContainer = $(this).attr("id"),
                tipText = $("." + tipTextContainer).html();
            $(this).attr({"data-tooltip": "top", "title": tipText});
            $("." + tipTextContainer).remove();
        });
    }
    // POPOVER //
    if ($('.kl_popover_trigger').length > 0) {
        $(".kl_popover_trigger").each(function () {
            var popoverContainer = $(this).attr("id"),
                popoverTitle = $("." + popoverContainer + " h4").text(),
                popoverContents = $("." + popoverContainer).html(),
                popoverBody = '<div class=\'popover-title\'>' + popoverTitle + '</div>' +
                    '<div class=\'popover-content\'>' + popoverContents + '</div>';
            $("." + popoverContainer + " h4").remove();
            $(this).attr("title", popoverBody);
            $("." + popoverContainer).remove();
            $(".kl_popover_trigger").attr("data-tooltip", '{"tooltipClass":"popover right", "position":"right"}');
        });
    }
    // READ MORE/LESS //
    if ($('.expander').length > 0) {
        $.getScript(klToolsPath + "/js/jquery.expander.min.js", function () {
            console.log('expander loaded');
        });
    }
    // MAKE TABLES SORTABLE //
    if ($('.tablesorter').length > 0) {
        $.getScript(klToolsPath + "/js/jquery.tablesorter.min.js", function () {
            console.log('tablesorter loaded');
        });
        setTimeout(function () {
            $('.tablesorter').tablesorter();
        }, 300);
    }


    // QUICK CHECK - NEW //
    if ($(".kl_quick_check").length > 0) {
        // Hide next button
        $(".next").hide();
        // Run some functions
        $(".kl_quick_check").each(function (j) {
            var quickCheckSection = $(this).attr("id");
            $("#" + quickCheckSection + " .kl_quick_check_answer_wrapper").each(function (i) {
                $(this).find(".kl_quick_check_answer").prepend('<input class="kl_quick_check_field" type="radio" name="kl_quick_check_' + j +
                    '" value="false" rel="#' + quickCheckSection + ' #kl_quick_check_response_' + i + '"> ').wrap("<label />");
                $(this).find(".kl_quick_check_response").attr("id", "kl_quick_check_response_" + i);
            });
            $("#" + quickCheckSection + " .kl_quick_check_response").each(function () {
                $(this).hide().addClass("kl_quick_check_incorrect");
            });
            $("#" + quickCheckSection + " .kl_quick_check_correct_answer .kl_quick_check_response").removeClass("kl_incorrect").addClass("kl_quick_check_correct");
            $("#" + quickCheckSection + " .kl_quick_check_correct_answer .kl_quick_check_field").attr("value", "true");
            $("#" + quickCheckSection + " .kl_quick_check_field").click(function () {
                var selectedValue, showResponse,
                    selected = $("input[type='radio'][name='kl_quick_check_" + j + "']:checked");
                if (selected.length > 0) {
                    selectedValue = selected.val();
                    console.log(selectedValue);
                }
                $("#" + quickCheckSection + " .kl_quick_check_response").hide().appendTo("#" + quickCheckSection + " .kl_quick_check");
                showResponse = $("#" + quickCheckSection + " input[type='radio'][name='kl_quick_check_" + j + "']:checked").attr("rel");
                $(showResponse).slideDown();
            });
        });
        $(".kl_quick_check_field").change(function () {
            var numberNeeded = $(".kl_quick_check_field[value='true']").length,
                numberAnswered = $(".kl_quick_check_field[value='true']:checked").length;
            if (numberNeeded === numberAnswered) {
                $(".next").show();
            } else {
                $(".next").hide();
            }
        });
    }


    // SYLLABUS NAVIGATION //
    if ($("#course_syllabus #template-wrapper").length > 0 || $("#course_syllabus #kl_wrapper").length > 0 || $(".universityPolicies").length > 0 || $("#kl_university_policies").length > 0) {
        if ($("#course_syllabus").length > 0 && $('#syllabus_nav').length === 0) {
            $("#sidebar_content").append('<div id="kl_syllabus_nav"><h2>Syllabus Navigation</h2><ul id="kl_syllabus_nav_list" style="list-style-type:none;" /></div>');
            $("#kl_syllabus_nav_list").html('');
            $("#course_syllabus h3").each(function (index, value) {
                var title = $(value).text(),
                    anchorName = title.replace("&", "");
                anchorName = anchorName.replace(/ /g, "_");
                $(value).prepend('<a name="' + anchorName + '"></a>');
                $("#kl_syllabus_nav_list").append('<li class="kl_' + anchorName + '_link"><a href="#' +
                    anchorName + '" class="kl_syllabus_nav_link" rel="#kl_' + anchorName + '_sub">' + title +
                    '</a></li><ul style="display:none;" id="kl_' + anchorName + '_sub" class="kl_sub_nav_list"></ul>');
                $(value).parent('div').contents().find("h4").each(function (index, secondValue) {
                    var subtitle = $(secondValue).text(),
                        subAnchorName = subtitle.replace("&", "");
                    subAnchorName = subAnchorName.replace(/ /g, "_");
                    $(secondValue).prepend('<a name="kl_' + subAnchorName + '"></a>');
                    $('#kl_' + anchorName + '_sub').append('<li class="kl_' + subAnchorName + 'Link"><a href="#kl_' + subAnchorName + '">' + subtitle + '</a></li>');
                });
            });
            $(".universityPolicies h4").each(function () {
                var subtitle = $(this).text(),
                    subAnchorName = subtitle.replace("&", "");
                subAnchorName = subAnchorName.replace(/ /g, "");
                $(this).prepend('<a name="' + subAnchorName + '"></a>');
                $('#UNIVERSITYPOLICIESPROCEDURESSub').append('<li class="' + subAnchorName + 'Link"><a href="#' + subAnchorName + '">' + subtitle + '</a></li>');
            });
            $(".kl_syllabus_nav_link").each(function () {
                var subNav = $(this).attr("rel");
                if ($(subNav + " li").length > 0) {
                    $(this).parent('li').addClass('icon-arrow-right');
                } else {
                    $(this).parent('li').addClass('no-icon');
                }
            });
            $(".kl_syllabus_nav_link").click(function () {
                $(".kl_sub_nav_list").slideUp();
                $(".icon-arrow-down").addClass('icon-arrow-right').removeClass('icon-arrow-down');
                var subNav = $(this).attr("rel");
                if ($(subNav + " li").length > 0) {
                    $(subNav).slideDown();
                    $(this).parent('li').removeClass('icon-arrow-right').addClass('icon-arrow-down');
                }
            });
            $(".kl_syllabus_nav_link").hover(
                function () {
                    var anchorName = $(this).attr("href");
                    anchor = anchorName.replace("#", "");
                    $('a[name=' + anchor + ']').parent('div').css('background', '#D5E2FF');
                },
                function () {
                    ('a[name=' + anchor + ']').parent('div').css('background', '');
                }
            );
            $("#kl_syllabus_nav_list a").click(function () {
                $("#kl_syllabus_nav_list .active").removeClass("active");
                $(this).addClass("active");
            });
        }
    }
    // Moving syllabus assignment list up into syllabus
    if ($("#kl_syllabus_canvas_assignment_list #syllabus").length > 0) {
        $("#kl_syllabus_canvas_assignment_list").html($("#syllabusContainer"));
    }

    // ACTIVE MODULE CHECK //
    if ($('#kl_modules').length > 0 && $('.kl_modules_active_start').length > 0 && $('.kl_modules_active_stop').length > 0) {
        today = new Date();
        $('.kl_connected_module').each(function () {
            var startDate, endDate;
            if ($(this).parents('li').contents().find('.kl_modules_active_start').length > 0 && $(this).parents('li').contents().find('.kl_modules_active_stop').length > 0) {
                startDate = $(this).parent('li').find('.kl_modules_active_start').html();
                startDate = startDate.replace(' (', '').replace(' to ', '');
                startDate = new Date(startDate);
                endDate = $(this).parent('li').find('.kl_modules_active_stop').html();
                endDate = endDate.replace(')', '');
                endDate = new Date(endDate + ' 23:59:00');
                if (today >= startDate && today <= endDate) {
                    $(this).parent('li').addClass('kl_current');
                }
            }
        });
    }
    if ($('#kl_modules .kl_current').length > 0 && $('.kl_modules_quick_links').length > 0) {
        $("#kl_modules").after('<div id="kl_modules_current_details" />');
        $('#kl_modules .kl_current').each(function () {
            var moduleID = $(this).find('.kl_connected_module').attr('id');
            $("#kl_modules_current_details").append('<div id="kl_modules_current_details_' + moduleID + '" class="kl_modules_current_details" />');
            $('#kl_modules_current_details_' + moduleID).load('/courses/' + coursenum + '/modules #context_module_' + moduleID, function () {
                var moduleTitle = $('#kl_modules_current_details_' + moduleID + ' .name').first().text();
                $('#kl_modules_current_details_' + moduleID).prepend('<h3 style="margin:0;">' + moduleTitle + ' <small>(Quick Links)</small></h3>');
                $('#kl_modules_current_details_' + moduleID + ' .header').remove();
                $('#kl_modules_current_details_' + moduleID + ' .ig-admin').remove();
                $('#kl_modules_current_details_' + moduleID + ' .ig-details').remove();
                $('#kl_modules_current_details_' + moduleID + ' .draggable-handle').remove();
                $('#kl_modules_current_details_' + moduleID + ' .module_item_icons').remove();
            });
        });
    }
    // Banner on front page check (needs different css)
    if (($('a:contains("Edit Homepage")').length > 0 || $('a:contains("View Course Stream")').length > 0) && $('#kl_banner_image').length > 0) {
        console.log('change front page banner');
        $('#kl_banner_image').addClass('kl_banner_image_front');
    }
})();