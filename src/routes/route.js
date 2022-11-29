const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const {authentication} = requrire('../middlewares/auth')

//===============================================Routes======================================================//

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/books', authentication, bookController.createBooks)
router.get('/books', bookController.getbooks)
router.delete('/books/:bookId', bookController.DeletedBook)



module.exports = router;