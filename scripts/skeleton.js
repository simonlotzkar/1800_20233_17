//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {                   //if the pointer to "user" object is not null, then someone is logged in
            // User is signed in.
            // Do something for the user here.
            console.log($('#navbarPlaceholder').load('./text/nav_after_login.html'));
            console.log($('#ticketPlaceholder').load('./text/ticket_after_login.html'));
        } else {
            // No user is signed in.
            console.log($('#navbarPlaceholder').load('./text/nav_before_login.html'));
            console.log($('#ticketPlaceholder').load('./text/ticket_before_login.html'));
        }
    });

    console.log($('#footerPlaceholder').load('./text/footer.html'));
    console.log($('#previewPlaceholder').load('./text/preview.html'));
}

loadSkeleton(); //invoke the function