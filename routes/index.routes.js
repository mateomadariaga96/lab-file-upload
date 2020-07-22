const express = require('express');
const router = express.Router();



/* GET home page */
router.get('/', (req, res) => res.render('index', { title: 'App created with Ironhack generator 🚀' }));

router.get('/', (req, res, next) => {
  Picture.find()
    .then(pictures => res.render('index', { pictures }))
    .catch(error => next(error))
});

module.exports = router;
