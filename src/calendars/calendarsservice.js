const CalendarsService = {
    getAllCalendars(knex) {
      return knex.select('*').from('calendars')
    },


    getById(knex, id) {
      return knex.from('calendars').select('*').where('id', id).first()
    },

    insertCalendar(knex, newCalendar) {
      return knex
        .insert(newCalendar)
        .into('calendars')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },



    inviteMembers(db, calendarId, memberIds) {
      return db('member_calenders').insert(
        memberIds.map((id) => ({
          member_id: id, calendar_id: calendarId
        })
      ));
    },

    async insertCalendarWithInvites(db, newCalendar, memberIds) {
      const calendar = await this.insertCalendar(db, newCalendar);
      
      
      await this.inviteMembers(db, calendar.id, memberIds);
      return calendar ;
  },


    getMembersById(db, calendarId) {
      return db('calendars').select({
        id: 'calendars.id',
        name: 'calendars.name',
        
        ownerId: 'o.id',
        ownerName: 'o.name',
        
        memberId: 'members.id',
        memberName: 'members.name',
        
        eventId: 'events.id',
        eventName: 'events.name',
        eventStart: 'events.start_time',
        eventEnd: 'events.end_time',
        eventOwner: 'events.owner_id'
      })
        .leftJoin('member_calenders', 'calendars.id', 'member_calenders.calendar_id')
        .leftJoin('members', 'member_calenders.member_id', 'members.id')
        
        .leftJoin('events', 'events.calendar_id', 'calendars.id')
        .leftJoin({ o:'members'}, 'o.id', 'calendars.owner')
        
        .where({ 'calendars.id': calendarId })
        .then((results) => {
          const first = results[0];
          if (!first)
            return null;
    
          const { id, name} = first;
          const calendar = {
            id, name, owner: [], members: [], events: []
          };
          
          const oIds = new Set();

          for (const line of results) {
            const {  ownerId, ownerName } = line;
            
            if (ownerId && !oIds.has(ownerId)) {
              const owner = {
                  id: ownerId,
                  name: ownerName,
                };
                calendar.owner.push(owner);
                oIds.add(ownerId)
              }
            }
          
          const mIds = new Set();

          for (const line of results) {
            const {  memberId, memberName } = line;
            
           
            

            if (memberId && !mIds.has(memberId)) {
              const member = {
                id: memberId,
                name: memberName
                
                
              };
              calendar.members.push(member);
              mIds.add(memberId)
            }

          }

          const eIds = new Set();
          for (const line of results) {
            const {  eventId, eventName, eventStart, eventEnd, eventOwner } = line;
            
           
            

            if (eventId && !eIds.has(eventId)) {
              const event = {
                id: eventId,
                name: eventName,
                start: eventStart,
                end: eventEnd,
                owner: eventOwner
                
              };
              calendar.events.push(event);
              eIds.add(eventId)
            }
          }


          return calendar;
        });
    },

    deleteCalendar(knex, id) {
      return knex('calendars')
        .where({id})
        .delete()
    },

    updateCalendar(knex, id, newCalendarFields) {
      return knex('calendars')
        .where({id})
        .update(newCalendarFields)
    },
}
  module.exports = CalendarsService