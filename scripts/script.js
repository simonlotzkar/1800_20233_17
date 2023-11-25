/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar, CarlyOrr("SRC" comment where contributed)
DESCRIPTION: contains functions needed on most pages
-------------------------------------------------------- */

// EFFECTS: Attempts to log out user.
function logout() {
  firebase.auth().signOut()
    .then(
      () => {
        // Successfully logged out user
        window.location.assign("index.html"); 
      }
    )
    .catch(
      (error) => {
        ("ERROR: could not log out user: " + error);
      }
    );
}

// EFFECTS: Returns a string that represents whether the given boolean
//          represents a working ice cream machine or a broken one.
function generateWorkingString(boolean) {
  if (boolean) {
    return "Working";
  } else {
    return "Broken"
  }
}

// EFFECTS: Returns a string that represents the number of:
//              - days,
//              - hours, and
//              - minutes
//          between the server's current timestamp and the given timestamp. 
//          Excludes units that have a value of 0 and prints the unit name 
//          without a pluralization if the value is 1. 
//          Exceptions: 
//              - If the time delta is less than 1 minute, returns "just now".
//              - If the day delta is greater than 28, returns whether 
//                the timestamp was one of the following (in order):
//                  - more than 1 year ago,
//                  - last year, 
//                  - more than 1 month ago, or
//                  - last month.
function generateTimeSinceString(timestamp) {
  let timeSinceString = "";
  let now = firebase.firestore.Timestamp.now();

  // Delta variables
  let millisDifference = now.toMillis() - timestamp.toMillis();

  // Seconds check
  if ((millisDifference / 1000) < 60) {
    return "just now";
  }

  let daysSince = Math.floor(millisDifference / 1000 / 60 / 60 / 24);
  millisDifference -= daysSince * 24 * 60 * 60 * 1000;

  let hoursSince = Math.floor(millisDifference / 1000 / 60 / 60);
  millisDifference -= hoursSince * 60 * 60 * 1000;

  let minutesSince = Math.floor(millisDifference / 1000 / 60);

  // Year Check (returns "last year" or "more than 1 year" ago)
  let thenYear = timestamp.toDate().getFullYear();
  let nowYear = now.toDate().getFullYear();
  if ((thenYear != nowYear) && (daysSince > 28)) {
    if (thenYear == (nowYear - 1)) {
      return "last year";
    } else {
      return "more than 1 year ago";
    }
  }

  // Month Check (returns "last month" or "more than 1 month ago")
  let thenMonth = timestamp.toDate().getMonth();
  let nowMonth = now.toDate().getMonth();
  if ((thenMonth != nowMonth) && (daysSince > 28)) {
    if (thenMonth == (nowMonth - 1)) {
      return "last month";
    } else {
      return "more than 1 month ago";
    }
  }

  // Day check (returns "1 day", "# days", or does nothing)
  let daysSinceString = daysSince;
  if (daysSince != 0) {
    if (daysSince == 1) {
      daysSinceString += " day, ";
    } else {
      daysSinceString +=" days, ";
    }
    timeSinceString += daysSinceString;
  }

  // Hours check (returns "1 hour", "# hours", or does nothing)
  let hoursSinceString = hoursSince;
  if (hoursSince != 0) {
      if (hoursSince == 1) {
        hoursSinceString += " hr, ";
      } else {
        hoursSinceString +=" hrs, ";
      }
      timeSinceString += hoursSinceString;
  }

  // Minute check (returns "1 minute", "# minutes", or does nothing)
  let minutesSinceString = minutesSince;
  if (minutesSince != 0) {
      if (minutesSince == 1) {
        minutesSinceString += " min";
      } else {
        minutesSinceString += " mins";
      }
      timeSinceString += minutesSinceString;
  }

  return timeSinceString;
}

// EFFECTS: Returns a descriptive string of the given timestamp
function generateDateString(timestamp) {
  let dateString = "";
  let timestampDate = timestamp.toDate();

  let year = timestampDate.getUTCFullYear();
  let month = "January";
  switch (timestampDate.getUTCMonth()) {
    case 1:
      month = "February";
      break;
    case 2:
      month = "March";
      break;
    case 3:
      month = "April";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "June";
      break;
    case 6:
      month = "July";
      break;
    case 7:
      month = "August";
      break;
    case 8:
      month = "September";
      break;
    case 9:
      month = "October";
      break;
    case 10:
      month = "November";
      break;
    case 11:
      month = "December";
      break;
  }

  let date = timestampDate.getUTCDate();

  let day = "Sunday";
  switch (timestampDate.getUTCDay()) {
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
      break;
  }

  let minute = timestampDate.getUTCMinutes();
  if (minute < 10) {
    minute = "0" + minute;
  }

  let hour = timestampDate.getUTCHours();
  if (hour > 12) {
    hour -= 12;
    minute += "PM";
  } else {
    minute += "AM";
  }

  dateString = 
    day + ", " 
    + month + " " 
    + date + " " 
    + year + " at "
    + hour + ":"
    + minute + " (GMT)";

  return dateString;
}

// EFFECTS: ...TODO
function trySubmitUpdate(status, restaurantID) {
  let nowTime = firebase.firestore.Timestamp.now().toDate().getTime();
  let secsToWait = 60;
  let secsRemaining = 0;

  let canUpdateTime = localStorage.getItem("canUpdateTime");
  if (canUpdateTime) {
    secsRemaining = (canUpdateTime - nowTime) / 1000;
  }

  if (secsRemaining <= 0) {
    let newCanUpdateTime = nowTime + (secsToWait * 1000);
    submitUpdate(status, restaurantID);
    localStorage.setItem("canUpdateTime", newCanUpdateTime);
  } else {
    alert("You must wait: " + (secsRemaining) + "s before submitting again!");
  }
}

// REQUIRES: A user to be logged in.
// EFFECTS: Adds an update to the given restaurant with the given status value.
//          Sets the user name to the name of the currently logged-in user and the
//          date to the current time.
//          Also changes the restaurant's date and status fields to
//          reflect the new update.
function submitUpdate(status, restaurantID) {
  let currentUser = firebase.auth().currentUser;
  let now = firebase.firestore.Timestamp.now();

  // Get currently logged in user from users collection
  db.collection("users").doc(currentUser.uid).get()
    .then((doc => {    
      // get restaurant's updates subcollection
      db.collection("restaurants/" + restaurantID + "/updates")
        // ...add new update
        .add({
          status: status,
          userID: doc.id,
          dateSubmitted: now,
          upvotes: 0,
          downvotes: 0,
          upvoterIDList: [],
          downvoterIDList: [],
        })
        // ...add new update to user's reference updates subcollection
        .then(docRef => {
          let updaterBronzeID = "yOMHZvh3PGUYwF4q9nEl";
          let updaterSilverID = "W3xreGfL5O5sfOiy7wtI";
          let updaterGoldID = "y1oo3TupIdFsoE439cso";
          let refUpdatesCount = 0;
          let refUpdates = db.collection("users/" + doc.id + "/refUpdates");
          
          // update user's reference updates
          refUpdates.add({
            restaurantID: restaurantID,
            updateID: docRef.id,
            date: now,
          });

          // count user's ref update collection size
          refUpdates.get().then(col => {
            col.forEach(doc => {
              refUpdatesCount += 1;
            });

            // check if they unlock updater bronze and award if they don't already have it
            if (refUpdatesCount >= 10) {
              let isUnlocked = false;
              db.collection("users").doc(currentUser.uid).get()
                .then(doc => {
                  doc.data().achievements.forEach(achievementRef => {
                    if (achievementRef.id == updaterBronzeID) {
                      isUnlocked = true;
                    }
                  });
                  if (!isUnlocked) {
                    db.collection("users").doc(currentUser.uid).update({
                      achievements: fv.arrayUnion(db.doc("customizations/" + updaterBronzeID)),
                    });
                    alert("Achievement Awarded! View \"Updater (Bronze)\" in your profile for details.")
                  }
                });
            } 

            // check if they unlock updater silver and award if they don't already have it
            if (refUpdatesCount >= 25) {
              let isUnlocked = false;
              db.collection("users").doc(currentUser.uid).get()
                .then(doc => {
                  doc.data().achievements.forEach(achievementRef => {
                    if (achievementRef.id == updaterSilverID) {
                      isUnlocked = true;
                    }
                  });
                  if (!isUnlocked) {
                    db.collection("users").doc(currentUser.uid).update({
                      achievements: fv.arrayUnion(db.doc("customizations/" + updaterSilverID)),
                    });
                    alert("Achievement Awarded! View \"Updater (Silver)\" in your profile for details.")
                  }
                });
            } 
            
            // check if they unlock updater gold and award if they don't already have it
            if (refUpdatesCount >= 50) {
              let isUnlocked = false;
              db.collection("users").doc(currentUser.uid).get()
                .then(doc => {
                  doc.data().achievements.forEach(achievementRef => {
                    if (achievementRef.id == updaterGoldID) {
                      isUnlocked = true;
                    }
                  });
                  if (!isUnlocked) {
                    db.collection("users").doc(currentUser.uid).update({
                      achievements: fv.arrayUnion(db.doc("customizations/" + updaterGoldID)),
                    });
                    alert("Achievement Awarded! View \"Updater (Gold)\" in your profile for details.")
                  }
                });
            }
          });          
        })
        // Catch and alert errors
        .catch((error) => {
            alert("Error adding document: ", error);
        });
    }));
}

// SRC: 1800-TechTips/B04 (By CarlyOrr)
// REQUIRES: given coordinates are in latitude/longitude format
// EFFECTS: returns the distance between the given coordinate pairs
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

// SRC: 1800-TechTips/B04 (By CarlyOrr)
// EFFECTS: returns the given degree converted to radius format
function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

// EFFECTS: returns a promise of the user's geolocation
function getLocationFromUser() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation
          .getCurrentPosition((position) => {
            resolve(position);
          }, 
          reject);
    } else {
      reject("Geolocation not supported by this browser!");
    }
  });
}

// EFFECTS: ...TODO
function deleteUpdate(restaurantID, updateID) {
  if (confirm("Are you sure you want to delete this update?")) {
      // get this update and delete it
      db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).get()
        .then(updateDoc => {
          let userID = updateDoc.data().userID;
          // get this update and delete it
          db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).delete()
            .then(() => {
              // console.log("Deleted updateID=" + updateID);
            })
            .catch((error) => {
              console.log(error)
            });

          // get the user that posted this update's refUpdates subcollection, then iterate through it and where 
          // the refUpdate has the same updateID as this update, delete that refUpdate from the subcollection
          db.collection("users/" + userID + "/refUpdates").get()
            .then(refUpdatesCollection => {
              refUpdatesCollection.forEach(refUpdateDoc => {
                if (refUpdateDoc.data().updateID == updateID) {
                  db.collection("users/" + userID + "/refUpdates").doc(refUpdateDoc.id).delete()
                    .then(() => {
                        // console.log("Deleted refUpdateID=" + refUpdateDoc.id);
                    })
                    .catch((error) => {
                        console.log(error)
                    });
                  }
              });
            });
        });    
  }
}

// EFFECTS: if user is logged in:
//          show all submit update options, hide all log in prompts
//          if user is logged out:
//          hide all submit update options, show all log in prompts
function displayOrHideAllSubmitUpdates() {
  const nodeList_submitUpdate = document.querySelectorAll(".card-restaurant-submitUpdate");
  const nodeList_promptLogIn = document.querySelectorAll(".card-restaurant-promptLogIn");
  
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        for (let i = 0; i < nodeList_submitUpdate.length; i++) {
          nodeList_submitUpdate[i].classList.add("d-block");
          nodeList_submitUpdate[i].classList.remove("d-none");
        }
    
        for (let i = 0; i < nodeList_promptLogIn.length; i++) {
          nodeList_promptLogIn[i].classList.add("d-none");
          nodeList_promptLogIn[i].classList.remove("d-block");
        }
    } else {
        // No user is signed in.
        for (let i = 0; i < nodeList_submitUpdate.length; i++) {
          nodeList_submitUpdate[i].classList.add("d-none");
          nodeList_submitUpdate[i].classList.remove("d-block");
        }
    
        for (let i = 0; i < nodeList_promptLogIn.length; i++) {
          nodeList_promptLogIn[i].classList.add("d-block");
          nodeList_promptLogIn[i].classList.remove("d-none");
        }
    }
  });
}

// MODIFIES: insertElement
// EFFECTS: tries to populate the closest N (amountToPopulate) restaurant cards
//          as children in the given element (insertElement). also filters only
//          restaurants address/postalcode/city matching given param
async function populateClosestRestaurants(insertElement, amountToPopulate, filterParam) {
  let userLocation;
  
  try {
      userLocation = await getLocationFromUser();
  } catch (error) {
      alert("Geolocation denied by browser!" + error);
  }

  insertElement.innerHTML = "";

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
          let doc = key;
          let distance = value;

          let restaurantID = doc.id;
          let distanceString = distance.toFixed(2) + "km away";
          let address = doc.data().address;
          let city = doc.data().city;
          let postalCode = doc.data().postalCode;
          let containsFilterParam = (address.toLowerCase().includes(filterParam) 
            || city.toLowerCase().includes(filterParam) 
            || postalCode.toLowerCase().includes(filterParam));

          if (containsFilterParam) {       
            let cardTemplate = document.getElementById("restaurantCardTemplate");
            let newcard = cardTemplate.content.cloneNode(true);

            newcard.querySelector(".card-restaurant-address").innerHTML = address;
            newcard.querySelector(".card-restaurant-id").innerHTML = restaurantID;
            newcard.querySelector(".card-restaurant-city").innerHTML = city;
            newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
            newcard.querySelector(".card-restaurant-dateUpdated").innerHTML = "never";
            newcard.querySelector(".card-restaurant-status").innerHTML = "unknown";
            newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
            newcard.querySelector("a").href = "eachRestaurant.html?docID=" + doc.id;
            
            newcard.querySelector(".brokenBtn").addEventListener("click", function() {
              trySubmitUpdate(false, doc.id);
            });

            newcard.querySelector(".workingBtn").addEventListener("click", function() {
              trySubmitUpdate(true, doc.id);
            });

            if (insertElement.children.length < amountToPopulate) {
                insertElement.appendChild(newcard);
                displayOrHideAllSubmitUpdates();
                listenAndPopulateAllRestaurantsLastUpdatedStatus(restaurantID);
            }
          }
        });
    });
}

// EFFECTS: ...TODO
function listenAndPopulateAllRestaurantsLastUpdatedStatus(rid) {
  db.collection("restaurants/" + rid + "/updates").orderBy("dateSubmitted", "asc")
    .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          let dateSubmitted = doc.data().dateSubmitted;
          let status = doc.data().status;

          let nodeList = document.querySelectorAll(".card-restaurant-id");

          for (i = 0; i < nodeList.length; i++) {
            if (nodeList[i].innerHTML == rid) {
              let parentNode = nodeList[i].parentElement.parentElement;
              parentNode.querySelector(".card-restaurant-status").innerHTML = generateWorkingString(status);
              parentNode.querySelector(".card-restaurant-dateUpdated").innerHTML = generateTimeSinceString(dateSubmitted);
            }
          }
        });
    });
}