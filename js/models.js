"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    let url = new URL(this.url);

    return url.origin;
  }


}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. 

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * @param { User } user the current instance of User who will post the story
   * @param { Obj } newStory obj of {title, author, url}
   *
   * @returns the new Story instance
   */

  async addStory( user, newStory ) {

    try{
        const res = await axios({
          url: `${BASE_URL}/stories`,
          method: 'POST',
          data: {token: user.loginToken, story: newStory}
        }); 
        newStory = new Story(res.data.story);
        this.stories.push(newStory);
        currentUser.ownStories.push(newStory);
        return newStory;
    }
    catch (e) {
      console.debug('ERROR! ', e);
      return false;
    }
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }



  async deleteStory(storyId) {

    const isOwn = this.ownStories.findIndex(s => s.storyId == storyId);

    if (isOwn === -1) return false; //not your story, can't delete it
    //maybe should alert user?

    try {
      const res = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: 'DELETE',
        data: { token: this.loginToken }
      });
      return true;
    } catch (e) {
      console.debug(e);
      return false;
    }
  }



  async toggleFavoriteStory(storyId) {
    //preset the method, assumming we are going to like something
    let method = 'POST';
    
    //if the story is already favorited,
    if (this.alreadyFavorited(storyId)) {
      //Already a favorite, delete it!
      method = 'DELETE';
    }
    //send it off!
    const res = await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
      method: method,
      data: { token: this.loginToken }
    });
    //the updated favorites returned from the server (just to stay current)
    const newFaves = res.data.user.favorites
    //update the Users favorites 
    this.favorites = newFaves.map(s => new Story(s));
  }

  getFavoriteIds() {
    return this.favorites.map(s => s.storyId);
  }

  alreadyFavorited(checkId) {
    //returns -1 if checkId is not in this users favorite stories
    const isFavorited = this.getFavoriteIds().findIndex(id => (
      //if this story Id is the same as the one passed in, return true
      id === checkId
    ));
    //if the storyId inputted is not already favored, return false
    if (isFavorited === -1) {
      return false;
    }
    //otherwise, return true
    return true;
  }
}
