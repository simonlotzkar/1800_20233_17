/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restaurant catalog
-------------------------------------------------------- */

// EFFECTS: tries to populate the restaurants on the catalog page
async function populateRestaurants() {
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
                    let doc = key;
                    let distance = value;

                    let cardTemplate = document.getElementById("restaurantCardTemplate");
                    let newcard = cardTemplate.content.cloneNode(true);
                    let address = doc.data().address;
                    let city = doc.data().city;
                    let postalCode = doc.data().postalCode;
                    let distanceString = distance.toFixed(2) + "km away";
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

// EFFECTS: tries to populate the restaurants on the catalog 
//          page with the filter in the search bar
async function populateFilteredRestaurants() {
    document.getElementById("restaurants-go-here").innerHTML = "";
    let filter = document.getElementById("input-searchbar").value;
    
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

                // add restaurant card for each key-value pair in the map that matches the filter
                sortedMap.forEach(function(value, key) {
                    let doc = key;
                    let distance = value;

                    let cardTemplate = document.getElementById("restaurantCardTemplate");
                    let newcard = cardTemplate.content.cloneNode(true);
                    let address = doc.data().address;

                    if (address.toLowerCase().includes(filter)) {
                        let city = doc.data().city;
                        let postalCode = doc.data().postalCode;
                        let distanceString = distance.toFixed(2) + "km away";
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
                    }
                });
            });
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
    }
}