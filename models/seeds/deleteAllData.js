if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log('dot env required')
}

const db = require('../../config/mongoose')
const Record = require('../Record')
const User = require('../User')
const Category = require('../Category')

db.once('open', async () => {

  try {
    console.log('deleting Record, User, Category data...')

    await Record.deleteMany({})
    console.log('Record data deleted.')

    await User.deleteMany({})
    console.log('User data deleted.')

    await Category.deleteMany({})
    console.log('Category data deleted')
    // done
    console.log('all data deleted!')
    process.exit()
  }
  catch (err) {
    console.log(err)
  }
})
