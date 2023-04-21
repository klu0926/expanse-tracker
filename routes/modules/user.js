const router = require('express').Router()
const passport = require('passport')


// Login Page
router.get('/login', (req, res) => {
  res.render('login')
})

// Login
router.post('/login', (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.locals.warning_msg = 'Email跟Password都是必填的唷。'
    return res.render('login', { email })
  }
  next()
}, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/user/login'
}))


// Register Page
router.get('/register', (req, res) => {
  res.render('register')
})



module.exports = router