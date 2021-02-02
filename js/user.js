"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/logout
 */

/** Handle login form submission. If login ok, sets up the user instance */
async function login(evt) {
  //no page refresh
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
//login click listener
$loginForm.on("submit", login);


/** Handle signup form submission input. */
async function signup(evt) {
  //no page refreshh
  evt.preventDefault();
  //get creds
  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);
    //save info neccessary to auto login in local storage
    saveUserCredentialsInLocalStorage();
    //change the UI to a logged in user look
    updateUIOnUserLogin();
    //reset all the inputs
    $signupForm.trigger("reset");
    //if the signup didn't work...
  } catch (e) {
    //log the error
    console.log(e);
    //show differernt msgs based on what went wrong
    if (e.response.status == 409) alert('Sorry, Those Credentials Are Already Taken.');
    else alert("Sorry, We can't use those Credentials, try something else.");
  }
}
//listener fo signup form
$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */
function logout(evt) {
  //clears the creds in localstorage
  localStorage.clear();
  //reload the page
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
 * - add the user profile section of the nav bar
 */

function updateUIOnUserLogin() {
  hidePageComponents();
  $allStoriesList.show();
  $('.fav-story-icon').show();
  updateFavoritesOnPage();
  updateNavOnLogin();
  navAllStories();
}

/** Show all users own stories */
function showOwnStories() {
  storyList = new StoryList(currentUser.ownStories);
  //the true is to prepend each story to the page, 
  //  so the most recent stories are on top
  putStoriesOnPage(true);
}

/** Show all users favorite stories */
function showFavorites() {
  storyList = new StoryList(currentUser.favorites);
  putStoriesOnPage(true);
}

/******************************************************************************
 * User Favorite manipulation
 */

/** AutoHearts all the currentUser's fav stories */
function updateFavoritesOnPage() {
  if (!currentUser) return;
  //add hearts to all stories already favorited by user
  for (let { storyId } of currentUser.favorites) {
    //get the li story from the DOM
    const $story = $('#' + storyId);
    //if it grabbed a object on the screen...
    if ($story.length) {
      //...fill the heart
      fillHeart($story);
    }
  }
}

/**
 * When a user clicks the Heart next to a story,
 * -If you're logged in
 *      -Toggle whether it's in your fav stories or not
 *      -Toggle whether the heart next to it is filled in
 * -else
 *      -reDirect client to Loggingin/signup screen
 *      -alert the user why
 */
function handleStoryFavorite(evt) {
  if (currentUser) {
    const $story = $(this).parent();
    const storyId = $story.attr('id');
    currentUser.toggleFavoriteStory(storyId);
    toggleHeart($story);
  }
  else {
    $navLogin.click();
    setTimeout(() => {
      alert('You Must Be Logged In To Like Stories!');
    }, 200);
  }

}
$allStoriesList.on('click', '.fav-story-icon', handleStoryFavorite);



/******************************************************************************
 * Submit Story Functions - UI
 */


/**
 * Takes all the data in the form and submits the story to the API and updates the page
 * @param { SubmitEvent } evt
 */
async function submitStory(evt) {
  //no refresh
  evt.preventDefault();
  //gets the {title, author, url} from the page
  const storyData = getNewStoryInfoFromUI();
  //add the story to the DB
  const returnedStory = await storyList.addStory(currentUser, storyData);
  //returnedStory will be false on failure and a story on success
  if (returnedStory) {
    //go back to home page
    navAllStories();
    //reset the form
    $newStoryForm.trigger("reset");
  } else {
    //API call Failiure
    alert("Sorry, I don't seem to be able to add that story to the DB...Try Again?");
  }
}
//new story listener
$newStoryForm.on("submit", submitStory);

/**
 * gets the new story data from the new-story-form
 * @return { {title, author, url} } the story data from the form
 */
function getNewStoryInfoFromUI() {
  const title = $('#new-story-title').val();
  const author = $('#new-story-author').val();
  const url = $('#new-story-url').val();
  return { title, author, url };

}


/******************************************************************************
 * Delete Story Functions - UI
 */

/**
 * Handles clicking on the Delete button next to a story
 * @param {ClickEvent} evt
 *
 */
function handleStoryDelete(evt) {
  //get the story container 
  const $story = $(this).parent().parent();
  //get the Id from the container
  const storyId = $story.attr('id');
  //delete the story in the API
  if (currentUser.deleteStory(storyId)) {
    //if success, remove the story from the UI too
    $story.remove();
  } else {
    //otherwise, let the user know
    alert("Sorry, I couldn't delete the selected story for some reason...");
  }
}
//del story listener
$allStoriesList.on('click', '.delete-button', handleStoryDelete);



/******************************************************************************
 * Modify Story Functions - UI
 */

/**
 * Handles clicking on the Modify button next to a story
 * @param {ClickEvent} evt
 */
function handleStoryModifyClick(evt) {
  //get the li the button refers to
  const $story = $(this).parent().parent();
  //get the Id of the story
  const storyId = $story.attr('id');

  //hide everything
  hidePageComponents();
  //update the form
  updateModStoryForm(storyId);
  //show the form
  $modStoryForm.show();
}
//handle mod button click next to stories
$allStoriesList.on('click', '.mod-button', handleStoryModifyClick);


/**
 * Updates the #mod-story-form to include the curr title, author, and url from the story
 * note: stores the storyId in the forms data-story-id
 * @param {String} storyId
 *
 */
function updateModStoryForm(storyId) {
  //get the story from the Id
  const story = storyList.getStoryById(storyId);
  //stories not in the list
  if (!story) alert('Something went wrong, please refresh and try Again!');
  // get the relevent data from the story
  const { title, url, author } = story;
  //add the storyId to the forms data
  $modStoryForm.data('story-id', storyId);
  //pre fill the inputs with the curr story data
  $('#mod-story-title').val(title);
  $('#mod-story-author').val(author);
  $('#mod-story-url').val(url);
}


/**
 * handle the submission of story updates
 * @param {SubmitEvent} evt
 */
async function modifyStory(evt) {
  //no page refresh
  evt.preventDefault();
  //get the objects from the function 
  const { story, storyId } = getModStoryInfoFromUI();
  //update the story in the DB
  const returnedStory = await currentUser.modifyStory(story, storyId);
  //returnedStory will be false on failure and a story on success
  if (returnedStory) {
    //refresh the page to get the updates from the server
    navAllStories();
    //reset the form inputs
    $modStoryForm.trigger("reset");
  } else {
    //couldn't modify the selected story
    alert('something Went Wrong with that request... Try reloading the page?');
  }
}
//submit listener
$modStoryForm.on("submit", modifyStory);



/**
 * gets the new story data from the mod-story-form
 * @return { {story:{title, author, url}, storyId} } the updated story data from the form
 */
function getModStoryInfoFromUI() {
  const title = $('#mod-story-title').val();
  const author = $('#mod-story-author').val();
  const url = $('#mod-story-url').val();
  const storyId = $modStoryForm.data('story-id');
  return {
    story: { title, author, url },
    storyId
  };
}