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

////////////////////////////////////////////////////
// KENNETHWARE CONFIG                             //
////////////////////////////////////////////////////


// Development version will be loaded in the following courses
var iframeID,
    // Path to where the canvasCustomTools folder is located
    klToolsPath = 'https://elearn.usu.edu/canvasCustomTools/templateTools/production/',
    // Path to the tools_variables file
    // klToolsVariablesFile = klToolsPath + 'js/tools_variables.js',
    klToolsVariablesFile = 'https://elearn.usu.edu/canvasCustomTools/templateTools/custom/learn/tools_variables.js',
    // Path to additional_customization file
    // klToolsAdditionalCustomizationFile = klToolsPath + 'js/additional_customization.js',
    klToolsAdditionalCustomizationFile = 'https://elearn.usu.edu/canvasCustomTools/templateTools/custom/learn/additional_customization.js',
    // To utilize the features that pull from the Canvas api you will need the hosted php files put their path here
    klApiToolsPath = klToolsPath + 'api/',
    // klApiToolsPath = 'https://elearn.usu.edu/canvasCustomTools/templateTools/custom/learn/api/',
    // Path to institutional css file
    globalCSSFile = 'https://elearn.usu.edu/canvas_branding/css/catalogCanvasGlobal.css',
    // klFontAwesomePath = '//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css',
    klFontAwesomePath = 'https://elearn.usu.edu/canvasCustomTools/resources/font-awesome/4.2.0/css/font-awesome.min.css',
    devCourseArray = [
        "21" // Kenneth Dev
        // "4" // CIDI Custom Tools
    ],
    // Learning Path Courses
    learningPathCourseArray = [
        "Kenneth Dev",
        "TEAL-6280"
    ],
    coursenum;

function getCourseNum() {
    'use strict';
    var matches, killspot;
    // Parse Course Number - It is stored in the variable "coursenum"
    coursenum = null;
    matches = location.pathname.match(/\/courses\/(.*)/);
    if (matches) {
        coursenum = matches[1];
        killspot = coursenum.indexOf("/", 0);
        if (killspot >= 0) {
            coursenum = coursenum.slice(0, killspot);
        }
    }
}
getCourseNum();


// Dev Environment
if ($.inArray(coursenum, devCourseArray) !== -1) {
    console.log('DEVELOPMENT VERSION');
}

// Pull in custom variables
$.getScript(klToolsVariablesFile, function () {
    'use strict';
    console.log("tools_variables.js loaded");
});
// Additional Customization
$.getScript(klToolsAdditionalCustomizationFile, function () {
    'use strict';
    console.log("additional_customization.js loaded");
});
// USU Code Cleanup
$.getScript('https://elearn.usu.edu/canvasCustomTools/templateTools/production/js/code_update.js', function () {
    'use strict';
    console.log("additional_customization.js loaded");
});
// Run code to initialize tools
$.getScript(klToolsPath + "js/master_controls.js", function () {
    'use strict';
    console.log("master_controls.js loaded");
});

////////////////////////////////////////////////////
// END KENNETHWARE CONFIG                         //
////////////////////////////////////////////////////
