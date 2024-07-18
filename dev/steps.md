# Blog API

## Requirements

### Models

Models for:

- Users (the admin).
- Blogposts
- Comments

### Features for the author

- List all blogposts (With an option of editing, deleting, changing visibility).
  - Delete a post.
  - Edit a post.
  - Change visibility.
- Create a new post
- View a post
  - Comment on the post.
  - Delete any comment.
- Login as admin.

### Features for normal users

- List all blogposts
- Open a post
  - Comment on the post.

## Steps

### Author

- [X] - Authenticate self
- [X] - List all blogposts
- [X] - Create a new POST
- [X] - Delete a blogpost by id
- [X] - Edit a blogpost by id
- [X] - Delete a comment by id on a specific blogpost
- [X] - If Authenticated and Authorized, view all posts including the hidden ones.

### Normal Users

- Routes for the blogpost list, opening blogpost and posting comments.
  
  [X] - show blogposts list.\
  [X] - open blogpost.\
  [X] - post a comment.
