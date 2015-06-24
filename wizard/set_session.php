<?php 
header('P3P: CP="CAO PSA OUR"');
session_start();
$_SESSION = array(); // set session
echo "<script> window.history.back(2); </script>";

?>