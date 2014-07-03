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
<?php 
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	session_start();
	require_once (__DIR__.'/../config.php');
	require_once 'resources/wizardAPI.php';
?>
<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>Template Wizard</title>
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
	</script>
	<style>
		.well {text-align: center; max-width: 600px; margin: auto;}
	</style>
</head>
<body>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li><a href="resources/wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
				<li><a href="resources/wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
				<li><a href="resources/wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
	<div class="container-fluid">
		<div class="row-fluid">
			<h2 style="text-align:center;">
				<?php 
					$course = getCourse($_SESSION['courseID']);
					if (isset($course->name)){
						$_SESSION['courseName'] = $course->name;
						$generateToken = false;
					}
					if (isset($_SESSION['courseName'])) {
						echo $_SESSION['courseName']; 
					} 
				?>
		</h2>
			<div class="well">
				<a href="resources/wizard_pages.php" class="btn btn-primary btn-block btn-large">Page Templates</a>
				<a href="resources/wizard_modules.php" class="btn btn-primary btn-block btn-large">Modules</a>
				<a href="resources/wizard_image_crop.php?task=selectImage" class="btn btn-primary btn-block btn-large">Front Page Banner Image</a>
			</div>
		</div>
	</div>
</body>
</html>