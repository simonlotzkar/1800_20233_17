function generateRestaurantCards(collection) {
    let cardTemplate = document.getElementById("restaurantCardTemplate");
  
    db.collection(collection).get()
        .then(allRestaurants=> {
            allRestaurants.forEach(doc => { 
                var address = doc.data().address;
                var city = doc.data().city;
                var img_name = doc.data().img_name;
                var postal_code = doc.data().postal_code;
                var docID = doc.id;
  
                let newcard = cardTemplate.content.cloneNode(true);
  
                // var working = getWorking(doc + "/tickets");
                // var last_updated = getLastUpdated(doc + "/tickets");
  
                //update title and text and image
                newcard.querySelector('.card-address').innerHTML = address;
                newcard.querySelector('.card-city').innerHTML = city;
                newcard.querySelector('.card-postal_code').innerHTML = postal_code;
                newcard.querySelector('.card-image').src = `./images/${img_name}.png`;
                
                // newcard.querySelector('.card-ticket-last_updated').innerHTML = last_updated;
                // newcard.querySelector('.card-ticket-working').innerHTML = working;
  
                newcard.querySelector('a').href = "eachRestaurant.html?docID=" + docID;
  
                document.getElementById(collection + "-go-here").appendChild(newcard);
            })
        })
  }
  
  generateRestaurantCards("restaurants");
  
  