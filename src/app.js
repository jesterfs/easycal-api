require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const MembersRouter = require('./members/members-router')
const CalendarsRouter = require('./calendars/calendars-router')
const EventsRouter = require('./events/events-router')
const jsonParser = express.json()
const path = require('path')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption, {
  skip: () => NODE_ENV === 'test',
}))


app.use(
    cors(
        
    )
);
app.use(helmet())

app.use('/api/members', MembersRouter)
app.use('/api/calendars', CalendarsRouter)
app.use('/api/events', EventsRouter)




app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
    })

module.exports = app