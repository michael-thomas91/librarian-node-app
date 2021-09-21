const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']


// authors home page will populate with all the authors we have
// there will be a search bar that uses RegExp to find any matches and repopulate the main-content
// with the search matches
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title) {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore) {
        query = query.lte('publishedDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter) {
        query = query.gte('publishedDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books, 
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})
// req.query comes from get requests, req.body comes from post (form data)

router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
 })

router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        author: req.body.author
    })
    saveCover(book, req.body.cover)
    try {
        await book.save()
        res.redirect('books')
    } catch {
        renderNewPage(res, book, true)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
                               .populate('author')
                               .exec()
        console.log(book)
        res.render('books/viewBook', { book })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        res.render('books/edit', { book })
    } catch {
        res.redirect('/books')
    }
    
})

router.put('/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    try {
        const book = await Book.findById(req.params.id)
        updates.forEach(update => {
            book[update] = req.body[update]
        })
        await book.save()
        res.redirect(`/books${book.id}`, { books })
    } catch {
        res.redirect('/books')
    }
    
})

router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch {
        if (!book) {
            res.redirect('/')
        } else {
            res.redirect(`/books/${book.id}`, {
                book,
                errorMessage: 'Error deleting book'
            })
        }
    }
})


async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = { authors, book }

        if (hasError) {
            params.errorMessage = 'Error creating book.'
        }
        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded) {
    if (!coverEncoded) {
        return
    }
    const cover = JSON.parse(coverEncoded)
    if (cover && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}

module.exports = router

