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
    //for mustache Rendering
    this.hostName = this.getHostName();

  }

/** Parses hostname out of URL and returns it. */
  getHostName() {
    try {
      let url = new URL(this.url);
      return url.origin;
    } catch (e) {
      return 'Invalid HostName';
    }
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
   * @param { Obj } newStory Obj containing at least {title, author, url}
   *
   * @returns the new Story instance or false on failure
   */
  async addStory(user, newStory) {
    try{
        const res = await axios({
          url: `${BASE_URL}/stories`,
          method: 'POST',
          data: {token: user.loginToken, story: newStory}
        }); 
        //getting the full Story object from the response
        newStory = new Story(res.data.story);
        //add it to the storiesList
      this.stories.push(newStory);
        //return the Story Object
        return newStory;
    }
    catch (e) {
      console.debug('ERROR! ', e);
      //return false on failure
      return false;
    }
  }


/** returns a Story based on the Id inputted
 * @param { String } storyId the Id of the Story you want
 *
 * @returns the Story you wanted, or false on failure
 */
  getStoryById(storyId) {
    //checks all the stories for one that matches
    const storyIdx = this.stories.findIndex(s => s.storyId === storyId);
    //if none match, return false
    if (storyIdx === -1) {
      return false;
    }
    //returns the story you wanted
    else return this.stories[storyIdx];
  }

  updateStoryById(storyId, updatedStory) {
    const storyIdx = this.stories.findIndex(s => s.storyId === storyId);
    if (storyIdx === -1) {
      return false;
    }
    else {
      this.stories[storyIdx] = updatedStory;
      return true;
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
    this.ownStories = ownStories.map(s => new Story(s));
    this.favorites = favorites.map(s => new Story(s));

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
      //take the user out of the response
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

/**
 * modify a user's story of the Id storyId
 * @param { Object } storyData updated fields of the story.  Containing{title, author, website} at most
 * @param { String } storyId the story Id of the story to be modified
 * @returns { Story } an instance of story representing the new story data
 */
  async modifyStory(storyData, storyId) {
    const res = await axios({
      url: `${BASE_URL}/stories/${storyId}`,
      method: 'PATCH',
      data: {
        token: this.loginToken,
        story: storyData
      }
    });

    return new Story(res.data.story);
    
  }

/**
 * modify a user's story of the Id storyId
 * @param { String } storyId the story Id of the story to be deleted
 * @returns {Boolean} true on success, false on failure
 */
  async deleteStory(storyId) {
    // the index of the story in ownStories
    const ownStoryIndex = this.ownStories.findIndex(s => s.storyId == storyId);
    //if it's not in there, we can't delete it
    if (ownStoryIndex === -1) return false; //not your story, can't delete it
    //maybe should alert user?
    //try to delete it
    try {
      const res = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: 'DELETE',
        data: { token: this.loginToken }
      });
      //if successfull, take it out of our stories 
      this.ownStories.splice(ownStoryIndex, 1);
      //return true
      return true;
    //delete failed
    } catch (e) {
      //log error
      console.debug(e);
      //return false
      return false;
    }
  }


/**
 * add or remove a story from a users favorite by ID
 * @param { String } storyId the story Id of the story to be deleted
 */
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
  
  /** get an array of Id's for stories the User has created */

  getOwnStoryIds() {
    return this.ownStories.map(s => s.storyId);
  }

/** get an array of Id's for stories the User has favorited */
  getFavoriteIds() {
    return this.favorites.map(s => s.storyId);
  }

  /** check to see if the Id inputted is a story created by User*/
  isOwnStory(checkId) {
    //returns -1 if checkId is not in this users favorite stories
    const isOwnStory = this.getOwnStoryIds().findIndex(id => (
      //if this story Id is the same as the one passed in, return true
      id === checkId
    ));
    //The storyId inputted is not yours, return false
    if (isOwnStory === -1) {
      return false;
    }
    //otherwise, return true
    return true;
  }

/** check to see if the Id inputted is already a favorite story of User*/
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
