const CalendarsService = require('../src/calendars/calendarsservice.js')
const knex = require('knex')

describe('calendars service object', function() {
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
            start_time: '2020-10-01 12:00:00',
            end_time: '2020-10-01 12:00:00',
            calendar_id: 4,
            owner_id: 1
        },
        {
            id: 2,
            name: 'event2',
            start_time: '2020-10-02 12:00:00',
            end_time: '2020-10-02 12:00:00',
            calendar_id: 5,
            owner_id: 2
        },
        {
            id: 3,
            name: 'event3',
            start_time: '2020-10-03 12:00:00',
            end_time: '2020-10-03 12:00:00',
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

    let testMemberCalendars = [
        {
            member_id: 1,
            calendar_id: 4
        },
        {
            member_id: 2,
            calendar_id: 4
        },
        {
            member_id: 3,
            calendar_id: 6
        },
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })

    const cleanUp = () => db.raw('TRUNCATE TABLE members, calendars, member_calenders, events, member_events RESTART IDENTITY CASCADE');

    before(cleanUp)

    afterEach(cleanUp)

    after(() => db.destroy())



   context('Given calendars has data', () => {

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


        beforeEach(() => {
            return db
                .into('member_calenders')
                .insert(testMemberCalendars)
        })

        it(` getAllCalendars() resolves all calendars from 'calendars' table`, () => {
             //test that CalendarsSService.getAllCalendars gets all calendars
             return CalendarsService.getAllCalendars(db)
                .then(actual => {
                    expect(actual).to.eql(testCalendars)
                })
        } )

        it('getById() resolves an calendar by id from calendars', () => {
            const thirdId = 3
            const thirdTestCalendar = testCalendars[thirdId - 1]
            return CalendarsService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestCalendar.name,
                        owner: thirdTestCalendar.owner,
                    })
                })
        })

        it('getMembersById() resolves all members from a calendar', () => {
            const calendarId = 4
            return CalendarsService.getMembersById(db, calendarId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: testCalendars[0].id,
                        name: testCalendars[0].name,
                        owner: [{
                            id: testmembers[0].id,
                            name: testmembers[0].name,
                            email: testmembers[0].email
                        }],
                        members: [{
                            id: testmembers[0].id,
                            name: testmembers[0].name,
                            email: testmembers[0].email,
                            password: testmembers[0].password
                        },
                        {
                            id: testmembers[1].id,
                            name: testmembers[1].name,
                            email: testmembers[1].email,
                            password: testmembers[1].password
                        }]
                    })
                })
        })

        it('deleteCalendar() removes a calendar by id from calendars', () => {
            const calendarId = 3
            return CalendarsService.deleteCalendar(db, calendarId)
                .then(() => CalendarsService.getAllCalendars(db))
                .then(allCalendars => {
                    const expected = testCalendars.filter(calendar => calendar.id !== calendarId)
                    expect(allCalendars).to.eql(expected)
                })
        })

        it('updateCalendar() updates an calendar from calendars', () => {
            const idOfCalendarToUpdate = 3
            const newCalendarData = {
                name: 'updated name',
                owner: 'updated owner'
            }
            return CalendarsService.updateCalendar(db, idOfCalendarToUpdate, newCalendarData)
                .then(() => CalendarsService.getById(db, idOfCalendarToUpdate))
                .then(calendar => {
                    expect(calendar).to.eql({
                        id: idOfCalendarToUpdate,
                        ...newCalendarData,
                    })
                })
        })
    })

    context('Given Calendars has no data', () => {
        it('getAllCalendars() resolves an empty array', () => {
            return CalendarsService.getAllCalendars(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })

    it('insertCalendar() inserts a new calendar and respolves the new calendar with an id', () => {
        const newCalendar = {
            name: 'Test new Calendar',
            owner: 'test owner'
        }
        return CalendarsService.insertCalendar(db, newCalendar)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1,
                    name: newCalendar.name,
                    owner: newCalendar.owner,
                })
            })
    })
})
