const MemberCalendarsService = {
    getAllMemberCalendars(knex) {
      return knex.select('*').from('member_calendars')
    },

    insertMemberCalendar(knex, newMemberCalendar) {
      return knex
        .insert(newMemberCalendar)
        .into('member_calendars')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },

    getById(knex, id) {
      return knex.from('member_calendars').select('*').where('id', id).first()
    },

    deleteMemberCalendar(knex, id) {
      return knex('member_calendars')
        .where({id})
        .delete()
    },

    updateMemberCalendar(knex, id, newMemberCalendarFields) {
      return knex('member_calendars')
        .where({id})
        .update(newMemberCalendarFields)
    },
}
  module.exports = MemberCalendarsService