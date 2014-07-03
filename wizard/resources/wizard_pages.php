<?php
	session_start();
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	if ($_SESSION['allowed']){
		$courseID = $_SESSION['courseID'];
	} else {
		echo "Sorry, you are not authorized to view this content or your session has expired. Please relaunch this tool from Canvas.";
		exit;
	}
	require_once (__DIR__.'/../../config.php');
	// Include API Calls
	require_once 'wizardAPI.php';
	?>
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>USU Template Wizard - Wiki Pages</title>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
		$(function() {
			$(".primary").click(function (e){
				$(this).addClass("btn-primary").html('<i class="fa fa-pencil"></i> Edit Primary Template Page');
			});
			$(".secondary").click(function (e){
				$(this).addClass("btn-primary").html('<i class="fa fa-pencil"></i> Edit Secondary Template Page');
			});
		});
	</script>
	<style>
		.well {text-align: center; max-width: 600px; margin: auto;}
	</style>
</head>
<body>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li class="active"><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
				<li><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
				<li><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
	<div class="container-fluid">
		<div class="row-fluid">
			<div class="well">
			<?php
				// Query to see if Primary/Secondary templates exist otherwise option to create
				$primaryTemplate = getPageFromCourse($courseID, "primary-template");
				if (isset($primaryTemplate->message) && $primaryTemplate->message == 'page not found') {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/primary-template" target="_blank" class="btn btn-block btn-large primary"><i class="fa fa-plus-circle"></i> Add Primary Template Page</a>';
				} elseif (isset($primaryTemplate->created_at)) {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/primary-template" target="_blank" class="btn btn-primary btn-block btn-large"><i class="fa fa-pencil"></i> Edit Primary Template Page</a>';
				}
				echo '<p>This is a page that you can customize for the primary information page within a module.</p>';
				$secondaryTemplate = getPageFromCourse($courseID, "secondary-template");
				if (isset($secondaryTemplate->message) && $secondaryTemplate->message == 'page not found') {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/secondary-template" target="_blank" class="btn btn-block btn-large secondary"><i class="fa fa-plus-circle"></i> Add Secondary Template Page</a>';
				} elseif (isset($secondaryTemplate->created_at)) {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/secondary-template" target="_blank" class="btn btn-primary btn-block btn-large"><i class="fa fa-pencil"></i> Edit Secondary Template Page</a>';
				}
				echo '<p>This template page can be customized and applied multiple times within a module.</p>';
			?>
				<h3>How to Use</h3>
				<ol style="text-align:left">
					<li>Click the link for the template you would like to create/edit. <em>(links will open in a new window/tab)</em></li>
					<li>Use the &ldquo;Custom Tools&rdquo; to customize the template page.</li>
					<li>Return to this wizard and choose the &ldquo;Modules&rdquo; link. This will allow you to setup a pattern and create the necessary modules.</li>
				</ol>
			</div>
		</div>
	</div>
</body>
</html>