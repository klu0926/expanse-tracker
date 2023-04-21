if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const User = require('../User')
const Record = require('../Record')
const recordData = require('../seedsData/records.json').results
const bcrypt = require('bcryptjs')
const Category = require('../Category')

// 種子使用者
const userData = require('../seedsData/user.json').results
const users = [] // 廣志，小新
const user1RecordsIndex = [0, 1, 2, 4] // start from 0
const user2RecordsIndex = [3]

db.once('open', async () => {
  console.log('starting recordSeeder...')
  console.log('creating seed users...')

  try {
    // create user data
    await Promise.all(
      userData.map(async (seedUser) => {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(seedUser.password, salt)
        const user = await User.create({
          name: seedUser.name,
          email: seedUser.email,
          password: hash
        })
        console.log(`User ${user.name} created successfully.`)
        users.push(user)
      })
    )
    console.log('users created!')
    // ------------------------------
    // get category data (用來獲得每樣類性的_id)
    const categoryDataList = await Category.find().lean()

    // create record data
    await Promise.all(
      recordData.map(async (seedRecord, index) => {

        const { name, date, amount, category } = seedRecord

        // set record's categoryId
        const referenceCategory = categoryDataList.find(data => data.name === category)
        seedRecord.categoryId = referenceCategory._id

        // set record's userId
        if (user1RecordsIndex.includes(index)) {
          seedRecord.userId = users[0]._id
        }
        if (user2RecordsIndex.includes(index)) {
          seedRecord.userId = users[1]._id
        }

        // create record
        await Record.create({
          name,
          date,
          amount,
          userId: seedRecord.userId,
          categoryId: seedRecord.categoryId,
        })
      })
    )
    // done
    console.log('all done!')
    process.exit()

  } catch (error) {
    console.log(error)
  }
})
