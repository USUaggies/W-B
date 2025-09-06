<?php
if (!array_key_exists('q', $_GET)) {
	echo("Need identifier");
	return("");
}

$identifier = strtolower($_GET['q']);
$metarRaw = simplexml_load_file('https://aviationweather.gov/api/data/metar?ids='.$identifier.'&format=xml&taf=false') or die("Error: Cannot get METAR");
$metar = '{"metar":' . json_encode($metarRaw->data->METAR);
$tafResults = file_get_contents('https://aviationweather.gov/api/data/taf?ids='.$identifier.'&format=xml&metar=false');
$tafRaw;
$taf;
if ($tafResults) {
    $tafRaw = simplexml_load_string($tafResults, 'SimpleXMLElement', LIBXML_NOCDATA);
    $taf = ',"taf":' . json_encode($tafRaw->data->TAF) . '}';
} else {
    $taf = ',"taf":null}';
}
echo($metar.$taf);
?>