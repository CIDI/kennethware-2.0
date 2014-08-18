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
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" charset="utf-8">
		$(function() {
			<?php
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
			if(primaryTemplate === false){
				$("#primaryPage").prop("checked", false).prop("disabled", true)
				$(".primaryPage").append('<span class="addPrimaryWrapper"> (<a href="' + canvasURL + '/courses/' + courseID + '/wiki/primary-template" class="addPrimaryTemplate" target="_blank">Add</a>)</span>');
			}
			$('.addPrimaryTemplate').click(function () {
				$("#primaryPage").prop("checked", true).prop("disabled", false);
				$('.addPrimaryWrapper').remove();
			});
			var	secondaryPageControls = '';
			if(secondaryTemplate === false){
				$('.secondaryPageControls').hide();
				$(".secondaryPageAddSection").html('No Secondary Template Page (<a href="' + canvasURL + '/courses/' + courseID + '/wiki/secondary-template" class="addSecondaryTemplate" target="_blank">Add</a>)'); 
			} else {
				$('.secondaryPageControls').show();
				$('.secondaryPageAddSection').hide();
			}
			$('.addSecondaryTemplate').click(function () {
				$('.secondaryPageControls').show();
				$('.secondaryPageAddSection').hide();
			});
			console.log("Primary: "+primaryTemplate);
			console.log("Secondary: "+secondaryTemplate);
			$("#moduleCount").focus();
			function countControls(){
				$(".countIncrease").click(function (e){
					e.preventDefault();
					var connectedInput = $(this).attr("rel");
					// var connectedInput = "#assignmentCount";
					var currentNum = parseInt($(connectedInput).text());
					var newNum = currentNum+1;
					if(currentNum < 5){
						$(connectedInput).text(newNum);
					}
				});
				$(".countDecrease").click(function (e){
					e.preventDefault();
					var connectedInput = $(this).attr("rel");
					// var connectedInput = "#assignmentCount";
					var currentNum = parseInt($(connectedInput).text());
					var newNum = currentNum-1;
					if(currentNum > 0){
						$(connectedInput).text(newNum);
					}
				});
			}
			countControls();
			$('.showHelp').click(function (e){
				e.preventDefault();
				$('.helpText').slideToggle(function () {
					if ($('.helpText').is(':visible')) {
						$('.showHelp').html('<i class="fa fa-question-circle"></i> Hide Help');
					} else {
						$('.showHelp').html('<i class="fa fa-question-circle"></i> Show Help');
					}
				});
			})
			$("#moduleCount").keydown(function(event) {
		        // Allow: backspace, delete, tab, escape, enter and .
		        if ( $.inArray(event.keyCode,[46,8,9,27,13,190]) !== -1 ||
		             // Allow: Ctrl+A
		            (event.keyCode == 65 && event.ctrlKey === true) || 
		             // Allow: home, end, left, right
		            (event.keyCode >= 35 && event.keyCode <= 39)) {
		                 // let it happen, don't do anything
		                 return;
		        }
		        else {
		            // Ensure that it is a number and stop the keypress
		            if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {
		                event.preventDefault(); 
		            }   
		        }
		    });
			$("#moduleCount").keyup(function (){
				var moduleCount = parseInt($(this).val());
				if (moduleCount > 20 ){
					$(".moduleCountMessage").html('<span class="alert">That is too many modules!</span>');
					$(this).val('20');
				} else {
					$(".moduleCountMessage").html("");
				}
			});
			$(".createModules").click(function (e){
				e.preventDefault();
				if ($('#frontPage').is(":checked")){
					$('.createModules').after('<a href="' + canvasURL + '/courses/' + courseID + '/wiki/Home" class="btn btn-primary" style="margin-left: 5px;" target="_blank">Edit Front Page <i class="fa fa-external-link"></i></a>');
				}
				$(".contentModule").each(function(){
					var modNum = $(this).find(".modNum").text();
					var moduleTitlePrefix = $(this).find(".moduleTitlePrefix").text();
					var moduleTitle = $(this).find(".moduleTitleInput").val();
					var primaryPage = false;
					if($("#primaryPage").is(":checked")){
						primaryPage = true;
					}
					var secondaryPageCount = $(this).find(".secondaryPageCount").text();
					var assignmentCount = $(this).find(".assignmentCount").text();
					var discussionCount = $(this).find(".discussionCount").text();
					var quizCount = $(this).find(".quizCount").text();

					$(this).find(".moduleDetails").val(modNum+ " || "+moduleTitlePrefix+" || "+ moduleTitle+ " || "+primaryPage+ " || "+secondaryPageCount+ " || "+assignmentCount+ " || "+discussionCount+ " || "+quizCount) 
					// Provide visual feedback that something is happening

				});
				$(".createModules").html('<i class="fa fa-spinner fa fa-spin fa fa-large"></i> Adding Modules').addClass("disabled");
				// in order for the icon above to display, there needs to be a slight delay
				setTimeout(function(){
					$("#moduleForm").submit();
				}, 5);
			});
			$(".generateModuleList").click(function (e){
				e.preventDefault();
				$("#moduleList").html("");
				var moduleCount = $("#moduleCount").val();
				if(moduleCount == ""){
					alert("Please input the number of modules you wish to create.");
					$("#moduleCount").focus();
				} else {
					$(".createModules").show();
					$(this).removeClass("btn-primary").html('<i class="fa fa-refresh"></i> Re-Generate Module List');
					$(".customizeHeader").show();
					var moduleNum = 1;
					if ($("#startHereModule").is(":checked")){
						$(".startHereModNum").text(moduleNum);
						moduleNum++;
						$("#startHere").show();
					} else {
						$("#startHere").hide();
					}
					if ($("#academicIntegrityModule").is(":checked")){
						$(".academicIntegrityModNum").text(moduleNum);
						moduleNum++;
						$("#academicIntegrity").show();
					} else {
						$("#academicIntegrity").hide();
					}
					var modulePrefix = $("#modulePrefix").find(":selected").val();
					var primaryPage = "";
					if ($("#primaryPage").is(":checked")){
						primaryPage = '<label class="primaryPage">'
								+ '<input type="checkbox" name="primaryPage" class="primaryPage" checked>'
								+ ' Primary Template Page'
							+ '</label>';
					}
					var assignmentCount = $("#assignmentCount").text();
					var discussionCount = $("#discussionCount").text();
					var quizCount = $("#quizCount").text();
					for(var i = 1; i<= moduleCount; i++){
						var secondaryPageSection = "";
						if(secondaryTemplate == true){
							var secondaryPageCount = $("#secondaryPageCount").text();
							secondaryPageSection = '<li class="wide">'
										+ '<div class="btn-group">'
											+ '<a href="#" class="btn btn-mini countDecrease" rel="#mod'+i+' .secondaryPageCount"><i class="fa fa-minus"></i></a>'
											+ '<a href="#" class="btn btn-mini countIncrease" rel="#mod'+i+' .secondaryPageCount"><i class="fa fa-plus"></i></a>'
										+ '</div>'
											+ '<span class="countInput input-mini secondaryPageCount">'+ secondaryPageCount +'</span> Secondary Template Page'
									+ '</li>';
						}
						$('#moduleList').append('<div id="mod'+i+'" class="well module contentModule">'
							+ '<div class="input-prepend">'
								+ '<span class="add-on modTitlePref"><strong>Module <span class="modNum">'+ moduleNum +'</span> Title:</strong></span>'
								+ '<input class="moduleTitleInput" type="text" value="'+modulePrefix+' '+i+': ">'
								+ '<span class="moduleTitlePrefix hide">'+modulePrefix+' '+i+':</span>'
							+ '</div>'
							+ primaryPage
							+ '<ul class="unstyled indModuleOptions">'
								+ secondaryPageSection
								+ '<li>'
									+ '<div class="btn-group">'
										+ '<a href="#" class="btn btn-mini countDecrease" rel="#mod'+i+' .assignmentCount"><i class="fa fa-minus"></i></a>'
										+ '<a href="#" class="btn btn-mini countIncrease" rel="#mod'+i+' .assignmentCount"><i class="fa fa-plus"></i></a>'
									+ '</div>'
										+ '<span class="countInput input-mini assignmentCount">'+ assignmentCount +'</span> Assignments'
								+ '</li>'
								+ '<li class="wide">'
									+ '<div class="btn-group">'
										+ '<a href="#" class="btn btn-mini countDecrease" rel="#mod'+i+' .discussionCount"><i class="fa fa-minus"></i></a>'
										+ '<a href="#" class="btn btn-mini countIncrease" rel="#mod'+i+' .discussionCount"><i class="fa fa-plus"></i></a>'
									+ '</div>'
										+ '<span class="countInput input-mini discussionCount">'+ discussionCount +'</span> Discussions'
								+ '</li>'
								+ '<li>'
									+ '<div class="btn-group">'
										+ '<a href="#" class="btn btn-mini countDecrease" rel="#mod'+i+' .quizCount"><i class="fa fa-minus"></i></a>'
										+ '<a href="#" class="btn btn-mini countIncrease" rel="#mod'+i+' .quizCount"><i class="fa fa-plus"></i></a>'
									+ '</div>'
										+ '<span class="countInput input-mini quizCount">'+ quizCount +'</span> Quizzes'
								+ '</li>'
							+ '</ul>'
							+ '<input type="hidden" name="moduleDetails[]" class="moduleDetails">'
						+ '</div>');
						moduleNum++;
					}
					countControls();
				}
			});
		});
	</script>
	<style>
		h2 {
			font-size: 18px;
			margin: 0 0 5px;
		}
		input[type="checkbox"] { margin-top: -3px;}
		.countInput {
			padding: 1px 8px;
			font-weight: bold;
		}
		.helpText {
			font-size: 12px;
		}
		.mr5 {
			margin-right: 5px;
		}
		.moduleDetails {
			margin-left: 20px;
			font-size: 12px;
			font-style: italic;
		}
		.moduleOptions li {
			float: left;
		}
		.indModuleOptions li {
			float: left;
			margin-right: 20px;
		}
		.moduleOptions li.wide {
			width: 295px;
		}
		.moduleTitle {
			border-bottom: 1px dotted #aaaaaa;
			font-size: 16px;
			line-height: 16px;
			margin: 0 0 10px;
			padding: 6px;
		}
		.moduleTitleInput {
			width: 700px;
		}
		.well {
			overflow: hidden;
		}
		.well.module {
			padding: 10px;
			margin: 10px 0;
		}
	</style>
</head>
<body>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
				<li class="active"><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
				<li><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Front Page Banner Image</a></li>
			</ul>
			<a href="#" class="btn btn-mini fillOut pull-right hide">Fill Out Test</a>
		</div>
	</div>
	<div class="container-fluid">
		<form action="wizard_create_modules.php" id="moduleForm" method="post">
			<div class="row-fluid">
				<div class="span8">
					<div class="well">
						<label class="frontPage">
							<input type="checkbox" name="frontPage" id="frontPage" checked>
							<strong>Create Front Page</strong>
						</label>
						<em>This will create a page titled &ldquo;Home&rdquo;, publish it and mark it as the Front Page.<br>You will still need to set your &ldquo;Home&rdquo; link to show your Front Page.</em>
					</div>
					<div class="well">
						<h2>Module Pattern</h2>
						<label style="float:left;margin-right:30px;"><strong>Number of Modules</strong><br>
							<input type="text" name="moduleCount" id="moduleCount" class="input-mini" maxlength="2">
							<span class="moduleCountMessage"></span>
						</label>
						<label><strong>Module Prefix</strong><br>
							<select id="modulePrefix">
								<option value="Module">Module #:</option>
								<option value="Unit">Unit #:</option>
								<option value="Week">Week #:</option>
								<option value="Section">Section #:</option>
								<option value="Chapter">Chapter #:</option>
								<option value="Part">Part #:</option>
								<option value="Day">Day #:</option>
								<option value="Topic">Topic #:</option>
								<option value="Objective">Objective #:</option>
								<option value="Outcome">Outcome #:</option>
							</select>
						</label>
						<label class="primaryPage">
							<input type="checkbox" name="primaryPage" id="primaryPage" checked>
							Primary Template Page
						</label>
						<ul class="unstyled moduleOptions">
							<li class="wide secondaryPageSection">
								<div class="secondaryPageAddSection"></div>
								<div class="secondaryPageControls">
									<div class="btn-group">
										<a href="#" class="btn btn-mini countDecrease" rel="#secondaryPageCount"><i class="fa fa-minus"></i></a>
										<a href="#" class="btn btn-mini countIncrease" rel="#secondaryPageCount"><i class="fa fa-plus"></i></a>
									</div>
									<span id="secondaryPageCount" class="countInput input-mini">0</span> Secondary Template Page
								</div>
							</li>
							<li>
								<div class="btn-group">
									<a href="#" class="btn btn-mini countDecrease" rel="#assignmentCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-mini countIncrease" rel="#assignmentCount"><i class="fa fa-plus"></i></a>
								</div>
									<span id="assignmentCount" class="countInput input-mini">0</span> Assignments
							</li>
							<li class="wide">
								<div class="btn-group">
									<a href="#" class="btn btn-mini countDecrease" rel="#discussionCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-mini countIncrease" rel="#discussionCount"><i class="fa fa-plus"></i></a>
								</div>
									<span id="discussionCount" class="countInput input-mini">0</span> Discussions
							</li>
							<li>
								<div class="btn-group">
									<a href="#" class="btn btn-mini countDecrease" rel="#quizCount"><i class="fa fa-minus"></i></a>
									<a href="#" class="btn btn-mini countIncrease" rel="#quizCount"><i class="fa fa-plus"></i></a>
								</div>
									<span id="quizCount" class="countInput input-mini">0</span> Quizzes
							</li>
						</ul>
					</div>
				</div>
				<div class="span4">
					<a href="#" class="btn showHelp"><i class="fa fa-question-circle"></i> Show Help</a>
					<ul class="helpText" style="display:none;">
						<li><strong>Number of Modules:</strong> The number of modules that will be created in your course.</li>
						<li><strong>Module Prefix:</strong> The created modules and primary template pages will include this prefix (i.e. "Module 1: Course Introduction").</li>
						<li><strong>Primary Template Page:</strong> If you have set up a primary template page, you can choose to add this page to each generated module.</li>
						<li><strong>Secondary Template Page:</strong> If you have set up a secondary template page, you can choose the number to be added to each moduel.</li>
						<li><strong>Assignments/Discussions/Quizzes:</strong> Set a pattern for how many of each item you would like created in your modules. Each module can be adjusted before it is created.</li>
					</ul>
				</div>
			</div>
			<div class="row-fluid">
				<a href="#" class="btn btn-primary generateModuleList"><i class="fa fa-magic"></i> Generate Module List</a>
				<a href="#" class="btn btn-primary createModules" style="display:none;"><i class="fa fa-plus-circle"></i> Add Modules to Course</a>
				<h2 class="customizeHeader" style="display:none;">Customize Modules</h2>
				<div id="startHere" class="well module" style="display:none;">
					<div class="input-prepend">
						<span class="add-on"><strong>Module <span class="startHereModNum">1</span> Title:</strong></span>
						<input class="moduleTitleInput uneditable-input" disabled id="prependedInput" type="text" value="Start Here">
					</div>
					<p class="moduleDetails"><strong>Pages:</strong> &ldquo;Start Here&rdquo; &amp; &ldquo;Additional Resources&rdquo;</p>
				</div>
				<div id="moduleList"></div>
				<a href="#" class="btn btn-primary createModules" style="display:none;"><i class="fa fa-plus-circle"></i> Add Modules to Course</a>
				<a href=
			</div>
		</form>
	</div>
</body>
</html>