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
  // 做完回去 records
  res.redirect('/records')
})



// Read all 
router.get('/', async (req, res) => {

  try {
    // 使用user Id (由passport 提供)
    const userId = req.user._id

    // 整理 sort
    const sort = req.query.sort || req.session.sort
    const sortObject = {}
    // create mongoose sort object key:value (asc / desc)
    if (sort) {
      const sortArray = sort.split('-')
      const key = sortArray[0]
      const value = sortArray[1]
      sortObject[key] = value
    } else {
      sortObject._id = 'asc'
    }
    req.session.sort = sort // 存入session

    // All records
    let records = await Record.find({ userId }).lean().sort(sortObject)

    // 沒有 records
    if (records.length === 0) {
      let noRecords = true
      return res.render('index', { noRecords: true })
    }

    // 篩選類型
    let selectedCategory = req.query.category || req.session.category
    // 全部選擇就等於是沒有選擇
    if (selectedCategory === 'ALL') {
      selectedCategory = ''
    }
    if (selectedCategory) {
      const category = await Category.findOne({ name: selectedCategory })
      const categoryId = category._id
      // records (篩選)
      records = records.filter(record => record.categoryId.equals(categoryId))
    }
    req.session.category = selectedCategory // 存入session

    // 總金額
    let totalAmount = 0

    // 獲得 category
    const categories = await Category.find({}).lean()

    // 處理每一筆records
    records.map((record) => {
      //--------加入總金額----------
      totalAmount += record.amount

      //--------獲得 類型icon---------
      // 也可以使用 equals() 來比較 mongoose ObjectId
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
    res.render('index', {
      records,
      totalAmountString,
      categories,
      selectedCategory,
      sort,
    })


  } catch (error) {
    res.locals.warning_msg = '出現預期外的問題，請您再嘗試一次。'
    console.log(error)
    return res.render('index')
  }

})

// Read One

// Update Page
router.get('/:id/edit', async (req, res) => {
  const recordId = req.params.id
  const record = await Record.findById(recordId).lean()

  // guard for no record
  if (!record) {
    req.flash('warning_msg', '出現預期外的問題，請您再嘗試一次。')
    return res.redirect('/records')
  }

  // get category
  const categories = await Category.find({}).lean()
  const category = categories.find(cate => cate._id.toString() === record.categoryId.toString())

  // convert date to year.month.day formate
  const date = record.date.toISOString().slice(0, 10)

  res.render('edit', {
    categories,
    id: record._id,
    category: category.name,
    name: record.name,
    amount: record.amount,
    date,
  })
})

// Update put
router.put('/:id', async (req, res) => {
  const id = req.params.id
  const updateData = req.body
  let { name, date, category, amount } = req.body

  try {
    // get category
    const categories = await Category.find({}).lean()

    // 檢查必要資料，有少就提示
    name = name.trim()
    if (!name || !category || !date || !amount) {

      res.locals.warning_msg = '所有的資料都是必填的唷。'
      return res.render('edit', {
        categories,
        id,
        category,
        name,
        amount,
        date,
      })
    }

    // get record
    const record = await Record.findById(id)

    // get categoryId
    const currentCategory = categories.find(cate => cate.name === category)
    updateData.categoryId = currentCategory._id

    // update data
    for (const key in updateData) {
      if (key in record) {
        record[key] = updateData[key]
      }
    }
    // 存入資料庫 後回去 /records
    await record.save()
    res.redirect('/records')

  } catch (error) {
    console.log(error)
    req.flash('warning_msg', '刪除資料出現預期外的問題，請您再嘗試一次。')
    redirect(`/records/${id}/edit`)
  }
})


// Delete
router.delete('/:id', async (req, res) => {
  const id = req.params.id

  try {
    const record = await Record.findById(id)
    if (record) {
      await record.deleteOne()
    }
    return res.redirect('/records')

  } catch (err) {
    console.log(err)
    req.flash('warning_msg', '刪除資料出現預期外的問題，請您再嘗試一次。')
    redirect('/records')
  }

})

module.exports = router