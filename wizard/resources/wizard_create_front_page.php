<?php
	session_start();
	// // Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	require_once (__DIR__.'/../../config.php');
	// Include API Calls
	require_once 'wizardAPI.php';

	require_once 'simple_html_dom.php';
	$homePage = getPageFromCourse($courseID, "home");
	if(isset($homePage->created_at)){
		if($homePage->created_at !== ''){
			echo 'Already Exists';exit;
		}
	}
	if ($_POST['createPage'] == true) {
		$frontPageTitle = 'Home';
		$frontPageBody = '';
		$frontPageParams = 'wiki_page[title]='.$frontPageTitle.'&wiki_page[body]='.urlencode($frontPageBody).'&wiki_page[published]=true&wiki_page[front_page]=true';
		$newPage = createPage($courseID, $frontPageParams);
		$responseData = json_decode($newPage, true);
		$page_url = $responseData['url'];
		echo '<i class="fa fa-check"></i> Page Created';
	}
?>
