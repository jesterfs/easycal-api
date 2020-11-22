const EventsService = require('../src/events/eventsservice.js')
const knex = require('knex')

describe('events service object', function() {
    let db 

    let testmembers = [
        {
            id: 1,
            name: 'member1',
            email: 'member1@mail.com',
            password: 'password'
        },
        {
            id: 2,
            name: 'member2',
            email: 'member2@mail.com',
            password: 'password'
        },
        {
            
            id: 3,
            name: 'member3',
            email: 'member3@mail.com',
            password: 'password'
        }
    ] 

    let testEvents = [
        {
            id: 1,
            name: 'event1',
            start_time: new Date ('2020-10-02T17:00:00.000Z'),
            end_time: new Date ('2020-10-02T17:00:00.000Z'),
            calendar_id: 4,
            owner_id: 1
        },
        {
            id: 2,
            name: 'event2',
            start_time: new Date ('2020-10-02T17:00:00.000Z'),
            end_time: new Date ('2020-10-02T17:00:00.000Z'),
            calendar_id: 5,
            owner_id: 2
        },
        {
            id: 3,
            name: 'event3',
            start_time: new Date ('2020-10-02T17:00:00.000Z'),
            end_time: new Date ('2020-10-02T17:00:00.000Z'),
            calendar_id: 6,
            owner_id: 3
        }
    ]

    let testMemberEvents = [
        {
            member_id: 1,
            event_id: 1
        },
        {
            member_id: 2,
            event_id: 2
        },
        {
            member_id: 3,
            event_id: 3
        }
    ]

    let testCalendars = [
        {
            id: 4,
            name: 'calendar1',
            owner: 1
        },
        {
            id: 5,
            name: 'calendar2',
            owner: 2
        },
        {
            
            id: 6,
            name: 'calendar3',
            owner: 3
        }
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })

    const cleanUp = () => db.raw('TRUNCATE TABLE members, calendars, events, member_events RESTART IDENTITY CASCADE');

    before(cleanUp)

    afterEach(cleanUp)

    after(() => db.destroy())


   context('Given members has data', () => {

        beforeEach(() => {
            return db
                .into('members')
                .insert(testmembers)
        })

        beforeEach(() => {
            return db
                .into('calendars')
                .insert(testCalendars)
        })

        beforeEach(() => {
            return db
                .into('events')
                .insert(testEvents)
        })

        beforeEach(() => {
            return db
                .into('member_events')
                .insert(testMemberEvents)
        })

        


        it(` getAllEvents() resolves all members from 'events' table`, () => {
             
             return EventsService.getAllEvents(db)
                .then(actual => {
                    expect(actual).to.eql(testEvents)
                })
        } )

        it('getById() resolves event by id from members', () => {

            //need to fix date format but otherwise good
            const thirdId = 3
            const thirdTestEvent = testEvents[thirdId - 1]
            return EventsService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestEvent.name,
                        start_time: thirdTestEvent.start_time,
                        end_time: thirdTestEvent.end_time,
                        calendar_id: thirdTestEvent.calendar_id,
                        owner_id: thirdTestEvent.owner_id
                    })
                })
        })

        it('getEventsByCalendar() resolves event by id from members', () => {

            //need to fix date format but otherwise good
            const thirdId = 3
            const thirdTestEvent = testEvents[thirdId - 1]
            return EventsService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestEvent.name,
                        start_time: thirdTestEvent.start_time,
                        end_time: thirdTestEvent.end_time,
                        calendar_id: thirdTestEvent.calendar_id,
                        owner_id: thirdTestEvent.owner_id
                    })
                })
        })


        it('getMembersByEventID() resolves all members from an event', () => {
            
            //need to fix date format and populate owner but otherwise good
            const eventId = 1
            return EventsService.getMembersByEventId(db, eventId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: testEvents[0].id,
                        name: testEvents[0].name,
                        startTime: testEvents[0].start_time,
                        endTime: testEvents[0].end_time,
                        calendarId: testEvents[0].calendar_id,
                        owner: {
                            id: testEvents[0].owner_id,
                            name: testmembers[0].name},
                        members: [{
                            
                            id: testmembers[0].id,
                            name: testmembers[0].name,
                            email: testmembers[0].email
                            
                        }]
                    })
                })
        })



        it('deleteEvent() removes an event by id from events', () => {
            //same date format issue
            const eventId = 3
            return EventsService.deleteEvent(db, eventId)
                .then(() => EventsService.getAllEvents(db))
                .then(allevents => {
                    const expected = testEvents.filter(event => event.id !== eventId)
                    expect(allevents).to.eql(expected)
                })
        })

        it('updateEvent() updates an event from events', () => {
            //date format issue
            const idOfEventToUpdate = 2
            const newEventData = {
                name: 'updated name',
                owner_id: 3,
                start_time: new Date ('2020-11-02T17:00:00.000Z'),
                end_time: new Date ('2020-11-02T17:00:00.000Z'),
                calendar_id: 6, 
            }
            return EventsService.updateEvent(db, idOfEventToUpdate, newEventData)
                .then(() => EventsService.getById(db, idOfEventToUpdate))
                .then(event => {
                    expect(event).to.eql({
                        id: idOfEventToUpdate,
                        ...newEventData,
                    })
                })
        })

        it('updateEventWithInvites() updates an event from events woth new members', () => {
            //date format issue
            const idOfEventToUpdate = 2
            const newEventData = {
                name: 'updated name',
                owner_id: 3,
                start_time: new Date ('2020-11-02T17:00:00.000Z'),
                end_time: new Date ('2020-11-02T17:00:00.000Z'),
                calendar_id: 6, 
            }
            const memberIds = [1, 2]

            return EventsService.updateEventWithInvites(db, idOfEventToUpdate, newEventData, memberIds)
                .then(() => EventsService.getById(db, idOfEventToUpdate))
                .then(event => {
                    expect(event).to.eql({
                        id: idOfEventToUpdate,
                        ...newEventData,
                    })
                })
        })
    })

    context('Given events has no data', () => {
//foreign key problem here
        beforeEach(() => {
            return db
                .into('members')
                .insert(testmembers)
        })

        beforeEach(() => {
            return db
                .into('calendars')
                .insert(testCalendars)
        })

        it('getAllEvents() resolves an empty array', () => {
            return EventsService.getAllEvents(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })

        it('insertEvents() inserts a new event and resolves the new event with an id', () => {
            const newEvent = {
                name: 'new name',
                owner_id: 3,
                start_time: new Date ('2020-10-02T17:00:00.000Z'),
                end_time: new Date ('2020-10-02T17:00:00.000Z'),
                calendar_id: 4
            }
            return EventsService.insertEvent(db, newEvent)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newEvent.name,
                        owner_id: newEvent.owner_id,
                        start_time: newEvent.start_time,
                        end_time: newEvent.end_time,
                        calendar_id: newEvent.calendar_id
    
                    })
                })
        })

        it('insertEventWithInvites() inserts a new event and resolves the new event with an id', () => {
            const newEvent = {
                name: 'new name',
                owner_id: 3,
                start_time: new Date ('2020-10-02T17:00:00.000Z'),
                end_time: new Date ('2020-10-02T17:00:00.000Z'),
                calendar_id: 4
            }

            const memberIds = [1,2]
            return EventsService.insertEventWithInvites(db, newEvent, memberIds)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newEvent.name,
                        owner_id: newEvent.owner_id,
                        start_time: newEvent.start_time,
                        end_time: newEvent.end_time,
                        calendar_id: newEvent.calendar_id
    
                    })
                })
        })
    })

    
})
