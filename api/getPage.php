<?php
	header('Access-Control-Allow-Origin: https://<your institution>.instructure.com');
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	include 'canvasAPI.php';
	$courseID = $_POST['courseID'];
	$pageUrl = $_POST['pageUrl'];
	$pageBody = getPageBody($courseID, $pageUrl, $tokenHeader);
	echo $pageBody;
?>