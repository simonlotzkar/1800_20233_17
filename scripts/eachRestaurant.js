/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the restaurant display and its list 
             of updates dynamically
-------------------------------------------------------- */

let restaurantID = new URL(window.location.href).searchParams.get("docID");
let cardTemplate = document.getElementById("updateCardTemplate");

// restaurant document listener
db.collection("restaurants").doc(restaurantID)
    .onSnapshot(doc => {
        let address = doc.data().address;
        let city = doc.data().city;
        let postalCode = doc.data().postalCode;
        let status = doc.data().status; 
        let dateUpdated = doc.data().dateUpdated;

        let statusString = "unknown";
        let dateUpdatedString = "never";

        if ((status != null) && (status != undefined)) {
            statusString = generateWorkingString(status);
        }
        if ((dateUpdated != null) && (dateUpdated != undefined)) {
            dateUpdatedString = generateTimeSinceString(dateUpdated);
        }

        document.getElementById("restaurant-address").innerHTML = address;
        document.getElementById("restaurant-city").innerHTML = city;
        document.getElementById("restaurant-postalCode").innerHTML = postalCode;
        document.getElementById("restaurant-dateUpdated").innerHTML = dateUpdatedString;
        document.getElementById("restaurant-status").innerHTML = statusString;
    });

// restaurant's update subcollection listener
db.collection("restaurants/" + restaurantID + "/updates").orderBy("dateSubmitted")
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => { 
            document.getElementById("updates-go-here").innerHTML = "";
            populateUpdateCards();
        })
    });

// EFFECTS: ...TODO
function populateUpdateCards() {
    db.collection("restaurants/" + restaurantID + "/updates").orderBy("dateSubmitted")
        .get().then(updateCollection => {
            updateCollection.forEach(updateDoc => {
                let updateID = updateDoc.id;
                let username = "ERROR";
                let userID = updateDoc.data().userID;
                let status = generateWorkingString(updateDoc.data().status);
                let dateSubmitted = generateDateString(updateDoc.data().dateSubmitted);

                let upvotes = updateDoc.data().upvotes;
                let downvotes = updateDoc.data().downvotes;
                let score = (upvotes - downvotes) + " (Upvotes: " + upvotes + ", Downvotes: " + downvotes + ")";

                // get user collection for username display
                db.collection("users").doc(userID).get()
                    .then(userDoc => {
                        username = userDoc.data().username;

                        let newcard = cardTemplate.content.cloneNode(true);

                        newcard.querySelector(".card-update-ID").innerHTML = updateID;
                        newcard.querySelector(".card-update-username").innerHTML = username;
                        newcard.querySelector(".card-update-status").innerHTML = status;
                        newcard.querySelector(".card-update-dateSubmitted").innerHTML = dateSubmitted;
                        newcard.querySelector(".card-update-score").innerHTML = score;

                        document.getElementById("updates-go-here").prepend(newcard);
                        
                        // adds listener to upvote btn and increments when clicked
                        document.getElementById("input-update-upvote").addEventListener("click", function() {
                            db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                            .update({
                                upvotes: firebase.firestore.FieldValue.increment(1),
                            });
                        });

                        // adds listener to downvote btn and increments when clicked
                        document.getElementById("input-update-downvote").addEventListener("click", function() {
                            db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                            .update({
                                downvotes: firebase.firestore.FieldValue.increment(1),
                            });
                        });
                    });
            });
            // for the collection
        });
    // for the function
}