const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');


//===============================================Routes======================================================//

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/books', bookController.createBooks)
router.get('/books', bookController.getbooks)



module.exports = router;