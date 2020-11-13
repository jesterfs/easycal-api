const MemberEventsService = {
    getAllMemberEvents(knex) {
      return knex.select('*').from('member_events')
    },
    insertMemberEvent(knex, newMemberEvent) {
      return knex
        .insert(newMemberEvent)
        .into('member_events')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getById(knex, id) {
      return knex.from('member_events').select('*').where('id', id).first()
    },

    getByMemberId(knex, member_id ) {
      return knex.from('member_events').select('*').where('member_id', member_id)
    },

    // deleteMemberEvent(knex, id) {
    //   return knex('member_events')
    //     .where({ id })
    //     .delete()
    // },
    updateMemberEvent(knex, id, newMemberEventFields) {
      return knex('member_events')
        .where({ id })
        .update(newMemberEventFields)
    },
  }
  
  module.exports = MemberEventsService