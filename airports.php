<?php
$identifier = strtoupper($_GET['q']);
$json = file_get_contents('https://aviationweather.gov/api/data/airport?ids='.$identifier.'&format=json') or die("Error: Cannot create object");
echo($json);
?>