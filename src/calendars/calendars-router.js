
const path = require('path')
const express = require('express')
// const xss = require('xss')
const CalendarsService = require('./calendarsservice')
const { requireAuth } = require('../middleware/basic-auth')


const calendarsRouter = express.Router()
const jsonParser = express.json()

const serializeCalendar = calendar => ({
    id: calendar.id,
    name: calendar.name,
    owner: calendar.owner,
  })
  


    calendarsRouter
        .route('/')
        .all(requireAuth)
        .get( (req, res, next) => {
          CalendarsService.getAllCalendars(req.app.get('db'))
          .then(calendars => {
            res.json(calendars)
          })
          .catch(next)
        })

        .post(jsonParser, (req, res, next) => {
          const {name, owner, inviteIds} = req.body
          const newCalendar = {name, owner}
          CalendarsService.insertCalendarWithInvites(req.app.get('db'), newCalendar, inviteIds)
            .then(calendar => {
              res
                .status(201)
                .location(`/api/calendars/${calendar.id}`)
                .json(calendar)
            })
            .catch(next)
        })

    calendarsRouter
        .route('/:id')
        .all(
          requireAuth, 
          (req, res, next) => {
          if(isNaN(parseInt(req.params.id))) {
            return res.status(404).json({
              error: {message: 'Invalid Id'}
            })
          }
          CalendarsService.getMembersById(
            req.app.get('db'),
            req.params.id
          )
            .then(calendar => {
              if(!calendar) {
                return res.status(404).json({
                  error: { message: 'Calendar does not exist'}
                })
              }
              res.calendar= calendar
              next()
            })
            .catch(next)
          })

        .get((req, res, next) => {
         
          res.json(res.calendar)
        })

        .delete((req, res, next) => {
          CalendarsService.deleteCalendar(
            req.app.get('db'),
            req.params.id
          )

            .then(numRowsAffected => {
              res.status(204).end()
            })
            .catch(next)
        })

        .patch(jsonParser, (req, res, next) => {
          const { name, owner } = req.body
          const calendarToUpdate = { name, owner }

          const numberOfValues = Object.values(calendarToUpdate).filter(Boolean).length
          if (numberOfValues === 0)
            return res.status(400).json({
              error: { message: 'Request must contain either "name" or "owner"'}
            })

          CalendarsService.updateCalendar(
            req.app.get('db'),
            req.params.id,
            calendarToUpdate
          )
            .then(updatedCalendar => {
              res.status(200).json(serializeCalendar(updatedCalendar))
            })
            .catch(next)
        })

module.exports = calendarsRouter