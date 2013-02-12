<?php

$example_session = "cafebabe";

if(empty($_POST["sessionID"]))
{
	print("{\"type\":\"error\"," .
		"\"message\":\"Bad session!\"," .
		"\"errorID\":102" .
		"}");
	exit;
}

$session = $_POST["sessionID"];

if($session != $example_session)
{
	print("{\"type\":\"error\"," .
		"\"message\":\"Bad session!\"," .
		"\"errorID\":102" .
		"}");
	exit;
}

print("{\"type\":\"success\",\"sessionID\":\"" . $example_session . "\"}");

?>