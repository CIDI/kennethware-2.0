<?php
	// This page contains a variety of functions that can be used to access the Canvas API

	// Display any php errors (for development purposes)
		error_reporting(E_ALL);
		ini_set('display_errors', '1');

	//Set variables
	$courseID = $_SESSION['courseID'] ;
	$userID = $_SESSION['userID'];

	//retrieve user token from database
	$encrypted_token = DB::query("SELECT encrypted_token FROM tokens WHERE canvas_user_id = " . $_SESSION['userID'] );
	//decrypt token
 	$cryptastic = new cryptastic;
	$key = $cryptastic->pbkdf2($pass, $salt, 1000, 32);
	$token = $cryptastic->decrypt($encrypted_token[0]['encrypted_token'], $key);

	// This is the header containing the authorization token from Canvas
	$tokenHeader = array("Authorization: Bearer ".$token);



	// the following functions run the GET and POST calls
		function http_parse_headers( $header ) {
		    $retVal = array();
		    $fields = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $header));
		    foreach( $fields as $field ) {
		        if( preg_match('/([^:]+): (.+)/m', $field, $match) ) {
		            $match[1] = preg_replace('/(?<=^|[\x09\x20\x2D])./e', 'strtoupper("\0")', strtolower(trim($match[1])));
		            if( isset($retVal[$match[1]]) ) {
		                $retVal[$match[1]] = array($retVal[$match[1]], $match[2]);
		            } else {
		                $retVal[$match[1]] = trim($match[2]);
		            }
		        }
		    }
	    	return $retVal;
		}
		function curlGet($url) {
			global $token;
			$ch = curl_init($url);
			curl_setopt ($ch, CURLOPT_URL, $_SESSION['canvasURL'].'/api/v1/'.$url);
			curl_setopt ($ch, CURLOPT_HTTPHEADER, $GLOBALS['tokenHeader']);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // ask for results to be returned
			curl_setopt($ch, CURLOPT_VERBOSE, 1); //Requires to load headers
			curl_setopt($ch, CURLOPT_HEADER, 1);  //Requires to load headers
			$result = curl_exec($ch);
			// var_dump($result);

			#Parse header information from body response
			$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
			$header = substr($result, 0, $header_size);
			$body = substr($result, $header_size);
			$data = json_decode($body);
			curl_close($ch);
				
			#Parse Link Information
			$header_info = http_parse_headers($header);
			if(isset($header_info['Link'])){
				$links = explode(',', $header_info['Link']);
				foreach ($links as $value) {
					if (preg_match('/^\s*<(.*?)>;\s*rel="(.*?)"/', $value, $match)) {
						$links[$match[2]] = $match[1];
					}
				}
			}
			#Check for Pagination
			if(isset($links['next'])){
				// Remove the API url so it is not added again in the get call
				$next_link = str_replace($_SESSION['canvasURL'].'/api/v1/', '', $links['next']);
				$next_data = curlGet($next_link);
				$data = array_merge($data,$next_data);
				return $data;
			}else{
				return $data;
			}
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
			// return only the body
			$body = $page->body;
			return $body;
		}
		function getPageFromCourse($courseID, $page_url){
			$apiUrl = "courses/".$courseID."/pages/".$page_url;
			$response = curlGet($apiUrl);
			return $response;
		}
		function uploadFrontPageBanner($courseID){
			$apiUrl = "courses/".$courseID."/files";
			$apiParams = "name=homePageBanner.jpg&content_type=image/jpeg&parent_folder_path=/global/css/images&url=".$_SESSION['template_wizard_url']."/resources/images/".$courseID."_cropped.jpg&on_duplicate=overwrite";
			$response = curlPost($apiUrl, $apiParams);
			return $response;
		}
?>