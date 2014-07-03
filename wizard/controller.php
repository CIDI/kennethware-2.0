<?php 
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	session_start();
	require_once __DIR__ . '/../config.php';

	//Check to see if the lti handshake passes
	$context = new BLTI($lti_secret, false, false);
	if ($context->valid) {
		$generateToken = false;
		// Setup variables from lti Post for later use
		$canvasUserID = $_POST["custom_canvas_user_id"];
		$_SESSION['userID'] = $canvasUserID;
		$_SESSION['userFullName'] = $_POST["lis_person_name_full"];
		$_SESSION['courseID'] = $_POST["custom_canvas_course_id"];
		$_SESSION['apiDomain'] = $_POST["custom_canvas_api_domain"];
		$_SESSION['canvasURL'] = 'https://'.$_SESSION['apiDomain'];

		/* query DB to see if user has token, if yes, go to LTI*/
		$userCheck = DB::query("SELECT canvas_user_id FROM tokens WHERE canvas_user_id = " . $_SESSION['userID']);
		var_dump($userCheck);
		if (!$userCheck){
			$generateToken = true;
		} else {
			$_SESSION['allowed'] = true;
			// Include API Calls
			require_once 'resources/wizardAPI.php';
			// test token
			$course = getCourse($_SESSION['courseID']);
			var_dump($course);
			if (isset($course->errors[0]->message)){
				$sql = DB::query("DELETE FROM tokens WHERE canvas_user_id = $canvasUserID");
				$generateToken = true;
			}
			if (isset($course->name)){
				$generateToken = false;
			}
		}
		if ($generateToken == true) {
			echo 'Generate Token';
			// if not, redirect to canvas permission page
			header('Location: '.$_SESSION['canvasURL'].'/login/oauth2/auth?client_id='.$client_id.'&response_type=code&redirect_uri='.$_SESSION["template_wizard_url"].'/oauth2response.php');
		} else {
			header('Location: '.$_SESSION["template_wizard_url"].'/index.php');	
		}
	} else {
		echo $oauth_error_message;
	}
?>