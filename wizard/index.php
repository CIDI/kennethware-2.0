<!-- These tools were designed to facilitate rapid course development in the Canvas LMS
Copyright (C) 2014  Kenneth Larsen - Center for Innovative Design and Instruction
Utah State University

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
http://www.gnu.org/licenses/agpl-3.0.html -->
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>USU Template Wizard</title>
	<link rel="stylesheet" href="resources/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="resources/bootstrap/css/bootstrap-responsive.min.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
	</script>
	<style>
		.well {text-align: center; max-width: 600px; margin: auto;}
	</style>
</head>
<body>
	<?php 
		include 'resources/dbconnect.php';
		// Display any php errors (for development purposes)
			error_reporting(E_ALL);
			ini_set('display_errors', '1');

		// Limit use to instructors or administrators
		session_start();
		if (isset($_POST["lis_person_name_full"])){

			//////// UPDATE FOR YOUR INSTITUTION ////////////
			$_SESSION['templateWizardURL'] = 'https://<location of folder>/kennethware-2.0/wizard';
			// Your OAuth Information
			$client_id = '################';
			$client_secret = '#############';
			/////////////////////////////////////////////////
			
			$canvasUserID = mysqli_real_escape_string($GLOBALS['conn'], $_POST["custom_canvas_user_id"]);
			$_SESSION['userID'] = $canvasUserID;
			$_SESSION['userFullName'] = mysqli_real_escape_string($GLOBALS['conn'], $_POST["lis_person_name_full"]);
			$_SESSION['courseID'] = mysqli_real_escape_string($GLOBALS['conn'], $_POST["custom_canvas_course_id"]);
			$_SESSION['roles'] = mysqli_real_escape_string($GLOBALS['conn'], $_POST["roles"]);
			$_SESSION['apiDomain'] = mysqli_real_escape_string($GLOBALS['conn'], $_POST["custom_canvas_api_domain"]);
			$_SESSION['canvasURL'] = 'https://'.$_SESSION['apiDomain'];
		}
		if(strpos($_SESSION['roles'],'Instructor') !== false || strpos($_SESSION['roles'],'Administrator') !== false) {
			$_SESSION['allowed'] = true;
		} else {
			echo "Sorry, you are not authorized to view this content or your session has expired. Please relaunch this tool from Canvas.";
			return false;
		}

		function getToken($url, $data){
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_POST, true);
			curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			// Send to remote and return data to caller.
			$response = curl_exec($ch);
			curl_close($ch);
			return $response;
		}

		$canvasUserID = $_SESSION['userID'];
		$userFullName = $_SESSION['userFullName'];
		$generateToken = true;

		// Check for User in database
		$sql = mysqli_query($GLOBALS['conn'], "SELECT canvasUserID FROM users WHERE canvasUserID = $canvasUserID");
		$num_rows = mysqli_num_rows($sql);
		// If user exists
		if($num_rows>0){
			// Check for token in database
			$sql = mysqli_query($GLOBALS['conn'], "SELECT token FROM oauth WHERE canvasUserID = $canvasUserID");
			$num_rows = mysqli_num_rows($sql);
			while($row=mysqli_fetch_array($sql)){
				$_SESSION['token'] = $row['token'];
			}
			// If token exists
			if($num_rows>0){
				// try token
					// if it works use it
					include 'resources/wizardAPI.php';
					$courseID = $_SESSION['courseID'];
					$course = getCourse($courseID);
					$courseDetails = json_decode($course, true);
					if (isset($courseDetails['name'])){
						$_SESSION['courseName'] = $courseDetails['name'];
						$generateToken = false;
					}
					if (isset($courseDetails['message']) && $courseDetails['message'] == 'Invalid access token.'){
						$sql = mysqli_query($GLOBALS['conn'], "DELETE FROM oauth WHERE canvasUserID = $canvasUserID");
						$generateToken = true;
					}
					// else delete and have them reauthorize
				
			} 
		} else {
			$sql = "INSERT INTO users (canvasUserID, userFull) VALUES ('$canvasUserID','$userFullName')";
			if(mysqli_query($GLOBALS['conn'], $sql)){
			}else{
				echo mysqli_error();
			}
			$generateToken = true;
		}

		// // run through oauth procedure
		if ($generateToken == true){
			if (isset($_GET["code"])){	
				$code = $_GET['code'];
				$url = 'https://'.$_SESSION['apiDomain'].'/login/oauth2/token';
				$data = 'client_id='.$client_id.'&client_secret='.$client_secret.'&code='.$code;
				$response = getToken($url, $data);
				$responseDetails = json_decode($response, true);
				if (isset($responseDetails['access_token'])){
					$_SESSION['token'] = $responseDetails['access_token'];
					$token = $responseDetails['access_token'];
					$sql = "INSERT INTO oauth (canvasUserID,token) VALUES ('$canvasUserID','$token')";
					if(mysqli_query($GLOBALS['conn'], $sql)){
						$_SESSION['token'] = $token;
					}else{
						echo mysqli_error();
					}
				}
			} else {
				header('Location: https://'.$_SESSION['apiDomain'].'/login/oauth2/auth?client_id='.$client_id.'&response_type=code&redirect_uri='.$_SESSION['templateWizardURL'].'/index.php');
			}
		}

	?>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li><a href="resources/wikiPages.php">Wiki Page Templates</a></li>
				<li><a href="resources/modules.php">Modules</a></li>
				<li><a href="resources/imageCrop.php?task=selectImage">Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
	<div class="container-fluid">
		<div class="row-fluid">
			<h2 style="text-align:center;">
				<?php 
					if (isset($_SESSION['courseName'])) {
						echo $_SESSION['courseName']; 
					} 
				?>
		</h2>
			<div class="well">
				<a href="resources/wikiPages.php" class="btn btn-primary btn-block btn-large">Wiki Page Templates</a>
				<a href="resources/modules.php" class="btn btn-primary btn-block btn-large">Modules</a>
				<a href="resources/imageCrop.php?task=selectImage" class="btn btn-primary btn-block btn-large">Front Page Banner Image</a>
			</div>
		</div>
	</div>
</body>
</html>