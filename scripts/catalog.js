/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restaurant catalog
-------------------------------------------------------- */

let amountToPopulate = 10;
let insertLocation = document.getElementById("restaurants-go-here")
let filter = document.getElementById("input-filter").value;

populateClosestRestaurants(insertLocation, amountToPopulate, filter);

// add listener to filter form
document.getElementById("form-filter").addEventListener("submit", function(e) {
    e.preventDefault();
    filter = document.getElementById("input-filter").value;
    populateClosestRestaurants(insertLocation, amountToPopulate, filter);
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-10-restaurants").addEventListener("click", function() {
    amountToPopulate = 10;
    populateClosestRestaurants(insertLocation, amountToPopulate, filter);
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-25-restaurants").addEventListener("click", function() {
    amountToPopulate = 25;
    populateClosestRestaurants(insertLocation, amountToPopulate, filter);
});

// add listener to display amount of restaurants to display dropdown options
document.getElementById("display-50-restaurants").addEventListener("click", function() {
    amountToPopulate = 50;
    populateClosestRestaurants(insertLocation, amountToPopulate, filter);
});