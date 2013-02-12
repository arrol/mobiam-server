<?php

$example_session = "cafebabe";
$example_sessiontime = 120;

$client_allowed_causes = true;

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

$example_causes = array(
0 => "Krankgeschrieben",
"Beurlaubt",
"Auf Fortbildung",
"In Betriebsratsitzung"
);

$example_names = array(
0 => "Kuno Klenk",
"Moritz Reimann",
"Peter Bishop",
"Kuno M&auml;rz",
"Frank Joachim Walter",
"Adolf Nebel",
"Karla Wei&szlig;dorn",
"Willi Weizel",
"Elizabeth von Tottington",
"Kurt Brakelmann",
"Mark Salzh&uuml;gel",
"Heinrich Neus&uuml;&szlig;",
"Isaac Gates",
"Henry Smith",
"Henry Smith Jr.",
"Nicholas Cage",
"Ivan Minsk",
"Ulfric Sturmmantel",
"Pelagius Septim",
"Samus Aran",
"Birgit Bohler",
"Saturo Iwata",
"Rolf Transistorig",
"Giuseppe Zamboni",
"Anna Lehmann",
"Bernd Asbeck",
"Carl Gustav Alt",
"Dorothea Apfelberger",
"Doris Lessing",
"Earl Charles Grey",
"Erika Neumann",
"Egon Grenz",
"Grace Hopper",
"Hans Maulwurf",
"Klaus B&uuml;chner",
"Lara Riebmann",
"Martin Molte",
"Norbert Schmidt",
"Otto von Freiburg",
"Paul Zimmermann"
);

$names_msg = "{\"type\":\"success\",".
		"\"timeLeft\":" . $example_sessiontime . "," .
		"\"data\":[";

//Anwesenheiten generieren
foreach($example_names as $i => $name)
{
	$rnd = mt_rand(0,100);
	$att = "false";
	$cause = "null";
	$id = mt_rand(0,10000);
	if($rnd > 51)
	{
		$att = "true";
	}else
	{
		$att = "false";
		if($client_allowed_causes)
			$cause = "\"" . $example_causes[array_rand($example_causes)] . "\"";
	}
	
	$names_msg .= "{\"id\":" . $id . ",\"name\":\"" . $name . "\",\"attendance\":" . $att . ",\"cause\":" . $cause . "},";
}

$names_msg = substr($names_msg,0,strlen($names_msg)-1) . "]}";

print($names_msg);

?>