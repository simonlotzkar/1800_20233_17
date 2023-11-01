function generateRestaurant() {
    let params = new URL( window.location.href );
    let ID = params.searchParams.get("docID");
    console.log(ID);

    // doublecheck: is your collection called "Reviews" or "reviews"?
    db.collection("restaurants")
        .doc(ID)
        .get()
        .then(doc => {
            address = doc.data().address;
            city = doc.data().city;
            img_name = doc.data().img_name;
            postal_code = doc.data().postal_code;

            document.getElementById("restaurant-address").innerHTML = address;
            document.getElementById("restaurant-city").innerHTML = city;
            document.getElementById("restaurant-postal_code").innerHTML = postal_code;
            
            document.querySelector(".restaurant-img").src = "../images/" + img_name + ".png";
        } );
}

generateRestaurant();