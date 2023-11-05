// EFFECTS: ...
function generateProfile() {
    firebase.auth().onAuthStateChanged(
        (user) => {
            if (user) {
                // User is signed in
                var displayName = user.displayName;
                var email = user.email;
        
                document.getElementById("profile-displayName").innerHTML = displayName;
                document.getElementById("profile-email").innerHTML = email;
            } else {
                // User is signed out
                console.log("WARNING: no one is signed in!");
            }
        });
}

generateProfile();