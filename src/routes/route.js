const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const userController = require('../controllers/userController');
const {authentication} = requrire('../middlewares/auth')

//===============================================Routes======================================================//

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/books', authentication, bookController.createBooks)
router.get('/books', authentication,bookController.getbooks)
router.delete('/books/:bookId', authentication,bookController.DeletedBook)
router.put('/books/:bookId', authentication,bookController.updateBooks)



module.exports = router;