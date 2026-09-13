function getQuestionRows() {
    const cells = document.querySelectorAll('#risk-table .selectable-cell');
    return [...new Set([...cells].map((c) => c.dataset.row))];
}

function handleCellClick(cell) {
    const selectedRow = cell.dataset.row;
    // Deselect other cells in the same row
    document.querySelectorAll(`.selectable-cell[data-row="${selectedRow}"]`).forEach((cell) => {
        cell.classList.remove('selected');
        cell.classList.remove('no-fly')
    });
    // Select the clicked cell
    cell.classList.add('selected');
    document.querySelector(`.score-cell[data-row="${selectedRow}"]`).innerHTML = cell.dataset.col;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    let riskCat = 0;
    let noFly = false;
    document.querySelectorAll(`.selected`).forEach((cell) => {
        if (cell.dataset.col == "NO FLY") {
            noFly = true;
            addNoFly(cell);
        } else {
            total += parseInt(cell.dataset.col);
        }
    });
    if (!noFly) 
        removeNoFly();
    document.getElementById("totalRisk").innerHTML = noFly ? "NO FLY" : `${total}`;
    if (total < 20 && !noFly) {
        riskCat = 0;
        document.getElementById("risk0").classList.remove("hidden");
        document.getElementById("risk1").classList.add("hidden");
        document.getElementById("risk2").classList.add("hidden");
    } else if (total < 30 && !noFly) {
        riskCat = 1;
        document.getElementById("risk0").classList.add("hidden");
        document.getElementById("risk1").classList.remove("hidden");
        document.getElementById("risk2").classList.add("hidden");
    } else {
        riskCat = 2;
        document.getElementById("risk0").classList.add("hidden");
        document.getElementById("risk1").classList.add("hidden");
        document.getElementById("risk2").classList.remove("hidden");
        addNoFly();
        noFly = true;
    }
    let riskData = {
        "riskScore": total,
        "riskCat": riskCat,
        "selectedCells": getSelectedCells(),
        "noFly": noFly,
    };
    sessionStorage.setItem("riskData", JSON.stringify(riskData));
    updateDataTimestamp();
    if (!noFly) 
        validateCompletion();
}

function validateCompletion() { // Make sure all questions are answered
    let completed = true;
    for (const row of getQuestionRows()) {
        let rowCompleted = false;
        document.querySelectorAll(`.selectable-cell[data-row="${CSS.escape(row)}"]`).forEach((cell) => {
            if (cell.classList.contains("selected"))
                rowCompleted = true;
        });
        if (!rowCompleted)
            completed = false;
    }
    if (completed) {
        document.getElementById("next-button").disabled = false;
        document.getElementById("navbarSummary").classList.remove("disabled");
        let riskData = JSON.parse(sessionStorage.getItem("riskData"));
        riskData['completed'] = true;
        sessionStorage.setItem("riskData", JSON.stringify(riskData));
    }
}

function addNoFly(cell) {
    if (cell)
        cell.classList.add("no-fly");
    document.getElementById("noFlyHeader").classList.add("no-fly");
    document.getElementById("totalRisk").classList.add("no-fly");
    document.getElementById("next-button").disabled = true;
    document.getElementById("navbarSummary").classList.add("disabled");
}

function removeNoFly() {
    document.querySelectorAll(".no-fly").forEach(e => {e.classList.remove("no-fly")});
}

function getSelectedCells() {
    let selected = document.getElementsByClassName("selected");
    let selectedCells = [];
    for (let i = 0; i < selected.length; i++) {
        let cell = selected.item(i);
        selectedCells.push([cell.dataset.row, cell.dataset.col]);
    }
    return selectedCells;
}

function populateCells() {
    if (sessionStorage.getItem("riskData")) {
        let cells = JSON.parse(sessionStorage.getItem("riskData")).selectedCells;
        for (let c of cells) {
            let cell = document.querySelector(`.selectable-cell[data-row="${c[0]}"][data-col="${c[1]}"]`);
            handleCellClick(cell);
        }
    }
}

function clear() {
    for (const row of getQuestionRows()) {
        document.querySelectorAll(`.selectable-cell[data-row="${CSS.escape(row)}"]`).forEach((cell) => {
            cell.classList.remove('selected');
        });
        document.querySelector(`.score-cell[data-row="${CSS.escape(row)}"]`).innerHTML = "";
    }
    removeNoFly();
    document.getElementById("risk0").classList.add("hidden");
    document.getElementById("risk1").classList.add("hidden");
    document.getElementById("risk2").classList.add("hidden");
    document.getElementById("totalRisk").innerHTML = "";
    sessionStorage.removeItem("riskData");
    document.getElementById("next-button").disabled = true;
    document.getElementById("navbarSummary").classList.add("disabled");
}

function updateDataTimestamp() {
    sessionStorage.setItem("modified", new Date().getTime());
    localStorage.setItem("modified", new Date().getTime());
}

document.getElementById("previous-button").addEventListener("click", function() {
    window.location.href = "../performance";
});
document.getElementById("next-button").addEventListener("click", function() {
    window.location.href = "../summary";
});
document.getElementById("clearButton").addEventListener("click", clear);
populateCells();
