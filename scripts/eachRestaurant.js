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
async function populateRestaurant() {
    try {
        const userLocation = await getLocationFromUser();

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
            });

        // restaurant's update subcollection listens to changes in db
        db.collection("restaurants/" + restaurantID + "/updates")
            .onSnapshot(snapshot => {
                // reset update log
                document.getElementById("updates-go-here").innerHTML = "";

                // populate update log
                db.collection("restaurants/" + restaurantID + "/updates").get()
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

                            // get user collection for username display
                            db.collection("users").doc(updateUserID).get()
                                .then(userDoc => {
                                    username = userDoc.data().username;

                                    // get avatar doc from ref
                                    userDoc.data().avatar.get()
                                        .then(avatarDoc => {
                                            avatarImageURL = avatarDoc.data().imageURL;

                                            // get banner doc from ref
                                            userDoc.data().banner.get()
                                                .then(bannerDoc => {
                                                    bannerImageURL = bannerDoc.data().imageURL;
                                                    
                                                    let newcard = cardTemplate.content.cloneNode(true);

                                                    newcard.querySelector(".card-update-ID").innerHTML = updateID;
                                                    newcard.querySelector(".card-update-username").innerHTML = username;
                                                    newcard.querySelector(".card-update-status").innerHTML = status;
                                                    newcard.querySelector(".card-update-dateSubmitted").innerHTML = dateSubmitted;
                                                    newcard.querySelector(".card-update-score").innerHTML = score;

                                                    newcard.querySelector(".card-update-avatar").src = "../images/" + avatarImageURL + ".png";
                                                    newcard.querySelector(".card-update-banner").src = "../images/" + bannerImageURL + ".png";

                                                    // adds listener to upvote btn
                                                    newcard.getElementById("input-update-upvote").addEventListener("click", function() {
                                                        // check if the user is logged in or if they are the author of the update
                                                        if (!currentUser) {
                                                            return alert("You must be logged-in to vote!");
                                                        } else if (updateUserID == currentUser.uid) {
                                                            return alert("You cannot vote on your own update!");
                                                        }

                                                        // user is clear to vote, first get the update doc...
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
                                                    });

                                                    // adds listener to downvote btn
                                                    newcard.getElementById("input-update-downvote").addEventListener("click", function() {
                                                        // check if the user is logged in or if they are the author of the update
                                                        if (!currentUser) {
                                                            return alert("You must be logged-in to vote!");
                                                        } else if (updateUserID == currentUser.uid) {
                                                            return alert("You cannot vote on your own update!");
                                                        }

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
                                                    });

                                                    addAchievements(newcard);
                                                    document.getElementById("updates-go-here").appendChild(newcard);
                                                });
                                        });        
                                });
                        });
                    });
            });
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
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
                                let achievementImage = document.createElement("img");
                                achievementImage.setAttribute("src", "../images/" + achievementDoc.data().imageURL + ".png");
                                achievementImage.setAttribute("height", "42");
                                cardAchievementsDiv.appendChild(achievementImage);
                        });
                    });
                });
        });
}

populateRestaurant();