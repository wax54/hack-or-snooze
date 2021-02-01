/******************************************************************************
 * User Favorite manipulation login/signup/Auto-Login
 * Relies on user.js, stories.js, the StoryList class, and the User class
 */


/** Show all users favorite stories */
function showFavorites() {
    storyList = new StoryList(currentUser.favorites);
    putStoriesOnPage(true);
}

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
