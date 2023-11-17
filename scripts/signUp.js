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
    // THE FOLLOWING COMMENTED OUT CODE IS FOR HANDLING EMAIL VERIFICATION
    // var actionCodeSettings = {
    //   // URL you want to redirect back to. The domain (www.example.com) for this
    //   // URL must be in the authorized domains list in the Firebase Console.
    //   url: ,
    //   // This must be true.
    //   handleCodeInApp: true,
    //   // iOS: {
    //   //   bundleId: 'com.example.ios'
    //   // },
    //   // android: {
    //   //   packageName: 'com.example.android',
    //   //   installApp: true,
    //   //   minimumVersion: '12'
    //   // },
    //   // dynamicLinkDomain: 'example.page.link'
    // };

    // firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
    //   .then(() => {
    //     // The link was successfully sent. Inform the user.
    //     // Save the email locally so you don't need to ask the user for it again
    //     // if they open the link on the same device.
    //     window.localStorage.setItem("emailForSignIn", email);
    //     // ...
    //   })
    //   .catch((error) => {
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     alert(errorCode + ":" + errorMessage);
    //   });

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
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