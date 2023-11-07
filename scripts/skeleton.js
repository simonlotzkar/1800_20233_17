/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the placeholders on every page
-------------------------------------------------------- */

// EFFECTS: Loads parts of page depending on whether user is logged in.
function loadSkeleton() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            console.log($('#navbarPlaceholder').load('./text/navAfterLogin.html'));
            console.log($('#updatePlaceholder').load('./text/updateAfterLogin.html'));
        } else {
            // No user is signed in.
            console.log($('#navbarPlaceholder').load('./text/navBeforeLogin.html'));
            console.log($('#updatePlaceholder').load('./text/updateBeforeLogin.html'));
        }
    });

    console.log($('#footerPlaceholder').load('./text/footer.html'));
}

loadSkeleton();