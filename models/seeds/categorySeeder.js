
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  console.log('dot env required')
}
const db = require('../../config/mongoose')
const Category = require('../Category')
const categoryData = require('../seedsData/category.json').results

db.once('open', async () => {
  console.log('starting categorySeeder...')
  console.log('creating category data...')
  try {
    await Category.create(categoryData)
    console.log('categorySeeder is all done!')

    process.exit()
    // Close the Mongoose connection explicitly
    // await mongoose.disconnect();
  } catch (error) {
    console.log(error)
  }
})
