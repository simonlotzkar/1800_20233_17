/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restaurant catalog
-------------------------------------------------------- */

let amountToPopulate = 0;
let insertLocation = document.getElementById("restaurants-go-here")
let filter = document.getElementById("input-filter").value;

// add listener to filter form
document.getElementById("form-filter").addEventListener("submit", function(e) {
    e.preventDefault();
    filter = document.getElementById("input-filter").value;
    updateCatalog();
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-10-restaurants").addEventListener("click", function() {
    amountToPopulate = 10;
    updateCatalog();
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-25-restaurants").addEventListener("click", function() {
    amountToPopulate = 25;
    updateCatalog();
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-50-restaurants").addEventListener("click", function() {
    amountToPopulate = 50;
    updateCatalog();
});

// EFFECTS: ...TODO
function updateCatalog() {
    populateClosestRestaurants(insertLocation, amountToPopulate, filter);

    setTimeout(function() {
        numRestaurantsDisplayed = document.getElementById("restaurants-go-here").childElementCount;
        document.getElementById("currentNumberOfRestaurantsInDisplay").innerHTML = numRestaurantsDisplayed;
        document.getElementById("maxNumberOfRestaurantsToDisplay").innerHTML = amountToPopulate;
    }, 1000);
}