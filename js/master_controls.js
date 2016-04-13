/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
/*global $, jQuery, alert, console, klToolsVariables, coursenum, klAdditionalAfterContentLoaded, 
  klAfterToolDependenciesLoaded, tinyMCE, iframeID, ENV */

// If any of these elements exist, we will watch for page content in them to load
var klContentWrappersArray = [
        '#course_home_content', // Course Front Page
        '#wiki_page_show', // Content page
        '#discussion_topic', // Discussions page
        '#course_syllabus', // Syllabus page
        '#assignment_show', // Assignments page
        '#wiki_page_revisions'
    ],
    // Look in the url for this text and /edit and then make sure the tinyMCE editor has loaded
    klUrlsWithEdit = [
        '/pages/',
        '/assignments/',
        '/discussion_topics/'
    ],
    i;

// This file triggers and launches all of the code required to run the tools
// Commands to run after the page content has loaded
function klAfterContentLoaded() {
    'use strict';
    console.log('klAfterContentLoaded()');
    // Live view for tools
    if ($('#kl_wrapper').length > 0 || $("#course_syllabus").length > 0) {
        $.getScript(klToolsPath + "js/tools_liveView.js", function () {
            console.log("tools_liveView.js Loaded.");
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
    for (i = 0; i < klToolsVariables.klMatchCanvasBackgroundTemplates.length; i++) {
        // console.log(klToolsVariables.klMatchCanvasBackgroundTemplates[i]);
        if ($('#kl_wrapper').hasClass(klToolsVariables.klMatchCanvasBackgroundTemplates[i])) {
            $('.show-content').css('background-color', '#EFEFEF');
            $('#main').css('background-color', '#EFEFEF');
        }
    }
    klAdditionalAfterContentLoaded();
}

// Check to see if the page content has loaded yet
function klPageContentCheck(klContentWrapperElement) {
    'use strict';
    var contentLoaded = false;
    // Content Pages
    if ($('.show-content').length > 0 && $('.show-content').children().length > 0) {
        contentLoaded = true;
    // Discussions
    } else if ($('#discussion_topic').length > 0 && $('.user_content').text().length > 0) {
        contentLoaded = true;
    // Assignment (Teacher View)
    } else if ($('#assignment_show .teacher-version').length > 0) {
        contentLoaded = true;
    } else if ($('#assignment_show .student-version').length > 0) {
        contentLoaded = true;
    } else if ($('#course_syllabus').length > 0) {
        contentLoaded = true;
    }

    if (contentLoaded) {
        console.log('Content has loaded');
        klAfterContentLoaded();
    } else {
        setTimeout(function () {
            console.log('Still no content, check again (' + klContentWrapperElement + ')');
            klPageContentCheck(klContentWrapperElement);
        }, 100);
    }
}
// Load tools dependent code
function klLoadToolsDependencies() {
    'use strict';
    console.log('klLoadToolsDependencies()');
    // Include Font-Awesome icons
    $("head").append($("<link/>", { rel: "stylesheet", href: klFontAwesomePath, type: 'text/css'}));
    // Load tools js
    $.getScript(klToolsPath + "js/tools_main.js", function () {
        console.log("tools_main loaded");
    });
    // Spectrum color picker
    $.getScript(klToolsPath + "js/spectrum.js", function () {
        console.log("spectrum loaded");
        $.fn.spectrum.load = false;
    });
    $("head").append($("<link/>", { rel: "stylesheet", href: klToolsPath + "css/spectrum.css?123" }));
    klAfterToolDependenciesLoaded();
}

// Check to see if the editor is available yet
function klTriggerToolsCheck() {
    'use strict';
    var klLoadTools = false,
        userID = ENV.current_user_id;
    console.log('klTriggerToolsCheck()');
    try {
        // Only proceed if this passes the limits on the tools
        if (klToolsVariables.klLimitByRole === false && klToolsVariables.klLimitByUser === false) {
            klLoadTools = true;
        } else if (klToolsVariables.klLimitByRole === true && klToolsVariables.klLimitByUser === false) {
            $.each(klToolsVariables.klRoleArray, function (index, val) {
                if ($.inArray(val, ENV.current_user_roles) !== -1) {
                    klLoadTools = true;
                    // return false;
                }
            });
        } else if (klToolsVariables.klLimitByRole === false && klToolsVariables.klLimitByUser === true) {
            console.log(userID);
            // If the user's Canvas ID is in the klToolsVariables.klUserArray
            if ($.inArray(userID, klToolsVariables.klUserArray) !== -1) {
                klLoadTools = true;
            }
        } else if (klToolsVariables.klLimitByRole === true && klToolsVariables.klLimitByUser === true) {
            $.each(klToolsVariables.klRoleArray, function (index, val) {
                if ($.inArray(val, ENV.current_user_roles) !== -1 && $.inArray(userID, klToolsVariables.klUserArray) !== -1) {
                    klLoadTools = true;
                    // return false;
                }
            });
        }
        console.log("Load Tools: " + klLoadTools);
        if (klLoadTools) {
            // First condition is for syllabus
            if ($('.kl_add_tools').length > 0) {
                $('.kl_add_tools').show();
            // If it is not the syllabus check for editor
            } else if ($('iframe[title^="Rich"]').contents().find('#tinymce').length > 0) {
                // console.log(tinyMCE.activeEditor.id);
                iframeID = '#' + tinyMCE.activeEditor.id + '_ifr';
                klLoadToolsDependencies();
            } else {
                // console.log('Check Again');
                setTimeout(function () {
                    klTriggerToolsCheck();
                }, 500);
            }
        }
    } catch (err) {
        console.log(err);
    }
}

// Look for "+ Page" button to appear
function klNewPageCheck() {
    'use strict';
    // Need to make sure the button is there and that the list of pages has finished otherwise it doesn't work
    if ($('.new_page').length > 0 && $('.collectionViewItems tr').length > 0) {
        $('.new_page').click(function () {
            klTriggerToolsCheck();
        });
    } else {
        setTimeout(function () {
            klNewPageCheck();
        }, 500);
    }
}

// SET UP TOOLS
$(document).ready(function () {
    'use strict';
    // Get Current UserID
    var task,
        i;

    // Identify which page we are on and when the content has loaded
    for (i = 0; i <= klContentWrappersArray.length; i++) {
        if ($(klContentWrappersArray[i]).length > 0) {
            // console.log(klContentWrappersArray[i] + ' Found');
            klPageContentCheck(klContentWrappersArray[i]);
            break;
        }
    }

    // Look for tinyMCE editors
    for (i = 0; i <= klUrlsWithEdit.length; i++) {
        if (document.URL.indexOf(klUrlsWithEdit[i]) > -1 && document.URL.indexOf('/edit') > -1) {
            klTriggerToolsCheck();
            break;
        }
    }


    // Handle "+ Page" button on pages
    if (document.URL.indexOf('/pages') > -1 && document.URL.indexOf('/pages/') === -1) {
        klNewPageCheck();
    }

    // Handle Syllabus
    if ($('.edit_syllabus_link').length > 0) {
        $('.edit_syllabus_link').click(function () {
            if ($('#kl_tools_wrapper').length > 0) {
                $('#kl_tools_wrapper').show();
            } else {
                klTriggerToolsCheck();
            }
        });
        $('#edit_course_syllabus_form .btn-primary').click(function () {
            $('.kl_add_tools').hide();
        });
    }

    // The following provides the tooltip instructions for updating grade scheme
    function klGetURLParameter(name) {
        return decodeURI(
            (new RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [null])[1]
        );
    }
    task = klGetURLParameter("task");
    if (task === "setGradeScheme") {
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

});
