const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next) {
    Book.find({ author: this.id }, (error, books) => {
        if (error) {
            next(error)
        } else if (books.length > 0) {
            next(new Error('This author still has books associated with it'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('author', authorSchema)