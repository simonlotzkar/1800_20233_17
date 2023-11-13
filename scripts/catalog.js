/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar, CarlyOrr
DESCRIPTION: populates restaurant catalog
-------------------------------------------------------- */

// EFFECTS: tries to populate the restaurants on the catalog page
async function populateRestaurants() {
    try {
        const userLocation = await getLocationFromUser();

        // updates each restaurant's distance field
        db.collection("restaurants").get()
            .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                    doc.ref.update({
                        distance: getDistanceFromLatLonInKm(
                            userLocation.coords.latitude, 
                            userLocation.coords.longitude, 
                            doc.data().location.latitude, 
                            doc.data().location.longitude),
                    });
                });
            });

        // restaurant collection listener, adds a card for each restaurant
        db.collection("restaurants").orderBy("distance").get()
            .then(allRestaurants => {
                allRestaurants.forEach(doc => { 
                    let cardTemplate = document.getElementById("restaurantCardTemplate");
                    let newcard = cardTemplate.content.cloneNode(true);
                    let address = doc.data().address;
                    let city = doc.data().city;
                    let postalCode = doc.data().postalCode;
                    let distanceString = doc.data().distance.toFixed(2) + "km away";
                    let statusString = "unknown";
                    let dateUpdatedString = "never";

                    if ((doc.data().status != undefined) && (doc.data().status != null)) {
                        statusString = generateWorkingString(doc.data().status);
                    }

                    if ((doc.data().dateUpdated != undefined) && (doc.data().dateUpdated != null)) {
                        dateUpdatedString = generateTimeSinceString(doc.data().dateUpdated);
                    }
                    
                    newcard.querySelector(".card-restaurant-address").innerHTML = address;
                    newcard.querySelector(".card-restaurant-city").innerHTML = city;
                    newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
                    newcard.querySelector(".card-restaurant-dateUpdated").innerHTML = dateUpdatedString;
                    newcard.querySelector(".card-restaurant-status").innerHTML = statusString;
                    newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
                    newcard.querySelector("a").href = "eachRestaurant.html?docID=" + doc.id;
                    
                    document.getElementById("restaurants-go-here").appendChild(newcard);
                });
            });
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
    }
}

populateRestaurants();