/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar
DESCRIPTION: submits a restaurant to the database from form
-------------------------------------------------------- */

// EFFECTS: Adds a new restaurant to the db with the given input as its fields.
function submitRestaurant() {
    let address = document.getElementById("input-submitRestaurant-address").value;
    let city = document.getElementById("input-submitRestaurant-city").value;
    let latitude = document.getElementById("input-submitRestaurant-latitude").value;
    let longitude = document.getElementById("input-submitRestaurant-longitude").value;
    let postalCode = document.getElementById("input-submitRestaurant-postalCode").value;
  
    db.collection("restaurants")
        .add({
            address: address,
            city: city,
            location: new firebase.firestore.GeoPoint(latitude, longitude),
            postalCode: postalCode,
        });
    
    document.getElementById("form-submitRestaurant").reset();
    alert("added restaurant!");
}