function fillData() {
    /**We run this initially to import the aircraft from aircraft.js and populate the dropdown(select) menu
     **/
    let models = [];
    let sortedAircraft = [...aircraft].sort((a, b) => {
        if (a.tail < b.tail) return -1;
        return 1;
    });
    for (i = 0; i < aircraft.length; i++) {
        if (!models.includes(aircraft[i].model))
            models.push(aircraft[i].model);
    }

    for (model of models) {
        document.getElementById("aircraftSelect").innerHTML += `<optgroup label="${model}">`;
        for (i = 0; i < sortedAircraft.length; i++) {
            if (sortedAircraft[i].model == model)
                document.getElementById("aircraftSelect").innerHTML += "<option>" + sortedAircraft[i].tail + "</option>";
        }
        document.getElementById("aircraftSelect").innerHTML += "</optgroup>";
    }
}

function showAudit() {
    if (!(document.getElementById("auditDiv").style.display === "none")) {
        document.getElementById("auditDiv").style.display = "none";
        document.getElementById("audit_btn").innerHTML = "Show Details";
    } else {
        document.getElementById("auditDiv").style.display = "block";
        document.getElementById("audit_btn").innerHTML = "Hide Details";
    }
}

function aircraftSelection() {
    /**When the user selects a tail number from the dropdown menu, we then populate the proper user input fields
     **/
    var tailNumber = document.getElementById('aircraftSelect').value;

    if (tailNumber === "Tail #") {
        document.getElementById("emptyAircraftInfo").innerHTML = "";
        clearResults();
        return;
    }
    var aircraftObj = aircraft.find(x => x.tail === tailNumber)

    if (aircraftObj.autopilot == "none") {
        document.getElementById("emptyAircraftInfo").innerHTML =
            "Empty:&nbsp;" + aircraftObj.emptyWeight + "&nbsp;lbs, CG:&nbsp;" + aircraftObj.aircraftArm + ", Type:&nbsp;" + aircraftObj.model;
        document.getElementById("smallEmptyAircraftInfo").innerHTML =
            "Empty:&nbsp;" + aircraftObj.emptyWeight + "&nbsp;lbs, CG:&nbsp;" + aircraftObj.aircraftArm + ", Type:&nbsp;" + aircraftObj.model;
    } else {
        document.getElementById("emptyAircraftInfo").innerHTML =
            "Empty:&nbsp;" + aircraftObj.emptyWeight + "&nbsp;lbs, CG:&nbsp;" + aircraftObj.aircraftArm + ", Type:&nbsp;" + aircraftObj.model + ", AP:&nbsp;" + aircraftObj.autopilot;
        document.getElementById("smallEmptyAircraftInfo").innerHTML =
            "Empty:&nbsp;" + aircraftObj.emptyWeight + "&nbsp;lbs, CG:&nbsp;" + aircraftObj.aircraftArm + ", Type:&nbsp;" + aircraftObj.model + ", AP:&nbsp;" + aircraftObj.autopilot;

    }

    /*We need to hide or show different input fields based on aircraft type/model*/
    switch (aircraftObj.model) {
        case "DA40F":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("baggageStation2Div").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "66";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 66 lbs";
            document.getElementById("fuelStation").max = "40";
            document.getElementById("fuelBurn").max = "40";
            document.getElementById("fuelMaxNote").innerHTML = "Max 40.2 Gallons";
            break;
        case "DA40CS":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("baggageStation2Div").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "66";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 66 lbs";
            document.getElementById("fuelStation").max = "40";
            document.getElementById("fuelBurn").max = "40";
            document.getElementById("fuelMaxNote").innerHTML = "Max 40.2 Gallons";
            break;
        case "DA40XL":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 100 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 40 lbs. Max 100 lbs Combined.";
            document.getElementById("fuelStation").max = "40.2";
            document.getElementById("fuelMaxNote").innerHTML = "Max 40.2 Gallons";
            document.getElementById("fuelBurn").max = "40.2";
            break;
        case "DA40XLS":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 100 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 40 lbs. Max 100 lbs Combined.";
            document.getElementById("fuelStation").max = "50";
            document.getElementById("fuelMaxNote").innerHTML = "Max 50 Gallons";
            document.getElementById("fuelBurn").max = "50";
            break;
        case "DA42":
            document.getElementById("noseStationDiv").style.display = "flex";
            if (aircraftObj.auxTanks) {
                document.getElementById("auxFuelStationDiv").style.display = "flex";
            } else {
                document.getElementById("auxFuelStationDiv").style.display = "none";
            }
            if (aircraftObj.deIce) {
                document.getElementById("deIceStationDiv").style.display = "flex";
            } else {
                document.getElementById("deIceStationDiv").style.display = "none";
            }
            document.getElementById("fuelStation").max = "50";
            document.getElementById("fuelMaxNote").innerHTML = "Max 50 Gallons";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 100 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 40 lbs. Max 100 lbs Combined.";
            document.getElementById("fuelBurn").max = "76";
            break;
        case "C172S":
            document.getElementById("noseStationDiv").style.display = "none";
            document.getElementById("deIceStationDiv").style.display = "none";
            document.getElementById("auxFuelStationDiv").style.display = "none";
            document.getElementById("baggageStation1").max = "100";
            document.getElementById("baggage1MaxNote").innerHTML = "Max 120 lbs";
            document.getElementById("baggageStation2Div").style.display = "flex";
            document.getElementById("baggage2MaxNote").innerHTML = "Max 50 lbs. Max 120 lbs Combined.";
            document.getElementById("fuelStation").max = "56";
            document.getElementById("fuelMaxNote").innerHTML = "Max 56 Gallons";
            document.getElementById("fuelBurn").max = "56";
            break;
    }
    reCompute();
}

function saveFlightData(collapse=false, controller=null) {
    if (!localStorage.getItem("flightData")) {
        var flightData = {};
    } else {
        var flightData = JSON.parse(localStorage.getItem("flightData"));
    }
    flightData["studentName"] = document.getElementById("studentName").value;
    flightData["instructorName"] = document.getElementById("instructorName").value;
    flightData["practiceArea"] = document.getElementById("practiceArea").value;
    flightData["flightLesson"] = document.getElementById("flightLesson").value;
    flightData["timeEnroute"] = document.getElementById("timeEnroute").value;
    flightData["dueBackTime"] = document.getElementById("dueBackTime").value;
    localStorage.setItem("flightData", JSON.stringify(flightData));
    let flightSmall = `<small>${document.getElementById('aircraftSelect').value}&nbsp| ${flightData["studentName"].replace(" ", "&nbsp;")}&nbsp;| 
    ${flightData["instructorName"].replace(" ", "&nbsp;")}&nbsp;| ${flightData["practiceArea"].replace(" ", "&nbsp;")}&nbsp;| 
    Lesson&nbsp;${flightData["flightLesson"].replace(" ", "&nbsp;")}&nbsp;| ${flightData["timeEnroute"].replace(" ", "&nbsp;")}&nbsp;hours&nbsp;| 
    Back&nbsp;at&nbsp;${flightData["dueBackTime"].replace(" ", "&nbsp;")}</small>`;
    document.getElementById("flightInfoSummary").innerHTML = flightSmall;
    let formElements = Array.from(document.querySelectorAll("#flightInfoCollapse input"));
    let validElements = formElements.filter(element => element.value);
    validElements.forEach(element => flightInfoWarning(element, true));
    if (flightData["studentName"] && flightData["instructorName"] && flightData["practiceArea"] && 
    flightData["flightLesson"] && flightData["timeEnroute"] && flightData["dueBackTime"]) {
        updateNext(false);
        if (document.getElementById("overall_result").classList.contains("list-group-item-warning")) {
            document.getElementById("overall_result").classList.remove("list-group-item-warning");
        }
            if (collapse) {
            for (let i = 0; i < formElements.length; i++) {
                if (formElements[i].classList.contains("invalid"))
                    formElements[i].classList.remove("invalid");
            }
            toggleCollapse();        
            controller.abort();
        }
    } else {
        if (document.getElementById("overall_result").classList.contains("list-group-item-success")) {
            // document.getElementById("overall_result").classList.remove("list-group-item-success");
            document.getElementById("overall_result").classList.add("list-group-item-warning");
            document.getElementById("overall_result").innerHTML = "Fill out all flight data";
        }
        updateNext(true);
    }
}

function reCompute() {
    /**Runs when a change in the user input is detected, this keeps the results updated with having to submit
     *
     **/

    var tailNumber = document.getElementById('aircraftSelect').value;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber)
    var userInput = {
        obj: aircraftObj
    }

    /*Collect all user input and put into dict/object */
    userInput["frontStationWeight"] = parseFloat(document.getElementById("frontStation").value);
    userInput["rearStationWeight"] = parseFloat(document.getElementById("rearStation").value);

    userInput["baggage1Weight"] = parseFloat(document.getElementById("baggageStation1").value);
    if (!userInput["baggage1Weight"]) userInput["baggage1Weight"] = 0;
    if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS") || (aircraftObj.model === "C172S")) {
        userInput["baggage2Weight"] = parseFloat(document.getElementById("baggageStation2").value);
        if (!userInput["baggage2Weight"]) userInput["baggage2Weight"] = 0;
    }

    /*If DA42 we have to compute w/ JetA density*/
    if (aircraftObj.model === "DA42") {
        userInput["noseWeight"] = parseFloat(document.getElementById("noseStation").value);
        if (!userInput["noseWeight"]) userInput["noseWeight"] = 0;
        userInput["baggage2Weight"] = parseFloat(document.getElementById("baggageStation2").value);
        if (!userInput["baggage2Weight"]) userInput["baggage2Weight"] = 0;

        userInput["fuelWeight"] = parseFloat(document.getElementById("fuelStation").value) * 6.75;
        userInput["fuelBurnWeight"] = parseFloat(document.getElementById("fuelBurn").value) * 6.75;

        if (aircraftObj.deIce && document.getElementById("deIceStation").value) {
            userInput["deIceWeight"] = parseFloat(document.getElementById("deIceStation").value) * 9.125;
        } else {
            userInput["deIceWeight"] = 0.0;
        }
        if (aircraftObj.auxTanks && document.getElementById("auxFuelStation").value) {
            userInput["auxFuelWeight"] = parseFloat(document.getElementById("auxFuelStation").value) * 6.75;
        } else {
            userInput["auxFuelWeight"] = 0.0;
        }

    } /*Otherwise just use avgas/100LL density*/
    else {
        if (document.getElementById("fuelStation").value)
            userInput["fuelWeight"] = Math.round(parseFloat(document.getElementById("fuelStation").value) * 60.0) / 10;
        if (document.getElementById("fuelBurn").value)
            userInput["fuelBurnWeight"] = Math.round(parseFloat(document.getElementById("fuelBurn").value) * 60.0) / 10;
    }

    var cgValid = true;
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    /*check input validation. Checking ranges of input values. */
    var validInputString = checkInputConstraints(modelData, userInput);
    if (!(validInputString === "")) {
        resultWarning(validInputString[0], validInputString[1]);
        updateNext(true);
        return;
    }
	
	if (isNaN(userInput.frontStationWeight) || isNaN(userInput.rearStationWeight) || isNaN(userInput.fuelWeight) || isNaN(userInput.fuelBurnWeight)) {
		updateNext(true);
        if (document.getElementById("overall_result").classList.contains("list-group-item-success")) {
            document.getElementById("overall_result").classList.remove("list-group-item-success");
            document.getElementById("overall_result").classList.add("list-group-item-danger");
            document.getElementById("overall_result").innerHTML="Invalid input";
        }
        return;
	}

    if (!localStorage.getItem("userInput") || localStorage.getItem("userInput") != JSON.stringify(userInput)) {
        clearPerformance();
    }

    /*Store user input data */
    localStorage.setItem("userInput", JSON.stringify(userInput));

    /*computes all weights/CGs/Moments and returns dict with values*/
    var newData = computeWB(aircraftObj, userInput);
    var colors = {
        takeoff: "green",
        landing: "green",
        zero: "grey"
    };

    /*We now validate the results based on CG limits and output the results*/

    if (!localStorage.getItem("computedData") || localStorage.getItem("computedData") != JSON.stringify(newData)) {
        clearPerformance();
    }

    localStorage.setItem("computedData", JSON.stringify(newData));
    updateDataTimestamp();

    var zeroFwdCG;
    var toFwdCG;
    var ldgFwdCG;
    var zeroAftCG, toAftCG, ldgAftCG;

    /*Now check if DA40 is within CG*/
    if (aircraftObj.model !== "DA42") {
        zeroAftCG = modelData.cgRange.midAft;
        toAftCG = modelData.cgRange.midAft;
        ldgAftCG = modelData.cgRange.midAft;

        /*First make sure takoff weight(heaviest of the 3) is not over max*/
        if (newData.takeOffWeight > aircraftObj.maxWeight) {
            resultWarning("Takeoff weight exceeds " + aircraftObj.maxWeight + " lbs.");
            colors["takeoff"] = "red";
            cgValid = false;
        }

        /*Light takeoff weight under 2161 lbs*/
        if (newData.takeOffWeight <= parseFloat(modelData.cgRange.midWgt)) {
            toFwdCG = modelData.cgRange.minFwd;
            if (!((parseFloat(modelData.cgRange.midFwd) <= newData.takeoffCG) &&
                    (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                resultWarning("Takeoff CG out of limits.");
                colors["takeoff"] = "red";
                cgValid = false;
            }
        }
        /*Heavier takeoff weight over 2161 lbs where the fwd CG is sloped line*/
        else if (newData.takeOffWeight > parseFloat(modelData.cgRange.midWgt)) {
            var lineX = lineEquation(newData.takeOffWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            toFwdCG = lineX;
            if (!((lineX <= newData.takeoffCG) && (newData.takeoffCG <= parseFloat(modelData.cgRange.midAft)))) {
                resultWarning("Takeoff CG out of limits.");
                colors["takeoff"] = "red";
                cgValid = false;
            }
        }
        /*Light zero fuel weight*/
        if (newData.zeroFuelWeight <= parseFloat(modelData.cgRange.midWgt)) {
            zeroFwdCG = parseFloat(modelData.cgRange.midFwd);
            if (!((parseFloat(modelData.cgRange.midFwd) <= newData.zeroFuelCG) &&
                    (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                resultWarning("Zero Fuel CG out of limits.");
                colors["zero"] = "red";
                cgValid = false;
            }
        }
        /*Heavier zero fuel weight over 2161 lbs where the fwd CG is sloped line*/
        else if (newData.zeroFuelWeight > parseFloat(modelData.cgRange.midWgt)) {
            lineX = lineEquation(newData.zeroFuelWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            zeroFwdCG = lineX;
            if (!((lineX <= newData.zeroFuelCG) && (newData.zeroFuelCG <= parseFloat(modelData.cgRange.midAft)))) {
                resultWarning("Zero Fuel CG out of limits.");
                colors["zero"] = "red";
                cgValid = false;
            }

        }
        /*Light landing weight*/
        if (newData.landingWeight <= parseFloat(modelData.cgRange.midWgt)) {
            ldgFwdCG = modelData.cgRange.midFwd;
        }
        /*Heavier landing weight over 2161 lbs where the fwd CG is sloped line*/
        else if (newData.landingWeight > parseFloat(modelData.cgRange.midWgt)) {
            lineX = lineEquation(newData.landingWeight, parseFloat(modelData.cgRange.maxWgt), parseFloat(modelData.cgRange.midWgt),
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            ldgFwdCG = lineX;
            if (!((lineX <= newData.landingCG) && (newData.landingCG <= parseFloat(modelData.cgRange.midAft)))) {
                resultWarning("Landing CG out of limits.");
                colors["landing"] = "red";
                cgValid = false;
            }
        }
        if (newData.landingWeight > aircraftObj.maxWeight) {
            colors["landing"] = "red";
            cgValid = false;
        }
    } else {
        /*DA42 CG Check*/
        if (newData.takeOffWeight > aircraftObj.maxTOWeight) {
            resultWarning("Takeoff weight exceeds " + aircraftObj.maxTOWeight + " lbs.");
            colors["takeoff"] = "red";
            cgValid = false;
        }

        /*light takeoff weight*/
        if (newData.takeOffWeight <= modelData.cgRange.midWgtFwd) {
            lineX = lineEquation(newData.takeOffWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            toFwdCG = modelData.cgRange.minFwd;
            toAftCG = lineX;
            if ((newData.takeoffCG > lineX) || (newData.takeoffCG < toFwdCG)) {
                resultWarning("Takeoff CG out of limits.");
                colors["takeoff"] = "red";
                cgValid = false;
            }
        }
        /*Mid takeoff weight*/
        else if (newData.takeOffWeight <= modelData.cgRange.midWgtAft) {
            aftLineX = lineEquation(newData.takeOffWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            fwdLineX = lineEquation(newData.takeOffWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            toFwdCG = fwdLineX;
            toAftCG = aftLineX;
            if ((newData.takeoffCG < fwdLineX) || (newData.takeoffCG > aftLineX)) {
                resultWarning("Takeoff CG out of limits.");
                colors["takeoff"] = "red";
                cgValid = false;
            }
        }
        /*Heavy takeoff weight*/
        else {
            lineX = lineEquation(newData.takeOffWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            toFwdCG = lineX;
            toAftCG = modelData.cgRange.maxAft;
            if ((newData.takeoffCG < lineX) || (newData.takeoffCG > modelData.cgRange.maxAft)) {
                resultWarning("Takeoff CG out of limits.");
                colors["takeoff"] = "red";
                cgValid = false;
            }
        }

        /*light zero fuel weight*/
        if (newData.zeroFuelWeight <= modelData.cgRange.midWgtFwd) {
            lineX = lineEquation(newData.zeroFuelWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            zeroFwdCG = modelData.cgRange.minFwd;
            zeroAftCG = lineX;
            if ((newData.zeroFuelCG > lineX) || (newData.zeroFuelCG < toFwdCG)) {
                resultWarning("Zero Fuel CG out of limits.");
                colors["zero"] = "red";
                cgValid = false;
            }
        }
        /*Mid zero fuel weight*/
        else if (newData.zeroFuelWeight <= modelData.cgRange.midWgtAft) {
            aftLineX = lineEquation(newData.zeroFuelWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            fwdLineX = lineEquation(newData.zeroFuelWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            zeroFwdCG = fwdLineX;
            zeroAftCG = aftLineX;
            if ((newData.zeroFuelCG < fwdLineX) || (newData.zeroFuelCG > aftLineX)) {
                resultWarning("Zero Fuel CG out of limits.");
                colors["zero"] = "red";
                cgValid = false;
            }
        }
        /*Heavy zero fuel weight*/
        else {
            lineX = lineEquation(newData.zeroFuelWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            zeroFwdCG = lineX;
            zeroAftCG = modelData.cgRange.maxAft;
            if ((newData.zeroFuelCG < lineX) || (newData.zeroFuelCG > modelData.cgRange.maxAft)) {
                resultWarning("Zero Fuel CG out of limits.");
                colors["zero"] = "red";
                cgValid = false;
            }
        }

        /*light landing weight*/
        if (newData.landingWeight <= modelData.cgRange.midWgtFwd) {
            lineX = lineEquation(newData.landingWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            ldgFwdCG = modelData.cgRange.minFwd;
            ldgAftCG = lineX;
            if ((newData.landingCG > lineX) || (newData.landingCG < toFwdCG)) {
                resultWarning("Landing CG out of limits.");
                colors["landing"] = "red";
                cgValid = false;
            }
        }
        /*Mid landing weight*/
        else if (newData.landingWeight <= modelData.cgRange.midWgtAft) {
            aftLineX = lineEquation(newData.landingWeight, modelData.cgRange.minWgt, modelData.cgRange.midWgtAft,
                modelData.cgRange.minAft, modelData.cgRange.midAft);
            fwdLineX = lineEquation(newData.landingWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            ldgFwdCG = fwdLineX;
            ldgAftCG = aftLineX;
            if ((newData.landingCG < fwdLineX) || (newData.landingCG > aftLineX)) {
                resultWarning("Landing CG out of limits.");
                colors["landing"] = "red";
                cgValid = false;
            }
        }
        /*Heavy landing weight*/
        else if (newData.landingWeight <= aircraftObj.maxLDGWeight) {
            lineX = lineEquation(newData.landingWeight, modelData.cgRange.maxWgt, modelData.cgRange.midWgtFwd,
                modelData.cgRange.maxFwd, modelData.cgRange.midFwd);
            ldgFwdCG = lineX;
            ldgAftCG = modelData.cgRange.maxAft;
            if ((newData.landingCG < lineX) || (newData.landingCG > modelData.cgRange.maxAft)) {
                resultWarning("Landing CG out of limits.");
                colors["landing"] = "red";
                cgValid = false;
            }
        } else if (newData.landingWeight > aircraftObj.maxLDGWeight) {
            resultWarning("Landing weight exceeds " + aircraftObj.maxLDGWeight + " lbs.");
            colors["landing"] = "red";
            cgValid = false;
        }
    }

    if (!isNaN(newData.zeroFuelWeight && newData.takeOffWeight && newData.landingWeight)) {
        document.getElementById("result_zero").innerHTML = "Zero Fuel: " + newData.zeroFuelWeight +
            " lbs | CG Range: " + zeroFwdCG + " - " + zeroAftCG +
            " | CG Actual: " + newData.zeroFuelCG;
        document.getElementById("result_takeoff").innerHTML = "Takeoff: " + newData.takeOffWeight +
            " lbs | CG Range: " + toFwdCG + " - " + toAftCG +
            " | CG Actual: " + newData.takeoffCG;
        document.getElementById("result_landing").innerHTML = "Landing: " + newData.landingWeight +
            " lbs | CG Range: " + ldgFwdCG + " - " + ldgAftCG +
            " | CG Actual: " + newData.landingCG;
    } else {
        cgValid = false
    }
    /*We are within CG!*/
    if (cgValid) {
        resultSuccess();
    }
    var resultCG = {
        "validCG": cgValid,
        "fwdCG": toFwdCG,
        "aftCG": toAftCG
    };

    localStorage.setItem("colors", JSON.stringify(colors));

    if (!localStorage.getItem("CG") || localStorage.getItem("CG") != JSON.stringify(resultCG)) {
        clearPerformance();
    }
    localStorage.setItem("CG", JSON.stringify(resultCG));
    updateDataTimestamp();

    drawCG(newData, userInput, modelData, colors);
    auditMode(newData, userInput, toFwdCG);
    saveFlightData();
}

function checkInputConstraints(modelData, userInput) {
    /**Input validation for user input using model data
     * returns: string with error text
     * returns: empty string if no errors
     **/

    if (modelData.model === "DA40F" || modelData.model === "DA40CS") {
        if (userInput.fuelWeight > modelData.maxFuel * 6.0) {
            return ["Max fuel exceeded.", "fuelStationDiv"];
        }
        if (userInput.baggage1Weight > modelData.maxBaggage) {
            return ["Max baggage exceeded.", "baggageStation1Div"];
        }
        if (userInput.fuelBurnWeight > userInput.fuelWeight) {
            return ["Fuel burn exceeds fuel available.", "fuelBurnDiv"];
        }
    } else if ((modelData.model === "DA40XL") || (modelData.model === "DA40XLS")) {
        if (userInput.fuelWeight > modelData.maxFuel * 6.0) {
            return ["Max fuel exceeded.", "fuelStationDiv"];
        }
        if (userInput.baggage1Weight > modelData.maxBaggage1) {
            return ["Max baggage exceeded.", "baggageStation1Div"];
        }
        if (userInput.baggage2Weight > modelData.maxBaggage2) {
            return ["Max extension baggage exceeded.", "baggageStation2Div"];
        }
        if ((userInput.baggage1Weight + userInput.baggage2Weight) > modelData.maxBaggage) {
            return ["Max combined baggage exceeded.", "baggageStation1Div"];
        }
        if (userInput.fuelBurnWeight > userInput.fuelWeight) {
            return ["Fuel burn exceeds fuel available.", "fuelBurnDiv"];
        }
    } else if (modelData.model === "DA42") {
        if (userInput.fuelWeight > modelData.maxFuel * 6.75) {
            return ["Max fuel exceeded.", "fuelStationDiv"];
        }
        if (userInput.auxFuelWeight > modelData.maxAuxFuel * 6.75) {
            return ["Max aux fuel exceeded.", "auxFuelStationDiv"];
        }
        if (userInput.deIceWeight > modelData.maxDeIce * 9.125) {
            return ["Max de-ice exceeded.", "deIceStationDiv"];
        }
        if (userInput.noseWeight > modelData.maxNoseBaggage) {
            return ["Max nose baggage exceeded.", "noseStationDiv"];
        }
        if (userInput.baggage1Weight > modelData.maxBaggage1) {
            return ["Max baggage exceeded.", "baggageStation1Div"];
        }
        if (userInput.baggage2Weight > modelData.maxBaggage2) {
            return ["Max extension baggage exceeded.", "baggageStation2Div"];
        }
        if ((userInput.baggage1Weight + userInput.baggage2Weight) > modelData.maxBaggage) {
            return ["Max combined baggage exceeded.", "baggageStation1Div"];
        }
        if (userInput.fuelBurnWeight > (userInput.fuelWeight + userInput.auxFuelWeight)) {
            return ["Fuel burn exceeds fuel available.", "fuelBurnDiv"];
        }
    }
    return "";
}

function loadUserData() {
    /**If the local storage data exists we need to load it into the form
     * This changes all the HTML elements to match the previous user data
     * It returns the userData object**/
    var userData = JSON.parse(localStorage.getItem("userInput"));
    var flightData = JSON.parse(localStorage.getItem("flightData"));
    var aircraftObj = userData.obj;

    if (flightData) {
        document.getElementById("studentName").value = flightData["studentName"];
        document.getElementById("instructorName").value = flightData["instructorName"];
        document.getElementById("practiceArea").value = flightData["practiceArea"];
        document.getElementById("flightLesson").value = flightData["flightLesson"];
        document.getElementById("timeEnroute").value = flightData["timeEnroute"];
        document.getElementById("dueBackTime").value = flightData["dueBackTime"];
    }

    document.getElementById("aircraftSelect").value = aircraftObj.tail;
    document.getElementById("frontStation").value = userData.frontStationWeight;
    document.getElementById("rearStation").value = userData.rearStationWeight;
    document.getElementById("baggageStation1").value = userData.baggage1Weight;
    document.getElementById("fuelStation").value = userData.fuelWeight / 6;
    document.getElementById("fuelBurn").value = userData.fuelBurnWeight / 6;

    if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS")) {
        document.getElementById("baggageStation2").value = userData.baggage2Weight;
    }
    if (aircraftObj.model === "DA42") {
        document.getElementById("fuelStation").value = userData.fuelWeight / 6.75;
        document.getElementById("fuelBurn").value = userData.fuelBurnWeight / 6.75;
        document.getElementById("baggageStation2").value = userData.baggage2Weight;
        document.getElementById("noseStation").value = userData.noseWeight;
        if (aircraftObj.auxTanks) {
            document.getElementById("auxFuelStation").value = userData.auxFuelWeight / 6.75;
        }
        if (aircraftObj.deIce) {
            document.getElementById("deIceStation").value = userData.deIceWeight / 9.125;
        }
    }
    return userData;
}

function lineEquation(yValue, y, y1, x, x1) {
    /**We take the yValue(aircraft weight) and two points on the line (x,y),(x1,y1)
     * We then find the slope of the line (m) and the y-intercept (b)
     * This allows us to get a line in y=mx+b form so we can solve for x using our yValue
     *
     **/
    var m = (y - y1) / (x - x1)
    var b = (m * -x1) + y1
    /*round to two decimal places*/
    return Math.round(((yValue - b) / m + Number.EPSILON) * 100) / 100;

}

function computeWB(aircraftObj, userInput) {
    /**Takes the aircraft object and user input object.
     * Computes all Moments, CGs, and Weights
     * returns: A new dict/object with the computed data
     *  **/
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);
    var computedData = {};
    /*Multiply all weights and arms(CG) to get moments*/
    computedData["emptyMoment"] = Math.round((parseFloat(aircraftObj.emptyWeight) * parseFloat(aircraftObj.aircraftArm) + Number.EPSILON) * 100) / 100;
    computedData["frontMoment"] = Math.round((parseFloat(modelData.frontStationCG) * userInput.frontStationWeight + Number.EPSILON) * 100) / 100;
    computedData["rearMoment"] = Math.round((parseFloat(modelData.rearStationCG) * userInput.rearStationWeight + Number.EPSILON) * 100) / 100;
    computedData["baggageMoment"] = Math.round((parseFloat(modelData.baggageStationCG) * userInput.baggage1Weight + Number.EPSILON) * 100) / 100;

    computedData["fuelMoment"] = Math.round((parseFloat(modelData.fuelStationCG) * userInput.fuelWeight + Number.EPSILON) * 100) / 100;
    computedData["fuelBurnMoment"] = Math.round((parseFloat(modelData.fuelStationCG) * userInput.fuelBurnWeight + Number.EPSILON) * 100) / 100;

    /*DA42 needs more computations for nose baggage, aux fuel, de-ice*/
    if (aircraftObj.model === "DA42") {
        if (aircraftObj.deIce) {
            computedData["deIceMoment"] = Math.round((parseFloat(modelData.deIceStationCG) * userInput.deIceWeight + Number.EPSILON) * 100) / 100;
        } else {
            computedData["deIceMoment"] = 0.0;
        }
        if (aircraftObj.auxTanks) {
            computedData["auxFuelMoment"] = Math.round((parseFloat(modelData.auxStationCG) * userInput.auxFuelWeight + Number.EPSILON) * 100) / 100;
        } else {
            computedData["auxFuelMoment"] = 0.0;
        }
        if (userInput.fuelBurnWeight > userInput.fuelWeight) {
            computedData["fuelBurnMoment"] = Math.round((parseFloat(modelData.auxStationCG) * (userInput.fuelBurnWeight - userInput.fuelWeight) + (parseFloat(modelData.fuelStationCG) * userInput.fuelWeight + Number.EPSILON)) * 100) / 100;
        }
        computedData["noseBagMoment"] = Math.round((parseFloat(modelData.noseBagStationCG) * userInput.noseWeight + Number.EPSILON) * 100) / 100;
        computedData["baggage2Moment"] = Math.round((parseFloat(modelData.baggageStation2CG) * userInput.baggage2Weight + Number.EPSILON) * 100) / 100;
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.noseBagMoment +
            computedData.deIceMoment + computedData.frontMoment + computedData.rearMoment +
            computedData.baggageMoment + computedData.baggage2Moment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.noseWeight + userInput.deIceWeight +
            userInput.frontStationWeight + userInput.rearStationWeight +
            userInput.baggage1Weight + userInput.baggage2Weight;

        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment + computedData.auxFuelMoment;
        computedData["takeOffWeight"] = Math.round((computedData.zeroFuelWeight + userInput.fuelWeight + userInput.auxFuelWeight) * 100) / 100;
        computedData["midpointMoment"] = computedData.zeroFuelMoment + computedData.auxFuelMoment;
        computedData["midpointWeight"] = Math.round((computedData.zeroFuelWeight + userInput.auxFuelWeight) * 100) / 100;
        computedData["midpointCG"] = Math.round((computedData.midpointMoment / computedData.midpointWeight + Number.EPSILON) * 100) / 100;
    }
    /*XL for the second baggage area*/
    else if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS") || (aircraftObj.model === "C172S")) {
        computedData["baggage2Moment"] = Math.round((parseFloat(modelData.baggageStation2CG) * userInput.baggage2Weight + Number.EPSILON) * 100) / 100;
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.frontMoment +
            computedData.rearMoment + computedData.baggageMoment + computedData.baggage2Moment;
        computedData["zeroFuelWeight"] = Math.round((aircraftObj.emptyWeight + userInput.frontStationWeight +
            userInput.rearStationWeight + userInput.baggage1Weight + userInput.baggage2Weight) * 100) / 100;
        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment
        computedData["takeOffWeight"] = Math.round((computedData.zeroFuelWeight + userInput.fuelWeight) * 100) / 100;

    }
    /*DA40 base computations*/
    else {
        computedData["zeroFuelMoment"] = computedData.emptyMoment + computedData.frontMoment +
            computedData.rearMoment + computedData.baggageMoment;
        computedData["zeroFuelWeight"] = aircraftObj.emptyWeight + userInput.frontStationWeight +
            userInput.rearStationWeight + userInput.baggage1Weight;
        computedData["takeOffMoment"] = computedData.zeroFuelMoment + computedData.fuelMoment;
        computedData["takeOffWeight"] = Math.round((computedData.zeroFuelWeight + userInput.fuelWeight) * 100) / 100;
    }
    /*Back to what all aircraft need computed*/
    computedData["zeroFuelCG"] = Math.round((computedData.zeroFuelMoment / computedData.zeroFuelWeight + Number.EPSILON) * 100) / 100;
    computedData["takeoffCG"] = Math.round((computedData.takeOffMoment / computedData.takeOffWeight + Number.EPSILON) * 100) / 100;
    computedData["landingWeight"] = Math.round(100 * (computedData.takeOffWeight - userInput.fuelBurnWeight)) / 100;
    computedData["landingMoment"] = Math.round((computedData.takeOffMoment - computedData.fuelBurnMoment + Number.EPSILON) * 100) / 100;
    computedData["landingCG"] = Math.round((computedData.landingMoment / computedData.landingWeight + Number.EPSILON) * 100) / 100;
    return computedData;
}

function clearResults() {
    /**Clears out the results section HTML when reset is hit**/
    document.getElementById("overall_result").innerHTML = "Limits:";
    if (document.getElementById("overall_result").classList.contains("list-group-item-success")) {
        document.getElementById("overall_result").classList.remove("list-group-item-success");
    }
    if (document.getElementById("overall_result").classList.contains("list-group-item-danger")) {
        document.getElementById("overall_result").classList.remove("list-group-item-danger");
    }
    document.getElementById("result_zero").innerHTML = "Zero Fuel:";
    document.getElementById("result_takeoff").innerHTML = "Takeoff:";
    document.getElementById("result_landing").innerHTML = "Landing:";
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
}

function auditMode(computedData, userInput, fwdCG) {
    /**Show detailed view in table format**/

    var tailNumber = document.getElementById('aircraftSelect').value;
    var aircraftObj = aircraft.find(x => x.tail === tailNumber)
    var modelData = aircraftModels.find(x => x.model === aircraftObj.model);

    document.getElementById("auditTitle").innerHTML = tailNumber + " Weight and Balance";

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
    document.getElementById("takeoff_mnt_td").innerHTML = computedData.takeOffMoment.toFixed(2);

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
        document.getElementById("bag2_tr").style.display = "none";

        document.getElementById("nose_wt_td").innerHTML = "-";
        document.getElementById("nose_cg_td").innerHTML = "-";
        document.getElementById("nose_mnt_td").innerHTML = "-";

        document.getElementById("deIce_wt_td").innerHTML = "-";
        document.getElementById("deIce_cg_td").innerHTML = "-";
        document.getElementById("deIce_mnt_td").innerHTML = "-";

        document.getElementById("aux_wt_td").innerHTML = "-";
        document.getElementById("aux_cg_td").innerHTML = "-";
        document.getElementById("aux_mnt_td").innerHTML = "-";
    }

    if ((aircraftObj.model === "DA40XL") || (aircraftObj.model === "DA40XLS")) {
        document.getElementById("bag2_tr").style.display = "";
        document.getElementById("bag2_wt_td").innerHTML = userInput.baggage2Weight;
        document.getElementById("bag2_cg_td").innerHTML = modelData.baggageStation2CG;
        document.getElementById("bag2_mnt_td").innerHTML = computedData.baggage2Moment;
    }
}

function resultWarning(warningText, warningDiv) {
    /**Sets top result HTML to red and displays warning text**/
    if (document.getElementById("overall_result").classList.contains("list-group-item-success"))
        document.getElementById("overall_result").classList.remove("list-group-item-success");

    if (!document.getElementById("overall_result").classList.contains("list-group-item-danger"))
        document.getElementById("overall_result").classList.add("list-group-item-danger");

    if (warningDiv && !document.getElementById(warningDiv).classList.contains("invalid"))
        document.getElementById(warningDiv).classList.add("invalid")

    document.getElementById("overall_result").innerHTML = "Not within limits. " + warningText;

}

function resultSuccess() {
    /**Sets top result HTML to green**/
    if (document.getElementById("overall_result").classList.contains("list-group-item-danger")) {
        document.getElementById("overall_result").classList.remove("list-group-item-danger");
    }
    if (!document.getElementById("overall_result").classList.contains("list-group-item-success")) {
        document.getElementById("overall_result").classList.add("list-group-item-success");
    }
    document.getElementById("overall_result").innerHTML = "Aircraft within limits.";
    updateNext(false);
    let formElements = document.getElementById("form_input").children;
    for (let i = 0; i < formElements.length; i++) {
        if (formElements[i].classList.contains("invalid"))
            formElements[i].classList.remove("invalid");
    }
}

function userAgreement() {
    sessionStorage.setItem("userAgree", "true");
    updateDataTimestamp();
}

function updateNext(disable=true) {
    if (disable) {
        if (!document.getElementById("navbarPerformance").classList.contains("disabled"))
            document.getElementById("navbarPerformance").classList.add("disabled");
        if (!document.getElementById("navbarRisk").classList.contains("disabled"))
            document.getElementById("navbarRisk").classList.add("disabled");
        if (!document.getElementById("navbarSummary").classList.contains("disabled"))
            document.getElementById("navbarSummary").classList.add("disabled");
        document.getElementById("next-button").disabled = true;
        return;
    }
    let flightInputs = Array.from(document.querySelectorAll("#flightInfoCollapse input"));
    let validFlight = flightInputs.filter(element => !element.value).length == 0;
    if (document.getElementById("overall_result").classList.contains("list-group-item-success") && validFlight) {
        document.getElementById("overall_result").innerHTML = "Aircraft within limits."
        document.getElementById("navbarPerformance").classList.remove("disabled");
        document.getElementById("next-button").disabled = false;
    }
}

function flightInfoWarning(warningElement, clear=false) {
    if (clear) {
        warningElement.classList.remove("invalid");
    } else {
        warningElement.classList.add("invalid");
    }
}

/*call to fill in the dropdown selector with tail numbers*/
fillData()
/*if local data exists, load it*/
if (localStorage.getItem("userInput") !== null) {
    loadUserData();
    aircraftSelection();
    if (sessionStorage.getItem("performance") && sessionStorage.getItem("performance") !== "{}" && sessionStorage.getItem("performance") !== "") {
        document.getElementById("navbarSummary").classList.remove("disabled");
        document.getElementById("navbarRisk").classList.remove("disabled");
    }
    if (sessionStorage.getItem("userAgree") === null) {
        let modal = new bootstrap.Modal(document.getElementById("Modal"), {"backdrop": "static"});
        modal.show();
        document.querySelector("#Modal button").addEventListener("click", () => {modal.hide();});
    }
} else {
    if (sessionStorage.getItem("userAgree") === null) {
        let modal = new bootstrap.Modal(document.getElementById("Modal"), {"backdrop": "static"});
        modal.show();
        document.querySelector("#Modal button").addEventListener("click", () => {modal.hide();});
    }
}

function clearPerformance() {
    console.log("Input changed; clearing weather and performance");
    sessionStorage.setItem("weather", "{}");
    sessionStorage.setItem("performance", "{}");
    document.getElementById("navbarSummary").classList.add("disabled");
    document.getElementById("navbarRisk").classList.add("disabled");
}

function updateDataTimestamp() {
    sessionStorage.setItem("modified", new Date().getTime());
    localStorage.setItem("modified", new Date().getTime());
}

function toggleCollapse() {
    const collapseDiv = document.getElementById("flightInfoCollapse");
    const shown = collapseDiv.classList.contains("show");
    if (!shown) {
        document.getElementById("flightInfoCollapseButton").innerHTML = "collapse_all"
        document.getElementById("aircraftSelectRow").classList.remove("hidden");
        document.getElementById("aircraftLabelDiv").classList.remove("hidden");
        document.getElementById("flightInfoSummary").classList.add("hidden");
        document.getElementById("emptyAircraftInfo").classList.remove("hidden");
        new bootstrap.Collapse(document.getElementById("flightInfoCollapse"));
        return;
    }
	
    const flightData = JSON.parse(localStorage.getItem("flightData"));
    if (flightData["studentName"] && flightData["instructorName"] && flightData["practiceArea"] && 
    flightData["flightLesson"] && flightData["timeEnroute"] && flightData["dueBackTime"]) {
        new bootstrap.Collapse(document.getElementById("flightInfoCollapse"));
        document.getElementById("flightInfoCollapseButton").innerHTML = "expand_all"
        document.getElementById("aircraftSelectRow").classList.add("hidden");
        document.getElementById("aircraftLabelDiv").classList.add("hidden");
        document.getElementById("flightInfoSummary").classList.remove("hidden");
        document.getElementById("emptyAircraftInfo").classList.add("hidden");
        return;
    }
    let formElements = Array.from(document.querySelectorAll("#flightInfoCollapse input"));
    let invalidElements = formElements.filter(element => !element.value);
    invalidElements.forEach(element => flightInfoWarning(element));
    let validElements = formElements.filter(element => element.value);
    validElements.forEach(element => flightInfoWarning(element, true));
}

document.getElementById("previous-button").addEventListener("click", function() {
    window.location.href = "../";
});
document.getElementById("next-button").addEventListener("click", function() {
    window.location.href = "../performance";
});

const flightInfoSummary = document.getElementById("flightInfoSummary");
flightInfoSummary.addEventListener("click", toggleCollapse);

const collapseButton = document.getElementById("collapseButton");
collapseButton.addEventListener("click", toggleCollapse);

const controller = new AbortController();
const { signal } = controller;
const flightInfoCollapse = document.getElementById("flightInfoCollapse");
let listener = flightInfoCollapse.addEventListener("focusout", (event) => {
    if (flightInfoCollapse.contains(event.relatedTarget)) return;
    saveFlightData(true, controller);
}, {signal})
saveFlightData();
