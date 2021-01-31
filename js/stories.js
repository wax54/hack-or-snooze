"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    addStoryToPage(story);
  }

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
async function submitStory(evt) {
  console.debug("Submit Story", evt);
  evt.preventDefault();

  const story = getNewStoryFromUI();
  //add the story to the DB
  const res = await storyList.addStory(currentUser, story);
  //res will be false on failure and a story on success
  if (res) {
    addStoryToPage(res, true);
    $newStoryForm.trigger("reset");
    hidePageComponents();
    $allStoriesList.show();
  } else {
    //TODO: Let user Know
  }
}

//TODO
function getNewStoryFromUI() {
  const title = $('#new-story-title').val();
  const author = $('#new-story-author').val();
  const url = $('#new-story-url').val();
  return { title, author, url };

}

$newStoryForm.on("submit", submitStory);