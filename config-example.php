<?php
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	/***************************/
	/* TEMPLATE WIZARD CONFIG  */
	/***************************/
	// The URL for where the "wizard" folder is located

	$_SESSION['template_wizard_url'] = 'https://<path to wizard>/wizard';
	require_once __DIR__.'/wizard/resources/blti.php';
	require_once __DIR__.'/wizard/resources/cryptastic.php';
	require_once __DIR__.'/wizard/resources/meekrodb2.2.class.php';
	
	// Database connection information for Template Wizard
	DB::$host ='';
	DB::$user = '';
	DB::$password = '';
	DB::$dbName = '';

	// Strings to help encrypt/decrypt user OAuth tokens
	$pass = '';
	$salt = '';

	// Include API Calls
	require_once __DIR__.'/wizard/resources/wizardAPI.php';

	// Your Canvas OAuth2 Developer information. Used for getting OAuth tokens from users
	$client_id = '#####';
	$clientSecret = '######';
	
	// The Shared Secret you use when setting up the Template Wizard LTI tool
	$lti_secret = "###";

	// Message to display if the OAuth token request fails
	$oauth_error_message = 'There is a problem, contact someone to fix it';

	/***************************/
	/* TOOLS API CONFIG  */
	/***************************/

	// These variables for the Content Tools to make API calls
	$canvasDomain = 'https://<your domain>.instructure.com';
	// This OAuth token needs to make GET API calls for any course in your institution
	$apiToken = "###";
?>