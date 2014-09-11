<?php
	session_start();
	// // Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	require_once (__DIR__.'/../../config.php');
	// Include API Calls
	require_once 'wizardAPI.php';

	require_once 'simple_html_dom.php';
	$modules = $_POST['moduleDetails'];
	// Find a string between two tags
	function get_string_between($string, $start, $end){
		$string = " ".$string;
		$ini = strpos($string,$start);
		if ($ini == 0) return "";
		$ini += strlen($start);     
		$len = strpos($string,$end,$ini) - $ini;
		return substr($string,$ini,$len);
	}

	if ($_POST['frontPage']) {
		$frontPageTitle = 'Home';
		$frontPageBody = '';
		$frontPageParams = 'wiki_page[title]='.$frontPageTitle.'&wiki_page[body]='.urlencode($frontPageBody).'&wiki_page[published]=true&wiki_page[front_page]=true';
		$newPage = createPage($courseID, $frontPageParams);
		$responseData = json_decode($newPage, true);
		$page_url = $responseData['url'];
	}
	// echo $modules;
	foreach ($modules as $value) {
	    $moduleSections = explode(" || ", $value);
	    $moduleNumber = $moduleSections[0];
	    $moduleTitlePrefix = $moduleSections[1];
	    // Create Module
	    $moduleTitle = $moduleSections[2];
	    // echo "Title: ".$moduleTitle."<br>";
	    $moduleParams = 'module[name]='.$moduleTitle;
	    $newModuleID = createModule($courseID, $moduleParams);

	    // Add Primary Template
	    $primaryTemplate = $moduleSections[3];
	    // echo "Primary: ".$primaryTemplate."<br>";
	    // WORKING!!!
	    if ($primaryTemplate == "true"){
			$pageTitle = $moduleTitlePrefix." Overview";
	    	$pageBody = getPageBody($courseID, 'primary-template');
	    	// Replace the existing module header details with content from form
			// var_dump($pageBody);
	    	// Find and replace module prefix
	    	$replacePrefix = get_string_between($pageBody, 'class="kl_mod_text">', '</span>');
	    	// var_dump($replacePrefix);
	    	$explodedPrefix = explode(" ", $moduleTitlePrefix);
	    	$prefixText = $explodedPrefix[0];
			$pageBody = str_replace('class="kl_mod_text">'.$replacePrefix.'</span>', 'class="kl_mod_text">'.$prefixText.' </span>', $pageBody);
	    	// Find and replace module number
	    	$replaceNumber = get_string_between($pageBody, 'class="kl_mod_num">', '</span>');
	    	// var_dump($replaceNumber);
			$pageBody = str_replace('class="kl_mod_num">'.$replaceNumber.'</span>', 'class="kl_mod_num">'.$moduleNumber.'</span>', $pageBody);

	    	// Find and replace module title
	    	$explodedTitle = explode(":", $moduleTitle);
	    	if(isset($explodedTitle[1])){
	    		$titleText = $explodedTitle[1];
	    	} else {
	    		$titleText = $moduleTitle;
	    	}
	    	if ($titleText !== " "){
	    		$replaceTitle = get_string_between($pageBody, 'id="kl_banner_right">', '</span>');
				$pageBody = str_replace('id="kl_banner_right">'.$replaceTitle.'</span>', 'id="kl_banner_right">'.$titleText.'</span>', $pageBody);
	    	}


			$pageParams = 'wiki_page[title]='.$pageTitle.'&wiki_page[body]='.urlencode($pageBody);
			$newPage = createPage($courseID, $pageParams);
			$responseData = json_decode($newPage, true);
			$page_url = $responseData['url'];

			$itemParams = 'module_item[title]='.urlencode($pageTitle).'&module_item[type]=Page&module_item[page_url]='.$page_url;
			$modulePage = createModuleItem($courseID, $newModuleID, $itemParams);
	    }


	    // Add Secondary Template
	    $secondaryTemplateCount = $moduleSections[4];
	    // echo "Secondary: ".$secondaryTemplateCount."<br>";
	    // NOT WORKING YET
	    if ($secondaryTemplateCount != ""){
	    	$pageBody = getPageBody($courseID, 'secondary-template');
			// Find and replace module prefix
			$replacePrefix = get_string_between($pageBody, 'class="kl_mod_text">', '</span>');
			// var_dump($replacePrefix);
			$explodedPrefix = explode(" ", $moduleTitlePrefix);
			$prefixText = $explodedPrefix[0];

	  	   for ($i=1; $i<=$secondaryTemplateCount; $i++){
				$pageTitle = $moduleTitlePrefix." Secondary Page ".$i;
				$pageBody = str_replace('class="kl_mod_text">'.$replacePrefix.'</span>', 'class="kl_mod_text">'.$prefixText.' </span>', $pageBody);
				// Find and replace module number
				$replaceNumber = get_string_between($pageBody, 'class="kl_mod_num">', '</span>');
				// var_dump($replaceNumber);
				$pageBody = str_replace('class="kl_mod_num">'.$replaceNumber.'</span>', 'class="kl_mod_num">'.$moduleNumber.'.'.$i.'</span>', $pageBody);



				$pageParams = 'wiki_page[title]='.$pageTitle.'&wiki_page[body]='.urlencode($pageBody);
				$newPage = createPage($courseID, $pageParams);
				$responseData = json_decode($newPage, true);
				$page_url = $responseData['url'];

				$itemParams = 'module_item[title]='.urlencode($pageTitle).'&module_item[type]=Page&module_item[page_url]='.$page_url;
				$modulePage = createModuleItem($courseID, $newModuleID, $itemParams);
		    }
	    }


	    // Add Assignments
	    $assignmentCount = $moduleSections[5];
	    // echo "<br>Assignments: ".$assignmentCount."<br>";
	 	// WORKING !!!!!
	    for ($i=1; $i<=$assignmentCount; $i++){
		    $assignmentParams = 'assignment[name]='.$moduleTitlePrefix.' Assignment '.$i.'&assignment[position]=1&assignment[submission_types][]=none';
		    $assignmentID = createGenericAssignment($courseID, $assignmentParams);
		    $itemParams = 'module_item[title]='.urlencode($moduleTitlePrefix.' Assignment '.$i).'&module_item[type]=Assignment&module_item[content_id]='.$assignmentID;
			$moduleAssignment = createModuleItem($courseID, $newModuleID, $itemParams);
		}

	    // Add Discussions
	    $discussionCount = $moduleSections[6];
	    // echo "<br>Discussions: ".$discussionCount."<br>";
	    // WORKING!!!
	    for ($i=1; $i<=$discussionCount; $i++){
		    $discussionParams = 'title='.$moduleTitlePrefix.' Discussion '.$i.'&message=Discussion&discussion_type=threaded&published=false';
		    $discussionID = createGenericDiscussion($courseID, $discussionParams);
		    $itemParams = 'module_item[title]='.urlencode($moduleTitlePrefix.' Discussion '.$i).'&module_item[type]=discussion&module_item[content_id]='.$discussionID;
			$moduleDiscussion = createModuleItem($courseID, $newModuleID, $itemParams);
		}

	    // Add Quizzes
	    $quizCount = $moduleSections[7];
	    // echo "<br>Quizzes: ".$quizCount."<br>";
	 	// WORKING!!!
	    for ($i=1; $i<=$quizCount; $i++){
		    $quizParams = 'quiz[title]='.$moduleTitlePrefix.' Quiz '.$i.'&quiz[description]=New Quiz&quiz[quiz_type]=assignment';
		    $quizID = createGenericquiz($courseID, $quizParams);
		    $itemParams = 'module_item[title]='.urlencode($moduleTitlePrefix.' Quiz '.$i).'&module_item[type]=quiz&module_item[content_id]='.$quizID;
			$modulequiz = createModuleItem($courseID, $newModuleID, $itemParams);
		}
	}

?>
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>Template Wizard - Create Modules Confirmation</title>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
	</script>
</head>
<body>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
				<li class="active"><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
				<li><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
	<div class="container-fluid">
		<h2>Modules Created!</h2>
	</div>
</body>
</html>