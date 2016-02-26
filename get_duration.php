<?php 
	$jsonstr = file_get_contents("php_test.json");
	$json = json_decode($jsonstr, false);

	echo $json->duration;
?>