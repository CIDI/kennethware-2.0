<?php
	// This page contains a variety of Canvas API calls, it is not exhaustive as calls have been added by need
	// Caution: Not all calls have been tested, some were setup but the approach changed before they were fully tested


/********************************************/
/*********  REQUIRED INFORMATION ************/
/********************************************/

	// Root url for all api calls
	$canvasURL = 'https://<your institution>.instructure.com/api/v1/';
	// This is the header containing the authorization token from Canvas,
		// this token will only need read access to view pages
	$token = "";
	
/********************************************/
/********************************************/

	$tokenHeader = array("Authorization: Bearer ".$token);

	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	// the following functions run the GET calls
	function curlGet($url) {
		$ch = curl_init($url);
		curl_setopt ($ch, CURLOPT_URL, $GLOBALS['canvasURL'].$url);
		curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
		curl_setopt ($ch, CURLOPT_HEADER, false);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned

		// Send to remote and return data to caller.
		$response = curl_exec($ch);
		curl_close($ch);
		return $response;
	}
	// PAGES
	function getPageFromCourse($courseID, $page_url, $header){
		$apiUrl = "courses/".$courseID."/pages/".$page_url;
		$response = curlGet($apiUrl, $header);
		return $response;
	}

	function getPageBody($courseID, $page_url, $header){
		$page = getPageFromCourse($courseID, $page_url, $header);

		// Decode the JSON so we can do something with it
		$pageDetails = json_decode($page,true);

		// Get just the body contents and return it to the calling function
		$body = $pageDetails['body'];
		$bodyContent = urlencode($body);
		return $body;
	}
?>