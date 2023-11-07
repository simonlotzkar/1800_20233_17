/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
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
        hoursSinceString += " hour, ";
      } else {
        hoursSinceString +=" hours, ";
      }
      timeSinceString += hoursSinceString;
  }

  // Minute check (returns "1 minute", "# minutes", or does nothing)
  let minutesSinceString = minutesSince;
  if (minutesSince != 0) {
      if (minutesSince == 1) {
        minutesSinceString += " minute, ";
      } else {
        minutesSinceString +=" minutes, ";
      }
      timeSinceString += minutesSinceString;
  }

  return timeSinceString + " ago";
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

// REQUIRES: A user to be logged in.
// EFFECTS: Adds an update to the restaurant that is currently open in the window
//          with the given working value.
//          Sets the user name to the name of the currently logged-in user and the
//          date to the current time.
//          Also changes the restaurant's last updated and working fields to
//          reflect the new update.
function submitUpdate(working) {
  // Get currently logged in user
  db.collection("users").doc(firebase.auth().currentUser.uid).onSnapshot(
    (doc => {      
      let restaurantID = new URL(window.location.href).searchParams.get("docID");

      // Add new update to the current restaurant's "updates" collection
      db.collection("restaurants/" + restaurantID + "/updates").add({
        working: working,
        userName: doc.data().userName,
        date: firebase.firestore.Timestamp.now()
      });
    
      // Update current restaurant fields
      db.collection("restaurants").doc(restaurantID).update({
        lastUpdated: firebase.firestore.Timestamp.now(),
        working: working
      })
    })
  );
}