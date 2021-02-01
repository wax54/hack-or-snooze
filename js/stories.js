"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show all stories */
async function getAndShowAllStories() {
  $storiesLoadingMsg.show();
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.hide();
  putStoriesOnPage();
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(prepend = false) {
  //empty the stories on the page
  $allStoriesList.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    addStoryToPage(story, prepend);
  }
  updateFavoritesOnPage();
  $allStoriesList.show();
}

function addStoryToPage(story, prepend = false) {
  const $story = generateStoryMarkup(story);
  if (prepend) {
    $allStoriesList.prepend($story);
  } else {
    $allStoriesList.append($story);
  }
}



//TODO
function getNewStoryInfoFromUI() {
  const title = $('#new-story-title').val();
  const author = $('#new-story-author').val();
  const url = $('#new-story-url').val();
  return { title, author, url };

}
function getModStoryInfoFromUI() {
  const title = $('#mod-story-title').val();
  const author = $('#mod-story-author').val();
  const url = $('#mod-story-url').val();
  const storyId = $modStoryForm.data('story-id');
  return {
    story:
      { title, author, url },
    storyId
  };

}

/**
 * A render method to render HTML for an individual Story instance
 * @param {Story} story: an instance of Story
 *
 * @returns the HTML markup for the story.
 */

function generateStoryMarkup(story) {
  if (story.ownStory === undefined) {
    story.ownStory = false;
    if (currentUser) {
      for (let { storyId } of currentUser.ownStories)
        if (storyId === story.storyId) {
          story.ownStory = true;
          break;
        }
    }
  }
  story.hostName = story.getHostName();

  return Mustache.render(storyTemplate, story);
}