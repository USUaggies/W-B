function handleCellClick(cell) {
	const selectedRow = cell.dataset.row;

	// Deselect other cells in the same row
	document.querySelectorAll(`.selectable-cell[data-row="${selectedRow}"]`).forEach((cell) => {
		cell.classList.remove('selected');
	});

	// Select the clicked cell
	cell.classList.add('selected');

	document.querySelector(`.score-cell[data-row="${selectedRow}"]`).innerHTML = cell.dataset.col;
	updateTotal();
}

function updateTotal() {
	let total = 0;
	let fiveCount = 0;
	let riskCat = 0;
	document.querySelectorAll(`.selected`).forEach((cell) => {
		total += parseInt(cell.dataset.col);
		if (parseInt(cell.dataset.col) == 5)
			fiveCount++;
	});
	document.getElementById("totalRisk").innerHTML = `${total}`;
	if (total <= 20 && fiveCount < 2){
		riskCat = 0;
		document.getElementById("risk0").classList.remove("hidden");
		document.getElementById("risk1").classList.add("hidden");
		document.getElementById("risk2").classList.add("hidden");
	} else if (fiveCount == 2 && total <= 32 || fiveCount < 2 && total > 20 && total <= 32){
		riskCat = 1;
		document.getElementById("risk0").classList.add("hidden");
		document.getElementById("risk1").classList.remove("hidden");
		document.getElementById("risk2").classList.add("hidden");
	} else if (fiveCount > 2 || total > 32){
		riskCat = 2;
		document.getElementById("risk0").classList.add("hidden");
		document.getElementById("risk1").classList.add("hidden");
		document.getElementById("risk2").classList.remove("hidden");
	}
	
	let riskData = {"riskScore": total, "riskCat": riskCat, "selectedCells": getSelectedCells()};
	
	sessionStorage.setItem("riskData", JSON.stringify(riskData));
	updateDataTimestamp();
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
	cells = JSON.parse(sessionStorage.getItem("riskData")).selectedCells;
	for (let c of cells) {
		let cell = document.querySelector(`.selectable-cell[data-row="${c[0]}"][data-col="${c[1]}"]`);
		handleCellClick(cell);
	}
}

function clear() {
	for(let i = 0; i < 10; i++) {
		document.querySelectorAll(`.selectable-cell[data-row="${i}"]`).forEach((cell) => {
		cell.classList.remove('selected');
	});
		document.querySelector(`.score-cell[data-row="${i}"]`).innerHTML = "";

	}
	document.getElementById("risk0").classList.add("hidden");
	document.getElementById("risk1").classList.add("hidden");
	document.getElementById("risk2").classList.add("hidden");
	document.getElementById("totalRisk").innerHTML = "";
	sessionStorage.removeItem("riskData");
}

function updateDataTimestamp() {
	sessionStorage.setItem("modified", new Date().getTime());
	localStorage.setItem("modified", new Date().getTime());
}

if (sessionStorage.getItem("performance") !== null){
        document.getElementById("navbarSummary").classList.remove("disabled");
    }

document.getElementById("previous-button").addEventListener("click", function(){
	window.location.href = "performance.html";
});
document.getElementById("next-button").addEventListener("click", function(){
	window.location.href = "summary.html";
});

document.getElementById("clearButton").addEventListener("click", clear);
populateCells();
