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
	<title>USU Template Wizard - pages Pages</title>
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/main.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
		$(function() {
			$(".primary").click(function (e){
				$(this).removeClass("btn-primary").addClass('btn-default').html('<i class="fa fa-pencil"></i> Edit Primary Template Page');
			});
			$(".secondary").click(function (e){
				$(this).removeClass("btn-primary").addClass('btn-default').html('<i class="fa fa-pencil"></i> Edit Secondary Template Page');
			});
		});
	</script>
</head>
<body>
	<h2><i class="fa fa-files-o"></i> Page Templates <small><i class="fa fa-magic"></i> Wizard Tools</small></h2>
	<nav class="navbar navbar-default">
		<ul class="nav navbar-nav">
			<li class="active"><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
			<li><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
			<li><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Images</a></li>
		</ul>
	</nav>
	<div class="container-fluid">
		<div class="row-fluid">
			<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10">
				<div class="list-group">
			  		<?php 
						$primaryTemplate = getPageFromCourse($courseID, "primary-template");
						if (isset($primaryTemplate->message) && $primaryTemplate->message == 'page not found') {
							$primaryText = '<i class="fa fa-plus-circle"></i> Create Primary Template Page';
							$primaryBtnState = 'primary';
						} elseif (isset($primaryTemplate->created_at)) {
							$primaryText = '<i class="fa fa-pencil"></i> Edit Primary Template Page';
							$primaryBtnState = 'default';
						}
			  			echo '<div class="list-group-item">
			  				<h4 class="list-group-item-heading">Primary Template Page</h4>
			  				<div class="list-group-item-text">
			  					<p>Customize this page to provide an introduction or overview to a module.</p>
			  					<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/pages/primary-template" class="btn btn-default btn-'.$primaryBtnState.' primary" target="_blank">'.$primaryText.'</a>
			  				</div>
			  			</div>';
			  		?>
			  		<?php 
						$secondaryTemplate = getPageFromCourse($courseID, "secondary-template");
						if (isset($secondaryTemplate->message) && $secondaryTemplate->message == 'page not found') {
							$secondaryText = '<i class="fa fa-plus-circle"></i> Create Secondary Template Page';
							$secondaryBtnState = 'primary';
						} elseif (isset($secondaryTemplate->created_at)) {
							$secondaryText = '<i class="fa fa-pencil"></i> Edit Secondary Template Page';
							$secondaryBtnState = 'default';
						}
						echo '<div class="list-group-item">
			  				<h4 class="list-group-item-heading">Secondary Template Page</h4>
			  				<div class="list-group-item-text">
			  					<p>This template page can be customized and applied multiple times within a module.</p>
			  					<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/pages/secondary-template" class="btn btn-default btn-'.$secondaryBtnState.' secondary" target="_blank">'.$secondaryText.'</a>
			  				</div>
			  			</div>';
			  		?>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
							<h3 class="panel-title">How to Use</h3>
					</div>
					<div class="panel-body">
						<ol style="text-align:left">
							<li>Click the link for the template you would like to create/edit. <em>(links will open in a new window/tab)</em></li>
							<li>Use the &ldquo;Custom Tools&rdquo; to customize the template page.</li>
							<li>Return to this wizard and choose the &ldquo;Modules&rdquo; link. This will allow you to setup a pattern and create the necessary modules.</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>