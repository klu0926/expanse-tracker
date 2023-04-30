const router = require('express').Router()
const Record = require('../../models/Record')
const Category = require('../../models/Category.js')

// Records
router.get('/records', async (req, res) => {
  // // 使用user Id (由passport 提供)
  const userId = req.user._id

  // 得到資料
  const records = await Record.find({ userId }).lean()

  // 回傳
  res.json(records)
})

// Categories
router.get('/categories', async (req, res) => {

  // 得到資料
  const categories = await Category.find().lean()

  // 回傳
  res.json(categories)
})

module.exports = router
