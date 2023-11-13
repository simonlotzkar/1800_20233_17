/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: contains sign in listener
-------------------------------------------------------- */

// // EFFECTS: adds listener to sign up form and attempts to
// //          sign up user when submitted
// const formSignUp = document.querySelector("#formSignUp");

// formSignUp.addEventListener("submit", 
//   (event) => {
//     const email = formSignUp["inputSignUpEmail"].value;
//     const password = formSignUp["inputSignUpPassword"].value;
//     const userName = formSignUp["inputSignUpUserName"].value;

//     firebase.auth().createUserWithEmailAndPassword(email, password)
//       .then(userCredential => {
//         db.collection("users").doc(userCredential.user.uid).set({
//           userName: userName,
//           email: email,
//           date: firebase.firestore.Timestamp.now(),
//           score: 0,
//           updatesCount: 0,
//         })
//         .then(() => {
//           window.location.assign("index.html"); 
//         });
//       })
//       .catch(error => {
//         alert("ERROR: " + error.code + " " + error.message);
//       });
//   }
// );

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

ui.start('#firebaseui-auth-container', {
  callbacks: {
    signInSuccessWithAuthResult: 
      function (authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      //------------------------------------------------------------------------------------------
      // The code below is modified from default snippet provided by the FB documentation.
      //
      // If the user is a "brand new" user, then create a new "user" in your own database.
      // Assign this user with the name and email provided.
      // Before this works, you must enable "Firestore" from the firebase console.
      // The Firestore rules must allow the user to write. 
      //------------------------------------------------------------------------------------------
      var user = authResult.user;
      if (authResult.additionalUserInfo.isNewUser) {
        
          db.collection("users").doc(user.uid).set({
            dateSignUp: firebase.firestore.Timestamp.now(),
            username: user.displayName,

          }).then(function () {
                 window.location.assign("index.html");
          }).catch(function (error) {
                 alert("Error adding new user: " + error);
          });
      } else {
          return true;
      }
          return false;
      },
      
    uiShown: 
      function() {
      // The widget is rendered.
    }
  },

  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: "index.html",
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],

  // Terms of service url.
  tosUrl: '<your-tos-url>',
  
  // Privacy policy url.
  privacyPolicyUrl: '<your-privacy-policy-url>'
});