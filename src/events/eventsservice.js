const EventsService = {
    getAllEvents(knex) {
      return knex.select('*').from('events')
    },


    insertEvent(knex, newEvent) {
      return knex
        .insert(newEvent)
        .into('events')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },

    

    inviteMembers(db, eventId, memberIds) {
      return db('member_events').insert(
        memberIds.map((id) => ({
          member_id: id, event_id: eventId
        })
      ));
    },

    async insertEventWithInvites(db, newEvent, memberIds) {
      const event = await this.insertEvent(db, newEvent);
     
      
      await this.inviteMembers(db, event.id, memberIds);
      return event;
  },

  clearInvites(db, event_id) {
    return db('member_events').where({ event_id }).del();
 },

    async updateEventWithInvites(db, id, newEventFields, memberIds) {
      const updatedEvent = await this.updateEvent(db, id, newEventFields);
      
      await this.clearInvites(db, id)
      await this.inviteMembers(db, id, memberIds)
      return updatedEvent
    },


    getById(knex, id) {
      return knex.from('events').select('*').where('id', id).first()
    },

    getMembersByEventId(db, eventId) {
      return db('events').select({
        id: 'events.id',
        name: 'events.name',
        startTime: 'events.start_time',
        endTime: 'events.end_time',
        calendarId: 'events.calendar_id',
        ownerId: 'o.id',
        ownerName: 'o.name',
        memberId: 'members.id',
        memberName: 'members.name',
        memberEmail: 'members.email'
      })
        .leftJoin({ o:'members'}, 'o.id', 'events.owner_id')
        .leftJoin('member_events', 'events.id', 'member_events.event_id')
        .leftJoin('members', 'member_events.member_id', 'members.id')
        
        .where({ 'events.id': eventId })
        .then((results) => {
          const first = results[0];
          if (!first)
            return null;
    
          const { id, name, startTime,  endTime,  calendarId } = first;
          const event = {
            id, name, startTime,   endTime, calendarId, owner: [], members: []
          };

          

          
          const {ownerId, ownerName} = results[0];

            if(ownerId) {
              const owner = {
                id: ownerId,
                name: ownerName
              };
              event.owner = owner;
            }
          
    
          const mIds = new Set();

          for (const line of results) {
            const { memberId, memberName, memberEmail } = line;
    
            if (memberId && !mIds.has(memberId)) {
              const member = {
                id: memberId,
                name: memberName,
                email: memberEmail
                
              };
              event.members.push(member);
              mIds.add(memberId)
            }
          }
          return event;
        });
    },

    deleteEvent(knex, id) {
      return knex('events')
        .where({ id })
        .delete()
    },
    updateEvent(knex, id, newEventFields) {
      return knex('events')
        .where({ id })
        .update(newEventFields, '*')
        .then((r) => r[0])
    }
}

  
  module.exports = EventsService