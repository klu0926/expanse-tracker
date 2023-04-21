// env
if (process.env.DOT_ENV !== 'production') {
  require('dotenv').config()
}

// node modules
const express = require('express')

// my modules
const routes = require('./routes')

// app
const app = express()
const PORT = process.env.PORT

// routes
app.use(routes)

// sever start
app.listen(PORT, () => {
  console.log(`server is live on port:${PORT}`)
})