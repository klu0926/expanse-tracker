const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

module.exports = (app) => {

  // 1 . passport init
  app.use(passport.initialize())
  app.use(passport.session())

  // 2 strategy : local
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true

  }, async (req, email, password, done) => {

    try {
      const user = await User.findOne({ email })
      // 檢查 email
      if (!user) {
        return done(null, false, req.flash('warning_msg', '這Email沒有被註冊過。'))
      }

      // 檢查密碼
      const isMatch = (await bcrypt.compare(password, user.password))
      if (!isMatch) {
        return done(null, false, req.flash('warning_msg', '帳號或是密碼錯誤。'))
      }

      // 通過，回傳使用者
      return done(null, user, req.flash('success_msg', '登入成功'))

    } catch (err) {
      console.log(err)
      return done(err, false)
    }
  })
  )

  // 2 strategy : facebook
  // ...

}


// 3 serializeUser (user => id)
// 裡面放一個 callback 當他做完時會做什麼事情，這裡是拿回user.id
passport.serializeUser((user, done) => {
  try {
    return done(null, user.id)
  } catch (err) {
    return done(err, null)
  }
})

// 4 deserializeUser ( id => user)
// 裡面放一個 callback 當他做完時會做什麼事情，這裡是拿回 user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).lean()

    if (user) {
      return done(null, user)
    } else {
      throw new Error('Can not find user')
    }

  } catch (err) {
    console.log(err)
    return done(err, null)
  }
})

// done() 回傳回去的err, 可以在 passport.authentication {option} 裡面使用 failureFlash: true 來使用
// 之後可以用 req.flash('error') 在下一個 req-res cycle 裡面取得，取得後就會被刪除。
