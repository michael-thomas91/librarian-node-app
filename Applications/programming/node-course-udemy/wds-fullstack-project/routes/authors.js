const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

// authors home page will populate with all the authors we have
// there will be a search bar that uses RegExp to find any matches and repopulate the main-content
// with the search matches
router.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name) {
        searchOptions.author = new RegExp(req.query.name.trim(), 'i') // use RegExp constructor for changing input
    }
    try {
        const authors = await Author.find(searchOptions)
        res.render('authors/index',  {
            authors,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})
// req.query comes from get requests, req.body comes from post (form data)

router.get('/new', (req, res) => {
    res.render('authors/new', {
        author: new Author()
    })
})

router.post('/', async (req, res) => {

    const author = new Author({
        author: req.body.author
    })

    try {
        await author.save()
        res.redirect('authors')

    } catch (error) {
        res.render('authors/new', {
            author,
            errorMessage: 'Error creating author'
        })
    }
})

router.get('/:id', async (req, res) => {
    
    try {
        const author = await Author.findById(req.params.id)
        const booksByThisAuthor = await Book.find({ author: author.id }).limit(5).exec()
        res.render('authors/viewAuthor', {
            author,
            booksByThisAuthor
        })
    } catch {
         res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
    res.render('authors/edit', { author } )
    } catch {
        res.redirect('/authors')
    }
})

// Update Author Route
router.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.author = req.body.author
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (!author) {
            res.redirect('/')
        } else {
            res.render('authors/edit', {
                author,
                errorMessage: 'Error updating author.'
            })
        }
    }
})
// Delete Author Route
router.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect('/authors')
    } catch {
        if (!author) {
            res.redirect('/')
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
})


module.exports = router