<?php

$tenant_missing = empty($_POST["tenant"]);
$office_missing = empty($_POST["office"]);
$empid_missing =  empty($_POST["empid"]);
$pass_missing =   empty($_POST["pass"]);

if($tenant_missing || $office_missing || $empid_missing || $pass_missing)
{
	$missing_fields = "";
	
	if($tenant_missing)
		$missing_fields .= "\"tenant\",";
		
	if($office_missing)
		$missing_fields .= "\"office\",";
		
	if($empid_missing)
		$missing_fields .= "\"empid\",";
		
	if($pass_missing)
		$missing_fields .= "\"pass\",";
	
	$missing_fields = substr($missing_fields,0,strlen($missing_fields)-1);
	
	print("{\"type\":\"error\"," .
		"\"message\":\"Missing login data!\"," .
		"\"errorID\":101," .
		"\"missingData\":[" . $missing_fields . "]" . 
		"}");
	exit;
}

$example_tenant = "Knifto Industries";
$example_office = "Warmhill Dt.";
$example_emplid = "1";
$example_pass   = "gfos";

$example_session = "cafebabe";
$example_sessiontime = 120;

$tenant = $_POST["tenant"];
$office = $_POST["office"];
$emplid = $_POST["empid"];
$pass = $_POST["pass"];

if($tenant == $example_tenant && $office == $example_office && $emplid == $example_emplid && $pass == $example_pass)
{
	print("{\"type\":\"success\",".
		"\"sessionID\":\"" . $example_session . "\"," .
		"\"timeLeft\":" . $example_sessiontime . "" .
		"}");
}else
{
	print("{\"type\":\"error\"," .
		"\"message\":\"Bad login data!\"," .
		"\"errorID\":210" .
		"}");
}

?>