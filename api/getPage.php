<?php
	require_once 'canvasAPI.php';
	require_once (__DIR__.'/../config.php');
	header('Access-Control-Allow-Origin: '.$canvasDomain);
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	$courseID = $_POST['courseID'];
	$pageUrl = $_POST['pageUrl'];
	$pageBody = getPageBody($courseID, $pageUrl);
	echo $pageBody;
?>