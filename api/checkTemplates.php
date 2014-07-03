<?php
	require_once 'canvasAPI.php';
	require_once (__DIR__.'/../config.php');
	header('Access-Control-Allow-Origin: '.$canvasDomain);
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	$courseID = $_POST['courseID'];
	$primaryButton = '';
	$secondaryButton = '';
	$primaryTemplate = false;
	$secondaryTemplate = false;

	// Query to see if Primary/Secondary templates exist otherwise option to create
	$primaryTemplateExists = getPageFromCourse($courseID, "primary-template");
	// echo $primaryTemplateExists;
	$workingList = json_decode($primaryTemplateExists,true);
	if(isset($workingList['created_at'])){
		if($workingList['created_at'] !== ''){
			$primaryTemplate = true;
			$primaryButton = '<a href="#" class="btn btn-mini kl_import_primary_template kl_margin_bottom"><i class="fa fa-clipboard"></i><span class="screenreader-only">Import content from</span> Primary Template</a>';
		}
	}
	$secondaryTemplateExists = getPageFromCourse($courseID, "secondary-template");
	// echo $secondaryTemplateExists;
	$workingList2 = json_decode($secondaryTemplateExists,true);
	if(isset($workingList2['created_at'])){
		if($workingList2['created_at'] !== ''){
			$secondaryTemplate = true;
			$secondaryButton = '<a href="#" class="btn btn-mini kl_import_secondary_template kl_margin_bottom"><i class="fa fa-clipboard"></i><span class="screenreader-only">Import content from</span> Secondary Template</a>';
		}
	}
	if($secondaryTemplate == true && $primaryTemplate == true){
		// $secondaryButton = '<a href="#" class="btn btn-mini kl_import_secondary_template kl_margin_bottom" data-tooltip="top" title="Import template page contents"><i class="fa fa-clipboard"></i> Secondary</a>';
		// $primaryButton = '<a href="#" class="btn btn-mini kl_import_primary_template kl_margin_bottom" data-tooltip="top" title="Import template page contents"><i class="fa fa-clipboard"></i> Primary</a>';
		echo '<div class="btn-group">'.$primaryButton.$secondaryButton.'</div>';
	} else {
		echo $primaryButton.$secondaryButton;
	}
?>