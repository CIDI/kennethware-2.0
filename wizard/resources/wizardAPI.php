<?php
	// This page contains a variety of functions that can be used to access the Canvas API
	// This is the header containing the authorization token from Canvas
		$tokenHeader = array("Authorization: Bearer ".$_SESSION['token']);

	// Display any php errors (for development purposes)
		error_reporting(E_ALL);
		ini_set('display_errors', '1');


	// the following functions run the GET and POST calls

		function curlGet($url) {
			$ch = curl_init($url);
			curl_setopt ($ch, CURLOPT_URL, $_SESSION['canvasURL'].'/api/v1/'.$url);
			curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
			curl_setopt ($ch, CURLOPT_HEADER, false);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned

			// Send to remote and return data to caller.
			$response = curl_exec($ch);
			curl_close($ch);
			return $response;
		}
		function curlPost($url, $data) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $_SESSION['canvasURL'].'/api/v1/'.$url);
			curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned

			// Send to remote and return data to caller.
			$response = curl_exec($ch);
			curl_close($ch);
			return $response;
		}

	// Canvas API Calls
		function createGenericAssignment($courseID, $assignmentParams){
			$createAssignmentURL = "courses/".$courseID."/assignments";
			$response = curlPost($createAssignmentURL, $assignmentParams);
			$responseData = json_decode($response, true);
			$assignmentID = $responseData['id'];
			// Returns new assignment ID
			return $assignmentID;

		}
		function createGenericDiscussion($courseID, $discussionParams){
			$createDiscussionURL = "courses/".$courseID."/discussion_topics";
			$response = curlPost($createDiscussionURL, $discussionParams);
			$responseData = json_decode($response, true);
			$discussionID = $responseData['id'];
			// Returns new discussion ID
			return $discussionID;
		}
		function createGenericQuiz($courseID, $quizParams){
			$createQuizURL = "courses/".$courseID."/quizzes";
			$response = curlPost($createQuizURL, $quizParams);
			$responseData = json_decode($response, true);
			$quizID = $responseData['id'];
			// Returns new quiz ID
			return $quizID;
		}
		function createModule($courseID, $moduleParams){
			$createModuleUrl = "courses/".$courseID."/modules";
			$response = curlPost($createModuleUrl, $moduleParams);
			$responseData = json_decode($response, true);
			$moduleID = $responseData['id'];
			// Returns new module ID
			return $moduleID;
		}
		function createModuleItem($courseID, $moduleID, $itemParams){
			$createModuleUrl = "courses/".$courseID."/modules/".$moduleID."/items";
			$response = curlPost($createModuleUrl, $itemParams);
			return $response;
		}
		function createPage($courseID, $pageParams){
			$apiUrl = "courses/".$courseID."/pages";
			$response = curlPost($apiUrl, $pageParams);
			return $response;
		}
		function getCourse($courseID){
			$apiUrl = "courses/".$courseID."?include[]=term";
			$response = curlGet($apiUrl);
			return $response;
		}
		function getPageBody($courseID, $page_url){
			// Get the response
			$page = getPageFromCourse($courseID, $page_url);
			// Decode the JSON so we can do something with it
			$pageDetails = json_decode($page,true);
			// Get just the body contents and return it to the calling function
			$body = $pageDetails['body'];
			$bodyContent = urlencode($body);
			// Returns body string
			return $body;
		}
		function getPageFromCourse($courseID, $page_url){
			$apiUrl = "courses/".$courseID."/pages/".$page_url;
			$response = curlGet($apiUrl);
			return $response;
		}
		function uploadFrontPageBanner($courseID){
			$apiUrl = "courses/".$courseID."/files";
			$apiParams = "name=homePageBanner.jpg&content_type=image/jpeg&parent_folder_path=/global/css/images&url=".$_SESSION['templateWizardURL']."/resources/images/".$courseID."_cropped.jpg&on_duplicate=overwrite";
			$response = curlPost($apiUrl, $apiParams);
			var_dump($_SESSION['templateWizardURL']);
			return $response;
		}
?>