"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  hidePageComponents();
  getAndShowAllStories();
}

$body.on("click", "#nav-all", navAllStories);

/** Show favorite stories list on click on "favorites" */
function navFavoritesClick(evt) {
  //hide everything
  hidePageComponents();
  showFavorites();
}
$navFavorites.on("click", navFavoritesClick);

/** Show own stories list on click on "Posts" */
function navOwnStoriesClick(evt) {
  //hide everything
  hidePageComponents();
  showOwnStories();
}
$navOwnStories.on("click", navOwnStoriesClick);


/** Show new story form on click on "submit" */

function navSubmitClick(evt) {
  //hide everything
  hidePageComponents();
  //show the new story form
  $newStoryForm.show();
}
$navSubmit.on("click", navSubmitClick);



/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  //hide the login link
  $navLogin.hide();
  //update the UserName
  $navUserProfile.text(`${currentUser.username}`);
  //show the user specific links on user login
  $('.user-links').show();
}
