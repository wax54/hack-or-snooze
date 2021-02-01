"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;



/** Get all stories*/

async function showAndShowAllStories() {
  $storiesLoadingMsg.show();
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.hide();
  putStoriesOnPage();
}
function showFavorites() {
  storyList = new StoryList(currentUser.favorites);
  putStoriesOnPage();
}
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <i class="fav-story-icon far fa-heart"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small><br>
        <small class="story-user">posted by ${story.username}</small>
        
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    addStoryToPage(story);
  }
  updateFavoritesOnPage();
  $allStoriesList.show();
}

function addStoryToPage(story, prepend = false) {
  const $story = generateStoryMarkup(story);
  if (!currentUser) {
    //no user is logged in, hide heart
    const $heart = $story.find('.fav-story-icon').hide();
  } else {
  for (let { storyId } of currentUser.ownStories)
    if (storyId === story.storyId) {
      $story.append('<span class="delete-button">DELETE</span>');
    }
  }

  if (prepend) {
    $allStoriesList.prepend($story);
  } else {
    $allStoriesList.append($story);
  }
}

function toggleHeart($story) {
  const $heart = $story.find('.fav-story-icon');
  //toggle color
  $heart.toggleClass('favorited');
  // toggle solid vs outline
  $heart.toggleClass('fas far');

}
function fillHeart($story) {
  const $heart = $story.find('.fav-story-icon');
  //toggle color
  $heart.addClass('favorited');
  // toggle solid vs outline
  $heart.addClass('fas');
  $heart.removeClass('far');
}


//TODO
async function submitStory(evt) {

  evt.preventDefault();

  const story = getStoryInfoFromUI();
  //add the story to the DB
  const res = await storyList.addStory(currentUser, story);
  //res will be false on failure and a story on success
  if (res) {
    currentUser.ownStories.push(res);
    addStoryToPage(res, true);
    $newStoryForm.trigger("reset");
    hidePageComponents();
    $allStoriesList.show();
  } else {
    //TODO: Let user Know
  }
}
$newStoryForm.on("submit", submitStory);


//TODO
function getStoryInfoFromUI() {
  const title = $('#new-story-title').val();
  const author = $('#new-story-author').val();
  const url = $('#new-story-url').val();
  return { title, author, url };

}

function handleStoryDelete(evt) {
  const $story = $(this).parent();
  const storyId = $story.attr('id');
  if (currentUser.deleteStory(storyId)) {
    $story.remove();
  } else {
    alert("Sorry, I couldn't delete the selected story for some reason...");
  }

}

$allStoriesList.on('click', '.delete-button', handleStoryDelete);