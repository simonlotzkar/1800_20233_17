/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the placeholders on every page
-------------------------------------------------------- */
// loads placeholders irrespective of auth
$("#footerPlaceholder").load("./text/footer.html");
$("#restaurantCardTemplatePlaceholder").load("./text/restaurantCardTemplate.html");

// loads placeholders depending on whether someone is logged-in
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#navPlaceholder").load("./text/navAfterLogin.html");
        $("#submitUpdatePlaceholder").load("./text/submitUpdateAfterLogin.html");
    } else {
        // No user is signed in.
        $("#navPlaceholder").load("./text/navBeforeLogin.html");
        $("#submitUpdatePlaceholder").load("./text/submitUpdateBeforeLogin.html");
    }
});