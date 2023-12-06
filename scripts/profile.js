/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the profile display
-------------------------------------------------------- */
let refUpdateCardTemplate = document.getElementById("refUpdateCardTemplate");
let customizationModalTemplate = document.getElementById("customizationModalTemplate");
let currentUser;
let totalScore = 0;
let averageScore = 0;
let updateCount = 0;

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    currentUser = db.collection("users").doc(user.uid);

    // get user doc...
    db.collection("users").doc(user.uid).get()
      .then(userDoc => {
        let username = userDoc.data().username;
        let email = user.email;
        let dateSignUp = generateDateString(userDoc.data().dateSignUp);

        userAvatarRef = userDoc.data().avatar;
        userBannerRef = userDoc.data().banner;
        userAchievementRefs = userDoc.data().achievements;
        
        document.getElementById("input-profile-username").value = username;
        document.getElementById("input-profile-email").value = email;

        document.getElementById("profile-dateSignUp").innerHTML = dateSignUp;
        document.getElementById("profile-totalScore").innerHTML = totalScore;
        document.getElementById("profile-averageScore").innerHTML = averageScore;
        document.getElementById("profile-updateCount").innerHTML = updateCount;

        populateCustomizations(userDoc);
        populateUpdateLog(user);
      });
  } else {
    // User is signed out
    // ...
  }
});

// EFFECTS: Populates each customization and adds them to their divs.
function populateCustomizations(userDoc) {
  // customizations collection
  db.collection("customizations")
  .onSnapshot(customizationsCollection => {
    // for each customization
    customizationsCollection
      .forEach(customizationDoc => {
        let customizationID = customizationDoc.id;
        let type = customizationDoc.data().type;
        let name = customizationDoc.data().name;
        let imageURL = customizationDoc.data().imageURL;
        let description = customizationDoc.data().description;

        let newModal = customizationModalTemplate.content.cloneNode(true);

        let modalId = "modal-" + customizationID;
        let modalTitleId = "modal-title-" + customizationID;

        newModal.querySelector(".modal-customization-modal").id = modalId;
        newModal.querySelector(".modal-customization-name").id = modalTitleId;
        
        newModal.querySelector(".modal-customization-trigger").setAttribute("data-bs-target", "#" + modalId);
        newModal.querySelector(".modal-customization-modal").setAttribute("aria-labelledby", "#" + modalTitleId);
        
        newModal.querySelector(".modal-customization-name").innerHTML = name;
        newModal.querySelector(".modal-customization-description").innerHTML = description;

        if (type == "avatar") {
          // check user's avatar id and change display to locked if this customization is the same
          if (userDoc.data().avatar.id == customizationDoc.id) {
            newModal.querySelector(".modal-customization-triggerImage").classList.add("locked");
          }

          newModal.querySelector(".modal-customization-triggerImage").src = "/images/avatars/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-image").src = "/images/avatars/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-chooseBtn").onclick = function() {
            setAvatar(customizationDoc);
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          };
          
          document.getElementById("avatars-go-here").append(newModal);
          
        } else if (type == "banner") {
          // check user's banner id and change display to locked if this customization is the same
          if (userDoc.data().banner.id == customizationDoc.id) {
            newModal.querySelector(".modal-customization-triggerImage").classList.add("locked");
          }

          newModal.querySelector(".modal-customization-triggerImage").src = "/images/banners/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-image").src = "/images/banners/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-chooseBtn").onclick = function() {
            setBanner(customizationDoc);
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          };

          document.getElementById("banners-go-here").append(newModal);

        } else if (type == "achievement") {
          // set achievement to locked
          newModal.querySelector(".modal-customization-triggerImage").classList.add("locked");
          newModal.querySelector(".modal-customization-triggerImage").classList.add("locked-achievement");

          // check user's achievements and change display to unlocked if this customization is among them
          userDoc.data().achievements.forEach(achievementDoc => {
            if (achievementDoc.id == customizationDoc.id) {
              newModal.querySelector(".modal-customization-triggerImage").classList.add("unlocked");
              newModal.querySelector(".modal-customization-triggerImage").classList.add("unlocked-achievement");
            }
          });

          newModal.querySelector(".modal-customization-triggerImage").src = "/images/achievements/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-image").src = "/images/achievements/" + imageURL + ".png";
          newModal.querySelector(".modal-customization-chooseBtn").innerHTML = "Locked.";

          newModal.querySelector(".modal-customization-chooseBtn").classList.add("d-none");

          document.getElementById("achievements-go-here").append(newModal);

        }
      });
  });
}

// EFFECTS: Populates the given user's reference updates in the ref_update log.
function populateUpdateLog(user) {
  // watch subcollection for changes
  db.collection("users/" + user.uid + "/refUpdates").orderBy("date", "desc")
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "added") {
          let restaurantID = change.doc.data().restaurantID;
          let restaurantName = "ERROR";

          let refUpdateID = change.doc.id;
          let updateID = change.doc.data().updateID;
          let score = "ERROR";
          let working = "ERROR";
          
          // restaurants collection
          db.collection("restaurants").doc(restaurantID).get()
            .then(doc => {  
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

                  newcard.querySelector(".card-refUpdate-ID").innerHTML = refUpdateID;
                  newcard.querySelector(".card-refUpdate-status").innerHTML = working;
                  newcard.querySelector(".card-refUpdate-dateSubmitted").innerHTML = dateSubmitted;
                  newcard.querySelector(".card-refUpdate-score").innerHTML = score;
                  newcard.querySelector(".card-refUpdate-restaurant").innerHTML = restaurantName;
                  newcard.querySelector("a").href = "eachRestaurant.html?docID=" + restaurantID;
                  
                  // adds listener to delete btn; deletes the update and its corresponding refUpdate
                  newcard.querySelector(".btn-update-delete").addEventListener("click", function() {
                    deleteUpdate(restaurantID, updateID);
                  });

                  document.getElementById("refUpdates-go-here").append(newcard);
                  
                  // update user count and score fields after adding update card
                  updateCount += 1;
                  totalScore += score;
                  averageScore = (totalScore / updateCount).toFixed(3);
                  document.getElementById("profile-totalScore").innerHTML = totalScore;
                  document.getElementById("profile-averageScore").innerHTML = averageScore;
                  document.getElementById("profile-updateCount").innerHTML = updateCount;
                });
            });
        }
        if (change.type === "modified") {
          // this can't be executed from this page as the owner can't vote or edit their updates
        }
        if (change.type === "removed") {
          let deletedRefUpdateID = change.doc.id;
          let nodeList = document.querySelectorAll(".card-refUpdate-ID");
          
          for (i = 0; i < nodeList.length; i++) {
            if (nodeList[i].innerHTML == deletedRefUpdateID) {
              nodeList[i].parentElement.parentElement.parentElement.remove();
            }
          }
        }
      });
    });
}

// EFFECTS: enables edit profile input fields
function enableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = false;
  document.getElementById("input-profile-email").disabled = false;
  }

// EFFECTS: disables edit profile input fields
function disableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = true;
  document.getElementById("input-profile-email").disabled = true;
}

// MODIFIES: currentUser
// EFFECTS: sets the user's username to what is in the username input field,
//          then disables edit profile input fields
function saveProfile() {
  let usernameInput = document.getElementById("input-profile-username").value;
  let emailInput = document.getElementById("input-profile-email").value;

  currentUser.update({
    username: usernameInput,
  });

  firebase.auth().currentUser.updateEmail(emailInput)
    .then(() => {
    // Update successful
    })
    .catch((error) => {
      // An error occurred
      alert(error);
    });

  disableFieldsetProfile();
}

// EFFECTS: Confirms with user that they want to proceed, then on success, sends a 
//          password verification email to the user's saved email.
function promptResetPassword() {
  if (confirm("Send a password reset email?")) {
    let emailInput = document.getElementById("input-profile-email").value;

    firebase.auth().sendPasswordResetEmail(emailInput)
      .then(() => {
        // Password reset email sent!
        alert("sent email to: " + emailInput + ".");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        alert(error);
      });
  } else {
    // do nothing
  }
}

// MODIFIES: currentUser
// REQUIRES: the given doc is a customization document
// EFFECTS: sets the user's avatar to the given doc
function setAvatar(doc) {
  let url = "/customizations/" + doc.id;
  currentUser.update({
    avatar: db.doc(url),
  });
}

// MODIFIES: currentUser
// REQUIRES: the given doc is a customization document
// EFFECTS: sets the user's banner to the given doc
function setBanner(doc) {
  let url = "/customizations/" + doc.id;
  currentUser.update({
    banner: db.doc(url),
  });
}