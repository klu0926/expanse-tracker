const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')
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
  passport.use(new FacebookStrategy({

    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_APP_CALLBACK,
    profileFields: ['email', 'displayName']

  }, (accessToken, refreshToken, profile, done) => {
    // 使用fb在callback回傳來的資料
    const { name, email } = profile._json

    // 找使用者
    User.findOne({ email })
      .then(user => {
        // 找到使用者就登入成功，回傳使用者到req.user
        if (user) return done(null, user)

        // 找不到使用者就做一個使用者資料
        // 先做一個密碼
        const randomPassword = Math.random().toString(36).slice(-8)
        bcrypt
          .genSalt(10)
          .then(salt => bcrypt.hash(randomPassword, salt))
          .then(hash => User.create({
            name,
            email,
            password: hash
          }))
          .then(user => done(null, user))
          .catch(err => done(err, false))
      })
  }))
}

// 3 serializeUser (user => id)
// 裡面放一個 callback 當他做完時會做什麼事情，這裡是拿回user.id
passport.serializeUser((user, done) => {
  return done(null, user.id)
})

// 4 deserializeUser ( id => user)
// 裡面放一個 callback 當他做完時會做什麼事情，這裡是拿回 user
passport.deserializeUser((id, done) => {
  User.findById(id)
    .lean()
    .then(user => {
      if (user) {
        return done(null, user)
      }
      return new Error('Can not find user')
    })
    .catch(error => {
      console.log(error)
      return done(error, null)
    })
})
