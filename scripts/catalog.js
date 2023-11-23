/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restaurant catalog
-------------------------------------------------------- */

let insertLocation = document.getElementById("restaurants-go-here")
populateClosestRestaurants(insertLocation, 30, "");

// add listener to filter form
document.getElementById("form-filter").addEventListener("submit", function(e) {
    e.preventDefault();
    let filter = document.getElementById("input-filter").value;
    populateClosestRestaurants(insertLocation, 30, filter);
});