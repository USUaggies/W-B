const zeroPad = (num, places) => String(num).padStart(places, '0');

function fillData() {
    /**Main call to fetch all data from local or session storage and call all the fill functions**/
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var flightData = JSON.parse(localStorage.getItem("flightData"));
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performance"));
    var riskData = sessionStorage.getItem("riskData");
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.obj.tail;
    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    document.getElementById("title").innerHTML = tailNumber + " Summary";
    let flightDataSummary = `Student:&nbsp;${flightData["studentName"].replace(" ", "&nbsp;")}&nbsp;| Instructor:&nbsp;${flightData["instructorName"].replace(" ", "&nbsp;")}&nbsp;| 
    Route:&nbsp;${flightData["practiceArea"].replace(" ", "&nbsp;")}&nbsp;| Lesson&nbsp;${flightData["flightLesson"].replace(" ", "&nbsp;")}&nbsp;| 
    Time&nbsp;Enroute:&nbsp;${flightData["timeEnroute"].replace(" ", "&nbsp;")}&nbsp;hrs&nbsp;| Due&nbsp;Back:&nbsp;${flightData["dueBackTime"].replace(" ", "&nbsp;")}`;
    document.getElementById("flightDataSummary").innerHTML = flightDataSummary;
    fillWB(computedData, userData, resultCG.fwdCG, resultCG.validCG, false);
    fillRisk(riskData);
    drawCG(computedData, userData, modelData, colors);
    for (let i in performanceData) {
        addWeatherTable(i);
        fillWeather(weatherData[i].metar, weatherData[i].taf, false, i);
        fillPerformance(performanceData[i], false, tailNumber, i);
    }
    fillVSpeeds(computedData, modelData);
    let timestamp = `${new Date().toLocaleDateString("en-us", {dateStyle: "medium"})} ${new Date().toLocaleTimeString("en-us", {timeStyle: "short"})} (${new Date().toLocaleString("en-us", {timeZone: "UTC", timeStyle: "short", dateStyle: "short", hour12: false})} Zulu)`
    document.getElementById("timestamp").innerHTML = timestamp;
}

function fillPrintData() {
    /**Call to fetch all data from local or session storage and call all the print fills**/
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var weatherData = JSON.parse(sessionStorage.getItem("weather"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var performanceData = JSON.parse(sessionStorage.getItem("performance"));
    var riskData = sessionStorage.getItem("riskData");
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var colors = JSON.parse(localStorage.getItem("colors"));
    var tailNumber = userData.obj.tail;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber);
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    document.getElementById("title").innerHTML = tailNumber + " Print Summary";
    fillWB(computedData, userData, resultCG.fwdCG, resultCG.validCG, true);
    fillRisk(riskData);
    drawCG(computedData, userData, modelData, colors);
    for (let i in performanceData) {
        addWeatherTable(i);
        fillWeather(weatherData[i].metar, weatherData[i].taf, true, i);
        fillPerformance(performanceData[i], true, tailNumber, i);
    }
    fillVSpeeds(computedData, modelData);
    document.getElementById("acType").innerHTML += " " + aircraftObj.model;
    document.getElementById("acTail").innerHTML += " " + tailNumber;
    var obsTime = new Date();
    document.getElementById("date").innerHTML += obsTime.toDateString();
    if (aircraftObj.model !== "DA42") {
        document.getElementById("fuelOnboard").innerHTML += " " + userData.fuelWeight / 6.0 + " gal";
    } else {
        document.getElementById("fuelOnboard").innerHTML += " " + userData.fuelWeight / 6.75;
    }
}

function fillWeather(weatherData, weatherTAF, isPrint, suffix) {
    /**Fills HTML elements with weather data**/
    if (!("raw_text" in weatherData)) {
        document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
        var temp = parseFloat(weatherData.temp_c);
        document.getElementById("wWind-" + suffix).innerHTML = weatherData.wind_dir_degrees + " @ " + weatherData.wind_speed_kt + " kts";
        document.getElementById("wTemp-" + suffix).innerHTML = temp + " &degC";
        document.getElementById("wDewpoint-" + suffix).innerHTML = weatherData.dewpoint_c + " &degC";
        document.getElementById("wVisibility-" + suffix).innerHTML = ((weatherData.visibility_statute_mi) ? parseFloat(weatherData.visibility_statute_mi) + " sm" : "MISSING");
        document.getElementById("wAltimeter-" + suffix).innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
        var fldAlt = parseFloat(weatherData.elevation_m) * 3.281;
        var pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
        var altimeterHg = parseFloat(weatherData.altim_in_hg);
        /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
        var stationPressure = ((altimeterHg ** 0.1903) - (.00001313 * fldAlt)) ** 5.255;
        var tempRankine = ((9 / 5) * (temp + 273.15));
        var densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
        document.getElementById("wPressureAlt-" + suffix).innerHTML = pressureAlt.toFixed(0) + " ft";
        document.getElementById("wDensityAlt-" + suffix).innerHTML = densityAlt.toFixed(0) + " ft";
    } else {
        if (isPrint) {
            document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
            temp = parseFloat(weatherData.temp_c);
            var dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp-" + suffix).innerHTML = temp + " &degC";
            document.getElementById("wDewpoint-" + suffix).innerHTML = dewpoint + " &degC";
        } else {
            document.getElementById("wIdent-" + suffix).innerHTML = weatherData.station_id;
            document.getElementById("wRaw-" + suffix).innerHTML = weatherData.raw_text;
            temp = parseFloat(weatherData.temp_c);
            dewpoint = parseFloat(weatherData.dewpoint_c);
            document.getElementById("wTemp-" + suffix).innerHTML = temp + " &degC";
            document.getElementById("wDewpoint-" + suffix).innerHTML = dewpoint + " &degC";
        }
        var obsTime = new Date(weatherData.observation_time);
        document.getElementById("wTime-" + suffix).innerHTML = zeroPad(obsTime.getHours(), 2) + ":" + zeroPad(obsTime.getMinutes(), 2) +
            " (UTC " + -(obsTime.getTimezoneOffset() / 60) + ")";
        var windDir = "";
        if ((weatherData.wind_dir_degrees === "0") && (weatherData.wind_speed_kt === "0")) {
            windDir = "Calm";
            document.getElementById("wWind-" + suffix).innerHTML = windDir;
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
                document.getElementById("wWind-" + suffix).innerHTML = windDir + " @ " + weatherData.wind_speed_kt +
                    " kts G " + weatherData.wind_gust_kt + " kts";
            } else {
                document.getElementById("wWind-" + suffix).innerHTML = windDir + " @ " + weatherData.wind_speed_kt + " kts";
            }
        }
        document.getElementById("wVisibility-" + suffix).innerHTML = ((weatherData.visibility_statute_mi) ? parseFloat(weatherData.visibility_statute_mi) + " sm" : "MISSING");
        var rawCeilings = weatherData.sky_condition;
        var ceilingString = "";
        if (Array.isArray(rawCeilings)) {
            for (var i = 0; i < rawCeilings.length; i++) {
                var ceilingAttribute = rawCeilings[i]["@attributes"];
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " + ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        } else {
            ceilingAttribute = rawCeilings["@attributes"];
            if (ceilingAttribute["sky_cover"] === "CLR" || ceilingAttribute["sky_cover"] === "SKC") {
                ceilingString = "Clear";
            } else {
                ceilingString += "<p style='margin: 0'>" + ceilingAttribute["sky_cover"] + " @ " +
                    ceilingAttribute["cloud_base_ft_agl"] + "'</p>";
            }
        }
        document.getElementById("wCeilings-" + suffix).innerHTML = ceilingString;
        document.getElementById("wAltimeter-" + suffix).innerHTML = parseFloat(weatherData.altim_in_hg).toFixed(2) + " inHg";
        fldAlt = parseFloat(weatherData.elevation_m) * 3.281;
        pressureAlt = fldAlt + ((29.92 - parseFloat(weatherData.altim_in_hg)) * 1000);
        altimeterHg = parseFloat(weatherData.altim_in_hg);
        /*variables below used to compute Density altitude without humidity compensation, so slightly off*/
        stationPressure = ((altimeterHg ** 0.1903) - (.00001313 * fldAlt)) ** 5.255;
        tempRankine = ((9 / 5) * (temp + 273.15));
        densityAlt = (145442.16 * (1 - ((17.326 * stationPressure) / (tempRankine)) ** 0.235));
        document.getElementById("wPressureAlt-" + suffix).innerHTML = pressureAlt.toFixed(0) + " ft";
        document.getElementById("wDensityAlt-" + suffix).innerHTML = densityAlt.toFixed(0) + " ft";
        /*TAF*/
        if (weatherTAF !== null) {
            setTAF(weatherTAF, suffix);
        } else {
            document.getElementById("TAF-" + suffix).innerHTML = "No TAF Available";
        }
    }
}

function setTAF(weatherTAF, suffix) {
    /*TAF*/
    if (!weatherTAF) {
        document.getElementById("TAF-" + suffix).innerHTML = "No TAF available";
        return;
    }
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
    var now = new Date()
    document.getElementById("TAF-" + suffix).innerHTML = "Current Time: " + now.toUTCString() + "<br>";
    for (i = 0; i < newLines.length; i++) {
        document.getElementById("TAF-" + suffix).innerHTML += newLines[i] + "<br>"
    }
}

function fillPerformance(performanceData, isPrint, tailNumber, suffix) {
    runway = (performanceData.runwayHdg / 10).toFixed(0);
    if (runway == 0) {
        runway = 36;
    }
    if (!isPrint) {
        document.getElementById("runwayHdg-" + suffix).innerHTML = "Runway " + runway;
    }
    document.getElementById("headWind-" + suffix).innerHTML = performanceData.headWind.toFixed(0) + " kts";
    if (performanceData.crossWind < 0) {
        document.getElementById("xWind-" + suffix).innerHTML = -performanceData.crossWind.toFixed(0) + " kts (Right)";
    } else if (performanceData.crossWind === 0) {
        document.getElementById("xWind-" + suffix).innerHTML = performanceData.crossWind.toFixed(0) + " kts";
    } else {
        document.getElementById("xWind-" + suffix).innerHTML = performanceData.crossWind.toFixed(0) + " kts (Left)";
    }
    document.getElementById("TODistance-" + suffix).innerHTML = "Ground Roll: " +
        (performanceData.takeoffDistance / 10).toFixed(0) * 10 + " ft";
    document.getElementById("TO50Distance-" + suffix).innerHTML = "Over 50': " +
        (performanceData.takeoff50Distance / 10).toFixed(0) * 10 + " ft";
    document.getElementById("LDGDistance-" + suffix).innerHTML = "Ground Roll: " +
        (performanceData.landingDistance / 10).toFixed(0) * 10 + " ft";
    document.getElementById("LDG50Distance-" + suffix).innerHTML = "Over 50': " +
        (performanceData.landing50Distance / 10).toFixed(0) * 10 + " ft";
    document.getElementById("tgDistance-" + suffix).innerHTML = performanceData.tgDistance + " ft";
    document.getElementById("climbFPM-" + suffix).innerHTML = (performanceData.climbPerf / 10).toFixed(0) * 10 + " FPM";
    if (performanceData.SEClimbPerf) {
        document.getElementById("SEClimbFPM-" + suffix).innerHTML = (performanceData.SEClimbPerf / 10).toFixed(0) * 10 + " FPM";
        document.getElementById("climbGrad-" + suffix).innerHTML = performanceData.climbGrad;
    }
}

function fillRisk(riskData) {
    if (!riskData) return;
    let riskCat = JSON.parse(riskData).riskCat;
    document.getElementById("riskAssessmentHeader").classList.remove("hidden");
    document.getElementById("riskAssessment").classList.remove("hidden");
    document.getElementById("riskAssessment").innerHTML = `<strong>Risk Score: ${JSON.parse(riskData).riskScore}</strong><br>`;
    if (riskCat == 0) {
        document.getElementById("riskAssessment").innerHTML += "No unusual hazards. Use normal flight planning and established personal minimums and operating procedures";
    } else if (riskCat == 1) {
        document.getElementById("riskAssessment").innerHTML += "Slightly increased risk. Conduct flight planning with extra caution. Review personal minimums and operating procedures";
    } else if (riskCat == 2) {
        document.getElementById("riskAssessment").innerHTML += "Conditions present very high risk. Conduct flight planning with extra care and review all elements that present the most risk. Consult with more experienced pilots or flight instructors for guidance. Consider delaying flight until conditions improve";
    }
}

function fillWB(computedData, userInput, fwdCG, validCG, isPrint) {
    /**Fill HTML elements with weight and balance data**/
    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    var tailNumber = aircraftObj.tail;
    if (!validCG) {
        document.getElementById("auditTitle").innerHTML = tailNumber + " NOT WITHIN LIMITS!!";
        document.getElementById("auditTitle").classList.add("text-danger");
    } else {
        document.getElementById("auditTitle").innerHTML = tailNumber + " is within limits!";
        document.getElementById("auditTitle").classList.add("text-success");
    }
    document.getElementById("empty_wt_td").innerHTML = aircraftObj.emptyWeight;
    document.getElementById("empty_cg_td").innerHTML = aircraftObj.aircraftArm;
    document.getElementById("empty_mnt_td").innerHTML = computedData.emptyMoment;
    document.getElementById("front_wt_td").innerHTML = userInput.frontStationWeight;
    document.getElementById("front_cg_td").innerHTML = modelData.frontStationCG;
    document.getElementById("front_mnt_td").innerHTML = computedData.frontMoment;
    document.getElementById("rear_wt_td").innerHTML = userInput.rearStationWeight;
    document.getElementById("rear_cg_td").innerHTML = modelData.rearStationCG;
    document.getElementById("rear_mnt_td").innerHTML = computedData.rearMoment;
    document.getElementById("zero_wt_td").innerHTML = computedData.zeroFuelWeight;
    document.getElementById("zero_cg_td").innerHTML = computedData.zeroFuelCG;
    document.getElementById("zero_mnt_td").innerHTML = computedData.zeroFuelMoment.toFixed(2);
    document.getElementById("fuel_wt_td").innerHTML = userInput.fuelWeight;
    document.getElementById("fuel_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("fuel_mnt_td").innerHTML = computedData.fuelMoment;
    document.getElementById("takeoff_wt_td").innerHTML = computedData.takeOffWeight;
    document.getElementById("takeoff_cg_td").innerHTML = computedData.takeoffCG;
    document.getElementById("takeoff_mnt_td").innerHTML = computedData.takeOffMoment.toFixed(2);;
    document.getElementById("burn_wt_td").innerHTML = userInput.fuelBurnWeight;
    document.getElementById("burn_cg_td").innerHTML = modelData.fuelStationCG;
    document.getElementById("burn_mnt_td").innerHTML = computedData.fuelBurnMoment;
    document.getElementById("landing_wt_td").innerHTML = computedData.landingWeight;
    document.getElementById("landing_cg_td").innerHTML = computedData.landingCG;
    document.getElementById("landing_mnt_td").innerHTML = computedData.landingMoment;
    document.getElementById("fwd_cg").innerHTML = fwdCG;
    document.getElementById("act_cg").innerHTML = computedData.takeoffCG;
    document.getElementById("aft_cg").innerHTML = modelData.cgRange.midAft;
    document.getElementById("bag_wt_td").innerHTML = userInput.baggage1Weight;
    document.getElementById("bag_cg_td").innerHTML = modelData.baggageStationCG;
    document.getElementById("bag_mnt_td").innerHTML = computedData.baggageMoment;
    if (aircraftObj.model === "DA42") {
        document.getElementById("nose_wt_td").innerHTML = userInput.noseWeight;
        document.getElementById("nose_cg_td").innerHTML = modelData.noseBagStationCG;
        document.getElementById("nose_mnt_td").innerHTML = computedData.noseBagMoment;
        document.getElementById("deIce_wt_td").innerHTML = userInput.deIceWeight;
        document.getElementById("deIce_cg_td").innerHTML = modelData.deIceStationCG;
        document.getElementById("deIce_mnt_td").innerHTML = computedData.deIceMoment;
        document.getElementById("aux_wt_td").innerHTML = userInput.auxFuelWeight;
        document.getElementById("aux_cg_td").innerHTML = modelData.auxStationCG;
        document.getElementById("aux_mnt_td").innerHTML = computedData.auxFuelMoment;
        document.getElementById("bag2_tr").style.display = "";
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxTOWeight;
    } else {
        document.getElementById("max_wt_td").innerHTML = aircraftObj.maxWeight;
        if (!isPrint) {
            document.getElementById("bag2_tr").style.display = "none";
        }
        document.getElementById("nose_wt_td").innerHTML = "-";
        document.getElementById("nose_cg_td").innerHTML = "-";
        document.getElementById("nose_mnt_td").innerHTML = "-";
        document.getElementById("deIce_wt_td").innerHTML = "-";
        document.getElementById("deIce_cg_td").innerHTML = "-";
        document.getElementById("deIce_mnt_td").innerHTML = "-";
        document.getElementById("aux_wt_td").innerHTML = "-";
        document.getElementById("aux_cg_td").innerHTML = "-";
        document.getElementById("aux_mnt_td").innerHTML = "-";
        document.getElementById("bag2_wt_td").innerHTML = "-";
        document.getElementById("bag2_cg_td").innerHTML = "-";
        document.getElementById("bag2_mnt_td").innerHTML = "-";
    }
    if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS")) {
        if (!isPrint) {
            document.getElementById("bag2_tr").style.display = "";
        }
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
    }
}

function calculateSpeed(weight, speedObj, interpolate = false) {
    if (typeof speedObj == "number" || typeof speedObj == "string") return speedObj;
    let weights = Object.keys(speedObj).map(val => {
        return parseInt(val);
    });
    weights.sort(function(a, b) {
        return a - b
    });
    let lowerSpeed;
    let lowerWeight;
    let higherSpeed;
    let higherWeight;
    for (let i in weights) {
        if (weight <= weights[i]) {
            lowerSpeed = i > 0 ? speedObj[weights[i - 1]] : null;
            lowerWeight = i > 0 ? weights[i - 1] : null
            higherSpeed = speedObj[weights[i]];
            higherWeight = weights[i];
            break;
        }
    }
    if (!interpolate) return higherSpeed;
    let ratio = (weight - lowerWeight) / (higherWeight - lowerWeight);
    return Math.round(lowerSpeed + (higherSpeed - lowerSpeed) * ratio);
}

function fillVSpeeds(computedData, modelData) {
    if (modelData.model == "DA42") {
        document.getElementById("Vmc").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vmc, modelData.vSpeeds.interpolate.includes("vmc"));
        document.getElementById("Vyse").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vyse, modelData.vSpeeds.interpolate.includes("vyse"));
        document.getElementById("Vyse").classList.remove("hidden");
        document.getElementById("Vmc").classList.remove("hidden");
        document.getElementById("Vyse-header").classList.remove("hidden");
        document.getElementById("Vmc-header").classList.remove("hidden");
        document.getElementById("Vg").classList.add("hidden");
        document.getElementById("Vg-header").classList.add("hidden");
    } else if (modelData.model == "C172S") {
        document.getElementById("Vx").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vx, modelData.vSpeeds.interpolate.includes("vx"));
        document.getElementById("Vg").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vg, modelData.vSpeeds.interpolate.includes("vg"));
        document.getElementById("Vx").classList.remove("hidden");
        document.getElementById("Vx-header").classList.remove("hidden");
    } else {
        document.getElementById("Vg").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vg, modelData.vSpeeds.interpolate.includes("vg"));
    }
    document.getElementById("Vr").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vr, modelData.vSpeeds.interpolate.includes("vr"));
    document.getElementById("Vy").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vy, modelData.vSpeeds.interpolate.includes("vy"));
    document.getElementById("Dmms").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.dmms, modelData.vSpeeds.interpolate.includes("dmms"));
    document.getElementById("Va").innerHTML = calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.va, modelData.vSpeeds.interpolate.includes("va"));
}

function printResults() {
    /**Called when user clicks print button**/
    window.open("/print");
}

function emailResults() {
    /**Called when user clicks email button (not implemented)
     * We will open a mailto link with the subject and body filled in with info
     * Still need to come up with body text to send. Can't send the canvas image or tables, only text**/
    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var allWeatherData = JSON.parse(sessionStorage.getItem("weather"));
    var computedData = JSON.parse(localStorage.getItem("computedData"));
    var allPerformanceData = JSON.parse(sessionStorage.getItem("performance"));
    var resultCG = JSON.parse(localStorage.getItem("CG"));
    var tailNumber = userData.obj.tail;
    var aircraftObj = JSON.parse(localStorage.getItem("userInput")).obj;
    var riskData = JSON.parse(sessionStorage.getItem("riskData"));
    var bodyString = "";
    if (!resultCG.validCG) {
        bodyString += "!!!!CG NOT VALID. CHECK VALUES.!!!!"
    } else {
        var now = new Date();
        bodyString += "Prepared on " + now + "%0d%0A %0d%0A";
        bodyString += "Weight and Balance %0d%0A";
        bodyString += "Empty: " + aircraftObj.emptyWeight + " lbs | CG: " + aircraftObj.aircraftArm + "%0d%0A";
        if (aircraftObj.model === "DA42") {
            bodyString += "Nose Baggage: " + userData.noseWeight + " lbs %0d%0A";
            if (aircraftObj.deIce) {
                bodyString += "De-icing Fluid: " + userData.deIceWeight + " lbs%0d%0A";
            }
        }
        bodyString += "Front: " + userData.frontStationWeight + " lbs %0d%0ARear: " + userData.rearStationWeight + " lbs %0d%0A";
        bodyString += "Baggage: " + userData.baggage1Weight + " lbs %0d%0A";
        if ((aircraftObj.model === "DA40XL") || aircraftObj.model === "DA42" || aircraftObj.model === "C172S") {
            bodyString += "Baggage 2: " + userData.baggage2Weight + " lbs %0d%0A";
        }
        bodyString += "Zero Fuel: " + computedData.zeroFuelWeight + " lbs | CG: " + computedData.zeroFuelCG + " %0d%0A";
        bodyString += "Fuel: " + userData.fuelWeight + " lbs %0d%0A";
        if (aircraftObj.auxTanks) {
            bodyString += "Aux Fuel: " + userData.auxFuelWeight + " lbs %0d%0A";
        }
        bodyString += "Takeoff Weight: " + computedData.takeOffWeight + " lbs | Takeoff CG: " + computedData.takeoffCG + "%0d%0A";
        bodyString += "Allowed CG Range: " + resultCG.fwdCG + " - " + resultCG.aftCG + "%0d%0A";
        bodyString += "Fuel Burn: " + userData.fuelBurnWeight + " lbs %0d%0A";
        bodyString += "Landing Weight: " + computedData.landingWeight + " lbs | Landing CG: " + computedData.landingCG + "%0d%0A %0d%0A";
        bodyString += "V-Speeds: %0d%0A"
        if (aircraftObj.model.includes("DA40")) {
            bodyString += `Vr: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vr, modelData.vSpeeds.interpolate.includes("vr"))} 
					Vy: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vy, modelData.vSpeeds.interpolate.includes("vy"))} 
					Vg: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vg, modelData.vSpeeds.interpolate.includes("vg"))} 
					Va: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.va, modelData.vSpeeds.interpolate.includes("va"))} 
					Dmms: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.dmms, modelData.vSpeeds.interpolate.includes("dmms"))} %0d%0A %0d%0A`;
        } else if (aircraftObj.model == ("DA42")) {
            bodyString += `Vr: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vr, modelData.vSpeeds.interpolate.includes("vr"))} 
					Vy: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vy, modelData.vSpeeds.interpolate.includes("vy"))} 
					Va: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.va, modelData.vSpeeds.interpolate.includes("va"))} 
					Vyse: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vyse, modelData.vSpeeds.interpolate.includes("vyse"))} 
					Vmc: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vmc, modelData.vSpeeds.interpolate.includes("vmc"))} 
					Dmms: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.dmms, modelData.vSpeeds.interpolate.includes("dmms"))} %0d%0A %0d%0A`;
        } else if (aircraftObj.model == "C172S") {
            bodyString += `Vr: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vr, modelData.vSpeeds.interpolate.includes("vr"))} 
					Vx: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vx, modelData.vSpeeds.interpolate.includes("vx"))} 
					Vy: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vy, modelData.vSpeeds.interpolate.includes("vy"))} 
					Vg: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.vg, modelData.vSpeeds.interpolate.includes("vg"))} 
					Va: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.va, modelData.vSpeeds.interpolate.includes("va"))} 
					Dmms: ${calculateSpeed(computedData.takeOffWeight, modelData.vSpeeds.dmms, modelData.vSpeeds.interpolate.includes("dmms"))} %0d%0A %0d%0A`;
        }
        if (riskData) {
            bodyString += `Risk Assessment:%0d%0A`
            bodyString += `Score: ${riskData.riskScore}%0d%0A`;
            if (riskData.riskCat == 0) {
                bodyString += "No unusual hazards. Use normal flight planning and established personal minimums and operating procedures %0d%0A %0d%0A";
            } else if (riskData.riskCat == 1) {
                bodyString += "Slightly increased risk. Conduct flight planning with extra caution. Review personal minimums and operating procedures %0d%0A %0d%0A";
            } else if (riskData.riskCat == 2) {
                bodyString += "Conditions present very high risk. Conduct flight planning with extra care and review all elements that present the most risk. Consult with more experienced pilots or flight instructors for guidance. Consider delaying flight until conditions improve %0d%0A %0d%0A";
            }
        }
        if (sessionStorage.getItem("weather") !== null) {
            for (airport in allWeatherData) {
                let weatherData = allWeatherData[airport];
                bodyString += airport + " Weather %0d%0A"
                if ("raw_text" in weatherData.metar) {
                    bodyString += weatherData.metar.raw_text + "%0d%0A";
                } else {
                    bodyString += "METAR not available (user inputted).%0d%0A";
                }
                if (weatherData.taf) {
                    bodyString += weatherData.taf.raw_text + "%0d%0A %0d%0A";
                } else {
                    bodyString += "TAF not available.%0d%0A %0d%0A";
                }
            }
        } else {
            bodyString += "Weather not available%0d%0A %0d%0A";
        }
        if (sessionStorage.getItem("performance") !== null) {
            for (airport in allPerformanceData) {
                let performanceData = allPerformanceData[airport];
                if (userData.obj.tail !== performanceData.tail) {
                    bodyString += "Performance data needs to be recomputed. See Weather & Performance Tab."
                } else {
                    bodyString += `Performance Data (${airport})%0d%0ARunway Heading: ` + performanceData.runwayHdg + "%0d%0A";
                    bodyString += "Headwind: " + performanceData.headWind.toFixed(0) + "%0d%0A";
                    bodyString += "Crosswind: "
                    if (performanceData.crossWind < 0) {
                        bodyString += -performanceData.crossWind.toFixed(0) + " (Right)%0d%0A";
                    } else if (performanceData.crossWind === 0) {
                        bodyString += performanceData.crossWind.toFixed(0) + "%0d%0A";
                    } else {
                        bodyString += performanceData.crossWind.toFixed(0) + " (Left)%0d%0A";
                    }
                    bodyString += "Takeoff: Ground Roll: " + performanceData.takeoffDistance.toFixed(0) + " ft. Over 50': " + performanceData.takeoff50Distance.toFixed(0) + " ft.%0d%0A";
                    bodyString += "Landing: Ground Roll: " + performanceData.landingDistance.toFixed(0) + " ft. Over 50': " + performanceData.landing50Distance.toFixed(0) + " ft.%0d%0A";
                    bodyString += "Rate of Climb: " + performanceData.climbPerf.toFixed(0) + " FPM %0d%0A";
                    if (aircraftObj.model == "DA42") {
                        bodyString += "Single-Engine Rate of Climb: " + (performanceData.SEClimbPerf / 10).toFixed(0) * 10 + " FPM %0d%0A";
                        bodyString += "Climb Gradient: " + performanceData.climbGrad + " %0d%0A";
                    }
                }
            }
        } else {
            bodyString += "Performance data not available"
        }
    }
    window.open('mailto:dispatchusu@gmail.com?subject=' + tailNumber + ' Weight and Balance&body=' +
        bodyString);
}

function waitForFrame() {
    return new Promise(resolve => {
        if (document.getElementById("picture-iframe").contentWindow.document.getElementById("buttonRow")) {
            return resolve(document.getElementById("picture-iframe").contentWindow.document.getElementById("buttonRow"));
        }
        const observer = new MutationObserver(mutations => {
            if (document.getElementById("picture-iframe").contentWindow.document.body) {
                observer.disconnect();
                resolve(document.getElementById("picture-iframe").contentWindow.document.body);
            }
        });
        observer.observe(document.getElementById("picture-iframe").contentWindow.document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true
        });
    });
}

async function savePicture() {
    let saveButton = document.getElementById("saveButton");
    saveButton.disabled = true;
    let html = `<html>${document.getElementById("print-iframe").contentWindow.document.documentElement.innerHTML}</html>`;
    let iframe = document.createElement("iframe");
    iframe.id = "picture-iframe";
    iframe.style.width = "8.5in";
    iframe.style.height = "100%";
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(html);
    iframe.contentDocument.close();
    let tailNum = JSON.parse(localStorage.getItem("userInput")).obj.tail;
    let date = new Date();
    let formatedDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()} ${zeroPad(date.getHours(), 2)}${zeroPad(date.getMinutes(), 2)}`;
    let buttonPromise = waitForFrame();
    buttonPromise.catch(error => {
        console.error("Error in promise:", error);
    });
    buttonPromise.then((buttonRow) => {
        var destCtx = document.getElementById("picture-iframe").contentWindow.document.getElementById("cgCanvas").getContext('2d');
        destCtx.drawImage(document.getElementById("cgCanvas"), 0, 0, document.getElementById("picture-iframe").contentWindow.document.getElementById("cgCanvas").width, document.getElementById("picture-iframe").contentWindow.document.getElementById("cgCanvas").height);
        html2canvas(document.getElementById("picture-iframe").contentWindow.document.body, {
            logging: true
        }).then(function(canvas) {
            var anchorTag = document.createElement("a");
            document.body.appendChild(anchorTag);
            document.getElementById("previewImg").appendChild(canvas);
            anchorTag.download = `${tailNum} ${formatedDate}.png`;
            anchorTag.href = canvas.toDataURL();
            anchorTag.target = '_blank';
            anchorTag.click();
            buttonRow.style.display = "flex";
            document.body.removeChild(iframe);
            saveButton.disabled = false;
        });
    });
}

function addWeatherTable(i) {
    var row = document.createElement("div");
    row.classList.add("row");
    row.classList.add("weather-row");
    row.innerHTML = `<div class=col-lg><h4>Weather</h4><div class=container id=weatherData-${i}><p id=wRaw-${i}><table class="table table-bordered table-sm table-striped"><tr><th scope=col>Station Identifier<th id=wIdent-${i}><tr><th scope=col>Time<th id=wTime-${i}><tr><th scope=col>Wind Dir and Vel<th id=wWind-${i}><tr><th scope=col>Visibility<th id=wVisibility-${i}><tr><th scope=col>Clouds<th id=wCeilings-${i}><tr><th scope=col>Temperature<th id=wTemp-${i}><tr><th scope=col>Dew Point<th id=wDewpoint-${i}><tr><th scope=col>Altimeter<th id=wAltimeter-${i}><tr><th scope=col>Density Alt.<th id=wDensityAlt-${i}><tr><th scope=col>Pressure Alt.<th id=wPressureAlt-${i}></table><div id=weatherTAF-${i}><h5>TAF</h5><p id=TAF-${i}></div></div></div><div class=col-lg><h4>Takeoff and Landing Performance</h4><p>Performance data is an estimate only and does not take into consideration runway condition, aircraft condition, or pilot technique.<div class=container><h5 id=runwayHdg-${i}>Runway</h5><table class="table table-bordered table-sm"><tr><th scope=row>Head Wind<td id=headWind-${i}><tr><th scope=row>Cross Wind<td id=xWind-${i}><tr><th scope=row>Takeoff<td id=TODistance-${i}>Ground Roll:<td id=TO50Distance-${i}>Over 50':<tr><th scope=row>Landing<td id=LDGDistance-${i}>Ground Roll:<td id=LDG50Distance-${i}>Over 50':<tr><th scope=row colspan=2>Touch and Go Distance (50')<td id=tgDistance-${i}><tr><th scope=col style="text-align: center;">Rate of Climb<th scope=col style="text-align: center;">Single-Engine ROC<th scope=col style="text-align: center;">Climb Gradient<tr><td id=climbFPM-${i} style="text-align: center;"><td id=SEClimbFPM-${i} style="text-align: center;"><td id=climbGrad-${i} style="text-align: center;"></table></div></div>`;
    document.getElementById("main").appendChild(row);
}

function printPage() {
    beforePrint();
    setTimeout(window.print, 500)
}

function beforePrint() {
    let normalContent = document.getElementById("normal-content");
    let cgCvs = document.getElementById("cgCanvas");
    let newHtml = document.getElementById("print-iframe").contentWindow.document.body.innerHTML;
    normalContent.parentNode.removeChild(normalContent);
    document.body.innerHTML = newHtml
    var destCtx = document.getElementById("cgCanvas").getContext('2d');
    var destCvs = document.getElementById("cgCanvas");
    destCtx.drawImage(cgCvs, 0, 0, destCvs.width, destCvs.height);
}

function afterPrint() {
    location.reload();
}


function reset() {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "../";
}
