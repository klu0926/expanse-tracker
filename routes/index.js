const router = require('express').Router()
const home = require('./modules/home')
const user = require('./modules/user')
const records = require('./modules/records')

// 最短的放最下面
router.use('/user', user)
router.use('/records', records)
router.use('/', home)

module.exports = router