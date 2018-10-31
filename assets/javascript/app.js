// Global variables
var keywordList; // a string to store all the search keywords in localstorage
var imagePlaceholder = "assets/images/no-poster.jpg";

// Display gifs function - limited to 10 gifs
function displayGifInfo(searchKey) {
  // var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchKey + "&api_key=dc6zaTOxFJmzC&limit=10";
  // var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchKey + "&api_key=hKzDXoZzc7ub0la8qq7ZW4BCetHh546O&limit=10"; 
  var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + searchKey + "&api_key=DzAGdurNAt6TM1iFjg0UU9J8WoiF0X4O&limit=10";
 
  console.log(queryURL);
  console.log(searchKey);
  $.ajax({
    url: queryURL,
    method: "GET"
  })
  .done(function(response) {
    var results = response.data;

    $("#giphy-page").empty(); // Clear the gif page first before showing new data
    if (results == "") {
      $("#giphy-page").html(searchKey + ": There is nothing returned from Giphy");
    }
    for (var i=0; i < results.length; i++) {
      // Only taking action if the photo has an appropriate rating
      if (results[i].rating !== "r") {
        var gifDiv = $("<div>");
        var rating = results[i].rating;
        var p = $("<p>").text("Rating: " + rating); // Add picture rating
        var gifImage = $("<img>");

        gifDiv.addClass("gifDiv img-fluid");
        gifImage.addClass("gifImage");
        gifImage.attr("src", results[i].images.fixed_height_small_still.url); // Show still image when loading up
        gifImage.attr("still-image", results[i].images.fixed_height_small_still.url ) // Store still image for exchange
        gifImage.attr("animated-image", results[i].images.fixed_height_small.url) // Store animated image for exchange
        gifImage.attr("image-state", "still"); // Store current image state for exchange  
        gifDiv.append(p, gifImage);
        $("#giphy-page").prepend(gifDiv);
      }
    }
  });
}

// Display movie information function - limited to 10 movies
function displayMovieInfo(searchKey) {
  var queryURL = "https://www.omdbapi.com/?s=" +
  searchKey + "&type=movie&apikey=8bdf4af0";

  $.ajax({
    url: queryURL,
    method: "GET",
  })
  .then(function(response) {
    var results = response.Search;

    $("#movie-page").empty(); // Clear the movie page first before showing movie title
    if (response.Response == "False") {
      $("#movie-page").html(searchKey + ": There is no such movie title found!");
    } else {
        for (var i=0; i<results.length; i++) {
          var movieDiv = $("<div class='movieDiv'>");
          var pOne = $("<div class='caption'>").text(results[i].Title + " ("+ results[i].Year+")"); // Add movie title and year of release
          var movieImage = $("<img alt='No Poster'>");

          if (results[i].Poster != "N/A") {
            movieImage.attr("src", results[i].Poster); // Add movie poster
          } else {
            console.log('No poster');
            // Place an image placeholder if there's no movie poster
            movieImage.attr("src", imagePlaceholder); 
          }

          movieImage.addClass("movieImage img-fluid");
          movieDiv.append(pOne, movieImage);
          $("#movie-page").prepend(movieDiv);
        }    
      }
  });
}

// Display news function from New York Times - limited to 10 news
function displayNewsInfo(searchKey) {
  var queryURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=6e415f36c09e430bbc0f356d3d235224&page=0&q=" +
  searchKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  })
  .then(function(response) {
    var results = response.response.docs; 

    $("#news-page").empty(); // Clear the news page first before showing news
    if (results == "") {
      $("#news-page").html(searchKey + ": There is no news found!");
    } else {
        var newsDiv = $("<ol>");
        newsDiv.addClass("list-group newsDiv");

        for (var i=0; i<results.length; i++) {
          var newsList = $("<li>");

          var snippet = results[i].snippet;
          if (snippet) {  // Check if sinppet exists
            var pOne = $("<h3>").text(snippet);
            newsList.append(pOne);
          }
          var byline = results[i].byline;
          if (byline && byline.original) { // Check if byline exists
            var pTwo = $("<h2>").text(byline.original);
            newsList.append(pTwo);
          }  
          var pubDate = results[i].pub_date;
          if (pubDate) { // Check if publication date exists
            var pThree = $("<p>").text(pubDate.substring(0, 10)); // Show the date only
            pThree.addClass("pubDate");
            newsList.append(pThree);
          }
          var webURL = results[i].web_url; 
          if (webURL) { // Check if Web URL exits
            var newsURL = $("<a target='_blank' href='"+webURL+"'>"+webURL+"</a>");
            newsURL.addClass("webURL");
            newsList.append(newsURL);
          }
          newsList.addClass("list-group-item newsList");
          newsDiv.prepend(newsList);
        } 
        $("#news-page").append(newsDiv);   
      }
  });
}
    
// Render buttons for keyword search
function renderButtons (list) {
  $('#buttons-view').empty();
  for (var i=0; i < list.length; i++) {
    var keywordButton = $("<button>");

    keywordButton.addClass("btn btnKeyword");
    keywordButton.attr("data-name", list[i]); // Store keyword value
    keywordButton.attr("data-index", i);      // Store keyword index - remove a button when double click
    keywordButton.text(list[i]);
    $("#buttons-view").prepend(keywordButton);
  }
}

// Add new button for keyword search 
$(document).on("click", "#add-keyword", function(event) {
  event.preventDefault();
  var keywordValue = $('#search-input').val().trim();
  console.log ("keyword: " + keywordValue); //debug and testing

  // Check if the input is not blank before render it 
  if (keywordValue.length > 0) {
    keywordList.push(keywordValue);
    renderButtons(keywordList);
    localStorage.setItem("keywordList", JSON.stringify(keywordList)); // store the new keyword in local storage
    $('#search-input').val('');
  }
});

// Remove all buttons and local storage data
$(document).on("click", '#clear-keyword', function(event) {
  event.preventDefault();
  localStorage.clear();
  keywordList = []; 
  $("#buttons-view").empty();
});

// Keyword button trigger - call APIs to retrieve data
$(document).on("click", ".btnKeyword", function() {
  var keyword = $(this).attr("data-name");
  console.log(keyword);
  displayGifInfo(keyword); // Call Giphy API
  displayMovieInfo(keyword); // Call OMDb API
  displayNewsInfo(keyword); // Call New York Times API
});

// Double click to remove a keyword button
$(document).on("dblclick",".btnKeyword", function() {
  var keywordIndex = $(this).attr("data-index");
  keywordList.splice(keywordIndex, 1);
  $(this).remove();
  localStorage.setItem("keywordList", JSON.stringify(keywordList));
});

// Click to toggle still to animated gif and vise versa
$(document).on("click", ".gifImage", function() {
  var currentState = $(this).attr('image-state');
  if (currentState == "still") {
    var animatedImageUrl = $(this).attr('animated-image');
    $(this).attr("src", animatedImageUrl);
    $(this).attr("image-state", "animated");
  } else {
    var stillImageUrl = $(this).attr('still-image');
    $(this).attr("src", stillImageUrl);
    $(this).attr("image-state", "still");
  }
});

// Get the keyword list from local storage
keywordList = JSON.parse(localStorage.getItem("keywordList"));

// Check if there's any previous keyword search stored in local storage
if (!Array.isArray(keywordList)) {
  keywordList = []; // Initialized the list to empty if there's no previous keyword stored
}

// Render keyword search buttons on page load
renderButtons (keywordList);