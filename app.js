if (process.env.DOT_ENV !== 'production') {
  require('dotenv').config()
}
// modules
const express = require('express')


// app
const app = express()
const PORT = process.env.PORT


// routes
app.get('/', (req, res) => {
  res.send('Hello world!')
})

// sever start
app.listen(PORT, () => {
  console.log(`server is live on port:${PORT}`)
})