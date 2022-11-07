const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

dotenv.config({ path: './config/config.env' });

require('./config/passport')(passport)

connectDB()
const app = express()

// body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// handlebar helpers
const { formatDate } = require('./helpers/hbs')

// handlebars
app.engine('.hbs', engine({ helpers: { formatDate }, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// sessions
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// static folder
app.use(express.static(path.join(__dirname, 'public')))

// routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${PORT}`))