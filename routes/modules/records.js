const router = require('express').Router()
const Record = require('../../models/Record')
const Category = require('../../models/Category')


// Create

// Read all
router.get('/', async (req, res) => {
  // 使用user Id (由passport 提供)
  const userId = req.user._id

  try {

    // 使用者 records
    const records = await Record.find({ userId }).lean().sort({ _id: 'asc' })

    // 沒有 records
    if (records.length === 0) {
      let noRecords = true
      return res.render('index', { noRecords: true })
    }

    // 總金額
    let totalAmount = 0

    // 獲得 category
    const categories = await Category.find({}).lean()

    records.map((record) => {

      //---------總金額----------
      totalAmount += record.amount


      //--------類型 icon---------
      // 使用 equals() 來比較 mongoose ObjectId
      const matchCate = categories.find(cate => {
        return record.categoryId.toString() === cate._id.toString()
      })


      // 紀錄 icon 到每一個record 裡面
      if (matchCate) {
        record.icon = matchCate.icon
      }
      // 做出 font awesome icon
      const rawIcon = record.icon.split('/').slice(-1)[0].split('?')
      const iconShape = rawIcon[0]
      const iconClass = rawIcon[1].split('=')[1]

      const fontAwesomeClass =
        'fa-' + iconClass + ' ' + 'fa-' + iconShape
      // 存入 class
      record.fontAwesomeClass = fontAwesomeClass


      //---------日期----------
      // 把獲取的日期字串再次做成 Data object
      const dateString = record.date
      const date = new Date(dateString)

      // 設定 options
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' }

      // 回傳當前environment 的時間
      const localDateString = date.toLocaleDateString('zh-TW', options)
      record.localDateString = localDateString
    })

    // 回傳 records
    res.render('index', { records, totalAmount, categories })


  } catch (error) {
    res.locals.warning_msg = '出現預期外的問題，請您再嘗試一次。'
    console.log(error)
    return res.render('index')
  }

})

// Read One
// Update 
// Delete

module.exports = router