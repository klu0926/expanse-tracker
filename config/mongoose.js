const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

console.log('connecting to MongoDB...')

const db = mongoose.connection

db.on('error', error => console.log(error))
db.once('open', () => console.log('MongoDB connected'))

module.exports = db
