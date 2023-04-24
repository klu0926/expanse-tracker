const router = require('express').Router()
const Record = require('../../models/Record')
const Category = require('../../models/Category')


// Create Page
router.get('/new', async (req, res) => {
  const categories = await Category.find({}).lean()
  res.render('new', { categories })
})

// Create Post
router.post('/new', async (req, res) => {

  const { name, date, category, amount } = req.body
  const categories = await Category.find({}).lean()

  // input guard
  if (!name || !date || !category || !amount) {
    res.locals.warning_msg = '每個項目都是必須填的唷。'
    return res.render('new', {
      name,
      date,
      category,
      amount,
      categories
    })
  }

  // 取得 user id
  const userId = req.user._id

  // 取得 categories id
  const referenceCategory = categories.find(cate => cate.name === category)
  const categoryId = referenceCategory._id

  // 做資料
  await Record.create({
    name,
    date,
    amount,
    userId,
    categoryId
  })
  // 做完後回去 records
  req.flash('success_msg', '新增一筆資料')
  res.redirect('/records')
})


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

    // 處理每一筆records
    records.map((record) => {
      //--------加入總金額----------
      totalAmount += record.amount

      //--------獲得 類型icon---------
      // 使用 equals() 來比較 mongoose ObjectId
      const matchCate = categories.find(cate => {
        return record.categoryId.toString() === cate._id.toString()
      })

      // 紀錄 icon 到每一個record 裡面
      if (matchCate) {
        record.iconLink = matchCate.icon
      }
      // 做出 font awesome icon
      const rawIcon = record.iconLink.split('/').slice(-1)[0].split('?')
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

    // 轉換成台幣，並拿掉小數點
    const totalAmountString = totalAmount.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD' }).split('.')[0];

    // 回傳 records
    res.render('index', { records, totalAmountString, categories })


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