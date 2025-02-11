const minsToExpire = 30;

// Erase data if it hasn't been modified in 15 mins
function checkDataValidity() {
    let currDate = new Date().getTime();
    let modifiedDate1 = sessionStorage.getItem("modified");
    let modifiedDate2 = localStorage.getItem("modified");
    if (((modifiedDate1 && currDate - modifiedDate1 > 1000 * 60 * minsToExpire) && (modifiedDate2 && currDate - modifiedDate2 > 1000 * 60 * minsToExpire)) || (modifiedDate1 && !modifiedDate2 && currDate - modifiedDate1 > 1000 * 60 * minsToExpire) || (modifiedDate2 && !modifiedDate1 && currDate - modifiedDate2 > 1000 * 60 * minsToExpire)) {
        resetAllData();
    }
}

function resetAllData() {
    sessionStorage.clear();
    localStorage.clear();
    if (window.location.href != "https://caas.usu.edu/avte/weight-balance/") {
        window.location.href = "../";
    }
}

checkDataValidity();
