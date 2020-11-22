const MembersService = require('../src/members/MembersService.js')
const knex = require('knex')

describe('members service object', function() {
    let db 

    let testmembers = [
        {
            id: 4,
            name: 'member1',
            email: 'member1@mail.com',
            password: 'password'
        },
        {
            id: 5,
            name: 'member2',
            email: 'member2@mail.com',
            password: 'password'
        },
        {
            
            id: 6,
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
            owner_id: 4
        },
        {
            id: 2,
            name: 'event2',
            start_time: new Date ('2020-10-02T17:00:00.000Z'),
            end_time: new Date ('2020-10-02T17:00:00.000Z'),
            calendar_id: 5,
            owner_id: 5
        },
        {
            id: 3,
            name: 'event3',
            start_time: new Date ('2020-10-02T17:00:00.000Z'),
            end_time: new Date ('2020-10-02T17:00:00.000Z'),
            calendar_id: 6,
            owner_id: 6
        }
    ]

    let testMemberEvents = [
        {
            member_id: 4,
            event_id: 1
        },
        {
            member_id: 5,
            event_id: 2
        },
        {
            member_id: 6,
            event_id: 3
        }
    ]

    let testCalendars = [
        {
            id: 4,
            name: 'calendar1',
            owner: 4
        },
        {
            id: 5,
            name: 'calendar2',
            owner: 5
        },
        {
            
            id: 6,
            name: 'calendar3',
            owner: 6
        }
    ]

    let testMemberCalendars = [
        {
            member_id: 4,
            calendar_id: 4
        },
        {
            member_id: 5,
            calendar_id: 5
        },
        {
            member_id: 6,
            calendar_id: 6
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

        beforeEach(() => {
            return db
                .into('member_calenders')
                .insert(testMemberCalendars)
        })

        


        it(` getAllmembers() resolves all members from 'members' table`, () => {
             //test that MembersService.getAllmembers gets all members
             return MembersService.getAllMembers(db)
                .then(actual => {
                    expect(actual).to.eql([
                        {
                            id: 4,
                            name: 'member1',
                            
                        },
                        {
                            id: 5,
                            name: 'member2',
                            
                        },
                        {
                            
                            id: 6,
                            name: 'member3',
                            
                        }
                    ])
                })
        } )

        it('getById() resolves an member by id from members', () => {
            const thirdId = 6
            const thirdTestMember = testmembers[thirdId - 4]
            return MembersService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        name: thirdTestMember.name,
                        email: thirdTestMember.email,
                        password: thirdTestMember.password
                    })
                })
        })


        it('getByMemberId() resolves all events from a member', () => {
            const memberId = 4
            return MembersService.getByMemberId(db, memberId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: testmembers[0].id,
                        name: testmembers[0].name,
                        events: [{
                            end_time: testEvents[0].end_time,
                            id: testEvents[0].id,
                            name: testEvents[0].name,
                            start_time: testEvents[0].start_time,
                            owner: {
                                id: testmembers[0].id,
                                name: testmembers[0].name
                            }
                           
                        }],
                        calendars: [{
                            id: testCalendars[0].id,
                            name: testCalendars[0].name
                        }]
                    })
                })
        })



        it('deleteMember() removes a member by id from members', () => {
            const memberId = 6
            return MembersService.deleteMember(db, memberId)
                .then(() => MembersService.getAllMembers(db))
                .then(allmembers => {
                    const expected = testmembers.filter(member => member.id !== memberId)
                    expect(allmembers).to.eql([
                        {
                            id: 4,
                            name: 'member1',
                            
                        },
                        {
                            id: 5,
                            name: 'member2',
                            
                        }
                    ])
                })
        })

        it('updateMember() updates a member from members', () => {
            const idOfMemberToUpdate = 6
            const newMemberData = {
                name: 'updated name',
                email: 'updated email',
                password:'updated password'
            }
            return MembersService.updateMember(db, idOfMemberToUpdate, newMemberData)
                .then(() => MembersService.getById(db, idOfMemberToUpdate))
                .then(member => {
                    expect(member).to.eql({
                        id: idOfMemberToUpdate,
                        ...newMemberData,
                    })
                })
        })
        it('insertMemberWithCalendars() inserts a new member and resolves the new member with an id', () => {
            
            const newMember = {
                name: 'Test new member',
                email: 'test email1',
                password: 'test password'
            }
            const calendarIds = []
            return MembersService.insertMemberWithCalendars(db, newMember, calendarIds)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newMember.name,
                        email: newMember.email,
                        password: newMember.password
    
                    })
                })
        })
    })

    context('Given members has no data', () => {
        

        it('getAllMembers() resolves an empty array', () => {
            return MembersService.getAllMembers(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
        it('insertMember() inserts a new member and resolves the new member with an id', () => {
            const newMember = {
                name: 'Test new member',
                email: 'test email',
                password: 'test password'
            }
            return MembersService.insertMember(db, newMember)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        name: newMember.name,
                        email: newMember.email,
                        password: newMember.password
    
                    })
                })
        })

        

        
    })

    
})
