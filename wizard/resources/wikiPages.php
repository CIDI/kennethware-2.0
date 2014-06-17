<?php
	session_start();
	if ($_SESSION['allowed']){
		$courseID = $_SESSION['courseID'];
	} else {
		echo "Sorry, you are not authorized to view this content or your session has expired. Please relaunch this tool from Canvas.";
		return false;
	}
	include 'wizardAPI.php';
	// echo 'CourseID: '.$_SESSION['courseID'].'<br>';
	// echo 'User: '.$_SESSION['userFullName'].' ('.$_SESSION['userID'].')<br>';
	// echo 'User Role: '.$_SESSION['roles'].'<br>';
	// echo 'Token: '.$_SESSION['token'].'<br>';
	?>
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>USU Template Wizard - Wiki Pages</title>
	<link rel="stylesheet" href="bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="bootstrap/css/bootstrap-responsive.min.css">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
		$(function() {
			$(".primary").click(function (e){
				$(this).addClass("btn-primary").html("Edit Primary Template Page");
			});
			$(".secondary").click(function (e){
				$(this).addClass("btn-primary").html("Edit Secondary Template Page");
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
				<li class="active"><a href="wikiPages.php">Wiki Page Templates</a></li>
				<li><a href="modules.php">Modules</a></li>
				<li><a href="imageCrop.php?task=selectImage">Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
	<div class="container-fluid">
		<div class="row-fluid">
			<div class="well">
			<?php
				// Query to see if Primary/Secondary templates exist otherwise option to create
				$primaryTemplateExists = getPageFromCourse($courseID, "primary-template");
				// echo $primaryTemplateExists;
				$workingList = json_decode($primaryTemplateExists,true);
				if(isset($workingList['created_at'])){
					if($workingList['created_at'] !== ''){
						echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/primary-template" target="_blank" class="btn btn-primary btn-block btn-large">Edit Primary Template Page</a>';
					}
				} else {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/primary-template" target="_blank" class="btn btn-block btn-large primary">Add Primary Template Page</a>';
				}
				echo '<p>This is a page that you can customize for the primary information page within a module.</p>';
				$secondaryTemplateExists = getPageFromCourse($courseID, "secondary-template");
				// echo $secondaryTemplateExists;
				$workingList2 = json_decode($secondaryTemplateExists,true);
				if(isset($workingList2['created_at'])){
					if($workingList2['created_at'] !== ''){
						echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/secondary-template" target="_blank" class="btn btn-primary btn-block btn-large">Edit Secondary Template Page</a>';
					}
				} else {
					echo '<a href="'.$_SESSION['canvasURL'].'/courses/'.$courseID.'/wiki/secondary-template" target="_blank" class="btn btn-block btn-large secondary">Add Secondary Template Page</a>';
				}
				echo '<p>This template page can be customized and applied multiple times within a module.</p>';
			?>
				<h3>How to Use</h3>
				<ol style="text-align:left">
					<li>Click the link for the template you would like to create/edit. <em>(links will open in a new window/tab)</em></li>
					<li>Use the &ldquo;USU Tools&rdquo; to customize the template page.</li>
					<li>Return to this wizard and choose the &ldquo;Modules&rdquo; link. This will allow you to setup a pattern and create the necessary modules.</li>
				</ol>
			</div>
		</div>
	</div>
</body>
</html>