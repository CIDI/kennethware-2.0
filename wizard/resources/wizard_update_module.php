<?php
    session_start();
    // // Display any php errors (for development purposes)
    error_reporting(E_ALL);
    ini_set('display_errors', '1');

    require_once (__DIR__.'/../../config.php');
    // Include API Calls
    require_once 'wizardAPI.php';
    // Include utility for working with the template page content
    require_once 'simple_html_dom.php';

    // Find a string between two tags
    function get_string_between($string, $start, $end){
        $string = " ".$string;
        $ini = strpos($string,$start);
        if ($ini == 0) return "";
        $ini += strlen($start);     
        $len = strpos($string,$end,$ini) - $ini;
        return substr($string,$ini,$len);
    }

    // Setup variables
    $courseID = $_POST['courseID'];
    $moduleID = $_POST['moduleID'];
    $moduleTitle = $_POST['moduleTitle'];
    $primaryPage = $_POST['primaryPage'];
    $secondaryTemplateCount = intval($_POST['secondaryPageCount']);
    $assignmentCount = intval($_POST['assignmentCount']);
    $discussionCount = intval($_POST['discussionCount']);
    $quizCount = intval($_POST['quizCount']);
    // Update the Module Title
    $moduleParams = 'module[name]='.$moduleTitle;
    $moduleUpdate = updateModule($courseID, $moduleID, $moduleParams);

    // Look for a module prefix
    $explodedTitle = explode(":", $moduleTitle);
    // if there is a module prefix, disect it
    if(isset($explodedTitle[1])){
        // Pull out the title
        $titleText = $explodedTitle[1];
        // break up the prefix to get the unit type and #
        $moduleIdentifier = $explodedTitle[0];
        $explodedIdentifier = explode(" ", $moduleIdentifier);
        if(isset($explodedIdentifier[1])){
            $moduleUnit = $explodedIdentifier[0];
            $moduleNumber = $explodedIdentifier[1];
            $modulePrefix = $moduleUnit.' '.$moduleNumber.': ';
        }
    } else {
        $titleText = $moduleTitle;
        $moduleUnit = '';
        $moduleNumber = '';
        $modulePrefix = $moduleTitle.': ';
    }


    // Primary Page
    if ($primaryPage == 'true'){
        // Name the new template page
        $pageTitle = $modulePrefix." Overview";

        // Replace the existing module header details with content from form
        // Find and replace module title

        // Get the content of the primary template
        $pageBody = getPageBody($courseID, 'primary-template');
        // Replace the module title
        if ($titleText !== " "){
            $replaceTitle = get_string_between($pageBody, 'id="kl_banner_right">', '</span>');
            $pageBody = str_replace('id="kl_banner_right">'.$replaceTitle.'</span>', 'id="kl_banner_right">'.$titleText.'</span>', $pageBody);
        }

        // Find and replace module unit
        if ($moduleUnit !== '') {
            $replaceUnit = get_string_between($pageBody, 'class="kl_mod_text">', '</span>');
            $pageBody = str_replace('class="kl_mod_text">'.$replaceUnit.'</span>', 'class="kl_mod_text">'.$moduleUnit.' </span>', $pageBody);
        }

        // Find and replace module number
        if ($moduleNumber !== '') {
            $replaceNumber = get_string_between($pageBody, 'class="kl_mod_num">', '</span>');
            $pageBody = str_replace('class="kl_mod_num">'.$replaceNumber.'</span>', 'class="kl_mod_num">'.$moduleNumber.'</span>', $pageBody);
        }

        // Create the new page
        $pageParams = 'wiki_page[title]='.$pageTitle.'&wiki_page[body]='.urlencode($pageBody);
        $newPage = createPage($courseID, $pageParams);
        // Get the url for the new page
        $responseData = json_decode($newPage, true);
        $page_url = $responseData['url'];
        // Add the new page to the top of the module
        $itemParams = 'module_item[title]='.urlencode($pageTitle).'&module_item[type]=Page&module_item[page_url]='.$page_url.'&module_item[position]=1';
        $modulePage = createModuleItem($courseID, $moduleID, $itemParams);
    }

    // Process Secondary Page
    if ($secondaryTemplateCount > 0){
        // Get secondary-template content
        $pageBody = getPageBody($courseID, 'secondary-template');
        // Find and replace module prefix
        $replaceUnit = get_string_between($pageBody, 'class="kl_mod_text">', '</span>');

        for ($i=1; $i<=$secondaryTemplateCount; $i++){
            // Title the page
            $pageTitle = $modulePrefix . " Secondary Page ".$i;
            // Find and replace the module unit
            $replaceUnit = get_string_between($pageBody, 'class="kl_mod_text">', '</span>');
            $pageBody = str_replace('class="kl_mod_text">'.$replaceUnit.'</span>', 'class="kl_mod_text">'.$moduleUnit.' </span>', $pageBody);
            // Find and replace module number
            $replaceNumber = get_string_between($pageBody, 'class="kl_mod_num">', '</span>');
            $pageBody = str_replace('class="kl_mod_num">'.$replaceNumber.'</span>', 'class="kl_mod_num">'.$moduleNumber.'.'.$i.'</span>', $pageBody);
            // Create the new page
            $pageParams = 'wiki_page[title]='.$pageTitle.'&wiki_page[body]='.urlencode($pageBody);
            $newPage = createPage($courseID, $pageParams);
            // Get the url for the new page
            $responseData = json_decode($newPage, true);
            $page_url = $responseData['url'];
            // Add the new page to the module
            $itemParams = 'module_item[title]='.urlencode($pageTitle).'&module_item[type]=Page&module_item[page_url]='.$page_url;
            $modulePage = createModuleItem($courseID, $moduleID, $itemParams);
            var_dump($modulePage);
        }
    }

    // Add Assignments
    if ($assignmentCount > 0){
        for ($i=1; $i<=$assignmentCount; $i++){
            $assignmentTitle = $modulePrefix .' Assignment '.$i;
            $assignmentParams = 'assignment[name]='.$assignmentTitle.'&assignment[position]=1&assignment[submission_types][]=none';
            $assignmentID = createGenericAssignment($courseID, $assignmentParams);
            $itemParams = 'module_item[title]='.urlencode($assignmentTitle).'&module_item[type]=Assignment&module_item[content_id]='.$assignmentID;
            $moduleAssignment = createModuleItem($courseID, $moduleID, $itemParams);
        }
    }

    // Add Discussions
    if ($discussionCount > 0){
        for ($i=1; $i<=$discussionCount; $i++){
            $discussionTitle = $modulePrefix .' Discussion '.$i;

            $discussionParams = 'title='.$discussionTitle.'&message=Discussion&discussion_type=threaded&published=false';
            $discussionID = createGenericDiscussion($courseID, $discussionParams);
            $itemParams = 'module_item[title]='.urlencode($discussionTitle).'&module_item[type]=discussion&module_item[content_id]='.$discussionID;
            $moduleDiscussion = createModuleItem($courseID, $moduleID, $itemParams);
        }
    }

    // Add Quizzes
    if ($quizCount > 0){
        for ($i=1; $i<=$quizCount; $i++){
            $quizTitle = $modulePrefix .' Quiz '.$i;
            $quizParams = 'quiz[title]='.$quizTitle.'&quiz[description]=New Quiz&quiz[quiz_type]=assignment';
            $quizID = createGenericquiz($courseID, $quizParams);
            $itemParams = 'module_item[title]='.urlencode($quizTitle).'&module_item[type]=quiz&module_item[content_id]='.$quizID;
            $modulequiz = createModuleItem($courseID, $moduleID, $itemParams);
        }
    }
?>