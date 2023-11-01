//---------------------------------
// Your own functions here
//---------------------------------

// function generateRestaurants() {
//   var restaurants = db.collection("restaurants");
//   var tickets0 = db.collection("tickets");
//   var tickets1 = db.collection("tickets");
//   var tickets2 = db.collection("tickets");

//   tickets0.add({
//     working: "true",
//     name: "john doe",
//     last_updated: firebase.firestore.FieldValue.serverTimestamp()
//   });

//   tickets1.add({
//     working: "false",
//     name: "sandra ardnas",
//     date: firebase.firestore.Timestamp.fromDate(new Date("October 10, 2023"))
//   });

//   tickets1.add({
//     working: "false",
//     name: "samuel leumas",
//     date: firebase.firestore.Timestamp.fromDate(new Date("October 30, 2023"))
//   });

//   tickets2.add({
//     working: "false",
//     name: "jacklyn statham",
//     last_updated: firebase.firestore.FieldValue.serverTimestamp()
//   });

//   tickets2.add({
//     working: "false",
//     name: "jason statham",
//     date: firebase.firestore.Timestamp.fromDate(new Date("October 27, 2023"))
//   });

//   tickets2.add({
//     working: "true",
//     name: "dwayne johnson",
//     date: firebase.firestore.Timestamp.fromDate(new Date("October 29, 2023"))
//   });

//   restaurants.add({
//       address: "1234 Ipsum St",
//       postal_code: "A1B 2C3",
//       city: "Vancouver",
//       img_name: "mcdonalds"
//   });

//   restaurants.add({
//     address: "5678 Ipsum Dr",
//     postal_code: "D4E 5F6",
//     city: "Burnaby",
//     img_name: "mcdonalds"
//   });
  
//   restaurants.add({
//     address: "91011 Ipsum Ave",
//     postal_code: "G7H 8I9",
//     city: "Richmond",
//     img_name: "mcdonalds"
//   });
// }

//------------------------------------------------
// Call this function when the "logout" button is clicked
//-------------------------------------------------
function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}