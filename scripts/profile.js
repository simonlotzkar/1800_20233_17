/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the profile display
-------------------------------------------------------- */
let refUpdateCardTemplate = document.getElementById("refUpdateCardTemplate");
let customizationCardTemplate = document.getElementById("customizationCardTemplate");
let currentUser;
let totalScore = 0;
let averageScore = 0;
let updateCount = 0;

// when user is logged in, populates the profile display
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = db.collection("users").doc(user.uid);

    // user doc
    db.collection("users").doc(user.uid).get()
      .then(userDoc => {
        let username = userDoc.data().username;
        let dateSignUp = generateDateString(userDoc.data().dateSignUp);

        userAvatarRef = userDoc.data().avatar;
        userBannerRef = userDoc.data().banner;
        userAchievementRefs = userDoc.data().achievements;
        
        document.getElementById("input-profile-username").value = username;
        document.getElementById("profile-dateSignUp").innerHTML = dateSignUp;
        document.getElementById("profile-totalScore").innerHTML = totalScore;
        document.getElementById("profile-averageScore").innerHTML = averageScore;
        document.getElementById("profile-updateCount").innerHTML = updateCount;

        // customizations collection
        db.collection("customizations").get()
        .then(customizationsCollection => {
          // for each customization
          customizationsCollection.forEach(customizationDoc => {
            let type = customizationDoc.data().type;
            let name = customizationDoc.data().name;
            let imageURL = customizationDoc.data().imageURL;
            let description = customizationDoc.data().description;

            if (type == "avatar") {
              // build customization card template for avatars
              let newcard = customizationCardTemplate.content.cloneNode(true);

              newcard.querySelector(".card-customization-name").innerHTML = name;
              newcard.querySelector(".card-customization-image").src = "/images/" + imageURL + ".png";
              newcard.querySelector(".card-customization-image").alt = "/images/" + imageURL + ".png";
              newcard.querySelector(".card-customization-description").innerHTML = description;
              newcard.querySelector("a").onclick = function() {
                setAvatar(customizationDoc)
              };
              
              document.getElementById("avatars-go-here").append(newcard);
              
            } else if (type == "banner") {
              // build customization card template for banners
              let newcard = customizationCardTemplate.content.cloneNode(true);

              newcard.querySelector(".card-customization-name").innerHTML = name;
              newcard.querySelector(".card-customization-image").src = "/images/" + imageURL + ".png";
              newcard.querySelector(".card-customization-image").alt = "/images/" + imageURL + ".png";
              newcard.querySelector(".card-customization-description").innerHTML = description;
              newcard.querySelector("a").onclick = function() {
                setBanner(customizationDoc)
              };

              document.getElementById("banners-go-here").append(newcard);

            } else if (type == "achievement") {
              // build customization card template for achievements
              let newcard = customizationCardTemplate.content.cloneNode(true);
              newcard.querySelector(".card-customization-name").innerHTML = name;
              newcard.querySelector(".card-customization-image").src = "/images/" + imageURL + ".png";
              newcard.querySelector(".card-customization-description").innerHTML = description;
              newcard.querySelector("a").innerHTML = "Locked.";

              // check user's achievements and change display to unlocked if this customization is among them
              userDoc.data().achievements.forEach(achievementDoc => {
                if (achievementDoc.id == customizationDoc.id) {
                  newcard.querySelector("a").innerHTML = "Unlocked!";
                }
              });
              
              document.getElementById("achievements-go-here").append(newcard);
            }
          });
        });
      });

    // user's reference updates subcollection
    db.collection("users/" + user.uid + "/refUpdates").orderBy("date", "desc")
      .onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => { 
          // update was added
          if (change.type === "added") {
            let date = generateDateString(change.doc.data().date);

            let restaurantID = change.doc.data().restaurantID;
            let restaurantName = "ERROR";

            let updateID = change.doc.data().updateID;
            let score = "ERROR";
            let working = "ERROR";
            
            // restaurants collection
            db.collection("restaurants").doc(restaurantID)
              .get().then(doc => {  
                restaurantName = doc.data().address;

                // restaurant's updates subcollection
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).get()
                  .then(doc => {
                    let upvotes = doc.data().upvotes;
                    let downvotes = doc.data().downvotes;
                    let dateSubmitted = generateDateString(doc.data().dateSubmitted);
                    score = upvotes - downvotes;
                    working = generateWorkingString(doc.data().working);

                    // build refupdate card template
                    let newcard = refUpdateCardTemplate.content.cloneNode(true);

                    newcard.querySelector(".card-refUpdate-ID").innerHTML = updateID;
                    newcard.querySelector(".card-refUpdate-status").innerHTML = working;
                    newcard.querySelector(".card-refUpdate-dateSubmitted").innerHTML = dateSubmitted;
                    newcard.querySelector(".card-refUpdate-score").innerHTML = score;
                    newcard.querySelector(".card-refUpdate-restaurant").innerHTML = restaurantName;
                    newcard.querySelector("a").href = "eachRestaurant.html?docID=" + restaurantID;
                    
                    document.getElementById("refUpdates-go-here").append(newcard);
                    
                    // update user count and score fields
                    updateCount += 1;
                    totalScore += score;
                    averageScore = (totalScore / updateCount).toFixed(3);
                    document.getElementById("profile-totalScore").innerHTML = totalScore;
                    document.getElementById("profile-averageScore").innerHTML = averageScore;
                    document.getElementById("profile-updateCount").innerHTML = updateCount;
                  });
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
  } else {
    // User is signed out
    alert("No user is signed in while on profile page!");
  }
});

// EFFECTS: enables edit profile input fields
function enableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = false;
}

// EFFECTS: disables edit profile input fields
function disableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = true;
}

// MODIFIES: currentUser
// EFFECTS: sets the user's username to what is in the username input field,
//          then disables edit profile input fields
function saveProfile() {
  let username = document.getElementById("input-profile-username").value;

  currentUser.update({
    username: username,
  });

  disableFieldsetProfile();
}

// MODIFIES: currentUser
// REQUIRES: the given doc is a customization document
// EFFECTS: sets the user's avatar to the given doc
function setAvatar(doc) {
  let url = "/customizations/" + doc.id;
  currentUser.update({
    avatar: db.doc(url),
  });
  alert("set avatar to: " + doc.data().name);
}

// MODIFIES: currentUser
// REQUIRES: the given doc is a customization document
// EFFECTS: sets the user's banner to the given doc
function setBanner(doc) {
  let url = "/customizations/" + doc.id;
  currentUser.update({
    banner: db.doc(url),
  });
  alert("set banner to: " + doc.data().name);
}