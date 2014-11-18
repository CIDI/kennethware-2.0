/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
// global $, jQuery, alert, coursenum, console, klToolsVariables, klToolsPath, klToolsArrays, $context_module_item 

// These tools were designed to facilitate rapid course development in the Canvas LMS
// Copyright (C) 2014  Kenneth Larsen - Center for Innovative Design and Instruction
// Utah State University

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// http://www.gnu.org/licenses/agpl-3.0.html

// This page contains code for the live view of custom tools
function kl_update_progress() {
    'use strict';
    if ($('.edit-wiki').length === 0) {
        var current_user_id = $("#identity .user_id").text(),
            url = '/courses/' + coursenum + '/modules/progressions?user_id=' + current_user_id;
        $.ajaxJSON(url, 'GET', {}, function (data) {
            var module_id, item_id, complete_type, workflow_state, idx, indexComplete, requirements_met;
            // console.log(data);
            for (idx in data) {
                if (data.hasOwnProperty(idx)) {
                    module_id = data[idx].context_module_progression.context_module_id;
                    workflow_state = data[idx].context_module_progression.workflow_state;
                    if (workflow_state === 'locked') {
                        $('#context_module_' + module_id).addClass('locked_module');
                    }
                    requirements_met = data[idx].context_module_progression.requirements_met;
                    for (indexComplete in requirements_met) {
                        if (requirements_met.hasOwnProperty(indexComplete)) {
                            item_id = data[idx].context_module_progression.requirements_met[indexComplete].id;
                            complete_type = data[idx].context_module_progression.requirements_met[indexComplete].type;
                            $('#context_module_item_' + item_id).addClass('completed_item');
                        }
                    }
                    // console.log(module_id + ': ' + workflow_state);
                    $('#context_module_' + module_id + ' .progression_state').html(workflow_state);
                }
            }
            $('#kl_gathering_data').remove();
        });
    } else {
        $('#kl_gathering_data').remove();
    }
}

// FRONT PAGE MODULE DETAILS
//// Adaptation of Canvas function to populate due dates and points
function kl_gatherModuleDetails() {
    'use strict';
    $.ajaxJSON('/courses/' + coursenum + '/modules/items/assignment_info', 'GET', {}, function (data) {
        $.each(data, function (id, info) {
            $context_module_item = $("#context_module_item_" + id);
            var data = {};
            if (info["points_possible"] != null) {
                data["points_possible_display"] = info["points_possible"] + ' pts';
                // data["points_possible_display"] = I18n.t('points_possible_short', '%{points} pts', { 'points': "" + info["points_possible"]});
            }
            if (info["due_date"] != null) {
                data["due_date_display"] = $.dateString(info["due_date"]);
            } else if (info["vdd_tooltip"] != null) {
                info['vdd_tooltip']['link_href'] = $context_module_item.find('a.title').attr('href');
                $context_module_item.find('.due_date_display').html(vddTooltipView(info["vdd_tooltip"]));
            }
            $context_module_item.fillTemplateData({data: data, htmlValues: ['points_possible_display']});
        });
        vddTooltip();
    });
}

// Determine whether black or white text offers best contrast
function getContrastYIQ(hexcolor) {
    'use strict';
    var r = parseInt(hexcolor.substr(0, 2), 16),
        g = parseInt(hexcolor.substr(2, 2), 16),
        b = parseInt(hexcolor.substr(4, 2), 16),
        yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? 'black' : 'white';
}
function getContrast50(hexcolor) {
    'use strict';
    return (parseInt(hexcolor, 16) > 0xffffff / 2) ? 'black' : 'white';
}

// Convert rgb color to hex
function rgb2hex(rgb) {
    'use strict';
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

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
    // Full width images
    $('.kl_image_full_width').css('max-width', '100%');
    $('#kl_banner_image img').css('max-width', '100%').addClass('kl_image_full_width');


    // STUDENT VERIFICATION FORM //
    if ($("#kl_student_verification").length > 0 && $(".student-version").length > 0) {
        $("#kl_student_verification").after('<p align="center" style="margin-top:20px;"><a href="#" class="icon-edit btn btn-success submitVerify">Click Here to Sign</a></p>');
        $(".student-assignment-overview").hide();
        $(".submit_assignment_link").hide();

        $("#verificationSuccess").hide();
        $("#verificationInstructions").hide();
        $(".submitVerify").click(function (e) {
            e.preventDefault();
            // console.log("Clicked");
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
        // console.log('Tabbed Section found');
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
            // console.log(activeTab);
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
                var kl_modal_width = 600;
                e.preventDefault();
                if ($('#kl_modal_width').length > 0) {
                    kl_modal_width = $('#kl_modal_width').text();
                }
                $('#kl_modal').dialog({
                    modal: true,
                    width: kl_modal_width,
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
                    // console.log(selectedValue);
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
            if ($(this).parents('li').find('.kl_modules_active_start').length > 0 && $(this).parents('li').find('.kl_modules_active_stop').length > 0) {
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
            var module_id = $(this).find('.kl_connected_module').attr('id');
            $("#kl_modules_current_details").append('<div id="kl_modules_current_details_' + module_id + '" class="kl_modules_current_details" />');
            $('#kl_modules_current_details_' + module_id).load('/courses/' + coursenum + '/modules #context_module_' + module_id).ajaxStop(function () {
                $('.kl_modules_current_details .ig-header-admin').remove();
                $('.kl_modules_current_details .ig-admin').remove();
                $('.kl_modules_current_details .sortable-handle').remove();
                $('.kl_modules_current_details .collapse_module_link i').remove();
                $('.kl_modules_current_details .draggable-handle').remove();
                $('.kl_modules_current_details .delete_prerequisite_link').remove();
                kl_gatherModuleDetails();
                kl_update_progress();
            });
        });

    }
    if ($('.kl_modules_tabbed').length > 0) {
        var bgColor = '',
            bgHex = '0F2439',
            textColor = 'FFF';
        $("head").append($("<link/>", { rel: "stylesheet", href: klFontAwesomePath, type: 'text/css'}));
        $('#kl_modules').before('<div id="kl_gathering_data" class="alert alert-info"><i class="fa fa-spinner fa-spin"></i> Gathering Progress Data</div>');
        // Check theme color and set tab highlight to match
        if ($('#kl_banner').length > 0) {
            bgColor = $('#kl_banner').css('background-color');
        }
        if ($('#kl_banner').length === 0 && $('#kl_navigation').length > 0 || $('#kl_navigation').length > 0 && bgColor === 'rgba(0, 0, 0, 0)') {
            bgColor = $('#kl_navigation').css('background-color');
        }
        if (bgColor !== '' && bgColor !== 'rgba(0, 0, 0, 0)') {
            bgHex = rgb2hex(bgColor);
            bgHex = bgHex.replace('#', '');
            textColor = getContrastYIQ(bgHex);
            textColor = getContrast50(bgHex);
        }
        // Write styles to match template to the page head
        var appendStyle = '<style>' +
            '   #kl_wrapper #kl_modules .ui-tabs-active {background: #' + bgHex + '; }' +
            '   #kl_wrapper #kl_modules ul li.ui-tabs-active a { color: ' + textColor + '}' +
            '   #kl_wrapper #kl_modules .ui-tabs-nav li.ui-tabs-active[class*=icon-]:before,' +
            '   #kl_wrapper #kl_modules .ui-tabs-nav li.ui-tabs-active[class^=icon-]:before,' +
            '   #kl_wrapper #kl_modules .ui-tabs-nav li.ui-tabs-active[class*=fa-]:before,' +
            '   #kl_wrapper #kl_modules .ui-tabs-nav li.ui-tabs-active[class^=fa-]:before {color: ' + textColor + ';}' +
            '</style>';
        $('head').append(appendStyle);

        // Loop through modules to gather details
        $('.kl_connected_module').each(function () {
            var module_id = $(this).attr('id'),
                myTitle = $(this).text(),
                explodedTitle;
            $(this).attr('href', '#kl_tabs_' + module_id);
            explodedTitle = myTitle.split(':');
            if (typeof explodedTitle[0] !== 'undefined') {
                $(this).text(explodedTitle[0]);
            }
            // Create tab sections and populate with module items
            $("#kl_modules").append('<div id="kl_tabs_' + module_id + '" />');
            $('#kl_tabs_' + module_id).load('/courses/' + coursenum + '/modules #context_module_' + module_id, function () {
                $('#kl_modules .delete_prerequisite_link').remove();
                $('#kl_modules .ig-header-admin').remove();
                $('#kl_modules .ig-admin').remove();
                $('#kl_modules .sortable-handle').remove();
                $('#kl_modules .collapse_module_link i').remove();
                $('#kl_modules .draggable-handle').remove();
            });
        }).ajaxStop(function () {
            kl_gatherModuleDetails();
            kl_update_progress();
        });
        if ($('#kl_modules .kl_current').length > 0) {
            activeTab = $("#kl_modules ul li.kl_current").index();
            $('#kl_modules').tabs({active: activeTab});
        } else {
            $('#kl_modules').tabs();
        }
        // Make tabs equal in width
        var maxWidth = 0;
        $('#kl_modules .ui-tabs-nav li a').each(function(){
           if ($(this).width() > maxWidth){
             maxWidth = $(this).width();
           }
        });
        $('#kl_modules .ui-tabs-nav li a').each(function(){
            $(this).width(maxWidth+3);
        });

    }
    // Banner on front page check (needs different css)
    if (($('a:contains("Edit Homepage")').length > 0 || $('a:contains("View Course Stream")').length > 0) && $('#kl_banner_image').length > 0) {
        $('#kl_banner_image').addClass('kl_banner_image_front');
    }

})();
