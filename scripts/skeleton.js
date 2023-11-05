//---------------------------------------------------
// This function loads the parts of your skeleton 
// (navbar, footer, and other things) into html doc. 
//---------------------------------------------------
function loadSkeleton() {

    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {                   //if the pointer to "user" object is not null, then someone is logged in
            // User is signed in.
            // Do something for the user here.
            console.log($('#navbarPlaceholder').load('./text/navAfterLogin.html'));
            console.log($('#updatePlaceholder').load('./text/updateAfterLogin.html'));
        } else {
            // No user is signed in.
            console.log($('#navbarPlaceholder').load('./text/navBeforeLogin.html'));
            console.log($('#updatePlaceholder').load('./text/updateBeforeLogin.html'));
        }
    });

    console.log($('#footerPlaceholder').load('./text/footer.html'));
    console.log($('#previewPlaceholder').load('./text/preview.html'));
}

loadSkeleton(); //invoke the function