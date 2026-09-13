function getQuestionRows() {
    const cells = document.querySelectorAll('#risk-table .selectable-cell');
    return [...new Set([...cells].map((c) => c.dataset.row))];
}

// Backwards-compatible alias: old code hard-coded 10 vs 12. Keep a live
// value for any external readers instead of a stale constant.
if (typeof window !== "undefined" && !Object.getOwnPropertyDescriptor(window, "NUM_QUESTIONS")) {
    Object.defineProperty(window, "NUM_QUESTIONS", {
        get: () => getQuestionRows().length,
        set: () => {},
        configurable: true,
    });
}

function escAttr(value) {
    const s = String(value);
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    return s.replace(/["\\]/g, "\\$&");
}

function el(id) {
    return document.getElementById(id);
}

function handleCellClick(cell) {
    if (!cell || !cell.dataset) return;
    const selectedRow = cell.dataset.row;
    const rowSel = escAttr(selectedRow);
    // Deselect other cells in the same row
    document.querySelectorAll(`#risk-table .selectable-cell[data-row="${rowSel}"]`).forEach((c) => {
        c.classList.remove('selected');
        c.classList.remove('no-fly')
    });
    // Select the clicked cell
    cell.classList.add('selected');
    const scoreCell = document.querySelector(`#risk-table .score-cell[data-row="${rowSel}"]`);
    if (scoreCell) scoreCell.innerHTML = cell.dataset.col;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    let riskCat = 0;
    let noFly = false;
    document.querySelectorAll(`#risk-table .selectable-cell.selected`).forEach((cell) => {
        if (cell.dataset.col == "NO FLY") {
            noFly = true;
            addNoFly(cell);
        } else {
            const value = parseInt(cell.dataset.col, 10);
            if (!isNaN(value)) total += value;
        }
    });
    if (!noFly)
        removeNoFly();
    const totalRisk = el("totalRisk");
    if (totalRisk) totalRisk.innerHTML = noFly ? "NO FLY" : `${total}`;
    const risk0 = el("risk0"), risk1 = el("risk1"), risk2 = el("risk2");
    if (total < 20 && !noFly) {
        riskCat = 0;
        if (risk0) risk0.classList.remove("hidden");
        if (risk1) risk1.classList.add("hidden");
        if (risk2) risk2.classList.add("hidden");
    } else if (total < 30 && !noFly) {
        riskCat = 1;
        if (risk0) risk0.classList.add("hidden");
        if (risk1) risk1.classList.remove("hidden");
        if (risk2) risk2.classList.add("hidden");
    } else {
        riskCat = 2;
        if (risk0) risk0.classList.add("hidden");
        if (risk1) risk1.classList.add("hidden");
        if (risk2) risk2.classList.remove("hidden");
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
        document.querySelectorAll(`#risk-table .selectable-cell[data-row="${escAttr(row)}"]`).forEach((cell) => {
            if (cell.classList.contains("selected"))
                rowCompleted = true;
        });
        if (!rowCompleted)
            completed = false;
    }
    if (completed) {
        const nextButton = el("next-button");
        if (nextButton) nextButton.disabled = false;
        const navbarSummary = el("navbarSummary");
        if (navbarSummary) navbarSummary.classList.remove("disabled");
        try {
            let riskData = JSON.parse(sessionStorage.getItem("riskData"));
            if (riskData) {
                riskData['completed'] = true;
                sessionStorage.setItem("riskData", JSON.stringify(riskData));
            }
        } catch (e) { /* storage unavailable or corrupt; completion UI already updated */ }
    }
}

function addNoFly(cell) {
    if (cell)
        cell.classList.add("no-fly");
    const noFlyHeader = el("noFlyHeader");
    if (noFlyHeader) noFlyHeader.classList.add("no-fly");
    const totalRisk = el("totalRisk");
    if (totalRisk) totalRisk.classList.add("no-fly");
    const nextButton = el("next-button");
    if (nextButton) nextButton.disabled = true;
    const navbarSummary = el("navbarSummary");
    if (navbarSummary) navbarSummary.classList.add("disabled");
}

function removeNoFly() {
    document.querySelectorAll(".no-fly").forEach(e => {e.classList.remove("no-fly")});
}

function getSelectedCells() {
    let selected = document.querySelectorAll('#risk-table .selectable-cell.selected');
    let selectedCells = [];
    for (let i = 0; i < selected.length; i++) {
        let cell = selected[i];
        if (cell && cell.dataset && cell.dataset.row !== undefined)
            selectedCells.push([cell.dataset.row, cell.dataset.col]);
    }
    return selectedCells;
}

function populateCells() {
    let raw = null;
    try {
        raw = sessionStorage.getItem("riskData");
    } catch (e) { return; }
    if (!raw) return;
    let cells;
    try {
        cells = JSON.parse(raw).selectedCells;
    } catch (e) { return; }
    if (!Array.isArray(cells)) return;
    for (let c of cells) {
        if (!Array.isArray(c)) continue;
        const cell = document.querySelector(`#risk-table .selectable-cell[data-row="${escAttr(c[0])}"][data-col="${escAttr(c[1])}"]`);
        if (!cell) continue; // stored row/col no longer on this version of the table
        handleCellClick(cell);
    }
}

function clear() {
    for (const row of getQuestionRows()) {
        document.querySelectorAll(`#risk-table .selectable-cell[data-row="${escAttr(row)}"]`).forEach((cell) => {
            cell.classList.remove('selected');
        });
        const scoreCell = document.querySelector(`#risk-table .score-cell[data-row="${escAttr(row)}"]`);
        if (scoreCell) scoreCell.innerHTML = "";
    }
    removeNoFly();
    const risk0 = el("risk0"), risk1 = el("risk1"), risk2 = el("risk2");
    if (risk0) risk0.classList.add("hidden");
    if (risk1) risk1.classList.add("hidden");
    if (risk2) risk2.classList.add("hidden");
    const totalRisk = el("totalRisk");
    if (totalRisk) totalRisk.innerHTML = "";
    sessionStorage.removeItem("riskData");
    const nextButton = el("next-button");
    if (nextButton) nextButton.disabled = true;
    const navbarSummary = el("navbarSummary");
    if (navbarSummary) navbarSummary.classList.add("disabled");
}

function updateDataTimestamp() {
    try {
        sessionStorage.setItem("modified", new Date().getTime());
        localStorage.setItem("modified", new Date().getTime());
    } catch (e) { /* storage unavailable; non-fatal */ }
}

function bindRiskNav() {
    const prev = el("previous-button");
    if (prev) prev.addEventListener("click", function() {
        window.location.href = "../performance";
    });
    const next = el("next-button");
    if (next) next.addEventListener("click", function() {
        window.location.href = "../summary";
    });
    const clearBtn = el("clearButton");
    if (clearBtn) clearBtn.addEventListener("click", clear);
    populateCells();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindRiskNav);
} else {
    bindRiskNav();
}
