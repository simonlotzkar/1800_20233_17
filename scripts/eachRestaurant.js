// EFFECTS: Creates a card representing an update for every update belonging
//          to the restaurant with the given ID.
function generateUpdateCards(restaurantID) {
    let cardTemplate = document.getElementById("updateCardTemplate");

    db.collection("restaurants/" + restaurantID + "/updates").orderBy("date", "desc").get()
        .then(updates => {
            updates.forEach(doc => { 
                var displayName = doc.data().displayName;
                var working = doc.data().working;
                var date = doc.data().date;
                var updateID = doc.id;
  
                let newcard = cardTemplate.content.cloneNode(true);
  
                newcard.querySelector('.card-update-ID').innerHTML = updateID;
                newcard.querySelector('.card-update-displayName').innerHTML = displayName;
                newcard.querySelector('.card-update-working').innerHTML = generateWorkingString(working);
                newcard.querySelector('.card-update-date').innerHTML = date.toDate();
    
                document.getElementById("updates-go-here").appendChild(newcard);
            })
        })
}  

// EFFECTS: ...
function generateRestaurant() {
    let restaurantID = new URL(window.location.href).searchParams.get("docID");

    db.collection("restaurants").doc(restaurantID).get()
        .then(doc => {
            address = doc.data().address;
            city = doc.data().city;
            postalCode = doc.data().postalCode;

            workingString = "Unknown";
            lastUpdatedString = "Never";

            if (doc.data().working != undefined) {
                workingString = generateWorkingString(doc.data().working);
            }

            if (doc.data().lastUpdated != undefined) {
                lastUpdatedString = generateTimeSinceString(doc.data().lastUpdated);
            }

            document.getElementById("restaurant-address").innerHTML = address;
            document.getElementById("restaurant-city").innerHTML = city;
            document.getElementById("restaurant-postalCode").innerHTML = postalCode;
            document.getElementById("restaurant-lastUpdated").innerHTML = lastUpdatedString;
            document.getElementById("restaurant-working").innerHTML = workingString;
            
            generateUpdateCards(restaurantID);
        } );
}

generateRestaurant();