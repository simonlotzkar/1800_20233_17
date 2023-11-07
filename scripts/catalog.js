/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates restauarnt catalog
-------------------------------------------------------- */

function populateRestaurantCards() {
    let cardTemplate = document.getElementById("restaurantCardTemplate");
  
    db.collection("restaurants").get()
        .then(allRestaurants=> {
            allRestaurants.forEach(doc => { 
                var address = doc.data().address;
                var city = doc.data().city;
                var postalCode = doc.data().postalCode;
                var workingString = "Unknown";
                var lastUpdatedString = "Never";

                if (doc.data().working != undefined) {
                    workingString = generateWorkingString(doc.data().working);
                }

                if (doc.data().lastUpdated != undefined) {
                    lastUpdatedString = generateTimeSinceString(doc.data().lastUpdated);
                }

                var docID = doc.id;

                let newcard = cardTemplate.content.cloneNode(true);
                
                newcard.querySelector('.card-restaurant-address').innerHTML = address;
                newcard.querySelector('.card-restaurant-city').innerHTML = city;
                newcard.querySelector('.card-restaurant-postalCode').innerHTML = postalCode;
                newcard.querySelector('.card-restaurant-lastUpdated').innerHTML = lastUpdatedString;
                newcard.querySelector('.card-restaurant-working').innerHTML = workingString;

                newcard.querySelector('a').href = "eachRestaurant.html?docID=" + docID;
            
                // APPEND CARD
                document.getElementById("restaurants-go-here").appendChild(newcard);
            })
        })
  }
  
  populateRestaurantCards();
