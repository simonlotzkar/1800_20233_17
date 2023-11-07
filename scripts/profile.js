/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the profile display
-------------------------------------------------------- */

// EFFECTS: ...
function generateProfile() {

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in
          db.collection("users").doc(user.uid).get()
            .then(doc => {
                  let userName = doc.data().userName;
                  let email = doc.data().email;
                  let date = doc.data().date;
      
                  document.getElementById("profile-userName").innerHTML = userName;
                  document.getElementById("profile-email").innerHTML = email;
                  document.getElementById("profile-date").innerHTML = generateDateString(date);
            });
        } else {
          // User is signed out
          // ...
        }
      });
}

generateProfile();