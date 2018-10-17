let restaurant;
var map;
if ('serviceWorker' in navigator ) {
  navigator.serviceWorker.register('/sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful');
  }, function(err) {
      // registration failed
      console.log('ServiceWorker registration failed');
  });
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 * Add <sources> tag for small images along with media and srcset
 * Add <sources> tag for medium images along with media and srcset
 * Add aria-label for all table items (all items included within restaurant-details )
 * Add favorites button
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute('aria-label', restaurant.name);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.setAttribute('aria-label', restaurant.address);

  const source_sm = document.getElementById('small-img');
  source_sm.media = '(max-width: 420px)';
  source_sm.setAttribute("data-srcset", DBHelper.smallImageUrlForRestaurant(restaurant) + ' 420w');

  const source_md = document.getElementById('medium-img');
  source_md.media = '(max-width: 768px)';
  source_md.setAttribute("data-srcset", DBHelper.mediumImageUrlForRestaurant(restaurant) + ' 768w');

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lazyload';
  image.src = DBHelper.tinyImageUrlForRestaurant(restaurant);
  image.setAttribute("data-src", DBHelper.imageUrlForRestaurant(restaurant));
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute('aria-label', restaurant.cuisine_type);

// the icon switch between favorite/not favorite is based on Doug Brown's project walkthrough
  const div = document.getElementById("restaurant-cuisine");
  const isFavorite = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true") ? true : false;
  const favoriteDiv = document.createElement("div");
  const favorite = document.createElement("button");
  favorite.className = isFavorite
    ? `fav`
    : `fav`;

  favorite.innerHTML = isFavorite
    ?  " &#9829;"
    :  " &#9825;"
    ;
  favorite.setAttribute('onclick','DBHelper.setFavorite()')
  favoriteDiv.append(favorite);
  div.append(favoriteDiv);

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // show reviews if avaialble
  const id = self.restaurant.id;
  DBHelper.fetchReviews(id, (error,reviews) => {
      self.reviews = reviews;
      // fill reviews
      fillReviewsHTML(reviews);
    }
  );
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.setAttribute('aria-label', key);
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.setAttribute('aria-label', operatingHours[key]);

    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
    Add a div that wraps the header content,
    Add a div that wrapps the comments content,
    Give the divs a class,
    Add name,date, rating and comments classes to <p>
    Add aria-label for all review items (all items included within reviews-container div )
    Change review.date to review.updatedAt and convert it to human readable format
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header_div = document.createElement('div');
  const content_div = document.createElement('div');
  const name = document.createElement('p');
  name.className = "name";
  header_div.className = "header";
  content_div.className = "content";
  name.innerHTML = review.name;
  name.setAttribute('aria-label', review.name);
  li.appendChild(header_div);
  li.appendChild(name);
  header_div.appendChild(name);

  const date = document.createElement('p');
  date.className = "date";
  date.innerHTML =  'Posted on ' + new Date(review.updatedAt).toLocaleDateString("en-US");
  date.setAttribute('aria-label', 'Posted on ' + new Date(review.updatedAt).toLocaleDateString("en-US"));
  li.appendChild(date);
  header_div.appendChild(date);

  const rating = document.createElement('p');
  rating.className = "rating";
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.setAttribute('aria-label', `Rating: ${review.rating}`);
  li.appendChild(content_div);
  li.appendChild(rating);
  content_div.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = "comments";
  comments.innerHTML = review.comments;
  comments.setAttribute('aria-label', review.comments);
  li.appendChild(comments);
  content_div.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
