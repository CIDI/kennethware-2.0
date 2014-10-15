<?php
	session_start();
	// // Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	require_once (__DIR__.'/../../config.php');
	// Include API Calls
	require_once 'wizardAPI.php';

	require_once 'simple_html_dom.php';
	$orderDetails = $_POST['orderDetails'];
	$explodeDetails = explode(',', $orderDetails);
	foreach ($explodeDetails as $moduleDetails) {
		$module = explode("|", $moduleDetails);
		$moduleID = $module[0];
		$modulePosition = $module[1];
		$updateOrder = updateModuleOrder($courseID, $moduleID, $modulePosition);
		var_dump($updateOrder);
		echo '<hr>';
	}


?>