<?php
session_start();
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
	<title>Template Wizard - Modules</title>
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/main.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" language="javascript" src="js/modules.js"></script>
	<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
	<script type="text/javascript" charset="utf-8">
		<?php
		// See if "Home" page exists and check the front page box accordingly
		$hasHomePage = false;
		$homePage = getPageFromCourse($courseID, "home");
		if(isset($homePage->created_at)){
			if($homePage->created_at !== ''){
				$hasHomePage = true;
			}
		}
		// Query to see if Primary/Secondary templates exist otherwise option to create
		$primaryTemplate = getPageFromCourse($courseID, "primary-template");
		if(isset($primaryTemplate->created_at)){
			if($primaryTemplate->created_at !== ''){
				$primaryTemplate = 'true';
			}
		} else {
			$primaryTemplate = 'false';
		}
		$secondaryTemplate = getPageFromCourse($courseID, "secondary-template");
		if(isset($secondaryTemplate->created_at)){
			if($secondaryTemplate->created_at !== ''){
				$secondaryTemplate = 'true';
			}
		} else {
			$secondaryTemplate = 'false';
		}
		echo '	
		var primaryTemplate = '.$primaryTemplate.',
		secondaryTemplate = '.$secondaryTemplate.',
		courseID = '.$courseID.',
		canvasURL = "'.$_SESSION["canvasURL"].'";';
		?>
	</script>
</head>
<body>
	<h2><i class="fa fa-sitemap"></i> Modules <small><i class="fa fa-magic"></i> Wizard Tools</small></h2>
	<nav class="navbar navbar-default">
		<ul class="nav navbar-nav">
			<li><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
			<li class="active"><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
			<li><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Images</a></li>
		</ul>
	</nav>
	<div class="container-fluid">
		<div class="row-fluid">
			<form id="moduleForm">
				<?php
					if($hasHomePage == false) {
						echo '<div class="row-fluid">
							<div class="well">
								<h3>Front Page</h3>
								<a href="#" class="btn btn-default addFrontPage"><i class="fa fa-plus"></i> Create Front Page</a><br>
								<em>This will create a page titled &ldquo;Home&rdquo;, publish it and mark it as the Front Page.<br>You will still need to set your &ldquo;Home&rdquo; link to show your Front Page.</em>
							</div>
						</div>';
					}
				?>
				<div class="row-fluid">
					<h3 class="customizeHeader" style="display:none;">Customize Modules</h3>
					<?php
						// Identify existing modules
						$existingModules = false;
						$modules = listModules($courseID);
						if(isset($modules[0]->id)){
							$existingModules = true;
						}
						if($existingModules) {
							echo '
							<!-- Nav tabs -->
							<ul class="nav nav-pills" role="tablist" style="margin-bottom:20px;">
							  	<li class="active"><a href="#existingModules" role="tab" data-toggle="tab">Update Exisiting Modules</a></li>
							  	<li><a href="#newModules" role="tab" data-toggle="tab">Add New Modules</a></li>
							</ul>

							<!-- Tab panes -->
							<div class="tab-content">
								<div class="tab-pane active" id="existingModules">
									<div class="panel-group" id="existingModulesAccordion">
										<div class="well well-sm">
											<p><em>Click on a module below to add template pages and/or assignment shells to that module.</em></p>
											<p><em>Click the button in the module details to update an individual module or update all through the button at the bottom of the page.</em></p>
										</div>
										<div class="btn-group" style="margin-bottom: 20px;">
											<button class="btn btn-default btn-sm expandExisting">Expand All</button>
											<button class="btn btn-default btn-sm collapseExisting">Collapse All</button>
										</div>
									';
								
									
										
									
								foreach ($modules as $module) {
									echo '
										<div class="panel panel-default">
											<div class="panel-heading">
												<h4 class="panel-title">
													<a data-toggle="collapse" data-parent="#existingModulesAccordion" href="#collapse' . $module->id . '">
														' . $module->name . '
													</a>
												</h4>
											</div>
											<div id="collapse' . $module->id . '" class="panel-collapse collapse">
												<div class="panel-body">
													<div class="input-group">
														<div class="input-group-addon modTitlePref"><strong>Title:</strong></div>
														<input class="moduleTitleInput form-control" type="text" value="' . $module->name . '">
														<input type="hidden" name="moduleID" value="' . $module->id . '">
													</div>
													<div class="checkbox">
														<label class="primaryPage">
															<input type="checkbox" name="primaryPage" class="primaryPageInput" id="primaryPage' . $module->id . '">
															Primary Template Page
														</label>
													</div>
													<ul class="list-unstyled moduleOptions">
														<li class="secondaryPageSection">
															<div class="secondaryPageAddSection"></div>
															<div class="secondaryPageControls">
																<div class="btn-group">
																	<a href="#" class="btn btn-xs btn-default countDecrease" rel="#secondaryPageCount_' . $module->id . '"><i class="fa fa-minus"></i></a>
																	<a href="#" class="btn btn-xs btn-default countIncrease" rel="#secondaryPageCount_' . $module->id . '"><i class="fa fa-plus"></i></a>
																</div>
																<span id="secondaryPageCount_' . $module->id . '" class="countInput input-mini">0</span> Secondary Template Page
															</div>
														</li>
														<li>
															<div class="btn-group">
																<a href="#" class="btn btn-xs btn-default countDecrease" rel="#assignmentCount_' . $module->id . '"><i class="fa fa-minus"></i></a>
																<a href="#" class="btn btn-xs btn-default countIncrease" rel="#assignmentCount_' . $module->id . '"><i class="fa fa-plus"></i></a>
															</div>
															<span id="assignmentCount_' . $module->id . '" class="countInput input-mini">0</span> Assignments
														</li>
														<li>
															<div class="btn-group">
																<a href="#" class="btn btn-xs btn-default countDecrease" rel="#discussionCount_' . $module->id . '"><i class="fa fa-minus"></i></a>
																<a href="#" class="btn btn-xs btn-default countIncrease" rel="#discussionCount_' . $module->id . '"><i class="fa fa-plus"></i></a>
															</div>
															<span id="discussionCount_' . $module->id . '" class="countInput input-mini">0</span> Discussions
														</li>
														<li>
															<div class="btn-group">
																<a href="#" class="btn btn-xs btn-default countDecrease" rel="#quizCount_' . $module->id . '"><i class="fa fa-minus"></i></a>
																<a href="#" class="btn btn-xs btn-default countIncrease" rel="#quizCount_' . $module->id . '"><i class="fa fa-plus"></i></a>
															</div>
															<span id="quizCount_' . $module->id . '" class="countInput input-mini">0</span> Quizzes
														</li>
													</ul>
													<button class="btn btn-default updateModule" rel="' . $module->id . '"><i class="fa fa-plus-circle"></i> Update This Module</button>
												</div> <!-- End panel-body -->
											</div> <!-- End collapse -->
										</div> <!-- End panel -->
									';
								}
							echo '</div> <!-- End panel-group -->
								<a href="#" class="btn btn-primary updateAllExisting"><i class="fa fa-refresh"></i> Update All Modules</a>
							</div><!-- #END existingModules -->
						<div class="tab-pane" id="newModules">';
					}
				?>
					<div class="well">
						<a class="btn btn-info pull-right" data-toggle="modal" href="#modal-id"><i class="fa fa-question-circle"></i> Show Help</a>
						<h3>Module Pattern</h3>
						<div class="form-group">
							<label for="moduleCount" class="patternLabel">Number of Modules </label>
							<input type="text" class="form-control" id="moduleCount" placeholder="##" style="width: 45px; text-align: center; margin-right:20px;">
						</div>
						<div class="form-group">
							<label for="startNumbering" class="patternLabel">Start Numbering at </label>
							<input type="text" class="form-control" id="startNumbering" value="1" style="width: 45px; text-align: center; margin-right:20px;">
						</div>
						<div class="form-group">
							<label for="modulePrefix" class="patternLabel">Module Prefix </label>
							<select name="modulePrefix" id="modulePrefix" class="form-control" required="required" style="width: 115px; text-align: center;">
								<option value="Chapter">Chapter #:</option>
								<option value="Day">Day #:</option>
								<option value="Level">Level #:</option>
								<option value="Module" selected="selected">Module #:</option>
								<option value="Objective">Objective #:</option>
								<option value="Outcome">Outcome #:</option>
								<option value="Part">Part #:</option>
								<option value="Section">Section #:</option>
								<option value="Topic">Topic #:</option>
								<option value="Unit">Unit #:</option>
								<option value="Week">Week #:</option>
							</select>
						</div>
						<div class="checkbox">
							<label class="primaryPage">
								<input type="checkbox" name="primaryPage" class="primaryPageInput" id="primaryPage" checked>
								Primary Template Page
							</label>
						</div>
						<ul class="list-unstyled moduleOptions">
							<li class="secondaryPageSection">
								<div class="secondaryPageAddSection"></div>
								<div class="secondaryPageControls">
									<div class="btn-group">
										<a href="#" class="btn btn-xs btn-default countDecrease" rel="#secondaryPageCount"><i class="fa fa-minus"></i></a>
										<a href="#" class="btn btn-xs btn-default countIncrease" rel="#secondaryPageCount"><i class="fa fa-plus"></i></a>
									</div>
									<span id="secondaryPageCount" class="countInput input-mini">0</span> Secondary Template Page
								</div>
							</li>
							<li>
								<div class="btn-group">
									<a href="#" class="btn btn-xs btn-default countDecrease" rel="#assignmentCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-xs btn-default countIncrease" rel="#assignmentCount"><i class="fa fa-plus"></i></a>
								</div>
								<span id="assignmentCount" class="countInput input-mini">0</span> Assignments
							</li>
							<li>
								<div class="btn-group">
									<a href="#" class="btn btn-xs btn-default countDecrease" rel="#discussionCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-xs btn-default countIncrease" rel="#discussionCount"><i class="fa fa-plus"></i></a>
								</div>
								<span id="discussionCount" class="countInput input-mini">0</span> Discussions
							</li>
							<li>
								<div class="btn-group">
									<a href="#" class="btn btn-xs btn-default countDecrease" rel="#quizCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-xs btn-default countIncrease" rel="#quizCount"><i class="fa fa-plus"></i></a>
								</div>
								<span id="quizCount" class="countInput input-mini">0</span> Quizzes
							</li>
						</ul>
						<a href="#" class="btn btn-primary generateModuleList"><i class="fa fa-magic"></i> Generate Module List</a>
						<a href="#" class="btn btn-primary createModules" style="display:none;"><i class="fa fa-plus-circle"></i> Add Modules to Course</a>
					</div>
					<div id="moduleList" class="list-group"></div>
				<?php
					if($existingModules) {
						echo '</div>
						</div>
						';
					}
				?>
				<a href="#" class="btn btn-primary createModules" style="display:none;"><i class="fa fa-plus-circle"></i> Add Modules to Course</a>
			</div>
		</form>
	</div>
	<div class="modal fade" id="modal-id">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
					<h4 class="modal-title">Modules Help</h4>
				</div>
				<div class="modal-body">
					<ul>
						<li><strong>Number of Modules:</strong> The number of modules that will be created in your course.</li>
						<li><strong>Module Prefix:</strong> The created modules and primary template pages will include this prefix (i.e. "Module 1: Course Introduction").</li>
						<li><strong>Primary Template Page:</strong> If you have set up a primary template page, you can choose to add this page to each generated module.</li>
						<li><strong>Secondary Template Page:</strong> If you have set up a secondary template page, you can choose the number to be added to each moduel.</li>
						<li><strong>Assignments/Discussions/Quizzes:</strong> Set a pattern for how many of each item you would like created in your modules. Each module can be adjusted before it is created.</li>
					</ul>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
					<button type="button" class="btn btn-primary">Save changes</button>
				</div>
			</div><!-- /.modal-content -->
		</div><!-- /.modal-dialog -->
	</div><!-- /.modal -->
</body>
</html>
