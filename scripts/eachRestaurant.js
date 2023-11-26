/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the restaurant display and its list 
             of updates dynamically
-------------------------------------------------------- */

let restaurantID = new URL(window.location.href).searchParams.get("docID");
let cardTemplate = document.getElementById("updateCardTemplate");
let currentUser;
let restaurantStatus;
let restaurantLastUpdated;

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
        dynamicallyPopulateUpdateLog();
        displayOrHideAllSubmitUpdates();
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

            let distance = getDistanceFromLatLonInKm(
                userLocation.coords.latitude, 
                userLocation.coords.longitude, 
                doc.data().location.latitude, 
                doc.data().location.longitude);
            let distanceString = distance.toFixed(2) + "km away";

            document.getElementById("restaurant-address").innerHTML = address;
            document.getElementById("restaurant-city").innerHTML = city;
            document.getElementById("restaurant-postalCode").innerHTML = postalCode;
            document.getElementById("restaurant-distance").innerHTML = distanceString;
            document.getElementById("restaurant-dateUpdated").innerHTML = "never";

            setStatusBar(null);

            document.querySelector(".brokenBtn").addEventListener("click", function() {
                trySubmitUpdate(false, restaurantID);
            });

            document.querySelector(".workingBtn").addEventListener("click", function() {
                trySubmitUpdate(true, restaurantID);
            });
            
            document.getElementById("pageTitle").innerHTML = "McWorking - " + address;
        });
}

// EFFECTS: ...TODO
function setStatusBar(status) {
    if (status == null || status == undefined) {
        document.getElementById("restaurant-status").innerHTML = "unknown";
        document.getElementById("restaurant-statusBar").classList.add("text-bg-warning");
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-success");
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-danger");
    } else if (status) {
        document.getElementById("restaurant-status").innerHTML = generateWorkingString(true);
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-warning");
        document.getElementById("restaurant-statusBar").classList.add("text-bg-success");
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-danger");
    } else {
        document.getElementById("restaurant-status").innerHTML = generateWorkingString(false);
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-warning");
        document.getElementById("restaurant-statusBar").classList.remove("text-bg-success");
        document.getElementById("restaurant-statusBar").classList.add("text-bg-danger");
    }
}

// EFFECTS: ...TODO
function dynamicallyPopulateUpdateLog() {
    db.collection("restaurants/" + restaurantID + "/updates").orderBy("dateSubmitted", "asc")
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    // if added, add to the DOM:
                    let updateID = change.doc.id;
                    let username = "loading...";
                    let updateUserID = change.doc.data().userID;
                    let status = change.doc.data().status;
                    let statusString = generateWorkingString(status);
                    let dateSubmittedDelta = generateTimeSinceString(change.doc.data().dateSubmitted);
                    let dateSubmitted = generateDateString(change.doc.data().dateSubmitted);

                    let upvotes = change.doc.data().upvotes;
                    let downvotes = change.doc.data().downvotes;
                    let score = upvotes - downvotes;
                    let percentUpvote = ((upvotes / (upvotes + downvotes)) * 100).toFixed(0);
                    if (upvotes < 1) {
                        percentUpvote = 0;
                    }
                    let percentDownvote = 100 - percentUpvote;

                    let newcard = cardTemplate.content.cloneNode(true);

                    newcard.querySelector(".card-update-id").innerHTML = updateID;
                    newcard.querySelector(".card-update-status").innerHTML = statusString;
                    newcard.querySelector(".card-update-username").innerHTML = username;
                    newcard.querySelector(".card-update-dateSubmittedDelta").innerHTML = dateSubmittedDelta;
                    newcard.querySelector(".card-update-dateSubmitted").innerHTML = dateSubmitted;

                    newcard.querySelector(".card-update-score").innerHTML = score;
                    if ((upvotes == 0) && (downvotes == 0)) {
                        // if there are no votes, set the novotes progress to 100%, 
                        // then set the downvote and upvote progress to 0%        
                        newcard.querySelector(".card-progress-upvotes").setAttribute("style", "width: 0%;");
                        newcard.querySelector(".card-progress-downvotes").setAttribute("style", "width: 0%;");
                        newcard.querySelector(".card-progress-novotes").setAttribute("style", "width: 100%;");
                    } else {
                        // set the upvote progress bar and text to whatever % of upvotes there are, then
                        // do the same for downvotes and set novotes to 0%
                        newcard.querySelector(".card-progress-upvotes").innerHTML = percentUpvote + "% (" + upvotes + " Upvotes)";
                        newcard.querySelector(".card-progress-downvotes").innerHTML = percentDownvote + "% (" + downvotes + " Downvotes)";

                        newcard.querySelector(".card-progress-upvotes").setAttribute("style", "width: " + percentUpvote + "%;");
                        newcard.querySelector(".card-progress-downvotes").setAttribute("style", "width: " + percentDownvote + "%;");
                        newcard.querySelector(".card-progress-novotes").setAttribute("style", "width: 0%;");
                    }

                    if (status == null || status == undefined) {
                        newcard.querySelector(".card-update").classList.add("bg-warning");
                        newcard.querySelector(".card-update").classList.remove("bg-success");
                        newcard.querySelector(".card-update").classList.remove("bg-danger");
                    } else if (status == true) {
                        newcard.querySelector(".card-update").classList.remove("bg-warning");
                        newcard.querySelector(".card-update").classList.add("bg-success");
                        newcard.querySelector(".card-update").classList.remove("bg-danger");
                    } else if (status == false) {
                        newcard.querySelector(".card-update").classList.remove("bg-warning");
                        newcard.querySelector(".card-update").classList.remove("bg-success");
                        newcard.querySelector(".card-update").classList.add("bg-danger");
                    }

                    setIcons(newcard, change.doc);
                    initializeBtnListeners(newcard, restaurantID, change.doc);
                    addProfileDetails(newcard, updateUserID);
                    displayDeleteUpdate(newcard);
                    populateLastUpdated();
                    document.getElementById("updates-go-here").prepend(newcard);
                }
                if (change.type === "modified") {
                    // if modified, means the votes changed so update them:
                    let updateID = change.doc.id;
                    let nodeList = document.querySelectorAll(".card-update-id");

                    let upvotes = change.doc.data().upvotes;
                    let downvotes = change.doc.data().downvotes;
                    let score = upvotes - downvotes;
                    let percentUpvote = ((upvotes / (upvotes + downvotes)) * 100).toFixed(0);
                    if (upvotes < 1) {
                        percentUpvote = 0;
                    }
                    let percentDownvote = 100 - percentUpvote;

                    for (i = 0; i < nodeList.length; i++) {
                        if (nodeList[i].innerHTML == updateID) {
                            card = nodeList[i].parentElement.parentElement;
                            card.querySelector(".card-update-score").innerHTML = score;
                            if ((upvotes == 0) && (downvotes == 0)) {
                                // if there are no votes, set the novotes progress to 100%, 
                                // then set the downvote and upvote progress to 0%        
                                card.querySelector(".card-progress-upvotes").setAttribute("style", "width: 0%;");
                                card.querySelector(".card-progress-downvotes").setAttribute("style", "width: 0%;");
                                card.querySelector(".card-progress-novotes").setAttribute("style", "width: 100%;");
                            } else {
                                // set the upvote progress bar and text to whatever % of upvotes there are, then
                                // do the same for downvotes and set novotes to 0%
                                card.querySelector(".card-progress-upvotes").innerHTML = percentUpvote + "% (" + upvotes + " Upvotes)";
                                card.querySelector(".card-progress-downvotes").innerHTML = percentDownvote + "% (" + downvotes + " Downvotes)";
        
                                card.querySelector(".card-progress-upvotes").setAttribute("style", "width: " + percentUpvote + "%;");
                                card.querySelector(".card-progress-downvotes").setAttribute("style", "width: " + percentDownvote + "%;");
                                card.querySelector(".card-progress-novotes").setAttribute("style", "width: 0%;");
                            }
                            setIcons(card, change.doc);
                        }
                    }
                }
                if (change.type === "removed") {
                    // if removed, go through the DOM and remove corresponding nodes:
                    let updateID = change.doc.id;
                    let nodeList = document.querySelectorAll(".card-update-id");

                    for (i = 0; i < nodeList.length; i++) {
                        if (nodeList[i].innerHTML == updateID) {
                            nodeList[i].parentElement.parentElement.remove();
                        }
                    }

                    restaurantLastUpdated = undefined;
                    restaurantStatus = undefined;

                    populateLastUpdated();
                }
            });
        });
}

// EFFECTS: ...TODO
function populateLastUpdated() {
    db.collection("restaurants/" + restaurantID + "/updates")
        .onSnapshot(updateCollection => {
            updateCollection.forEach(updateDoc => {
                let date = updateDoc.data().dateSubmitted;

                if (!restaurantLastUpdated || (restaurantLastUpdated.toMillis() < date.toMillis())) {
                    restaurantLastUpdated = date;
                    restaurantStatus = updateDoc.data().status;

                    let dateUpdatedString = generateTimeSinceString(restaurantLastUpdated);
                    document.getElementById("restaurant-dateUpdated").innerHTML = dateUpdatedString;
                    setStatusBar(restaurantStatus);
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
function setIcons(card, updateDoc) {
    let upvoterIDList = updateDoc.data().upvoterIDList;
    let downvoterIDList = updateDoc.data().downvoterIDList;

    let downvoteBtn = card.querySelector(".btn-update-downvote");
    let upvoteBtn = card.querySelector(".btn-update-upvote");

    downvoteBtn.classList.remove("bi-arrow-down-circle-fill");
    downvoteBtn.classList.add("bi-arrow-down-circle");
    upvoteBtn.classList.remove("bi-arrow-up-circle-fill");
    upvoteBtn.classList.add("bi-arrow-up-circle");

    if (currentUser) {
        if (currentUser.uid == updateDoc.data().userID) {
            downvoteBtn.classList.add("d-none");
            upvoteBtn.classList.add("d-none");
        } else {
            let hasUserDownvoted = downvoterIDList.includes(currentUser.uid);
            let hasUserUpvoted = upvoterIDList.includes(currentUser.uid);
    
            if (hasUserDownvoted) {
                downvoteBtn.classList.add("bi-arrow-down-circle-fill");
                downvoteBtn.classList.remove("bi-arrow-down-circle");
            } else if (hasUserUpvoted) {
                upvoteBtn.classList.add("bi-arrow-up-circle-fill");
                upvoteBtn.classList.remove("bi-arrow-up-circle");
            }
        }
    }
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

    let cardID = card.querySelector(".card-update-id").innerHTML;
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
    let cardID = card.querySelector(".card-update-id").innerHTML;
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