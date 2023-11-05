// EFFECTS: Attempts to log out user.
function logout() {
  firebase.auth().signOut()
    .then(() => {})    // Successfully logged out user
    .catch(
      (error) => {
        console.log("ERROR: could not log out user: " + error);
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
//              - hours,
//              - minutes, and
//              - seconds
//          between the server's current timestamp and the given timestamp. 
//          Excludes units that have a value of 0 and prints the unit name 
//          without a pluralization if the value is 1. 
//          Exceptions: If the day delta is greater than 28, returns whether 
//          the timestamp was one of the following (in order):
//              - more than 1 year ago,
//              - last year, 
//              - more than 1 month ago, or
//              - last month.
function generateTimeSinceString(timestamp) {
  var timeSinceString = "";
  var now = firebase.firestore.Timestamp.now();

  // Delta variables
  var millisDifference = now.toMillis() - timestamp.toMillis();

  var daysSince = Math.floor(millisDifference / 1000 / 60 / 60 / 24);
  millisDifference -= daysSince * 24 * 60 * 60 * 1000;

  var hoursSince = Math.floor(millisDifference / 1000 / 60 / 60);
  millisDifference -= hoursSince * 60 * 60 * 1000;

  var minutesSince = Math.floor(millisDifference / 1000 / 60);
  millisDifference -= minutesSince * 60 * 1000;

  var secondsSince = Math.floor(millisDifference / 1000);

  // Year Check (returns "last year" or "more than 1 year" ago)
  var thenYear = timestamp.toDate().getFullYear();
  var nowYear = now.toDate().getFullYear();
  if ((thenYear != nowYear) && (daysSince > 28)) {
    if (thenYear == (nowYear - 1)) {
      return "last year";
    } else {
      return "more than 1 year ago";
    }
  }

  // Month Check (returns "last month" or "more than 1 month ago")
  var thenMonth = timestamp.toDate().getMonth();
  var nowMonth = now.toDate().getMonth();
  if ((thenMonth != nowMonth) && (daysSince > 28)) {
    if (thenMonth == (nowMonth - 1)) {
      return "last month";
    } else {
      return "more than 1 month ago";
    }
  }

  // Day check (returns "1 day", "# days", or does nothing)
  var daysSinceString = daysSince;
  if (daysSince != 0) {
    if (daysSince == 1) {
      daysSinceString += " day, ";
    } else {
      daysSinceString +=" days, ";
    }
    timeSinceString += daysSinceString;
  }

  // Hours check (returns "1 hour", "# hours", or does nothing)
  var hoursSinceString = hoursSince;
  if (hoursSince != 0) {
      if (hoursSince == 1) {
        hoursSinceString += " hour, ";
      } else {
        hoursSinceString +=" hours, ";
      }
      timeSinceString += hoursSinceString;
  }

  // Minute check (returns "1 minute", "# minutes", or does nothing)
  var minutesSinceString = minutesSince;
  if (minutesSince != 0) {
      if (minutesSince == 1) {
        minutesSinceString += " minute, ";
      } else {
        minutesSinceString +=" minutes, ";
      }
      timeSinceString += minutesSinceString;
  }

  // Second check (returns "1 second", "# seconds", or does nothing)
  var secondsSinceString = secondsSince;
  if (secondsSince != 0) {
      if (secondsSince == 1) {
        secondsSinceString +=" second";
      } else {
        secondsSinceString +=" seconds";
      }
      timeSinceString += secondsSinceString;
  }

  return timeSinceString + " ago";    // Return concatenated string
}

// REQUIRES: A user to be logged in.
// EFFECTS: Adds an update to the restaurant that is currently open in the window
//          with the given working value.
//          Sets the user name to the name of the currently logged-in user and the
//          date to the current time.
//          Also changes the restaurant's last updated and working fields to
//          reflect the new update.
function submitUpdate(working) {
  // Get currently logged in user
  db.collection("users").doc(firebase.auth().currentUser.uid).get()
    .then(userDoc => {      
      let restaurantID = new URL(window.location.href).searchParams.get("docID");

      // Add new update to the current restaurant's "updates" collection
      db.collection("restaurants/" + restaurantID + "/updates").add({
        working: working,
        displayName: userDoc.data().displayName,
        date: firebase.firestore.Timestamp.now()
      });
    
      // Update current restaurant fields
      db.collection("restaurants").doc(restaurantID).update({
        lastUpdated: firebase.firestore.Timestamp.now(),
        working: working
      })
    });
}