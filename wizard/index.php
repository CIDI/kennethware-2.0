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
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="resources/css/main.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
</head>
<body>
	<nav class="navbar navbar-default">
		<ul class="nav navbar-nav">
			<li><a href="resources/wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
			<li><a href="resources/wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
			<li><a href="resources/wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Images</a></li>
		</ul>
	</nav>
	<h2 class="text-center">
		<i class="fa fa-magic"></i> Wizard Tools: 
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
	<div class="container-fluid">
		<div class="row-fluid">
			<div class="col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xs-offset-1 col-sm-offset-1 col-md-offset-1 col-lg-offset-1">
				<p class="lead"> The following tools were designed to help you rapidly build your course shell: </p>
				<div class="list-group">
					<div class="list-group-item">
						<h4 class="list-group-item-heading"><i class="fa fa-files-o"></i> Page Templates</h4>
						<div class="list-group-item-text">
							<p>Create Primary and Secondary content page templates that can be applied to each module</p>
							<a href="resources/wizard_pages.php" class="btn btn-primary"><i class="fa fa-files-o"></i> Create/Edit Page Templates</a>
						</div>
					</div>
					<div class="list-group-item">
						<h4 class="list-group-item-heading"><i class="fa fa-sitemap"></i> Modules</h4>
						<div class="list-group-item-text">
							<ul>
								<li>Create new modules or add to existing modules</li>
								<li>Add template pages</li>
								<li>Add shells for assignments, quizzes and discussions</li>
							</ul>
							<a href="resources/wizard_modules.php" class="btn btn-primary"><i class="fa fa-sitemap"></i> Work with Modules</a> 
						</div>
					</div>
					<div class="list-group-item">
						<h4 class="list-group-item-heading"><i class="fa fa-picture-o"></i> Images</h4>
						<div class="list-group-item-text">
							<ul>
								<li>Upload image</li>
								<li>Crop image</li>
								<li>Send image to course files</li>
							</ul>
							<a href="resources/wizard_image_crop.php?task=selectImage" class="btn btn-primary"><i class="fa fa-picture-o"></i> Work with Images</a> 
						</div>
					</div>
				</div>
				<div class="well hide">
					<a href="resources/wizard_pages.php" class="btn btn-primary btn-block btn-large">Page Templates</a>
					<a href="resources/wizard_modules.php" class="btn btn-primary btn-block btn-large">Modules</a>
					<a href="resources/wizard_image_crop.php?task=selectImage" class="btn btn-primary btn-block btn-large">Front Page Banner Image</a>
				</div>
			</div>
		</div>
	</div>
</body>
</html>