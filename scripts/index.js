/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates home page
-------------------------------------------------------- */

// EFFECTS: tries to populate the closest N (amountToPopulate) 
//          restaurants on the home page
async function populateClosestRestaurants(amountToPopulate) {
    let userLocation;
    
    try {
        userLocation = await getLocationFromUser();
    } catch (error) {
        alert("Geolocation denied by browser!" + error);
    }

    // get restaurant collection
    db.collection("restaurants").get()
    .then(restaurantCollection => {
        let unsortedMap = new Map();
        
        // create map with each restaurant and its distance 
        restaurantCollection.forEach(doc => { 
            let distance = getDistanceFromLatLonInKm(
                userLocation.coords.latitude, 
                userLocation.coords.longitude, 
                doc.data().location.latitude, 
                doc.data().location.longitude);
            unsortedMap.set(doc, distance);
        });    
        
        // create new map that is a sorted version of the previous (unsorted) one
        let sortedMap = new Map([...unsortedMap].sort((a,b) => a[1] - b[1]));

        // add restaurant card for each key-value pair in the map
        sortedMap.forEach(function(value, key) {
            let restaurantDoc = key;
            let distance = value;

            let restaurantID = restaurantDoc.id;
            let address = restaurantDoc.data().address;
            let city = restaurantDoc.data().city;
            let postalCode = restaurantDoc.data().postalCode;
            let status = restaurantDoc.data().status;
            let dateUpdated = restaurantDoc.data().dateUpdated;
            let distanceString = distance.toFixed(2) + "km away";
            let statusString = "unknown";
            let dateUpdatedString = "never";

            if ((status != undefined) && (status != null)) {
                statusString = generateWorkingString(status);
            }

            if ((dateUpdated != undefined) && (dateUpdated != null)) {
                dateUpdatedString = generateTimeSinceString(dateUpdated);
            }

            let cardTemplate = document.getElementById("restaurantCardTemplate");
            let newcard = cardTemplate.content.cloneNode(true);
            
            newcard.querySelector(".card-restaurant-address").innerHTML = address;
            newcard.querySelector(".card-restaurant-city").innerHTML = city;
            newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
            newcard.querySelector(".card-restaurant-dateUpdated").innerHTML = dateUpdatedString;
            newcard.querySelector(".card-restaurant-status").innerHTML = statusString;
            newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
            newcard.querySelector("a").href = "eachRestaurant.html?docID=" + restaurantID;

            newcard.querySelector(".brokenBtn").addEventListener("click", function() {
                submitUpdate(false, restaurantID);
                alert("submitted update, refresh page to see changes.")
            });

            newcard.querySelector(".workingBtn").addEventListener("click", function() {
                submitUpdate(true, restaurantID);
                alert("submitted update, refresh page to see changes.")
            });

            let insertDiv = document.getElementById("closest-go-here");
            if (insertDiv.children.length < amountToPopulate) {
                insertDiv.appendChild(newcard);
                displaySubmitUpdate();
            }
        });
    });
}

populateClosestRestaurants(3);

// THE FOLLOWING COMMENTED OUT CODE IS FOR HANDLING EMAIL VERIFICATION
// // Confirm the link is a sign-in with email link.
// if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
//     // Additional state parameters can also be passed via URL.
//     // This can be used to continue the user's intended action before triggering
//     // the sign-in operation.
//     // Get the email if available. This should be available if the user completes
//     // the flow on the same device where they started it.
//     var email = window.localStorage.getItem('emailForSignIn');
//     if (!email) {
//       // User opened the link on a different device. To prevent session fixation
//       // attacks, ask the user to provide the associated email again. For example:
//       email = window.prompt('Please provide your email for confirmation');
//     }
//     // The client SDK will parse the code from the link for you.
//     firebase.auth().signInWithEmailLink(email, window.location.href)
//       .then((result) => {
//         // Clear email from storage.
//         window.localStorage.removeItem('emailForSignIn');
//         // You can access the new user via result.user
//         // Additional user info profile not available via:
//         // result.additionalUserInfo.profile == null
//         // You can check if the user is new or existing:
//         // result.additionalUserInfo.isNewUser
//         db.collection("users").doc(result.user.uid).set({
//           username: username,
//           email: email,
//           dateSignUp: firebase.firestore.Timestamp.now(),
//           avatar: db.doc("/customizations/XFW9nFFAyZNI7wKNG2ex"),
//           banner: db.doc("/customizations/BCBWRu4WW2kw7B1egLYx"),
//           achievements: [],
//         })
//       })
//       .catch((error) => {
//         // Some error occurred, you can inspect the code: error.code
//         // Common errors could be invalid email and invalid or expired OTPs.
//       });
//   }