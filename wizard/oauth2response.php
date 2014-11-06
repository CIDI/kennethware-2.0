<?php
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	
	session_start();
	require_once (__DIR__.'/../config.php');
	
	// get code query parameter from POST data
	$opts = array('http' => array( 'method'  => 'POST', ));
	$context  = stream_context_create($opts);
	$url = $_SESSION['canvasURL'].'/login/oauth2/token?client_id='.$client_id.'&client_secret='.$clientSecret.'&code='.$_GET['code'];
	// OPTION 1
	$userTokenJSON = file_get_contents($url, false, $context, -1, 40000); //ASK CANVAS,	USING DEVELOPER TOKEN, TO RETURN STUDENT TOKEN

	// OPTION 2
    // $runfile = $url;
    // $ch = curl_init();
    // curl_setopt($ch, CURLOPT_URL, $runfile);
    // curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1);
    // $userTokenJSON = curl_exec ($ch);
    // curl_close ($ch); 

	$userToken = json_decode($userTokenJSON);

	//encrypt token
	$cryptastic = new cryptastic;
	$key = $cryptastic->pbkdf2($pass, $salt, 1000, 32);
	$encrypted_token = $cryptastic->encrypt($userToken->access_token, $key);

	//store encrypted token in the database
	$userID=$_SESSION['userID'];
	DB::insert('tokens', array(
	  'canvas_user_id' => $userID,
	  'encrypted_token' => $encrypted_token,
	  'domain' => $_SESSION['apiDomain']
	));
	$_SESSION['allowed'] = true;
	/*  redirect to main tool page */
	header('Location: '.$_SESSION["template_wizard_url"].'/index.php');

?>