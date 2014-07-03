<?php
	session_start();
	if ($_SESSION['allowed']){
		$courseID = $_SESSION['courseID'];
	} else {
		echo "Sorry, you are not authorized to view this content or your session has expired. Please relaunch this tool from Canvas.";
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
	<script src="js/jquery.Jcrop.min.js"></script>
	<link rel="stylesheet" href="css/jquery.Jcrop.css" type="text/css" />
	<link rel="stylesheet" href="css/imageCropStyles.css" type="text/css" />
	<link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.1.0/css/font-awesome.min.css">
</head>
<body>
	<div class="navbar navbar-inverse">
		<div class="navbar-inner">
			<ul class="nav">
				<li><a href="wizard_pages.php"><i class="fa fa-files-o"></i> Page Templates</a></li>
				<li><a href="wizard_modules.php"><i class="fa fa-sitemap"></i> Modules</a></li>
				<li class="active"><a href="wizard_image_crop.php?task=selectImage"><i class="fa fa-picture-o"></i> Front Page Banner Image</a></li>
			</ul>
		</div>
	</div>
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
			echo '<div style="margin: 0 0 0 20px;">
				<h3>Select A Banner Image</h3>
				<form action="wizard_image_crop.php" id="imageForm" method="post" enctype="multipart/form-data">
					<label for="file">Select a file:</label>
					<input type="file" name="file" id="file"><br>
					<input type="hidden" name="task" id="task" value="uploadTempImage">
					<input type="submit" name="submit" class="btn" id="formSubmit" value="Upload Image" style="display:none;">
				</form>
				<p style="font-size:14px;"><em><strong>Note:</strong> Image can be either a jpg or png. Minimum size 860x256 px.</em></p>
				<h3 style="margin-top:50px;">What is This?</h3>
				<img src="../../images/template_thumbs/kl_fp_horizontal_nav.png">
				<img src="../../images/template_thumbs/kl_fp_panel_nav.png">
				<p>The custom tools available when editing Canvas pages have the option to include a banner image for your Front Page.</p>
				<p>This tool will allow you to crop your selected image to the proper dimensions and then upload it to your Canvas course files.</p>
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
			if ((($_FILES["file"]["type"] == "image/jpeg")
			|| ($_FILES["file"]["type"] == "image/jpg")
			|| ($_FILES["file"]["type"] == "image/pjpeg")
			|| ($_FILES["file"]["type"] == "image/x-png")
			|| ($_FILES["file"]["type"] == "image/png"))
			// && ($_FILES["file"]["size"] < 20000)
			&& in_array($extension, $allowedExts)) {
			  	if ($_FILES["file"]["error"] > 0) {
			    	echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
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
					$imageHeight = $size[0];
					$imageWidth = $size[1];
					if ($imageHeight < '256' || $imageWidth < '860') {
						echo '<div style="margin-left:20px;"><p>Image is too small. The minimum size is 860 x 256px.</p>
							<a href="wizard_image_crop.php?task=selectImage" class="btn"><i class="fa fa-chevron-circle-left"></i> Pick New Image</a>';
							exit;
					}
			    	
			    	echo "<div style=\"margin-left:20px;\">
						<script language=\"Javascript\">
							$(function(){
								$('#cropbox').Jcrop({
									aspectRatio: 215/64,
									minSize: [860, 256],
									setSelect:   [ 0, 100, 860, 256 ],
									onSelect: updateCoords,
									boxWidth: 630, 
									boxHeight: 500
								});
							});
							function updateCoords(c)
							{
								$('#x').val(c.x);
								$('#y').val(c.y);
								$('#w').val(c.w);
								$('#h').val(c.h);
							};
							function checkCoords()
							{
								if (parseInt($('#w').val())) return true;
								alert('Please select a crop region then press submit.');
								return false;
							};
						</script>
						<!-- This is the image we're attaching Jcrop to -->
						<img src=\"images/" . $courseID.".jpg\" id=\"cropbox\" />

						<!-- This is the form that our event handler fills -->
						<form action=\"wizard_image_crop.php\" method=\"post\" onSubmit=\"return checkCoords();\">
							<input type=\"hidden\" name=\"task\" value=\"cropImage\" />
							<input type=\"hidden\" name=\"courseID\" value=\"".$courseID."\" />
							<input type=\"hidden\" id=\"x\" name=\"x\" />
							<input type=\"hidden\" id=\"y\" name=\"y\" />
							<input type=\"hidden\" id=\"w\" name=\"w\" />
							<input type=\"hidden\" id=\"h\" name=\"h\" />
							<button type=\"submit\" class=\"btn\"><i class=\"fa fa-plus-circle\"></i> Add Image</button>
							<a href=\"wizard_image_crop.php?task=selectImage\" class=\"btn\"><i class=\"fa fa-chevron-circle-left\"></i> Pick New Image</a>
						</form>
					</div>";
			    }
			} else {
			  echo '<p style="margin-left:20px">Invalid file</p><p style="margin-left:20px"><a href="wizard_image_crop.php?task=selectImage" class="btn">Go Back</a></p>';

			}
		};
		function cropImage($courseID){
			$targ_w = 1075;
			$targ_h = 320;
			$courseID = $_POST['courseID'];
			
			$jpeg_quality = 95;
			$src = 'images/'.$courseID.'.jpg';
			$filename = $courseID."_cropped.jpg";
			$output_filename = "images/$filename";
			$img_r = imagecreatefromjpeg($src);
			$dst_r = ImageCreateTrueColor( $targ_w, $targ_h );

			imagecopyresampled($dst_r,$img_r,0,0,$_POST['x'],$_POST['y'],
			$targ_w,$targ_h,$_POST['w'],$_POST['h']);
			
			/*Save Renamed image*/
			if(imagejpeg($dst_r, $output_filename, $jpeg_quality)){
				$uploadFile = uploadFrontPageBanner($courseID);
				echo '<div style="margin-left:20px;">
						<h2>Image Uploaded!</h2>
						<img src="'.$output_filename.'" style="width:700px;">
						<p>To apply this image to a page, choose one of the Front Page themes from the custom tools.</p>
						<p>If you have already selected one of the Front Page themes for a page	you will need to:</p>
						<ol>
							<li>Edit the page</li>
							<li>Launch the tools</li>
							<li>Save the page</li>
						</ol>
					</div>';
				unlink("images/".$courseID.".jpg");
			} else {
				echo "Error uploading image";
			}
		}

	?>
	</div>
</body>
</html>