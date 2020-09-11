const express = require('express');
const User = require('./userDb');
const Posts = require('../posts/postDb');

const router = express.Router();

router.use((req, res, next) => {
  console.log('in the user router');
  next();
})

router.post('/', validateUser, (req, res) => {
  User.insert(req.body)
  .then(user => {
    res.status(201).json(user);
  })
  .catch(err => {
    res.status(500).json({message: "Error adding a user", err});
  })
});

router.post('/:id/posts', validatePost, validateUserId, (req, res) => {
  const post = { ...req.body, user_id: req.params.id };

  Posts.insert(post)
  .then(post => {
    res.status(201).json(post);
  })
  .catch(err => {
    res.status(500).json({message: "Error adding a post", err, user: post});
  })
});

router.get('/', (req, res) => {
  User.get(req.query)
  .then(user => {
    res.status(200).json(user);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the users',
    });
  });
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  // do your magic!
  User.getUserPosts(req.params.id)
  .then(user => {
    res.status(200).json(user);
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error retrieving the posts',
    });
  });
});

router.delete('/:id', validateUserId, (req, res) => {
  User.remove(req.params.id)
  .then(count => {
    res.status(200).json({ message: `${count} account deleted: ${req.user.name}`})
  })
  .catch(error => {
    // log error to server
    console.log(error);
    res.status(500).json({
      message: 'Error removing the user',
    });
  });
  });

router.put('/:id', validateUserId, (req, res) => {
  User.update(req.params.id, req.body)
  .then(user => {
    res.status(200).json(`User ${req.body.name} updated`);
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({message: 'There was an error updating user'})
  })
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;
  User.getById(id)
  .then(user => {
    if(user) {
      req.user = user;
      // req.header.x-name = hub.name; //tried...
      next(); // goes to next non- error middleware.
    } else {
      next({code: 400, message: "Invalid user ID"}); //calls an error middleware
      // res.status(404).json({message: 'hub id not found'});
    }
  })
  .catch(err => {
    console.log(err);
    next({code: 500, message: "Failed to process request", err});
  })
}

function validateUser(req, res, next) {
  
  if(Object.keys(req.body) > 0) {
    if(req.body.name) {
      // req.header.user = req.body;
      next();
    } else {
      next({code: 400, message: "Missing required name field"});
    }
  } else {
    next({code: 400, message: "Missing user data", user: req.body});
  }
}

function validatePost(req, res, next) {
  // if(req.body && Object.keys(req.body) > 0) {
    if(req.body.text) {
      next();
    } else {
      next({code: 404, message: "Please include text"});
    }
  // } else {
    // next({code: 404, message: "Please include a request body"});
    // res.status(500).json({message: 'please include a request body'})
  // }
};

module.exports = router;
