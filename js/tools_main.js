/*jslint browser: true, sloppy: false, eqeq: false, vars: false, maxerr: 50, indent: 4, plusplus: true */
/*global $, jQuery, alert, coursenum, console, klToolsPath, globalCSSPath, tinymce, tinyMCE, klToolsVariables,
klToolsArrays, vendor_legacy_normal_contrast,  */

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

(function () {
    'use strict';
/////////////////////////////////////
//    VARIABLES                    //
/////////////////////////////////////

    var iframeID,
        toolsToLoad,
        sectionsPanelDefault = false,
        assignmentsPage = false,
        // Basic shell to add into template
        templateShell = '<div id="kl_wrapper" class="kl_bookmark"></div>',
        // Bloom's Taxonomy for Objectives Section
        bloomsRevisedRemember =  [
            'Choose', 'Define', 'Describe', 'Identify', 'Label', 'List', 'Locate', 'Match',
            'Memorize', 'Name', 'Omit', 'Recite', 'Recognize', 'Select', 'State'
        ],
        bloomsRevisedUnderstand =  [
            'Classify', 'Defend', 'Demonstrate', 'Distinguish', 'Explain', 'Express', 'Extend',
            'Give example', 'Illustrate', 'Indicate', 'Infer', 'Interpret', 'Judge', 'Paraphrase',
            'Represent', 'Restate', 'Rewrite'
        ],
        bloomsRevisedApply =  [
            'Act', 'Articulate', 'Assess', 'Change', 'Chart', 'Compute', 'Construct',
            'Contribute', 'Control', 'Determine', 'Develop', 'Discover', 'Draw', 'Establish',
            'Extend', 'Imitate', 'Implement', 'Include', 'Participate', 'Predict', 'Prepare',
            'Produce', 'Provide', 'Show'
        ],
        bloomsRevisedAnalyze =  [
            'Break down', 'Characterize', 'Classify', 'Compare', 'Contrast', 'Correlate',
            'Deduce', 'Diagram', 'Differentiate', 'Discriminate', 'Distinguish', 'Examine',
            'Limit', 'Outline', 'Prioritize', 'Research', 'Relate', 'Subdivide'
        ],
        bloomsRevisedEvaluate =  [
            'Appraise', 'Argue', 'Criticize', 'Critique', 'Debate', 'Estimate', 'Evaluate',
            'Justify', 'Prioritize', 'Rate', 'Value', 'Weigh'
        ],
        bloomsRevisedCreate =  [
            'Combine', 'Compose', 'Construct', 'Create', 'Design', 'Devise', 'Forecast',
            'Formulate', 'Hypothesize', 'Invent', 'Make', 'Originate', 'Plan', 'Produce',
            'Propose', 'Role play'
        ],
        bloomsRevisedSections = {
            'remember': bloomsRevisedRemember,
            'understand': bloomsRevisedUnderstand,
            'apply': bloomsRevisedApply,
            'anaylze': bloomsRevisedAnalyze,
            'evaluate': bloomsRevisedEvaluate,
            'create': bloomsRevisedCreate
        };


/////////////////////////////////////////////////////////////
//  SUPPORTING FUNCTIONS                                   //
//  These functions are used throughout the various tools  //
/////////////////////////////////////////////////////////////

    // Draft state adds an h2 with the page title, give user choice to include this otherwise we will get rid of it
    function showPageTitle() {
        if ($('input#title').length > 0 && $('.kl_show_title').length === 0) {
            $('input#title').after(' <a href="#" class="btn kl_show_title" data-tooltip="top" title="Show this title as a heading above the page content">Show title</a>');
            $('.kl_show_title').click(function (e) {
                e.preventDefault();
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active').html('Show Title');
                    $(iframeID).contents().find('#kl_wrapper').removeClass('kl_show_title');
                } else {
                    $(this).html('<i class="icon-check"></i> Showing Title');
                    $(this).addClass('active');
                    $(iframeID).contents().find('#kl_wrapper').addClass('kl_show_title');
                }
            });
            if ($(iframeID).contents().find('.kl_show_title').length > 0) {
                $('.kl_show_title').addClass('active');
                $('.kl_show_title').html('<i class="icon-check"></i> Showing Title');
            }
        }
    }
    // Styles and code to be applied to TinyMCE editor
    function addStyletoIframe() {
        if (!$(iframeID).contents().find('body').hasClass('kl_has_style')) {
            var $head = $(iframeID).contents().find('head'),
                timestamp =  +(new Date());
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsVariables.vendor_legacy_normal_contrast, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsVariables.common_legacy_normal_contrast, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: globalCSSPath + '?' + timestamp, type: 'text/css' }));
            $head.append($('<link/>', { rel: 'stylesheet', href: klToolsPath + 'css/canvasMCEEditor.css?' + timestamp, type: 'text/css' }));
            $head.append($("<link/>", { rel: "stylesheet", href: "//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css"}));
            if ($(iframeID).contents().find('#kl_custom_css').length > 0) {
                $head.append($('<link/>', { rel: 'stylesheet', href: '/courses/' + coursenum + '/file_contents/course%20files/global/css/style.css?' + timestamp, type: 'text/css' }));
            }
            $(iframeID).contents().find('body').css('background-image', 'none').addClass('kl_has_style');
            $(iframeID).contents().find('head').append('<style>#kl_banner_image {background: url(/courses/' + coursenum + '/file_contents/course%20files/global/css/images/homePageBanner.jpg) no-repeat center center; }</style>');
        }
    }
    function bannerImageCheck() {
        // Check to see if a banner image exists it will throw an error either way.
        if ($('a:contains("Template Wizard")').length > 0) {
            var wizardurl = $('a:contains("Template Wizard")').attr('href');
            $.ajax({
                url: '/courses/' + coursenum + '/file_contents/course%20files/global/css/images/homePageBanner.jpg',
                type: 'HEAD',
                error: function (xhr) {
                    if (xhr.status === 404) {
                        $(iframeID).contents().find('#kl_banner_image').addClass('kl_banner_placeholder');
                        $('.kl_wizard_trigger').html('<i class="fa fa-picture-o"></i> Add Custom Banner').attr({'href': wizardurl, 'target': '_blank'});
                    } else {
                        $(iframeID).contents().find('#kl_banner_image').removeClass('kl_banner_placeholder');
                        $('.kl_wizard_trigger').html('<i class="fa fa-picture-o"></i> Change Custom Banner').attr({'href': wizardurl, 'target': '_blank'});
                    }
                }
            });
            $('.kl_wizard_trigger').show();
            $('.kl_wizard_notice').hide();
        } else {
            $('.kl_wizard_trigger').hide();
            $('.kl_wizard_notice').show();
        }
    }
    // check given element and parents to find target attribute color
    function kl_getColor(jqueryElement, targetAttribute) {
        // Is current element's targetAttribute color set?
        var color = jqueryElement.css(targetAttribute);
        if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {
            // if so then return that color
            return color;
        }

        // if not: are you at the body element?
        if (jqueryElement.is("body")) {
            // return known 'false' value
            return false;
        }
        // call kl_getColor with parent item
        return kl_getColor(jqueryElement.parent(), targetAttribute);
    }
    // Convert RGB color value to hexidecimal
    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }
    // Move the specified editor content to the top
    function scrollToElement(targetElement) {
        $(iframeID).contents().find(targetElement).get(0).scrollIntoView();
        $('a:contains("HTML Editor");').get(0).scrollIntoView();
    }
    // Adds class to connected section when mouse hovers over sortable lists
    function bindHover() {
        $('.kl_template_sections_list li').mouseover(function () {
            var el = $(this),
                connectedSection = $(this).find('input').attr('value'),
                timeoutID = setTimeout(function () {
                    $(iframeID).contents().find('#' + connectedSection).addClass('kl_section_hover');
                    scrollToElement('#' + connectedSection);
                }, 500);
            el.mouseout(function () {
                connectedSection = $(this).find('input').attr('value');
                $(iframeID).contents().find('#' + connectedSection).removeClass('kl_section_hover');
                clearTimeout(timeoutID);
            });
        });
        $('#kl_accordion_panels li, #kl_tab_panels li, .kl_sections_li li, #kl_module_list li, .kl_sections_list li').mouseover(function () {
            var el = $(this),
                connectedSection = $(this).attr('rel'),
                timeoutID = setTimeout(function () {
                    $(iframeID).contents().find(connectedSection).addClass('kl_section_hover');
                    scrollToElement(connectedSection);
                }, 500);
            el.mouseout(function () {
                connectedSection = $(this).attr('rel');
                $(iframeID).contents().find(connectedSection).removeClass('kl_section_hover');
                clearTimeout(timeoutID);
            });
        });
    }
    // and is the first item on the page. Also replaces old css code
    function customCSSCheck() {
        if ($(iframeID).contents().find('#kl_custom_css').length > 0) {
            // if it has contents unwrap them
            if ($(iframeID).contents().find('#kl_custom_css').text().length > 1) {
                $(iframeID).contents().find('#kl_custom_css').contents().unwrap();
                $(iframeID).contents().find('body').prepend('<div id="kl_custom_css">&nbsp;</div>');
            }
            $('#kl_custom_css_add').prop('checked', true);
        }
        // Control
        $('#kl_custom_css_add').change(function () {
            if ($(this).is(':checked')) {
                if ($(iframeID).contents().find('#kl_custom_css').length === 0) {
                    $(iframeID).contents().find('body').prepend('<div id="kl_custom_css">&nbsp;</div>');
                }
            } else {
                if ($(iframeID).contents().find('#kl_custom_css').length > 0) {
                    $(iframeID).contents().find('#kl_custom_css').remove();
                }
            }
        });
    }

    // Toggle element outlines in MCE editor
    function setDisplay() {
        $(iframeID).contents().find('#tinymce').addClass('mceContentBody');
        $(iframeID).contents().find('.kl_mce_visual_blocks').removeClass('kl_mce_visual_blocks');
        $(iframeID).contents().find('.kl_mce_visual_sections').removeClass('kl_mce_visual_sections');
        if ($('.kl_mce_editor_view .active').length === 0) {
            $('.kl_mce_preview').addClass('active');
        }
        $('.kl_mce_editor_view .active').each(function () {
            $(iframeID).contents().find('#tinymce').addClass($(this).attr('rel'));
        });
        $('a:contains("HTML Editor")').get(0).scrollIntoView();
    }
    function displayTypes() {
        $('.kl_mce_section_view, .kl_mce_labels_view').click(function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            $('.kl_mce_preview').removeClass('active');
            setDisplay();
        });
        $('.kl_mce_preview').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_mce_section_view, .kl_mce_labels_view').removeClass('active');
            setDisplay();
        });
    }
    // Cleans out all empty elements and elements containing only &nbsp;
    function removeEmpty() {
        $('.kl_remove_empty').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('h2, h3, h4, p, h3, li, ol, ul').each(function () {
                var myContents = $.trim($(this).html());
                if (myContents === '&nbsp;' || myContents === '') {
                    $(this).remove();
                }
            });
        });
    }
    // Clear out the blank span added when the template wrapper is first created
    function removeTempContent() {
        $('.kl_delete_me').remove();
    }
    function highlightNewElement(targetElement) {
        $(iframeID).contents().find(targetElement).addClass('kl_section_hover');
        setTimeout(function () {
            $(iframeID).contents().find(targetElement).removeClass('kl_section_hover');
        }, 1000);
    }
     // Show/Hide remove unchecked sections button
    function checkRemove() {
        if ($(iframeID).contents().find('.kl_to_remove').length > 0) {
            $('.kl_remove_sections_wrapper').show();
        } else {
            $('.kl_remove_sections_wrapper').hide();
        }
    }
    // When an element is unchecked, it will highlight it and jump to it in content area
    function markToRemove(targetSection) {
        $(iframeID).contents().find(targetSection).addClass('kl_to_remove');
        scrollToElement(targetSection);
        checkRemove();
    }
   // If template is not there add it, will also remove and change old template
    function templateCheck() {
        // Remove or change old template elements
        if ($(iframeID).contents().find('#kl_wrapper').length > 0) {
            var currentTheme = $(iframeID).contents().find('#kl_wrapper').attr('class');
            $('#' + currentTheme).addClass('kl_active_theme');
        } else {
            // Add base html if template doesn't exist
            $(iframeID).contents().find('#tinymce').prepend(templateShell);
        }
    }
    // Initiate Color Pickers
    function initializeColorPicker(inputName, targetElement, attribute) {
        var chosenColor = '',
            startingColor = kl_getColor($(iframeID).contents().find(targetElement), attribute),
            logElement;
        console.log(targetElement + ': ' + attribute + ': ' + startingColor);
        $(inputName).spectrum({
            color: startingColor,
            showAlpha: true,
            preferredFormat: 'hex',
            showPalette: true,
            showInput: true,
            palette: klToolsVariables.klThemeColors,
            allowEmpty: true,
            cancelText: 'Close',
            localStorageKey: 'spectrum.wiki',
            move: function (tinycolor) {
                $(inputName).val(tinycolor);
                chosenColor = $(inputName).val();
                $(iframeID).contents().find(targetElement).css(attribute, chosenColor);
                $(iframeID).contents().find(targetElement).removeAttr('data-mce-style');
            }
        });
    }

    function addSectionControls(title, connectedSectionID) {
        var newSectionControls = '<li rel="#' + connectedSectionID + '" class="' + connectedSectionID + '_section"><span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span>&nbsp;' +
            '<span class="kl_section_title">' + title + '</span>' +
            '<a class="kl_delete_section kl_remove icon-end pull-right" rel="' + connectedSectionID + '" href="#" data-tooltip="left" title="Delete this Section.">' +
            '    <span class="screenreader-only">Delete ' + title + ' Panel</span>' +
            '</a>' +
            '</li>';
        if (title === 'Progress Bar') {
            $(newSectionControls).prependTo('.kl_sections_list');
        } else {
            $(newSectionControls).appendTo('.kl_sections_list');
        }
        $('.kl_delete_section').click(function (e) {
            e.preventDefault();
            var sectionToRemove = $(this).attr('rel');
            $(this).parent('li').remove();
            $(iframeID).contents().find('#' + sectionToRemove).remove();
            if ($('input.' + sectionToRemove + '_section').length > 0) {
                $('input.' + sectionToRemove + '_section').prop('checked', false);
            }
        });
    }

/////////////////////////////////////////////////////////////
//  THEMES SECTION                                         //
/////////////////////////////////////////////////////////////

    ////// SUPPORTING FUNCTIONS //////

        // Styles that utilize the bottom banner div
    // Check and mark current theme in toolbar
    function currentPagesThemeCheck() {
        addStyletoIframe();
        setTimeout(function () {
            if ($(iframeID).contents().find('#kl_wrapper').length > 0) {
                var currentTheme = $(iframeID).contents().find('#kl_wrapper').attr('class');
                $('#' + currentTheme).addClass('kl_active_theme');
                $('.kl_theme_color_pickers').show();
                initializeColorPicker('#kl_banner_background', '#kl_banner', 'background-color');
                initializeColorPicker('#kl_banner_text', '#kl_banner', 'color');
                initializeColorPicker('#kl_banner_heading_background', '#kl_banner h2', 'background-color');
                initializeColorPicker('#kl_banner_heading_text', '#kl_banner h2', 'color');
                initializeColorPicker('#kl_banner_left_background', '#kl_banner_left', 'background-color');
                initializeColorPicker('#kl_banner_left_text', '#kl_banner_left', 'color');
                initializeColorPicker('#kl_banner_type_background', '.kl_mod_text', 'background-color');
                initializeColorPicker('#kl_banner_type_text', '.kl_mod_text', 'color');
                initializeColorPicker('#kl_banner_title_background', '#kl_banner_right', 'background-color');
                initializeColorPicker('#kl_banner_title_text', '#kl_banner_right', 'color');
                initializeColorPicker('#kl_banner_num_background', '.kl_mod_num', 'background-color');
                initializeColorPicker('#kl_banner_num_text', '.kl_mod_num', 'color');
            }
            bannerImageCheck();
        }, 1000);
    }
    // Loop through theme array and output thumbs
    function outputThemes(themeArray) {
        $.each(themeArray, function () {
            $('.kl_wiki_themes').append('<li id="' + this + '" class="kl_template_theme kl_wiki_theme" rel="' + this +
                '" title="' + this +
                ' theme"><img src="' + klToolsPath + '/images/template_thumbs/' +
                this + '.png" width="45" alt="' + this + '"></a></li>');
        });
    }
    // Output themes
    function outputFrontPageThemes(themeArray) {
        $.each(themeArray, function () {
            $('.kl_fp_themes').append('<li><a href="#" id="' + this + '" class="kl_template_theme kl_fp_theme" rel="' + this +
                '" title="' + this +
                ' theme"><img src="' + klToolsPath + '/images/template_thumbs/' +
                this + '.png" width="90"></a></li>');
        });
    }

    // Ensure that necessary sections exist for a given style, will also fix broken banner
    function themeElements(templateClass) {
        var modNum, modText, modTitle, templateBanner;
        // this first portion is designed to fix anything that might have broken
        // Look to see if kl_mod_num exists and grab value
        if ($(iframeID).contents().find('.kl_mod_num').length > 0 && $(iframeID).contents().find('.kl_mod_num').text() !== '') {
            modNum = $(iframeID).contents().find('.kl_mod_num').text();
        } else {
            modNum = '## ';
        }
        // Look to see if kl_mod_text exists and grab value
        if ($(iframeID).contents().find('.kl_mod_text').length > 0 && $(iframeID).contents().find('.kl_mod_text').text() !== '') {
            modText = $(iframeID).contents().find('.kl_mod_text').text();
        } else {
            modText = 'Text ';
        }
        // Look to see if title exists and grab value
        if ($(iframeID).contents().find('#kl_banner_right').length > 0 && $(iframeID).contents().find('#kl_banner_right').text() !== '') {
            modTitle = $(iframeID).contents().find('#kl_banner_right').text();
        } else {
            modTitle = 'Title';
        }

        // setup banner text with values
        templateBanner = '<h2><span id="kl_banner_left">' +
            '    <span class="kl_mod_text">' + modText + ' </span><span class="kl_mod_num">' + modNum + ' </span>' +
            '</span>' +
            '<span id="kl_banner_right">' + modTitle + '</span></h2>' +
            '</div>';
        // Look to see if kl_banner is intact
        if ($(iframeID).contents().find('#kl_banner').length > 0) {
            $(iframeID).contents().find('#kl_banner').html(templateBanner);
        } else {
            $(iframeID).contents().find('#kl_wrapper').prepend('<div id="kl_banner">' + templateBanner + '</div>');
        }
        // if not in the array, hide the banner
        if ($.inArray(templateClass, klToolsVariables.klBottomBannerPagesThemeArray) === -1) {
            if ($(iframeID).contents().find('#kl_banner_bottom').length > 0) {
                $(iframeID).contents().find('#kl_banner_bottom').hide();
            }
        // in the array, add or show the banner
        } else {
            if ($(iframeID).contents().find('#kl_banner_bottom').length > 0) {
                $(iframeID).contents().find('#kl_banner_bottom').show();
            } else {
                $(iframeID).contents().find('#kl_banner').append(klToolsVariables.klPagesBottomBanner);
            }
        }
    }

    ////// On Ready/Click functions  //////
    function themesReady() {
        var templateClass;
        // Output theme thumbs
        $('.kl_template_theme').click(function (e) {
            var previousTheme = '', wrapperClasses;
            e.preventDefault();
            templateCheck();
            scrollToElement('#kl_wrapper');
            // add the class for the selected template to the template-wrapper
            if ($(iframeID).contents().find('#kl_wrapper').hasClass('kl_show_title')) {
                wrapperClasses = $(iframeID).contents().find('#kl_wrapper').attr('class').replace('kl_show_title', '');
                previousTheme = $.trim(wrapperClasses);
            } else {
                previousTheme = $(iframeID).contents().find('#kl_wrapper').attr('class');
            }
            templateClass = $(this).attr('rel');
            if ($(iframeID).contents().find('#kl_banner').length === 0 || $.inArray(previousTheme, klToolsVariables.klBottomBannerPagesThemeArray) !== -1 || $.inArray(templateClass, klToolsVariables.klBottomBannerPagesThemeArray) !== -1) {
                templateClass = $(this).attr('rel');
                themeElements(templateClass);
            }
            $(iframeID).contents().find('#kl_wrapper').removeClass(previousTheme).addClass(templateClass);
            if ($(iframeID).contents().find('#kl_wrapper').hasClass(templateClass)) {
                $('.kl_template_theme').each(function () {
                    $(this).removeClass('kl_active_theme');
                });
                $(this).addClass('kl_active_theme');
            }
            if ($('.kl_banner_section').is(':checked') === false) {
                $('.kl_banner_section').prop('checked', true).trigger('change');
            }
            $('.kl_theme_color_pickers').show();
            initializeColorPicker('#kl_banner_background', '#kl_banner', 'background-color');
            initializeColorPicker('#kl_banner_text', '#kl_banner', 'color');
            initializeColorPicker('#kl_banner_heading_background', '#kl_banner h2', 'background-color');
            initializeColorPicker('#kl_banner_heading_text', '#kl_banner h2', 'color');
            initializeColorPicker('#kl_banner_left_background', '#kl_banner_left', 'background-color');
            initializeColorPicker('#kl_banner_left_text', '#kl_banner_left', 'color');
            initializeColorPicker('#kl_banner_type_background', '.kl_mod_text', 'background-color');
            initializeColorPicker('#kl_banner_type_text', '.kl_mod_text', 'color');
            initializeColorPicker('#kl_banner_title_background', '#kl_banner_right', 'background-color');
            initializeColorPicker('#kl_banner_title_text', '#kl_banner_right', 'color');
            initializeColorPicker('#kl_banner_num_background', '.kl_mod_num', 'background-color');
            initializeColorPicker('#kl_banner_num_text', '.kl_mod_num', 'color');
            removeTempContent();
        });
        $('.kl_remove_banner_left').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_banner_left').remove();
            $(iframeID).contents().find('#kl_banner h2').attr('style', 'padding-left: 10px;');
        });
        $('.kl_repair_theme').click(function (e) {
            e.preventDefault();
            templateClass = $('.kl_active_theme').attr('rel');
            themeElements(templateClass);
        });
        $('.kl_theme_color_toggle a').click(function (e) {
            e.preventDefault();
            $('.kl_theme_color_toggle a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            var activeSection = $(this).attr('rel');
            $('.kl_fp_theme_options').hide();
            $('.kl_wiki_theme_options').hide();
            $('.kl_custom_theme_options').hide();
            $('.' + activeSection + '_options').show();
        });
        $('.kl_fp_theme').click(function (e) {
            e.preventDefault();
            templateCheck();
            scrollToElement('#kl_wrapper');
            // add the class for the selected template to the kl_wrapper
            templateClass = $(this).attr('rel');
            $(iframeID).contents().find('#kl_wrapper').removeClass().addClass(templateClass);
            if ($('input.kl_banner_image_section').not(':checked')) {
                $('.kl_banner_image_section').prop('checked', true).trigger('change');
                $(iframeID).contents().find('#kl_banner_image').insertAfter($(iframeID).contents().find('#kl_banner'));
                bannerImageCheck();
            }
            if ($('input.kl_navigation_section').not(':checked')) {
                $('.kl_navigation_section').prop('checked', true).trigger('change');
                $(iframeID).contents().find('#kl_navigation').insertAfter($(iframeID).contents().find('#kl_banner_image'));
            }
        });
        $('.kl_highlight_element').mouseover(function () {
            var el = $(this),
                connectedElement = $(this).attr('rel'),
                timeoutID = setTimeout(function () {
                    $(iframeID).contents().find(connectedElement).addClass('kl_section_hover');
                    scrollToElement('#kl_banner');
                }, 500);
            el.mouseout(function () {
                connectedElement = $(this).attr('rel');
                $(iframeID).contents().find(connectedElement).removeClass('kl_section_hover');
                clearTimeout(timeoutID);
            });
        });
        customCSSCheck();
        currentPagesThemeCheck();
    }

    ////////// Custom Tools Accordion tab setup  //////  //////
    function themeTool() {
        var themesAccordionSection = '<h3 class="kl_wiki">' +
            '    Themes' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Themes</div>' +
            '      <div class=\'popover-content\'><p>Themes allow you to add a consistent style to your wiki pages and assignments.</p>' +
            '      <p>You can customize colors and specify whether or not the tools should look for a course level css file.</div>">' +
            '      &nbsp;<span class="screenreader-only">About Themes</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '    <div class="btn-group kl_theme_color_toggle kl_option_third_wrap">' +
            '       <a href="#" class="btn btn-small" rel="kl_fp_theme">Front</a>' +
            '       <a href="#" class="btn btn-small active" rel="kl_wiki_theme">Pages</a>' +
            '       <a href="#" class="btn btn-small" rel="kl_custom_theme">Customize</a>' +
            '    </div>' +
            '    <div class="kl_fp_theme_options kl_margin_bottom" style="display:none">' +
            '       <h4>Front Page Themes</h4>' +
            '       <ul class="unstyled kl_fp_themes">' +
            '       </ul>' +
            '       <a href="#" class="kl_wizard_trigger btn btn-mini btn-primary kl_margin_bottom kl_margin_top" data-tooltip="top" title="Opens Template Wizard in a new tab.">Add Custom Banner</a>' +
            '       <div class="kl_instructions_wrapper kl_wizard_notice"><p class="kl_instructions">To change the banner image, add the Template Wizard to the course navigation.</p></div>' +
            '    </div>' +
            '    <div class="kl_wiki_theme_options kl_margin_bottom">' +
            '       <h4>Pages Themes</h4>' +
            '       <ul class="unstyled kl_wiki_themes">' +
            '       </ul>' +
            '       <a class="btn btn-mini kl_remove_banner_left kl_remove"><i class="icon-end"></i> Remove Unit &amp; Number</a>' +
            '       <a class="btn btn-mini kl_repair_theme" data-tooltip="top" title="This will repair the current theme"><i class="fa fa-wrench"></i> Repair<span class="screenreader-only"> Theme</span></a>' +
            '    </div>' +
            '    <div class="kl_custom_theme_options" style="display:none;">' +
            '       <h4>Customize Theme Colors</h4>' +
            '       <table class="table table-striped table-condensed kl_theme_color_pickers"><thead><tr><th>Banner Colors</th><th>BG</th><th>Text</th></tr></thead>' +
            '           <tbody>' +
            '               <tr><td>Section</td><td class="pickerWidth"><input type="text" id="kl_banner_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_text"></td></tr>' +
            '               <tr><td>Heading <a class="kl_highlight_element" rel="#kl_banner h2" data-tooltip="top" title="Highlight Section"><i class="fa fa-eye"></i></a></td><td class="pickerWidth"><input type="text" id="kl_banner_heading_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_heading_text"></td></tr>' +
            '               <tr><td>Unit Wrapper <a class="kl_highlight_element" rel="#kl_banner_left" data-tooltip="top" title="Highlight Section"><i class="fa fa-eye"></i></a></td><td class="pickerWidth"><input type="text" id="kl_banner_left_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_left_text"></td></tr>' +
            '               <tr><td>Unit Name <a class="kl_highlight_element" rel=".kl_mod_text" data-tooltip="top" title="Highlight Section"><i class="fa fa-eye"></i></a></td><td class="pickerWidth"><input type="text" id="kl_banner_type_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_type_text"></td></tr>' +
            '               <tr><td>Unit Number <a class="kl_highlight_element" rel=".kl_mod_num" data-tooltip="top" title="Highlight Section"><i class="fa fa-eye"></i></a></td><td class="pickerWidth"><input type="text" id="kl_banner_num_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_num_text"></td></tr>' +
            '               <tr><td>Unit Title <a class="kl_highlight_element" rel="#kl_banner_right" data-tooltip="top" title="Highlight Section"><i class="fa fa-eye"></i></a></td><td class="pickerWidth"><input type="text" id="kl_banner_title_background"></td><td class="pickerWidth"><input type="text" id="kl_banner_title_text"></td></tr>' +
            '           </tbody>' +
            '       </table>' +
            '       <label><input type="checkbox" id="kl_custom_css_add"> Course Level CSS</label> &nbsp;' +
            '       <a class="help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '           title="<div class=\'popover-title\'>Course Level CSS</div>' +
            '           <div class=\'popover-content\'><p>Use this if you will be creating a custom stylesheet to override the default style.</p><p>This will look for a <em>/global/css/style.css</em> file in the course files.</p></div>">' +
            '           &nbsp;<span class="screenreader-only">About Course Level CSS</span>' +
            '       </a>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(themesAccordionSection);
        outputFrontPageThemes(klToolsVariables.klFrontPageThemeArray);
        outputThemes(klToolsVariables.klPagesThemeArray);
        outputThemes(klToolsVariables.klBottomBannerPagesThemeArray);
        themesReady();
    }

/////////////////////////////////////////////////////////////
//  SECTIONS PANEL                                         //
/////////////////////////////////////////////////////////////

    //// SUPPORTING FUNCTIONS ////
    // If the checked section exists, move it, if not add it
    function checkTemplateSection(sectionName, sectionArray) {
        var sectionTitle,
            container = $(iframeID).contents().find('#kl_wrapper');
        sectionName = sectionName.replace('#', '');
        if ($(iframeID).contents().find('#' + sectionName).length > 0) {
            $(iframeID).contents().find('#' + sectionName).appendTo(container).removeClass('kl_to_remove');
            checkRemove();
        } else {
            $(iframeID).contents().find('#kl_wrapper').append(sectionArray[sectionName]);
        }
        if ($('.kl_sections_list .' + sectionName + '_section').length === 0) {
            sectionTitle = sectionName.replace('kl_', '').replace('_', ' ');
            addSectionControls(sectionTitle, sectionName);
            bindHover();
        }
    }

    // Create a new section using the input in the template dialog
    function createSection() {
        templateCheck();
        var newSectionName, newSectionID, newSection;
        // Grab name from text field
        newSectionName = $('#kl_new_section_name').val();
        // Create a new id using the section name
        newSectionID = newSectionName.replace(/\W/g, '_');
        // Insert the new section into the TinyMCE editor
        newSection = '<div id="' + newSectionID + '">' +
            '    <h3>' + newSectionName + '</h3>' +
            '    <p>Insert content here.</p>' +
            '</div>';
        $(iframeID).contents().find('#kl_wrapper').append(newSection);
        // Clear the section name field
        $('#kl_new_section_name').val('');
        // Create an <li> for this section in the Sections List
        addSectionControls(newSectionName, newSectionID);
        // Put focus on new section
        scrollToElement('#' + newSectionID);
        highlightNewElement('#' + newSectionID);
        bindHover();
    }

    // This function loops through existing content and then updates section controls
    function identifySections() {
        var sectionTitle, newID;
        // for any div that does not have an id, add the text from the heading as the id
        $(iframeID).contents().find('#kl_wrapper').children('div:not([id])').each(function () {
            if ($(this).find('h3:first').length > 0) {
                sectionTitle = $(this).find('h3:first').text();
            } else if ($(this).find('h4:first').length > 0) {
                sectionTitle = $(this).find('h4:first').text();
            } else {
                sectionTitle = $(this).text();
            }
            if (sectionTitle.length > 25) {
                sectionTitle = sectionTitle.substring(0, 23) + '...';
            }
            newID = sectionTitle.replace(/\W/g, '_');
            if ($(iframeID).contents().find('#' + newID).length > 0) {
                newID = newID + '_';
            }
            $(this).attr('id', newID);
        });
        // take every div with an id
        $(iframeID).contents().find('#kl_wrapper').children('div').each(function () {
            var myValue, myTitle;
            if ($(this + '[id]')) {
                myValue = $(this).attr('id');
                if ($('.kl_template_sections_list input[value=' + myValue + ']').length > 0) {
                    $('.' + myValue + '_section').prop('checked', true);
                }
                myTitle = myValue.replace('kl_', '');
            } else {
                if ($(this).find('h3:first').length > 0) {
                    myTitle = $(this).find('h3:first').text();
                } else {
                    myTitle = $(this).text();
                }
            }
            myTitle = myTitle.replace(/_/g, ' ');
            if (myTitle.length > 25) {
                myTitle = myTitle.substring(0, 23) + '...';
            }
            addSectionControls(myTitle, myValue);
            $('.kl_element_color_pickers').show();
            initializeColorPicker('#kl_h3_background', '#kl_wrapper h3', 'background-color');
            initializeColorPicker('#kl_h3_text', '#kl_wrapper h3', 'color');
            initializeColorPicker('#kl_h4_background', '#kl_wrapper h4', 'background-color');
            initializeColorPicker('#kl_h4_text', '#kl_wrapper h4', 'color');
        });
        bindHover();
    }
    // Parent element of cursor position will become the title of the theme
    function markTitle() {
        $('#kl_sections_buttons').prepend(' <a class="btn btn-mini kl_mark_title kl_margin_bottom" href="#" data-tooltip="top"' +
            '    title="Place the cursor on the element you want to become the module title and click this button.">' +
            '    <i class="icon-text"></i> Make Title' +
            '</a>').append($('.kl_remove_empty').clone());
        $('.kl_mark_title').click(function (e) {
            var existingTitle = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode()).innerHTML;
            e.preventDefault();
            templateCheck();
            $(iframeID).contents().find('#kl_banner_right').html(existingTitle);
            // if it is an <h2> it will remove original
            tinyMCE.activeEditor.dom.remove(tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'h2'));
        });
    }
    // Make kl_sections_list sortable so sections can be reordered
    function sortableSections(sectionArray) {
        var connectedSection;
        $('.kl_sections_list').sortable({
            update: function () {
                // Add the basic template style if one is not already set
                templateCheck();
                // loop through the checked sections and move or add them
                $('.kl_sections_list li').each(function () {
                    connectedSection = $(this).attr('rel');
                    checkTemplateSection(connectedSection, sectionArray);
                });
                bindHover();
            }
        });
        $('.kl_sections_list').disableSelection();
    }
    // Wrap existing code into a new section and add to content portion "Selection to Section" button
    function wrapSection() {
        var tempSection, sectionTitle, newID, container;
        tinyMCE.activeEditor.focus();
        tinyMCE.activeEditor.selection.setContent('<div id="kl_temp_section">' + tinyMCE.activeEditor.selection.getContent() + '</div>');
        tempSection = $(iframeID).contents().find('#kl_temp_section');
        sectionTitle = $(tempSection).text();
        if (sectionTitle.length > 25) {
            sectionTitle = sectionTitle.substring(0, 20) + '...';
        }
        newID = sectionTitle.replace(/\W/g, '_');
        container = $(iframeID).contents().find('#kl_wrapper');
        $(container).append(tempSection);
        $(tempSection).attr('id', newID);
        // Create an <li> for this section in the Sections List
        addSectionControls(sectionTitle, newID);
    }
    // Selection to section button
    function selectionToSection() {
        $('#kl_sections_buttons').prepend(' <a class="selectionToSection btn btn-mini kl_margin_bottom" data-tooltip="top"' +
            ' title="Turn selected content into a new section.<br><span class=\'text-warning\'>' +
            '<strong>Content must contain a heading element!</strong></span>">' +
            '   <i class="icon-collection-save"></i> Selection to Section</a>');
        $('.selectionToSection').click(function () {
            templateCheck();
            wrapSection();
        });
    }
    // Wrap existing section as one of the default sections (i.e. Objectives, Readings, Lectures, etc)
    function wrapNamedSection(sectionName) {
        templateCheck();
        var tempSection,
            container = $(iframeID).contents().find('#kl_wrapper');
        tinyMCE.activeEditor.focus();
        tinyMCE.activeEditor.selection.setContent('<div id="' + sectionName + '">' + tinyMCE.activeEditor.selection.getContent() + '</div>');
        tempSection = $(iframeID).contents().find('#' + sectionName);
        $(container).append(tempSection);
        $('.kl_template_sections_list input[value=' + sectionName + ']').prop('checked', true).trigger('change');
        $('.kl_identify_section_' + sectionName).hide();
    }

    // Sections initialization functions
    function sectionsReady(sectionArray) {
        identifySections(sectionArray);
        sortableSections(sectionArray);
        selectionToSection();
        markTitle();
        // Add headings to the template section list
        $('.kl_introduction_section').parents('li').before('<li class="kl_li_heading">Content Page</li>');
        $('.kl_banner_section').parents('li').before('<li class="kl_li_heading">Front Page</li>');
        // Functions to run when a section checkbox is changed
        $('.kl_template_sections_list input:checkbox').change(function () {
            if ($(this).is(':checked')) {
                templateCheck();
                checkTemplateSection(this.value, sectionArray);
                // $('.kl_template_sections_list input:checkbox:checked').each(function () {
                // });
                $('.kl_element_color_pickers').show();
                initializeColorPicker('#kl_h3_background', '#kl_wrapper h3', 'background-color');
                initializeColorPicker('#kl_h3_text', '#kl_wrapper h3', 'color');
                initializeColorPicker('#kl_h4_background', '#kl_wrapper h4', 'background-color');
                initializeColorPicker('#kl_h4_text', '#kl_wrapper h4', 'color');
                $('.kl_identify_section_' + this.value).hide();
            } else {
                var targetSection = '#' + this.value;
                markToRemove(targetSection);
            }
            scrollToElement('#' + this.value);
            bindHover();
        });
        // When they click "Remove Unckecked Section(s)" make the necessary changes
        $('.kl_remove_sections').click(function () {
            // remove any sections that were unchecked
            $(iframeID).contents().find('.kl_to_remove').remove();
            $('.kl_remove_sections_wrapper').hide();
        });
        // "+" button next to new section field
        $('#kl_add_section').click(function (e) {
            e.preventDefault();
            createSection(sectionArray);
        });
        // Button that turns selected text into a predefined section
        $('.kl_identify_section').click(function (e) {
            e.preventDefault();
            var sectionName = $(this).attr('rel');
            wrapNamedSection(sectionName);
        });
        // create a new section if return/enter is pressed in the new section field
        $('#kl_new_section_name').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                createSection(sectionArray);
                return false;
            }
        });
        $('.kl_sections_btn').click(function (e) {
            e.preventDefault();
            $('#kl_sections_box').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 255 });
        });
        $('.kl_banner_image_section').change(function () {
            bannerImageCheck();
        });
        // Pull existing Canvas Pages
        // Duplicate Canvas list
        $('.kl_existing_content_btn').click(function (e) {
            e.preventDefault();
            $('#kl_import_content_box').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 265 });
        });
    }

    // Accordion Panel Content
    function sectionsTool(sectionArray) {
        var addAccordionSection, sectionTitle, displayTitle, templateContentBtns;
        if (toolsToLoad === 'syllabus') {
            sectionTitle = 'Syllabus Section Wrappers';
        } else {
            sectionTitle = 'Sections';
        }
        addAccordionSection = '<h3 class="kl_wiki">' + sectionTitle +
            '     <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '         title="<div class=\'popover-title\'>Content Sections</div>' +
            '         <div class=\'popover-content\'>' +
            '             <p>Sections provide a way to structure the content of your page.</p>' +
            '             <p>This tool allows you to add several predefined sections as well as add new sections.</p>' +
            '             <p>Once added, this tool will also allow you to rearrange your sections.</p>' +
            '         </div>">&nbsp;' +
            '         <span class="screenreader-only">About content sections.</span>' +
            '     </a>' +
            '</h3>' +
            '<div>' +
            '    <form class="form-inline input-append"><input id="kl_new_section_name" type="text" placeholder="New Section Title"><a href="#" id="kl_add_section" class="btn add-on"><i class="icon-add"></i><span class="screenreader-only">Add New Section</span></a></form>' +
            '    <ol class="unstyled kl_sections_list">' +
            '    </ol>' +
            '    <table class="table table-striped table-condensed kl_element_color_pickers"><thead><tr><th>Element Colors</th><th>BG</th><th>Text</th></tr></thead>' +
            '       <tbody>' +
            '           <tr><td>H3 Headings</td><td class="kl_picker_width"><input type="text" id="kl_h3_background"></td><td class="kl_picker_width"><input type="text" id="kl_h3_text"></td></tr>' +
            '           <tr><td>H4 Headings</td><td class="kl_picker_width"><input type="text" id="kl_h4_background"></td><td class="kl_picker_width"><input type="text" id="kl_h4_text"></td></tr>' +
            '       </tbody>' +
            '    </table>' +
            '    <div id="kl_sections_box" title="Template Sections">' +
            '       <ol class="kl_template_sections_list unstyled"></ol>' +
            '       <div id="kl_sections_buttons" class="kl_margin_bottom"></div>' +
            '       <div class="kl_remove_sections_wrapper kl_margin_bottom hide">' +
            '           <a href="#" class="btn btn-danger kl_remove_sections kl_margin_bottom"><i class="icon-trash"></i> Remove Section(s)</a>' +
            '           <p><strong>Warning:</strong> This will also delete any content within the section(s).</p>' +
            '       </div>' +
            '    </div>' +
            '    <div class="kl_template_content_btn"></div>' +
            '    <div id="kl_import_content_box" style="display:none;" title="Import Content from Page">' +
            '       <div id="kl_course_template_pages"></div>' +
            '       <div id="kl_existing_pages"></div>' +
            '       <h4>Copy page content by url</h4>' +
            '       <form class="form-inline input-append"><input id="kl_page_url" type="text" placeholder="Canvas page url" style="width:180px;"><a href="#" id="kl_get_existing" class="btn add-on" data-tooltip="top" title="Copy page contents by url"><i class="fa fa-files-o"></i><span class="screenreader-only">Get existing</span></a></form>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        // Loop through base sections array to populate the kl_sections_list
        $.each(sectionArray, function (key) {
            displayTitle = key.replace('kl_', '').replace('_', ' ');
            $('.kl_template_sections_list').append('<li>&nbsp;' +
                '<label><input type="checkbox" class="' + key + '_section" value="' + key + '"> <span class="kl_section_title">' + displayTitle + ' Section</span></label>' +
                '<a html="#" class="kl_identify_section kl_identify_section_' + key + ' icon-collection-save" rel="' + key + '" data-tooltip="left" title="Turn selected content into <br>' + displayTitle + ' section"> Identify ' + displayTitle + ' section</a>' +
                '</li>');
        });
        if (toolsToLoad !== 'syllabus') {
            templateContentBtns = '<div class="btn-group">' +
                '   <a href="#" class="btn btn-mini kl_sections_btn kl_margin_bottom fa fa-magic"> Template Sections</a>' +
                '   <a href="#" class="btn btn-mini kl_existing_content_btn kl_margin_bottom fa fa-files-o"> Copy Existing</a>' +
                '</div>';
        } else {
            templateContentBtns = '<a href="#" class="btn btn-mini kl_sections_btn kl_margin_bottom fa fa-magic"> Template Sections</a>';
        }
        $('.kl_template_content_btn').html(templateContentBtns);
        sectionsReady(sectionArray);
    }

/////////////////////////////////////////////////////////////
//  ACCESSIBILITY TOOLS                                    //
/////////////////////////////////////////////////////////////
    // Accessibility Checks
    function accessibilityToolsReady() {
        $('.kl_accessibility_color_check_toggle').click(function (e) {
            e.preventDefault();
            if ($('body').hasClass('kl_accessibility_color_check')) {
                $('body').removeClass('kl_accessibility_color_check');
                $(iframeID).contents().find('body').removeClass('kl_accessibility_color_check');
                $(this).removeClass('active');
            } else {
                $('body').addClass('kl_accessibility_color_check');
                $(iframeID).contents().find('body').addClass('kl_accessibility_color_check');
                $(this).addClass('active');
            }
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function accessibilityTools() {
        var addAccordionSection = '<h3 class="kl_wiki" style="margin-top: 10px;">' +
            '   Accessibility Checking' +
            '       <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Accessibility Checking Tools</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>This section includes controls for adding in a custom accordion group or tab group.</p>' +
            '            <p>The accordion or tabbed widget will appear at the cursor position. Panels can be rearranged after they are created.</p>' +
            '            <p>On the Canvas mobile app, panels and headings will appear as h4 titles with the content following after.</p>' +
            '        </div>">' +
            '           &nbsp;<span class="screenreader-only">Accessibility Checking Tools</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '<a href="#" class="btn btn-mini kl_accessibility_color_check_toggle kl_margin_bottom"><i class="fa fa-adjust"></i> Color Check</a>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        accessibilityToolsReady();
    }

/////////////////////////////////////////////////////////////
//  ACCORDION | TABS PANEL                                 //
/////////////////////////////////////////////////////////////

    //// SUPPORTING FUNCTIONS ////
    function deleteAccordion() {
        $('.kl_delete_acc_tool').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_custom_accordion_wrapper').remove();
            $(iframeID).contents().find('.kl_custom_accordion').remove();
            $('#kl_accordion_panels').empty();
            $('.kl_delete_acc_tool').hide();
        });
    }
    function deleteAccPanel() {
        // Bind Delete
        $('.kl_delete_acc_panel').click(function () {
            var panelToRemove = $(this).attr('rel');
            $(this).parent('li').remove();
            $(iframeID).contents().find(panelToRemove).remove();
        });
    }
    function markCurrentAcc() {
        $('.kl_acc_mark_current').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_current_acc').removeClass('kl_current_acc');
            if ($(this).hasClass('kl_current_acc')) {
                $(this).removeClass('kl_current_acc');
            } else {
                var panelNum = $(this).attr('rel');
                $(iframeID).contents().find(panelNum).addClass('kl_current_acc');
                $('#kl_accordion_panels .kl_current_acc').removeClass('kl_current_acc');
                $(this).addClass('kl_current_acc');
            }
            scrollToElement('.kl_custom_accordion');
        });
    }

    function getAccPanels() {
        if ($(iframeID).contents().find('.kl_custom_accordion').length > 0) {
            if ($(iframeID).contents().find('.kl_custom_accordion').length > 0 && $(iframeID).contents().find('.kl_custom_accordion_wrapper').length === 0) {
                $(iframeID).contents().find('.kl_custom_accordion').wrap('<div class="kl_custom_accordion_wrapper" />');
            }
            // update the classes to increment panels
            $(iframeID).contents().find('.kl_acc_panel_heading').each(function (i) {
                var regExpMatch, identifyCurrent, nextDivClass, panelTitle;
                // Renumber panels
                if ($(this).hasClass('kl_current_acc')) {
                    $(this).attr('class', 'kl_acc_panel_heading kl_panel_' + i + ' kl_current_acc');
                    identifyCurrent = ' kl_current_acc';
                } else {
                    $(this).attr('class', 'kl_acc_panel_heading kl_panel_' + i);
                    identifyCurrent = '';
                }
                // Renumber following div
                panelTitle = $(this).text();
                if (panelTitle.length > 20) {
                    panelTitle = panelTitle.substring(0, 17) + '...';
                }
                nextDivClass = $(this).next('div').attr('class');
                regExpMatch = /\bkl_panel_\b/g;
                if (nextDivClass.match(regExpMatch)) {
                    console.log(nextDivClass);
                    $(this).next('div').attr('class', 'kl_panel_' + i);
                }
                // Create Controls
                $('#kl_accordion_panels').append('<li rel=".kl_panel_' + i + '">' +
                    '<span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span> ' +
                    '<a href="#" class="kl_acc_mark_current' + identifyCurrent + '" rel=".kl_panel_' + i + '" title="Mark as default open panel"><i class="icon-check"></i><span class="screenreader-only">Mark as default open</span></a> ' +
                    panelTitle +
                    '<a class="kl_delete_acc_panel kl_remove icon-end pull-right" rel=".kl_panel_' + i + '" href="#" data-tooltip="left" title="Delete this panel.">' +
                    '    <span class="screenreader-only">Delete Accordion Panel</span>' +
                    '</a></li>');

            });
            $('.kl_delete_acc_tool').show();
        } else {
            $('.kl_delete_acc_tool').hide();
        }
        $('#kl_accordion_panels').sortable({
            update: function () {
                // loop through the checked panels and move or add them
                $('#kl_accordion_panels li').each(function () {
                    var panelClass = $(this).attr('rel');
                    $(iframeID).contents().find('.kl_custom_accordion').append($(iframeID).contents().find('h4' + panelClass));
                    $(iframeID).contents().find('.kl_custom_accordion').append($(iframeID).contents().find('div' + panelClass));
                });
                $('#kl_accordion_panels').empty();
                getAccPanels();
            }
        });
        $('#kl_accordion_panels').disableSelection();
        deleteAccPanel();
        deleteAccordion();
        markCurrentAcc();
    }
    function accordionCheck() {
        if ($(iframeID).contents().find('.kl_custom_accordion').length === 0) {
            templateCheck();
            $('.kl_delete_acc_tool').show();
            deleteAccordion();
            // Insert the new section into the TinyMCE editor at cursor
            tinyMCE.execCommand('mceInsertContent', false, '<div class="kl_custom_accordion"></div><p>&nbsp;</p>');
            // Bind a change function to bring up the remove button when unchecked
            $('#kl_new_acc_panel').focus();
        }
    }
    function addAccPanel() {
        accordionCheck();
        // Grab name from text field
        var newAccPanelName = $('#kl_new_acc_panel').val(),
            panelCount,
            panelNum,
            newPanelClass,
            newPanel;
        if (newAccPanelName !== '') {
            // Create a new class using the section name
            if ($(iframeID).contents().find('.kl_acc_panel_heading').length > 0) {
                panelCount = $(iframeID).contents().find('.kl_acc_panel_heading').length;
                panelNum = panelCount;
            } else {
                panelNum = 0;
            }

            newPanelClass = 'kl_panel_' + panelNum;
            // Insert the new section into the TinyMCE editor
            newPanel = '<h4 class="' + newPanelClass + ' kl_acc_panel_heading">' + newAccPanelName + '</h4>' +
                '<div class="' + newPanelClass + '">' +
                '    <p>' + newAccPanelName + ' panel contents.</p>' +
                '</div>';
            // If there is already an accordion, append the new one, otherwise overwrite the empty div
            if ($(iframeID).contents().find('.kl_acc_panel_heading').length > 0) {
                $(iframeID).contents().find('.kl_custom_accordion').append(newPanel);
            } else {
                $(iframeID).contents().find('.kl_custom_accordion').html(newPanel);
            }
            // Clear the section name field
            $('#kl_new_acc_panel').val('');
            // Put focus on new section
            scrollToElement('.' + newPanelClass);
            highlightNewElement('.' + newPanelClass);
            deleteAccPanel();
            $('#kl_accordion_panels').html('');
            getAccPanels();
            bindHover();
        }
    }
    // Tabs //
    function deleteTabSection() {
        $('.kl_delete_tab_tool').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_tabbed_section').remove();
            $('#kl_tab_panels').empty();
            $('.kl_delete_tab_tool').hide();
            $('.kl_tab_options form').show();
        });
    }
    function deleteTabPanel() {
        // Bind Delete
        $('.kl_delete_tab_panel').click(function () {
            var panelToRemove = $(this).attr('rel');
            $(this).parent('li').remove();
            $(iframeID).contents().find(panelToRemove).remove();
        });
    }
    function tabsCheck() {
        if ($(iframeID).contents().find('.kl_tabbed_section').length === 0) {
            templateCheck();
            $('.kl_delete_tab_tool').show();
            deleteTabPanel();
            deleteTabSection();
            // Insert the new section into the TinyMCE editor
            if ($('.kl_tab_minimal').hasClass('active')) {
                tinyMCE.execCommand('mceInsertContent', false, '<div class="kl_tabbed_section ui-tabs-minimal" /><p>&nbsp;</p>');
            } else {
                tinyMCE.execCommand('mceInsertContent', false, '<div class="kl_tabbed_section" /><p>&nbsp;</p>');
            }
            $('#kl_new_tab_panel').focus();
        }
    }
    function markCurrentTab() {
        $('.kl_tab_mark_current').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_current_tab').removeClass('kl_current_tab');
            if ($(this).hasClass('kl_current_tab')) {
                $(this).removeClass('kl_current_tab');
            } else {
                var tabNum = $(this).attr('rel');
                $(iframeID).contents().find('.' + tabNum).addClass('kl_current_tab');
                $('#kl_tab_panels .kl_current_tab').removeClass('kl_current_tab');
                $(iframeID).contents().find('#' + tabNum).addClass('kl_current_tab');
                $(this).addClass('kl_current_tab');
            }
            scrollToElement('.kl_tabbed_section');
        });
    }
    function getTabPanels() {
        $('#kl_tab_panels').html('');
        if ($(iframeID).contents().find('.kl_tabbed_section').length > 0) {
            $(iframeID).contents().find('.kl_tabbed_section h4').each(function (i) {
                var identifyCurrent, panelTitle, sortableImage;
                if ($(this).hasClass('kl_current_tab')) {
                    $(this).attr('class', 'kl_tab_' + i + ' kl_current_tab');
                    identifyCurrent = ' kl_current_tab';
                } else {
                    $(this).attr('class', 'kl_tab_' + i);
                    identifyCurrent = '';
                }
                panelTitle = $(this).text();
                sortableImage = '<span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span> ';
                $('#kl_tab_panels').append('<li rel=".kl_tab_' + i + '">' +
                    sortableImage +
                    '<a href="#" class="kl_tab_mark_current' + identifyCurrent + '" rel="kl_tab_' + i + '" title="Mark as default open tab"><i class="icon-check"></i><span class="screenreader-only">Mark as default open</span></a> ' +
                    panelTitle +
                    '<a class="kl_delete_tab_panel kl_remove icon-end pull-right" rel=".kl_tab_' + i + '" href="#" data-tooltip="left" title="Delete this panel.">' +
                    '    <span class="screenreader-only">Delete Tab Panel</span>' +
                    '</a></li>');
            });
            $(iframeID).contents().find('.kl_tabbed_section div').each(function (i) {
                if ($(this).hasClass('kl_current_tab')) {
                    $(this).attr('class', 'kl_tab_content kl_tab_' + i + ' kl_current_tab');
                } else {
                    $(this).attr('class', 'kl_tab_content kl_tab_' + i);
                }
                $(this).attr('id', 'kl_tab_' + i);
            });
            $('.kl_delete_tab_tool').show();
            if ($(iframeID).contents().find('.kl_tabbed_section').hasClass('ui-tabs-minimal')) {
                $('.kl_tab_minimal').addClass('active');
            } else {
                $('.kl_tab_regular').addClass('active');
            }
        } else {
            $('.kl_delete_tab_tool').hide();
        }
        $('#kl_tab_panels').sortable({
            update: function () {
                // loop through the checked panels and move or add them
                $('#kl_tab_panels li').each(function () {
                    var panelClass = $(this).attr('rel');
                    $(iframeID).contents().find('.kl_tabbed_section').append($(iframeID).contents().find('h4' + panelClass));
                    $(iframeID).contents().find('.kl_tabbed_section').append($(iframeID).contents().find('div' + panelClass));
                });
            }
        });
        $('#kl_tab_panels').disableSelection();
        deleteTabPanel();
        deleteTabSection();
        markCurrentTab();
        // Check for old tabs layout and alert about update
        if ($(iframeID).contents().find('.custom-tabs').length > 0) {
            $('.kl_tab_options').append('<div class="alert alert-error">Tabs have been updated to be more versital, these controls will not work with your current tabs</div>');
        }
    }
    function addTabPanel() {
        var newTabPanelName, panelCount, panelNum, newPanelClass, newPanel, panelClass;
        tabsCheck();
        // Grab name from text field
        newTabPanelName = $('#kl_new_tab_panel').val();
        if (newTabPanelName !== '') {
        // Create a new class using the tab li
            if ($(iframeID).contents().find('.kl_tabbed_section h4').length > 0) {
                panelCount = $(iframeID).contents().find('.kl_tabbed_section h4').length;
                panelNum = panelCount;
            } else {
                panelNum = 0;
            }

            newPanelClass = 'kl_tab_' + panelNum;
        // Insert the new section into the TinyMCE editor

            newPanel = '<h4 class="' + newPanelClass + '">' + newTabPanelName + '</h4>' +
                '<div id="kl_tab_' + panelNum + '" class="kl_tab_content ' + newPanelClass + '">' +
                '    <p>' + newTabPanelName + ' panel contents.</p>' +
                '</div>';
                // If there is already an accordion, append the new one, otherwise overwrite the empty div
            if ($(iframeID).contents().find('.kl_tabbed_section h4').length > 0) {
                $(iframeID).contents().find('.kl_tabbed_section').append(newPanel);
            } else {
                $(iframeID).contents().find('.kl_tabbed_section').html(newPanel);
            }
        // Create an <li> for this section in the Sections List
            $('#kl_tab_panels').append('<li rel=".' + newPanelClass + '"><span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span> ' +
                '<a href="#" class="kl_tab_mark_current" rel="' + newPanelClass + '" title="Mark as default open tab"><i class="icon-check"></i><span class="screenreader-only">Mark as default open</span></a> ' +
                newTabPanelName +
                '<a class="kl_delete_tab_panel kl_remove icon-end pull-right" rel=".' + newPanelClass + '" href="#" data-tooltip="left" title="Delete this panel.">' +
                '    <span class="screenreader-only">Delete Tab Panel</span>' +
                '</a></li>');
        // Put focus on new section
            scrollToElement('.' + newPanelClass);
            highlightNewElement('.' + newPanelClass);
            bindHover();
        // Clear the section name field
            $('#kl_new_tab_panel').val('');

            deleteTabPanel();
        }
        $('#kl_tab_panels').sortable({
            update: function () {
                // loop through the checked panels and move or add them
                $('#kl_tab_panels li').each(function () {
                    panelClass = $(this).attr('rel');
                    $(iframeID).contents().find('.kl_tabbed_section').append($(iframeID).contents().find('h4' + panelClass));
                    $(iframeID).contents().find('.kl_tabbed_section').append($(iframeID).contents().find('div' + panelClass));
                });
            }
        });
        $('#kl_tab_panels').disableSelection();
        getTabPanels();
    }

    ////// READY FUNCTION //////
    function accordionTabsToolReady() {
    //// TYPE SELECTOR ////
        $('.kl_accordion_or_tabs a').click(function (e) {
            e.preventDefault();
            $('.kl_accordion_or_tabs a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            var activeSection = $(this).attr('rel');
            $('.kl_accordion_options').hide();
            $('.kl_tabs_options').hide();
            $('.' + activeSection + '_options').show();
            if ($('.' + activeSection).length > 0) {
                scrollToElement('.' + activeSection);
            }
        });
    //// ACCORDION ////
        // Add a new panel to bottom of list
        $('#kl_add_acc_panel').click(function (e) {
            e.preventDefault();
            addAccPanel();
        });
        // Remove accordion section
        $('.kl_delete_acc_panel').click(function (e) {
            e.preventDefault();
            var panelToRemove = $(this).attr('rel');
            $(this).parent('li').remove();
            $(iframeID).contents().find(panelToRemove).remove();
        });

        // create a new section if return/enter is pressed in the new section field
        $('#kl_new_acc_panel').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                addAccPanel();
                return false;
            }
        });
    //// TABS ////
        // Add a new panel to bottom of list
        $('#kl_add_tab_panel').click(function (e) {
            e.preventDefault();
            addTabPanel();
        });
        // Remove tab section
        $('.kl_delete_tab_panel').click(function (e) {
            e.preventDefault();
            var panelToRemove = $(this).attr('rel');
            $(this).parent('li').remove();
            $(iframeID).contents().find(panelToRemove).remove();
        });
        // create a new section if return/enter is pressed in the new section field
        $('#kl_new_tab_panel').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                addTabPanel();
                return false;
            }
        });
        // Tab style
        $('.kl_tab_minimal').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_tabbed_section').addClass('ui-tabs-minimal');
            $(this).addClass('active');
            $('.kl_tab_regular').removeClass('active');
        });
        $('.kl_tab_regular').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_tabbed_section').removeClass('ui-tabs-minimal');
            $(this).addClass('active');
            $('.kl_tab_minimal').removeClass('active');
        });

        getAccPanels();
        getTabPanels();
        bindHover();
    }


    ////// Custom Tools Accordion tab setup  //////
    function accordionTabsTool() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            '   Accordion | Tabs' +
            '       <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Accordion/Tabs Tool</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>This section includes controls for adding in a custom accordion group or tab group.</p>' +
            '            <p>The accordion or tabbed widget will appear at the cursor position. Panels can be rearranged after they are created.</p>' +
            '            <p>On the Canvas mobile app, panels and headings will appear as h4 titles with the content following after.</p>' +
            '        </div>">' +
            '           &nbsp;<span class="screenreader-only">About Accordion/Tabs tool.</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '    <div class="btn-group kl_accordion_or_tabs kl_option_half_wrap">' +
            '        <a href="#" class="btn btn-small active" rel="kl_accordion">Accordion</a>' +
            '        <a href="#" class="btn btn-small" rel="kl_tabs">Tabs</a>' +
            '    </div>' +
            '    <div class="kl_accordion_options">' +
            '        <h4>Accordion Widget' +
            '               <a class="kl_delete_acc_tool kl_remove icon-end pull-right" href="#" data-tooltip="left" title="Delete Accordion Widget.">' +
            '                   <span class="screenreader-only">Delete Accordion Widget</span>' +
            '               </a>' +
            '        </h4>' +
            '        <form class="form-inline input-append">' +
            '           <input id="kl_new_acc_panel" type="text" placeholder="New Panel Title">' +
            '           <a href="#" id="kl_add_acc_panel" class="btn add-on" data-tooltip="left" ' +
            '               title="<p>If no accordion exits, this will create one.</p>' +
            '               <p>If an accordion exists, this will add a new section.</p>">' +
            '               <i class="icon-add"></i><span class="screenreader-only">' +
            '               Add Accordion Section</span>' +
            '           </a>' +
            '        </form>' +
            '        <ul id="kl_accordion_panels" class="unstyled"></ul>' +
            '    </div>' +
            '    <div class="kl_tabs_options" style="display:none;">' +
            '        <h4>Tabs Widget<a class="kl_delete_tab_tool kl_remove icon-end pull-right" href="#" data-tooltip="left" title="Delete Tabs Widget.">' +
            '                <span class="screenreader-only">Delete Tabs Widget</span>' +
            '            </a></h4>' +
            '        <form class="form-inline input-append">' +
            '           <input id="kl_new_tab_panel" type="text" placeholder="New Tab Title">' +
            '           <a href="#" id="kl_add_tab_panel" class="btn add-on" data-tooltip="left" ' +
            '               title="<p>If no tab section exits, this will create one.</p>' +
            '               <p>If an tabs exists, this will add a new section.</p>">' +
            '               <i class="icon-add"></i><span class="screenreader-only">' +
            '               Add Tab Section</span>' +
            '           </a>' +
            '        </form>' +
            '        <ul id="kl_tab_panels" class="unstyled"></ul>' +
            '        <div class="btn-group-label">' +
            '            <span>Style:</span>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_tab_regular active" data-tooltip="top" title="Tab content area is bordered on all sides.">Regular Tabs</a> ' +
            '                <a href="#" class="btn btn-mini kl_tab_minimal" data-tooltip="top" title="Tab content area only has a top border.">Minimal Tabs</a> ' +
            '            </div>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '        <p class="kl_instructions">Insert an accordion or tab widget at current <span class="text-success"><strong>cursor position</strong></span></p>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        accordionTabsToolReady();
    }

/////////////////////////////////////////////////////////////
//  ADVANCED LISTS                                         //
///////////////////////////////////////////////////////////// 

    function changeListStyle(selectedStyle) {
        var parentList, currentStyle, regExpMatch, cleanedStyle, newStyle;
        // Get parent element
        parentList = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'ol, ul');
        // If it's unstyled, remove that class
        tinyMCE.DOM.removeClass(parentList, 'unstyled');
        // Get the styles from the parent element
        currentStyle = tinyMCE.DOM.getAttrib(parentList, 'style');
        // Look through the classes for any class beginning with "icon-" and remove it
        regExpMatch = /\b\list-style-type: \w+\-?\w+\-?\w+;\s?/g;
        cleanedStyle = currentStyle.replace(regExpMatch, '');
        // Clean up an extra spaces
        cleanedStyle = cleanedStyle.replace('  ', ' ');
        // Grab the new class based on which icon link they clicked and combine with existing classes
        newStyle = selectedStyle + ' ' + cleanedStyle;
        // Clean up extra spaces and add to parent
        newStyle = newStyle.trim();
        tinyMCE.DOM.setAttrib(parentList, 'style', newStyle);
    }

    ////// On Ready/Click functions  //////
    function advancedListsReady() {
        //// TYPE SELECTOR ////
        $('.kl_list_type a').click(function (e) {
            var activeSection = $(this).attr('rel');
            e.preventDefault();
            $('.kl_list_type a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            // scrollToElement('.custom-"+activeSection);
            $('.kl_ol_ul_section').hide();
            $('.kl_definition_list_section').hide();
            $(activeSection).show();
        });
    // Definition Lists
        $('.kl_add_definition_list').click(function (e) {
            e.preventDefault();
            var insertDefList = '<dl><dt>Term</dt><dd>Definition</dd></dl><p>&nbsp;</p>';
            tinyMCE.execCommand('mceInsertContent', false, insertDefList);
        });
        $('.kl_add_dl_item').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('dl').append('<dt>Term</dt><dd>Definition</dd>');
        });
        $('.kl_dl_horizontal').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('dl').addClass('dl-horizontal');
            $(this).addClass('active');
            $('.kl_dl_vertical').removeClass('active');
        });
        $('.kl_dl_vertical').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('dl').removeClass('dl-horizontal');
            $(this).addClass('active');
            $('.kl_dl_horizontal').removeClass('active');
        });
        $('.kl_pill_list').click(function () {
            var parentList, currentClass, regExpMatch;
            parentList = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'ul, ol');
            // Get the styles from the parent element
            currentClass = tinyMCE.DOM.getAttrib(parentList, 'class');
            // If the parent already has the class, remove it otherwise add it
            regExpMatch = /\bpill\b/g;
            if (currentClass.match(regExpMatch)) {
                tinyMCE.DOM.removeClass(parentList, 'pill');
                $(this).removeClass('active');
            } else {
                tinyMCE.DOM.addClass(parentList, 'pill');
                $(this).addClass('active');
            }
        });

        // Ordered/Unordered Lists
        $('.kl_list_style_type').click(function (e) {
            e.preventDefault();
            var selectedStyle = $(this).attr('rel');
            changeListStyle(selectedStyle);
        });
        $('.kl_indent_list').click(function (e) {
            e.preventDefault();
            tinyMCE.execCommand('Indent');
        });
        $('.kl_outdent_list').click(function (e) {
            e.preventDefault();
            tinyMCE.execCommand('Outdent');
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function advancedListsTool() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            '    Advanced Lists' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Advanced Lists Tool</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p><strong>Indented Lists</strong></p>' +
            '            <p>Create multiple layers of indented order and unordered lists.<br>' +
            '            <p><strong>Definiton Lists</strong></p>' +
            '            <p>Add Definition lists (horizontal or vertical).<br>' +
            '            <em>Example:</em></p>' +
            '            <dl style=\'margin:5px 0;border:solid 1px #cccccc;padding: 3px;\'><dt>Term</dt><dd>Definition</dd></dl>' +
            '            <p><strong>Icon Lists</strong></p>' +
            '            <p>Add icons to list items.</p>' +
            '            <p><strong>Unstyled Lists</strong></p>' +
            '            <p>Remove bullets or numbers from existing lists in your content.</p>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About advanced lists.</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '    <div class="btn-group kl_list_type kl_option_half_wrap">' +
            '        <a href="#" class="btn btn-small active" style="width: 105px;" rel=".kl_ol_ul_section">Ordered/Unordered</a>' +
            '        <a href="#" class="btn btn-small" style="width:80px;" rel=".kl_definition_list_section">Definition</a>' +
            '    </div>' +
            '    <div class="kl_ol_ul_section">' +
            '        <h4>Ordered/Unordered List</h4>' +
            '        <div class="btn-group-label">' +
            '            <span>Ordered List Style:</span><br>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: decimal" data-tooltip="top" title="Decimal">1</a>' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: decimal-leading-zero" data-tooltip="top" title="Decimal with leading zero">01</a>' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: lower-alpha;" data-tooltip="top" title="Lower Alpha">a</a>' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: upper-alpha;" data-tooltip="top" title="Upper Alpha">A</a>' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: lower-roman;" data-tooltip="top" title="Lower Roman">i</a>' +
            '                <a class="btn btn-mini kl_list_style_type" href="#" rel="list-style-type: upper-roman;" data-tooltip="top" title="Upper Roman">I</a>' +
            '                <a class="btn btn-mini kl_list_style_type kl_remove" href="#" rel="list-style-type: none;" data-tooltip="top" title="No Numbering or bullets"><i class="icon-end"></i> None</a>' +
            '            </div><br>' +
            '            <span>Unordered List Style:</span><br>' +
            '            <div class="btn-group">' +
            '                <a class="btn btn-mini kl_list_style_type kl_margin_bottom" href="#" rel="list-style-type: circle;"><i class="fa fa-circle-o"></i>&nbsp; Circle</a>' +
            '                <a class="btn btn-mini kl_list_style_type kl_margin_bottom" href="#" rel="list-style-type: disc;"><i class="fa fa-circle"></i>&nbsp; Disc</a>' +
            '                <a class="btn btn-mini kl_list_style_type kl_margin_bottom" href="#" rel="list-style-type: square;"><i class="fa fa-square"></i>&nbsp; Square</a>' +
            '                <a class="btn btn-mini kl_list_style_type kl_margin_bottom kl_remove" href="#" rel="list-style-type: none;" data-tooltip="top" title="No Numbering or bullets"><i class="icon-end"></i> None</a>' +
            '            </div>' +
            '        </div>' +
            '        <div class="btn-group-label kl_margin_bottom">' +
            '            <div class="btn-group">' +
            '                <a class="btn btn-mini kl_outdent_list" data-tooltip="top" title="Outdent list one level"><i class="icon-outdent2"></i> Outdent</a>' +
            '                <a class="btn btn-mini kl_indent_list" data-tooltip="top" title="Indent list one level"><i class="icon-indent2"></i> Indent</a>' +
            '            </div>' +
            '            <span>Nested List</span>' +
            '        </div>' +
            '        <div class="btn-group-label kl_margin_bottom">' +
            '            <div class="btn-group">' +
            '                <a class="btn btn-mini kl_pill_list" href="#" data-tooltip="top" title="Horizontal list with rounded borders. <br>Example: <ul class=\'pill\'><li>item 1</li><li>item 2</li><li>item 3</li></ul>">Pill List on/off</a>' +
            '            </div>' +
            '            <span>Pill List</span>' +
            '        </div>' +
            '        <div class="kl_instructions_wrapper">' +
            '           <div class="kl_instructions">' +
            '               <p>Select an <span class="text-success"><strong>existing list</strong></span> in your content.</p>' +
            '               <p>Add <a href="#" class="kl_icons_activate btn btn-mini fa fa-tags">Icons</a> for additional customization</p>' +
            '           </div>' +
            '       </div>' +
            '    </div>' +
            '    <div class="kl_definition_list_section" style="display:none;">' +
            '        <h4>Definition List</h4>' +
            '        <a class="kl_add_definition_list icon-add btn btn-mini" href="#" data-tooltip="left" title="Insert a definition list at cursor position."> New Definition List</a>' +
            '        <a class="kl_add_dl_item icon-add btn btn-mini" href="#" data-tooltip="left" title="Add an item to definition list(s) in content area."> Add Item</a><br>' +
            '        <div class="btn-group-label" style="margin-top:10px;">' +
            '            <span>Layout</span>:' +
            '            <div class="btn-group">' +
            '                <a class="kl_dl_horizontal btn btn-mini" href="#" data-tooltip="left" title="Change definition list(s) to horizontal layout."> Horizontal</a>' +
            '                <a class="kl_dl_vertical btn btn-mini" href="#" data-tooltip="left" title="Change definition list(s) to vertical layout."> Vertical</a>' +
            '            </div>' +
            '        </div>' +
            '        <div class="kl_instructions_wrapper">' +
            '            <p class="kl_instructions">List will be added at <span class="text-success"><strong>cursor position</strong></span></p>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        // accordionOptions();
        advancedListsReady();
    }

/////////////////////////////////////////////////////////////
//  BORDERS AND SPACING                                    //
///////////////////////////////////////////////////////////// 

    ////// Supporting functions  //////
    function removeBorders(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'border');
        tinyMCE.DOM.removeClass(parentElement, 'border-trbl');
        tinyMCE.DOM.removeClass(parentElement, 'border-rbl');
        tinyMCE.DOM.removeClass(parentElement, 'border-tbl');
        tinyMCE.DOM.removeClass(parentElement, 'border-tl');
        tinyMCE.DOM.removeClass(parentElement, 'border-b');
        tinyMCE.DOM.removeClass(parentElement, 'border-t');
    }
    function removeBorderRadius(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'border-round');
        tinyMCE.DOM.removeClass(parentElement, 'border-round-b');
        tinyMCE.DOM.removeClass(parentElement, 'border-round-t');
        tinyMCE.DOM.removeClass(parentElement, 'border-round-tl');
    }
    function removePadding(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'pad-box-mega');
        tinyMCE.DOM.removeClass(parentElement, 'pad-box');
        tinyMCE.DOM.removeClass(parentElement, 'pad-box-mini');
        tinyMCE.DOM.removeClass(parentElement, 'pad-box-micro');
    }
    function removeContentBox(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'content-box');
        tinyMCE.DOM.removeClass(parentElement, 'content-box-mini');
    }

    ////// On Ready/Click functions  //////
    function bordersAndSpacingReady() {
        var myClass, elementType, parentElement;
        $('.kl_border_apply a').click(function (e) {
            e.preventDefault();
            $('.kl_border_apply a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
        });
        $('.kl_custom_borders').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            elementType = $('.kl_border_apply a.active').attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), elementType);
            removeBorders(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
        $('.kl_custom_border_radius').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            elementType = $('.kl_border_apply a.active').attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), elementType);
            removeBorderRadius(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
        $('.kl_custom_padding').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            elementType = $('.kl_border_apply a.active').attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), elementType);
            removePadding(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
        $('.kl_content_box').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            elementType = $('.kl_border_apply a.active').attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), elementType);
            removeContentBox(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function bordersAndSpacingTool() {
        var toolsAccordionSection = '<h3 class="kl_wiki">' +
            'Borders &amp; Spacing' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Borders and Spacing</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>This section contains tools for adding borders and spacing to paragraph tags, headings and divs<p>' +
            '            <p>To use:</p>' +
            '            <ol>' +
            '                <li>Position the cursor anywhere in the paragraph, heading or div you want to style.</li>' +
            '                <li>Click the button for the style you wish to add.</li>' +
            '            </ol>' +
            '            <p>To remove styling:</p>' +
            '            <ol>' +
            '                <li>Position the cursor anywhere in paragraph, heading or div containing the border or spacing.</li>' +
            '                <li>Click the &ldquo;<i class=\'remove icon-end\'></i>&rdquo; button.</li>' +
            '            </ol>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About Borders and Spacing.</span>' +
            '    </a>' +
            '</h3>' +
            '<div class="kl_borders_spacing">' +
            '<div class="btn-group-label">' +
            '    <span>Apply to:</span>' +
            '    <div class="btn-group kl_border_apply">' +
            '        <a href="#" class="btn btn-mini active" rel="p, h2, h3, h4, h5">Paragraph/Heading</a>' +
            '        <a href="#" class="btn btn-mini" rel="div">DIV</a>' +
            '    </div>' +
            '</div>' +
            '<div>' +
            '    <div class="btn-group-label kl_margin_bottom"><span>Border:</span>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-trbl" data-tooltip="top" title="Full Borders"><span class="border border-trbl">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-rbl" data-tooltip="top" title="Right, Bottom and Left Borders"><span class="border border-rbl">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-tbl" data-tooltip="top" title="Top, Bottom, and Left Borders"><span class="border border-tbl">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-tl" data-tooltip="top" title="Top and Left Borders"><span class="border border-tl">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-b" data-tooltip="top" title="Bottom Border"><span class="border border-b">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_borders" rel="border border-t" data-tooltip="top" title="Top Border"><span class="border border-t">&nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_remove icon-end kl_custom_borders" rel="" data-tooltip="top" title="Remove borders from selected paragraph or heading.">&nbsp;</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_margin_bottom"><span>Border Radius:</span>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_custom_border_radius" rel="border-round" data-tooltip="top" title="All corners rounded"><span class="border border-trbl border-round">&nbsp; &nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_border_radius" rel="border-round-b" data-tooltip="top" title="Bottom corners rounded"><span class="border border-trbl border-round-b">&nbsp; &nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_border_radius" rel="border-round-t" data-tooltip="top" title="Top corners rounded"><span class="border border-trbl border-round-t">&nbsp; &nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_custom_border_radius" rel="border-round-tl" data-tooltip="top" title="Top Left corner rounded"><span class="border border-trbl border-round-tl">&nbsp; &nbsp; &nbsp; &nbsp; </span></a>' +
            '            <a href="#" class="btn btn-mini kl_remove icon-end kl_custom_border_radius" rel="" data-tooltip="top" title="Remove border radius from selected paragraph or heading.">&nbsp;</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_margin_bottom"><span>Padding:</span>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_custom_padding" rel="pad-box-mega">Mega</a>' +
            '            <a href="#" class="btn btn-mini kl_custom_padding" rel="pad-box">Normal</a>' +
            '            <a href="#" class="btn btn-mini kl_custom_padding" rel="pad-box-mini">Mini</a>' +
            '            <a href="#" class="btn btn-mini kl_custom_padding" rel="pad-box-micro">Micro</a>' +
            '            <a href="#" class="btn btn-mini kl_remove icon-end kl_custom_padding" rel="" data-tooltip="top" title="Remove padding from selected paragraph or heading.">&nbsp;</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_margin_bottom"><span>Margin:</span><br>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_content_box" rel="content-box" data-tooltip="top" title="Content boxes automatically clear their floated children and have default margins.">Regular</a>' +
            '            <a href="#" class="btn btn-mini kl_content_box" rel="content-box-mini" data-tooltip="top" title="A mini content box has half the margin of the regular content box.">Mini</a>' +
            '            <a href="#" class="btn btn-mini kl_remove icon-end kl_content_box" rel="" data-tooltip="top" title="Remove content box from selected paragraph or heading.">&nbsp;</a>' +
            '        </div>' +
            '    </div>' +
            '</div>' +
            '<div class="kl_instructions_wrapper">' +
            '   <p class="kl_instructions">Place your <span class="text-success"><strong>cursor</strong></span> within the element you want to edit.</p>' +
            '</div>' +
            '</div>';
        $('#kl_tools_accordion').append(toolsAccordionSection);
        bordersAndSpacingReady();
    }

/////////////////////////////////////////////////////////////
//  BUTTONS                                                //
///////////////////////////////////////////////////////////// 

    ////// Supporting functions  //////
    function removeButtonStyle(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'btn');
        tinyMCE.DOM.removeClass(parentElement, 'btn-primary');
        tinyMCE.DOM.removeClass(parentElement, 'btn-info');
        tinyMCE.DOM.removeClass(parentElement, 'btn-success');
        tinyMCE.DOM.removeClass(parentElement, 'btn-warning');
        tinyMCE.DOM.removeClass(parentElement, 'btn-danger');
        tinyMCE.DOM.removeClass(parentElement, 'btn-inverse');
        tinyMCE.DOM.removeClass(parentElement, 'btn-link');
    }
    function removeButtonSize(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'btn');
        tinyMCE.DOM.removeClass(parentElement, 'btn-large');
        tinyMCE.DOM.removeClass(parentElement, 'btn-small');
        tinyMCE.DOM.removeClass(parentElement, 'btn-mini');
    }

    ////// On Ready/Click functions  //////
    function customButtonsReady() {
        var myClass, parentElement;
        $('.kl_custom_button_style').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'a');
            removeButtonStyle(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
        $('.kl_custom_button_size').click(function (e) {
            e.preventDefault();
            myClass = $(this).attr('rel');
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'a');
            removeButtonSize(parentElement);
            tinyMCE.DOM.addClass(parentElement, myClass);
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function customButtons() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            'Buttons' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Buttons</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>A variety of predefined buttons that can be created as links in your content.</p>' +
            '            <p>To add a button:<p>' +
            '            <ol>' +
            '                <li>Select an existing link that you would like turned into a button.</li>' +
            '                <li>Click on the button style of your choice.</li>' +
            '            </ol>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About Buttons.</span>' +
            '    </a>' +
            '</h3>' +
            '<div id="kl_custom_buttons">' +
            '   <div class="btn-group-label kl_btn_examples kl_margin_bottom">' +
            '       <span>Style:</span><br>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn" rel="btn">Default Button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-primary" rel="btn btn-primary">Primary button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-info" rel="btn btn-info">Info button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-success" rel="btn btn-success">Success button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-warning" rel="btn btn-warning">Warning button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-danger" rel="btn btn-danger">Danger button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-inverse" rel="btn btn-inverse">Inverse button</a>' +
            '       <a href="#" class="kl_custom_button_style btn-mini btn btn-link" rel="btn btn-link">Link button</a>' +
            '   </div>' +
            '   <div class="btn-group-label kl_margin_bottom">' +
            '   <span>Sizes:</span><br>' +
            '       <div class="btn-group">' +
            '           <a href="#" class="kl_custom_button_size btn btn-mini" rel="btn btn-large">Large</a>' +
            '           <a href="#" class="kl_custom_button_size btn btn-mini" rel="btn">Default</a>' +
            '           <a href="#" class="kl_custom_button_size btn btn-mini" rel="btn btn-small">Small</a>' +
            '           <a href="#" class="kl_custom_button_size btn btn-mini" rel="btn btn-mini">Mini</a>' +
            '       </div>' +
            '   </div>' +
            '   <a href="#" class="btn btn-mini kl_custom_button_style kl_custom_button_size kl_remove icon-end" rel="" data-tooltip="top" ' +
            '       title="Place your <span class=\'text-warning\'><strong>cursor</strong></span> in the button and click here to remove styling."> Remove Button Style</a>' +
            '   <div class="kl_instructions_wrapper">' +
            '       <p class="kl_instructions">Add <a href="#" class="kl_icons_activate btn btn-mini fa fa-tags">Icons</a> for additional customization</p>' +
            '   </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        customButtonsReady();
    }

/////////////////////////////////////////////////////////////
//  HIGHLIGHTS                                             //
///////////////////////////////////////////////////////////// 

    ////// Supporting functions  //////
    function changeAlerts(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'alert');
        tinyMCE.DOM.removeClass(parentElement, 'alert-error');
        tinyMCE.DOM.removeClass(parentElement, 'alert-success');
        tinyMCE.DOM.removeClass(parentElement, 'alert-info');
        tinyMCE.DOM.removeClass(parentElement, 'well');
    }
    function changeEmphasis(parentElement) {
        tinyMCE.DOM.removeClass(parentElement, 'muted');
        tinyMCE.DOM.removeClass(parentElement, 'text-warning');
        tinyMCE.DOM.removeClass(parentElement, 'text-error');
        tinyMCE.DOM.removeClass(parentElement, 'text-info');
        tinyMCE.DOM.removeClass(parentElement, 'text-success');
    }

    ////// On Ready/Click functions  //////
    function customHighlightsReady() {
        var activeSection;
        //// TYPE SELECTOR ////
        $('.kl_highlight_sections a').click(function (e) {
            e.preventDefault();
            $('.kl_highlight_sections a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            activeSection = $(this).attr('rel');
            // scrollToElement('.custom-"+activeSection);
            $('.kl_alert_section').hide();
            $('.kl_emphasis_section').hide();
            $(activeSection).show();
        });
        // Block toggle between paragraph and div
        $('.kl_block_alert_element a').click(function (e) {
            var applyTo;
            e.preventDefault();
            $('.kl_block_alert_element a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            applyTo = $(this).attr('rel');
            if (applyTo === 'p') {
                $('.kl_highlight_paragraph_help').show();
                $('.kl_highlight_div_help').hide();
                $('.kl_wrap_highlight').hide();
            } else {
                $('.kl_highlight_paragraph_help').hide();
                $('.kl_highlight_div_help').show();
                $('.kl_wrap_highlight').show();
            }
        });
        $('.kl_custom_highlight_style').click(function (e) {
            var elementType, myClass, parentElement;
            e.preventDefault();
            elementType = $('.kl_block_alert_element .active').attr('rel');
            myClass = $(this).attr('rel');
            if (elementType === 'p') {
                parentElement = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'p');
                changeAlerts(parentElement);
                tinyMCE.DOM.addClass(parentElement, myClass);
            } else if (elementType === 'div') {
                parentElement = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'div');
                changeAlerts(parentElement);
                tinyMCE.DOM.addClass(parentElement, myClass);
            }
        });
        $('.kl_wrap_highlight').click(function (e) {
            e.preventDefault();
            tinyMCE.activeEditor.focus();
            tinyMCE.activeEditor.selection.setContent('<div class="alert">' + tinyMCE.activeEditor.selection.getContent() + '</div>');
        });
        $('.kl_custom_span_highlight').click(function (e) {
            var myClass, parentElement;
            e.preventDefault();
            myClass = $(this).attr('rel');
            parentElement = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'span.muted, span.text-warning, span.text-error, span.text-info, span.text-success, span');
            if (parentElement === null) {
                tinyMCE.activeEditor.focus();
                tinyMCE.activeEditor.selection.setContent('<span class="' + myClass + '">' + tinyMCE.activeEditor.selection.getContent() + '</span>');
            } else {
                changeEmphasis(parentElement);
                tinyMCE.DOM.addClass(parentElement, myClass);
                if (tinyMCE.DOM.getAttrib(parentElement, 'class') === 'kl_remove_span') {
                    $(iframeID).contents().find('.kl_remove_span').contents().unwrap();
                }
            }
        });
    }



   ////// Custom Tools Accordion tab setup  //////
    function customHighlights() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            'Highlights | Alerts | Emphasis' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Highlights | Alerts | Emphasis</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>Draw attention to content using some predefined styles.</p>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About Highlights.</span>' +
            '    </a>' +
            '</h3>' +
            '<div id="kl_custom_highlights">' +
            '    <div class="btn-group kl_highlight_sections kl_option_half_wrap">' +
            '        <a href="#" class="btn btn-small active" rel=".kl_alert_section">Block Alerts</a>' +
            '        <a href="#" class="btn btn-small" rel=".kl_emphasis_section">Inline Emphasis</a>' +
            '    </div>' +
            '    <div class="kl_alert_section btn-group-label">' +
            '        <h4>Block Alerts</h4>' +
            '        <div class="kl_margin_bottom">' +
            '           <span>Apply to:</span>' +
            '           <div class="btn-group kl_block_alert_element">' +
            '               <a href="#" class="btn btn-mini active" rel="p">Paragraph</a>' +
            '               <a href="#" class="btn btn-mini" rel="div">DIV</a>' +
            '           </div>' +
            '        </div>' +
            '        <a href="#" class="kl_custom_highlight_style" rel="well"><p class="well"><strong>Well:</strong> Sample of Well</p></a>' +
            '        <a href="#" class="kl_custom_highlight_style" rel="alert"><p class="alert"><strong>Alert:</strong> Sample alert</p></a>' +
            '        <a href="#" class="kl_custom_highlight_style" rel="alert alert-error"><p class="alert alert-error"><strong>Error:</strong> Sample error alert</p></a>' +
            '        <a href="#" class="kl_custom_highlight_style" rel="alert alert-success"><p class="alert alert-success"><strong>Success:</strong> Sample success alert</p></a>' +
            '        <a href="#" class="kl_custom_highlight_style kl_margin_bottom" rel="alert alert-info"><p class="alert alert-info"><strong>Information:</strong> Sample information alert</p></a>' +
            '        <a href="#" class="kl_custom_highlight_style btn btn-mini kl_remove" rel="" data-tooltip="left" title="Place cursor in an alert and click here to remove it."><i class="icon-end"></i> Remove Alert</a>' +
            '        <a href="#" class="btn btn-mini kl_wrap_highlight icon-collection-save" style="display:none;" data-tooltip="left" title="Select content and click here to wrap it in an alert."> Wrap Selection</a>' +
            '       <div class="kl_instructions_wrapper">' +
            '           <p class="kl_instructions kl_highlight_paragraph_help">Place <span class="text-success"><strong>cursor</strong></span> within any <span class="text-success"><strong>existing paragraph</strong></span> then choose the alert type.</p>' +
            '           <p class="kl_instructions kl_highlight_div_help" style="display:none;">Place <span class="text-success"><strong>cursor</strong></span> within any <span class="text-success"><strong>existing div</strong></span> then choose the alert type.</p>' +
            '       </div>' +
            '    </div>' +
            '    <div class="kl_emphasis_section" style="display:none;">' +
            '        <h4>Inline Emphasis</h4>' +
            '        <div class="kl_margin_bottom">' +
            '            <a href="#" class="kl_custom_span_highlight muted" rel="muted">Style as MUTED text</a><br>' +
            '            <a href="#" class="kl_custom_span_highlight text-warning" rel="text-warning">Style as WARNING text</a><br>' +
            '            <a href="#" class="kl_custom_span_highlight text-error" rel="text-error">Style as ERROR text</a><br>' +
            '            <a href="#" class="kl_custom_span_highlight text-info" rel="text-info">Style as INFO text</a><br>' +
            '            <a href="#" class="kl_custom_span_highlight text-success" rel="text-success">Style as SUCCESS text</a><br>' +
            '        </div>' +
            '        <a href="#" class="kl_custom_span_highlight btn btn-mini kl_remove kl_margin_bottom" rel="kl_remove_span" data-tooltip="left" title="Place cursor in an emphasis and click here to remove it."><i class="icon-end"></i>  Remove Emphasis</a>' +
            '        <div class="kl_instructions_wrapper">' +
            '           <div class="kl_instructions">' +
            '               <dl class="dl-horizontal"><dt>New</dt><dd>Select the text you want to emphasize then click the appropriate link.</dd>' +
            '               <dt>Change</dt><dd>Place your cursor anywhere in the emphasized text and choose a new style.</dd></dl>' +
            '           </div>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        customHighlightsReady();
    }

/////////////////////////////////////////////////////////////
//  NAVIGATION                                             //
/////////////////////////////////////////////////////////////

    function checkNavCount() {
        var navItemCount = $(iframeID).contents().find('#kl_navigation li').length;
        if (navItemCount < 4) {
            $('.kl_nav_add_item').show();
        } else {
            $('.kl_nav_add_item').hide();
        }
    }
    function updateNavItems() {
        var showHelp, displayText, linkID, tooltipText, linkIcon;
        $('#kl_nav_list_items').html('');
        showHelp = false;
        $(iframeID).contents().find('#kl_navigation li').each(function () {
            displayText = $(this).find('a').text();
            if (displayText === '') {
                displayText = $(this).text();
                tooltipText = 'Text Not Linked';
                linkIcon = 'fa fa-chain-broken';
                showHelp = true;
            } else {
                tooltipText = 'Text Linked';
                linkIcon = 'fa fa-link';
            }
            linkID = displayText.replace(' ', '_');
            $('#kl_nav_list_items').append('<li rel="#kl_nav_' + linkID +
                '"><span title="Drag to reorder" class="move_item_link" data-tooltip="top" title="' + tooltipText + '"><img alt="Move" src="/images/move.png?1366214258"></span>&nbsp;' +
                displayText +
                ' <i class="' + linkIcon + '"></i><a href="#" class="kl_nav_remove_list_item pull-right kl_remove icon-end" data-tooltip="top" title="" rel="#kl_nav_' +
                linkID +
                '"><span class="screenreader-only">Remove ' + displayText + ' nav item</span>');
            $(this).attr('id', 'kl_nav_' + linkID);
        });
        if (showHelp === true) {
            $('.kl_nav_help').show();
        } else {
            $('.kl_nav_help').hide();
        }
        checkNavCount();
        $('.kl_nav_remove_list_item').click(function (e) {
            e.preventDefault();
            var connectedItem = $(this).attr('rel');
            $(iframeID).contents().find(connectedItem).remove();
            $(this).parent('li').remove();
            checkNavCount();
        });
        $('#kl_nav_list_items').sortable({
            update: function () {
                // loop through the checked panels and move or add them
                $('#kl_nav_list_items li').each(function () {
                    var connectedItem = $(this).attr('rel');
                    $(iframeID).contents().find('#kl_navigation ul').append($(iframeID).contents().find('li' + connectedItem));
                });
                updateNavItems();
            }
        });
        $('#kl_nav_list_items').disableSelection();
    }
    function navItemReady() {
        if ($(iframeID).contents().find('#kl_navigation').length > 0) {
            $('.kl_nav_add_item').html('<i class="icon-add"></i> Add Item');
        } else {
            $('.kl_nav_add_item').html('<i class="icon-add"></i> Add Navigation');
        }
        $('.kl_nav_add_item').click(function (e) {
            e.preventDefault();
            if ($(iframeID).contents().find('#kl_navigation').length > 0) {
                $(iframeID).contents().find('#kl_navigation ul').append('<li>New Item</li>');
                checkNavCount();
                updateNavItems();
            } else {
                $('.kl_template_sections_list .kl_navigation_section').prop('checked', true).trigger('change');
                $('.kl_nav_add_item').html('<i class="icon-add"></i> Add Item');
            }
        });
        $('.kl_nav_update_items').click(function (e) {
            e.preventDefault();
            updateNavItems();
            checkNavCount();
        });
    }
    function activateNavItemsLink() {
        $('.kl_nav_activate_items').click(function (e) {
            e.preventDefault();
            $('#kl_tools_accordion').accordion({ active: 7});
        });
    }
    function navItemCheck() {
        if ($('.kl_template_sections_list .kl_navigation_section').is(':checked')) {
            $('.kl_nav_activate_items').remove();
            $('.kl_navigation_section').parents('li').append('<a href="#" class="kl_nav_activate_items pull-right" data-tooltip="left" title="additional options"><i class="fa fa-cog"></i>&nbsp;</a>');
            activateNavItemsLink();
            $('.kl_navigation_color_controls').show();
            initializeColorPicker('#kl_navigation_bg_color', '#kl_navigation', 'background-color');
            initializeColorPicker('#kl_navigation_text_color', '#kl_navigation a', 'color');
        } else {
            $('.kl_nav_activate_items').remove();
            $('.kl_navigation_color_controls').hide();
        }
    }
    function navItems() {
        var addAccordionSection = '<h3 style="margin-top: 10px;">' +
            '    Navigation Items' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Navigation Items</div>' +
            '      <div class=\'popover-content\'><p>Select from predifined navigation links</p></div>">' +
            '      &nbsp;<span class="screenreader-only">information navigation items.</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '    <ul id="kl_nav_list_items" class="unstyled kl_sections_li">' +
            '    </ul>' +
            '    <a href="#" class="btn btn-mini kl_nav_add_item kl_margin_bottom"><i class="icon-add"></i> Add Item</a>' +
            '    <a href="#" class="btn btn-mini kl_nav_update_items kl_margin_bottom"><i class="icon-refresh"></i> Update Items</a>' +
            '    <table class="table table-striped table-condensed kl_navigation_color_controls" style="display:none;">' +
            '       <thead><tr><th>Aspect</th><th>Color</th></tr></thead>' +
            '       <tbody>' +
            '           <tr>' +
            '           </tr>' +
            '               <td><label for="kl_navigation_bg_color">Background:</label></td>' +
            '               <td><input type="text" id="kl_navigation_bg_color"></td>' +
            '           <tr>' +
            '               <td><label for="kl_navigation_text_color">Link Color:</label></td>' +
            '               <td><input type="text" id="kl_navigation_text_color"></td>' +
            '           </tr>' +
            '       </tbody>' +
            '    </table>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <div class="kl_instructions">' +
            '           <i class="fa fa-link"></i> = Item contains a link<br>' +
            '           <i class="fa fa-chain-broken"></i> = Item is not linked<br>' +
            '           Customize <a href="#" class="kl_icons_activate btn btn-mini fa fa-tags">Icons</a>' +
            '       </div>' +
            '       <div class="kl_instructions kl_nav_help" style="display:none;">' +
            '           <p>To complete <i class="fa fa-chain-broken"></i> item(s):</p>' +
            '           <ol>' +
            '               <li>Update item text</li>' +
            '               <li>Use Canvas Tools to add a link</li>' +
            '               <li>Click &ldquo;Update Items&rdquo;</li>' +
            '           </ol>' +
            '           <p class="kl_instructions">Position can be adjusted in the <a href="#" class="kl_sections_activate">Sections</a> panel</p>' +
            '       </div>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        updateNavItems();
        navItemReady();
        $('.kl_navigation_section').change(function () {
            updateNavItems();
            navItemCheck();
        });
        navItemCheck();
    }


    ////// On Ready/Click functions  //////

/////////////////////////////////////////////////////////////
//  POPUP CONTENT                                          //
/////////////////////////////////////////////////////////////

    ////// Supporting functions  //////
    function addModal() {
        if ($(iframeID).contents().find('#kl_modal').length === 0) {
            var newSectionName = 'Modal Dialog',
                newSectionID = 'kl_modal',
                modalHtml = '<div id="kl_modal" class="' + newSectionID + '">' +
                    '    <div class="kl_modal_title">Modal Title</div>' +
                    '    <p>Modal Contents.</p>' +
                    '</div>',
            // Insert the new section into the TinyMCE editor
                parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'div');

            tinyMCE.DOM.addClass(parentElement, 'kl_add_modal_after');
            $(iframeID).contents().find('.kl_add_modal_after').after(modalHtml);
            scrollToElement('.kl_add_modal_after');
            $(iframeID).contents().find('.kl_add_modal_after').removeClass('kl_add_modal_after');
            highlightNewElement('#kl_modal');
            addSectionControls(newSectionName, newSectionID);
        }
    }
    function checkTooltips() {
        if ($(iframeID).contents().find('.kl_tooltip_text').length > 0) {
            $('.kl_tooltip_display').show();
            if ($(iframeID).contents().find('.kl_tooltip_text').is(':visible')) {
                $('.kl_show_tooltips').addClass('active');
                $('.kl_hide_tooltips').removeClass('active');
            } else {
                $('.kl_show_tooltips').removeClass('active');
                $('.kl_hide_tooltips').addClass('active');
            }
        } else {
            $('.kl_tooltip_display').hide();
        }
    }
    function checkPopovers() {
        if ($(iframeID).contents().find('.kl_popover_content').length > 0) {
            $('.kl_popover_display').show();
            if ($(iframeID).contents().find('.kl_popover_content').is(':visible')) {
                $('.kl_show_popovers').addClass('active');
                $('.kl_hide_popovers').removeClass('active');
            } else {
                $('.kl_show_popovers').removeClass('active');
                $('.kl_hide_popovers').addClass('active');
            }
        } else {
            $('.kl_popover_display').hide();
        }
    }
    function popupDemos() {
        $('.kl_demo_modal').click(function (e) {
            e.preventDefault();
            $('#kl_example_modal').dialog({
                modal: true,
                width: 600,
                buttons: {
                    Close: function () {
                        $(this).dialog('close');
                    }
                }
            });
        });
    }

    ////// On Ready/Click functions  //////
    function popupReady() {
        //// TYPE SELECTOR ////
        $('.kl_popup_sections a').click(function (e) {
            e.preventDefault();
            $('.kl_popup_sections a').each(function () {
                $(this).removeClass('active');
            });
            $(this).addClass('active');
            var activeSection = $(this).attr('rel');
            $('.kl_modal_section').hide();
            $('.kl_tooltip_section').hide();
            $('.kl_read_more_section').hide();
            $(activeSection).show();
        });
        // Modals
        $('.kl_add_modal').click(function (e) {
            e.preventDefault();
            addModal();
        });
        $('.add_modal_trigger').click(function (e) {
            e.preventDefault();
            tinyMCE.activeEditor.focus();
            tinyMCE.activeEditor.selection.setContent('<a href="#" class="kl_modal_toggler">' + tinyMCE.activeEditor.selection.getContent() + '</a>');
            // Check to see if modal contents already exist and add section
            addModal();
        });
        $('.kl_remove_modal').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_modal').remove();
            $(iframeID).contents().find('.kl_modal_toggler').contents().unwrap();
            $('input[value=kl_modal]').parents('li').remove();
        });
        $('.kl_remove_modal_trigger').click(function (e) {
            e.preventDefault();
            var parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'a.kl_modal_toggler');
            tinyMCE.DOM.addClass(parentElement, 'kl_remove_trigger');
            $(iframeID).contents().find('.kl_remove_trigger').contents().unwrap();
        });
        // Tooltips
        $('.kl_add_tooltip').click(function (e) {
            var numToolTips = $(iframeID).contents().find('.kl_tooltip_trigger').length,
                newToolTipNum = numToolTips + 1,
                toolTipElement = '<div class="kl_tooltip_text kl_tooltip_' + newToolTipNum + '">Tooltip Text</div>',
                parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode());
            e.preventDefault();
            tinyMCE.activeEditor.focus();
            tinyMCE.DOM.addClass(parentElement, 'kl_create_tooltip');
            tinyMCE.activeEditor.selection.setContent('<a href="#" id="kl_tooltip_' + newToolTipNum + '" class="kl_tooltip_trigger">' + tinyMCE.activeEditor.selection.getContent() + '</a>');
            $(iframeID).contents().find('.kl_create_tooltip').prepend(toolTipElement).removeClass('kl_create_tooltip');
            checkTooltips();
        });
        $('.kl_remove_tooltip').click(function (e) {
            var parentElement, tipContainer;
            e.preventDefault();
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'a.kl_tooltip_trigger');
            tinyMCE.DOM.addClass(parentElement, 'kl_remove_tip');
            tipContainer = $(iframeID).contents().find('.kl_remove_tip').attr('id');
            $(iframeID).contents().find('.' + tipContainer).remove();
            $(iframeID).contents().find('.kl_remove_tip').contents().unwrap();
            checkTooltips();
        });
        $('.kl_show_tooltips').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_tooltip_text').show();
            checkTooltips();
        });
        $('.kl_hide_tooltips').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_tooltip_text').hide();
            checkTooltips();
        });

        // Popovers
        $('.kl_add_popover').click(function (e) {
            var numPopovers, newPopoverNum, PopoverElement, parentElement;
            e.preventDefault();
            numPopovers = $(iframeID).contents().find('.kl_popover_trigger').length;
            newPopoverNum = numPopovers + 1;
            tinyMCE.activeEditor.focus();
            tinyMCE.activeEditor.selection.setContent('<a href="#" id="kl_popover_' + newPopoverNum + '" class="kl_popover_trigger">' + tinyMCE.activeEditor.selection.getContent() + '</a>');
            PopoverElement = '<div class="kl_popover_content kl_popover_' + newPopoverNum + '"><h4>Popover Title</h4><p>Popover Text</p></div>';
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode());
            tinyMCE.DOM.addClass(parentElement, 'kl_create_popover');
            $(iframeID).contents().find('.kl_create_popover').prepend(PopoverElement).removeClass('kl_create_popover');
            checkPopovers();
        });
        $('.kl_remove_popover').click(function (e) {
            var parentElement, popoverContainer;
            e.preventDefault();
            parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'a.kl_popover_trigger');
            tinyMCE.DOM.addClass(parentElement, 'kl_remove_tip');
            popoverContainer = $(iframeID).contents().find('.kl_remove_tip').attr('id');
            $(iframeID).contents().find('.' + popoverContainer).remove();
            $(iframeID).contents().find('.kl_remove_tip').contents().unwrap();
            checkPopovers();
        });
        $('.kl_show_popovers').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_popover_content').show();
            checkPopovers();
        });
        $('.kl_hide_popovers').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_popover_content').hide();
            checkPopovers();
        });
        // Read More
        $('.kl_add_read_more').click(function (e) {
            e.preventDefault();
            tinyMCE.activeEditor.focus();
            tinyMCE.activeEditor.selection.setContent('<div class="expander">' + tinyMCE.activeEditor.selection.getContent() + '</div>');
        });
        $('.kl_remove_read_more').click(function (e) {
            e.preventDefault();
            var parentElement = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'div.expander');
            tinyMCE.DOM.addClass(parentElement, 'kl_remove_expander');
            $(iframeID).contents().find('.kl_remove_expander').contents().unwrap();
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function popupContent() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            'Popup Content | Read More' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Popup Content | Read More</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p><strong>Modal Windows:</strong> A modal window appears in the center of the screen and greys out the background</p>' +
            '            <p><strong>Popovers:</strong> The dialog you are currently reading is a popover.</p>' +
            '            <p><strong>Tooltips:</strong> Tooltips are a smaller version of popovers. They have white text and a dark grey, semi-transparent background and appear when the target is hovered over.</p>' +
            '            <p><strong>Read More:</strong> Read more dialogs allow you to display part of the content of a container but additional content is accessed by clicking a &ldquo;Read More&rdquo; link.</p>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About popup content</span>' +
            '    </a>' +
            '</h3><div>' +
            '<div class="btn-group kl_popup_sections kl_margin_bottom">' +
            '    <a href="#" class="btn btn-mini active" style="width:40px;" rel=".kl_modal_section">Modal</a>' +
            '    <a href="#" class="btn btn-mini" rel=".kl_tooltip_section">Tooltip/Popover</a>' +
            '    <a href="#" class="btn btn-mini" style="width: 65px;" rel=".kl_read_more_section">Read More</a>' +
            '</div>' +
            '<div class="kl_modal_section">' +
            '    <div class="btn-group-label">' +
            '    <h4>Modal</h4>' +
            '       <p class="kl_margin_bottom"><a href="#" class="btn btn-mini kl_demo_modal fa fa-hand-o-up">Demo Modal</a></p>' +
            '       <div id="kl_example_modal" title="Modal Title" style="display:none;">' +
            '           <p>This is an example of a modal dialog.</p>' +
            '           <p>It can contain most html elements.</p>' +
            '       </div>' +
            '       <span>Modal Dialog:</span>' +
            '       <a class="help pull-right" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '           title="<div class=\'popover-title\'>Modal Dialogs</div>' +
            '           <div class=\'popover-content\'><p>Select the text you would like users to click to trigger the modal then click &ldquo;Add Modal&rdquo;</p></div>">' +
            '           &nbsp;<span class="screenreader-only">Modal Dialog instructions</span>' +
            '       </a>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini add_modal_trigger" data-tooltip="top" title="Select text and click this button to make a modal trigger. The modal section will be added below the section where it is created."><i class="icon-add"></i> Add Modal</a>' +
            '            <a href="#" class="btn btn-mini kl_remove_modal kl_remove" data-tooltip="top" title="This button will remove modal dialog and all triggers"><i class="icon-end"></i> Remove Modal</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_margin_bottom">' +
            '       <span>Additional Triggers:</span>' +
            '       <a class="help pull-right" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '           title="<div class=\'popover-title\'>Addition Modal Triggers</div>' +
            '           <div class=\'popover-content\'><p>Use this section to add additional links to trigger the modal.</p></div>">' +
            '           &nbsp;<span class="screenreader-only">Additional Modal trigger instructions</span>' +
            '       </a>' +
            '       <div class="btn-group">' +
            '           <a href="#" class="btn btn-mini add_modal_trigger" data-tooltip="top" title="Select text and click this button to make an additional modal trigger"><i class="icon-add"></i> Add Trigger</a>' +
            '           <a href="#" class="btn btn-mini kl_remove_modal_trigger kl_remove" data-tooltip="top" title="Select a trigger you wish to remove then click this button."><i class="icon-end"></i> Remove Trigger</span></a>' +
            '       </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <div class="kl_instructions">' +
            '           <p class="kl_margin_bottom">Triggers are links and can be customized with <a href="#" class="kl_buttons_activate">Buttons</a> or <a href="#" class="kl_icons_activate btn btn-mini fa fa-tags">Icons</a></p>' +
            '           <p >Position can be adjusted in the <a href="#" class="kl_sections_activate">Sections</a> panel</p>' +
            '       </div>' +
            '   </div>' +
            '</div>' +
            '<div class="kl_tooltip_section" style="display:none;">' +
            '    <h4>Tooltips &amp; Popovers</h4>' +
            '    <div class="btn-group kl_margin_bottom">' +
            '       <a href="#" class="btn btn-mini fa fa-hand-o-up" data-tooltip="top" title="This is an example of a tooltip.">Demo Tooltip</a>' +
            '       <a class="btn btn-mini fa fa-hand-o-up" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '           title="<div class=\'popover-title\'>Popover Title</div>' +
            '           <div class=\'popover-content\'>' +
            '           <p>This is an example of a popover.</p>' +
            '           </div>">' +
            '           Demo Popover' +
            '       </a>' +
            '   </div>' +
            '    <div class="btn-group-label kl_margin_bottom">' +
            '        <span>Tooltip:</span><br>' +
            '        <div class="btn-group kl_margin_bottom_small">' +
            '            <a href="#" class="btn btn-mini kl_add_tooltip" data-tooltip="top" title="Select the text you would like to have a tooltip, then click this button."><i class="icon-add"></i> Add Tooltip</a>' +
            '            <a href="#" class="btn btn-mini kl_remove kl_remove_tooltip" data-tooltip="top" title="Place your cursor in the trigger text and then click this button to remove a tooltip."><i class="icon-end"></i> Remove Tooltip</a>' +
            '        </div>' +
            '        <div class="kl_tooltip_display kl_margin_bottom" style="display:none;">' +
            '            <div class="btn-group">' +
            '                <a href="#" class="btn btn-mini fa fa-eye kl_show_tooltips active">Show<span class="screenreader-only"> Tooltips< in editor/span></a>' +
            '                <a href="#" class="btn btn-mini fa fa-eye-slash kl_hide_tooltips">Hide<span class="screenreader-only"> Tooltips in editor</span></a>' +
            '            </div>' +
            '            <span>in editor</span>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_margin_bottom">' +
            '        <span>Popover:</span>' +
            '        <div class="btn-group kl_margin_bottom_small">' +
            '            <a href="#" class="btn btn-mini kl_add_popover" data-tooltip="top" title="Select the text you would like to have a popover, then click this button."><i class="icon-add"></i> Add Popover</a>' +
            '            <a href="#" class="btn btn-mini kl_remove kl_remove_popover" data-tooltip="top" title="Place your cursor in the trigger text and then click this button to remove a popover."><i class="icon-end"></i> Remove Popover</a>' +
            '        </div>' +
            '        <div class="kl_popover_display kl_margin_bottom" style="display:none;">' +
            '            <div class="btn-group">' +
            '                <a href="#" class="btn btn-mini fa fa-eye kl_show_popovers active">Show<span class="screenreader-only"> Popovers in editor</span></a>' +
            '                <a href="#" class="btn btn-mini fa fa-eye-slash kl_hide_popovers">Hide<span class="screenreader-only"> Popovers in editor</span></a>' +
            '            </div>' +
            '            <span>in editor</span>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <p class="kl_instructions">Triggers are links and can be customized with <a href="#" class="kl_buttons_activate">Buttons</a> or <a href="#" class="kl_icons_activate btn btn-mini fa fa-tags">Icons</a></p>' +
            '   </div>' +
            '</div>' +
            '<div class="kl_read_more_section" style="display:none;">' +
            '    <div class="btn-group-label">' +
            '        <h4>Read More</h4>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_add_read_more" data-tooltip="top" title="Highlight the block of text you would like collapsible then click this button"><i class="icon-add"></i> Wrap Selection</a>' +
            '            <a href="#" class="btn btn-mini kl_remove kl_remove_read_more" data-tooltip="top" title="Place your cursor anywhere in the expandable block of text then click this button."><i class="icon-end"></i> Remove Section</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '        <p class="kl_instructions">Read More sections will hide everything after 200 characters with a &ldquo;...&rdquo; and provide a link to expand or collapse the hidden content.</p>' +
            '    </div>' +
            '</div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        popupReady();
        popupDemos();
        checkTooltips();
        checkPopovers();
    }

/////////////////////////////////////////////////////////////
//  PROGRESS BAR                                           //
/////////////////////////////////////////////////////////////

   ////// Supporting functions  //////
    function deleteProgressBar() {
        $('.kl_progress_bar_delete').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_progress_bar').remove();
            $('input[value=kl_progress_bar]').parents('li').remove();
            $('.kl_progress_bar_addition_section').remove();
            $('.kl_progress_bar_add').show();
            $('#kl_progress_bar_controls').hide();
        });
    }
    function updateProgressBarSectionWidth(connectedSection, newWidth) {
        if (newWidth !== '') {
            $('.kl_progress_bar_width[rel="' + connectedSection + '"]').attr('placeholder', newWidth);
            $(iframeID).contents().find('.' + connectedSection + '_value').css('width', newWidth + '%').removeAttr('data-mce-style');
        }
    }
    function bindWidthUpdate() {
        // create a new section if return/enter is pressed in the new section field
        $('.kl_progress_bar_width').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                var connectedSection = $(this).attr('rel'),
                    newWidth = $(this).val();
                updateProgressBarSectionWidth(connectedSection, newWidth);
                $('.kl_progress_bar_width').val('');
                return false;
            }
        });
    }
    function pbLabelsInside() {
        if ($(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').length > 0) {
            $(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels .kl_progress_bar_label').each(function () {
                var connectedSection = $(this).attr('rel');
                $(iframeID).contents().find('.kl_progress_bar_wrapper .' + connectedSection + '_label').html($(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels .' + connectedSection + '_label').text());
            });
            $(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').remove();
            $(iframeID).contents().find('.kl_progress_bar_label').css('color', '#fff');
            $(iframeID).contents().find('.kl_progress_bar_label').show().removeAttr('data-mce-style');
        }
    }
    function pbLabelsOutside() {
        if ($(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').length === 0) {
            // Duplicate the progress bar
            $(iframeID).contents().find('.kl_progress_bar_wrapper').clone().appendTo($(iframeID).contents().find('#kl_progress_bar'));
            $(iframeID).contents().find('.kl_progress_bar_wrapper').last().attr('class', 'kl_progress_bar_wrapper_outside_labels');
            // Remove background colors and change text color
            $(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels .kl_progress_bar_value').each(function () {
                $(this).css({'background-color': '', 'height': '20px'}).removeAttr('data-mce-style');
                $(this).find('.kl_progress_bar_label').css('color', '#000').removeAttr('data-mce-style');
            });
            // Rename the div so it can be targeted
            $(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').attr('style', '').css({'width': '99%', 'overflow': 'hidden'}).removeAttr('data-mce-style');
            // Clear the text out of the original labels
            $(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_label').each(function () {
                $(this).html('&nbsp;');
            });
            $('.kl_progress_bar_label_position:eq(1)').addClass('active');
        }
    }
    function pbLabelsCheck() {
        if ($('.kl_progress_bar_label_position:eq(2)').hasClass('active')) {
            $(iframeID).contents().find('.kl_progress_bar_label').each(function () {
                if ($(this).html() === '&nbsp;') {
                    $(this).html('Label&nbsp;');
                }
            });
            pbLabelsInside();
        }
    }
    function addProgressBar() {
        var progressBarHtml, newSectionName, newSectionID, pbHeight;
        templateCheck();
        if ($(iframeID).contents().find('#kl_progress_bar').length === 0) {
            newSectionName = 'Progress Bar';
            newSectionID = 'kl_progress_bar';
            progressBarHtml = '<div id="kl_progress_bar">' +
                '   <div class="kl_progress_bar_wrapper" style="width: 99%; overflow: hidden; background: #f2f2f2; border: #D1D1D1 1px solid;" role="progressbar" aria-valuemin="0" aria-valuemax="99" aria-valuenow="37" style="width: 99%;">' +
                '       <div class="kl_progress_bar_value kl_progress_bar_0_value" style="width: 20%; background: #003366; text-align: right; height:5px; float:left;"><div class="kl_progress_bar_label kl_progress_bar_0_label" rel="kl_progress_bar_0" style="color: #fff;">% Complete&nbsp;</div></div>' +
                '   </div>' +
                '</div>';
            $(iframeID).contents().find('#kl_wrapper').prepend(progressBarHtml);
            addSectionControls(newSectionName, newSectionID);
            $('#kl_progress_bar_controls').show();
            initializeColorPicker('#kl_progress_bar_section_0_bg_color', '.kl_progress_bar_wrapper  .kl_progress_bar_0_value', 'background-color');
            initializeColorPicker('#kl_progress_bar_section_0_text_color', '.kl_progress_bar_0_label', 'color');
            // $('#kl_progress_bar_width').val('').attr('placeholder', '20');
            pbHeight = $(iframeID).contents().find('.kl_progress_bar_value').css('height');
            $('.kl_progress_bar_height.active').removeClass('active');
            $('.kl_progress_bar_height[rel="' + pbHeight + '"]').addClass('active');
            $('#kl_progress_bar_controls').show();
            bindWidthUpdate();
            setTimeout(function () {
                $('.kl_progress_bar_label_position[rel="outside"]').trigger('click');
            }, 300);
        }
        scrollToElement('#kl_progress_bar');
    }
    function addProgressBarSection() {
        var newBarSectionNum = $(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_value').length,
            newBarSectionHtml = '<div class="kl_progress_bar_value kl_progress_bar_' + newBarSectionNum + '_value" style="width: 20%; background: #003366; text-align: right; height:5px; float:left;">' +
                '<div class="kl_progress_bar_label kl_progress_bar_' + newBarSectionNum + '_label" rel="kl_progress_bar_' + newBarSectionNum + '" style="color: #fff;">Label&nbsp;</div>' +
                '</div>',
            barDisplayNum = newBarSectionNum + 1,
            newSectionControls = '<tr class="kl_progress_bar_addition_section">' +
                '   <td>' + barDisplayNum +
                '       <a href="#" class="kl_progress_bar_delete_section kl_remove pull-right" style="display:none;" rel="kl_progress_bar_' + newBarSectionNum + '" data-tooltip="left" title="Delete this section"><i class="icon-end"></i><span class="screenreader-only">Remove progress bar section</span></a></td>' +
                '   <td><input class="kl_progress_bar_width" rel="kl_progress_bar_' + newBarSectionNum + '" type="text" placeholder="20" rel=""></td>' +
                '   <td><input type="text" id="kl_progress_bar_section_' + newBarSectionNum + '_bg_color"></td>' +
                '   <td><input type="text" id="kl_progress_bar_section_' + newBarSectionNum + '_text_color"></td>' +
                '</tr>';
        $('#kl_progress_bar_section_controls tbody').append(newSectionControls);
        $(iframeID).contents().find('.kl_progress_bar_wrapper').append(newBarSectionHtml);
        $('.kl_progress_bar_delete_section').click(function (e) {
            e.preventDefault();
            var connectedSection = $(this).attr('rel');
            $(this).parents('tr').remove();
            $(iframeID).contents().find('#' + connectedSection + '_value').remove();
            $(iframeID).contents().find('#' + connectedSection + '_label').remove();
            $('.kl_progress_bar_delete_section').last().show();
        });
        if ($(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').length > 0) {
            pbLabelsInside();
            pbLabelsOutside();
        }
        initializeColorPicker('#kl_progress_bar_section_' + newBarSectionNum + '_bg_color', '.kl_progress_bar_wrapper .kl_progress_bar_' + newBarSectionNum + '_value', 'background-color');
        initializeColorPicker('#kl_progress_bar_section_' + newBarSectionNum + '_text_color', '.kl_progress_bar_' + newBarSectionNum + '_label', 'color');
        bindWidthUpdate();
        $('.kl_progress_bar_delete_section').hide();
        $('.kl_progress_bar_delete_section').last().show();
    }
    function changePbHeight(newHeight) {
        $(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_value').css('height', newHeight).removeAttr('data-mce-style');
        if (newHeight !== '20px') {
            pbLabelsOutside();
            $('.kl_progress_bar_label_position:eq(0)').addClass('disabled').removeClass('active');
        } else {
            $('.kl_progress_bar_label_position:eq(0)').removeClass('disabled');
        }
    }
    function identifyProgressBar() {
        var barWidth, pbHeight;
        if ($(iframeID).contents().find('.kl_progress_bar_value').length > 0) {
            $('#kl_progress_bar_controls').show();
            $('.kl_progress_bar_add').hide();
            initializeColorPicker('#kl_progress_bar_section_0_bg_color', '.kl_progress_bar_wrapper .kl_progress_bar_0_value', 'background-color');
            initializeColorPicker('#kl_progress_bar_section_0_text_color', '.kl_progress_bar_0_label', 'color');
            barWidth = Math.round(100 * parseFloat($(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_0_value').css('width')) / parseFloat($(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_0_value').parent().css('width')));
            $('.kl_progress_bar_width').val('').attr('placeholder', barWidth);
            $('#kl_progress_bar_controls').show();
            $(iframeID).contents().find('.kl_progress_bar_wrapper .kl_progress_bar_value').each(function (index) {
                var newSectionControls,
                    barDisplayNum = index + 1;
                $(this).attr({'class': 'kl_progress_bar_value kl_progress_bar_' + index + '_value', 'rel': 'kl_progress_bar_' + index});
                $(this).find('.kl_progress_bar_label').attr({'class': 'kl_progress_bar_label kl_progress_bar_' + index + '_label', 'rel': 'kl_progress_bar_' + index});
                if (index > 0) {
                    barWidth = Math.round(100 * parseFloat($(this).css('width')) / parseFloat($(this).parent().css('width')));
                    newSectionControls = '<tr class="kl_progress_bar_addition_section">' +
                        '   <td>' + barDisplayNum +
                        '       <a href="#" class="kl_progress_bar_delete_section kl_remove pull-right" style="display:none;" rel="kl_progress_bar_' + index + '" data-tooltip="left" title="Delete this section"><i class="icon-end"></i><span class="screenreader-only">Remove progress bar section</span></a></td>' +
                        '   <td><input class="kl_progress_bar_width" rel="kl_progress_bar_' + index + '" type="text" placeholder="' + barWidth + '" rel=""></td>' +
                        '   <td><input type="text" id="kl_progress_bar_section_' + index + '_bg_color"></td>' +
                        '   <td><input type="text" id="kl_progress_bar_section_' + index + '_text_color"></td>' +
                        '</tr>';
                    $('#kl_progress_bar_section_controls tbody').append(newSectionControls);
                    initializeColorPicker('#kl_progress_bar_section_' + index + '_bg_color', '.kl_progress_bar_wrapper .kl_progress_bar_' + index + '_value', 'background-color');
                    initializeColorPicker('#kl_progress_bar_section_' + index + '_text_color', '.kl_progress_bar_' + index + '_label', 'color');
                }
            });
            if ($(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels').length > 0) {
                $(iframeID).contents().find('.kl_progress_bar_wrapper_outside_labels .kl_progress_bar_value').each(function (index) {
                    $(this).attr({'class': 'kl_progress_bar_value kl_progress_bar_' + index + '_value', 'rel': 'kl_progress_bar_' + index});
                    $(this).find('.kl_progress_bar_label').attr({'class': 'kl_progress_bar_label kl_progress_bar_' + index + '_label', 'rel': 'kl_progress_bar_' + index});
                });
                $('.kl_progress_bar_label_position').removeClass('active');
                $('.kl_progress_bar_label_position:eq(1)').addClass('active');
            }
            pbHeight = $(iframeID).contents().find('.kl_progress_bar_value').css('height');
            $('.kl_progress_bar_height.active').removeClass('active');
            $('.kl_progress_bar_height[rel="' + pbHeight + '"]').addClass('active');
            $('.kl_progress_bar_delete_section').last().show();
            bindWidthUpdate();
        }
    }
   ////// On Ready/Click functions  //////
    function progressBarReady() {
        $('.kl_progress_bar_add').click(function (e) {
            e.preventDefault();
            addProgressBar();
            $(this).hide();
        });
        $('.kl_progress_bar_add_section').click(function (e) {
            e.preventDefault();
            addProgressBarSection();
        });
        $('.kl_progress_bar_label_position').click(function (e) {
            e.preventDefault();
            addProgressBar();
            var pbPosition = $(this).attr('rel');
            if (pbPosition === 'inside') {
                pbLabelsCheck();
                pbLabelsInside();
            } else if (pbPosition === 'outside') {
                pbLabelsCheck();
                pbLabelsOutside();
            } else {
                pbLabelsInside();
                $(iframeID).contents().find('.kl_progress_bar_label').html('&nbsp;').removeAttr('data-mce-style');
            }
            $('.kl_progress_bar_label_position.active').removeClass('active');
            $(this).addClass('active');
        });
        $('.kl_progress_bar_height').click(function (e) {
            e.preventDefault();
            addProgressBar();
            var pbHeight = $(this).attr('rel');
            $('.kl_progress_bar_height.active').removeClass('active');
            $(this).addClass('active');
            changePbHeight(pbHeight);
        });
        if ($(iframeID).contents().find('#kl_progress_bar').length > 0) {
            var barWidth = Math.round(100 * parseFloat($(iframeID).contents().find('.kl_progress_bar_value').css('width')) / parseFloat($(iframeID).contents().find('.kl_progress_bar_value').parent().css('width')));
            $('.kl_progress_bar_delete').show();
            $('#kl_progress_bar_width').val('').attr('placeholder', barWidth);
            $('.kl_progress_bar_colors').show();
        }
        deleteProgressBar();
        bindWidthUpdate();
        identifyProgressBar();
    }

    ////// Custom Tools Accordion tab setup  //////
    function progressBar() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            'Progress Bar' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Progress Bar</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>Add a progress bar to show the percentage of completion.</p>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About progress bars</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '   <a href="#" class="btn btn-mini kl_progress_bar_add kl_margin_bottom"><i class="icon-add"></i> Add Progress Bar</a>' +
            '   <div id="kl_progress_bar_controls" style="display:none;">' +
            '      <form class="form-inline">' +
            '      </form>' +
            '      <table class="table table-condensed table-bordered table-striped" id="kl_progress_bar_section_controls">' +
            '      <thead>' +
            '           <tr>' +
            '           <th>Section</th>' +
            '           <th>Size (%)</th>' +
            '           <th>BG</th>' +
            '           <th>Text</th>' +
            '           </tr>' +
            '      </thead>' +
            '      <tbody>' +
            '           <tr>' +
            '           <td>1</td>' +
            '           <td><input class="kl_progress_bar_width" rel="kl_progress_bar_0" type="text" placeholder="20"></td>' +
            '           <td><input type="text" id="kl_progress_bar_section_0_bg_color"></td>' +
            '           <td><input type="text" id="kl_progress_bar_section_0_text_color"></td>' +
            '           </tr>' +
            '      </tbody>' +
            '      </table>' +
            '      <div class="btn-group">' +
            '           <a href="#" class="btn btn-mini kl_progress_bar_add_section kl_margin_bottom"><i class="icon-add"></i> Add Section</a>' +
            '           <a href="#" class="btn btn-mini kl_progress_bar_delete kl_remove kl_margin_bottom"><i class="icon-end"></i> Remove Bar</a>' +
            '      </div>' +
            '      <div class="btn-group-label kl_margin_bottom">' +
            '          <span>Height </span>' +
            '          <div class="btn-group">' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_height" rel="20px">Lg</a>' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_height" rel="15px">Med</a>' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_height" rel="10px">Sm</a>' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_height active" rel="5px">Micro</a>' +
            '          </div>' +
            '      </div>' +
            '      <div class="btn-group-label kl_margin_bottom">' +
            '          <span>Label(s) </span>' +
            '          <div class="btn-group kl_progress_bar_label_controls">' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_label_position disabled" rel="inside">Inside</a>' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_label_position active" rel="outside">Outside</a>' +
            '              <a href="#" class="btn btn-mini kl_progress_bar_label_position kl_remove" rel="none" data-tooltip="top" title="Remove all progress bar labels"><i class="icon-end"></i> None</a>' +
            '          </div>' +
            '      </div>' +
            '      <div class="kl_instructions_wrapper">' +
            '          <p class="kl_instructions">Position can be adjusted in the <a href="#" class="kl_sections_activate">Sections</a> panel</p>' +
            '      </div>' +
            '   </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        progressBarReady();
    }

/////////////////////////////////////////////////////////////
//  QUICK CHECK                                            //
/////////////////////////////////////////////////////////////

    ////// Supporting functions  //////
    function identifyQuestions(quickCheckNum) {
        var answerText, newClass, thisIsCorrect, connectedAnswer, connectedSection;
        $('#' + quickCheckNum + '_sort').html('');
        $(iframeID).contents().find('#' + quickCheckNum + ' .kl_quick_check_answer_wrapper').each(function (i) {
            answerText = $(this).find('.kl_quick_check_answer').text();
            if (answerText.length > 25) {
                answerText = answerText.substring(0, 20) + '...';
            }
            newClass = 'kl_quick_check_answer_wrapper kl_quick_check_answer_' + i;
            thisIsCorrect = '';

            if ($(this).hasClass('kl_quick_check_correct_answer')) {
                thisIsCorrect = ' kl_quick_check_correct';
                newClass += ' kl_quick_check_correct_answer';
            }
            $(this).attr('class', newClass);
            $('#' + quickCheckNum + '_sort').append('<li id="' + quickCheckNum + '_answer_' + i + '" rel="#' + quickCheckNum + ' .kl_quick_check_answer_' + i + '">' +
                '<span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span>' +
                '<a href="#" class="kl_quick_check_mark_correct' + thisIsCorrect + '" rel="#' + quickCheckNum + ' .kl_quick_check_answer_' + i + '" title="Mark as correct answer">' +
                '<i class="icon-check"></i><span class="screenreader-only">Mark as Correct Answer</span>' +
                    answerText + '</a>' +
                '<a href="#" class="pull-right kl_quick_check_remove_answer kl_remove icon-end" rel="#' + quickCheckNum + ' .kl_quick_check_answer_' + i + '" title="Delete answer">' +
                '<span class="screenreader-only">Delete Answer</span></a>' +
                '</li>');
        });
        $('#' + quickCheckNum + '_sort').sortable({
            update: function () {
                // loop through the answers and move them
                $('#' + quickCheckNum + '_sort li').each(function () {
                    connectedAnswer = $(this).attr('rel');
                    connectedSection = $(iframeID).contents().find(connectedAnswer);
                    connectedSection.appendTo($(iframeID).contents().find('#' + quickCheckNum + ' .kl_quick_check_answers'));
                });
                $('#' + quickCheckNum + '_sort').html('');
                identifyQuickChecks();
            }
        });
        $('#' + quickCheckNum + '_sort').disableSelection();
        if ($(iframeID).contents().find('#kl_quick_check_one').length > 0) {
            $('#kl_quick_check_one_add').hide();
            $('#kl_quick_check_one_remove').show();
            $('.kl_quick_check_one_controls').show();
        }
        if ($(iframeID).contents().find('#kl_quick_check_two').length > 0) {
            $('#kl_quick_check_two_add').hide();
            $('#kl_quick_check_two_remove').show();
            $('.kl_quick_check_two_controls').show();
        }
        bindHover();
    }
    // Identify any quickchecks
    function identifyQuickChecks() {
        var connectedAnswer, connectedSection, quickCheckNum;
        if ($(iframeID).contents().find('.kl_quick_check').length > 0) {
            $(iframeID).contents().find('.kl_quick_check').each(function () {
                // Get the quickcheck number
                quickCheckNum = $(this).attr('id');
                identifyQuestions(quickCheckNum);
            });
        }
        $('.kl_quick_check_mark_correct').click(function (e) {
            e.preventDefault();
            connectedAnswer = $(this).attr('rel');
            connectedSection = $(this).parents('ol').attr('rel');
            if ($(this).hasClass('kl_quick_check_correct')) {
                $(iframeID).contents().find(connectedSection).find('.kl_quick_check_correct_answer').removeClass('kl_quick_check_correct_answer');
                $(this).removeClass('kl_quick_check_correct');
            } else {
                $(iframeID).contents().find(connectedSection).find('.kl_quick_check_correct_answer').removeClass('kl_quick_check_correct_answer');
                $(iframeID).contents().find(connectedAnswer).addClass('kl_quick_check_correct_answer');
                $(this).parents('.kl_sections_li').find('.kl_quick_check_correct').removeClass('kl_quick_check_correct');
                $(this).addClass('kl_quick_check_correct');
            }
        });
        $('.kl_quick_check_remove_answer').click(function (e) {
            e.preventDefault();
            connectedAnswer = $(this).attr('rel');
            $(iframeID).contents().find(connectedAnswer).remove();
            $(this).parents('li').remove();
        });
        $('.kl_quick_check_remove').click(function (e) {
            e.preventDefault();
            quickCheckNum = $(this).attr('rel');
            $(iframeID).contents().find('#' + quickCheckNum).remove();
            $('#' + quickCheckNum + '_sort').empty();
            $('.' + quickCheckNum + '_controls').hide();
            $('#' + quickCheckNum + '_add').show();
            $(this).hide();
            $('input[value=' + quickCheckNum + '_content]').parents('li').remove();
            $('.' + quickCheckNum + '_controls').hide();
            $('.kl_sections_list .' + quickCheckNum + '_section').remove();
            quickCheckNum = quickCheckNum.replace('kl_quick_check_', '');
        });
    }


    ////// On Ready/Click functions  //////
    function quickCheckReady() {
        $('.kl_quick_check_add').click(function (e) {
            var quickCheckNum, quickCheckNumber, quickCheckTemplate;
            e.preventDefault();
            templateCheck();
            quickCheckNum = $(this).attr('rel');
            quickCheckNumber = '1';
            if (quickCheckNum === 'kl_quick_check_two') {
                quickCheckNumber = '2';
            }
            quickCheckTemplate = '<div id="' + quickCheckNum + '" class="kl_quick_check ' + quickCheckNum + '_content">' +
                '   <h4>Quick Check ' + quickCheckNumber + ': Title</h4>' +
                '   <p>Put question text here</p>' +
                '   <div class="kl_quick_check_answers">' +
                '       <div class="kl_quick_check_answer_wrapper">' +
                '           <div class="kl_quick_check_answer"> <p>Answer A</p></div>' +
                '           <div class="kl_quick_check_response">' +
                '               <p>Response text to display when this answer is selected.</p>' +
                '           </div>' +
                '       </div>' +
                '       <div class="kl_quick_check_answer_wrapper">' +
                '           <div class="kl_quick_check_answer"> <p>Answer B</p></div>' +
                '           <div class="kl_quick_check_response">' +
                '               <p>Answer B reply text</p>' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>';
            $(iframeID).contents().find('#kl_wrapper').append(quickCheckTemplate);
            scrollToElement('#' + quickCheckNum);
            highlightNewElement('#' + quickCheckNum);
            identifyQuickChecks();
            addSectionControls('Quick Check ' + quickCheckNumber, quickCheckNum);
            bindHover();
            $(this).hide();
        });
        $('.kl_quick_check_add_answer').click(function (e) {
            var quickCheckNum, quickCheckAnswerContent;
            e.preventDefault();
            quickCheckNum = $(this).attr('rel');
            quickCheckAnswerContent = '<div class="kl_quick_check_answer_wrapper">' +
                '<div class="kl_quick_check_answer">' +
                '   <p>New Answer</p>' +
                '</div>' +
                '<div class="kl_quick_check_response">' +
                '   <p>New answer response text</p>' +
                '</div>' +
                '</div>';
            $(iframeID).contents().find('#' + quickCheckNum + ' .kl_quick_check_answers').append(quickCheckAnswerContent);
            $('#' + quickCheckNum + '_sort').html('');
            scrollToElement('#' + quickCheckNum + ' .kl_quick_check_answer:last');
            highlightNewElement('#' + quickCheckNum + ' .kl_quick_check_answer:last');
            identifyQuickChecks();
        });
        $('.kl_quick_check_update_answers').click(function (e) {
            e.preventDefault();
            identifyQuickChecks();
        });
        $('.kl_quick_check_sections a').click(function (e) {
            e.preventDefault();
            $('.kl_quick_check_sections a').each(function () {
                $(this).removeClass('active');
                $($(this).attr('rel')).hide();
            });
            $($(this).attr('rel')).show();
            $(this).addClass('active');
        });
        identifyQuickChecks();
    }


    ////// Custom Tools Accordion tab setup  //////
    function quickCheck() {
        var quickCheckControls = '<h3 class="kl_wiki">' +
            'Quick Check' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Quick Check Tool</div>' +
            '      <div class=\'popover-content\'>' +
            '      <ul><li>A Quick Check is a section added to the page to test comprehension.</li>' +
            '      <li>Quick Checks are not graded but provide instant feedback of why an answer is correct or incorrect.</li>' +
            '      <li>Quick Checks will hide the next button until the correct answer has been providtinyMCE.activeEditor.</li>' +
            '      <li>Only two Quick Check question can be added per page.</li></ul></div>">' +
            '      &nbsp;<span class="screenreader-only">About Quick Check.</span>' +
            '    </a>' +
            '</h3><div>' +
            '<div class="btn-group kl_quick_check_sections kl_option_half_wrap">' +
            '    <a href="#" class="btn btn-small active" rel=".kl_quick_check_one_section_wrap">Quick Check 1</a>' +
            '    <a href="#" class="btn btn-small" rel=".kl_quick_check_two_section_wrap">Quick Check 2</a>' +
            '</div>' +
            '<div class="kl_quick_check_one_section_wrap">' +
            '    <h4>Quick Check 1</h4>' +
            '    <a href="#" id="kl_quick_check_one_add" class="btn btn-mini kl_quick_check_add" rel="kl_quick_check_one" data-tooltip="top" title="Clicking this button will add a Quick Check section to the bottom of the content area."><i class="icon-add"></i> Add QuickCheck 1</a>' +
            '    <div class="kl_quick_check_one_controls" style="display:none;">' +
            '        <a href="#" class="btn btn-mini kl_quick_check_add_answer" rel="kl_quick_check_one" data-tooltip="top" title="Add an answer to the bottom of the Quick Check"><i class="icon-add"></i>Add Answer</a>' +
            '        <a href="#" class="btn btn-mini kl_quick_check_update_answers"><i class="icon-refresh"></i> Update Answers</a>' +
            '    </div>' +
            '    <ol id="kl_quick_check_one_sort" class="kl_sections_li unstyled" rel="#kl_quick_check_one" style="margin:10px 0;"></ol>' +
            '    <a href="#" id="kl_quick_check_one_remove" class="btn btn-mini kl_remove kl_quick_check_remove kl_margin_bottom" rel="kl_quick_check_one" style="display:none;" data-tooltip="top" title="Click this button to remove the Quick Check section."><i class="icon-end"></i> Remove QuickCheck 1</a>' +
            '</div>' +
            '<div class="kl_quick_check_two_section_wrap" style="display:none;">' +
            '    <h4>Quick Check 2</h4>' +
            '    <a href="#" id="kl_quick_check_two_add" class="btn btn-mini kl_quick_check_add" rel="kl_quick_check_two" data-tooltip="top" title="Clicking this button will add a Quick Check section to the bottom of the content area."><i class="icon-add"></i> Add QuickCheck 2</a>' +
            '    <div class="kl_quick_check_two_controls" style="display:none;">' +
            '        <a href="#" class="btn btn-mini kl_quick_check_add_answer" rel="kl_quick_check_two" data-tooltip="top" title="Add an answer to the bottom of the Quick Check"><i class="icon-add"></i>Add Answer</a>' +
            '        <a href="#" class="btn btn-mini kl_quick_check_update_answers"><i class="icon-refresh"></i> Update Answers</a>' +
            '    </div>' +
            '    <ol id="kl_quick_check_two_sort" class="kl_sections_li unstyled" rel="#kl_quick_check_two" style="margin:10px 0;"></ol>' +
            '    <a href="#" id="kl_quick_check_two_remove" class="btn btn-mini kl_remove kl_quick_check_remove kl_margin_bottom" rel="kl_quick_check_two" style="display:none;" data-tooltip="top" title="Click this button to remove the Quick Check section."><i class="icon-end"></i> Remove QuickCheck 2</a>' +
            '</div>' +
            '</div>';
        $('#kl_tools_accordion').append(quickCheckControls);
        quickCheckReady();
    }

/////////////////////////////////////////////////////////////
//  SOCIAL MEDIA                                           //
/////////////////////////////////////////////////////////////

    ////// On Ready/Click functions  //////
    function activateSocialMediaLink() {
        $('.kl_social_media_activate').click(function (e) {
            e.preventDefault();
            $('#kl_tools_accordion').accordion({ active: 12});
        });
    }

    function socialMediaCheck() {
        if ($('.kl_social_media_section').is(':checked')) {
            $('.kl_social_media_activate').remove();
            $('.kl_social_media_section').parents('li').append('<a href="#" class="kl_social_media_activate pull-right" data-tooltip="left" title="additional options"><i class="fa fa-cog"></i>&nbsp;</a>');
            activateSocialMediaLink();
        } else {
            $('.kl_social_media_activate').remove();
        }
    }
    function socialMediaReady() {
        $('iframe').contents().find('#kl_social_media').find('a').each(function () {
            var smIcon = $(this).attr('class'),
                smLink = $(this).attr('href'),
                cleanedhref = smLink.replace('http://', '').replace('https://', '').replace('/courses/', ''),
                newhref = 'https://' + cleanedhref;
            smIcon = smIcon.replace('fa ', '');
            $('#kl_social_media_links').find('.' + smIcon).parent().next('input').val(newhref);
        });
        $('.kl_social_media_section').change(function () {
            socialMediaCheck();
        });
    }
    function updateSocialMediaLinks() {
        if ($(iframeID).contents().find('#kl_social_media').length === 0) {
            $('.kl_social_media_section').prop('checked', true).trigger('change');
        }
        $(iframeID).contents().find('#kl_social_media').html('');
        $('#kl_social_media_links div').each(function () {
            var smIcon = $(this).find('i').attr('class'),
                myhref = $(this).find('input').val(),
                cleanedhref = myhref.replace('http://', '').replace('https://', '').replace('/courses/', ''),
                newhref = 'https://' + cleanedhref;
            if (cleanedhref !== '') {
                $(this).find('input').attr('value', newhref);
                $(iframeID).contents().find('#kl_social_media').append('<a href="' + newhref + '" class="' + smIcon + '" title="' + newhref + '">&nbsp;</a>');
            }
        });
    }

    ////// Custom Tools Accordion tab setup  //////
    function socialMediaTool() {
        var addAccordionSection = '<h3>' +
            '    Social Media Links' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Social Media Links</div>' +
            '      <div class=\'popover-content\'><p>Create links to course social media sites</p></div>">' +
            '      &nbsp;<span class="screenreader-only">Social Media Links</span>' +
            '    </a>' +
            '</h3>' +
            '<div id="kl_social_media_links">' +
            '    <div class="input-prepend">' +
            '        <span class="add-on"><i class="icon-facebook"></i></span>' +
            '        <input id="kl_facebook_input" type="text" class="kl_social_media_input" placeholder="Course Facebook url">' +
            '    </div>' +
            '    <div class="input-prepend">' +
            '        <span class="add-on"><i class="icon-twitter"></i></span>' +
            '        <input id="kl_twitter_input" type="text" class="kl_social_media_input" placeholder="Course Twitter url">' +
            '    </div>' +
            '    <div class="input-prepend">' +
            '        <span class="add-on"><i class="icon-linkedin"></i></span>' +
            '        <input id="kl_linkedin_input" type="text" class="kl_social_media_input" placeholder="Course LinkedIn url">' +
            '    </div>' +
            '    <div class="input-prepend">' +
            '        <span class="add-on"><i class="fa fa-youtube" style="font-size: 1.4em;"></i></span>' +
            '        <input id="kl_youtube_input" type="text" class="kl_social_media_input" placeholder="Course YouTube url">' +
            '    </div>' +
            '    <a href="#" class="btn btn-mini kl_social_media_update_links kl_margin_bottom"><i class="icon-refresh"></i> Update Social Media Links</a>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <p class="kl_instructions">Position can be adjusted in the <a href="#" class="kl_sections_activate">Sections</a> panel</p>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        $('.kl_social_media_update_links').click(function (e) {
            e.preventDefault();
            updateSocialMediaLinks();
        });
        $('.kl_social_media_input').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                updateSocialMediaLinks();
                return false;
            }
        });
        socialMediaReady();
    }

/////////////////////////////////////////////////////////////
//  TABLES                                                 //
/////////////////////////////////////////////////////////////

    ////// Supporting functions  //////
    // See if table already has the custom "table" class
    function checkTable(parentTable) {
        // Get the styles from the parent element
        var currentClass = tinyMCE.DOM.getAttrib(parentTable, 'class'),
        // If the parent already has the class, remove it otherwise add it
            regExpMatch = /\btable\b/g;

        if (currentClass.match(regExpMatch) === null) {
            tinyMCE.DOM.addClass(parentTable, 'table');
        }
    }
    // Insert a table using the custom tool
    function insertTable() {
        var numCols, numRows, toInsert, i, j;
        numCols = $('#kl_table_num_cols').val();
        if (numCols === '') {
            numCols = 2;
        }
        numRows = $('#kl_table_num_rows').val();
        if (numRows === '') {
            numRows = 2;
        }
        toInsert = '<table>';
        if ($('.kl_table_include_header').prop('checked')) {
            numRows = numRows - 1;
            toInsert += '<thead><tr>';
            for (i = 0; i < numCols; i++) {
                toInsert += '<th></th>';
            }
            toInsert += '</tr></thead>';
        }
        toInsert += '<tbody>';
        for (i = 0; i < numRows; i++) {
            toInsert += '<tr>';
            for (j = 0; j < numCols; j++) {
                toInsert += '<td></td>';
            }
            toInsert += '</tr>';
        }
        toInsert += '</tbody></table>';
        tinyMCE.execCommand('mceInsertContent', false, toInsert);
    }
    // clear out all custom row styles
    function removeRowStyle(parentRow) {
        tinyMCE.DOM.removeClass(parentRow, 'success');
        tinyMCE.DOM.removeClass(parentRow, 'error');
        tinyMCE.DOM.removeClass(parentRow, 'warning');
        tinyMCE.DOM.removeClass(parentRow, 'info');
    }
    // clear out all custom table styles
    function removeTableStyle(parentTable) {
        tinyMCE.DOM.removeClass(parentTable, 'table');
        tinyMCE.DOM.removeClass(parentTable, 'table-bordered');
        tinyMCE.DOM.removeClass(parentTable, 'table-condensed');
        tinyMCE.DOM.removeClass(parentTable, 'table-striped');
    }

    ////// On Ready/Click functions  //////
    function tablesReady() {
        // Make the first table row headings
        $('.kl_table_add_heading').click(function (e) {
            var parentTable, topRow;
            e.preventDefault();
            parentTable = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'table');
            // add a temp class so that we can target table with jQuery
            tinyMCE.DOM.addClass(parentTable, 'kl_table_mark_heading');
            // if the table does not have a thead section, add it and move the first row of table
            if ($(iframeID).contents().find('.kl_table_mark_heading thead').length === 0) {
                topRow = $(iframeID).contents().find('.kl_table_mark_heading tr:first-child').html();
                $(iframeID).contents().find('.kl_table_mark_heading tr:first-child').remove();
                $(iframeID).contents().find('.kl_table_mark_heading').prepend('<thead>' + topRow + '</thead>');
                $(iframeID).contents().find('.kl_table_mark_heading thead td').each(function () {
                    $(this).replaceWith('<th>' + $(this).text().trim() + '</th>');
                });
            }
            // remove temp class and check to see if it has the table class
            $(iframeID).contents().find('.kl_table_mark_heading').removeClass('kl_table_mark_heading');
            checkTable(parentTable);
        });
        // Make table sortable
        $('.kl_table_make_sortable').click(function (e) {
            var parentTable, currentClass, regExpMatch;
            e.preventDefault();
            parentTable = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'table');
            // Get the styles from the parent element
            currentClass = tinyMCE.DOM.getAttrib(parentTable, 'class');
            // If the parent already has the class, remove it otherwise add it
            regExpMatch = /\btablesorter\b/g;
            if (currentClass.match(regExpMatch) === null) {
                tinyMCE.DOM.addClass(parentTable, 'tablesorter');
            } else {
                tinyMCE.DOM.removeClass(parentTable, 'tablesorter');
            }
        });
        // Buttons for manipulating the mce table
        $('.kl_table_mce_command').click(function (e) {
            e.preventDefault();
            var myCommand = $(this).attr('rel');
            tinymce.activeEditor.execCommand(myCommand);
        });
        // Insert a table using the custom tool
        $('.kl_table_insert').click(function (e) {
            e.preventDefault();
            insertTable();
        });
        $('#kl_table_num_cols').keydown(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                insertTable();
                return false;
            }
        });
        $('#kl_table_num_rows').keydown(function (e) {
            if (e.keyCode === 13) {
                e.preventDefault();
                insertTable();
                return false;
            }
        });
        // applying and removing tr backgrounds
        $('.kl_table_row_backgrounds').click(function (e) {
            var parentTable, parentRow, rowClass;
            e.preventDefault();
            parentTable = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'table');
            parentRow = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'tr');
            removeRowStyle(parentRow);
            rowClass = $(this).attr('rel');
            tinyMCE.DOM.addClass(parentRow, rowClass);
            checkTable(parentTable);
        });
        // Toggle between table sections
        $('.kl_table_options a').click(function (e) {
            var connectedSection, showSection;
            e.preventDefault();
            $('.kl_table_options a').each(function () {
                $(this).removeClass('active');
                connectedSection = $(this).attr('rel');
                $(connectedSection).hide();
            });
            showSection = $(this).attr('rel');
            $(showSection).show();
            $(this).addClass('active');
        });
        // Controls for Default, Bordered, Condensed, and Striped styles
        $('.kl_table_style').click(function (e) {
            e.preventDefault();
            var myClass = $(this).attr('rel'),
                parentTable = tinyMCE.activeEditor.dom.getParent(tinyMCE.activeEditor.selection.getNode(), 'table');
            removeTableStyle(parentTable);
            tinyMCE.DOM.addClass(parentTable, myClass);
        });
    }
   ////// Custom Tools Accordion tab setup  //////
    function customTablesSection() {
        var addAccordionSection = '<h3 class="kl_wiki">' +
            'Tables' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Custom Tables</div>' +
            '      <div class=\'popover-content\'><p>Add some style to existing tables.</p></div>">' +
            '      &nbsp;<span class="screenreader-only">About Custom Tables.</span>' +
            '    </a>' +
            '</h3><div>' +
            '<div class="btn-group kl_table_options kl_option_third_wrap kl_margin_bottom">' +
            '    <a href="#" class="btn btn-small active" rel=".kl_table_new">Create</a>' +
            '    <a href="#" class="btn btn-small" rel=".kl_table_layout">Edit</a>' +
            '    <a href="#" class="btn btn-small" rel=".kl_table_styles">Style</a>' +
            '</div>' +
            '<div class="kl_table_new">' +
            '    <h4>Create Table</h4>' +
            '    <div class="input-append" style="margin:0 5px 10px 0; float:left;">' +
            '        <input id="kl_table_num_cols" type="text" placeholder="2">' +
            '        <span class="add-on">Columns</span>' +
            '    </div>' +
            '    <div class="input-append kl_margin_bottom">' +
            '        <input id="kl_table_num_rows" type="text" placeholder="2">' +
            '        <span class="add-on">Rows</span>' +
            '    </div>' +
            '    <label>' +
            '        <input type="checkbox" class="kl_table_include_header" checked>' +
            '        Include Headings' +
            '    </label><br>' +
            '    <a href="#" class="btn btn-mini btn-primary kl_table_insert kl_margin_bottom"><i class="icon-add"></i> Insert at Cursor</a>' +
            '</div>' +
            '<div class="kl_table_layout" style="display:none;">' +
            '    <div class="btn-group-label">' +
            '        <p class="kl_margin_bottom"><span>Heading:</span>' +
            '           <a href="#" class="btn btn-mini kl_table_add_heading" data-tooltip="left" title="Turns first row into properly formatted heading. Place your cursor anywhere in the table and click the button.">First Row Headings</a></p>' +
            '        <span>Sortable:</span>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini kl_table_make_sortable" data-tooltip="top" title="Will allow the table to be sorted by clicking a column name.">On/Off</a>' +
            '        </div><br>' +
            '        <span>Insert Row: </span><br>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertRowBefore"><i class="icon-add"></i> Before/Above</a>' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertRowAfter"><i class="icon-add"></i> After/Under</a>' +
            '        </div>' +
            '        <span>Insert Column: </span><br>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertColBefore"><i class="icon-add"></i> Before</a>' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertColAfter"><i class="icon-add"></i> After</a>' +
            '        </div><br>' +
            '        <span>Delete Current:</span><br>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDeleteRow"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Row</a>' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDeleteCol"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Column</a>' +
            '            <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDelete"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Table</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <p class="kl_instructions">Choose an <span class="text-success">existing table</span> to use these options.</p>' +
            '    </div>' +
            '</div>' +
            '<div class="kl_table_styles" style="display:none;">' +
            '    <div class="kl_margin_bottom btn-group-label">' +
            '        <span>Table Style:</span>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini kl_table_style" rel="table">Basic</a>' +
            '            <a href="#" class="btn btn-mini kl_table_style" rel="table table-bordered">Border</a>' +
            '            <a href="#" class="btn btn-mini kl_table_style" rel="table table-condensed">Condensed</a>' +
            '            <a href="#" class="btn btn-mini kl_table_style" rel="table table-striped">Zebra</a>' +
            '        </div>' +
            '        <div class="kl_margin_bottom"><a href="#" class="btn btn-mini kl_table_style kl_remove" rel=""><i class="icon-end"></i> Remove Table Style</a></div>' +
            '        <span>Row Background:</span>' +
            '        <div class="btn-group kl_margin_bottom">' +
            '            <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_success" rel="success">Success</a>' +
            '            <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_error" rel="error">Error</a>' +
            '            <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_warning" rel="warning">Warning</a>' +
            '            <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_info" rel="info">Info</a>' +
            '            <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_remove icon-end" rel="" data-tooltip="top" title="Remove row background"><span class="screenreader-only">Remove row background</span></a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <p class="kl_instructions">Choose an <span class="text-success">existing table</span> to use these options.</p>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        tablesReady();
    }
    function customTablesButton() {
        var tablesDialog = '<a href="#" class="btn btn-mini kl_table_dialog_trigger" style="margin-left:5px;"><i class="fa fa-table"></i> Custom Tables</a>' +
            '<div id="kl_tables_dialog" title="Custom Tables" style="display:none;">' +
            '    <div class="btn-group kl_table_options kl_option_third_wrap">' +
            '        <a href="#" class="btn btn-small active" rel=".kl_table_new">Create</a>' +
            '        <a href="#" class="btn btn-small" rel=".kl_table_layout">Edit</a>' +
            '        <a href="#" class="btn btn-small" rel=".kl_table_styles">Style</a>' +
            '    </div>' +
            '    <div class="kl_table_new kl_margin_top">' +
            '        <h4>Create Table</h4>' +
            '        <div class="input-append" style="margin:0 5px 10px 0; float:left;">' +
            '            <input id="kl_table_num_cols" type="text" placeholder="2">' +
            '            <span class="add-on">Columns</span>' +
            '        </div>' +
            '        <div class="input-append kl_margin_bottom">' +
            '            <input id="kl_table_num_rows" type="text" placeholder="2">' +
            '            <span class="add-on">Rows</span>' +
            '        </div>' +
            '        <label>' +
            '            <input type="checkbox" class="kl_table_include_header" checked>' +
            '            Include Headings' +
            '        </label><br>' +
            '        <a href="#" class="btn btn-mini btn-primary kl_table_insert kl_margin_bottom"><i class="icon-add"></i> Insert at Cursor</a>' +
            '    </div>' +
            '    <div class="kl_table_layout kl_margin_top" style="display:none;">' +
            '        <div class="btn-group-label">' +
            '            <p class="kl_margin_bottom"><span>Heading:</span>' +
            '               <a href="#" class="btn btn-mini kl_table_add_heading" data-tooltip="left" title="Turns first row into properly formatted heading. Place your cursor anywhere in the table and click the button.">First Row Headings</a></p>' +
            '            <span>Sortable:</span>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_table_make_sortable" data-tooltip="top" title="Will allow the table to be sorted by clicking a column name.">On/Off</a>' +
            '            </div><br>' +
            '            <span>Insert Row: </span><br>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertRowBefore"><i class="icon-add"></i> Before/Above</a>' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertRowAfter"><i class="icon-add"></i> After/Under</a>' +
            '            </div>' +
            '            <span>Insert Column: </span><br>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertColBefore"><i class="icon-add"></i> Before</a>' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command" rel="mceTableInsertColAfter"><i class="icon-add"></i> After</a>' +
            '            </div><br>' +
            '            <span>Delete Current:</span><br>' +
            '            <div class="btn-group">' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDeleteRow"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Row</a>' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDeleteCol"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Column</a>' +
            '                <a href="#" class="btn btn-mini kl_table_mce_command kl_remove" rel="mceTableDelete"><i class="icon-end"></i> <span class="screenreader-only">Delete Current</span> Table</a>' +
            '            </div>' +
            '        </div>' +
            '        <div class="kl_instructions_wrapper">' +
            '           <p class="kl_instructions">Choose an <span class="text-success">existing table</span> to use these options.</p>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_table_styles kl_margin_top" style="display:none;">' +
            '        <div class="kl_margin_bottom btn-group-label">' +
            '            <span>Table Style:</span>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_table_style" rel="table">Basic</a>' +
            '                <a href="#" class="btn btn-mini kl_table_style" rel="table table-bordered">Border</a>' +
            '                <a href="#" class="btn btn-mini kl_table_style" rel="table table-condensed">Condensed</a>' +
            '                <a href="#" class="btn btn-mini kl_table_style" rel="table table-striped">Zebra</a>' +
            '            </div>' +
            '            <div class="kl_margin_bottom"><a href="#" class="btn btn-mini kl_table_style kl_remove" rel=""><i class="icon-end"></i> Remove Table Style</a></div>' +
            '            <span>Row Background:</span>' +
            '            <div class="btn-group kl_margin_bottom">' +
            '                <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_success" rel="success">Success</a>' +
            '                <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_error" rel="error">Error</a>' +
            '                <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_warning" rel="warning">Warning</a>' +
            '                <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_row_bg_info" rel="info">Info</a>' +
            '                <a href="#" class="btn btn-mini kl_table_row_backgrounds kl_remove icon-end" rel="" data-tooltip="top" title="Remove row background"><span class="screenreader-only">Remove row background</span></a>' +
            '            </div>' +
            '        </div>' +
            '        <div class="kl_instructions_wrapper">' +
            '           <p class="kl_instructions">Choose an <span class="text-success">existing table</span> to use these options.</p>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        $('.kl_add_style_to_iframe').after(tablesDialog);
        $('.kl_table_dialog_trigger').click(function (e) {
            e.preventDefault();
            $('#kl_tables_dialog').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 255 });
        });
        tablesReady();
    }

/////////////////////////////////////////////////////////////
//  BLOOM's REVISED                                        //
/////////////////////////////////////////////////////////////

    // Output category words based on which category is picked
    function bloomsList(arrayName, targetElement) {
        $('#kl_blooms').html('');
        $.each(arrayName, function () {
            $('#kl_blooms').append('<a class="label label-info kl_blooms" rel="' + this + '" title="' + this + '">' + this + '</a> ');
        });
        $('.kl_blooms').click(function (e) {
            e.preventDefault();
            var selectedWord = $(this).attr('rel');
            if ($('.kl_blooms_new_item').hasClass('active')) {
                $(iframeID).contents().find(targetElement).append('<li>' + selectedWord + ' </li>');
            } else {
                tinyMCE.execCommand('mceInsertContent', false, selectedWord + ' ');
            }
        });
    }
    function bloomsTaxonomy(targetSection) {
        var step, buttons, listInsertBtnName, bloomsButton, bloomsBoxContent, targetElement, sectionToScrollTo;
        if (targetSection === 'objectives') {
            targetElement = '#kl_objectives ol';
            sectionToScrollTo = '#kl_objectives';
            listInsertBtnName = 'Objectives List';
        } else if (targetSection === 'outcomes') {
            listInsertBtnName = 'Outcomes List';
            targetElement = '.kl_syllabus_learning_outcomes ul';
            sectionToScrollTo = '#kl_syllabus_outcomes';
        }
        bloomsButton = '<a class="btn btn-mini kl_blooms_btn kl_margin_bottom_small" href="#" data-tooltip="top"' +
            'title="Select action verbs from<br> Bloom\'s &rdquo;Revised&ldquo; Taxonomy"><i class="fa fa-book"></i> Bloom&rsquo;s Revised</a>';
        bloomsBoxContent = '<div id="kl_blooms_box" style="display:none" title="Bloom\'s Revised">' +
            '<div class="btn-group-label"><span>Insert At:</span>' +
            '    <div class="btn-group">' +
            '        <a class="btn btn-mini kl_blooms_at_cursor active" href="#">At Cursor</a>' +
            '        <a class="btn btn-mini kl_blooms_new_item" href="#" data-tooltip="top" tile="Will add a new list item to the ' + listInsertBtnName + '.">' + listInsertBtnName + '</a>' +
            '    </div>' +
            '</div>' +
            '<div id="kl_blooms_controls"></div>' +
            '<div id="kl_blooms"></div>' +
            '<div class="kl_instructions_wrapper">' +
            '   <p class="kl_instructions">Add to <span class="text-success">' + listInsertBtnName + '</span> or at <span class="text-success">cursor position</span>' +
            '</div>' +
            '</div>';

        if (targetSection === 'objectives') {
            $('#kl_tools_accordion').after(bloomsButton);
        } else if (targetSection === 'outcomes') {
            $('.kl_outcome_extras').prepend(bloomsButton);
        }
        $('#kl_tools_accordion').after(bloomsBoxContent);
        $.each(bloomsRevisedSections, function (key, value) {
            $('#kl_blooms_controls').append('<a class="btn btn-mini ' + key + ' kl_blooms_category">' + key + '</a>');
            $('.' + key).click(function (e) {
                e.preventDefault();
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    $('#kl_blooms').html('');
                } else {
                    bloomsList(value, targetElement);
                    $('.kl_blooms_category').each(function () {
                        $(this).removeClass('active');
                    });
                    $(this).addClass('active');
                }
            });
        });
        // Put category buttons into two btn-groups 
        step = 3;
        buttons = $('#kl_blooms_controls > a');
        buttons.each(function (i) {
            if (i % step === 0) {
                buttons.slice(i, i + step).wrapAll('<div class="btn-group">');
            }
        });
        // Trigger for Bloom's dialog
        $('.kl_blooms_btn').click(function (e) {
            e.preventDefault();
            $('#kl_blooms_box').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 255 });
            if ($(iframeID).contents().find(sectionToScrollTo).length > 0) {
                scrollToElement(sectionToScrollTo);
            }
            $('.kl_blooms_help').slideDown();
            $('#kl_blooms_box').parent('div').find('.ui-dialog-titlebar-close').click(function () {
                $('.kl_blooms_help').slideUp();
            });
        });
        // Determine whether word is inserted as a new item or at the cursor position
        $('.kl_blooms_new_item').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_blooms_at_cursor').removeClass('active');
        });
        $('.kl_blooms_at_cursor').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_blooms_new_item').removeClass('active');
        });
    }

/////////////////////////////////////////////////////////////
//  CONTENT ICONS                                          //
/////////////////////////////////////////////////////////////

    ////// On Ready/Click functions  //////
    function changeIcon() {
        $('.kl_icon_change').click(function () {
            var parentElement, child, currentClass, regExpMatch, newregExpMatch, step1Class, step2Class, cleanedClass, iconClass, newClass, applyIconTo;
            // Check whether applying to element or list
            applyIconTo = $('.kl_icon_apply_to.active').attr('rel');
            console.log(applyIconTo);
            if (applyIconTo === 'list') {
                console.log('list');
                parentElement = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'ul, ol');
                console.log(parentElement);

                child = parentElement.firstChild;
                while (child) {
                    if (child.nodeName.toLowerCase() === 'li') {
                        // Get the class(es) from the child element
                        tinyMCE.DOM.removeClass(child, 'fa');
                        currentClass = tinyMCE.DOM.getAttrib(child, 'class');
                        // Look through the classes for any class beginning with "icon-" and remove it
                        regExpMatch = /\bfa-\S+\s?/g;
                        step1Class = currentClass.replace(regExpMatch, '');
                        newregExpMatch = /\bicon-\S+\s?/g;
                        step2Class = step1Class.replace(newregExpMatch, '');
                        // Clean up an extra spaces
                        cleanedClass = step2Class.replace('  ', ' ');
                        // Grab the new class based on which icon link they clicked and combine with existing classes
                        iconClass = $(this).attr('rel');
                        newClass = cleanedClass + ' ' + iconClass;
                        // Clean up extra spaces and add to child
                        newClass = newClass.trim();
                        tinyMCE.DOM.setAttrib(child, 'class', newClass);
                    }
                    child = child.nextSibling;
                }
            } else {
                console.log('element');
                // Get parent element
                parentElement = tinyMCE.DOM.getParent(tinyMCE.activeEditor.selection.getNode(), 'span#kl_banner_right, h3, h4, h5, h6, a, li');
                // Get the class(es) from the parent element
                tinyMCE.DOM.removeClass(parentElement, 'fa');
                currentClass = tinyMCE.DOM.getAttrib(parentElement, 'class');
                // Look through the classes for any class beginning with "icon-" and remove it
                regExpMatch = /\bfa-\S+\s?/g;
                step1Class = currentClass.replace(regExpMatch, '');
                newregExpMatch = /\bicon-\S+\s?/g;
                step2Class = step1Class.replace(newregExpMatch, '');
                // Clean up an extra spaces
                cleanedClass = step2Class.replace('  ', ' ');
                // Grab the new class based on which icon link they clicked and combine with existing classes
                iconClass = $(this).attr('rel');
                newClass = cleanedClass + ' ' + iconClass;
                // Clean up extra spaces and add to parent
                newClass = newClass.trim();
                tinyMCE.DOM.setAttrib(parentElement, 'class', newClass);
            }
        });
    }
    ////// Custom Tools Accordion tab setup  //////
    function contentIcons() {
        var step, buttons,
            iconBox = '<div id="kl_icon_box" style="display:none;" title="Custom Icons">' +
            '<div class="btn-group-label kl_margin_bottom_small">' +
            '   <span>Apply Icon to selected:</span>' +
            '   <div class="btn-group" style="margin:0;">' +
            '       <a href="#" class="btn btn-mini kl_icon_apply_to active" rel="element">Element</a>' +
            '       <a href="#" class="btn btn-mini kl_icon_apply_to" rel="list">List</a>' +
            '   </div>' +
            '</div>' +
            '<div id="kl_icon_lists"></div>' +
            '<div id="kl_icons" class="kl_bordered_section kl_margin_bottom" style="display:none;"></div>' +
            '<a class="btn btn-mini kl_icon_change kl_remove icon-end kl_margin_bottom" rel="" data-tooltip="top" title="Place your cursor in an element with an icon and click here to remove it."> Remove Icon</a></p>' +
            '<div class="kl_instructions_wrapper" style="clear:both;">' +
            '   <div class="kl_instructions">' +
            '      <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '        title="<div class=\'popover-title\'>Content Icons</div>' +
            '          <div class=\'popover-content\'>' +
            '              <p>Icons in this section can be applied to any heading, link, or list item element.</p>' +
            '              <p>To add an icon to a heading:<p>' +
            '              <ol>' +
            '                  <li>Position the cursor anywhere in the element you want to have an icon.</li>' +
            '                  <li>Click on the icon you wish to add (clicking another icon will overwrite the current icon).</li>' +
            '              </ol>' +
            '              <p>To remove an icon from an element:</p>' +
            '              <ol>' +
            '                  <li>Position the cursor anywhere in the element from which you want to remove an icon.</li>' +
            '                  <li>Click the &ldquo;Remove&rdquo; link.</li>' +
            '              </ol>' +
            '          </div>">' +
            '        &nbsp;<span class="screenreader-only">About Content Icons.</span>' +
            '      </a>' +
            '      <p class="kl_margin_bottom">Place your <span class="text-success"><strong>cursor</strong></span> within a heading, link, or list item within the content area and then choose an icon' +
            '      <p>Additional icons from <a href="http://fortawesome.github.io/Font-Awesome/" target="_blank">Font Awesome</a></p>' +
            '   </div>' +
            '</div>' +
            '</div>',
            faBrandsIconArray = [
                'fa fa-adn', 'fa fa-android', 'fa fa-angellist', 'fa fa-apple', 'fa fa-behance', 'fa fa-behance-square', 'fa fa-bitbucket', 'fa fa-bitbucket-square',
                'fa fa-btc', 'fa fa-cc-amex', 'fa fa-cc-discover', 'fa fa-cc-mastercard', 'fa fa-cc-paypal', 'fa fa-cc-stripe', 'fa fa-cc-visa', 'fa fa-codepen',
                'fa fa-css3', 'fa fa-delicious', 'fa fa-deviantart', 'fa fa-digg', 'fa fa-dribbble', 'fa fa-dropbox', 'fa fa-drupal', 'fa fa-flickr',
                'fa fa-facebook', 'fa fa-facebook-square', 'fa fa-foursquare', 'fa fa-git', 'fa fa-git-square', 'fa fa-github', 'fa fa-github-alt', 'fa fa-github-square',
                'fa fa-gittip', 'fa fa-google', 'fa fa-google-plus', 'fa fa-google-plus-square', 'fa fa-google-wallet', 'fa fa-hacker-news', 'fa fa-html5', 'fa fa-instagram',
                'fa fa-ioxhost', 'fa fa-joomla', 'fa fa-jsfiddle', 'fa fa-lastfm', 'fa fa-lastfm-square', 'fa fa-linkedin', 'fa fa-linkedin-square', 'fa fa-linux',
                'fa fa-maxcdn', 'fa fa-meanpath', 'fa fa-openid', 'fa fa-pagelines', 'fa fa-paypal', 'fa fa-pied-piper', 'fa fa-pied-piper-alt', 'fa fa-qq',
                'fa fa-pinterest', 'fa fa-pinterest-square', 'fa fa-empire', 'fa fa-rebel', 'fa fa-reddit', 'fa fa-reddit-square', 'fa fa-renren', 'fa fa-skype',
                'fa fa-slack', 'fa fa-slideshare', 'fa fa-soundcloud', 'fa fa-spotify', 'fa fa-stack-exchange', 'fa fa-stack-overflow', 'fa fa-steam', 'fa fa-steam-square',
                'fa fa-stumbleupon', 'fa fa-stumbleupon-circle', 'fa fa-tencent-weibo', 'fa fa-trello', 'fa fa-tumblr', 'fa fa-tumblr-square', 'fa fa-twitter', 'fa fa-twitter-square',
                'fa fa-twitch', 'fa fa-vimeo-square', 'fa fa-vine', 'fa fa-vk', 'fa fa-weibo', 'fa fa-weixin', 'fa fa-windows', 'fa fa-yelp',
                'fa fa-xing', 'fa fa-xing-square', 'fa fa-youtube-play', 'fa fa-youtube', 'fa fa-youtube-square'
            ],
            canvasIconArray1 =  [
                'icon-instructure', 'icon-android', 'icon-apple', 'icon-facebook', 'icon-facebook-boxed', 'icon-github', 'icon-like', 'icon-linkedin',
                'icon-lti', 'icon-mature', 'icon-pinterest', 'icon-skype', 'icon-twitter', 'icon-twitter-boxed', 'icon-windows', 'icon-wordpress',
                'icon-copy-course', 'icon-export-content', 'icon-import-content', 'icon-next-unread', 'icon-replied', 'icon-reply-all-2', 'icon-reply-2',
                'icon-forward', 'icon-outdent', 'icon-indent', 'icon-outdent2', 'icon-indent2', 'icon-arrow-open-left', 'icon-arrow-open-right', 'icon-toggle-right', 'icon-toggle-left',
                'icon-mini-arrow-left', 'icon-mini-arrow-right', 'icon-arrow-left', 'icon-arrow-right', 'icon-mini-arrow-up', 'icon-mini-arrow-down', 'icon-arrow-up', 'icon-arrow-down',
                'icon-quiz-stats-high', 'icon-quiz-stats-low', 'icon-remove-from-collection', 'icon-collection-save', 'icon-upload', 'icon-download', 'icon-collapse', 'icon-expand',
                'icon-reset', 'icon-refresh', 'icon-off', 'icon-updown', 'icon-expand-items', 'icon-text-left', 'icon-text-center', 'icon-text-right',
                'icon-stats', 'icon-analytics', 'icon-rubric', 'icon-rubric-dark', 'icon-text', 'icon-email', 'icon-invitation', 'icon-document',
                'icon-note-light', 'icon-note-dark', 'icon-gradebook', 'icon-assignment', 'icon-ms-word', 'icon-ms-excel', 'icon-ms-ppt', 'icon-pdf',
                'icon-zipped', 'icon-folder', 'icon-media', 'icon-video', 'icon-audio', 'icon-filmstrip', 'icon-muted', 'icon-unmuted'
            ],
            canvasIconArray2 = [
                'icon-home', 'icon-trash', 'icon-edit', 'icon-compose', 'icon-paperclip', 'icon-pin', 'icon-flag', 'icon-tag',
                'icon-announcement', 'icon-image', 'icon-search', 'icon-search-address-book', 'icon-lock', 'icon-unlock', 'icon-link', 'icon-collection',
                'icon-printer', 'icon-rss', 'icon-rss-add', 'icon-star', 'icon-quiz-stats-deviation', 'icon-mark-as-read', 'icon-target', 'icon-settings',
                'icon-settings-2', 'icon-hamburger', 'icon-syllabus', 'icon-module', 'icon-educators', 'icon-unpublished', 'icon-publish', 'icon-unpublish',
                'icon-heart', 'icon-discussion', 'icon-discussion-reply', 'icon-discussion-check', 'icon-discussion-reply-2', 'icon-discussion-search', 'icon-discussion-x', 'icon-discussion-new',
                'icon-bookmark', 'icon-warning', 'icon-check', 'icon-check-plus', 'icon-standards', 'icon-not-graded', 'icon-peer-graded', 'icon-speed-grader',
                'icon-quiz', 'icon-question', 'icon-drop-down', 'icon-minimize', 'icon-quiz-stats-avg', 'icon-end', 'icon-add', 'icon-info',
                'icon-x', 'icon-plus', 'icon-more', 'icon-drag-handle', 'icon-calendar-month', 'icon-prerequisite', 'icon-calendar-day', 'icon-calendar-days',
                'icon-materials-required', 'icon-clock', 'icon-quiz-stats-time', 'icon-timer', 'icon-hour-glass', 'icon-student-view', 'icon-address-book', 'icon-peer-review',
                'icon-user', 'icon-user-add', 'icon-group', 'icon-group-new', 'icon-group-new-dark'
            ],
            faDirectionIconArray = [
                'fa fa-angle-double-down', 'fa fa-angle-double-left', 'fa fa-angle-double-right', 'fa fa-angle-double-up', 'fa fa-angle-down', 'fa fa-angle-left', 'fa fa-angle-right', 'fa fa-angle-up',
                'fa fa-arrow-circle-down', 'fa fa-arrow-circle-left', 'fa fa-arrow-circle-right', 'fa fa-arrow-circle-up', 'fa fa-arrow-circle-o-down', 'fa fa-arrow-circle-o-left', 'fa fa-arrow-circle-o-right', 'fa fa-arrow-circle-o-up',
                'fa fa-chevron-circle-down', 'fa fa-chevron-circle-left', 'fa fa-chevron-circle-right', 'fa fa-chevron-circle-up', 'fa fa-chevron-down', 'fa fa-chevron-left', 'fa fa-chevron-right', 'fa fa-chevron-up',
                'fa fa-arrow-down', 'fa fa-arrow-left', 'fa fa-arrow-right', 'fa fa-arrow-up', 'fa fa-long-arrow-down', 'fa fa-long-arrow-left', 'fa fa-long-arrow-right', 'fa fa-long-arrow-up',
                'fa fa-caret-down', 'fa fa-caret-left', 'fa fa-caret-right', 'fa fa-caret-up', 'fa fa-caret-square-o-down', 'fa fa-caret-square-o-left', 'fa fa-caret-square-o-right', 'fa fa-caret-square-o-up',
                'fa fa-hand-o-down', 'fa fa-hand-o-left', 'fa fa-hand-o-right', 'fa fa-hand-o-up', 'fa fa-thumbs-down', 'fa fa-thumbs-o-down', 'fa fa-thumbs-o-up', 'fa fa-thumbs-up',
                'fa fa-sign-in', 'fa fa-sign-out', 'fa fa-external-link', 'fa fa-external-link-square', 'fa fa-share-square', 'fa fa-share-square-o', 'fa fa-share', 'fa fa-reply',
                'fa fa-reply-all', 'fa fa-mail-reply-all', 'fa fa-repeat', 'fa fa-undo', 'fa fa-history', 'fa fa-refresh', 'fa fa-retweet', 'fa fa-exchange',
                'fa fa-random', 'fa fa-arrows', 'fa fa-arrows-alt', 'fa fa-arrows-h', 'fa fa-arrows-v', 'fa fa-level-down', 'fa fa-level-up'
            ],
            faEditorIconArray = [
                'fa fa-link', 'fa fa-chain-broken', 'fa fa-align-center', 'fa fa-align-justify', 'fa fa-align-left', 'fa fa-align-right', 'fa fa-outdent', 'fa fa-indent',
                'fa fa-font', 'fa fa-bold', 'fa fa-header', 'fa fa-italic', 'fa fa-underline', 'fa fa-text-height', 'fa fa-text-width', 'fa fa-strikethrough',
                'fa fa-superscript', 'fa fa-subscript', 'fa fa-paragraph', 'fa fa-columns', 'fa fa-bar-chart-o', 'fa fa-area-chart', 'fa fa-line-chart', 'fa fa-pie-chart',
                'fa fa-list-alt', 'fa fa-list', 'fa fa-list-ol', 'fa fa-list-ul', 'fa fa-table', 'fa fa-th', 'fa fa-th-large', 'fa fa-th-list',
                'fa fa-tasks', 'fa fa-filter', 'fa fa-sort-alpha-asc', 'fa fa-sort-alpha-desc', 'fa fa-sort-amount-asc', 'fa fa-sort-amount-desc', 'fa fa-sort-numeric-asc', 'fa fa-sort-numeric-desc',
                'fa fa-sort', 'fa fa-sort-asc', 'fa fa-sort-desc'
            ],
            faFilesIconArray = [
                'fa fa-download', 'fa fa-upload', 'fa fa-cloud-upload', 'fa fa-cloud-download', 'fa fa-folder', 'fa fa-folder-o', 'fa fa-folder-open', 'fa fa-folder-open-o',
                'fa fa-hdd-o', 'fa fa-file', 'fa fa-clipboard', 'fa fa-files-o', 'fa fa-file-o', 'fa fa-file-text', 'fa fa-file-text-o', 'fa fa-floppy-o',
                'fa fa-code-fork', 'fa fa-sitemap', 'fa fa-code', 'fa fa-terminal', 'fa fa-rss', 'fa fa-rss-square', 'fa fa-file-archive-o', 'fa fa-file-audio-o',
                'fa fa-file-code-o', 'fa fa-file-excel-o', 'fa fa-file-image-o', 'fa fa-file-pdf-o', 'fa fa-file-powerpoint-o', 'fa fa-file-video-o', 'fa fa-file-word-o'
            ],
            faMediaIconArray = [
                'fa fa-arrows-alt', 'fa fa-backward', 'fa fa-compress', 'fa fa-eject', 'fa fa-expand', 'fa fa-fast-backward', 'fa fa-fast-forward', 'fa fa-forward',
                'fa fa-pause', 'fa fa-play', 'fa fa-play-circle', 'fa fa-play-circle-o', 'fa fa-step-backward', 'fa fa-step-forward', 'fa fa-stop', 'fa fa-youtube-play',
                'fa fa-video-camera', 'fa fa-volume-down', 'fa fa-volume-off', 'fa fa-volume-up', 'fa fa-film', 'fa fa-microphone', 'fa fa-microphone-slash', 'fa fa-headphones',
                'fa fa-picture-o', 'fa fa-camera', 'fa fa-camera-retro', 'fa fa-crop'
            ],
            faObjectsIconArray = [
                'fa fa-clock-o', 'fa fa-calendar-o', 'fa fa-calendar', 'fa fa-search', 'fa fa-search-minus', 'fa fa-search-plus', 'fa fa-building-o', 'fa fa-building',
                'fa fa-university', 'fa fa-home', 'fa fa-trash', 'fa fa-trash-o', 'fa fa-archive', 'fa fa-briefcase', 'fa fa-suitcase', 'fa fa-futbol-o',
                'fa fa-birthday-cake', 'fa fa-gift', 'fa fa-tag', 'fa fa-tags', 'fa fa-leaf', 'fa fa-tree', 'fa fa-inbox', 'fa fa-ticket',
                'fa fa-trophy', 'fa fa-beer', 'fa fa-road', 'fa fa-bicycle', 'fa fa-car', 'fa fa-taxi', 'fa fa-bus', 'fa fa-truck',
                'fa fa-paper-plane', 'fa fa-paper-plane-o', 'fa fa-plane', 'fa fa-fighter-jet', 'fa fa-space-shuttle', 'fa fa-rocket', 'fa fa-wrench', 'fa fa-tachometer',
                'fa fa-graduation-cap', 'fa fa-umbrella', 'fa fa-glass', 'fa fa-coffee', 'fa fa-eraser', 'fa fa-magnet', 'fa fa-book', 'fa fa-newspaper-o',
                'fa fa-bug', 'fa fa-binoculars', 'fa fa-bullhorn', 'fa fa-cutlery', 'fa fa-spoon', 'fa fa-flag', 'fa fa-flag-checkered', 'fa fa-flag-o',
                'fa fa-fire-extinguisher', 'fa fa-bomb', 'fa fa-flask', 'fa fa-key', 'fa fa-lock', 'fa fa-unlock', 'fa fa-unlock-alt', 'fa fa-anchor',
                'fa fa-gamepad', 'fa fa-gavel', 'fa fa-magic', 'fa fa-thumb-tack', 'fa fa-paperclip', 'fa fa-scissors', 'fa fa-eyedropper', 'fa fa-paint-brush',
                'fa fa-pencil', 'fa fa-pencil-square', 'fa fa-pencil-square-o', 'fa fa-envelope', 'fa fa-envelope-o', 'fa fa-envelope-square', 'fa fa-lightbulb-o', 'fa fa-plug',
                'fa fa-desktop', 'fa fa-laptop', 'fa fa-tablet', 'fa fa-mobile', 'fa fa-calculator', 'fa fa-keyboard-o', 'fa fa-phone', 'fa fa-phone-square',
                'fa fa-fax', 'fa fa-print', 'fa fa-shopping-cart', 'fa fa-money', 'fa fa-credit-card', 'fa fa-ambulance', 'fa fa-h-square', 'fa fa-hospital-o',
                'fa fa-medkit', 'fa fa-plus-square', 'fa fa-stethoscope', 'fa fa-user-md', 'fa fa-wheelchair', 'fa fa-life-ring'
            ],
            faShapesIconArray = [
                'fa fa-cloud', 'fa fa-asterisk', 'fa fa-tint', 'fa fa-fire', 'fa fa-location-arrow', 'fa fa-map-marker', 'fa fa-globe', 'fa fa-sun-o',
                'fa fa-moon-o', 'fa fa-star', 'fa fa-star-o', 'fa fa-star-half-o', 'fa fa-star-half', 'fa fa-bolt', 'fa fa-music', 'fa fa-certificate',
                'fa fa-eye', 'fa fa-eye-slash', 'fa fa-bell-o', 'fa fa-bell-slash-o', 'fa fa-bell', 'fa fa-bell-slash', 'fa fa-heart-o', 'fa fa-heart',
                'fa fa-square-o', 'fa fa-square', 'fa fa-cube', 'fa fa-cubes', 'fa fa-bookmark', 'fa fa-bookmark-o', 'fa fa-spinner', 'fa fa-power-off',
                'fa fa-toggle-off', 'fa fa-toggle-on', 'fa fa-compass', 'fa fa-circle', 'fa fa-adjust', 'fa fa-circle-o', 'fa fa-circle-thin', 'fa fa-circle-o-notch',
                'fa fa-ban', 'fa fa-dot-circle-o', 'fa fa-bullseye', 'fa fa-smile-o', 'fa fa-meh-o', 'fa fa-frown-o', 'fa fa-users', 'fa fa-user',
                'fa fa-male', 'fa fa-female', 'fa fa-child', 'fa fa-paw', 'fa fa-lemon-o', 'fa fa-shield', 'fa fa-ellipsis-h', 'fa fa-ellipsis-v',
                'fa fa-cog', 'fa fa-cogs', 'fa fa-sliders', 'fa fa-puzzle-piece', 'fa fa-signal', 'fa fa-wifi', 'fa fa-bars', 'fa fa-barcode',
                'fa fa-qrcode', 'fa fa-crosshairs', 'fa fa-comments', 'fa fa-comments-o', 'fa fa-comment', 'fa fa-share-alt', 'fa fa-share-alt-square'
            ],
            faSymbolsIconArray = [
                'fa fa-minus', 'fa fa-minus-circle', 'fa fa-minus-square', 'fa fa-minus-square-o', 'fa fa-plus', 'fa fa-plus-circle', 'fa fa-plus-square', 'fa fa-plus-square-o',
                'fa fa-times', 'fa fa-times-circle', 'fa fa-times-circle-o', 'fa fa-exclamation', 'fa fa-exclamation-circle', 'fa fa-exclamation-triangle', 'fa fa-question', 'fa fa-question-circle',
                'fa fa-info', 'fa fa-info-circle', 'fa fa-quote-left', 'fa fa-quote-right', 'fa fa-check-square-o', 'fa fa-check-square', 'fa fa-check-circle-o', 'fa fa-check-circle',
                'fa fa-check', 'fa fa-at', 'fa fa-cc', 'fa fa-copyright', 'fa fa-ils', 'fa fa-tty', 'fa fa-btc', 'fa fa-usd',
                'fa fa-eur', 'fa fa-gbp', 'fa fa-inr', 'fa fa-jpy', 'fa fa-krw', 'fa fa-rub', 'fa fa-try', 'fa fa-recycle',
                'fa fa-database', 'fa fa-language'
            ],
            iconSections = {
                'Brands': faBrandsIconArray,
                'Direction': faDirectionIconArray,
                'Editor': faEditorIconArray,
                'Files': faFilesIconArray,
                'Media': faMediaIconArray,
                'Objects': faObjectsIconArray,
                'Shapes': faShapesIconArray,
                'Symbols': faSymbolsIconArray,
                'Canvas_1': canvasIconArray1,
                'Canvas_2': canvasIconArray2
            };

        $('#kl_tools').append(iconBox);
        // changeIcon();

        /// ICONS ////
        // Output category words based on which category is picked
        function contentIconList(arrayName) {
            $('#kl_icons').html('');
            $.each(arrayName, function () {
                $('#kl_icons').append('<a class="kl_icon_change" rel="' + this + '" title="' + this + '"><i class="' + this + '"></i></a> ');
            });
            $('#kl_icons i').each(function () {
                if ($(this).hasClass('fa')) {
                    $(this).parent('a').addClass('kl_fa_icon');
                }
            });
        }

        $.each(iconSections, function (key, value) {
            var displayTitle = key.replace('_', ' ');
            $('#kl_icon_lists').append('<a class="btn btn-mini ' + key + ' kl_icon_category">' + displayTitle + '</a>');
            $('.' + key).click(function (e) {
                e.preventDefault();
                $('#kl_icons').show();
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active');
                    $('#kl_icons').html('');
                } else {
                    contentIconList(value);
                    $('.kl_icon_category').each(function () {
                        $(this).removeClass('active');
                    });
                    $(this).addClass('active');
                }
                changeIcon();
            });
        });

        // Put category buttons into two btn-groups 
        step = 4;
        buttons = $('#kl_icon_lists > a');
        buttons.each(function (i) {
            if (i % step === 0) {
                buttons.slice(i, i + step).wrapAll('<div class="btn-group">');
            }
        });

        $('#kl_tools_accordion').after('<a href="#" class="kl_icons_activate kl_margin_bottom_small btn btn-mini" style="margin-right: 5px;"><i class="fa fa-tags"></i> Icons</a>');

        // Trigger for Icon dialog
        $('.kl_icons_activate').click(function (e) {
            e.preventDefault();
            $('#kl_icon_box').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 265 });
        });
        $('.kl_icon_apply_to').click(function (e) {
            e.preventDefault();
            $('.kl_icon_apply_to.active').removeClass('active');
            $(this).addClass('active');
        });
    }

/////////////////////////////////////////////////////////////
//  EDITING MARKUPS                                        //
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
//  FONTS                                                  //
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
//  MODULES GRID                                           //
/////////////////////////////////////////////////////////////

    ////// Supporting functions  //////
    function activateModuleListLink() {
        $('.kl_modules_activate').click(function (e) {
            e.preventDefault();
            $('#kl_tools_accordion').accordion({ active: 4});
        });
    }
    function bindRemove() {
        $('.kl_modules_list_remove_item').click(function (e) {
            e.preventDefault();
            var connectedItem = $(this).attr('rel');
            $(iframeID).contents().find(connectedItem).remove();
            $(this).parent('li').remove();
        });
    }
    function calendarSetup() {
        function getDateDiff(date1, date2, interval) {
            var second = 1000,
                minute = second * 60,
                hour = minute * 60,
                day = hour * 24,
                week = day * 7,
                timediff;
            date1 = new Date(date1).getTime();
            date2 = (date2 === 'now') ? new Date().getTime() : new Date(date2).getTime();
            timediff = date2 - date1;
            if (isNaN(timediff)) {
                return NaN;
            }
            switch (interval) {
            case "years":
                return date2.getFullYear() - date1.getFullYear();
            case "months":
                return ((date2.getFullYear() * 12 + date2.getMonth()) - (date1.getFullYear() * 12 + date1.getMonth()));
            case "weeks":
                return Math.floor(timediff / week);
            case "days":
                return Math.floor(timediff / day);
            case "hours":
                return Math.floor(timediff / hour);
            case "minutes":
                return Math.floor(timediff / minute);
            case "seconds":
                return Math.floor(timediff / second);
            case "milliseconds":
                return Math.floor(timediff);
            default:
                return undefined;
            }
        }
        $('.kl_modules_choose_dates_trigger').click(function (e) {
            e.preventDefault();
            var container = $(this).attr('rel');
            $(container).slideToggle();
        });
        $('.kl_modules_choose_dates').each(function () {
            var fromField = $(this).find('.kl_modules_from').attr('id'),
                toField = $(this).find('.kl_modules_to').attr('id'),
                connectedItem;
            $('#' + fromField).datepicker({
                defaultDate: null,
                changeMonth: true,
                numberOfMonths: 2,
                onClose: function (selectedDate) {
                    $('#' + toField).datepicker('option', 'minDate', selectedDate);
                    connectedItem = $('#' + toField).parents('div').attr('rel');
                    if ($(iframeID).contents().find(connectedItem + ' .kl_modules_active_start').length > 0) {
                        $(iframeID).contents().find(connectedItem + ' .kl_modules_active_start').html(selectedDate);
                    } else {
                        $(iframeID).contents().find(connectedItem).append('<span class="kl_modules_active_start" style="display:none;"> (' + selectedDate + ' to </span>');
                    }
                }
            });
            $('#' + toField).datepicker({
                defaultDate: null,
                changeMonth: true,
                numberOfMonths: 2,
                onClose: function (selectedDate) {
                    var startDate, startDateString, newStartDate, stopDate, stopDateString, newStopDate, dateDiff, numModules, i, printStart, printStop;
                    connectedItem = $('#' + toField).parents('div').attr('rel');
                    if ($(iframeID).contents().find(connectedItem + ' .kl_modules_active_stop').length > 0) {
                        $(iframeID).contents().find(connectedItem + ' .kl_modules_active_stop').html(selectedDate);
                    } else {
                        $(iframeID).contents().find(connectedItem).append('<span class="kl_modules_active_stop" style="display:none;">' + selectedDate + ')</span>');
                    }
                    $('#' + fromField).datepicker('option', 'maxDate', selectedDate);
                    // When first end date is selected, fill other modules in sequence
                    if ($('.kl_modules_from:eq(0)').val().length > 0 && $('.kl_modules_from:eq(1)').val().length === 0) {
                        startDateString = $('.kl_modules_from:eq(0)').val();
                        startDate = new Date(startDateString).getTime();
                        stopDateString = $('.kl_modules_to:eq(0)').val();
                        stopDate = new Date(stopDateString).getTime();
                        dateDiff = getDateDiff(startDate, stopDate, 'milliseconds');
                        numModules = $('.kl_modules_from').length;
                        for (i = 1; i < numModules; i++) {
                            startDate = stopDate + 86400000;
                            stopDate = startDate + dateDiff;
                            printStart = new Date(startDate);
                            printStop = new Date(stopDate);
                            newStartDate = (printStart.getMonth() + 1) + '/' + printStart.getDate() + '/' +  printStart.getFullYear();
                            newStopDate = (printStop.getMonth() + 1) + '/' + printStop.getDate() + '/' +  printStop.getFullYear();
                            // Write from Date
                            $('.kl_modules_from:eq(' + i + ')').val(newStartDate);
                            $('.kl_modules_from:eq(' + i + ')').focus();
                            // Write to Date
                            $('.kl_modules_to:eq(' + i + ')').val(newStopDate);
                            $('.kl_modules_to:eq(' + i + ')').focus();
                            // Close datePicker
                        }
                        $('.kl_modules_to').datepicker('hide');
                    }
                }
            });
            $('.kl_modules_expand_dates').click(function (e) {
                e.preventDefault();
                $('.kl_modules_choose_dates').slideDown();
            });
            $('.kl_modules_collapse_dates').click(function (e) {
                e.preventDefault();
                $('.kl_modules_choose_dates').slideUp();
            });
        });
    }
    function modListCheck() {
        if ($('.kl_modules_section').is(':checked')) {
            $('.kl_identify_section_kl_modules').remove();
            $('.kl_modules_section').parents('li').append('<a href="#" class="kl_modules_activate pull-right" data-tooltip="left" title="additional options"><i class="fa fa-cog"></i>&nbsp;</a>');
            activateModuleListLink();
        } else {
            $('.kl_modules_activate').remove();
        }
    }
    function moduleControls(moduleID, moduleTitle, isCurrent, moduleStartDate, moduleStopDate) {
        var markCurrent = '';
        if (isCurrent === true) {
            markCurrent = ' kl_current';
        }
        if (moduleTitle.length > 23) {
            moduleTitle = moduleTitle.substring(0, 18) + '&hellip;';
        }
        $('#kl_modules_list_controls').append('<li rel="#' + moduleID + '">' +
            '<a href="#" class="kl_modules_choose_dates_trigger" rel="#kl_module_dates_' + moduleID + '" data-tooltip="top" title="Show/hide date fields"><i class="fa fa-calendar"></i><span class="screenreader-only">Choose start/end dates</a>' +
            '<a href="#" class="kl_modules_list_mark_current' + markCurrent  + '" rel="#' + moduleID + '" data-tooltip="top" title="Mark as current week"><i class="icon-check"></i><span class="screenreader-only">Mark as Current Week </span></a>&nbsp;' +
            moduleTitle +
            '<a href="#" class="kl_remove pull-right kl_modules_list_remove_item" rel="#' + moduleID + '" data-tooltip="top" title="Remove ' + moduleTitle + '">' +
            '<i class="icon-end"></i><span class="screenreader-only">Remove item</a>' +
            '<div id="kl_module_dates_' + moduleID + '" rel="#' + moduleID + '"  class="kl_modules_choose_dates hide">' +
            '    <label for="kl_modules_from' + moduleID + '" style="display:none;">From</label>' +
            '    <input type="text" id="kl_modules_from' + moduleID + '" class="kl_modules_from input-small" name="kl_modules_from" placeholder="Start Date" value="' + moduleStartDate + '">' +
            '    <label for="kl_modules_to' + moduleID + '">to</label>' +
            '    <input type="text" id="kl_modules_to' + moduleID + '" class="kl_modules_to input-small" name="kl_modules_to" placeholder="End Date" value="' + moduleStopDate + '">' +
            '</div>' +
            '</li>');

    }
    function linkToFirstItemCheck() {
        var firstConnectedModuleUrl, checkFirst, myhref, cleanedhref;
        if ($(iframeID).contents().find('.kl_connected_module').length > 0) {
            firstConnectedModuleUrl = $(iframeID).contents().find('.kl_connected_module:first').attr('href');
            checkFirst = firstConnectedModuleUrl.match(/first/g);
            if (checkFirst !== null) {
                $('.kl_modules_list_link_to_first_item').addClass('active');
                $('.kl_modules_list_link_to_module').removeClass('active');
            } else {
                $('.kl_modules_list_link_to_first_item').removeClass('active');
                $('.kl_modules_list_link_to_module').addClass('active');
            }
            $('.kl_modules_list_link_to_first_item').click(function (e) {
                e.preventDefault();
                $(iframeID).contents().find('.kl_connected_module').each(function () {
                    myhref = $(this).attr('href');
                    cleanedhref = myhref.replace('/items/first', '');
                    $(this).attr('href', cleanedhref + '/items/first');
                    $(this).attr('data-mce-href', cleanedhref + '/items/first');
                });
                linkToFirstItemCheck();
            });
            $('.kl_modules_list_link_to_module').click(function (e) {
                e.preventDefault();
                $(iframeID).contents().find('.kl_connected_module').each(function () {
                    myhref = $(this).attr('href');
                    cleanedhref = myhref.replace('/items/first', '');
                    $(this).attr('href', cleanedhref);
                    $(this).attr('data-mce-href', cleanedhref);
                });
                linkToFirstItemCheck();
            });
            $('.kl_modules_list_link_controls').show();
        } else {
            $('.kl_modules_list_link_controls').hide();
        }
    }
    function markCurrent() {
        $('.kl_modules_list_mark_current').click(function (e) {
            e.preventDefault();
            var listItem = $(this).attr('rel');
            $(iframeID).contents().find('#kl_modules .kl_current').removeClass('kl_current');
            if ($(this).hasClass('kl_current')) {
                $(this).removeClass('kl_current');
            } else {
                $(iframeID).contents().find(listItem).addClass('kl_current');
                $('#kl_modules_list_controls .kl_current').removeClass('kl_current');
                $(this).addClass('kl_current');
            }
        });
    }
    function identifyModuleList() {
        if ($(iframeID).contents().find('#kl_modules').length > 0) {
            $(iframeID).contents().find('#kl_modules li').each(function () {
                var isCurrent, connectedItem, moduleTitle, moduleStartDate, moduleStopDate, newID;
                isCurrent = false;
                if ($(this).hasClass('kl_current')) {
                    isCurrent = true;
                }
                connectedItem = $(this).attr('id');
                // if the li does not have an id, give it one
                if (connectedItem === undefined) {
                // if (typeof connectedItem === 'undefined') {
                    newID = $(this).text();
                    if (newID.length > 15) {
                        newID = newID.substring(0, 15);
                    }
                    // make sure ID doesn't already exist
                    if ($('#'.newID).length > 0) {
                        newID = newID + '1';
                    }
                    connectedItem = newID.replace(/\W/g, '');
                    $(this).attr('id', connectedItem);
                }
                moduleTitle = $(this).find('a').text();
                moduleStartDate = $(this).find('.kl_modules_active_start').text();
                moduleStartDate = moduleStartDate.replace(' (', '').replace(' to ', '');
                moduleStopDate = $(this).find('.kl_modules_active_stop').text();
                moduleStopDate = moduleStopDate.replace(')', '');
                moduleControls(connectedItem, moduleTitle, isCurrent, moduleStartDate, moduleStopDate);
            });
            $('.kl_modules_insert').html('<i class="icon-refresh"></i> Update Modules');
            markCurrent();
            bindHover();
            bindRemove();
            linkToFirstItemCheck();
            calendarSetup();
            $('.kl_modules_list_link_controls').show();
            $('.kl_modules_dates').show();
        }
    }
    function insertModuleList() {
        $(iframeID).contents().find('#kl_modules').html('<div id="#kl_modules" />');
        $(iframeID).contents().find('#kl_modules').load('/courses/' + coursenum + '/modules #context_modules', function () {
            $('#kl_modules_list_controls').html('');
            $(iframeID).contents().find('.context_module').each(function () {
                var moduleID = $(this).attr('data-module-id'),
                    moduleTitle = $(this).attr('aria-label'),
                    moduleUrl = $(this).attr('data-module-url');
                $(this).html('<li id="kl_item_' + moduleID + '" class="icon-standards"><a href="' + moduleUrl + '" id="' + moduleID + '" class="kl_connected_module">' + moduleTitle + '</a></li>');
                moduleControls('kl_item_' + moduleID, moduleTitle, false, '', '');
            });
            $(iframeID).contents().find('.custom-tabs').attr('id", "moduleTabs');
            $(iframeID).contents().find('#context_modules').wrap('<ul>');
            $(iframeID).contents().find('#context_modules').contents().unwrap();
            $(iframeID).contents().find('.context_module').contents().unwrap();
            $('.kl_modules_insert').html('<i class="icon-refresh"></i> Update Modules');
            $('.kl_modules_dates').show();
            $('.kl_modules_list_link_controls').show();
            markCurrent();
            bindRemove();
            linkToFirstItemCheck();
            calendarSetup();
        });
        bindHover();
    }

    //// On Ready/Click functions  //////
    function moduleListToolReady() {
        // Module List
        $('.kl_modules_insert').click(function (e) {
            e.preventDefault();
            $('.kl_modules_section').prop('checked', true).trigger('change');
        });
        $('.kl_modules_section').change(function () {
            if ($(this).is(':checked')) {
                insertModuleList();
                modListCheck();
                activateModuleListLink();
            } else {
                $('.kl_modules_activate').remove();
            }
            modListCheck();
        });
        if ($(iframeID).contents().find('.kl_modules_quick_links').length > 0) {
            $('.kl_modules_quick_links_current').addClass('active');
            $('.kl_modules_quick_links_tabbed').removeClass('active');
            $('.kl_modules_quick_links_no').removeClass('active');
        } else if ($(iframeID).contents().find('.kl_modules_tabbed').length > 0) {
            $('.kl_modules_quick_links_current').removeClass('active');
            $('.kl_modules_quick_links_tabbed').addClass('active');
            $('.kl_modules_quick_links_no').removeClass('active');
        } else {
            $('.kl_modules_quick_links_current').removeClass('active');
            $('.kl_modules_quick_links_tabbed').removeClass('active');
            $('.kl_modules_quick_links_no').addClass('active');
        }
        $('.kl_modules_quick_links_current').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_modules').addClass('kl_modules_quick_links').removeClass('kl_modules_tabbed');
            $(this).addClass('active');
            $('.kl_modules_quick_links_no').removeClass('active');
            $('.kl_modules_quick_links_tabbed').removeClass('active');
        });
        $('.kl_modules_quick_links_tabbed').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_modules').addClass('kl_modules_tabbed').removeClass('kl_modules_quick_links');
            $(this).addClass('active');
            $('.kl_modules_quick_links_current').removeClass('active');
            $('.kl_modules_quick_links_no').removeClass('active');
        });
        $('.kl_modules_quick_links_no').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_modules').removeClass('kl_modules_quick_links kl_modules_tabbed');
            $(this).addClass('active');
            $('.kl_modules_quick_links_current').removeClass('active');
            $('.kl_modules_quick_links_tabbed').removeClass('active');
        });
        identifyModuleList();
    }
    ////// Custom Tools Accordion tab setup  //////
    function moduleListTool() {
        var addAccordionSection = '<h3>' +
            '    Module List' +
            '    <a class="help pull-right kl_tools_help" data-tooltip=\'{"tooltipClass":"popover right", "position":"right"}\'' +
            '      title="<div class=\'popover-title\'>Module Links</div>' +
            '        <div class=\'popover-content\'>' +
            '            <p>This section will create links for each of the modules for this course.</p>' +
            '            <p>You can set a calendar to mark the current module or manually mark it.</p>' +
            '        </div>">' +
            '      &nbsp;<span class="screenreader-only">About module list tool.</span>' +
            '    </a>' +
            '</h3>' +
            '<div>' +
            '    <div class="btn-group-label" style=>' +
            '        <span><i class="fa fa-calendar"></i> Date Fields: </a></span>' +
            '        <div class="btn-group kl_modules_dates" style="display:none;">' +
            '           <a href="#" class="btn btn-mini kl_modules_expand_dates"><i class="icon-expand"></i> Show Dates</a>' +
            '           <a href="#" class="btn btn-mini kl_modules_collapse_dates"><i class="icon-collapse"></i> Hide Dates</a>' +
            '       </div>' +
            '    </div>' +
            '    <div class="kl_modules_list_controls_options kl_margin_bottom" style="clear: both;">' +
            '        <ul id="kl_modules_list_controls" class="unstyled kl_sections_li kl_margin_top"></ul>' +
            '    </div>' +
            '    <a href="#" class="btn btn-mini kl_modules_insert kl_margin_top_small kl_margin_bottom_small" data-tooltip="left" title="Pulls new module list from Canvas"><i class="icon-add"></i> Insert Module Details</a>' +
            '    <div class="btn-group-label moduleLinkControl">' +
            '        <span>Include Quick Links: </span>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_modules_quick_links_current" data-tooltip="top" title="Will display links to current module items below grid">Current</a>' +
            '            <a href="#" class="btn btn-mini kl_modules_quick_links_tabbed" data-tooltip="top" title="Will tabbed list of modules with linked items">All</a>' +
            '            <a href="#" class="btn btn-mini kl_modules_quick_links_no">None</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="btn-group-label kl_modules_list_link_controls kl_margin_bottom hide">' +
            '        <span>Link To: </span>' +
            '        <div class="btn-group">' +
            '            <a href="#" class="btn btn-mini kl_modules_list_link_to_module kl_current" data-tooltip="top" title="Links open to the module on the modules page"><i class="icon-module"></i> Modules Page</a>' +
            '            <a href="#" class="btn btn-mini kl_modules_list_link_to_first_item" data-tooltip="top" title="Links point to the first item within a module"><i class="icon-document"></i> First Module Item</a>' +
            '        </div>' +
            '    </div>' +
            '    <div class="kl_instructions_wrapper">' +
            '       <div class="kl_instructions">' +
            '           <p>Set start/end dates to dynamically highlight current module or click the check icon to mark it manually.</p>' +
            '           <p>Position can be adjusted in the <a href="#" class="kl_sections_activate">Sections</a> panel</p>' +
            '        </div>' +
            '    </div>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        moduleListToolReady();
        $(iframeID).contents().find('.custom-accordion h3').each(function () {
            $(this).find('a').contents().unwrap();
        });
        $(iframeID).contents().find('.custom-tabs li').each(function () {
            $(this).find('a').contents().unwrap();
        });
    }

/////////////////////////////////////////////////////////////
//  ABOUT PANEL                                            //
//  Section that introduces tools                          //
///////////////////////////////////////////////////////////// 

    function aboutCustomTools() {
        var addAccordionSection = '<h3 class="kl_wiki" style="margin-top: 10px;">' +
            '   About Custom Tools' +
            '</h3>' +
            '<div class="kl_instructions">' +
            '   <p>This collection of tools is designed to assist in rapid course creation.</p>' +
            '   <p class="kl_margin_bottom">These tools were developed by USU&lsquo;s <a href="http://cidi.usu.edu/" target="_blank">Center for Innovative Design &amp; Instruction</a>.</p>' +
            '   <p><a href="https://usu.instructure.com/courses/305202" target="_blank">Learn more about these tools</a></p>' +
            '</div>';
        $('#kl_tools_accordion').append(addAccordionSection);
    }

/////////////////////////////////////////////////////////////
//  SYLLABUS FUNCTIONS                                     //
//  The following is specific to the syllabus page         //
///////////////////////////////////////////////////////////// 

    // Control whether or not to add policies on save
    function insertPolicies() {
        var policies = 'Policies need to be updated in the tools template course.';
        $.post(klToolsVariables.klApiToolsPath + 'getPage.php', { courseID: klToolsVariables.klToolTemplatesCourseID, pageUrl: 'university-policies-and-procedures' })
            .done(function (data) {
                policies = data;
            });
        $('#edit_course_syllabus_form .btn-primary').click(function () {
            if ($('.kl_syllabus_policies_yes').hasClass('active')) {
                $(iframeID).contents().find('.universityPolicies').remove();
                $(iframeID).contents().find('#kl_university_policies').remove();
                $(iframeID).contents().find('body').append('<div id="kl_university_policies" />');
                $(iframeID).contents().find('#kl_university_policies').html(policies);
            }
        });
    }

    function syllabusReady() {
        // Insert notice about policies below the content editor
        if ($('#kl_syllabus_policy_notice').length === 0) {
            $('.form-actions').before('<div id="kl_syllabus_policy_notice" style="font-size:16px;">' +
                '   <div class="btn-group">' +
                '       <a href="#" class="btn btn-small kl_syllabus_policies_yes">Yes<span class="screenreader-only">, include policies and procedures</span></a>' +
                '       <a href="#" class="btn btn-small kl_syllabus_policies_no">No<span class="screenreader-only">, do not include policies and procedures</span></a>' +
                '   </div>' +
                '   <strong> <em>Automatically include University Policies and Procedures when the syllabus is updated.</strong></em>' +
                '</div>');
            if ($(iframeID).contents().find('#kl_university_policies').length > 0) {
                $('.kl_syllabus_policies_yes').addClass('active');
            } else {
                $('.kl_syllabus_policies_no').addClass('active');
            }
            insertPolicies();
        }
        $('#kl_syllabus_policy_notice a').click(function (e) {
            e.preventDefault();
            $('#kl_syllabus_policy_notice .active').removeClass('active');
            $(this).addClass('active');
        });

        // Remove old policies from content area and add styling
        if ($(iframeID).contents().find('.universityPolicies').length > 0) {
            $(iframeID).contents().find('.universityPolicies').remove();
        }
        // Remove policies from content area and add styling
        if ($(iframeID).contents().find('#kl_university_policies').length > 0) {
            $(iframeID).contents().find('#kl_university_policies').remove();
        }

        // Because the syllabus behaves different from other sections, we have to monitor the cancel and update buttons
        $('#edit_course_syllabus_form .btn-primary').click(function () {
            $('#kl_syllabus_policy_notice').remove();
            $('#kl_tools_wrapper').hide();
            $(iframeID).contents().find('.kl_to_remove').removeClass('kl_to_remove');
        });

        $('.cancel_button').click(function () {
            $('#kl_syllabus_policy_notice').remove();
            $('#kl_tools_wrapper').hide();
        });
    }
    ////// SYLLABUS SUBSECTIONS //////
    // If the checked section exists, move it, if not add it
    function checkSyllabusSubSection(sectionName, sectionParent, sectionArray) {
        var container = $(iframeID).contents().find('#' + sectionParent);
        if ($('.' + sectionName + '_section').is(':checked')) {
            if ($(iframeID).contents().find('.' + sectionName).length > 0) {
                $(iframeID).contents().find('.' + sectionName).appendTo(container).removeClass('kl_to_remove');
                checkRemove();
            } else {
                $(iframeID).contents().find('#' + sectionParent).append(sectionArray[sectionName]);
                scrollToElement('.' + sectionName);
            }
        }
    }
    // Make primary-sections-list sortable so sections can be reordered
    function sortableSyllabusSubSections(sectionArray, sectionList, sectionParent) {
        $(sectionList).sortable({
            update: function () {
                // Add the basic template style if one is not already set
                templateCheck();
                // loop through the checked sections and move or add them
                $(sectionList + ' input:checkbox').each(function () {
                    checkSyllabusSubSection(this.value, sectionParent, sectionArray);
                });
            }
        });
        $(sectionList).disableSelection();
    }
    // This function loops through existing content and then updates section controls
    function identifySyllabusSubSections(sectionArray, sectionList, sectionParent) {
        // for any div that does not have a class, add the text from the heading as the class
        $(iframeID).contents().find('#' + sectionParent + ' div:not([class])').each(function () {
            var sectionTitle = $(this).find('h4').text(),
                newClass = sectionTitle.replace(/\W/g, '');
            $(this).addClass(newClass);
        });
        // take every div with a class
        $(iframeID).contents().find('#' + sectionParent).children('div').each(function () {
            var myValue, myTitle, newSection;
            if ($(this + '[class]')) {
                myValue = $(this).attr('class').split(' ')[0];
                // Check sections against default array
                if ($(sectionList + ' input[value=' + myValue + ']').length > 0) {
                    // If it is already in the list, move it to the bottom
                    // alert(myValue+" should be being checked');
                    $(sectionList + ' input[value=' + myValue + ']').parents('li').appendTo(sectionList);
                    $('.kl_syllabus_identify_subsection_' + myValue).hide();
                    $('.' + myValue + '_section').prop('checked', true);
                } else {
                    // If it is a default section, move it to the bottom and remove the selection to section link
                    // alert(myValue+" is in the else portion');
                    myTitle = $(this).find('h4:first').text();
                    newSection = '<li rel=".' + myValue + '"> <span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span>&nbsp;' +
                        '<label><input type="checkbox" class="kl_syllabus_custom_section" checked value="' +
                        myValue + '"> <span class="kl_syllabus_section_title">' + myTitle + '</span></label></li>';
                    $(newSection).appendTo(sectionList);
                }
            } else {
                $(this).parents('li').appendTo(sectionList);
            }
            $(sectionList + ' input:checkbox').not(':checked').each(function () {
                $(this).parents('li').appendTo(sectionList);
            });
        });
        sortableSyllabusSubSections(sectionArray, sectionList, sectionParent);
        // Bind a change function to bring up the remove button when unchecked
        $('.kl_syllabus_custom_section').change(function () {
            if ($(this).is(':checked')) {
                templateCheck();
            } else {
                var targetSection = '.' + this.value;
                markToRemove(targetSection);
            }
        });
        // Move uncheck default items to bottom of '+sectionList+'
        $('.' + sectionList + ' input:checkbox').not(':checked').each(function () {
            $(this).parents('li').appendTo('.' + sectionList);
        });

    }
    // Create a new section using the input in the template dialog
    function createSubSection(sectionList, sectionParent) {
        var newSectionName, newSectionClass, newSection, newSectionControls;
        templateCheck();
        // Check for parent section
        if ($('.' + sectionParent + '_section').not(':checked')) {
            $('.' + sectionParent + '_section').prop('checked', true).trigger('change');
        }
        // Grab name from text field
        newSectionName = $('#' + sectionParent + '_new_section_name').val();
        // Create a new class using the section name
        newSectionClass = newSectionName.replace(/\W/g, '');
        // If class name already exists, modify the class name
        if ($(iframeID).contents().find('.' + newSectionClass).length > 0) {
            newSectionClass = newSectionClass + '_2';
        }
        // Insert the new section into the TinyMCE editor
        newSection = '<div class="' + newSectionClass + '" style="margin-left:10px;">' +
            '    <h4>' + newSectionName + '</h4>' +
            '    <p>Insert content here.</p>' +
            '</div>';
        $(iframeID).contents().find('#' + sectionParent).append(newSection);
        // Put focus on new section
        scrollToElement('.' + newSectionClass);
        $(iframeID).contents().find('.' + newSectionClass).addClass('kl_section_hover');
        setTimeout(function () {
            $(iframeID).contents().find('.' + newSectionClass).removeClass('kl_section_hover');
        }, 1000);
        // Create an <li> for this section in the Sections List
        newSectionControls = '<li rel=".' + newSectionClass + '">' +
            '<span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span>&nbsp;' +
            '<label><input type="checkbox" class="kl_syllabus_custom_section" checked value="' + newSectionClass + '">' +
            '    <span class="kl_syllabus_section_title">' + newSectionName + '</span>' +
            '</label>' +
            '</li>';
        $(newSectionControls).appendTo(sectionList);
        // Clear the section name field
        $('#' + sectionParent + '_new_section_name').val('');
        // Bind a change function to bring up the remove button when unchecked
        $('.kl_syllabus_custom_section').change(function () {
            if ($(this).is(':checked')) {
                templateCheck();
            } else {
                var targetSection = '.' + this.value;
                markToRemove(targetSection);
            }
        });
        // Show section on hover
        bindHover();
    }
    ////// Syllabus Subsection On Ready/Click functions  //////
    function syllabusSubSectionsSetup(sectionArray, sectionList, sectionParent) {
        setTimeout(function () {
            identifySyllabusSubSections(sectionArray, sectionList, sectionParent);
        }, 300);
        // Functions to run when a section checkbox is changed
        $(sectionList + ' input:checkbox').change(function () {
            var parentCheckbox, targetSection;
            if ($(this).is(':checked')) {
                $(this).parents('li').find('a').hide();
                templateCheck();
                parentCheckbox = '.' + sectionParent + '_section';
                if ($(parentCheckbox).is(':checked') === false) {
                    $(parentCheckbox).prop('checked', true);
                    $('.kl_template_sections_list input:checkbox:checked').each(function () {
                        checkTemplateSection(this.value, klToolsArrays.klSyllabusPrimarySections);
                    });
                }

                $(sectionList + ' input:checkbox:checked').each(function () {
                    checkSyllabusSubSection(this.value, sectionParent, sectionArray);
                });
            } else {
                $(this).parents('li').find('a').show();
                targetSection = '.' + this.value;
                markToRemove(targetSection);
            }
            $(iframeID).contents().find('p:first').filter(function () {
                return $.trim($(this).html()) === '&nbsp;';
            }).remove();
        });

        // "+" button next to new section field
        $('#' + sectionParent + '_add_section').click(function (e) {
            e.preventDefault();
            createSubSection(sectionList, sectionParent);
        });
        // Button that turns selected text into a predefined section
        $(sectionList + ' .kl_syllabus_identify_subsection').click(function (e) {
            e.preventDefault();
            var parentCheckbox, sectionName = $(this).attr('rel');
            templateCheck();
            parentCheckbox = '.' + sectionParent + '_section';
            if ($(parentCheckbox).is(':checked') === false) {
                $(parentCheckbox).prop('checked', true);
                $('.kl_template_sections_list input:checkbox:checked').each(function () {
                    checkTemplateSection(this.value, klToolsArrays.klSyllabusPrimarySections);
                });
            }

            tinyMCE.activeEditor.focus();
            tinyMCE.activeEditor.selection.setContent('<div class="' + sectionName + '">' + tinyMCE.activeEditor.selection.getContent() + '</div>');
            $(this).hide();
            $(this).parent('li').find('input').prop('checked', true).trigger('change');
        });
        // create a new section if return/enter is pressed in the new section field
        $('#' + sectionParent + '_new_section_name').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                createSubSection(sectionList, sectionParent);
                return false;
            }
        });
    }
    // Setup subsection panels
    function populateSubSection(subSectionArray, sectionParent) {
        var sectionTitle, addAccordionSection, sectionList;
        sectionTitle = sectionParent.replace('kl_syllabus_', '').replace('_', ' ');
        addAccordionSection = '<h3>' + sectionTitle +
            '        <a class="help pull-right kl_tools_help element_toggler" aria-controls="' + sectionParent + '_dialog" data-tooltip="left" title="Click to display ' + sectionTitle + ' help.">' +
            '            &nbsp;<span class="screenreader-only">About ' + sectionTitle + '.</span>' +
            '        </a>' +
            '        </h3>' +
            '    <div>' +
            '    <ol class="unstyled ' + sectionParent + '_sections_list kl_sections_li">' +
            '    </ol>' +
            '    <form class="form-inline input-append">' +
            '       <input id="' + sectionParent + '_new_section_name" rel="' + sectionParent + '_sections_list" class="kl_syllabus_section_title_field" type="text" placeholder="New Section Title">' +
            '       <a href="#" id="' + sectionParent + '_add_section" class="btn add-on"><i class="icon-add"></i>' +
            '       <span class="screenreader-only">Add New Section</span></a>' +
            '    </form>' +
            '    <div id="' + sectionParent + '_syllabus_sections_buttons">' +
            '    </div>' +
            '    </div>';
        $('#kl_tools_accordion').append(addAccordionSection);
        sectionList = '.' + sectionParent + '_sections_list';
        $.each(subSectionArray, function (key) {
            sectionTitle = key.replace('kl_syllabus_', '').replace(/_/g, ' ');
            $(sectionList).append('<li rel=".' + key + '"><span title="Drag to reorder" class="move_item_link"><img alt="Move" src="/images/move.png?1366214258"></span>' +
                '   <label><input type="checkbox" class="' + key + '_section" value="' + key + '">' +
                '       <span class="kl_syllabus_section_title">' + sectionTitle + '</span>' +
                '   </label>' +
                '   <a html="#" class="kl_syllabus_identify_subsection kl_syllabus_identify_subsection_' + key + ' icon-collection-save" rel="' + key + '" data-tooltip="left" title="Turn selected content into <br>' + sectionTitle + ' section"> Identify ' + sectionTitle + ' section</a>' +
                '</li>');
        });
        syllabusSubSectionsSetup(subSectionArray, sectionList, sectionParent);
    }
    function addSyllabusSubsections() {
        populateSubSection(klToolsArrays.klSyllabusInformationSubSections, 'kl_syllabus_information');
        populateSubSection(klToolsArrays.klSyllabusOutcomesSubSections, 'kl_syllabus_outcomes');
        populateSubSection(klToolsArrays.klSyllabusResourcesSubSections, 'kl_syllabus_resources');
        populateSubSection(klToolsArrays.klSyllabusActivitiesSubSections, 'kl_syllabus_activities');
        populateSubSection(klToolsArrays.klSyllabusGradesSubSections, 'kl_syllabus_grades');
        populateSubSection(klToolsArrays.klSyllabusPoliciesSubSections, 'kl_syllabus_policies');
    }

    //////////// REMOVE SUBSECTION CONTROLS //////////////////
    function removeSubsection() {
        $('#kl_tools').append('<div class="kl_remove_sections_wrapper hide text-center">' +
            '    <a href="#" class="btn btn-danger kl_remove_sections"><i class="icon-trash"></i> Remove Section(s)</a>' +
            '    <p><strong>Warning:</strong> This will also delete any content within the section.</p>' +
            '</div>');
    }

    ////// Syllabus Subsection Supporting functions  //////
    // Additional buttons/controls for various sections
    // Information Section
    function additionalInformationControls() {
        var informationBtns = '<div class="kl_syllabus_information_controls"><h4>Additional Contacts:</h4>' +
            '<div class="btn-group-label kl_syllabus_instructor_add_section kl_margin_bottom">' +
            '    <div class="btn-group">' +
            '        <a href="#" class="btn btn-mini kl_syllabus_instructor_add" data-tooltip="top" title="Add another instructor to <br>the Contact Information section"><i class="icon-add"></i><span class="screenreader-only">Add Instructor</span></a>' +
            '        <a href="#" class="btn btn-mini kl_syllabus_instructor_remove" data-tooltip="top" title="Remove last instructor from <br>the Contact Information section"><i class="icon-minimize"></i><span class="screenreader-only">Remove Instructor</span></a>' +
            '    </div>' +
            '    Instructor' +
            '</div>' +
            '<div class="btn-group-label kl_syllabus_teaching_assistant_add_section kl_margin_bottom">' +
            '    <div class="btn-group">' +
            '        <a href="#" class="btn btn-mini kl_syllabus_teaching_assistant_add" data-tooltip="top" title="Add another teaching assistant to <br>the Contact Information section"><i class="icon-add"></i><span class="screenreader-only">Add teaching assistant</span></a>' +
            '        <a href="#" class="btn btn-mini kl_syllabus_teaching_assistant_remove" data-tooltip="top" title="Remove last teaching assistant from <br>the Contact Information section"><i class="icon-minimize"></i><span class="screenreader-only">Remove teaching assistant</span></a>' +
            '    </div>' +
            '    TA' +
            '</div></div>';
        $('#kl_syllabus_information_syllabus_sections_buttons').append(informationBtns);
        function checkContacts() {
            if ($(iframeID).contents().find('.kl_syllabus_additional_instructor').length > 0) {
                $('.kl_syllabus_instructor_remove').removeClass('disabled');
            } else {
                $('.kl_syllabus_instructor_remove').addClass('disabled');
            }
            if ($(iframeID).contents().find('.kl_syllabus_additional_teaching_assistant').length > 0) {
                $('.kl_syllabus_teaching_assistant_remove').removeClass('disabled');
            } else {
                $('.kl_syllabus_teaching_assistant_remove').addClass('disabled');
            }
            if ($('.kl_syllabus_instructors_section:checked').length > 0) {
                $('.kl_syllabus_instructor_add_section').show();
            } else {
                $('.kl_syllabus_instructor_add_section').hide();
            }
            if ($('.kl_syllabus_teaching_assistant_section:checked').length > 0) {
                $('.kl_syllabus_teaching_assistant_add_section').show();
            } else {
                $('.kl_syllabus_teaching_assistant_add_section').hide();
            }
            if ($('.kl_syllabus_instructors_section:checked').length > 0 || $('.kl_syllabus_teaching_assistant_section:checked').length > 0) {
                $('.kl_syllabus_information_controls').show();
            } else {
                $('.kl_syllabus_information_controls').hide();
            }
        }

        $('.kl_syllabus_instructor_add').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_syllabus_instructors').append(klToolsVariables.klSyllabusAdditionalInstructor);
            checkContacts();
        });
        $('.kl_syllabus_instructor_remove').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_syllabus_additional_instructor:last').remove();
            checkContacts();
        });
        $('.kl_syllabus_teaching_assistant_add').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_syllabus_teaching_assistant').append(klToolsVariables.klSyllabusAdditionalTeachingAssistant);
            checkContacts();
        });
        $('.kl_syllabus_teaching_assistant_remove').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('.kl_syllabus_additional_teaching_assistant:last').remove();
            checkContacts();
        });
        $('.kl_syllabus_instructors_section').change(function () {
            checkContacts();
        });
        $('.kl_syllabus_teaching_assistant_section').change(function () {
            checkContacts();
        });
        checkContacts();
    }
    // Outcomes Section
    function additionalOutcomesControls() {
        var learningOutcomesBtns, ideaBox, bloomsHelp, ideaHelp;
        function checkOutcomesBox() {
            if ($('.kl_syllabus_learning_outcomes_section').is(':checked')) {
                $('#kl_syllabus_outcomes_syllabus_sections_buttons').show();
            } else {
                $('#kl_syllabus_outcomes_syllabus_sections_buttons').hide();
            }
        }
        learningOutcomesBtns = '<h4>Learning Outcomes</h4>' +
            '<div class="btn-group kl_margin_bottom kl_outcome_extras">' +
            '   <a class="btn btn-mini fa fa-book kl_idea_btn  kl_margin_bottom_small" href="#">IDEA Objectives</a>' +
            '</div>' +
            '<div class="btn-group-label kl_margin_bottom">Include Assessments:' +
            '   <div class="btn-group">' +
            '       <a href="#" class="btn btn-mini kl_syllabus_outcomes_assessments_yes" data-tooltip="top" title="Include assessments<br> below each outcome.">Yes</a>' +
            '       <a href="#" class="btn btn-mini kl_syllabus_outcomes_assessments_no active" data-tooltip="top" title="Do not include assessments<br> below each outcome.">No</a>' +
            '   </div>' +
            '</div>' +
            '<a class="btn btn-mini kl_syllabus_outcomes_add kl_margin_bottom" href="#" style="display:none" data-tooltip="top" title="Insert a new Outcome/Assessment pair into the outcomes list."><i class="fa fa-list-ul"></i> Add Outcome/Assessment Pair</a>';
        $('#kl_syllabus_outcomes_syllabus_sections_buttons').append(learningOutcomesBtns);
        ideaBox = '<div id="kl_idea_box" style="display:none;" title="IDEA Objectives">' +
            '<div class="<div class="btn-group-label">Insert At:' +
            '    <div class="btn-group">' +
            '        <a class="btn btn-mini kl_idea_new_item active" href="#" data-tooltip="top" tile="Will add a new list item to the &ldquo;Outcomes&rdquo; list.">New List Item</a>' +
            '        <a class="btn btn-mini kl_idea_at_cursor" href="#">At Cursor</a>' +
            '    </div>' +
            '</div>' +
            '<ol id="kl_idea_controls">' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Gaining factual knowledge (terminology, classifications, methods, trends)</span> - IDEA Objective 1</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Learning fundamental principles, generalizations, or theories</span> - IDEA Objective 2</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Learning to Apply Course Material (to improve thinking, problem solving, and decisions)</span> - IDEA Objective 3</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Developing specific skills, competencies, and points of view needed by professionals in the field most closely related to this course</span> - IDEA Objective 4</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Acquiring skills in working with others as a member of a team</span> - IDEA Objective 5</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Developing creative capacities (writing, inventing, designing, performing in art, music, drama, etc.)</span> - IDEA Objective 6</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Gaining a broader understanding and appreciation of intellectual/cultural activity</span> - IDEA Objective 7</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Developing skill in expressing myself orally or in writing</span> - IDEA Objective 8</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Learning how to find and use resources for answering questions or solving problems</span> - IDEA Objective 9</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Developing a clearer understanding of, and commitment to, personal values</span> - IDEA Objective 10</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Learning to analyze and critically evaluate ideas, arguments, and points of view</span> - IDEA Objective 11</a></li>' +
            '    <li><a href="#" class="kl_idea_objective"><span class="kl_idea_objective_text">Acquiring an interest in learning more by asking questions and seeking answers</span> - IDEA Objective 12</a></li>' +
            '</ol>' +
            '</div>';
        bloomsHelp = '<div class="well kl_blooms_help" style="padding:5px;display:none;">' +
            '    <h5>Bloom&lsquo;s Help</h5>' +
            '    <p><small><span class="text-info"><strong>Select one of the six levels</strong></span> to see a list of action verbs. <span class="text-info"><strong>Click a verb</strong></span> to insert it.</small>' +
            '    <a href="#" class="kl_close_help btn btn-mini">Close Help</a>' +
            '</div>';
        ideaHelp = '<div class="well kl_idea_help" style="padding:5px;display:none;">' +
            '    <h5>IDEA Objectives Help</h5>' +
            '    <p><small>Click an objective <span class="text-info"><strong>once to expand</strong></span>. When you have found one you need <span class="text-info"><strong>click again to apply</strong></span>.</small>' +
            '    <p><small>You can also use <span class="text-info"><strong>Tab</strong></span> and <span class="text-info"><strong>Shift+Tab</strong></span> to navigate through the objectives and <span class="text-info"><strong>Enter</strong></span> to apply.</p>' +
            '    <a href="#" class="kl_close_help btn btn-mini">Close Help</a>' +
            '</div>';
        $('#kl_syllabus_outcomes_syllabus_sections_buttons').append(ideaBox + bloomsHelp + ideaHelp);
        $('.kl_syllabus_learning_outcomes_section').change(function () {
            checkOutcomesBox();
        });
        $('.kl_close_help').click(function (e) {
            e.preventDefault();
            $(this).parents('div.well').slideUp();
        });
        checkOutcomesBox();

        //// IDEA ////
        // Trigger for IDEA dialog
        $('.kl_idea_btn').click(function (e) {
            e.preventDefault();
            scrollToElement('.kl_syllabus_learning_outcomes');
            $('#kl_idea_box').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 255 });
            $('.kl_idea_help').slideDown();
            $('#kl_idea_box').parent('div').find('.ui-dialog-titlebar-close').click(function () {
                $('.kl_idea_help').slideUp();
            });
        });
        // Selection Hover
        $('.kl_idea_objective').click(function (e) {
            e.preventDefault();
            var selectedObjective = $(this).find('.kl_idea_objective_text').text();
            if ($(this).hasClass('kl_idea_expand')) {
                if ($('.kl_idea_new_item').hasClass('active')) {
                    $(iframeID).contents().find('.kl_syllabus_learning_outcomes ul').append('<li>' + selectedObjective + ' </li>');
                } else {
                    tinyMCE.execCommand('mceInsertContent', false, selectedObjective + ' ');
                }
            }
            $(this).focus();
        });
        $('.kl_idea_objective').focus(function () {
            $('.kl_idea_expand').removeClass('kl_idea_expand');
            $(this).addClass('kl_idea_expand');
        });
        // Determine whether word is inserted as a new item or at the cursor position
        $('.kl_idea_new_item').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_idea_at_cursor').removeClass('active');
        });
        $('.kl_idea_at_cursor').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_idea_new_item').removeClass('active');
        });
        // Close IDEA help
        // Check whether to include assessment in list or not
        $('.kl_syllabus_outcomes_assessments_yes').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_syllabus_outcomes_assessments_no').removeClass('active');
            $('.kl_syllabus_outcomes_add').show();
            var assessmentList = '<ul class="kl_outcomes_assessment_list">' +
                '    <li>Assessment Tools: </li>' +
                '</ul>';
            $(iframeID).contents().find('.kl_syllabus_learning_outcomes ul li').each(function () {
                if ($(this).next('li').length > 0) {
                    $(this).after(assessmentList);
                }
            });
            if (!$(iframeID).contents().find('.kl_syllabus_learning_outcomes ul li:last').parent().hasClass('kl_outcomes_assessment_list')) {
                $(iframeID).contents().find('.kl_syllabus_learning_outcomes ul li:last').after(assessmentList);
            }
        });
        $('.kl_syllabus_outcomes_assessments_no').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $('.kl_syllabus_outcomes_assessments_yes').removeClass('active');
            $('.kl_syllabus_outcomes_add').hide();
            $(iframeID).contents().find('.kl_outcomes_assessment_list').remove();
        });
        // When the page loads, check yes if there are assessment lists
        if ($(iframeID).contents().find('.kl_outcomes_assessment_list').length > 0) {
            $('.kl_syllabus_outcomes_assessments_yes').addClass('active');
            $('.kl_syllabus_outcomes_assessments_no').removeClass('active');
            $('.kl_syllabus_outcomes_add').show();
        }
        // Add Outcomes/Assessment button
        $('.kl_syllabus_outcomes_add').click(function (e) {
            e.preventDefault();
            scrollToElement('.kl_syllabus_learning_outcomes ul');
            $(iframeID).contents().find('.kl_syllabus_learning_outcomes ul').first().append('<li>Outcome</li>' +
                '<ul class="kl_outcomes_assessment_list">' +
                '    <li>Assessment Tools: </li>' +
                '</ul>');
        });
    }

    // Grades Section
    function additionalGradesControls() {
        // supporting functions
        function checkComponent() {
            if ($('.kl_syllabus_course_assignments_section').is(':checked')) {
                $('.kl_grades_component_points_controls').show();
            } else {
                $('.kl_grades_component_points_from_canvas').removeClass('active');
                $('.kl_grades_component_points_custom_table').removeClass('active');
            }
            if ($(iframeID).contents().find('#syllabus').length > 0) {
                $('.kl_grades_component_points_from_canvas').addClass('active');
                $('.kl_grades_component_points_from_canvas_controls').show();
                $(iframeID).contents().find('#kl_syllabus_canvas_assignment_list').remove();
                $(iframeID).contents().find('.kl_syllabus_course_assignments').append('<div id="kl_syllabus_canvas_assignment_list" />');
                $('#syllabus').clone().appendTo($(iframeID).contents().find('#kl_syllabus_canvas_assignment_list'));
            }
        }
        // This function will pull the grade scheme from Canvas if it is checked otherwise it will give a message
        function getGradeScheme() {
            $('.kl_grade_scheme_alert').html('<i class="fa fa-spinner fa-spin"></i> Checking Canvas grade scheme');
            $(iframeID).contents().find('#kl_syllabus_canvas_grade_scheme').load('/courses/' + coursenum + '/settings #course_grading_standard_enabled', function () {
                if ($(iframeID).contents().find('#course_grading_standard_enabled').is(':checked') === true) {
                    $(iframeID).contents().find('#kl_syllabus_canvas_grade_scheme').load('/courses/' + coursenum + '/settings .grading_standard_data', function () {
                        $(iframeID).contents().find('.grading_standard_data thead').remove();
                        $(iframeID).contents().find('.grading_standard_data .editing_box').remove();
                        $(iframeID).contents().find('.grading_standard_data caption').remove();
                        $(iframeID).contents().find('.grading_standard_data .insert_grading_standard').remove();
                        $(iframeID).contents().find('.grading_standard_data .displaying').contents().unwrap();
                        $(iframeID).contents().find('.grading_standard_data').attr('style', '').attr('data-mce-style', '');
                        $(iframeID).contents().find('.grading_standard_data td').attr('style', '').attr('data-mce-style', '');
                        $(iframeID).contents().find('.grading_standard_data').css('max-width', '225px').addClass('table table-condensed');
                        $(iframeID).contents().find('.grading_standard_data tr').each(function () {
                            $(this).find('td:first').css({'width': '95px', 'padding-left': '5px;'}).attr('data-mce-style', 'width:100px;padding-left:5px;');
                        });
                        $(iframeID).contents().find('.grading_standard_data .max_score_cell').css('text-align', 'right').attr('data-mce-style', 'text-align:right;padding-right:5px;');
                        $('.kl_grade_scheme_alert').html('');
                    });
                } else {
                    $(iframeID).contents().find('#kl_syllabus_canvas_grade_scheme').html('<p class="alert alert-error">Not currently using the Canvas grade scheme. You better change that!</p>');
                    $('.kl_grade_scheme_alert').html('<p class="alert alert-error">This feature uses the grade scheme built into Canvas.<br>' +
                        '  You have not configured your course to use the grade scheme.</p>' +
                        '<p style="text-align:center;">' +
                        '  <a href="#" class="btn btn-danger kl_grade_scheme_walkthrough"><i class="fa fa-eye"></i> Show Me How</a>' +
                        '</p>');
                    $('.kl_grade_scheme_walkthrough').click(function (e) {
                        e.preventDefault();
                        var defaulthref = $('.settings').attr('href'),
                            newhref = defaulthref + '?task=setGradeScheme';
                        $('.settings').attr({'data-tooltip': 'right', 'title': 'Click here!<br>We will open it in a new tab.', 'target': '_blank', 'href': newhref}).trigger('mouseover').focus();
                        $('.settings').click(function () {
                            $('.settings').attr({'data-tooltip': '', 'title': ''}).trigger('mouseout');
                            $('.kl_grade_scheme_update').attr({'data-tooltip': 'top', 'title': 'When you have set your grade scheme<br>click this button'}).trigger('mouseenter').focus();
                        });
                    });
                }
            });
        }
        //  Grade Scheme Functions
        $('#kl_syllabus_grades_syllabus_sections_buttons').append('<div class="kl_grade_scheme_controls" style="display:none;">' +
            '   <h4>Grade Scheme</h4>' +
            '   <a class="btn btn-mini kl_grade_scheme_update"><i class="icon-refresh"></i> Update Grade Scheme</a>' +
            '   <div class="kl_grade_scheme_alert kl_margin_bottom kl_margin_top"></div>' +
            '</div>');
        // Check if initially checked
        if ($('.kl_syllabus_grade_scheme_section').is(':checked')) {
            $('.kl_grade_scheme_controls').show();
        }
        $('.kl_syllabus_grade_scheme_section').change(function () {
            if ($(this).is(':checked')) {
                $('.kl_grade_scheme_controls').show();
                getGradeScheme();
            } else {
                $('.kl_grade_scheme_controls').hide();
            }
        });
        $('.kl_grade_scheme_update').click(function () {
            getGradeScheme();
        });

        // Course Assignments
        var componentPointsControls = '<div class="kl_grades_component_points_controls kl_margin_bottom" style="display:none;">' +
            '<h4>Course Assignments</h4>' +
            '<div class="btn-group">' +
            '    <a href="#" class="btn btn-mini kl_grades_component_points_from_canvas" data-tooltip="top" title="Copy/Move the assignment section below the syllabus into the grades portion."><i class="icon-instructure"></i> From Canvas</a>' +
            '    <a href="#" class="btn btn-mini kl_grades_component_points_custom_table" data-tooltip="top" title="Create a table for listing Course Assignments"><i class="fa fa-table"></i> Custom Table</a>' +
            '</div>' +
            '<div class="kl_grades_component_points_from_canvas_controls kl_instructions_wrapper" style="display:none;">' +
            '    <p class="kl_instructions">This will store the current assignment list in the syllabus.' +
            '        Users visiting the syllabus will always see the updated version, but users visiting on a mobile device will see the stored version. The stored version will update whenever you edit your syllabus.</p>' +
            '</div>' +
            '</div>';
        $('#kl_syllabus_grades_syllabus_sections_buttons').append(componentPointsControls);
        // Component Point options
        $('.kl_grades_component_points_from_canvas').click(function (e) {
            e.preventDefault();
            $(iframeID).contents().find('#kl_syllabus_canvas_assignment_list').remove();
            $(iframeID).contents().find('.kl_syllabus_course_assignments').append('<div id="kl_syllabus_canvas_assignment_list" />');
            $('#syllabus').clone().appendTo($(iframeID).contents().find('#kl_syllabus_canvas_assignment_list'));
            $(this).addClass('active');

            $('.kl_grades_component_points_custom_table').removeClass('active');
            $('.kl_grades_component_points_from_canvas_controls').show();
        });
        $('.kl_grades_component_points_custom_table').click(function (e) {
            e.preventDefault();
            $(this).addClass('active');
            $(iframeID).contents().find('#kl_syllabus_canvas_assignment_list').remove();
            $('.kl_grades_component_points_from_canvas').removeClass('active');
            $('.kl_grades_component_points_from_canvas_controls').hide();
            $('#tablesDialog').dialog({ position: { my: 'right top', at: 'left top', of: '#ui-accordion-custom-tools-accordion-header-4' }, modal: false, width: 255 });
            $(iframeID).contents().find('.kl_syllabus_course_assignments').append('<div id="kl_grades_custom_component_table"><p>&nbsp;</p></div>');
            tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('#kl_grades_custom_component_table p')[0]);
            $('#kl_tables_dialog').dialog({ position: { my: 'right top', at: 'left top', of: '#kl_tools' }, modal: false, width: 255 });
        });
        // Check if initially checked
        $('.kl_syllabus_course_assignments_section').change(function () {
            if ($(this).is(':checked')) {
                $('.kl_grades_component_points_controls').show();
            } else {
                $('.kl_grades_component_points_controls').hide();
            }
            checkComponent();
        });
        checkComponent();
    }

    ////////// HELP SECTIONS /////////////
    // Create help dialogs for each section
    function sectionHelp() {
        var informationHelp = '<div id="kl_syllabus_information_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Information help">' +
            '    <p>Provide the following in the Information portion of your syllabus:</p>' +
            '    <h4>Course</h4>' +
            '    <p>Provide the course title, the course number, and the current term designation.</p>' +
            '    <h4>Suggested Sections</h4>' +
            '    <h5><strong>Contact Information</strong></h5>' +
            '    <p>Your title and primary contact method. Provide information about your communication preferences' +
            '        --when you will check email, how quickly you will respond, etc. --in the <strong>Course Policies</strong> section.</p>' +
            '    <p>If you are team teaching and/or have a Teaching Assistant, use the buttons in the &ldquo;Additional Contacts&rdquo; portion to add or remove contacts.</p>' +
            '    <h5><strong>Course Description</strong></h5>' +
            '    <p>A description of your course. Here are some suggested formats:</p>' +
            '    <ul>' +
            '        <li>Outcomes-based narrative: link together your Outcomes to tell the &ldquo;story&rdquo; of your course</li>' +
            '        <li>Questions: pose a series of questions that the course will help your student answer</li>' +
            '        <li>Anecdote: give an example from your experience that engages the student and creates a context for learning</li>' +
            '    </ul>' +
            '    <div class="button-container">' +
            '        <a class="btn dialog_closer">Close</a>' +
            '    </div>' +
            '</div>',
            outcomesHelp = '<div id="kl_syllabus_outcomes_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Outcomes help">' +
            '    <p><strong>Outcomes</strong> are statements created to define and/or measure desired student behavior.' +
            '        <strong>Learning Outcomes</strong> use an action verb to describe the measurable results of <strong>Learning Activities</strong>.' +
            '    <h4>Bloom&rsquo;s Revised</h4>' +
            '    <p>The &ldquo;Bloom&rsquo;s Revised&rdquo; tool provides a set of action verbs organized into six levels: remember, understand, apply, analyze, evaluate and create.' +
            '     The tool opens in a moveable dialog box.' +
            '     Clicking on a level opens a group of action verb buttons.' +
            '     You can choose whether clicking a verb creates a new Learning Outcome item or is inserted at the cursor position.</p>' +
            '    <h4>Outcomes</h4>' +
            '    The Learning Outcomes section uses a common &ldquo;stem&rdquo; for all outcomes:' +
            '    Upon completion of this course you will be able to:' +
            '    You may modify this stem by selecting the text in the text editor. You may also delete this stem if you would prefer to use different stems embedded in each learning outcome.' +
            '    <div class="button-container">' +
            '        <a class="btn dialog_closer">Close</a>' +
            '   </div>' +
            '</div>',
            resourcesHelp = '<div id="kl_syllabus_resources_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Resources help">' +
            '    <strong>Resources</strong> are components available to influence and/or measure student behavior.' +
            '        <strong>Learning Resources</strong> are materials provided to achieve <strong>Learning Outcomes</strong> through <strong>Learning Activities</strong>.' +
            '    <h4>Suggested Headings</h4>' +
            '    <p>Provide the following in the Learning Resources section of your syllabus:</p>' +
            '    <h5><strong><em>Canvas</em></strong></h5>' +
            '    <p>The login information for Canvas and information on the best web browser(s) to use.</p>' +
            '    <h5><strong><em>Techinical Support</em></strong></h5>' +
            '    <p>Contact information--website links, telephone numbers, etc.--for technical support services available to students.</p>' +
            '    <h5><strong><em>Required Software</em></strong></h5>' +
            '    <p>A detailed list of all software needed for the course. DO NOT assume that students will have commonly-used software such as Microsoft Word or Microsoft PowerPoint.' +
            '        You may wish to provide information about open-source alternatives such as OpenOffice Writer.</p>' +
            '    <a href="http://www.openoffice.org/" target="_blank">Visit the Open Office website</a>' +
            '    <h5><strong><em>Textbook and/or other Reading Materials</em></strong></h5>' +
            '    <p>Information about textbooks, course packets, journal articles, and other reading materials used in the course. Include details such as textbook ISDN number(s),' +
            '        where to purchase reading materials and access information for password-protected digital assets.</p>' +
            '    <h5><strong><em>Videos</em></strong></h5>' +
            '    <p>Information about videos and/or other multimedia that will be used in the course.' +
            '        Also information about where (LMS, external website, etc.) and how (login information) students will access these resources.' +
            '        Information on software needed to run multimedia (Flash, HTML 5 browser, etc.) is placed in the Required Software section.</p>' +
            '    <div class="button-container">' +
            '        <a class="btn dialog_closer">Close</a>' +
            '   </div>' +
            '</div>',
            activitiesHelp = '<div id="kl_syllabus_activities_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Activities help">' +
            '    <strong>Activities</strong> are opportunities created to influence and/or measure defined student behavior.' +
            '     <strong>Learning Resources</strong> are used in <strong>Learning Activities</strong> to achieve <strong>Learning Outcomes</strong>.' +
            '     There are two types of <strong>Learning Activities</strong>:' +
            '    <ul>' +
            '        <li><strong>Application Activities</strong> are opportunities for students to demonstrate knowledge and skills</li>' +
            '        <li><strong>Acquisition Activities</strong> are opportunities for students to gain knowledge and skills</li>' +
            '    </ul>' +
            '    Common <strong>Learning Activities</strong>:' +
            '    <ul>' +
            '        <li>Readings</li>' +
            '        <li>Videos</li>' +
            '        <li>Labs</li>' +
            '        <li>Discussions</li>' +
            '        <li>Assignments</li>' +
            '        <li>Assessments</li>' +
            '    </ul>' +
            '    Provide <em>general</em> information in the <strong>Learning Activities</strong> section of your syllabus: types, frequency and relationships to other learning activities.' +
            '    Provide <em>specific</em> information on learning activities in Canvas: instructions, examples and due dates/times.' +
            '    <div class="button-container">' +
            '        <a class="btn dialog_closer">Close</a>' +
            '   </div>' +
            '</div>',
            policiesHelp = '<div id="kl_syllabus_policies_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Policies help">' +
            '    <h4>Suggested Headings</h4>' +
            '    <p>Provide the following in the <strong>Course Policies</strong> section of your syllabus:</p>' +
            '    <h5><strong><em>Instructor Feedback/Communication</em></strong></h5>' +
            '    <p>The types of feedback and communication the instructor will provide, and which communication tools will be used. The response time for each type and tool.</p>' +
            '    <h5><strong><em>Student Feedback/Communication</em></strong></h5>' +
            '    <p>The types of feedback and communication the instructor will accept, and which communication tools will be used. The response time for each type and tool.</p>' +
            '    <h5><strong><em>Syllabus Changes</em></strong></h5>' +
            '    <p>The actions you will take if your syllabus must be revised.' +
            '        The actions students should take if there is a discrepancy between your syllabus, and other sources of information, i.e. - the learning management system.</p>' +
            '    <h5><strong><em>Submitting Electronic Files</em></strong></h5>' +
            '    <p>Any information the student may need regarding what types of files are acceptable and how to submit them.</p>' +
            '    <h5><strong><em>Course Fees</em></strong></h5>' +
            '    <p>Include information regarding any additional course fees that are required.</p>' +
            '    <h5><strong><em>Late Work</em></strong></h5>' +
            '    <p>Your expectations regarding late work:</p>' +
            '        <li>Acceptable circumstances</li>' +
            '        <li>Student responsibilties</li>' +
            '        <li>Penalties</li>' +
            '    <div class="button-container">' +
            '        <a class="btn dialog_closer">Close</a>' +
            '   </div>' +
            '</div>',
            grades_Help = '<div id="kl_syllabus_grades_dialog" data-turn-into-dialog=\'{"width":800,"modal":true}\' style="display:none" title="Information help">' +
            '   <h4>Course Assignments</h4>' +
            '   <p>There are two primary options for adding your course assignments to the syllabus:' +
            '   <ol>' +
            '       <li><strong>Pull from Canvas:</strong> You can move the assignment details from the bottom of this page up into the syllabus body.' +
            '           This will store the current assignment details in the syllabus for those using the mobile app or pulling the syllabus through the API.' +
            '           For those visiting the syllabus page, this will move the current assignment list up into the syllabus.</li>' +
            '       <li><strong>Custom Table:</strong> You can use the custom tools dialog to create your own list.</li>' +
            '   </ol>' +
            '   <h4>Grade Scheme</h4>' +
            '   <p>The grade scheme option will pull your current Canvas course grade scheme if it is set.' +
            '       If it is not set, it will walk you through the process of setting your Canvas grade scheme.' +
            '   <div class="button-container">' +
            '       <a class="btn dialog_closer">Close</a>' +
            '   </div>' +
            '</div>',
            helpSectionText = {
                'kl_syllabus_information': informationHelp,
                'kl_syllabus_outcomes': outcomesHelp,
                'kl_syllabus_resources': resourcesHelp,
                'kl_syllabus_activities': activitiesHelp,
                'kl_syllabus_policies': policiesHelp,
                'kl_syllabus_grades': grades_Help
            };
        $.each(helpSectionText, function (key, value) {
            $('#' + key + '_syllabus_sections_buttons').after(value);
        });
    }
    function additionalSubSectionSetup() {
        additionalInformationControls();
        additionalOutcomesControls();
        additionalGradesControls();
        sectionHelp();
    }
    function syllabusTools() {
        syllabusReady();
        addSyllabusSubsections();
        removeSubsection();
        setTimeout(function () {
            additionalSubSectionSetup();
            bloomsTaxonomy('outcomes');
            bindHover();
            // tablesReady(mceInstance);
        }, 300);
    }

/////////////////////////////////////////////////////////////
//  CLEANUP FUNCTIONS                                        //
//  Cleanup content created with previous versons          //
///////////////////////////////////////////////////////////// 

    // Update existing code to new formats
    function elementUpdate(checkElement, replaceElement) {
        if ($(iframeID).contents().find(checkElement).length > 0) {
            var originalTag = checkElement.replace('#', '').replace('.', ''),
                replaceTag = replaceElement.replace('#', '').replace('.', '');
            // If both elements are ID's
            if (checkElement.indexOf('#') > -1 && replaceElement.indexOf('#') > -1) {
                $(iframeID).contents().find(checkElement).attr('id', replaceTag);
            }
            // If both elements are Classes
            if (checkElement.indexOf('.') > -1 && replaceElement.indexOf('.') > -1) {
                $(iframeID).contents().find(checkElement).addClass(replaceTag).removeClass(originalTag);
            }
            // If original is an ID and new is a class
            if (checkElement.indexOf('#') > -1 && replaceElement.indexOf('.') > -1) {
                $(iframeID).contents().find(checkElement).addClass(replaceTag).attr('id', '');
            }
            // If original is a class and new is an ID 
            if (checkElement.indexOf('.') > -1 && replaceElement.indexOf('#') > -1) {
                $(iframeID).contents().find(checkElement).removeClass(originalTag).attr('id', replaceTag);
            }
        }
    }
    function clearAttribute(attributeToRemove) {
        var originalTag = attributeToRemove.replace('#', '').replace('.', '');
        if ($(iframeID).contents().find(attributeToRemove).length > 0) {
            if (attributeToRemove.indexOf('#') > -1) {
                $(iframeID).contents().find(attributeToRemove).removeAttr('id');
            }
            // If both elements are Classes
            if (attributeToRemove.indexOf('.') > -1) {
                $(iframeID).contents().find(attributeToRemove).removeClass(originalTag);
            }
        }
    }
    function updateCustomCss() {
        // // old custom css flag
        if ($(iframeID).contents().find('#usu-custom-css').length > 0 || $(iframeID).contents().find('#custom-css').length > 0) {
            alert('This course is using a course level css file. You may need to adjust your custom css because of this update.');
        }
        if ($(iframeID).contents().find('#usu-custom-css').length > 0) {
            if ($(iframeID).contents().find('#usu-custom-css').text().length > 1) {
                // if it has contents unwrap them
                $(iframeID).contents().find('#usu-custom-css').contents().unwrap();
                $(iframeID).contents().find('body').prepend('<div id="custom-css">&nbsp;</div>');

            }
            // If the step above didn't fix it, remove old and add new
            $(iframeID).contents().find('#usu-custom-css').remove();
            if ($(iframeID).contents().find('#usu-custom-css').length === 0) {
                $(iframeID).contents().find('body').prepend('<div id="custom-css">&nbsp;</div>');
            }
            $('#kl_custom_css_add').prop('checked', true);
        }
        elementUpdate('#custom-css', '#kl_custom_css');
    }
    function updateWrapper() {
        var i,
            oldThemesArray = [
                '.generic',
                '.bookmark',
                '.apple',
                '.box-left-aggie-blue',
                '.box-left-copper',
                '.box-left-silver',
                '.square-right-aggie-blue',
                '.square-right-copper',
                '.square-right-silver',
                '.rounded-inset-aggie-blue',
                '.rounded-inset-copper',
                '.rounded-inset-silver',
                '.circle-left-aggie-blue',
                '.circle-left-copper',
                '.circle-left-silver',
                '.horiz-nav-template',
                '.panel-nav-template'
            ],
            numThemes = oldThemesArray.length;
        for (i = 0; i < numThemes; i++) {
            if ($(iframeID).contents().find(oldThemesArray[i]).length > 0) {
                $(iframeID).contents().find(oldThemesArray[i]).attr('id', 'kl_wrapper');
            }
        }
        // Front Page
        elementUpdate('#usu-template-front', '#kl_wrapper');
        elementUpdate('#usu-template-banner', '#kl_banner');
        clearAttribute('.title_banner');
        elementUpdate('.subj-text', '.kl_mod_text');
        elementUpdate('.subj-num', '.kl_mod_num');
        elementUpdate('#banner-right', '#kl_banner_right');
        elementUpdate('#usu-home-img', '#kl_banner_image');
        clearAttribute('.banner_image');
        elementUpdate('#usu-home-nav', '#kl_navigation');
        clearAttribute('.navigation');
        elementUpdate('#usu-modules-grid', '#kl_modules');
        elementUpdate('.quick_links', '.kl_modules_quick_links');
        clearAttribute('.modules_grid');
        elementUpdate('.connectedModule', '.kl_connected_module');
        elementUpdate('.activeStart', '.kl_modules_active_start');
        elementUpdate('.activeStop', '.kl_modules_active_stop');
        elementUpdate('.contact_footer', '#kl_contact_footer');
        clearAttribute('.usu-home-footer');
        elementUpdate('.social_media', '#kl_social_media');
        clearAttribute('.usu-social');
        elementUpdate('.image_attribution', '#kl_image_attribution');
        elementUpdate('.usu-home-attrib', '#kl_image_attribution');

        // Update Wrapper
        elementUpdate('#template-wrapper', '#kl_wrapper');
        elementUpdate('#usu-template-page', '#kl_wrapper');
        // Remove content wrapper from wiki pages
        if ($(iframeID).contents().find('#template-content').length > 0) {
            $(iframeID).contents().find('#template-content').contents().unwrap();
        }
        // Theme Classes 
        elementUpdate('.generic', '.kl_generic');
        elementUpdate('.bookmark', '.kl_bookmark');
        elementUpdate('.apple', '.kl_apple');
        elementUpdate('.box-left-aggie-blue', '.kl_box_left');
        elementUpdate('.box-left-copper', '.kl_box_left_2');
        elementUpdate('.box-left-silver', '.kl_box_left_3');
        elementUpdate('.square-right-aggie-blue', '.kl_square_right');
        elementUpdate('.square-right-copper', '.kl_square_right_2');
        elementUpdate('.square-right-silver', '.kl_square_right_3');
        elementUpdate('.rounded-inset-aggie-blue', '.kl_rounded_inset');
        elementUpdate('.rounded-inset-copper', '.kl_rounded_inset_2');
        elementUpdate('.rounded-inset-silver', '.kl_rounded_inset_3');
        elementUpdate('.circle-left-aggie-blue', '.kl_circle_left');
        elementUpdate('.circle-left-copper', '.kl_circle_left_2');
        elementUpdate('.circle-left-silver', '.kl_circle_left_3');
        elementUpdate('.horiz-nav-template', '.kl_fp_horizontal_nav');
        elementUpdate('.panel-nav-template', '.kl_fp_panel_nav');
        elementUpdate('.panel-nav-template', '.kl_fp_panel_nav');
        elementUpdate('.emta', '.kl_emta');
        clearAttribute('.usu-template-flex');
        // Banner
        elementUpdate('#module-page-banner', '#kl_banner');
        elementUpdate('#module-page-banner', '#kl_banner');
        elementUpdate('#banner-left', '#kl_banner_left');
        elementUpdate('#page-left', '#kl_banner_left');
        elementUpdate('.mod-text', '.kl_mod_text');
        elementUpdate('.mod-num', '.kl_mod_num');
        elementUpdate('.emta-badge', '.kl_mod_num');
        if ($(iframeID).contents().find('#usu-template-banner-middle').length > 0) {
            $(iframeID).contents().find('#usu-template-banner-middle').remove();
        }
        elementUpdate('.banner-right', '#kl_banner_right');
        elementUpdate('#page-right', '#kl_banner_right');
        elementUpdate('#banner-bottom', '#kl_banner_bottom');
        elementUpdate('#emta-title', '#kl_banner_bottom');
        elementUpdate('#description', '#kl_description');
        // Template Sections
        elementUpdate('.introduction', '#kl_introduction');
        elementUpdate('.objectives', '#kl_objectives');
        elementUpdate('.readings', '#kl_readings');
        elementUpdate('.lectures', '#kl_lectures');
        elementUpdate('.activities', '#kl_activities');
        elementUpdate('.assignments', '#kl_assignments');
        // Modal
        elementUpdate('.customModalToggler', '.kl_modal_toggler');
        elementUpdate('#customModal', '#kl_modal');
        elementUpdate('.custom-modal', '.kl_modal');
        elementUpdate('.modalTitle', '.kl_modal_title');
        // Tooltip
        elementUpdate('.tooltipTrigger', '.kl_tooltip_trigger');
        elementUpdate('.tooltipText', '.kl_tooltip_text');
        $(iframeID).contents().find('.kl_tooltip_text').each(function (index) {
            var tipNum = index + 1;
            elementUpdate('#tooltip' + tipNum, '#kl_tooltip_' + tipNum);
            elementUpdate('.tooltip' + tipNum, '.kl_tooltip_' + tipNum);
        });
        // Popover
        elementUpdate('.popoverTrigger', '.kl_popover_trigger');
        elementUpdate('.popoverContent', '.kl_popover_content');
        $(iframeID).contents().find('.kl_popover_content').each(function (index) {
            var tipNum = index + 1;
            elementUpdate('#Popover' + tipNum, '#kl_popover_' + tipNum);
            elementUpdate('.Popover' + tipNum, '.kl_popover_' + tipNum);
        });
        // Syllabus Sections
        // <div id="template-content" class="syllabus-content" style="margin: 0;">

        // INFORMATION
        elementUpdate('.information', '#kl_syllabus_information');
        elementUpdate('.instructures', '.kl_syllabus_instructors');
        elementUpdate('.additionalInstructior', '.kl_syllabus_additional_instructor');
        elementUpdate('.teachingAssistants', '.kl_syllabus_teaching_assistant');
        elementUpdate('.additionalTA', '.kl_syllabus_additional_teaching_assistant');
        elementUpdate('.course_description', '.kl_syllabus_course_description');
        // OUTCOMES
        elementUpdate('.outcomes', '#kl_syllabus_outcomes');
        elementUpdate('.learning_outcomes', '.kl_syllabus_learning_outcomes');
        clearAttribute('#outcomeList');
        // RESOURCES
        elementUpdate('.resources', '#kl_syllabus_resources');
        elementUpdate('.canvas', '.kl_syllabus_canvas_info');
        elementUpdate('.software', '.kl_syllabus_software');
        elementUpdate('.textbook-readings', '.kl_syllabus_textbook_readings');
        elementUpdate('.videos', '.kl_syllabus_videos');
        // ACTIVITIES
        elementUpdate('.activities', '#kl_syllabus_activities');
        elementUpdate('.readings_', '.kl_syllabus_activities_readings');
        elementUpdate('.videos', '.kl_syllabus_activities_videos');
        elementUpdate('.labs', '.kl_syllabus_labs');
        elementUpdate('.discussions', '.kl_syllabus_discussions');
        elementUpdate('.assignments_', '.kl_syllabus_assignments');
        elementUpdate('.quizzes', '.kl_syllabus_quizzes');
        elementUpdate('.exams', '.kl_syllabus_exams');
        // POLICIES
        elementUpdate('.policies', '#kl_syllabus_policies');
        elementUpdate('.instructor_feedback', '.kl_syllabus_instructor_feedback');
        elementUpdate('.student_feedback', '.kl_syllabus_student_feedback');
        elementUpdate('.syllabus_changes', '.kl_syllabus_syllabus_changes');
        elementUpdate('.submitting_files', '.kl_syllabus_submitting_files');
        elementUpdate('.course_fees', '.kl_syllabus_course_fees');
        elementUpdate('.late_work', '.kl_syllabus_late_work');
        // GRADES
        elementUpdate('.grades_', '#kl_syllabus_grades');
        elementUpdate('.course_assignments', '.kl_syllabus_course_assignments');
        elementUpdate('.grade_scheme', '.kl_syllabus_grade_scheme');
        elementUpdate('#canvas_grade_scheme', '#kl_syllabus_canvas_grade_scheme');
        // UNIVERSITY POLICIES
        elementUpdate('.universityPolicies', '#kl_university_policies');
    }
    function updateProgressBar() {
        var labelValue = '',
            labelHeight = '',
            barWidth = '',
            newProgressBar = '',
            labelOutside = false;
        if ($(iframeID).contents().find('.custom-progressbar').length > 0) {
            barWidth = Math.round(100 * parseFloat($(iframeID).contents().find('.ui-progressbar-value').css('width')) / parseFloat($(iframeID).contents().find('.ui-progressbar-value').parent().css('width')));
            if ($(iframeID).contents().find('.pbHeightMicro').length > 0) {
                labelHeight = '5px';
                labelOutside = true;
            } else if ($(iframeID).contents().find('.pbHeightSmall').length > 0) {
                labelHeight = '10px';
                labelOutside = true;
            } else if ($(iframeID).contents().find('.pbHeightMed').length > 0) {
                labelHeight = '15px';
                labelOutside = true;
            } else {
                labelHeight = '20px';
            }
            if ($(iframeID).contents().find('.pblabel').length > 0) {
                labelValue = $(iframeID).contents().find('.pblabel').html();
            }
            if (labelOutside === true) {
                newProgressBar = '<div id="kl_progress_bar">' +
                    '    <div class="kl_progress_bar_wrapper" style="width: 99%; overflow: hidden; background: #f2f2f2; border: #D1D1D1 1px solid;">' +
                    '        <div class="kl_progress_bar_value kl_progress_bar_0_value" style="width: ' + barWidth + '%; background: #003366; text-align: right; height: ' + labelHeight + '; float: left;">' +
                    '            <div class="kl_progress_bar_label kl_progress_bar_0_label" style="color: #fff;">&nbsp;</div>' +
                    '        </div>' +
                    '    </div>' +
                    '    <div class="kl_progress_bar_wrapper_outside_labels" style="width: 99%; overflow: hidden;">' +
                    '        <div class="kl_progress_bar_value kl_progress_bar_0_value" style="width: ' + barWidth + '%; text-align: right; height: 20px; float: left; background-position: initial initial; background-repeat: initial initial;">' +
                    '            <div class="kl_progress_bar_label kl_progress_bar_0_label" style="color: #000000;">' + labelValue + '</div>' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';
                $(iframeID).contents().find('.custom-progressbar').replaceWith(newProgressBar);
            } else {
                newProgressBar = '<div id="kl_progress_bar">' +
                    '    <div class="kl_progress_bar_wrapper" style="width: 99%; overflow: hidden; background: #f2f2f2; border: #D1D1D1 1px solid;">' +
                    '        <div class="kl_progress_bar_value kl_progress_bar_0_value" style="width: ' + barWidth + '%; background-color: #003366; text-align: right; height: ' + labelHeight + '; float: left;">' +
                    '        <div class="kl_progress_bar_label kl_progress_bar_0_label" style="color: #fff;">' + labelValue + '</div>' +
                    '    </div>' +
                    '</div>';
                $(iframeID).contents().find('.custom-progressbar').replaceWith(newProgressBar);
            }
        }
    }
    function updateAccordion() {
        if ($(iframeID).contents().find('.custom-accordion h3').length > 0) {
            $(iframeID).contents().find('.custom-accordion h3').each(function () {
                var accordionTitle = $(this).html();
                $(this).replaceWith('<h4>' + accordionTitle + '</h4>');
            });
        }
        if ($(iframeID).contents().find('.custom-accordion-wrapper').length > 0) {
            $(iframeID).contents().find('.custom-accordion-wrapper').attr('id', 'Custom_Accordion');
            $(iframeID).contents().find('.custom-accordion h4 a').contents().unwrap();
            elementUpdate('.custom-accordion-wrapper', '.kl_custom_accordion_wrapper');
        }
        if ($(iframeID).contents().find('.custom-accordion').length > 0) {
            $(iframeID).contents().find('.custom-accordion h4 a').contents().unwrap();
            $(iframeID).contents().find('.custom-accordion').attr('id', 'Custom_Accordion');
        }
        elementUpdate('.custom-accordion', '.kl_custom_accordion', '');
    }
    function updateTabs() {
        if ($(iframeID).contents().find('.custom-tabs').length > 0) {
            $(iframeID).contents().find('.custom-tabs').attr('id', 'Custom_Tabs');
            $(iframeID).contents().find('.tab-list li').each(function (index) {
                var connectedSection = $(this).attr('class'),
                    tabTitle = $(this).text();
                $(iframeID).contents().find('#' + connectedSection).before('<h4 class="kl_panel_' + index + '">' + tabTitle + '</h4>');
                $(iframeID).contents().find('#' + connectedSection).attr('class', 'kl_tab_content kl_panel_' + index).removeAttr('id');
            });
            elementUpdate('.custom-tabs', '.kl_tabbed_section');
            $(iframeID).contents().find('.tab-list').remove();
        }
    }

    function updateQuickCheck() {
        var i, numAnswers;
        elementUpdate('#quickCheckOne', '#kl_quick_check_one');
        elementUpdate('.quickCheckOneContent', '.kl_quick_check_one_content', '');
        elementUpdate('#quickCheckTwo', '#kl_quick_check_two');
        elementUpdate('.quickCheckTwoContent', '.kl_quick_check_two_content', '');
        elementUpdate('.quickCheck', '.kl_quick_check', '');
        elementUpdate('.quickCheckOneContent', '', '');
        elementUpdate('.answers', '', '');
        if ($(iframeID).contents().find('.answerWrapper').length > 0) {
            numAnswers = $(iframeID).contents().find('.answerWrapper').length;
            for (i = 0; i < numAnswers; i++) {
                elementUpdate('.answer-' + i, '.kl_quick_check_answer_' + i, '');
            }
        }
        elementUpdate('.answerWrapper', '.kl_quick_check_answer_wrapper', '');
        elementUpdate('.answers', '.kl_quick_check_answers', '');
        elementUpdate('.answer', '.kl_quick_check_answer', '');
        elementUpdate('.response', '.kl_quick_check_response', '');
        elementUpdate('.correctAnswer', '.kl_quick_check_correct_answer', '');

    }
    function identifyImportedContent() {
         // Identify theme
        currentPagesThemeCheck();
        // Clear sections area and identify new sections
        $('.kl_sections_list').empty();
        $('.kl_template_sections_list input').each(function () {
            $(this).prop('checked', false);
        });
        identifySections();
        // Clear accordion/tabs panels and identify new
        $('#kl_accordion_panels').empty();
        getAccPanels();
        $('#kl_tab_panels').empty();
        getTabPanels();
        // Update Navigation
        updateNavItems();
        // Remove and check progress bar
        $('input[value=kl_progress_bar]').parents('li').remove();
        $('.kl_progress_bar_addition_section').remove();
        $('.kl_progress_bar_add').show();
        $('#kl_progress_bar_controls').hide();
        identifyProgressBar();
        // Check quick checks
        identifyQuickChecks();
        if ($(iframeID).contents().find('#kl_social_media').length > 0) {
            socialMediaReady();
        }
        identifyModuleList();
    }
    function updateContentCheck() {
        if ($(iframeID).contents().find('#usu-template-banner').length > 0 || $(iframeID).contents().find('#template-wrapper').length > 0 ||  $(iframeID).contents().find('#usu-template-front').length > 0) {
            var updateHtml = '<div class="kl_update_tools_wrapper"><a href="#" style="width: 216px;" class="btn btn-danger kl_update_tools kl_margin_bottom" data-tooltip="top" ' +
                'title="Update code created with previous versions of these tools"><i class="fa fa-wrench"></i> Update Code</a>' +
                '<div class="kl_instructions">This content was created using an older version of these tools. You will need to update the code before using the current version.</div>';
            if ($('.kl_update_tools').length === 0) {
                $('#kl_tools').prepend(updateHtml);
                $('.kl_update_tools').click(function (e) {
                    e.preventDefault();
                    updateWrapper();
                    updateCustomCss();
                    updateProgressBar();
                    updateAccordion();
                    updateQuickCheck();
                    updateTabs();
                    if ($('.kl_update_success').length === 0) {
                        $('#kl_tools').prepend('<div class="kl_success kl_update_success" style="display:none;"><i class="fa fa-spinner fa-spin"></i> Updating Code</div>');
                    }
                    $('.kl_update_success').slideDown();
                    $('.kl_update_tools').slideUp();
                    $('.kl_update_tools_wrapper .kl_instructions').hide();
                    $('#kl_tools_accordion').show();
                    $('.kl_view_options').show();
                    $('#kl_tools .btn-mini').show();
                    setTimeout(function () {
                        // setupMainTools();
                        $('.kl_update_tools_wrapper').hide();
                        $('.kl_update_success').slideUp();
                        updateContentCheck();
                        identifyImportedContent();
                    }, 2000);
                });
            } else {
                $('.kl_update_success').hide();
                $('.kl_update_tools').show();
                $('.kl_update_tools_wrapper').show();
                $('.kl_update_tools_wrapper .kl_instructions').show();
            }
            $('#kl_tools .btn-mini').hide();
            $('#kl_tools_accordion').hide();
            $('.kl_view_options').hide();
        }
    }



/////////////////////////////////////////////////////////////
//  API FUNCTIONS                                          //
///////////////////////////////////////////////////////////// 

    function importPageContentThisCourse() {
        $('#kl_existing_pages').html($('#pages_tab_panel .wiki_pages').clone());
        $('#kl_existing_pages .wiki_pages').removeClass('wiki_pages page_list').addClass('kl_existing_page_links');
        $('.kl_existing_page_links li').each(function () {
            $(this).attr({'data-tooltip': 'left', 'title': 'Pull content from this page'}).addClass('fa fa-files-o');
        });
        $('.kl_existing_page_links a').click(function (e) {
            e.preventDefault();
            var linkHref, contentUrl;
            // Clear quick check
            $('.kl_quick_check_remove').trigger('click');
            // Gather ne data
            $(this).parents('li').addClass('kl_loading').prepend('<i class="fa fa-spinner fa-spin"></i>');
            linkHref = $(this).attr('href').split('/pages/');
            contentUrl = linkHref[1];
            $.post(klToolsVariables.klApiToolsPath + 'getPage.php', { courseID: coursenum, pageUrl: contentUrl })
                .done(function (data) {
                    $(iframeID).contents().find('body').html(data);
                    $('.kl_loading i').remove();
                    $('.kl_loading').removeClass('kl_loading');
                    sectionsPanelDefault = true;
                    updateContentCheck();
                });
        });
    }
    function checkPageTemplates() {
        $('#kl_course_template_pages').html('<i class="fa fa-spinner fa-spin"></i> Checking for template pages');
        $.post(klToolsVariables.klApiToolsPath + 'checkTemplates.php', { courseID: coursenum })
            .done(function (data) {
                $('#kl_course_template_pages').html(data);
                $('.kl_import_primary_template').click(function (e) {
                    e.preventDefault();
                    $('.kl_import_primary_template i').attr('class', 'fa fa-spinner fa-spin');
                    $.post(klToolsVariables.klApiToolsPath + 'getPage.php', { courseID: coursenum, pageUrl: 'primary-template' })
                        .done(function (data) {
                            $(iframeID).contents().find('body').html(data);
                            $('.kl_import_primary_template i').attr('class', 'fa fa-clipboard');
                            sectionsPanelDefault = true;
                            updateContentCheck();
                        });
                });
                $('.kl_import_secondary_template').click(function (e) {
                    e.preventDefault();
                    $('.kl_import_secondary_template i').attr('class', 'fa fa-spinner fa-spin');
                    $.post(klToolsVariables.klApiToolsPath + 'getPage.php', { courseID: coursenum, pageUrl: 'secondary-template' })
                        .done(function (data) {
                            $(iframeID).contents().find('body').html(data);
                            $('.kl_import_secondary_template i').attr('class', 'fa fa-clipboard');
                            sectionsPanelDefault = true;
                            updateContentCheck();
                        });
                });
            });
    }
    function importPageContentUrl() {
        var pastedUrl, sourceCourseNum, pageTitleUrl;
        // Clear quick check
        $('.kl_quick_check_remove').trigger('click');
        // Gather ne data
        $('#kl_get_existing i').attr('class', 'fa fa-spinner fa-spin');
        pastedUrl = $('#kl_page_url').val();
        sourceCourseNum = pastedUrl.split('/courses/');
        sourceCourseNum = sourceCourseNum[1].split('/');
        sourceCourseNum = sourceCourseNum[0];
        if (pastedUrl.indexOf('/wiki/') > -1) {
            pageTitleUrl = pastedUrl.split('/wiki/');
        } else if (pastedUrl.indexOf('/pages/') > -1) {
            pageTitleUrl = pastedUrl.split('/pages/');
        }
        if (pageTitleUrl[1].indexOf('/') > -1) {
            pageTitleUrl = pageTitleUrl[1].split('/');
            pageTitleUrl = pageTitleUrl[0];
        } else {
            pageTitleUrl = pageTitleUrl[1];
        }
        $.post(klToolsVariables.klApiToolsPath + 'getPage.php', { courseID: sourceCourseNum, pageUrl: pageTitleUrl })
            .done(function (data) {
                var re = new RegExp(sourceCourseNum, 'g');
                data = data.replace(re, coursenum);
                $(iframeID).contents().find('body').html(data);
                $('#kl_get_existing i').attr('class', 'fa fa-files-o');
                sectionsPanelDefault = true;
                // setupMainTools();
            });
    }
    function bindAPIImportsTriggers() {
        // Pasted url
        $('#kl_page_url').keydown(function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                importPageContentUrl();
                return false;
            }
        });
        $('#kl_get_existing').click(function (e) {
            e.preventDefault();
            importPageContentUrl();
        });
    }

/////////////////////////////////////////////////////////////
//  SETUP FUNCTIONS                                        //
//  Prepare the area for tools to be created               //
///////////////////////////////////////////////////////////// 

    // Custom Tools side panel setup
    function createToolsWrapper() {
        var visualBlocksButtons = '<div class="btn-group-label kl_margin_bottom kl_view_options">' +
            '   <span>Editor View: </span>' +
            '   <div class="btn-group kl_mce_editor_view">' +
            '       <a href="#" class="btn btn-mini kl_mce_labels_view" rel="kl_mce_visual_blocks">Labels</a>' +
            '       <a href="#" class="btn btn-mini kl_mce_section_view active" rel="kl_mce_visual_sections">Sections</a>' +
            '   </div>' +
            '   <a href="#" class="btn btn-mini kl_mce_preview" rel="">Preview</a>' +
            '</div>',
            addStyleButton = ' <a href="#" class="btn btn-mini kl_add_style_to_iframe" data-tooltip="bottom" title="Click this if the css styles are not showing up in the editor">' +
            '<i class="fa fa-magic"></i> Add Style to Editor</a>',
            removeEmptyButton = '<a class="btn btn-mini kl_remove_empty" href="#" data-tooltip="left" title="This button will clean up the page contents by removing any empty elements.' +
            '<p>This is especially useful when using the <i class=\'icon-collection-save\'></i> feature.</p>"><i class="icon-trash"></i> Clear Empty Elements</a>',
            tabNavigation = '<ul>' +
            '   <li><a href="#canvas_tools" class="kl_tools_tab">Canvas Tools</a></li>' +
            '   <li><a href="#kl_tools" id="toolsTrigger" class="kl_tools_tab">Custom Tools</a></li>' +
            '</ul>',
            customAccordionDiv = '<div id="kl_tools_accordion" class="kl_margin_bottom" />';

            // Create tabs for Canvas Tools and USU Tools
        if ($('#kl_tools_wrapper').length === 0) {
            // Wrap existing Canvas Page Tools
            if ($('#editor_tabs').length > 0) {
                $('#editor_tabs').wrap('<div id="kl_tools_wrapper" class="tabs" />').wrap('<div id="canvas_tools" />');
            }

            $('#kl_tools_wrapper').append('<div id="kl_tools" />').prepend(tabNavigation);
            $('#kl_tools_wrapper').tabs({active: 1});
        }
        $('#kl_tools').html(visualBlocksButtons + customAccordionDiv + addStyleButton + removeEmptyButton);
        $('#toolsTrigger').click(function (e) {
            e.preventDefault();
            $('a:contains("HTML Editor")').get(0).scrollIntoView();
        });
        bindHover();
    }
    // Create an accordion in right panel after tools are added
    function initializeToolsAccordion() {
        var icons, numSections, activeSection;
        icons = {
            header: 'ui-icon-triangle-1-e',
            activeHeader: 'ui-icon-triangle-1-s'
        };
        numSections = $('#kl_tools_accordion h3').length;
        if (sectionsPanelDefault === true) {
            activeSection = 1;
        } else {
            activeSection = numSections - 1;
        }
        $('#kl_tools_accordion').accordion({
            heightStyle: 'content',
            icons: icons,
            active: activeSection //which panel is open by default
        });
        $('#toggle').button().click(function () {
            if ($('#accordion').accordion('option', 'icons')) {
                $('#accordion').accordion('option', 'icons', null);
            } else {
                $('#accordion').accordion('option', 'icons', icons);
            }
        });
        $('.kl_buttons_activate').click(function (e) {
            e.preventDefault();
            $('#kl_tools_accordion').accordion({ active: 5});
        });
        $('.kl_sections_activate').click(function () {
            $('#kl_tools_accordion').accordion({ active: 1});
        });
    }
    function delayedLoad() {
        // Some aspects need to make sure the mceEditor has time to load
        setTimeout(function () {
            if ($(iframeID).length > 0) {
                addStyletoIframe();
                $('a:contains("HTML Editor")').get(0).scrollIntoView();
                customCSSCheck();
                displayTypes();
                setDisplay();
            }
        }, 300);
    }
    // Setup Pages Tools
    function setupMainTools() {
        // Add the tools section in the right panel if it doesn't exist
        // if ($('#kl_tools_accordion').length === 0) {
        createToolsWrapper();

        // Add tools for kl_tools_accordion
        themeTool();
        sectionsTool(klToolsArrays.klPagesSections);
        // Typical front page
        navItems();
        moduleListTool();
        socialMediaTool();
        // Other tools
        accessibilityTools();
        accordionTabsTool();
        advancedListsTool();
        bordersAndSpacingTool();
        customButtons();
        customHighlights();
        popupContent();
        progressBar();
        quickCheck();
        customTablesSection();
        bloomsTaxonomy('objectives');
        contentIcons();
        aboutCustomTools();
        showPageTitle();
        if (assignmentsPage === true) {
            // Load tools unique to assignments page
            console.log('assignments page');
        }
        // activate the accordion

        initializeToolsAccordion();
        delayedLoad();
        // Load JavaScript file that will clean up old format
        updateContentCheck();
        removeEmpty();
        bindHover();
        $('.kl_add_tools').remove();

        checkPageTemplates();
        importPageContentThisCourse();
        setTimeout(function () {
            bindAPIImportsTriggers();
        }, 300);
    }
    // Setup Syllabus Tools
    function setupSyllabusTools() {
        // Add the tools section in the right panel if it doesn't exist
        createToolsWrapper();
        // Add tools for kl_tools_accordion
        syllabusTools();
        sectionsTool(klToolsArrays.klSyllabusPrimarySections);
        customTablesButton();
        aboutCustomTools();
        // activate the accordion
        initializeToolsAccordion();
        // Load JavaScript file that will clean up old format
        delayedLoad();
        updateContentCheck();
        removeEmpty();
        bindHover();
        $('.kl_add_tools').remove();
    }
    // Check for TinyMCE editor and Load Tools
    function editorExistenceCheck(toolsToLoad) {
        var editorExists = false;
        if ($(iframeID).contents().find('#tinymce').length > 0) {
            editorExists = true;
        }
        if (editorExists === true) {
            setTimeout(function () {
                if (toolsToLoad === 'wiki') {
                    setupMainTools();
                } else if (toolsToLoad === 'syllabus') {
                    setupSyllabusTools();
                }
            }, 300);
            return;
        }
        setTimeout(function () {
            editorExistenceCheck(toolsToLoad);
        }, 300);
    }

///////////////////////////////////////
//    PAGE LOAD FUNCTIONS            //
///////////////////////////////////////
    $(document).ready(function () {
        if ($('#editor_tabs').length > 0) {
            // Add button to trigger tools
            if ($('#kl_tools_accordion').length === 0) {
                $('#right-side').prepend('<a href="#" class="btn btn-primary kl_add_tools"><i class="fa fa-rocket" style="font-size: 18px;"></i> Launch Custom Tools</a>');
                // Decide which tools to load
                // Default
                iframeID = '#editor_box_unique_id_1_ifr';
                toolsToLoad = 'wiki';
                if ($('#assignment_description_ifr').length > 0) {
                    // Assignments
                    iframeID = '#assignment_description_ifr';
                    assignmentsPage = true;
                } else if ($('.edit_syllabus_link').length > 0) {
                    // Syllabus
                    iframeID = '#course_syllabus_body_ifr';
                    toolsToLoad = 'syllabus';
                    $('.kl_add_tools').hide();
                    $('.edit_syllabus_link').click(function () {
                        $('.kl_add_tools').fadeIn();
                        if ($('#kl_tools_wrapper').length > 0) {
                            $('#kl_tools_wrapper').show();
                            setupSyllabusTools();
                        }
                        // Remove old syllabus tools
                        if ($('.addUSUTools').length > 0) {
                            $('.addUSUTools').remove();
                        }
                    });
                }
                $('.kl_add_tools').click(function (e) {
                    e.preventDefault();
                    editorExistenceCheck(toolsToLoad);
                });
            }
        }
        $('.kl_add_style_to_iframe').click(function (e) {
            e.preventDefault();
            addStyletoIframe();
            $('a:contains("HTML Editor")').get(0).scrollIntoView();
        });
        // Make some changes before page is saved
        $('.submit').click(function () {
            // e.preventDefault();
            // Handle when a box was unchecked but the remove button wasn't clicked
            $(iframeID).contents().find('.kl_to_remove').removeClass('kl_to_remove');
            // If the current theme doesn't support bottom-banner, remove it
            var templateClass = $(iframeID).contents().find('#kl_wrapper').attr('class');
            if ($.inArray(templateClass, klToolsVariables.klBottomBannerPagesThemeArray) === -1) {
                $(iframeID).contents().find('#kl_banner_bottom').attr('data-mce-style", "').remove();
            }
        });

        // If it is the start here page, add button to insert start here content
        if ($('#title').val() === 'Start Here') {
            $('#title').after('&nbsp; &nbsp;<a href="#" class="btn btn-primary kl_import_start_here"><i class="fa fa-cloud-download"></i> Import &ldquo;Start Here&rdquo; Boilerplate</a>');
            $('.kl_import_start_here').click(function (e) {
                e.preventDefault();
                $(iframeID).contents().find('body').html(klToolsVariables.startHereContent);
                $('.kl_add_tools').trigger('click');
                $(this).remove();
            });
        }
    });
}());