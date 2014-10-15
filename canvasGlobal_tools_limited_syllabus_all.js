/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
/*global $, jQuery, alert, klToolsVariables, console */

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
// Path to where the canvasCustomTools folder is located
var klToolsPath = "https://<url to folder containing tools code>/",
    globalCSSPath = "https://<url to branding css>/css/canvasGlobal.css",
    klFontAwesomePath = "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css",


    //Parse Course Number - It is stored in the variable "coursenum"//
    coursenum,
    matches,
    killspot;
coursenum = null;
matches = location.pathname.match(/\/courses\/(.*)/);
if (matches) {
    coursenum = matches[1];
    killspot = coursenum.indexOf("/", 0);
    if (killspot >= 0) {
        coursenum = coursenum.slice(0, killspot);
    }
}

console.log('canvasGlobal.js loading');

// Add styling to tinyMCE editors
function iframeStyleOnly(editorFrameID) {
    'use strict';
    $.getScript(klToolsPath + "js/tools_variables.js", function () {
        console.log("tools_variables loaded");
        // Check to see if the iframe has already been styled
        if (!$(editorFrameID).contents().find('body').hasClass('kl_has_style')) {
            var $head = $(editorFrameID).contents().find('head'),
                timestamp =  +(new Date());
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsVariables.vendor_legacy_normal_contrast, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsVariables.common_legacy_normal_contrast, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsPath + 'css/canvasMCEEditor.css?' + timestamp, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: globalCSSPath + '?' + timestamp, type: 'text/css' }));
            $head.append($("<link/>", { rel: "stylesheet", href: klFontAwesomePath, type: 'text/css'}));
            if ($(editorFrameID).contents().find('#kl_custom_css').length > 0) {
                $head.append($('<link/>', { rel: 'stylesheet', href: '/courses/' + coursenum + '/file_contents/course%20files/global/css/style.css?' + timestamp, type: 'text/css' }));
            }
            $(editorFrameID).contents().find('body').css('background-image', 'none').addClass('kl_has_style');
            $(editorFrameID).contents().find('head').append('<style>#kl_banner_image {background: url(/courses/' + coursenum + '/file_contents/course%20files/global/css/images/homePageBanner.jpg) no-repeat center center; }</style>');
        }
    });
}
(function () {
    'use strict';
    // Get Current Users Canvas ID
    var userID = $(".user_id").text(),

        // Comma seperated list of courses to allow custom tools access
        // Any user who edits a page in this course will have the tools
        courseArray = [
            "", // Allowed course Canvas ID
            "37890" // Another allowed course Canvas ID
        ],
        // Comma seperated list of user Canvas ID's to allow custom tools access
        // Tools can be used in any course this user edits
        userArray = [
            "123",      // John Doe
            "456"       // Jane Doe
        ],
        timestamp =  +(new Date());

    // Only Allow tool access if course or user is one of the arrays above
    if ($.inArray(coursenum, courseArray) !== -1 || $.inArray(userID, userArray) !== -1) {
        // Identify if editing a wiki-page
        setTimeout(function () {
            if ($('.new_page').length > 0 || ($('#editor_tabs').length > 0 && $('.edit_link').length === 0)) {
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
                $("head").append($("<link/>", { rel: "stylesheet", href: klToolsPath + "css/spectrum.css?" + timestamp }));
            }
            // Live view for tools
            if ($('#kl_wrapper').length > 0) {
                $.getScript(klToolsPath + "/js/tools_liveView.js", function () {
                    console.log("tools_liveView.js Loaded.");
                });
            }

        }, 1000);
    } else {
        // wiki-page
        // Give the editor time to load
        setTimeout(function () {
            // add style to editor iframe
            if ($("#editor_box_unique_id_1_ifr").length > 0 || $("#assignment_description_ifr").length > 0) {
                console.log('load editor styles');
                iframeStyleOnly("#editor_box_unique_id_1_ifr");
            }
        }, 1000);
        // syllabus page
        if ($(".edit_syllabus_link").length > 0) {
            setTimeout(function () {
                if ($('.new_page').length > 0 || ($('#editor_tabs').length > 0 && $('.edit_link').length === 0)) {
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
                    $("head").append($("<link/>", { rel: "stylesheet", href: klToolsPath + "css/spectrum.css?" + timestamp }));
                }
                // Live view for tools
                if ($('#kl_wrapper').length > 0) {
                    $.getScript(klToolsPath + "/js/tools_liveView.js", function () {
                        console.log("tools_liveView.js Loaded.");
                    });
                }
            }, 1000);
        }

        // Hide template wizard if user/course not in whitelist
        if ($("a[title='Template Wizard'").length > 0) {
            $("a[title='Template Wizard'").hide();
        }
    }
    setTimeout(function () {
        // Front Page Custom banner image
        if ($("#kl_banner_image").length > 0) {
            $('head').prepend('<style>#kl_banner_image {background: url(/courses/' + coursenum + '/file_contents/course%20files/global/css/images/homePageBanner.jpg) no-repeat center center; }</style>');
        }
        if ($("#usu-home-img").length > 0) {
            $('head').prepend('<style>#usu-home-img {background: url(/courses/' + coursenum + '/file_contents/course%20files/global/css/images/homePageBanner.jpg) no-repeat center center; }</style>');
        }
    }, 1000);

    // add css for font-awesome if a course is using any of their icons
    if ($(".fa").length > 0) {
        $("head").append($("<link/>", { rel: "stylesheet", href: "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css?" + timestamp }));
    }

    // The following provides the tooltip instructions for updating grade scheme
    function getURLParameter(name) {
        return decodeURI(
            (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]
        );
    }
    // Step by step instructions for creating grading scheme
    (function () {
        var task = getURLParameter("task");
        if (task === "setGradeScheme") {
            console.log('Show how to set grade scheme');
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
                                                $(".coursesettings .form-actions .btn-primary").attr({"data-tooltip": "top", "title": "<strong>Next Steps:</strong><ol style='text-align:left;'><li>Click this button to save changes.</li><li>Wait for the page to save.</li><li>Close this tab.</li></ol>"}).trigger('mouseenter');
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
    }());
}());
