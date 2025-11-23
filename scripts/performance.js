function getWeather() {
    /**Called when submit button is clicked
     * tries to retieve AWS METAR for the provided Station ID
     * Uses PHP backend to get the XML weather and return it as JSON format**/
    document.getElementById("weatherSubmit").disabled = true;
    document.getElementById("weatherSubmit").innerHTML = "Loading";
    document.getElementById("runwayHdg").value = "";
    if (document.getElementById("runwaySelect"))
        document.getElementById("runwaySelect").style.display = "none";
    document.getElementById("weatherData").style.display = "none";
    document.getElementById("weatherCol").dataset.stationid = "";
    document.getElementById("perfTable").style.display = "none";
    document.getElementById("weatherInput").style.display = "none";
    document.getElementById("weatherInfo").innerHTML = "";
    document.getElementById("time").value = "";
    document.getElementById("windHeading").value = "";
    document.getElementById("windSpeed").value = "";
    document.getElementById("visibility").value = "";
    document.getElementById("clouds").value = "";
    document.getElementById("temperature").value = "";
    document.getElementById("dewpoint").value = "";
    document.getElementById("remarks").value = "";
    document.getElementById("altimeter").value = "";
    document.getElementById("fieldAlt").value = "";
    document.getElementById("alt-wDensityAlt").innerHTML = "";
    document.getElementById("alt-wPressureAlt").innerHTML = "";
    var stationID = document.getElementById("weatherID").value.toUpperCase();
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    if (!weatherData) weatherData = {};
    if (stationID === "") {
        document.getElementById("weatherSubmit").disabled = false;
        document.getElementById("weatherSubmit").innerHTML = "Submit";
        return;
    }
    document.getElementById("weatherCol").dataset.stationid = stationID;
    document.getElementById("weatherInput").style.display = "none";
    /*Section retrieves weather from aviationweather.gov using simple PHP backend.
     * Won't work if no PHP server setup*/
    if (window.XMLHttpRequest) {
        var request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText) {
                try {
                    var weatherResults = JSON.parse(this.responseText);
                    if (!weatherData[stationID])
                        weatherData[stationID] = {};
                    if (weatherResults["taf"] !== null) {
                        var weatherTAF = weatherResults["taf"];
                        weatherData[stationID]["taf"] = weatherTAF;
                        sessionStorage.setItem("weather", JSON.stringify(weatherData));
                        updateDataTimestamp();
                        setTAF(weatherTAF);
                    } else {
                        document.getElementById("TAF").innerHTML = "No TAF Available";
                    }
                    if (weatherResults["metar"] !== null) {
                        weatherData[stationID].metar = weatherResults["metar"];
                        var requiredFields = ["temp_c", "altim_in_hg", "wind_dir_degrees", "wind_speed_kt"];
                        for (i = 0; i < requiredFields.length; i++) {
                            if (!(requiredFields[i] in weatherData[stationID].metar)) {
                                /*We are missed one of the required fields for perf calculations*/
                                inputWeather(weatherData[stationID].metar);
                                document.getElementById("weatherAltTitle").innerHTML =
                                    "The requested METAR is missing a required field. Please use manual entry."
                            }
                        }
                        if (weatherData[stationID].metar.wind_dir_degrees == "VRB") weatherData[stationID].metar.wind_dir_degrees = "0";
                        sessionStorage.setItem("weather", JSON.stringify(weatherData));
                        updateDataTimestamp();
                        setWeather(weatherData[stationID].metar);
                        runwayChange(document.getElementById("runwayHdg").value, stationID);
                    } else {
                        document.getElementById("runwaySelectDiv").innerHTML = "";
                        document.getElementById("runwayHdg").value = "";
                        runwayChange("", stationID);
                        inputWeather();
                    }
                } catch (e) {
                    /*Most likely due to the PHP server not being setup/running*/
                    console.error(e);
                    document.getElementById("runwaySelectDiv").innerHTML = "";
                    document.getElementById("runwayHdg").value = "";
                    runwayChange("", stationID);
                    inputWeather();
                } finally {
                    document.getElementById("weatherSubmit").disabled = false;
                    document.getElementById("weatherSubmit").innerHTML = "Submit";
                }
            }
        }
    }
    request.open("GET", "../weather.php?q=" + stationID, true);
    request.send();
}

function inputWeather(weatherData = null) {
    /**We call this when fetching weather data fails so user can manually input**/
    document.getElementById("weatherAltTitle").innerHTML = "Weather retrieval failed. " +
        "Check the Station ID. If it's correct, the server is not working. Try again or manually input required data below.";
    document.getElementById("weatherInput").style.display = "block";
    document.getElementById("weatherData").style.display = "none";
    if (!weatherData) return;
    if (weatherData.wind_dir_degrees) {
        document.getElementById("windHeading").value = weatherData.wind_dir_degrees;
    }
    if (weatherData.wind_speed_kt) {
        document.getElementById("windSpeed").value = weatherData.wind_speed_kt;
    }
    if (weatherData.visibility_statute_mi) {
        document.getElementById("visibility").value = parseFloat(weatherData.visibility_statute_mi);
    }
    if (weatherData.temp_c) {
        document.getElementById("temperature").value = weatherData.temp_c;
    }
    if (weatherData.dewpoint_c) {
        document.getElementById("dewpoint").value = weatherData.dewpoint_c;
    }
    if (weatherData.altim_in_hg) {
        document.getElementById("altimeter").value = weatherData.altim_in_hg;
    }
    if (weatherData.elevation_m) {
        document.getElementById("fieldAlt").value = Math.round(parseFloat(weatherData.elevation_m) * 3.28084);
    }
}

function weatherInputClick() {
    /**When the manual weather input submit button is clicked
     * We fetch all the user input and put into weatherData**/
    let reqFieldIDs = ["temperature", "fieldAlt", "altimeter", "windHeading", "windSpeed"];
    for (let ID of reqFieldIDs) {
        if (!document.getElementById(ID).value) {
            displayError("Please fill in all weather fields", 2);
            return;
        }
    }
    displayError("");
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    var station_id = document.getElementById("weatherID").value.toUpperCase();
    if (station_id[0] == "*") {
        station_id = station_id.substring(1);
    }
    if (!weatherData) weatherData = {};
    if (!weatherData[station_id])
        weatherData[station_id] = {};
    if (!weatherData[station_id]["metar"])
        weatherData[station_id]["metar"] = {};
    weatherData[station_id]["metar"]["station_id"] = station_id;
    weatherData[station_id]["metar"]["observation_time"] = document.getElementById("time").value;
    weatherData[station_id]["metar"]["sky_condition"] = document.getElementById("clouds").value;
    weatherData[station_id]["metar"]["temp_c"] = parseFloat(document.getElementById("temperature").value);
    weatherData[station_id]["metar"]["dewpoint_c"] = parseFloat(document.getElementById("dewpoint").value);
    weatherData[station_id]["metar"]["visibility_statute_mi"] = parseFloat(document.getElementById("visibility").value);
    weatherData[station_id]["metar"]["elevation_m"] = parseFloat(document.getElementById("fieldAlt").value) / 3.28084;
    weatherData[station_id]["metar"]["altim_in_hg"] = parseFloat(document.getElementById("altimeter").value);
    weatherData[station_id]["metar"]["wind_dir_degrees"] = parseFloat(document.getElementById("windHeading").value);
    weatherData[station_id]["metar"]["wind_speed_kt"] = parseFloat(document.getElementById("windSpeed").value);
    weatherData[station_id]["metar"]["remarks"] = document.getElementById("remarks").value;
    weatherData[station_id]["metar"]["manual"] = true;
    sessionStorage.setItem("weather", JSON.stringify(weatherData));
    updateDataTimestamp();
    var pressureAlt = weatherData[station_id]["metar"]["elevation_m"] * 3.28084 + ((29.92 - parseFloat(weatherData[station_id]["metar"].altim_in_hg)) * 1000);
    var stationPressure = Math.pow((Math.pow(weatherData[station_id]["metar"]["altim_in_hg"], 0.1903) - (.00001313 * weatherData[station_id]["metar"]["elevation_m"] * 3.28084)), 5.255);
    var tempRankine = ((9 / 5) * (weatherData[station_id]["metar"]["temp_c"] + 273.15));
    var densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
    document.getElementById("alt-wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
    document.getElementById("alt-wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";
    getRunways(weatherData[station_id]["metar"]);
    if (document.getElementById("runwayHdg").value === "") {
        document.getElementById("weatherInfo").innerHTML = "Input runway heading next";
    } else {
        document.getElementById("weatherInfo").innerHTML = "";
        runwayChange(document.getElementById("runwayHdg").value, station_id);
    }
}

function setWeather(weatherData) {
    /**Fills the weather table with retrieved weather data**/
    const zeroPad = (num, places) => String(num).padStart(places, '0');
    document.getElementById("weatherData").style.display = "block";
    document.getElementById("wRaw").innerHTML = weatherData.raw_text;
    var obsTime = new Date(weatherData.observation_time);
    var now = new Date();
    var diff = Math.round((now - obsTime) / 60000);
    document.getElementById("wTime").innerHTML = obsTime.getHours() + ":" + zeroPad(obsTime.getMinutes(), 2) +
        " (UTC " + -(obsTime.getTimezoneOffset() / 60) + ") <div id='timeDiff'>(" + diff + " mins ago)</div>";
    if (diff <= 55) {
        document.getElementById("timeDiff").style.color = "green";
    } else if (55 < diff && diff <= 60) {
        document.getElementById("timeDiff").style.color = "#ffc107";
    } else {
        document.getElementById("timeDiff").style.color = "red";
    }

    if (Object.keys(weatherData.flight_category) == 0) {
        document.getElementById("wCat").innerHTML = "MISSING";
    } else {
        document.getElementById("wCat").innerHTML = weatherData.flight_category;
    }

    switch (weatherData.flight_category) {
        case "VFR":
            document.getElementById("wCat").style.color = "white";
            document.getElementById("wCatL").style.color = "white";
            document.getElementById("wCat").style.backgroundColor = "#07c502";
            document.getElementById("wCatL").style.backgroundColor = "#07c502";
            break;
        case "MVFR":
            document.getElementById("wCat").style.color = "white";
            document.getElementById("wCatL").style.color = "white";
            document.getElementById("wCat").style.backgroundColor = "#236ed8";
            document.getElementById("wCatL").style.backgroundColor = "#236ed8";
            break;
        case "IFR":
            document.getElementById("wCat").style.color = "white";
            document.getElementById("wCatL").style.color = "white";
            document.getElementById("wCat").style.backgroundColor = "#ff2700";
            document.getElementById("wCatL").style.backgroundColor = "#ff2700";
            break;
        case "LIFR":
            document.getElementById("wCat").style.color = "white";
            document.getElementById("wCatL").style.color = "white";
            document.getElementById("wCat").style.backgroundColor = "#ff40ff";
            document.getElementById("wCatL").style.backgroundColor = "#ff40ff";
            break;
    }
    var windDir = "";
    if (!weatherData.wind_dir_degrees || !weatherData.wind_speed_kt) {
        windDir = "MISSING";
        document.getElementById("wWind").innerHTML = windDir;
    } else if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")) {
        windDir = "Calm";
        document.getElementById("wWind").innerHTML = windDir;
    } else {
        if (weatherData.wind_dir_degrees === "0") {
            windDir = "Variable";
        } else {
            windDir = parseFloat(weatherData.wind_dir_degrees);
            if (windDir < 100) {
                windDir = "0" + windDir.toFixed(0).toString() + "&deg";
            } else {
                windDir = windDir.toFixed(0).toString() + "&deg";
            }
        }
        if ("wind_gust_kt" in weatherData) {
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt +
                " kts G " + weatherData.wind_gust_kt + " kts";
        } else {
            document.getElementById("wWind").innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
        }
    }
    if (weatherData.visibility_statute_mi) {
        document.getElementById("wVisibility").innerHTML = parseFloat(weatherData.visibility_statute_mi) + " sm";
        document.getElementById("wVisibility").style.backgroundColor = "white";
    } else {
        document.getElementById("wVisibility").innerHTML = "MISSING";
        document.getElementById("wVisibility").style.backgroundColor = "#ffc107";
    }
    var rawCeilings = weatherData.sky_condition;
    var ceilingString = "";
    if (Array.isArray(rawCeilings)) {
        for (var i = 0; i < rawCeilings.length; i++) {
            var ceilingAttribute = rawCeilings[i]["@attributes"];
            ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
        }
    } else {
        if (rawCeilings) {
            ceilingAttribute = rawCeilings["@attributes"];
            if (ceilingAttribute["sky_cover"] === "CLR" || ceilingAttribute["sky_cover"] === "SKC") {
                ceilingString = "Clear";
            } else {
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " +
                    ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        } else {
            ceilingString = "MISSING";
        }
    }
    document.getElementById("wCeilings").innerHTML = ceilingString;
    var temp = parseFloat(weatherData.temp_c);
    var dewpoint = parseFloat(weatherData.dewpoint_c);
    document.getElementById("wTemp").innerHTML = temp + " &degC (" + Math.round(temp * 9 / 5 + 32) + " &degF)";
    document.getElementById("wDewpoint").innerHTML = dewpoint + " &degC (" + Math.round(dewpoint * 9 / 5 + 32) + " &degF)";
    document.getElementById("wAltimeter").innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
    var fldAlt = parseFloat(weatherData.elevation_m) * 3.28084;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
    var altimeterHg = parseFloat(weatherData.altim_in_hg);
    /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
    var stationPressure = Math.pow((Math.pow(altimeterHg, 0.1903) - (.00001313 * fldAlt)), 5.255);
    var tempRankine = ((9 / 5) * (temp + 273.15));
    var densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
    document.getElementById("wPressureAlt").innerHTML = pressureAlt.toFixed(0) + " ft";
    document.getElementById("wDensityAlt").innerHTML = densityAlt.toFixed(0) + " ft";
    if (weatherData.wx_string == null) {
        document.getElementById("wWeather").parentNode.style.display = "none";
    } else {
        document.getElementById("wWeather").innerHTML = weatherData.wx_string;
        document.getElementById("wWeather").parentNode.style.display = "table-row";
    }
    getRunways(weatherData);
}

function getFormattedUTCTime() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const month = months[now.getUTCMonth()];
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const formattedUTCDate = `${month} ${day} ${hours}:${minutes}Z`;
    return formattedUTCDate;
}

function setTAF(weatherTAF) {
    /*TAF*/
    var rawTAF = weatherTAF.raw_text;
    var nLines = weatherTAF.forecast.length;
    var index = 0;
    var line = "";
    var newLines = [];
    if (nLines == null) {
        newLines.push(rawTAF);
    } else {
        var indicator = weatherTAF.forecast[1].change_indicator;
        index = rawTAF.indexOf(indicator);
        newLines.push(rawTAF.slice(0, index));
        line = rawTAF.slice(index);
        for (i = 1; i < nLines; i++) {
            var tempLine = line.slice(indicator.length);
            if (i + 1 === nLines) {
                newLines.push(indicator + tempLine);
            } else {
                var nextIndicator = weatherTAF.forecast[i + 1].change_indicator;
                index = tempLine.indexOf(nextIndicator);
                newLines.push(indicator + tempLine.slice(0, index));
                indicator = nextIndicator;
                line = tempLine.slice(index);
            }
        }
    }
    document.getElementById("TAF").innerHTML = "Current Time: " + getFormattedUTCTime() + "<br>";
    for (i = 0; i < newLines.length; i++) {
        document.getElementById("TAF").innerHTML += newLines[i] + "<br>"
    }
}

function runwayChange(str, station_id = null) {
    /**Called when the runway heading input changes,
     * it then calls the compute functions to recalculate distances**/
    displayError("");
    if (str === "") {
        document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
        document.getElementById("TODistance").innerHTML = "";
        document.getElementById("TO50Distance").innerHTML = "";
        document.getElementById("LDGDistance").innerHTML = "";
        document.getElementById("LDG50Distance").innerHTML = "";
        document.getElementById("tgDistance").innerHTML = "";
        document.getElementById("climbFPM").innerHTML = "";
        document.getElementById("perfTable").style.display = "none";
        heading = "";
        return;
    }
    heading = parseFloat(str);
    if ((heading > 360) || (heading < 1)) {
        document.getElementById("xWind").innerHTML = "";
        document.getElementById("headWind").innerHTML = "";
        document.getElementById("TODistance").innerHTML = "";
        document.getElementById("TO50Distance").innerHTML = "";
        document.getElementById("LDGDistance").innerHTML = "";
        document.getElementById("LDG50Distance").innerHTML = "";
        document.getElementById("tgDistance").innerHTML = "";
        document.getElementById("climbFPM").innerHTML = "";
        document.getElementById("perfTable").style.display = "none";
        heading = "";
        displayError("Invalid runway heading", 2);
        return;
    }
    station_id = document.getElementById("weatherCol").dataset.stationid;


    var allWeatherData = JSON.parse(sessionStorage.getItem("weather"));
    if (allWeatherData && allWeatherData[station_id] && allWeatherData[station_id]["metar"]) {
        var weatherData = allWeatherData[station_id]["metar"];
        var weatherTAF = allWeatherData[station_id]["taf"];
        document.getElementById("weatherWarning").style.display = "none";
        if (weatherData["wind_dir_degrees"] === "0") {
            winds = {
                xWind: 0,
                hWind: 0
            };
        } else {
            winds = windComponents(heading, weatherData["wind_dir_degrees"], weatherData["wind_speed_kt"]);
        }
        if (weatherTAF != null) {
            setTAF(weatherTAF);
        } else {
            document.getElementById("TAF").innerHTML = "No TAF Available";
        }
        document.getElementById("headWind").innerHTML = winds.hWind.toFixed(0);
        if (winds.xWind < 0) {
            document.getElementById("xWind").innerHTML = -winds.xWind.toFixed(0) + " (Right)";
        } else if (winds.xWind > 0) {
            document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0) + " (Left)";
        } else {
            document.getElementById("xWind").innerHTML = winds.xWind.toFixed(0);
        }
        performanceCompute(station_id, winds, heading);
        if (weatherData["wind_speed_kt"] !== "0" && weatherData["wind_dir_degrees"] === "0") {
            document.getElementById("headWind").innerHTML = "VRB";
            document.getElementById("xWind").innerHTML = "VRB";
        }
    } else {
        document.getElementById("weatherWarning").style.display = "block";
        document.getElementById("weatherWarning").innerHTML = "Enter Weather Data";
    }
}

function getRunways(weatherData) {
    if (window.XMLHttpRequest) {
        var request = new XMLHttpRequest();
    } else {
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            if (this.responseText) {
                try {
                    var airportResults = JSON.parse(this.responseText);
                    if (airportResults["id"] !== null) {
                        var runways = [];
                        var runwayData = airportResults[0]["runways"];
                        for (var key in runwayData){
                            if (!runwayData[key]["id"].includes("/")) {
                                delete runwayData[key];
                            }
                        }
                        for (var key in runwayData) {
                            if ((runwayData[key]['surface'] == "A" || runwayData[key]['surface'] == "C")) {
                                runways[runwayData[key]["id"].split("/")[0]] = runwayData[key]["dimension"].split("x")[0];
                                runways[runwayData[key]["id"].split("/")[1]] = runwayData[key]["dimension"].split("x")[0];
                            }
                        }
                        
                        var windData = [];
                        for (var key in runways) {
                            var value = key + "0";
                            if (value.endsWith("R0") || value.endsWith("C0") || value.endsWith("L0")) {
                                value = value.slice(0, -2);
                                value += "0";
                            }
                            windData[key] = windComponents(value, weatherData['wind_dir_degrees'], weatherData['wind_speed_kt']);
                        }
                        var best;
                        if (weatherData.wind_dir_degrees) {
                            for (var key in windData) {
                                if (best == null || windData[key]["hWind"] > windData[best]["hWind"]) {
                                    best = key;
                                }
                                if (windData[key]["hWind"] == windData[best]["hWind"] && parseInt(runways[key]) > parseInt(runways[best])) {
                                    best = key;
                                }
                            }
                        }
                        var autoChange = false;
                        var output = `<select class="form-control" id="runwaySelect" onChange="autoRunwayChange()"><option value="0">Enter Runway Heading</option>`;
                        for (var key in runways) {
                            if (key == best) {
                                output += '<option value="' + key + '0" selected>' + key + ' (Length: ' + runways[key] + ' ft)</option>';
                                autoChange = true;
                            } else {
                                output += '<option value="' + key + '0">' + key + ' (Length: ' + runways[key] + ' ft)</option>';
                            }
                        }
                        output += "</select>";
                        var current = document.getElementById("runwaySelectDiv").innerHTML;
                        if (output != current) {
                            document.getElementById("runwaySelectDiv").innerHTML = output;
                        }
                        if (autoChange) {
                            autoRunwayChange();
                        }
                    }
                } catch (e) {
                    /*Most likely due to the PHP server not being setup/running*/
                    console.error(e);
                    document.getElementById("runwaySelectDiv").innerHTML = "";
                    document.getElementById("runwayHdg").value = "";
                    runwayChange("", weatherData['station_id']);
                }
            }
        }
    }
    request.open("GET", "../airports.php?q=" + weatherData['station_id'], true);
    request.send();
}

function autoRunwayChange() {
    var value = document.getElementById("runwaySelect").value;
    if (value.endsWith("R0") || value.endsWith("C0") || value.endsWith("L0")) {
        value = value.slice(0, -2);
        value += "0";
    }
    var station_id = document.getElementById("weatherID").value.toUpperCase();
    if (station_id[0] == "*") {
        station_id = station_id.substring(1);
    }
    runwayChange(value, station_id);
    document.getElementById("runwayHdg").value = value;
}

function windComponents(heading, windDir, windSpeed) {
    /**Takes the runway heading, wind direction, and wind speed in kts
     * Returns the cross wind and head wind components for the given runway **/
    if (windDir == "0") {
        return {
            xWind: 0,
            hWind: 0
        };
    }
    var diffAngle = heading - parseFloat(windDir);
    var radAngle = diffAngle * Math.PI / 180;
    var xWindSpd = Math.sin(radAngle) * parseFloat(windSpeed);
    var hWindSpd = Math.cos(radAngle) * parseFloat(windSpeed);
    return {
        xWind: xWindSpd,
        hWind: hWindSpd
    };
}

function performanceCompute(station_id, winds, heading) {
    /**Takes wind data, then imports weight data, weather data, aircraft data from local storage
     * Uses stored data to compute takeoff/landing/climb performance values depending on aircraft model**/
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    if (localStorage.getItem("userInput") == null) {
        displayError("Weight and Balance incomplete", 2);
        return;
    } else if (localStorage.getItem("computedData") == null) {
        displayError("Weight and Balance incomplete", 2);
        return;
    } else if (!weatherData || !weatherData[station_id] || !weatherData[station_id]["metar"]) {
        displayError("Weather error", 2);
        return;
    }
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    weatherData = weatherData[station_id]["metar"];
    var aircraftObj = userData.obj;
    var takeoffWeight = computedData.takeOffWeight;
    var landingWeight = computedData.landingWeight;
    var temp = parseFloat(weatherData.temp_c);
    var fldAlt = parseFloat(weatherData.elevation_m) * 3.281;
    var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
    var takeoffDistance = getPerformanceNumbers(aircraftObj.model, "takeoff", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight) * (aircraftObj.model == "C172S" ? 1 : 3.281);
    document.getElementById("TODistance").innerHTML = "Ground Roll: " +
        (takeoffDistance / 10).toFixed(0) * 10 + " ft";
    var takeoff50Distance = getPerformanceNumbers(aircraftObj.model, "takeoff50", pressureAlt,
        temp, takeoffWeight, winds.hWind, aircraftObj.maxWeight) * (aircraftObj.model == "C172S" ? 1 : 3.281);
    document.getElementById("TO50Distance").innerHTML = "Over 50': " +
        (takeoff50Distance / 10).toFixed(0) * 10 + " ft";
    var landingDistance = getPerformanceNumbers(aircraftObj.model, "landing", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight) * (aircraftObj.model == "C172S" ? 1 : 3.281);
    document.getElementById("LDGDistance").innerHTML = "Ground Roll: " +
        (landingDistance / 10).toFixed(0) * 10 + " ft";
    var landing50Distance = getPerformanceNumbers(aircraftObj.model, "landing50", pressureAlt,
        temp, landingWeight, winds.hWind, aircraftObj.maxWeight) * (aircraftObj.model == "C172S" ? 1 : 3.281);
    document.getElementById("LDG50Distance").innerHTML = "Over 50': " +
        (landing50Distance / 10).toFixed(0) * 10 + " ft";
    if (aircraftObj.model == "DA42") {
        var climbPerf = getPerformanceNumbers(aircraftObj.model, "climb", pressureAlt, temp,
            takeoffWeight, winds.hWind, aircraftObj.maxTOWeight);
        var SEClimbPerf = getPerformanceNumbers(aircraftObj.model, "SEClimb", pressureAlt, temp,
            takeoffWeight, winds.hWind, aircraftObj.maxTOWeight);
        document.getElementById("SEClimbFPM").innerHTML = (SEClimbPerf / 10).toFixed(0) * 10 + " FPM";
        document.getElementById("SEClimbFPM").parentElement.classList.remove("hidden");
        var climbTAS = Math.round(calculateTrueAirspeed(82, weatherData.elevation_m, temp, weatherData.altim_in_hg));
        console.log("TAS: " + climbTAS + "kts");
        var climbGrad = Math.round(SEClimbPerf / climbTAS * 0.95 * 10) / 10;
        document.getElementById("climbGrad").innerHTML = climbGrad;
        document.getElementById("climbGrad").parentElement.classList.remove("hidden");
    } else {
        var climbPerf = getPerformanceNumbers(aircraftObj.model, "climb", pressureAlt, temp,
            takeoffWeight, winds.hWind, aircraftObj.maxWeight);
        var SEClimbPerf = "";
        var climbGrad = "";
    }
    document.getElementById("climbFPM").innerHTML = (climbPerf / 10).toFixed(0) * 10 + " FPM";
    tgDistance = ((takeoff50Distance + landing50Distance) / 10).toFixed(0) * 10;
    document.getElementById("tgDistance").innerHTML = tgDistance + " ft";
    var performanceData = JSON.parse(sessionStorage.getItem("performance"));
    if (!performanceData) performanceData = {};
    const airportPerformance = {
        "tail": aircraftObj.tail,
        "takeoffDistance": takeoffDistance,
        "takeoff50Distance": takeoff50Distance,
        "landingDistance": landingDistance,
        "landing50Distance": landing50Distance,
        "tgDistance": tgDistance,
        "climbPerf": climbPerf,
        "SEClimbPerf": SEClimbPerf,
        "climbGrad": climbGrad,
        "pressureAlt": pressureAlt,
        "headWind": winds.hWind,
        "crossWind": winds.xWind,
        "runwayHdg": heading
    }
    performanceData[station_id] = airportPerformance;
    displayError("");
    document.getElementById("perfTable").style.display = "flex";
    sessionStorage.setItem("performance", JSON.stringify(performanceData));
    updateDataTimestamp();
    if (sessionStorage.getItem("riskData"))
        document.getElementById("navbarSummary").classList.remove("disabled");
    document.getElementById("navbarRisk").classList.remove("disabled");
    document.getElementById("next-button").disabled = false;
    updateAirports();
}

function interpolate(x1, y1, x2, y2, x) {
    let skew = (x - x1) / (x2 - x1);
    return (y2 - y1) * skew + y1;
}

function getUpperLower(dict, val) {
    let keys = Object.keys(dict);
    keys = keys.map(e => {
        return parseFloat(e);
    }).sort(compareDecimals);
    let lower;
    let upper;
    for (i = 0; i < keys.length; i++) {
        if (val > keys[i]) {
            lower = keys[i];
            if (i + 1 < keys.length) {
                upper = keys[i + 1];
            }
        }
    }
    if (lower == undefined) lower = keys[0];
    if (upper == undefined) upper = keys[1];
    return {
        lowerKey: lower,
        lowerVal: dict[lower],
        upperKey: upper,
        upperVal: dict[upper]
    };
}

function getPerformanceNumbers(modelString, typeString, pressureAlt, temp, weight, hWind, maxWeight) {
    /**
     * Takes data from perfdata.js. The function name is the type of aircraft.
     * The first value passed is one of:
     * "takeoff","takeoff50","landing","landing50"
     * The second value passed is one of:
     * "DA" -> this is for the first portion of the chart that computes the density altitude
     * "weight" -> the weight portion of the chart
     * "hwind"-> the wind portion of the chart
     *
     * **/
    if (modelString == "C172S") {
        if (typeString == "climb" || typeString === "landing" || typeString === "landing50") {
            let chart = C172S(typeString);
            let tempBounds = getUpperLower(chart, temp);
            let lowerTemp = tempBounds.lowerKey;
            let upperTemp = tempBounds.upperKey;
            let lowerTempVal = tempBounds.lowerVal;
            let upperTempVal = tempBounds.upperVal;
            let altBounds1 = getUpperLower(lowerTempVal, pressureAlt);
            let lowerAlt = altBounds1.lowerKey;
            let upperAlt = altBounds1.upperKey;
            let lowerTempLowerAlt = altBounds1.lowerVal;
            let lowerTempUpperAlt = altBounds1.upperVal;
            let altBounds2 = getUpperLower(upperTempVal, pressureAlt);
            let upperTempLowerAlt = altBounds2.lowerVal;
            let upperTempUpperAlt = altBounds2.upperVal;
            let tempResult1 = interpolate(lowerAlt, lowerTempLowerAlt, upperAlt, lowerTempUpperAlt, pressureAlt);
            let tempResult2 = interpolate(lowerAlt, upperTempLowerAlt, upperAlt, upperTempUpperAlt, pressureAlt);
            let final = interpolate(lowerTemp, tempResult1, upperTemp, tempResult2, temp);
            if (typeString != "climb" && hWind != 0) {
                let windData = C172S("takeoffWind");
                let windCorrection;
                if (hWind > 0) {
                    windCorrection = hWind / windData[0][0] * windData[0][1];
                } else {
                    windCorrection = hWind / windData[1][0] * windData[1][1];
                }
                final = final * (1 + windCorrection);
            }
            return final;
        } else if (typeString == "takeoff" || typeString == "takeoff50") { // weight - temp - alt
            let chart = C172S(typeString);
            let weightBounds = getUpperLower(chart, weight);
            let lowerWeight = weightBounds.lowerKey;
            let upperWeight = weightBounds.upperKey;
            let lowerWeightVal = weightBounds.lowerVal;
            let upperWeightVal = weightBounds.upperVal;
            let tempBounds1 = getUpperLower(lowerWeightVal, temp);
            let lowerTemp = tempBounds1.lowerKey;
            let upperTemp = tempBounds1.upperKey;
            let lowerTemp1Val = tempBounds1.lowerVal;
            let upperTemp1Val = tempBounds1.upperVal;
            let tempBounds2 = getUpperLower(upperWeightVal, temp);
            let lowerTemp2Val = tempBounds2.lowerVal;
            let upperTemp2Val = tempBounds2.upperVal;
            let altBounds1 = getUpperLower(lowerTemp1Val, pressureAlt);
            let lowerAlt = altBounds1.lowerKey;
            let upperAlt = altBounds1.upperKey;
            let lowerWeightLowerTempLowerAlt = altBounds1.lowerVal;
            let lowerWeightLowerTempUpperAlt = altBounds1.upperVal;
            let altBounds2 = getUpperLower(upperTemp1Val, pressureAlt);
            let lowerWeightUpperTempLowerAlt = altBounds2.lowerVal;
            let lowerWeightUpperTempUpperAlt = altBounds2.upperVal;
            let altBounds3 = getUpperLower(lowerTemp2Val, pressureAlt);
            let upperWeightLowerTempLowerAlt = altBounds3.lowerVal;
            let upperWeightLowerTempUpperAlt = altBounds3.upperVal;
            let altBounds4 = getUpperLower(upperTemp2Val, pressureAlt);
            let upperWeightUpperTempLowerAlt = altBounds4.lowerVal;
            let upperWeightUpperTempUpperAlt = altBounds4.upperVal;
            let altResult1 = interpolate(lowerAlt, lowerWeightLowerTempLowerAlt, upperAlt, lowerWeightLowerTempUpperAlt, pressureAlt);
            let altResult2 = interpolate(lowerAlt, lowerWeightUpperTempLowerAlt, upperAlt, lowerWeightUpperTempUpperAlt, pressureAlt);
            let altResult3 = interpolate(lowerAlt, upperWeightLowerTempLowerAlt, upperAlt, upperWeightLowerTempUpperAlt, pressureAlt);
            let altResult4 = interpolate(lowerAlt, upperWeightUpperTempLowerAlt, upperAlt, upperWeightUpperTempUpperAlt, pressureAlt);
            let weightResult1 = interpolate(lowerTemp, altResult1, upperTemp, altResult2, temp);
            let weightResult2 = interpolate(lowerTemp, altResult3, upperTemp, altResult4, temp);
            let final = interpolate(lowerWeight, weightResult1, upperWeight, weightResult2, weight);
            if (hWind != 0) {
                let windData = C172S("takeoffWind");
                let windCorrection;
                if (hWind > 0) {
                    windCorrection = hWind / windData[0][0] * windData[0][1];
                } else {
                    windCorrection = hWind / windData[1][0] * windData[1][1];
                }
                final = final * (1 + windCorrection);
            }
            return final;
        }
    } else if (modelString === "DA40F") {
        var last_result;
        if (typeString === "climb") {
            DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);
        } else {
            var DA_Result = densityAltitudeChart(DA40FP(typeString, "DA"), pressureAlt, temp);
            var weight_Result = weightChart(DA40FP(typeString, "weight"), DA_Result, weight, maxWeight);
            if (hWind > 0) {
                last_result = windObstacleChart(DA40FP(typeString, "hwind"), weight_Result, hWind);
            } else if (hWind < 0) {
                last_result = windObstacleChart(DA40FP(typeString, "twind"), weight_Result, Math.abs(hWind));
            } else if (hWind === 0) {
                last_result = weight_Result;
            }
        }
        var scale = DA40FP(typeString, "scale");
        return last_result * (parseFloat(scale.max) - parseFloat(scale.min)) / 100 + parseFloat(scale.min);
    } else if ((modelString === "DA40CS") || (modelString === "DA40XL") || (modelString === "DA40XLS")) {
        if (typeString === "climb") {
            DA_Result = densityAltitudeChart(DA40CS(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA40CS(typeString, "weight"), DA_Result, weight, 2646);
        } else {
            var use50 = false;
            var reverse = false;
            if (typeString === "landing50") {
                typeString = "landing";
            } else if (typeString === "takeoff50") {
                use50 = true;
                typeString = "takeoff";
            } else if (typeString === "landing") {
                use50 = true;
                reverse = true;
            }
            var wind_result;
            DA_Result = densityAltitudeChart(DA40CS(typeString, "DA"), pressureAlt, temp);
            weight_Result = weightChart(DA40CS(typeString, "weight"), DA_Result, weight, 2646);
            if (hWind > 0) {
                wind_result = windObstacleChart(DA40CS(typeString, "hwind"), weight_Result, hWind, false);
            } else if (hWind < 0) {
                /*There is no landing tailwind chart, so we will assume every 2 knots increases by 10%*/
                if (typeString === "landing") {
                    wind_result = weight_Result * (.05 * Math.abs(hWind)) + weight_Result;
                } else {
                    wind_result = windObstacleChart(DA40CS(typeString, "twind"), weight_Result, Math.abs(hWind), false);
                }
            } else if (hWind === 0) {
                wind_result = weight_Result;
            }
            if (use50) {
                if (reverse) {
                    last_result = windObstacleChart(DA40CS(typeString, "obstacle"), wind_result, 0, true);
                } else {
                    last_result = windObstacleChart(DA40CS(typeString, "obstacle"), wind_result, 50, false);
                }
            } else {
                last_result = wind_result;
            }
        }
        scale = DA40CS(typeString, "scale");
        return last_result * (parseFloat(scale.max) - parseFloat(scale.min)) / 100 + parseFloat(scale.min);
    } else if (modelString === "DA42") {
        if (weight > 3748) {
            typeString += "Heavy";
            maxWeight = 3935;
        } else {
            maxWeight = 3748;
        }
        if (typeString === "climb" || typeString === "climbHeavy" || typeString === "SEClimb" || typeString === "SEClimbHeavy") {
            DA_Result = densityAltitudeChart(DA42(typeString, "DA"), pressureAlt, temp);
            last_result = weightChart(DA42(typeString, "weight"), DA_Result, weight, maxWeight);
        } else {
            DA_Result = densityAltitudeChart(DA42(typeString, "DA"), pressureAlt, temp);
            weight_Result = weightChart(DA42(typeString, "weight"), DA_Result, weight, maxWeight);
            if (hWind > 0) {
                last_result = windObstacleChart(DA42(typeString, "hwind"), weight_Result, hWind);
            } else if (hWind < 0) {
                last_result = windObstacleChart(DA42(typeString, "twind"), weight_Result, Math.abs(hWind));
            } else if (hWind === 0) {
                last_result = weight_Result;
            }
        }
        scale = DA42(typeString, "scale");
        return last_result * (parseFloat(scale.max) - parseFloat(scale.min)) / 100 + parseFloat(scale.min);
    }
}

function densityAltitudeChart(PA_lines, pressureAlt, temp) {
    /**Takes pressure Altitude and OAT and outputs first part of landing chart**/
    const PA_Values = Object.keys(PA_lines);
    // Check if PA_lines type contains different equations for different temps
    if (typeof PA_lines[PA_Values[0]][Object.keys(PA_lines[PA_Values[0]])[0]] == "object") {
        for (i = 0; i < PA_Values.length; i++) {
            bottomPA = parseFloat(PA_Values[i]);
            let PA_temps = Object.keys(PA_lines[PA_Values[i]]);
            PA_temps = PA_temps.map(e => {
                return parseFloat(e);
            }).sort(compareDecimals);
            let lowerTemp;
            for (j = 0; j < PA_temps.length; j++) {
                if (temp >= PA_temps[j]) {
                    if (j + 1 < PA_temps.length) {
                        if (temp < PA_temps[j + 1]) {
                            lowerTemp = PA_temps[j];
                            break;
                        }
                    } else {
                        lowerTemp = PA_temps[j];
                        break;
                    }
                }
            }
            var useExp = false;
            var useExp1 = false;
            if ("e" in PA_lines[bottomPA][lowerTemp]) {
                useExp = true;
            }
            if (i + 1 >= PA_Values.length) {
                /*We have reached the end of lines but haven't found our value, so just use top line*/
                if (useExp) {
                    return parseFloat(PA_lines[bottomPA][lowerTemp].b) * Math.E ** (parseFloat(PA_lines[bottomPA][lowerTemp].e) * temp);
                } else {
                    return parseFloat(PA_lines[bottomPA][lowerTemp].m) * temp + parseFloat(PA_lines[bottomPA][lowerTemp].b);
                }
            } else {
                let PA_temps = Object.keys(PA_lines[PA_Values[i + 1]]);
                PA_temps = PA_temps.map(e => {
                    return parseFloat(e);
                }).sort(compareDecimals);
                let upperTemp;
                for (j = 0; j < PA_temps.length; j++) {
                    if (temp >= PA_temps[j]) {
                        if (j + 1 < PA_temps.length) {
                            if (temp < PA_temps[j + 1]) {
                                upperTemp = PA_temps[j];
                                break;
                            }
                        } else {
                            upperTemp = PA_temps[j];
                            break;
                        }
                    }
                }
                topPA = parseFloat(PA_Values[i + 1]);
                if ("e" in PA_lines[topPA][upperTemp]) {
                    useExp1 = true;
                }
                if (pressureAlt < bottomPA) {
                    /*if less than 0 PA just use 0 PA*/
                    if (useExp) {
                        return parseFloat(PA_lines[bottomPA][lowerTemp].b) * Math.E ** (parseFloat(PA_lines[bottomPA][lowerTemp].e) * temp);
                    } else {
                        return parseFloat(PA_lines[bottomPA][lowerTemp].m) * temp + parseFloat(PA_lines[bottomPA][lowerTemp].b);
                    }
                } else if ((pressureAlt >= bottomPA) && (pressureAlt < topPA)) {
                    /*Between two lines (usually we use this) */
                    skew = (pressureAlt - bottomPA) / (topPA - bottomPA);
                    if (useExp) {
                        bottomValue = parseFloat(PA_lines[bottomPA][lowerTemp].b) * Math.E ** (parseFloat(PA_lines[bottomPA][lowerTemp].e) * temp);
                    } else {
                        bottomValue = parseFloat(PA_lines[bottomPA][lowerTemp].m) * temp + parseFloat(PA_lines[bottomPA][lowerTemp].b);
                    }
                    if (useExp1) {
                        topValue = parseFloat(PA_lines[topPA][upperTemp].b) * Math.E ** (parseFloat(PA_lines[topPA][upperTemp].e) * temp);
                    } else {
                        topValue = parseFloat(PA_lines[topPA][upperTemp].m) * temp + parseFloat(PA_lines[topPA][upperTemp].b);
                    }
                    return ((topValue - bottomValue) * skew) + bottomValue;
                }
            }
        }
    } else {
        for (i = 0; i < PA_Values.length; i++) {
            bottomPA = parseFloat(PA_Values[i]);
            var useExp = false;
            var useExp1 = false;
            if ("e" in PA_lines[bottomPA]) {
                useExp = true;
            }
            if (i + 1 >= PA_Values.length) {
                /*We have reached the end of lines but haven't found our value, so just use top line*/
                if (useExp) {
                    return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                } else {
                    return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                }
            } else {
                topPA = parseFloat(PA_Values[i + 1]);
                if ("e" in PA_lines[topPA]) {
                    useExp1 = true;
                }
                if (pressureAlt < bottomPA) {
                    /*if less than 0 PA just use 0 PA*/
                    if (useExp) {
                        return parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                    } else {
                        return parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                    }
                } else if ((pressureAlt >= bottomPA) && (pressureAlt < topPA)) {
                    /*Between two lines (usually we use this) */
                    skew = (pressureAlt - bottomPA) / (topPA - bottomPA);
                    if (useExp) {
                        bottomValue = parseFloat(PA_lines[bottomPA].b) * Math.E ** (parseFloat(PA_lines[bottomPA].e) * temp);
                    } else {
                        bottomValue = parseFloat(PA_lines[bottomPA].m) * temp + parseFloat(PA_lines[bottomPA].b);
                    }
                    if (useExp1) {
                        topValue = parseFloat(PA_lines[topPA].b) * Math.E ** (parseFloat(PA_lines[topPA].e) * temp);
                    } else {
                        topValue = parseFloat(PA_lines[topPA].m) * temp + parseFloat(PA_lines[topPA].b);
                    }
                    return ((topValue - bottomValue) * skew) + bottomValue;
                }
            }
        }
    }
}

function weightChart(lines, DA_Result, weight, maxWeight) {
    /**Takes the result from the first portion of the chart (DA_Result) and landing weight to find the next section**/
    for (i = 0; i < lines.length; i++) {
        var useExp = false;
        var useLog = false;
        if ("e" in lines[i]) {
            useExp = true;
            bottomIntercept = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * maxWeight);
        } else if ("c" in lines[i]) {
            useLog = true;
            bottomIntercept = parseFloat(lines[i].c) * Math.log(maxWeight) + parseFloat(lines[i].b);
        } else {
            bottomIntercept = parseFloat(lines[i].m) * maxWeight + parseFloat(lines[i].b);
        }
        if (i + 1 >= lines.length) {
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            if (useExp) {
                return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) + (DA_Result - bottomIntercept);
            } else if (useLog) {
                return parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            } else {
                return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) + (DA_Result - bottomIntercept);
            }
        } else {
            var useExp1 = false;
            var useLog1 = false;
            if ("e" in lines[i + 1]) {
                useExp1 = true;
                topIntercept = parseFloat(lines[i + 1].b) * Math.E ** (parseFloat(lines[i + 1].e) * maxWeight);
            } else if ("c" in lines[i + 1]) {
                useLog1 = true;
                topIntercept = parseFloat(lines[i + 1].c) * Math.log(maxWeight) + parseFloat(lines[i + 1].b);
            } else {
                topIntercept = parseFloat(lines[i + 1].m) * maxWeight + parseFloat(lines[i + 1].b);
            }
            /*We are below bottom line so just use bottom line with some skew*/
            if (DA_Result < bottomIntercept) {
                if (useExp) {
                    return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight)) - (bottomIntercept - DA_Result);
                } else if (useLog) {
                    return (parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b)) - (bottomIntercept - DA_Result);
                } else {
                    return parseFloat(lines[i].m) * weight + parseFloat(lines[i].b) - (bottomIntercept - DA_Result);
                }
            } else if ((DA_Result >= bottomIntercept) && (DA_Result < topIntercept)) {
                /*Between two lines (usually we use this) */
                skew = (DA_Result - bottomIntercept) / (topIntercept - bottomIntercept);
                if (useExp1) {
                    topValue = parseFloat(lines[i + 1].b) * Math.E ** (parseFloat(lines[i + 1].e) * weight);
                } else if (useLog1) {
                    topValue = parseFloat(lines[i + 1].c) * Math.log(weight) + parseFloat(lines[i + 1].b);
                } else {
                    topValue = parseFloat(lines[i + 1].m) * weight + parseFloat(lines[i + 1].b);
                }
                if (useExp) {
                    bottomValue = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * weight);
                } else if (useLog) {
                    bottomValue = parseFloat(lines[i].c) * Math.log(weight) + parseFloat(lines[i].b);
                } else {
                    bottomValue = parseFloat(lines[i].m) * weight + parseFloat(lines[i].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function windObstacleChart(lines, previous_result, input_x, reverse = false) {
    /**Interpolates the wind or obstacle lines section of the landing data.
     * It will do either since both start at 0
     * **/
    for (i = 0; i < lines.length; i++) {
        var useExp = false;
        var useExp1 = false;
        if ("e" in lines[i]) {
            useExp = true;
        }
        if (reverse) {
            if (useExp) {
                bottomIntercept = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * 50);
            } else {
                bottomIntercept = parseFloat(lines[i].m) * 50 + parseFloat(lines[i].b);
            }
        } else {
            bottomIntercept = parseFloat(lines[i].b);
        }
        if (i + 1 >= lines.length) {
            /*We have reached the end of lines but haven't found our value, so use top line and add a skew*/
            if (useExp) {
                return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x)) + (previous_result - bottomIntercept);
            } else {
                return parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b) + (previous_result - bottomIntercept);
            }
        } else {
            if ("e" in lines[i + 1]) {
                useExp1 = true;
            }
            if (reverse) {
                if (useExp1) {
                    topIntercept = parseFloat(lines[i + 1].b) * Math.E ** (parseFloat(lines[i + 1].e) * 50);
                } else {
                    topIntercept = parseFloat(lines[i + 1].m) * 50 + parseFloat(lines[i + 1].b);
                }
            } else {
                topIntercept = parseFloat(lines[i + 1].b);
            }
            /*We are below bottom line so just use bottom line with some skew*/
            if (previous_result < bottomIntercept) {
                if (useExp) {
                    return (parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x)) + (bottomIntercept - previous_result);
                } else {
                    return parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b) - (bottomIntercept - previous_result);
                }
            } else if ((previous_result >= bottomIntercept) && (previous_result < topIntercept)) {
                /*Between two lines (usually we use this) */
                skew = (previous_result - bottomIntercept) / (topIntercept - bottomIntercept);
                if (useExp) {
                    bottomValue = parseFloat(lines[i].b) * Math.E ** (parseFloat(lines[i].e) * input_x);
                } else {
                    bottomValue = parseFloat(lines[i].m) * input_x + parseFloat(lines[i].b);
                }
                if (useExp1) {
                    topValue = parseFloat(lines[i + 1].b) * Math.E ** (parseFloat(lines[i + 1].e) * input_x);
                } else {
                    topValue = parseFloat(lines[i + 1].m) * input_x + parseFloat(lines[i + 1].b);
                }
                return ((topValue - bottomValue) * skew) + bottomValue;
            }
        }
    }
}

function displayError(message, num = 0) {
    if (num == 0) {
        document.getElementById("errorDiv1").innerHTML = message;
        document.getElementById("errorDiv2").innerHTML = message;
        if (!message) {
            document.getElementById("errorDiv1").classList.add("hidden");
            document.getElementById("errorDiv2").classList.add("hidden");
        }
    } else {
        document.getElementById("errorDiv" + num).innerHTML = message;
        if (message) {
            document.getElementById("errorDiv" + num).classList.remove("hidden");
        }
    }
}

function updateAirports() {
    clearAirportTabs();
    var requiredFields = ["temp_c", "altim_in_hg", "wind_dir_degrees", "wind_speed_kt"];
    var perfData = JSON.parse(sessionStorage.getItem("performance"));
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    if (!perfData || !weatherData) return;
    for (let airport in perfData) {
        let valid = true;
        for (i = 0; i < requiredFields.length; i++) {
            valid = valid && requiredFields[i] in weatherData[airport].metar;
        }
        if (valid) {
            addAirportTab(airport);
        } else {
            removeAirportData(airport);
        }
    }
}

function removeAirport(identifier) {
    removeAirportData(identifier);
    updateAirports();
}

function removeAirportData(identifier) {
    if (sessionStorage.getItem("weather")) {
        let weatherData = JSON.parse(sessionStorage.getItem("weather"));
        if (weatherData[identifier]) delete weatherData[identifier];
        if (Object.keys(weatherData).length > 0)
            sessionStorage.setItem("weather", JSON.stringify(weatherData));
        else
            sessionStorage.removeItem("weather");
    }
    if (sessionStorage.getItem("performance")) {
        let performanceData = JSON.parse(sessionStorage.getItem("performance"));
        if (performanceData[identifier]) delete performanceData[identifier];
        sessionStorage.setItem("performance", JSON.stringify(performanceData));
        if (Object.keys(performanceData).length > 0)
            sessionStorage.setItem("performance", JSON.stringify(performanceData));
        else
            sessionStorage.removeItem("performance");
    }
}

function clearAirportTabs() {
    var airportContainer = document.getElementById("airport-container");
    while (airportContainer.firstChild) {
        airportContainer.removeChild(airportContainer.firstChild);
    }
}

function addAirportTab(identifier) {
    var airportContainer = document.getElementById("airport-container");
    var airportTab = document.createElement("div");
    airportTab.classList.add("airport-select");
    airportTab.dataset.identifier = identifier;
    airportTab.innerHTML = identifier;
    airportTab.addEventListener("mouseenter", function(event) {
        event.target.style.backgroundColor = "#9DADBD";
        event.target.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
        airportTab.firstChild.addEventListener("click", function(e) {
            e.preventDefault();
            removeAirport(e.target.parentElement.dataset.identifier);
        });
    });
    airportTab.addEventListener("mouseleave", function(event) {
        event.target.style.backgroundColor = "#009FFF";
        event.target.innerHTML = event.target.dataset.identifier;
    });
    airportTab.addEventListener("click", function(event) {
        event.preventDefault();
        removeAirport(event.target.dataset.identifier);
    });
    airportContainer.appendChild(airportTab);
}
document.getElementById("previous-button").addEventListener("click", function() {
    window.location.href = "../weightbalance";
});
document.getElementById("next-button").addEventListener("click", function() {
    window.location.href = "../risk";
});
if (sessionStorage.getItem("performance") && sessionStorage.getItem("performance") !== "{}" && sessionStorage.getItem("performance") !== "") {
    if (sessionStorage.getItem("riskData") && !JSON.parse(sessionStorage.getItem("riskData"))['noFly'] && JSON.parse(sessionStorage.getItem("riskData"))['completed'])
        document.getElementById("navbarSummary").classList.remove("disabled");
    document.getElementById("next-button").disabled = false;
    document.getElementById("navbarRisk").classList.remove("disabled");
    updateAirports();
}

function calculateTrueAirspeed(cas, altitude, temp, altimiter) {
    const R = 287.058
    const T = temp + 273.15
    const p = altimiter * 33.8638 * Math.E ** (-(9.81 * 0.02896968 * altitude) / (8.31432 * (temp + 273.15)))
    let relativeDensity = p * 100000 / (R * T)
    return cas / Math.sqrt(relativeDensity / 1225)
}

function compareDecimals(a, b) {
    if (a === b)
        return 0;
    return a < b ? -1 : 1;
}

function updateDataTimestamp() {
    sessionStorage.setItem("modified", new Date().getTime());
    localStorage.setItem("modified", new Date().getTime());
}
