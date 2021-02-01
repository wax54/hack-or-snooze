"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/Auto-Login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {

  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
    // User.login retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.login(username, password);

    $loginForm.trigger("reset");
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (e) {
    alert("Those Creds Didn't Work, Bub. Try Again.");
  }

}

$loginForm.on("submit", login);

/** Handle signup form submissionput. */

async function signup(evt) {

  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();
  try {
    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  } catch (e) {
    console.log(e);
    if (e.response.status == 409) alert('Sorry, Those Credentials Are Already Taken.');
    else alert("Sorry, We can't use those Credentials, try something else.");
  }

}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {

  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {

  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}




/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - show the hearts
 * - heart already hearted stories
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  hidePageComponents();
  $allStoriesList.show();
  $('.fav-story-icon').show();
  updateFavoritesOnPage();
  updateNavOnLogin();
}

/** Show all users favorite stories */
function showOwnStories() {
  storyList = new StoryList(currentUser.ownStories);
  //the true is to reverse the order they are added to the page, 
  //  so the most recent stories are on top
  putStoriesOnPage(true);
}

//TODO
async function submitStory(evt) {
  evt.preventDefault();

  const storyData = getNewStoryInfoFromUI();
  //add the story to the DB
  const returnedStory = await storyList.addStory(currentUser, storyData);
  //res will be false on failure and a story on success
  if (returnedStory) {
    addStoryToPage(returnedStory, true);
    $newStoryForm.trigger("reset");
    hidePageComponents();
    $allStoriesList.show();
  } else {
    //TODO: Let user Know
  }
}
$newStoryForm.on("submit", submitStory);

function handleStoryDelete(evt) {
  const $story = $(this).parent().parent();
  const storyId = $story.attr('id');
  if (currentUser.deleteStory(storyId)) {
    $story.remove();
  } else {
    alert("Sorry, I couldn't delete the selected story for some reason...");
  }
}
$allStoriesList.on('click', '.delete-button', handleStoryDelete);


function updateModStoryForm(storyId) {
  const story = storyList.getStoryById(storyId);
  if (!story) alert('Something went wrong, please refresh and try Again!');

  const { title, url, author } = story;

  $modStoryForm.data('story-id', storyId);

  $('#mod-story-title').val(title);
  $('#mod-story-author').val(author);
  $('#mod-story-url').val(url);
}

function handleStoryModifyClick(evt) {
  const $story = $(this).parent().parent();
  const storyId = $story.attr('id');

  //hide everything
  hidePageComponents();
  updateModStoryForm(storyId);
  $modStoryForm.show();
}
$allStoriesList.on('click', '.mod-button', handleStoryModifyClick);


//TODO
async function modifyStory(evt) {
  evt.preventDefault();

  const { story, storyId } = getModStoryInfoFromUI();
  //update the story in the DB
  const returnedStory = await currentUser.modifyStory(story, storyId);
  //res will be false on failure and a story on success
  if (returnedStory) {
    navAllStories();
    $modStoryForm.trigger("reset");
  } else {
    alert('something Went Wrong with that request... Try reloading the page?');
  }
}
$modStoryForm.on("submit", modifyStory);
