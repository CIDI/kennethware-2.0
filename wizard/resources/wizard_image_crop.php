<?php
	session_start();
	if ($_SESSION['allowed']){
		$courseID = $_SESSION['courseID'];
	} else {
		echo 'Sorry, you are not authorized to view this content or your session has expired. Please relaunch this tool from Canvas.';
		exit;
	}
	// Display any php errors (for development purposes)
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	require_once (__DIR__.'/../../config.php');
	// Include API Calls
	require_once 'wizardAPI.php';

?>


<!DOCTYPE html>
<head>
	<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
	<title>Template Wizard - Image Crop</title>
	<script type="text/javascript" language="javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js"></script>
	<script type="text/javascript" language="javascript" src="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
	<script src="js/jquery.Jcrop.min.js"></script>
	<script src="js/imageCrop.js"></script>
	<link rel="stylesheet" href="css/jquery.Jcrop.css" type="text/css" />
	<!-- <link rel="stylesheet" href="css/imageCropStyles.css" type="text/css" /> -->
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/main.css" type="text/css" />
</head>
<body>
	<nav class="navbar navbar-default">
		<ul class="nav navbar-nav">
			<li><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
			<li><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
			<li class="active"><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Images</a></li>
		</ul>
	</nav>
	<div class="container-fluid">
	<?php
		if(isset($_GET['task'])){
			$task = $_GET['task'];
		} else if (isset($_POST['task'])) {
			$task = $_POST['task'];
		}
		switch($task) {
			case 'selectImage':
			selectImage();
			break;

			case 'uploadTempImage':
			uploadTempImage($courseID);
			break;

			case 'cropImage':
			cropImage($courseID);
			break;

		}
		function selectImage(){
			// TEMPLATE ARRAY (templateName, minWidth,minHeight, ratioWidth,ratioHeight)
			$templates = $GLOBALS['templates'];
			echo '<div>
				<h2><i class="fa fa-picture-o"></i> Select An Image</h2>
				<div class="row-fluid">
				<div class="well well-sm">
					<form action="wizard_image_crop.php" id="imageForm" class="form-horizontal" method="post" enctype="multipart/form-data">
						<label for="file" class="col-xs-2">Select a file:</label>
						<div class="col-xs-10">
							<input type="file" name="file" id="file"><br>
							<p style="font-size:14px;"><em><strong>Note:</strong> Image can be either a jpg or png.</em></p>
						</div>
						<input type="hidden" name="task" id="task" value="uploadTempImage">
						<input type="submit" name="submit" class="btn" id="formSubmit" value="Upload Image" style="display:none;">
					</form>
				</div>
				<div class="panel panel-default">
					<div class="panel-heading">
						<h3 class="panel-title">What is This?</h3>
					</div>
					<div class="panel-body">
						<p>This tool will allow you to crop and resize an image and uploaded it to your course files.</p>
						<p>This tool includes image aspect ratios related to the front page themes that can be created by the Canvas Custom Tools.</p>';
						for ($row=0; $row < count($templates); $row++) { 
			  					$templateName = $templates[$row][0];
			  					echo '<div class="col-xs-2"><div class="thumbnail"><img src="../../images/template_thumbs/'.$templateName.'.png"></div></div>';
			  				}
					echo '</div>
				</div>
				<script language="javascript">
					$(function(){
						$("#file").on("change", function(){ $("#formSubmit").trigger("click"); });
					});
				</script>
			';
		};
		function uploadTempImage($courseID){
			// UPLOADING IMAGE
			$allowedExts = array("jpeg", "jpg", "JPG", "png");
			$temp = explode(".", $_FILES["file"]["name"]);
			$extension = end($temp);
			$showAlert = false;
			if ((($_FILES["file"]["type"] == "image/jpeg")
			|| ($_FILES["file"]["type"] == "image/jpg")
			|| ($_FILES["file"]["type"] == "image/pjpeg")
			|| ($_FILES["file"]["type"] == "image/x-png")
			|| ($_FILES["file"]["type"] == "image/png"))
			// && ($_FILES["file"]["size"] < 20000)
			&& in_array($extension, $allowedExts)) {
			  	if ($_FILES["file"]["error"] > 0) {
			    	echo 'Return Code: ' . $_FILES["file"]["error"] . '<br>';
			    } else {
			    	if($extension === "png"){
				    	function png2jpg($originalFile, $outputFile, $quality) {
						    $image = imagecreatefrompng($originalFile);
						    imagejpeg($image, $outputFile, $quality);
						    imagedestroy($image);
						}
						$originalFile = "images/" . $courseID.".".$extension;
						$outputFile = "images/".$courseID.".jpg";
						$quality = "95";
						png2jpg($originalFile, $outputFile, $quality);
			    	}
					move_uploaded_file($_FILES["file"]["tmp_name"],
					"images/" . $courseID.".".$extension);
					
					$size = getimagesize("images/".$courseID.".jpg");
					$imageWidth = $size[0];
					$imageHeight = $size[1];
					// TEMPLATE ARRAY (templateName, minWidth,minHeight, ratioWidth,ratioHeight)
					$templates = $GLOBALS['templates'];
					// RATIO ARRAY (ratioX, ratioY)
					$ratios = $GLOBALS['ratios'];

					echo "<script>
						$(window).load(function(){

						    var jcrop_api;
						    var i, ac;
						    var originalWidth = " . $imageWidth . ",
						        originalHeight = " . $imageHeight . ",
						        aspectRatio = 0,
						        displayHeight = 0,
						        displayWidth = 0;

						    initJcrop();

						    function initJcrop()//{{{
						        {
						            $('#cropbox').Jcrop({
						                onSelect: updateCoords,
						                boxWidth: 630, 
						                boxHeight: 500
						            }, function() {
						                jcrop_api = this;
						            });
						            // jcrop_api = $.Jcrop('#cropbox');

						            $('#can_click,#can_move,#can_size')
						            .attr('checked','checked');

						            $('#ar_lock,#size_lock,#bg_swap').attr('checked',false);

						        }
						    //}}}


						    // A handler to kill the action
						    // Probably not necessary, but I like it
						    function nothing(e) {
						        e.stopPropagation();
						        e.preventDefault();
						        return false;
						    }
						    function updateCoords(c) {
						        $('#x').val(c.x);
						        $('#y').val(c.y);
						        $('#w').val(c.w);
						        originalWidth = c.w;
						        $('#h').val(c.h);
						        originalHeight = c.h;
						        aspectRatio = c.w/c.h;
						        $('#formSubmit').removeClass('disabled');
						        if ($('.ratio').hasClass('active')) {
						            $('#targetWidth').val(Math.round(c.w));
						            $('#targetHeight').val(Math.round(c.h));
						        }
						    }
						    function checkSizes(ratioString) {
						        var ratio = ratioString.split('|'),
						            themeWidth = parseInt(ratio[0], 10),
						            themeHeight = parseInt(ratio[1], 10);
						            if (imageWidth > themeWidth && imageHeight > themeHeight) {
						                return true;
						            }
						    }
						    $('#targetWidth').focusout(function (e) {
						        var targetWidth = parseInt($(this).val(), 10),
						            targetHeight = targetWidth/aspectRatio;

						        if(targetWidth > displayWidth){
						            $('#targetHeight').val(Math.round(targetHeight));
						        } else {
						            $('#targetHeight').val(displayHeight);
						            $('#targetWidth').val(displayWidth);
						        }
						    });
						    $('#targetHeight').focusout(function (e) {
						        var targetHeight = parseInt($(this).val(), 10),
						            targetWidth = targetHeight*aspectRatio;
						        if(targetHeight > displayHeight){
						            $('#targetWidth').val(Math.round(targetWidth));
						        } else {
						            $('#targetHeight').val(displayHeight);
						            $('#targetWidth').val(displayWidth);
						        }
						    });
						    $('#cropForm').submit(function (e) {
						      if ($('#h').val() === '') {
						        alert('You must select an area to crop');
						        return;
						      }
						    });
						    $('.freeTransform').click(function (e) {
						        jcrop_api.setOptions({
						            aspectRatio: 0,
						            minSize: [ 0, 0 ]
						        });
						        jcrop_api.focus();
						        $('.btn.active').removeClass('active');
						        $(this).addClass('active');
						        $('#sizeRestriction').html('No Minimum Size');
						        displayHeight = 0;
						        displayWidth = 0;
						    });
					";
					// Output template functions		    	
					for ($row=0; $row < count($templates); $row++) { 
						$templateName = $templates[$row][0];
						$minWidth = $templates[$row][1];
						$minHeight = $templates[$row][2];
						$ratioX = $templates[$row][3];
						$ratioY = $templates[$row][4];
						if ($imageWidth > $minWidth && $imageHeight > $minHeight) {
							echo '
							    $(".'.$templateName.'").click(function (e) {
						        e.preventDefault();
						        jcrop_api.setOptions({ 
						            aspectRatio: '.$ratioX.'/'.$ratioY.',
						            minSize: ['.$minWidth.', '.$minHeight.']
						        });
						        jcrop_api.setSelect([ 50, 50, 100, 100 ]);
						        jcrop_api.focus();
						        $(".btn.active").removeClass("active");
						        $("#imageName").val("'.$templateName.'");
						        $(this).addClass("active");
						        $("#targetHeight").val('.$minHeight.');
						        $("#targetWidth").val('.$minWidth.');
						        $(".outputSize").hide();
						    });
							';
						} else {
							echo '$(".'.$templateName.'").addClass("disabled btn-danger").removeClass("btn-default");
							';
							$showAlert = true;
						}
					}
					// Output ratio functions
					for ($row=0; $row < count($ratios); $row++) { 
						$ratioX = $ratios[$row][0];
						$ratioY = $ratios[$row][1];
						echo '
					    $(".aspectRatio_'.$ratioX.'x'.$ratioY.'").click(function (e) {
					        e.preventDefault();
					        jcrop_api.setOptions({ aspectRatio: '.$ratioX.'/'.$ratioY.' });
					        jcrop_api.setSelect([ 50, 50, 350, 350 ]);
					        jcrop_api.focus();
					        $(".btn.active").removeClass("active");
					        $(".outputSize").show();
					        $(this).addClass("active");
					        $("#imageName").val("'.$temp[0].'_'.$ratioX.'x'.$ratioY.'");
					        displayHeight = 0;
					        displayWidth = 0;
					    });
						';
					}
					  echo '});
					</script>';
					echo '
						<h2><i class="fa fa-picture-o"></i> Crop your Image</h2>
						<div class="row-fluid">';
						if ($showAlert) {
							echo '
								<div class="alert alert-danger" style="margin-top: 20px;">
									<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
									<p><strong>Warning!</strong> Some themes have been disabled because image is too small.</p>
								</div>
							';
						}
						echo '<div id="imageWrapper">
								<img src="images/' . $courseID . '.jpg" id="cropbox"  />
							</div>
						<div id="themeSelect">
							<p><em>Themes/Ratios:</em></p>
							<ul id="themeList" class="list-unstyled">';
							for ($row=0; $row < count($templates); $row++) { 
			  					$templateName = $templates[$row][0];
			  					echo '<li><a href="#" class="'.$templateName.' btn btn-default btn-block template" ><img src="../../images/template_thumbs/'.$templateName.'.png"></a></li>';
			  				}
			  				for ($ratioRow=0; $ratioRow < count($ratios); $ratioRow++) { 
			  					$ratioX = $ratios[$ratioRow][0];
			  					$ratioY = $ratios[$ratioRow][1];
			  					echo '<li><a href="#" class="aspectRatio_'.$ratioX.'x'.$ratioY.' btn btn-default btn-block ratio">'.$ratioX.':'.$ratioY.'</a></li>';
			  				}
			  				echo '
								<li><a href="#" class="freeTransform btn btn-default btn-block ratio active">Free</a></li>
							</ul>
						</div>
						<form action="wizard_image_crop.php" method="post" onSubmit="return checkCoords();" id="cropForm">
							<input type="hidden" name="task" value="cropImage" />
							<input type="hidden" name="courseID" value="'.$courseID.'" />
							<input type="hidden" id="x" name="x" />
							<input type="hidden" id="y" name="y" />
							<input type="hidden" id="w" name="w" />
							<input type="hidden" id="h" name="h" />
							<div class="well well-sm imageFields">
								<div class="form-group">
									<label for="imageName">Image Name: </label>
									<input type="text" class="form-control" id="imageName" name="imageName" placeholder="Image Name" value="'.$temp[0].'" style="width: 200px;">
								</div>
								<div class="form-group outputSize">
									<label>Image Output Size: </label>
									<label for="targetWidth" class="sr-only">Target Width: </label>
									<input type="text" class="form-control" id="targetWidth" name="targetWidth" style="width: 60px;"> X 
									<label for="targetHeight" class="sr-only">Target Height: </label>
									<input type="text" class="form-control" id="targetHeight" name="targetHeight" style="width: 60px;">
								</div>
							</div>
							<a href="wizard_image_crop.php?task=selectImage" class="btn btn-default" style="margin-bottom:5px;"><i class="fa fa-chevron-circle-left"></i> Pick New Image</a>
							<button type="submit" id="formSubmit" class="btn btn-primary disabled"><i class="fa fa-plus-circle"></i> Add Image</button>
							<a class="btn btn-info" data-toggle="modal" href="#modal-id"><i class="fa fa-question-circle"></i> Help</a>
						</form>
						<div class="modal fade" id="modal-id">
							<div class="modal-dialog">
								<div class="modal-content">
									<div class="modal-header">
										<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
										<h4 class="modal-title">Image Crop Help</h4>
									</div>
									<div class="modal-body">
										<p>To crop and upload your image:</p>
										<ol>
											<li>Click a theme or aspect ratio</li>
											<li>Use your mouse to select the part of the image you want</li>
											<li>Change the image name (optional)</li>
											<li>Change the image output size (optional for ratios)</li>
											<li>Click &ldquo;Add Image&rdquo;</li>
										</ol>
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
									</div>
								</div><!-- /.modal-content -->
							</div><!-- /.modal-dialog -->
						</div><!-- /.modal -->
							';
			    }
			} else {
			  echo '<div>
						<div class="alert alert-danger">
							<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>
							<strong>Error!</strong> Invalid file
						</div>
						<a href="wizard_image_crop.php?task=selectImage" class="btn btn-default"><i class="fa fa-chevron-circle-left"></i> Go Back</a>
					</div>';

			}
		};
		function cropImage($courseID){
			// $targ_w = $_POST['w'];
			// $targ_h = $_POST['h'];
			$targ_w = $_POST['targetWidth'];
			$targ_h = $_POST['targetHeight'];
			$imageName = str_replace(' ', '_', $_POST['imageName']);
			$courseID = $_POST['courseID'];
			
			$jpeg_quality = 95;
			$src = 'images/'.$courseID.'.jpg';
			$filename = $courseID."_".$imageName.".jpg";
			$output_filename = "images/$filename";
			$img_r = imagecreatefromjpeg($src);
			$dst_r = ImageCreateTrueColor( $targ_w, $targ_h );

			imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],
			$targ_w,$targ_h,$_POST['w'],$_POST['h']);
			
			/*Save Renamed image*/
			if(imagejpeg($dst_r, $output_filename, $jpeg_quality)){
				$uploadFile = uploadFrontPageBanner($courseID, $imageName);
				echo '<div>
						<h2><i class="fa fa-picture-o"></i> Image Uploaded!</h2>
						<div class="container-fluid">
							<div class="row-fluid">
								<div class="col-md-8 thumbnail">
									<img src="'.$output_filename.'">
								</div>
								<div class="col-md-4">
									<p class="well">The image &ldquo;'.$imageName.'&rdquo; has been uploaded to the &ldquo;images&rdquo; folder in the course files.</p>
								</div>
							</div>
						</div>
					</div>';
				unlink("images/".$courseID.".jpg");
			} else {
				echo 'Error uploading image';
			}
		}

	?>



	</div>
</body>
</html>