
const path = require('path')
const express = require('express')
// const xss = require('xss')
const EventsService = require('./eventsservice')
const { requireAuth } = require('../middleware/basic-auth')

const eventsRouter = express.Router()
const jsonParser = express.json()

const serializeEvent = event => ({
    id: event.id,
    name: event.name,
    start_time: event.start_time,
    end_time: event.end_time,
    owner_id: event.owner_id,
    calendar_id: event.calendar_id,
    members: event.members
  })
  
  
//   events: member.events.map((e) => ({
//     endTime: e.endTime,
//     id: e.id,
//     ...
    
//   })
// member.events.map(serializeEvent)




eventsRouter
    .route('/')
    .all(requireAuth)
    .get( (req, res, next) => {
        EventsService.getAllEvents(req.app.get('db'))
            .then(events => {
                res.json(events)
            })
            .catch(next)
    })

    .post( jsonParser, (req, res, next) => {
        const {name, start_time, startingtime, end_time, endingtime, owner_id, calendar_id, inviteIds} = req.body
        const newEvent = {name, start_time, startingtime, end_time, endingtime, owner_id, calendar_id}
        

        

        EventsService.insertEventWithInvites(req.app.get('db'), newEvent, inviteIds)
            .then(event => {
                res
                    .status(201)
                    .location(`/api/events/${event.id}`)
                    .json(event)
            })
        .catch(next)
    })

    // eventsRouter
    // .route('/calendar/:calendarId')
    // .get((req, res, next) => {
    //     EventsService.getByCalendar(
    //         req.app.get('db'),
    //         req.params.calendarId)
    //         .then(events => {
    //             res.json(events)
    //         })
    //         .catch(next)
    // })

eventsRouter
    .route('/:id')
    .all(requireAuth, (req, res, next) => {
        if(isNaN(parseInt(req.params.id))) {
            return res.status(404).json({
                error: {message: 'Invalid ID'}
            })
        }
        EventsService.getMembersByEventId(
            req.app.get('db'),
            req.params.id
        )
            .then(event => {
                if(!event) {
                    return res.status(404).json({
                        error: {message: 'event does not exist'}
                    })
                }
                res.event = event
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(res.event)
    })

    .delete((req, res, next) => {
        
        if (res.user.id !== res.event.owner.id)
            return res.status(403).json({message: 'forbidden' });
        EventsService.deleteEvent(
            req.app.get('db'),
            req.params.id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const {name, start_time, end_time, owner_id, calendar_id, inviteIds}= req.body
        const eventToUpdate = {name, start_time, end_time, owner_id, calendar_id}
        // const membersToInvite = {inviteIds}

        const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
            error: { message: 'Request body must contain either "name", "start_time", "end_time", "owner_id" or "calendar_id" '}
            })
        
        EventsService.updateEventWithInvites(
            req.app.get('db'),
            req.params.id,
            eventToUpdate,
            inviteIds
        )

            .then(updatedEvent => {
                res.status(200).json(serializeEvent(updatedEvent))
            })
        
        

          .catch(next)
    })
    

    module.exports = eventsRouter