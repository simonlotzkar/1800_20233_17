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
            // update was added
            if (change.type === "added") {
                let updateID = change.doc.id;
                let username = "ERROR";
                let userID = change.doc.data().userID;
                let status = generateWorkingString(change.doc.data().status);
                let dateSubmitted = generateDateString(change.doc.data().dateSubmitted);
                let upvotes = change.doc.data().upvotes;
                let downvotes = change.doc.data().downvotes;
                let score = upvotes - downvotes;

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
                    });
            }
            // update was modified
            if (change.type === "modified") {
                console.log("Modified update: ", change.doc.data());
            }
            // update was removed
            if (change.type === "removed") {
                console.log("Removed update: ", change.doc.data());
            }
        })
    });