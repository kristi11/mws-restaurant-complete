var dbPromise = idb.open("restaurant_data", 3, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
  case 0:
    upgradeDb.createObjectStore("restaurants", { keyPath: "id" })
    case 1:
    upgradeDb.createObjectStore("reviews", { keyPath: "id" })
    case 2:
    upgradeDb.createObjectStore("offline_reviews", { keyPath: "id" })
  }
});
class DBHelper {
    static get DATABASE_URL() {
        return "http://localhost:1337/restaurants"
    }

   /**
   * Fetch all restaurants
   * Switched from XHR to fetch API
   * Use IndexedDb for offline use
   */
static fetchRestaurants(callback) {
    // Get restaurants from IndexedDB
    dbPromise.then(function(db){
      var tx = db.transaction("restaurants","readonly");
      var r_data = tx.objectStore("restaurants");
      return r_data.getAll()
    }).then(function(restaurants) {

 	// if restaurants are present in IndexedDB we return them
      if (restaurants.length !== 0) {
        callback(null, restaurants)
      } else {
		// If not fetch them from the server
          fetch(DBHelper.DATABASE_URL)
          .then(function(response) {
          	return response.json()
          })
          .then(restaurants => {

            // Once restaurants are fetched we add them to IndexedDB
            dbPromise.then(function(db){
              var tx = db.transaction("restaurants", "readwrite");
              var r_data = tx.objectStore("restaurants");

              for (var restaurant of restaurants) {
                r_data.put(restaurant)
              }
              callback(null, restaurants)
              return tx.complete

            }).then(function() {
            // success message
              console.log("Restaurants added")
            }).catch(function(error) {
			     // this is being returned if we failed to add the restaurants to the IndexedDb
              console.log(error)
            })
          })
      }
    })
  }

   /**
   * Fetch a restaurant by its ID.
   * Switched from XHR to fetch API
   * Use IndexedDb for offline use
   */
  static fetchRestaurantById(id, callback) {

    // Get from the restaurant from IndexedDB
    dbPromise.then(function(db){

      var tx = db.transaction("restaurants","readonly");
      var r_data = tx.objectStore("restaurants");
      return r_data.get(parseInt(id))

    }).then(function(restaurant) {

      if (restaurant) {
		// if the restaurant is in our IndexedDb we return it
        callback(null, restaurant)

      } else {
      	// if not fetch it from the server

        fetch(DBHelper.DATABASE_URL + '/' + id)
          .then(function(response) {
          	return response.json()
          })
          .then(function (restaurants) {
          	callback(null, restaurants)
          })
          .catch(function (error) {
          	// error message if failing to fetch
          	console.log(error)
          })
      }
    })
    // this.fetchReviews();
    // this.setIcon();
  }
    /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // fetch all restaurant reviews
        this.fetchAllReviews();
        // add offline reviews to server
        this.syncReviews();
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   * check if there's an image and if not load the default one
   */
  static imageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph) return (`img/10.jpg`);
    return (`/img/${restaurant.photograph}`+'.jpg');
  }

  /**
   * Restaurant image URL for tiny images.
   * check if there's an image and if not load the default tiny one
   */
  static tinyImageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph) return (`img-tiny/10.jpg`);
    return (`/img-tiny/${restaurant.photograph}`+'.jpg');
  }

  /**
   * Restaurant image URL for small images.
   */
  static smallImageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph) return (`img-small/10.jpg`);
    return (`/img-small/${restaurant.photograph}`+'.jpg');
  }

  /**
   * Restaurant image URL for medium images.
   */
  static mediumImageUrlForRestaurant(restaurant) {
    if(!restaurant.photograph) return (`img-medium/10.jpg`);
    return (`/img-medium/${restaurant.photograph}`+'.jpg');
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static fetchAllReviews() {
    // Get all reviews from IndexedDB
    dbPromise.then(function(db){

      var tx = db.transaction("reviews","readonly");
      var r_data = tx.objectStore("reviews");
      return r_data.getAll()

    }).then(function(reviews) {

      if (reviews.length !== 0) {
        console.log(reviews);
      } else {
        // if not fetch them from the server and store them into indexedDb
        fetch("http://localhost:1337/reviews/")
          .then(res => res.json())
          .then(reviews => dbPromise.then(
            db => {
              const tx = db.transaction("reviews", "readwrite");
              const store = tx.objectStore("reviews");
              reviews.forEach(review => { store.put(review) })

              return tx.complete
            })
          )
          .catch(err => console.log('Error ' + err));
          }
      })
  }

static fetchReviews(id,callback) {
  // Get the restaurant reviews from IndexedDB
  dbPromise.then(function(db){

    var tx = db.transaction("reviews","readonly");
    var r_data = tx.objectStore("reviews");
    return r_data.getAll()

  }).then(function(reviews) {

    // if the reviews are in our IndexedDb we return them
    if (reviews) {
      const res = reviews.filter(r => r.restaurant_id == id);
      callback(null, res);
      console.log(res);

      // if not fetch it from the server
    } else {
      fetch("http://localhost:1337/reviews/?restaurant_id=" + id)
        .then(res => res.json())
        .then(function(reviews) {
            callback(null, reviews);
        }).catch(err => console.log('Error ' + err));
      }
    })
  }

  static saveReview() {
  const id = self.restaurant.id;
  const name = document.getElementById("review_name").value;
  const comments = document.getElementById("review_comments").value;
  const rating = document.getElementById("review_rating").value;
  const createdAt = Date.now();
  const updatedAt = Date.now();
  const review = {
    id,
    name,
    rating: parseInt(rating),
    comments,
    createdAt,
    updatedAt
  }

  return DBHelper.postReview(review, (error, result) => {
      if(error){
        console.log(error);
      }
    });

  // return false;
}

static postReview(review, callback) {
  console.log(review);
    const idbReview = {
        id: Date.now() + Math.random(),
        comments: review.comments,
        name: review.name,
        rating: review.rating,
        restaurant_id: review.id,
        createdAt: review.createdAt,
        updatedAt:review.updatedAt
    }
    if(!navigator.onLine) {
      console.log('offline');
      dbPromise.then(db => {
        const tx = db.transaction("offline_reviews", "readwrite");
        const store = tx.objectStore('offline_reviews');
        store.put(idbReview);
        return tx.complete;
       });
     }
    fetch('http://localhost:1337/reviews/', {
      method: 'POST',
       body: JSON.stringify(idbReview),
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      review: JSON.stringify(review),
    })
      .then(r => r.json())
      .then((response) => {
        console.log('Log:', response);
        // TODO: add review to indexDB
        callback(null, response);
      }).catch(function (error) {
            // error message if failing to fetch
            console.log(error)
          });
     dbPromise.then(db => {
       const tx = db.transaction("reviews", "readwrite");
       const store = tx.objectStore('reviews');
       store.put(idbReview);
       return tx.complete;
     });
  }

  static syncReviews() {
    dbPromise.then(function(db){
      var tx = db.transaction("offline_reviews","readonly");
      var store = tx.objectStore("offline_reviews");
      return store.getAll()
    }).then(function(review) {

  // if reviews are present in reviews store we return them
      if (review.length !== 0) {
      fetch('http://localhost:1337/reviews/', {
        method: 'POST',
         body: JSON.stringify(review),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        review: JSON.stringify(review),
      })
      .then(r => r.json())
      .then((response) => {
        console.log('Log:', response);
      }).then(dbPromise.then(function(db){
      var tx = db.transaction("offline_reviews","readwrite");
      var store = tx.objectStore("offline_reviews").clear();
      return store;
    })).then(res => console.log('data deleted')).catch(function (error) {
            // error message if failing to fetch
            console.log(error)
          });
      }
    }
    )
  }

static setFavorite() {
  const id = self.restaurant.id;
  const value = self.restaurant.is_favorite;
  console.log("current favorite state:", value);
  if (value == 'true') {
      DBHelper.toggleFavorite(id, false);
    } else {
      DBHelper.toggleFavorite(id, true);
    }
  }

static toggleFavorite(id, value) {

  fetch('http://localhost:1337/restaurants/' + id + '/?is_favorite=' + value,
    {
      method: 'POST',
      headers: {
          "Content-Type": "application/json; charset=utf-8",
      },
      value: JSON.stringify(value)
    })
  .then(r => r.json())
    .then(res => console.log("favorite updated on server. New value is: ", value))
    dbPromise.then(db => {
    const tx = db.transaction("restaurants", "readwrite");
    const store = tx.objectStore("restaurants");
    store.get(id).then(function(val) {
      val.is_favorite = String(value)
      store.put(val)
      return tx.complete
    })
  }).then(function(response) {
    console.log("favorite updated on IndexedDb. New value is: ", value);
  }).catch(function(error) {
    console.log(error);
  })
  window.location.reload();
}

}