/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restauarnt catalog
-------------------------------------------------------- */

let cardTemplate = document.getElementById("restaurantCardTemplate");
  
db.collection("restaurants").get()
    .then(allRestaurants => {
        allRestaurants.forEach(doc => { 
            var address = doc.data().address;
            var city = doc.data().city;
            var postalCode = doc.data().postalCode;
            var statusString = "Unknown";
            var dateUpdatedString = "Never";

            if ((doc.data().status != undefined) && (doc.data().status != null)) {
                statusString = generateWorkingString(doc.data().working);
            }

            if ((doc.data().dateUpdated != undefined) && (doc.data().dateUpdated != null)) {
                dateUpdatedString = generateTimeSinceString(doc.data().dateUpdated);
            }

            var docID = doc.id;

            let newcard = cardTemplate.content.cloneNode(true);
            
            newcard.querySelector(".card-restaurant-address").innerHTML = address;
            newcard.querySelector(".card-restaurant-city").innerHTML = city;
            newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
            newcard.querySelector(".card-restaurant-dateUpdated").innerHTML = dateUpdatedString;
            newcard.querySelector(".card-restaurant-status").innerHTML = statusString;

            newcard.querySelector("a").href = "eachRestaurant.html?docID=" + docID;
        
            // APPEND CARD
            document.getElementById("restaurants-go-here").appendChild(newcard);
        })
    }   
);