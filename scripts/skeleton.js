/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the placeholders on every page
-------------------------------------------------------- */
// loads placeholders irrespective of auth
$("#footerPlaceholder").load("./text/footer.html");
$("#restaurantCardTemplatePlaceholder").load("./text/restaurantCardTemplate.html");

// loads navbar placeholders depending on whether someone is logged-in
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#navPlaceholder").load("./text/navAfterLogin.html");
    } else {
        // No user is signed in.
        $("#navPlaceholder").load("./text/navBeforeLogin.html");
    }
});