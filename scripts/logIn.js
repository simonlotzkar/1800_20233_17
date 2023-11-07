/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: logs user in
-------------------------------------------------------- */

// Listens to log in form and logs in user when submitted
const formLogIn = document.querySelector("#formLogIn");

formLogIn.addEventListener("submit", 
  (event) => {
    event.preventDefault();    // prevents modal from closing

    const email = formLogIn["inputLogInEmail"].value;
    const password = formLogIn["inputLogInPassword"].value;

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(credentialToken => {
        console.log("Logged in: " + credentialToken.user.uid);
        window.location.assign("index.html"); 
      })
      .catch(error => {
        alert("ERROR: " + error.code + " " + error.message);
      });
  }
);