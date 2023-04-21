if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log('dot env required')
}

// node modules
require('./config/mongoose')
const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const methodOverride = require('method-override')
const usePassport = require('./config/passport')
const flash = require('connect-flash')

// my modules
const routes = require('./routes')

// app
const app = express()
const PORT = 3000

// app engine
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: null
}))
app.set('view engine', 'hbs')

// app use middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
usePassport(app)
app.use(flash())
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated() // passport 可以偵測是否已經驗證過
  res.locals.user = req.user // passport done(null, user) 傳出來的使用者
  res.locals.success_msg = req.flash('success_msg') // 設定 flash success msg
  res.locals.warning_msg = req.flash('warning_msg') // 設定 flash warning msg
  next()
})


// routes
app.use(routes)

// sever start
app.listen(PORT, () => {
  console.log(`server is live on port:${PORT}`)
})