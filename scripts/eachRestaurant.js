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
        alert(error);
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
    db.collection("restaurants/" + restaurantID + "/updates").orderBy("dateSubmitted", "asc")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    // go through each update for the current restaurant...
                    let updateID = change.doc.id;
                    let username = "loading...";
                    let updateUserID = change.doc.data().userID;
                    let status = generateWorkingString(change.doc.data().status);
                    let dateSubmitted = generateDateString(change.doc.data().dateSubmitted);

                    let upvotes = change.doc.data().upvotes;
                    let downvotes = change.doc.data().downvotes;
                    let score = (upvotes - downvotes) + " (Upvotes: " + upvotes + ", Downvotes: " + downvotes + ")";

                    let newcard = cardTemplate.content.cloneNode(true);
                    newcard.querySelector(".card-update-ID").innerHTML = updateID;
                    newcard.querySelector(".card-update-status").innerHTML = status;
                    newcard.querySelector(".card-update-username").innerHTML = username;
                    newcard.querySelector(".card-update-dateSubmitted").innerHTML = dateSubmitted;
                    newcard.querySelector(".card-update-score").innerHTML = score;

                    initializeBtnListeners(newcard, restaurantID, change.doc);
                    addProfileDetails(newcard, updateUserID);
                    displayDeleteUpdate(newcard);
                    document.getElementById("updates-go-here").prepend(newcard);
                }
                if (change.type === "modified") {
                    console.log("Modified: ", change.doc.data());
                }
                if (change.type === "removed") {
                    console.log("Removed: ", change.doc.data());
                }
            });
        });
}

// EFFECTS: ...TODO
function initializeBtnListeners(card, restaurantID, updateDoc) {
    // adds listener to delete btn
    card.querySelector(".btn-update-delete").addEventListener("click", function() {
        deleteUpdate(restaurantID, updateDoc.id);
    });

    // adds listener to upvote btn
    card.querySelector(".btn-update-upvote").addEventListener("click", function() {
        processUpvote(restaurantID, updateDoc);
    });

    // adds listener to downvote btn
    card.querySelector(".btn-update-downvote").addEventListener("click", function() {
        processDownvote(restaurantID, updateDoc);                                                                                                
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

function addProfileDetails(card, updateUserID) {

    let cardUsernameClass = card.querySelector(".card-update-username");
    let cardAvatarClass = card.querySelector(".card-update-avatar");
    let cardBannerClass = card.querySelector(".card-update-banner");

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

                            cardUsernameClass.innerHTML = username;
                            cardAvatarClass.setAttribute("src", "../images/avatars/" + avatarImageURL + ".png");
                            cardBannerClass.setAttribute("src", "../images/banners/" + bannerImageURL + ".png");
                        });
                });        
        });

    addAchievements(card);
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