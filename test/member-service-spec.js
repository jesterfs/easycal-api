const MembersService = require('../src/members/MembersService.js')
const knex = require('knex')

describe('members service object', function() {
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

        


        it(` getAllmembers() resolves all members from 'members' table`, () => {
             //test that MembersService.getAllmembers gets all members
             return MembersService.getAllMembers(db)
                .then(actual => {
                    expect(actual).to.eql(testmembers)
                })
        } )

        it('getById() resolves an member by id from members', () => {
            const thirdId = 3
            const thirdTestMember = testmembers[thirdId - 1]
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
            const memberId = 1
            return MembersService.getByMemberId(db, memberId)
                .then(actual => {
                    expect(actual).to.eql({
                        email: testmembers[0].email,
                        id: testmembers[0].id,
                        name: testmembers[0].name,
                        events: [{
                            endTime: testEvents[0].end_time,
                            id: testEvents[0].id,
                            name: testEvents[0].name,
                            start_time: testEvents[0].start_time,
                            owner: {
                                email: testmembers[0].email,
                                id: testmembers[0].id,
                                name: testmembers[0].name
                            }
                            
                        }]
                    })
                })
        })



        it('deleteMember() removes a member by id from members', () => {
            const memberId = 3
            return MembersService.deleteMember(db, memberId)
                .then(() => MembersService.getAllMembers(db))
                .then(allmembers => {
                    const expected = testmembers.filter(member => member.id !== memberId)
                    expect(allmembers).to.eql(expected)
                })
        })

        it('updateMember() updates a member from members', () => {
            const idOfMemberToUpdate = 3
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
    })

    context('Given members has no data', () => {
        it('getAllMembers() resolves an empty array', () => {
            return MembersService.getAllMembers(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
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
