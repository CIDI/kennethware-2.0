<?php
	// This page contains a variety of Canvas API calls
	require_once (__DIR__.'/../config.php');

	$tokenHeader = array("Authorization: Bearer ".$apiToken);

	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	// the following functions run the GET calls
	function curlGet($url) {
		$ch = curl_init($url);
		curl_setopt ($ch, CURLOPT_URL, $GLOBALS['canvasDomain'].'/api/v1/'.$url);
		curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
		curl_setopt ($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned

		// Send to remote and return data to caller.
		$response = curl_exec($ch);
		curl_close($ch);
		return $response;
	}
	// PAGES
	function getPageFromCourse($courseID, $page_url){
		$apiUrl = "courses/".$courseID."/pages/".$page_url;
		$response = curlGet($apiUrl);
		return $response;
	}

	function getPageBody($courseID, $page_url){
		$page = getPageFromCourse($courseID, $page_url);

		// Decode the JSON so we can do something with it
		$pageDetails = json_decode($page,true);

		// Get just the body contents and return it to the calling function
		$body = $pageDetails['body'];
		$bodyContent = urlencode($body);
		return $body;
	}
?>