<?php
	require_once 'canvasAPI.php';
	require_once 'config.php';
	// header('Access-Control-Allow-Origin: '.$canvasDomain);
	error_reporting(E_ALL);
	ini_set('display_errors', '1');
	$courseID = $_POST['courseID'];
	$publishedCount = 0;
	$unpublishedCount = 0;
	function cmp($a, $b) {
	    return strcmp($a->title, $b->title);
	}
	$coursePages = getCoursePages($courseID);
	usort($coursePages, "cmp");
	if (count($coursePages) > 0) {
		echo '
		<label for="#inputUnpublished">All Pages</label>
		<select name="unpublished" id="inputUnpublished" class="form-control kl_copy_page">
			<option>Choose a page to copy</option>';
		foreach ($coursePages as $page) {
			if($page->published){
				$publishedCount++;
			} else {
				$unpublishedCount++;
			}
			$pageTitle = $page->title;
			$pageURLName = $page->url;
			$url = $page->html_url;
			echo '<option value="' . $pageURLName . '">' . $pageTitle . '</option>';
		}
		echo '</select>';
	} else {
		echo 'No course pages yet';
	}


	if (count($publishedCount) > 0) {
		echo '
		<label for="#inputPublished">Published Pages</label>
		<select name="Published" id="inputPublished" class="form-control kl_copy_page">
			<option>Choose a page to copy</option>';
		foreach ($coursePages as $page) {
			if($page->published) {
				$pageTitle = $page->title;
				$pageURLName = $page->url;
				$url = $page->html_url;
				echo '<option value="' . $pageURLName . '">' . $pageTitle . '</option>';
			}
		}
		echo '</select>';
	}

	if (count($unpublishedCount) > 0) {
		echo '
		<label for="#inputUnpublished">Unpublished Pages</label>
		<select name="unpublished" id="inputUnpublished" class="form-control kl_copy_page">
			<option>Choose a page to copy</option>';
		foreach ($coursePages as $page) {
			if(!$page->published) {
				$pageTitle = $page->title;
				$pageURLName = $page->url;
				$url = $page->html_url;
				echo '<option value="' . $pageURLName . '">' . $pageTitle . '</option>';
			}
		}
		echo '</select>';
	}
?>