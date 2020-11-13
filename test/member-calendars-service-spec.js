const MemberCalendarsService = require('../src/member-calendars/membercalendarsservice.js')
const knex = require('knex')

describe('member calendars service object', function() {
    let db 

    let testmembercalendars = [
        {
            member_id: 1,
            calendar_id: 1
        },
        {
            member_id: 2,
            calendar_id: 2
        },
        {
            
            member_id: 3,
            calendar_id: 3
        }
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
    })

    const cleanUp = () => db.raw('TRUNCATE TABLE calendars RESTART IDENTITY CASCADE');

    before(cleanUp)

    afterEach(cleanUp)

    after(() => db.destroy())


   context('Given member_calendars has data', () => {

        beforeEach(() => {
            return db
                .into('member_calendars')
                .insert(testmemberCalendars)
        })

        it(` getAllmembercalendars() resolves all calendars from 'member_calendars' table`, () => {
             //test that MemberCalendarsService.getAllmemberCalendars gets all members
             return MemberCalendarsService.getAllMemberCalendars(db)
                .then(actual => {
                    expect(actual).to.eql(testmembercalendars)
                })
        } )

        // it('getById() resolves an member by id from members', () => {
        //     const thirdId = 3
        //     const thirdTestMember = testmembers[thirdId - 1]
        //     return MembersService.getById(db, thirdId)
        //         .then(actual => {
        //             expect(actual).to.eql({
        //                 id: thirdId,
        //                 name: thirdTestMember.name,
        //                 email: thirdTestMember.email,
        //                 password: thirdTestMember.password
        //             })
        //         })
        // })

        // it('deleteMember() removes a member by id from members', () => {
        //     const memberId = 3
        //     return MembersService.deleteMember(db, memberId)
        //         .then(() => MembersService.getAllMembers(db))
        //         .then(allmembers => {
        //             const expected = testmembers.filter(member => member.id !== memberId)
        //             expect(allmembers).to.eql(expected)
        //         })
        // })

        // it('updateMemberCalendar() updates a member_calendar from member_calendar', () => {
        //     const idOfMemberCalendarToUpdate = 3
        //     const newMemberData = {
        //         name: 'updated name',
        //         email: 'updated email',
        //         password:'updated password'
        //     }
        //     return MembersService.updateMember(db, idOfMemberToUpdate, newMemberData)
        //         .then(() => MembersService.getById(db, idOfMemberToUpdate))
        //         .then(member => {
        //             expect(member).to.eql({
        //                 id: idOfMemberToUpdate,
        //                 ...newMemberData,
        //             })
        //         })
        // })
    })

    context('Given member_calendars has no data', () => {
        it('getAllMemberCalendars() resolves an empty array', () => {
            return MemberCalendarsService.getAllMemberCalendars(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })

    it('insertMemberCalendar() inserts a new member calendar', () => {
        const newMemberCalendar = {
            member_id: 3,
           calendar_id: 4
            
        }
        return MemberCalendarsService.insertMemberCalendar(db, newMemberCalendar)
            .then(actual => {
                expect(actual).to.eql({
                    member_is: newMemberCalendar.member_id,
                    calendar_id: newMemberCalendar.calendar_id

                })
            })
    })
})
