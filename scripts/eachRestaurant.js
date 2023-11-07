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
        let workingString = "Unknown";
        let lastUpdatedString = "Never";

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
    });

// restaurant's update subcollection listener
db.collection("restaurants/" + restaurantID + "/updates").orderBy("date")
    .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => { 
            let changedUpdateData = change.doc.data();
            // new update added
            if (change.type === "added") {
                let userName = changedUpdateData.userName;
                let working = changedUpdateData.working;
                let date = changedUpdateData.date;
                let updateID = change.doc.id;
    
                let newcard = cardTemplate.content.cloneNode(true);
    
                newcard.querySelector(".card-update-ID").innerHTML = updateID;
                newcard.querySelector(".card-update-userName").innerHTML = userName;
                newcard.querySelector(".card-update-working").innerHTML = generateWorkingString(working);
                newcard.querySelector(".card-update-date").innerHTML = generateDateString(date);
    
                document.getElementById("updates-go-here").prepend(newcard);
            }
            // update edited
            if (change.type === "modified") {
                console.log("Modified update: ", changedUpdateData);
            }
            // update deleted
            if (change.type === "removed") {
                console.log("Removed update: ", changedUpdateData);
            }
        })
    });