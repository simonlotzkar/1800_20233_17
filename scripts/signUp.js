/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: functions that sign up a new user
-------------------------------------------------------- */

// EFFECTS: adds listener to sign up form and attempts to sign up 
//          user when submitted
document.querySelector("#form-SignUp").addEventListener("submit", (event) => {
  const username = document.querySelector("#input-signUp-username").value;
  const email = document.querySelector("#input-signUp-email").value;
  const password = document.querySelector("#input-signUp-password").value;
  const passwordConfirm = document.querySelector("#input-signUp-passwordConfirm").value;
  
  event.preventDefault();

  if (validateSignUpForm(username, email, password, passwordConfirm)) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {

        firebase.auth().currentUser.sendEmailVerification();

        db.collection("users").doc(userCredential.user.uid).set({
          username: username,
          email: email,
          dateSignUp: firebase.firestore.Timestamp.now(),
          avatar: db.doc("/customizations/XFW9nFFAyZNI7wKNG2ex"),
          banner: db.doc("/customizations/BCBWRu4WW2kw7B1egLYx"),
          achievements: [],
        })
        .then(() => {
          alert("Account created! Redirecting to home...")
          window.location.assign("../index.html");
        });
      })
      .catch(error => {
        alert("ERROR: " + error.code + " " + error.message);
      });
  }
});

// EFFECTS: checks if the input fields are filled in and if passwords match, 
//          sending an error message and returning false if not; 
//          returns true if all inputs are valid
function validateSignUpForm(username, email, password, passwordConfirm) {
  if (username == "") {
    alert("You must provide a username!");
    return false;
  } else if (email == "") {
    alert("You must provide an email!");
    return false;
  } else if (password == "") {
    alert("You must provide a password!");
    return false;
  } else if (passwordConfirm == "") {
    alert("You must confirm your password!");
    return false;
  } else if (password != passwordConfirm) {
    alert("Passwords do not match!");
    return false;
  } else {
    return true;
  }
}