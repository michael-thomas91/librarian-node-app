if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/authors')
const bookRouter = require('./routes/books')
const mongoose = require('mongoose')


const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use(expressLayouts)
app.use(methodOverride('_method'))

app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
})
const db = mongoose.connection
db.on('error', error => console.log(error))
db.on('open', () => console.log('Connected to Mongoose.'))

app.use('/', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)

app.listen(process.env.port || 3000, () => {
    console.log(`Server Up!`)
})