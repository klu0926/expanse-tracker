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
const USER_SEED = require('../seedsData/user.json').results
// 設定使用者的 Record index
USER_SEED[0].recordsList = [0, 1, 2, 4] // 廣志
USER_SEED[1].recordsList = [3] // 小新

db.once('open', async () => {
  console.log('starting recordSeeder...')

  // 取得類別資料
  const categoryData = await Category.find({})
  console.log('category data found.')

  // 做使用者資料，跟做用者的Record
  console.log('creating seed users and records...')
  return Promise.all(
    // 有幾個使用者就做幾次
    USER_SEED.map(async (user) => {
      try {
        // 做出一個使用者
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(user.password, salt)
        const createdUser = await User.create({
          name: user.name,
          email: user.email,
          password: hash
        })
        console.log(`user ${createdUser.name} created!`)

        // 找出 user 全部的 records
        const userRecords = user.recordsList.map(index => {
          const record = recordData[index]
          // record 的 userId
          record.userId = createdUser._id

          // record 的 categoryId
          const referenceCategory = categoryData.find(data => {
            return data.name === record.category
          })
          record.categoryId = referenceCategory._id
          // 回傳 record
          return record
        })

        // 製作 user Records
        await Record.create(userRecords)
        console.log(`${user.name}'s ${user.recordsList.length} records created!`)
      } catch (err) {
        console.log(err)
      }
    })
  )
    .then(() => {
      console.log('all users and records created!')
      process.exit()
    })
    .catch(err => {
      console.log(err)
    })
})
