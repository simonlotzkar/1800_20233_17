/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the profile display
-------------------------------------------------------- */
let cardTemplate = document.getElementById("refUpdatesCardTemplate");
let currentUser;
let userScore = 0;
let updateCount = 0;

// when user is logged in, populates the profile display
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = db.collection("users").doc(user.uid);

    // User is signed in
    db.collection("users").doc(user.uid)
    .get().then(doc => {
      let username = doc.data().username;
      let dateSignUp = generateDateString(doc.data().dateSignUp);
      
      document.getElementById("input-profile-username").value = username;
      document.getElementById("input-profile-dateSignUp").value = dateSignUp;

      document.getElementById("profile-userScore").innerHTML = userScore;
      document.getElementById("profile-updateCount").innerHTML = updateCount;
    });

    // user's reference updates subcollection listener
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
            
            // get restaurants collection
            db.collection("restaurants").doc(restaurantID)
              .get().then(doc => {  
                restaurantName = doc.data().address;

                // get updates subcollection
                db.collection("restaurants/" + restaurantID + "/updates").doc(updateID)
                .get().then(doc => {
                  let upvotes = doc.data().upvotes;
                  let downvotes = doc.data().downvotes;
                  let dateSubmitted = generateDateString(doc.data().dateSubmitted);
                  score = upvotes - downvotes;
                  working = generateWorkingString(doc.data().working);

                  // build card template
                  let newcard = cardTemplate.content.cloneNode(true);

                  newcard.querySelector(".card-refUpdate-ID").innerHTML = updateID;
                  newcard.querySelector(".card-refUpdate-status").innerHTML = working;
                  newcard.querySelector(".card-refUpdate-dateSubmitted").innerHTML = dateSubmitted;
                  newcard.querySelector(".card-refUpdate-score").innerHTML = score;
                  newcard.querySelector(".card-refUpdate-restaurant").innerHTML = restaurantName;
                  newcard.querySelector("a").href = "eachRestaurant.html?docID=" + restaurantID;
                  
                  document.getElementById("refUpdates-go-here").append(newcard);
                  
                  // update user count and score fields
                  updateCount += 1;
                  userScore += score;
                  document.getElementById("profile-userScore").innerHTML = userScore;
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

// EFFECTS: ...TODO
function enableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = false;
}

// EFFECTS: ...TODO
function disableFieldsetProfile() {
  document.getElementById("input-profile-username").disabled = true;
}

// EFFECTS: ...TODO
function saveProfile() {
  let username = document.getElementById("input-profile-username").value;

  currentUser.update({
    username: username,
  })

  disableFieldsetProfile();
}