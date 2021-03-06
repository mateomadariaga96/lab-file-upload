// routes/auth.routes.js

const {
  Router
} = require('express');
const router = new Router();
const bcryptjs = require('bcryptjs');
const saltRounds = 10;
const User = require('../models/User.model');
const mongoose = require('mongoose');
const multer = require('multer')
const uploads = multer({dest: './public/uploads'})

const routeGuard = require('../configs/route-guard.config');




////////////////////////////////////////////////////////////////////////
///////////////////////////// SIGNUP //////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the signup form to users
router.get('/signup', (req, res) => {
  console.log("signup");
  res.render('auth/signup')});


// .post() route ==> to process form data
router.post('/signup', uploads.single('photo'), (req, res, next) => {
  const userInfo = req.body
  userInfo.photo = req.file ? `/uploads/${req.file.filename}` : undefined
  const user = new User(userInfo)
  console.log(user);

  // if (!user.username || !user.email || !user.password) {
  //   res.render('auth/signup', {
  //     errorMessage: 'All fields are mandatory. Please provide your username, email and password.'
  //   });
  //   return;
  // }

  // // make sure passwords are strong:
  // const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  // if (!regex.test(user.password)) {
  //   res
  //     .status(500)
  //     .render('auth/signup', {
  //       errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
  //     });
  //   return;
  // }

  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(user.password, salt))
    .then(hashedPassword => {
      user.password = hashedPassword
      user.save();
    })

    .then(userFromDB => {
      console.log('Newly created user is: ', userFromDB);
      res.redirect('/userProfile');
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', {
          errorMessage: error.message
        });
      } else if (error.code === 11000) {
        res.status(500).render('auth/signup', {
          errorMessage: 'Username and email need to be unique. Either username or email is already used.'
        });
      } else {
        next(error);
      }
    });

  // Route to upload from project base path

  router.post('/signup', uploads.single('photo'), (req, res, next) => {
    const picture = new Picture({
      name: req.body.name,
      path: `/public/uploads/${req.file.filename}`,
      originalName: req.file.originalname
    });

    picture
      .save()
      .then(() => {
        res.redirect('/');
      })
      .catch(err => {
        next(error);
      });
  }); // close .catch()
});

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGIN ////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// .get() route ==> to display the login form to users
router.get('/login', (req, res) => res.render('auth/login'));

// .post() login route ==> to process form data
router.post('/login', (req, res, next) => {
  const {
    email,
    password
  } = req.body;

  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }

  User.findOne({
      email
    })
    .then(user => {
      if (!user) {
        res.render('auth/login', {
          errorMessage: 'Email is not registered. Try with other email.'
        });
        return;
      } else if (bcryptjs.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect('/userProfile');
      } else {
        res.render('auth/login', {
          errorMessage: 'Incorrect password.'
        });
      }
    })
    .catch(error => next(error));
});

////////////////////////////////////////////////////////////////////////
///////////////////////////// LOGOUT ////////////////////////////////////
////////////////////////////////////////////////////////////////////////

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.get('/userProfile', routeGuard, (req, res) => {
  res.render('users/user-profile');
});

module.exports = router;