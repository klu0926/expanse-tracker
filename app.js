if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log('dot env required')
}

// node modules
require('./config/mongoose')
const express = require('express')
const exphbs = require('express-handlebars')

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
app.use(express.static('public'))

// routes
app.use(routes)

// sever start
app.listen(PORT, () => {
  console.log(`server is live on port:${PORT}`)
})