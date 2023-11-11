//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyBX14FijHrYRa3HCUrJxhfhUviriDUIFH4",
    authDomain: "comp1800-teambby17.firebaseapp.com",
    projectId: "comp1800-teambby17",
    storageBucket: "comp1800-teambby17.appspot.com",
    messagingSenderId: "678980913476",
    appId: "1:678980913476:web:c478c9c3aeef0ae2db2f11"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
// shortcut Firestore fieldvalue constant
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const fv = firebase.firestore.FieldValue;