/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
/*global $, jQuery, alert, console, tinyMCE */

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

///////////////////////////////////
// Kenneth's Custom Canvas Tools //
///////////////////////////////////

// Parse Course Number as coursenum
var coursenum, matches, killspot;
coursenum = null;
matches = location.pathname.match(/\/courses\/(.*)/);
if (matches) {
    coursenum = matches[1];
    killspot = coursenum.indexOf("/", 0);
    if (killspot >= 0) {
        coursenum = coursenum.slice(0, killspot);
    }
}

// Path to where the canvasCustomTools folder is located
var klToolsPath = "https://<url>/kennethware-2.0/",
    globalCSSPath = "https://<url>/canvasGlobal.css",
    klFontAwesomePath = "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css",

    // The templates in this list will match the Canvas background color
    matchCanvasBackgroundTemplates = [
        'kl_colored_headings'
    ],
    // If any of these elements exist, we will watch for page content in them to load
    contentWrappersArray = [
        '#course_home_content', // Course Front Page
        '#wiki_page_show', // Content page
        '#discussion_topic', // Discussions page
        '#wiki_page_show', // Syllabus page
        '#assignment_show' // Assignments page
    ],
    // Look in the url for this text and /edit and then make sure the tinyMCE editor has loaded
    urlsWithEdit = [
        '/pages/',
        '/assignments/',
        '/discussion_topics/'
    ],
    iframeID;

// Commands to run after the page content has loaded
function afterContentLoaded() {
    'use strict';
    var i;
    console.log('afterContentLoaded()');
    // Live view for tools
    if ($('#kl_wrapper').length > 0 || $("#course_syllabus").length > 0) {
        $.getScript(klToolsPath + "js/tools_liveView.js", function () {
            console.log("tools_liveView.js Loaded.");
        });
    }
    // Legacy live view
    if ($('#template-wrapper').length > 0 || $("#studentVerification").length > 0 || $("#course_syllabus").length > 0 || $("#usu-template-front").length > 0) {
        $.getScript(klToolsPath + "js/tools_liveView_legacy.js", function () {
            console.log("tools_liveView_legacy.js Loaded.");
        });
    }
    // add css for font-awesome if a course is using any of their icons
    if ($(".fa").length > 0) {
        $("head").append($("<link/>", { rel: "stylesheet", href: klFontAwesomePath, type: 'text/css' }));
    }
    // load custom css if necessary
    if ($("#kl_custom_css").length > 0) {
        $("head").append($("<link/>", { rel: "stylesheet", type: "text/css", href: "/courses/" + coursenum + "/file_contents/course%20files/global/css/style.css" }));
    }
    // Set template background to match Canvas if in array
    for (i = 0; i <= matchCanvasBackgroundTemplates.length; i++) {
        if ($('#kl_wrapper').hasClass(matchCanvasBackgroundTemplates[i])) {
            $('.show-content').css('background-color', '#EFEFEF');
        }
    }
}

// Check to see if the page content has loaded yet
function pageContentCheck(contentWrapperElement) {
    'use strict';
    var contentLoaded = false;
    // Content Pages
    if ($('.show-content').length > 0 && $('.show-content').text().length > 0) {
        contentLoaded = true;
    // Discussions
    } else if ($('#discussion_topic').length > 0 && $('.user_content').text().length > 0) {
        contentLoaded = true;
    // Assignment (Teacher View)
    } else if ($('#assignment_show .teacher-version').length > 0) {
        contentLoaded = true;
    } else if ($('#assignment_show .student-version').length > 0) {
        contentLoaded = true;
    }

    if (contentLoaded) {
        console.log('Content has loaded');
        afterContentLoaded();
    } else {
        setTimeout(function () {
            console.log('Still no content, check again (' + contentWrapperElement + ')');
            pageContentCheck(contentWrapperElement);
        }, 100);
    }
}
// Load tools dependent code
function loadToolsDependencies() {
    'use strict';
    console.log('loadToolsDependencies()');
    // Include Font-Awesome icons
    $("head").append($("<link/>", { rel: "stylesheet", href: klFontAwesomePath, type: 'text/css'}));
    // Load tools js
    $.getScript(klToolsPath + "js/tools_variables.js", function () {
        console.log("tools_variables loaded");
    });
    $.getScript(klToolsPath + "js/tools_main.js", function () {
        console.log("tools_main loaded");
    });
    // Spectrum color picker
    $.getScript(klToolsPath + "js/spectrum.js", function () {
        console.log("spectrum loaded");
    });
    $("head").append($("<link/>", { rel: "stylesheet", href: klToolsPath + "css/spectrum.css" }));
}

// Check to see if the editor is available yet
function triggerToolsCheck() {
    'use strict';
    console.log('triggerToolsCheck()');
    // First condition is for syllabus
    if ($('.kl_add_tools').length > 0) {
        $('.kl_add_tools').show();
    // If it is not the syllabus check for editor
    } else if ($('iframe').contents().find('#tinymce').length > 0) {
        console.log(tinyMCE.activeEditor.id);
        iframeID = '#' + tinyMCE.activeEditor.id + '_ifr';
        loadToolsDependencies();
    } else {
        // console.log('Check Again');
        setTimeout(function () {
            triggerToolsCheck();
        }, 500);
    }
}

// Look for "+ Page" button to appear
function newPageCheck() {
    'use strict';
    if ($('.new_page').length > 0) {
        $('.new_page').click(function () {
            loadToolsDependencies();
        });
    } else {
        setTimeout(function () {
            newPageCheck();
        }, 500);
    }
}


(function () {
    'use strict';
    // Get Current UserID
    var task,
        i;
    // Identify which page we are on and when the content has loaded
    for (i = 0; i <= contentWrappersArray.length; i++) {
        if ($(contentWrappersArray[i]).length > 0) {
            console.log(contentWrappersArray[i] + ' Found');
            pageContentCheck(contentWrappersArray[i]);
            break;
        }
    }

    // Look for tinyMCE editors
    for (i = 0; i <= urlsWithEdit.length; i++) {
        if (document.URL.indexOf(urlsWithEdit[i]) > -1 && document.URL.indexOf('/edit') > -1) {
            triggerToolsCheck();
            break;
        }
    }

    // Handle "+ Page" button on pages
    if (document.URL.indexOf('/pages') > -1 && document.URL.indexOf('/pages/') === -1) {
        newPageCheck();
    }

    // Handle Syllabus
    if ($('.edit_syllabus_link').length > 0) {
        console.log('syllabus link is there');
        $('.edit_syllabus_link').click(function () {
            if ($('#kl_tools_wrapper').length > 0) {
                $('#kl_tools_wrapper').show();
                // setupSyllabusTools();
            } else {
                triggerToolsCheck();
            }
        });
        $('#edit_course_syllabus_form .btn-primary').click(function () {
            $('.kl_add_tools').hide();
        });
    }

    // The following provides the tooltip instructions for updating grade scheme
    function getURLParameter(name) {
        return decodeURI(
            (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]
        );
    }
    task = getURLParameter("task");
    if (task === "setGradeScheme") {
        setTimeout(function () {
            $(".edit_course_link").get(0).scrollIntoView();
            $("#course_details_tabs").tabs("option", "active", 0);
            $(".edit_course_link").attr({"data-tooltip": "top", "title": "Click Here"}).trigger('mouseenter').click(function () {
                setTimeout(function () {
                    $(".grading_standard_checkbox").get(0).scrollIntoView();
                    $(".grading_standard_checkbox").attr({"data-tooltip": "top", "title": "Check this box"}).trigger('mouseenter').change(function () {
                        setTimeout(function () {
                            $(".edit_letter_grades_link").attr({"data-tooltip": "top", "title": "Click this link"}).trigger('mouseenter').click(function () {
                                setTimeout(function () {
                                    $(".edit_grading_standard_link").attr({"data-tooltip": "top", "title": "Click this link if you want to make changes."}).trigger('mouseenter');
                                    $(".display_grading_standard .done_button").attr({"data-tooltip": "top", "title": "When you are finished, click here."}).trigger('mouseenter').click(function () {
                                        $(".edit_letter_grades_link").trigger("mouseout");
                                        $(".edit_grading_standard_link").trigger("mouseout");
                                        setTimeout(function () {
                                            $(".coursesettings .form-actions .btn-primary").get(0).scrollIntoView();
                                            $(".coursesettings .form-actions .btn-primary").attr({"data-tooltip": "top", "title": "Next Steps:<ol><li>Click this button to save changes.</li><li>Wait for the page to save.</li><li>Close this tab.</li></ol>"}).trigger('mouseenter');
                                        }, 600);
                                    });
                                }, 600);
                            });
                        }, 600);
                    });
                }, 600);
            });
        }, 1000);
    }
    // Set users contact settings from link in syllabus Canvas Notification Preferences
    if (task === "announcements_daily") {
        setTimeout(function () {
            $('td[data-category="announcement"]').trigger('mouseover');
            $('td[data-category="announcement"]').find('.daily-label').first().trigger('click').trigger('mouseover');
            $('.profile_settings').attr({'data-tooltip': 'right', 'title': 'Click here to update email address'}).trigger('mouseover');
        }, 1000);
    }
    if (task === "announcements_asap") {
        setTimeout(function () {
            $('td[data-category="announcement"]').trigger('mouseover');
            $('td[data-category="announcement"]').find('.immediately-label').first().trigger('click').trigger('mouseover');
            $('.profile_settings').attr({'data-tooltip': 'right', 'title': 'Click here to update email address'}).trigger('mouseover');
        }, 1000);
    }
}());
///////////////////////////////////////
// End Kenneth's Custom Canvas Tools //
///////////////////////////////////////