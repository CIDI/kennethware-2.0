<?php
// Create connection
	$dbhost = ''; // example mysite.mydomain.edu
	$dbuser = ''; // database username
	$dbpass = ''; // database password
	$dbname = ''; // database name
	$dport = ''; // connection port

	$conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname, $dport);
// Check connection
	if (mysqli_connect_errno()) {
		echo 'Failed to connect to MySQL: ' . mysqli_connect_error();
	}
?>