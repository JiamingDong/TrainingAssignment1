<?php 
	$index = $_GET["index"];
	$answer = $_GET["answer"];

	$jsonstr = file_get_contents("php_test.json");
	$json = json_decode($jsonstr, false);

	if ($index >= count($json->questions)) {
		echo "End of test. ";
	}
	else {
		echo json_encode($json->questions[$index]);
	}
?>