<?php
if (!array_key_exists('q', $_GET)) {
	echo("Need identifier");
	return("");
}

$identifier = strtolower($_GET['q']);

$metarRaw = simplexml_load_file('https://aviationweather.gov/api/data/metar?ids='.$identifier.'&format=xml&taf=false') or die("Error: Cannot get METAR");
$metar = '{"metar":' . json_encode($metarRaw->data->METAR);

$tafRaw = simplexml_load_file('https://aviationweather.gov/api/data/taf?ids='.$identifier.'&format=xml&metar=false');
$taf;

if((string) $tafRaw->data->attributes()->num_results == "0") {
	$taf = ',"taf":null}';
} else {
	$taf = ',"taf":' . json_encode($tafRaw->data->TAF) . '}';
}

echo($metar.$taf);
?>