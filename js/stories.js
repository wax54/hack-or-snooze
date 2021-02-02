"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Gets list of stories from server, and shows all stories */
async function getAndShowAllStories() {
  //loading bar because we gotta make an API call
  $storiesLoadingMsg.show();
  //load storyList up with stores from the API
  storyList = await StoryList.getStories();
  //hide the loading bar because the Data is In!
  $storiesLoadingMsg.hide();
  //put em all on the page
  putStoriesOnPage();
}

/** uses storyList stories
 *  Generates HTML for all stories in storyList and puts each on page.
 *  @param {Boolean} prepend whether or not, the each story should be appended, or
 *        prepended to the list. Defaults to false(appending).
 *
 */
function putStoriesOnPage(prepend = false) {
  //empty the stories on the page
  $allStoriesList.empty();
  // loop through all of our stories
  for (let story of storyList.stories) {
    //adds the story to the page
    addStoryToPage(story, prepend);
  }
  //adds hearts to all favorited stories
  updateFavoritesOnPage();
  //shows the stories list
  $allStoriesList.show();
}

/**
 * adds a single story to $allStoriesList either to the beginning or the end depending on prepend
 * @param {Story} story the story to be added to the list
 * @param {Boolean} prepend whether that story should be added to the begining(true) or end(false)
 *          of the list. Defaults to false.
 */
function addStoryToPage(story, prepend = false) {
  //Build the HTML for the story
  const DOMStory = generateStoryMarkup(story);
  if (prepend) {
    $allStoriesList.prepend(DOMStory);
  } else {
    $allStoriesList.append(DOMStory);
  }
}

/**
 * Toggles the heart in the specified $story
 * @param {jQuery Object} $story the li that contains the story
 */
function toggleHeart($story) {
  const $heart = $story.find('.fav-story-icon');
  //toggle color
  $heart.toggleClass('favorited');
  // toggle solid vs outline
  $heart.toggleClass('fas far');
}

/**
 * Fills the heart in the specified $story
 * @param {jQuery Object} $story the li that contains the story
 */
function fillHeart($story) {
  const $heart = $story.find('.fav-story-icon');
  //toggle color
  $heart.addClass('favorited');
  // toggle solid vs outline
  $heart.addClass('fas');
  $heart.removeClass('far');
}

/**
 * A render method to render HTML for an individual Story instance
 * @param {Story} story: an instance of Story
 *
 * @returns the HTML markup for the story.
 */

function generateStoryMarkup(story) {
  const data = { ...story, ownStory: false };
  if (story.username === currentUser.username) {
    data.ownStory = true;
  }
  return Mustache.render(storyTemplate, data);
}

