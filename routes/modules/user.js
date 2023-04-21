const router = require('express').Router()
const passport = require('passport')
const User = require('../../models/User')
const bcrypt = require('bcryptjs')


// Login GET
router.get('/login', (req, res) => {
  res.render('login')
})

// Login POST
router.post('/login', (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.locals.warning_msg = 'Email跟Password都是必填的唷。'
    return res.render('login', { email })
  }
  next()
}, passport.authenticate('local', {
  successRedirect: '/records',
  failureRedirect: '/user/login',
}))


// Register GET
router.get('/register', (req, res) => {
  res.render('register')
})

// Register POST
router.post('/register', async (req, res, next) => {

  let { name, email, password, confirmPassword } = req.body
  // 清理資訊
  name = name.trim()
  password = password.trim()

  // 檢查是否有漏資料
  if (!name || !email || !password || !confirmPassword) {
    res.locals.warning_msg = '全部資訊都是必填的唷'
    return res.render('register', {
      name,
      email,
    })
  }

  // 檢查密碼兩次都一樣
  if (password !== confirmPassword) {
    res.locals.warning_msg = '密碼兩次不一樣唷。'
    return res.render('register', {
      name,
      email,
    })
  }

  try {
    // 檢查是email否已經有註冊
    const user = await User.findOne({ email })
    if (user) {
      res.locals.warning_msg = '這信箱已經被註冊了。'
      return res.render('register', {
        name,
        email,
      })
    }

    // 都沒問題，開始製作使用者資料
    // bcrypt 密碼
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    // 做使用者資料
    await User.create({
      name,
      email,
      password: hash
    })
    // 做好後去驗證
    req.flash('success_msg', '註冊成功！')
    next()
  }
  catch (err) {
    console.log(err)
    res.locals.warning_msg = '出現預期外的問題，請在嘗試一次'
    return res.render('register', {
      name,
      email,
    })
  }
}, passport.authenticate('local', {
  successRedirect: '/records',
  failureRedirect: '/user/login',
}))

module.exports = router