// env
if (process.env.DOT_ENV !== 'production') {
  require('dotenv').config()
}

// node modules
const express = require('express')
const exphbs = require('express-handlebars')

// my modules
const routes = require('./routes')

// app
const app = express()
const PORT = process.env.PORT

// app engine
app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: null
}))
app.set('view engine', 'hbs')

// routes
app.use(routes)

// sever start
app.listen(PORT, () => {
  console.log(`server is live on port:${PORT}`)
})