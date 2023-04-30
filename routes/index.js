const router = require('express').Router()
const home = require('./modules/home')
const user = require('./modules/user')
const records = require('./modules/records')
const auth = require('./modules/auth')
const data = require('./modules/data')
const { isAuthenticated } = require('../middleware/auth')

// 最短的放最下面
router.use('/records', isAuthenticated, records)
router.use('/auth', auth)
router.use('/user', user)
router.use('/data',isAuthenticated, data)
router.use('/', isAuthenticated, home)

module.exports = router
