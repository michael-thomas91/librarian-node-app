const express = require('express')
const router = express.Router()
const Book = require('../models/book')

router.get('/', async (req, res) => {
    let books
    try {
        books = await Book.find().sort({ createdAt : 'desc' }).limit(10).exec()
    } catch {
        books = []
    }
    res.render('index', { books })
})
// database queries dont throw error unless its not connected
module.exports = router