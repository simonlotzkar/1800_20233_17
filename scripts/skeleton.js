/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: populates the placeholders on every page
-------------------------------------------------------- */
// loads placeholders irrespective of auth
$("#footerPlaceholder").load("./text/footer.html");

// loads navbar placeholders depending on whether someone is logged-in
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $("#navPlaceholder").load("./text/navAfterLogin.html");
        document.getElementById("footerNavLink-profile").classList.remove("d-none");
    } else {
        // No user is signed in.
        $("#navPlaceholder").load("./text/navBeforeLogin.html");
        document.getElementById("footerNavLink-profile").classList.add("d-none");
    }
});