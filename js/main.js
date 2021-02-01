"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $newStoryForm = $("#new-story-form");
const $modStoryForm = $("#mod-story-form");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navSubmit = $("#nav-submit");
const $navFavorites = $("#nav-favorites");
const $navOwnStories = $("#nav-own-stories");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const storyTemplate = $('#story-template').html();


/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */

function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $newStoryForm,
    $modStoryForm
  ];
  components.forEach(c => c.hide());
}


/** Overall function to kick off the app. */
async function start() {

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  //show all the stories from the API
  await getAndShowAllStories();
  //if we got a logged-in user, update the UI
  if (currentUser) updateUIOnUserLogin();
}

// Once the DOM is entirely loaded, begin the app
$(start);
