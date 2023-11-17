/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates home page
-------------------------------------------------------- */

// EFFECTS: tries to populate the closest N (amountToPopulate) 
//          restaurants on the home page
async function populateClosestRestaurants(amountToPopulate) {
    try {
        const userLocation = await getLocationFromUser();

        // get restaurant collection
        db.collection("restaurants").get()
            .then(restaurantCollection => {
                let unsortedMap = new Map();
                
                // create map with each restaurant and its distance 
                restaurantCollection.forEach(doc => { 
                    let distance = getDistanceFromLatLonInKm(
                        userLocation.coords.latitude, 
                        userLocation.coords.longitude, 
                        doc.data().location.latitude, 
                        doc.data().location.longitude);
                    unsortedMap.set(doc, distance);
                });    
                
                let sortedMap = new Map([...unsortedMap].sort());

                // add restaurant card for each key-value pair in the map
                sortedMap.forEach(function(value, key) {
                    let restaurantDoc = key;
                    let distance = value;

                    let cardTemplate = document.getElementById("restaurantCardTemplate");
                    let newcard = cardTemplate.content.cloneNode(true);

                    let restaurantID = restaurantDoc.id;
                    let address = restaurantDoc.data().address;
                    let city = restaurantDoc.data().city;
                    let postalCode = restaurantDoc.data().postalCode;
                    let status = restaurantDoc.data().status;
                    let dateUpdated = restaurantDoc.data().dateUpdated;
                    let distanceString = distance.toFixed(2) + "km away";
                    let statusString = "unknown";
                    let dateUpdatedString = "never";
        
                    if ((status != undefined) && (status != null)) {
                        statusString = generateWorkingString(status);
                    }
        
                    if ((dateUpdated != undefined) && (dateUpdated != null)) {
                        dateUpdatedString = generateTimeSinceString(dateUpdated);
                    }
                    
                    newcard.querySelector(".card-restaurant-address").innerHTML = address;
                    newcard.querySelector(".card-restaurant-city").innerHTML = city;
                    newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
                    newcard.querySelector(".card-restaurant-dateUpdated").innerHTML = dateUpdatedString;
                    newcard.querySelector(".card-restaurant-status").innerHTML = statusString;
                    newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
                    newcard.querySelector("a").href = "eachRestaurant.html?docID=" + restaurantID;
                    
                    let insertDiv = document.getElementById("closest-go-here");
                    if (insertDiv.children.length < amountToPopulate) {
                        insertDiv.appendChild(newcard);
                    }

                });
            });
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
    }
}

populateClosestRestaurants(3);