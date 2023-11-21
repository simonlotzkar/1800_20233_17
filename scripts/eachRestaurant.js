/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the restaurant display and its list 
             of updates dynamically
-------------------------------------------------------- */

let restaurantID = new URL(window.location.href).searchParams.get("docID");
let cardTemplate = document.getElementById("updateCardTemplate");
let currentUser;
let numOfCards = 0;

// assign currentUser if logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // user is logged in
        currentUser = user;
    } else {
        // user is not logged in
    }
});

// EFFECTS: ...TODO
async function populateRestaurantPage() {
    try {
        const userLocation = await getLocationFromUser();

        populateRestaurantDetails(restaurantID, userLocation);
        populateUpdateLog();
        displaySubmitUpdate();
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
    }
}

populateRestaurantPage();

// EFFECTS: ...TODO
function populateRestaurantDetails(restaurantID, userLocation) {
    db.collection("restaurants").doc(restaurantID)
        .onSnapshot(doc => {
            let address = doc.data().address;
            let city = doc.data().city;
            let postalCode = doc.data().postalCode;
            let status = doc.data().status; 
            let dateUpdated = doc.data().dateUpdated;

            let statusString = "unknown";
            let dateUpdatedString = "never";

            let distance = getDistanceFromLatLonInKm(
                userLocation.coords.latitude, 
                userLocation.coords.longitude, 
                doc.data().location.latitude, 
                doc.data().location.longitude);
            let distanceString = distance.toFixed(2) + "km away";

            if ((status != null) && (status != undefined)) {
                statusString = generateWorkingString(status);
            }
            if ((dateUpdated != null) && (dateUpdated != undefined)) {
                dateUpdatedString = generateTimeSinceString(dateUpdated);
            }

            document.getElementById("restaurant-address").innerHTML = address;
            document.getElementById("restaurant-city").innerHTML = city;
            document.getElementById("restaurant-postalCode").innerHTML = postalCode;
            document.getElementById("restaurant-distance").innerHTML = distanceString;
            document.getElementById("restaurant-dateUpdated").innerHTML = dateUpdatedString;
            document.getElementById("restaurant-status").innerHTML = statusString;

            document.querySelector(".brokenBtn").addEventListener("click", function() {
                submitUpdate(false, restaurantID);
            });

            document.querySelector(".workingBtn").addEventListener("click", function() {
                submitUpdate(true, restaurantID);
            });
        });
}

// EFFECTS: ...TODO
function populateUpdateLog() {
    db.collection("restaurants/" + restaurantID + "/updates")
        .onSnapshot(snapshot => {
            // reset update log
            document.getElementById("updates-go-here").innerHTML = "";

            // go through each update for the current restaurant...
            db.collection("restaurants/" + restaurantID + "/updates").orderBy("dateSubmitted", "desc").get()
                .then(updatesCollection => {
                    updatesCollection.forEach(updateDoc => {
                        let updateID = updateDoc.id;
                        let username = "ERROR";
                        let updateUserID = updateDoc.data().userID;
                        let status = generateWorkingString(updateDoc.data().status);
                        let dateSubmitted = generateDateString(updateDoc.data().dateSubmitted);

                        let upvotes = updateDoc.data().upvotes;
                        let downvotes = updateDoc.data().downvotes;
                        let score = (upvotes - downvotes) + " (Upvotes: " + upvotes + ", Downvotes: " + downvotes + ")";

                        // get the update's user doc
                        db.collection("users").doc(updateUserID).get()
                            .then(userDoc => {
                                // get avatar doc from user doc's avatar ref
                                userDoc.data().avatar.get()
                                    .then(avatarDoc => {
                                        // get banner doc from user doc's banner ref
                                        userDoc.data().banner.get()
                                            .then(bannerDoc => {
                                                username = userDoc.data().username;
                                                avatarImageURL = avatarDoc.data().imageURL;
                                                bannerImageURL = bannerDoc.data().imageURL;
                                                
                                                let newcard = cardTemplate.content.cloneNode(true);

                                                newcard.querySelector(".card-update-ID").innerHTML = updateID;
                                                newcard.querySelector(".card-update-username").innerHTML = username;
                                                newcard.querySelector(".card-update-status").innerHTML = status;
                                                newcard.querySelector(".card-update-dateSubmitted").innerHTML = dateSubmitted;
                                                newcard.querySelector(".card-update-score").innerHTML = score;

                                                newcard.querySelector(".card-update-avatar").src = "../images/avatars/" + avatarImageURL + ".png";
                                                newcard.querySelector(".card-update-banner").src = "../images/banners/" + bannerImageURL + ".png";

                                                // adds listener to delete btn
                                                newcard.querySelector(".btn-update-delete").addEventListener("click", function() {
                                                    deleteUpdate(restaurantID, updateID);
                                                });

                                                // adds listener to upvote btn
                                                newcard.querySelector(".btn-update-upvote").addEventListener("click", function() {
                                                    processUpvote(restaurantID, updateDoc);
                                                });

                                                // adds listener to downvote btn
                                                newcard.querySelector(".btn-update-downvote").addEventListener("click", function() {
                                                    processDownvote(restaurantID, updateDoc);                                                                                                
                                                });

                                                addAchievements(newcard);
                                                displayDeleteUpdate(newcard)
                                                document.getElementById("updates-go-here").appendChild(newcard);
                                            });
                                    });        
                            });
                    });
                });
        });
}

// EFFECTS: ...TODO
function processUpvote(restaurantID, updateDoc) {
    let updateUserID = updateDoc.data().userID;
    let updateID = updateDoc.id;

    // check if the user is logged in or if they are the author of the update
    if (!currentUser) {
        return alert("You must be logged-in to vote!");
    } else if (updateUserID == currentUser.uid) {
        return alert("You cannot vote on your own update!");
    } else {
    db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).get()
        .then(doc => {
            // if the user has upvoted, remove their upvote
            if (doc.data().upvoterIDList.includes(currentUser.uid)) {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                .update({
                    upvotes: fv.increment(-1),
                    upvoterIDList: fv.arrayRemove(currentUser.uid),
                });
            // if the user has downvoted, remove their downvote then add their upvote
            } else if (doc.data().downvoterIDList.includes(currentUser.uid)) {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                    .update({
                        downvotes: fv.increment(-1),
                        downvoterIDList: fv.arrayRemove(currentUser.uid),

                        upvotes: fv.increment(1),
                        upvoterIDList: fv.arrayUnion(currentUser.uid),
                    });
            // if the user has not voted, add their upvote
            } else {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                    .update({
                        upvotes: fv.increment(1),
                        upvoterIDList: fv.arrayUnion(currentUser.uid),
                    });
            }
        });
    }
}

// EFFECTS: ...TODO
function processDownvote(restaurantID, updateDoc) {
    let updateUserID = updateDoc.data().userID;
    let updateID = updateDoc.id;

    // check if the user is logged in or if they are the author of the update
    if (!currentUser) {
        return alert("You must be logged-in to vote!");
    } else if (updateUserID == currentUser.uid) {
        return alert("You cannot vote on your own update!");
    } else {
    db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).get()
        .then(doc => {
            // if the user has downvoted, remove their downvote
            if (doc.data().downvoterIDList.includes(currentUser.uid)) {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                .update({
                    downvotes: fv.increment(-1),
                    downvoterIDList: fv.arrayRemove(currentUser.uid),
                });
            // if the user has upvoted, remove their upvote then add their downvote
            } else if (doc.data().upvoterIDList.includes(currentUser.uid)) {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                    .update({
                        upvotes: fv.increment(-1),
                        upvoterIDList: fv.arrayRemove(currentUser.uid),
                        
                        downvotes: fv.increment(1),
                        downvoterIDList: fv.arrayUnion(currentUser.uid),
                    });
            // if the user has not voted, add their downvote
            } else {
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                    .update({
                        downvotes: fv.increment(1),
                        downvoterIDList: fv.arrayUnion(currentUser.uid),
                    });
            }
        });
    }
}

// REQUIRES: card has already been populated with other data
// EFFECTS: retrieves the user's data from the given card, then goes through their 
//          achievement array and adds each one as an image to the card
function addAchievements(card) {

    let cardID = card.querySelector(".card-update-ID").innerHTML;
    let cardAchievementsDiv = card.querySelector(".achievements-go-here");

    db.collection("restaurants/" + restaurantID + "/updates").doc(cardID).get()
        .then(updateDoc => {
            let cardUserID = updateDoc.data().userID;

            db.collection("users").doc(cardUserID).get()
                .then(userDoc => {
                    userDoc.data().achievements.forEach(achievementRef => {
                        achievementRef.get()
                            .then(achievementDoc => {
                                let achievementName = achievementDoc.data().name;
                                let achievementDescription = achievementDoc.data().description;

                                let achievementImage = document.createElement("img");
                                achievementImage.setAttribute("src", "../images/achievements/" + achievementDoc.data().imageURL + ".png");
                                achievementImage.setAttribute("height", "42");

                                let achievementPopup = document.createElement("a");
                                achievementPopup.appendChild(achievementImage);
                                achievementPopup.setAttribute("data-bs-toggle", "popover");
                                achievementPopup.setAttribute("data-bs-trigger", "focus");
                                achievementPopup.setAttribute("data-bs-title", achievementName);
                                achievementPopup.setAttribute("data-bs-content", achievementDescription);
                                achievementPopup.setAttribute("tabindex", "0");
                                
                                cardAchievementsDiv.appendChild(achievementPopup);

                                // Enable popovers
                                const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
                                const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
                        });
                    });
                });
        });
}

// EFFECTS: for each update card, show the delete btn if:
//             - user is owner of card
//             - user is an admin
function displayDeleteUpdate(card) {
    let cardID = card.querySelector(".card-update-ID").innerHTML;
    let deleteDiv = card.querySelector(".div-update-delete");

    db.collection("restaurants/" + restaurantID + "/updates").doc(cardID).get()
        .then(updateDoc => {
            let cardUserID = updateDoc.data().userID;

            db.collection("users").doc(currentUser.uid).get()
                .then(userDoc => {
                    if (userDoc.data().admin) {
                        // show delete
                        deleteDiv.classList.add("d-block");
                        deleteDiv.classList.remove("d-none");
                    } else if (cardUserID == currentUser.uid) {
                        // show delete
                        deleteDiv.classList.add("d-block");
                        deleteDiv.classList.remove("d-none");
                    }
                });
        });
  }