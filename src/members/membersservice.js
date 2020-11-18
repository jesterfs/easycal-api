function buildCalendars(results) {
  const calendarIds = new Set();
  const calendars = [];
  for (const line of results) {
    
    const { calendarId, calendarName } = line;
    
    if (calendarId) {
      if (calendarIds.has(calendarId))
        continue;

      calendarIds.add(calendarId);
      
      const calendar = {
        id: calendarId,
        name: calendarName
      };
      
      calendars.push(calendar);
    }}}

const MembersService = {
    getAllMembers(knex) {
      return knex.select({
        id: 'members.id',
      name: 'members.name'})
      .from('members')
    },
    insertMember(knex, newMember) {
      return knex
        .insert(newMember)
        .into('members')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },

    inviteMemberToCalendars(db, memberId, calendarIds) {
      return db('member_calenders').insert(
        calendarIds.map((id) => ({
          member_id: memberId, calendar_id: id
        })
      ));
    },

    async insertMemberWithCalendars(db, newMember, calendarIds) {
      const member = await this.insertMember(db, newMember);
      
      
      await this.inviteMemberToCalendars(db, member.id, calendarIds);
      return member;
  },

//////

    getById(knex, id) {
      return knex.from('members').select('*').where('id', id).first()
    },

    

    getByEmail(knex, email) {
      return knex.from('members').select('*').where('email', email).first()
    },

    getMembersWithCalendars(db, ids) {
      return Promise.all(
         ids.map((id) => this.getByMemberId(db, id))
     )
   },
   
   getMemberWithCalendars(db, memberId) {
    return db('members').select({
      id: 'members.id',
      name: 'members.name',
      // email: 'members.email',
      calendarId: 'calendars.id',
      calendarName: 'calendars.name'
      
    })
      .leftJoin({mc: 'member_calenders'}, )
      .leftJoin('calendars', 'mc.calendar_id', 'calendars.id')
      .where({ 'members.id': memberId })
      .then((results) => {
        const { id, name, email } = first;
        const member = {
          id, name, email, calendars: buildCalendars(results)
        };
        return member;
      });
  },

/////////////////////


/////////////////////











    getByMemberId(db, memberId) {
      return db('members').select({
        id: 'members.id',
        name: 'members.name',
        // email: 'members.email',
        eventId: 'events.id',
        eventName: 'events.name',
        eventStartTime: 'events.start_time',
        eventEndTime: 'events.end_time',
        ownerId: 'o.id',
        ownerName: 'o.name',
        // ownerEmail: 'o.email',
        calendarId: 'calendars.id',
        calendarName: 'calendars.name'
        
      })
        .leftJoin('member_events', 'members.id', 'member_events.member_id')
        .leftJoin('events', 'member_events.event_id', 'events.id')
        .leftJoin({ o:'members'}, 'o.id', 'events.owner_id')
        .leftJoin({mc: 'member_calenders'}, 'members.id', 'mc.member_id')
        .leftJoin('calendars', 'mc.calendar_id', 'calendars.id')
        .where({ 'members.id': memberId })
        .then((results) => {
          const first = results[0];
          if (!first)
            return null;
    
          const { id, name, email } = first;
          const member = {
            id, name, email, events: [], calendars: []
          };
    
          const eventIds = new Set();
    for (const line of results) {
      
      const { eventId, eventName, eventStartTime, eventEndTime, ownerId, ownerName, ownerEmail } = line;
  
      if (eventId) {
        if (eventIds.has(eventId))
          continue;

        eventIds.add(eventId);
        
        const event = {
          id: eventId,
          name: eventName,
          start_time: eventStartTime,
          end_time: eventEndTime,
          owner: {
            id: ownerId,
            name: ownerName,
            email: ownerEmail
          }
        };
        
        member.events.push(event);
      }
    }

        const calendarIds = new Set();
        for (const line of results) {
          
          const { calendarId, calendarName } = line;
          
          if (calendarId) {
            if (calendarIds.has(calendarId))
              continue;

            calendarIds.add(calendarId);
            
            const calendar = {
              id: calendarId,
              name: calendarName
            };
            
            member.calendars.push(calendar);
          }
        }

          
          return member;
        });
    },


    deleteMember(knex, id) {
      return knex('members')
        .where({ id })
        .delete()
    },
    updateMember(knex, id, newMemberFields) {
      return knex('members')
      .where({ id })
      .update(newMemberFields, "*")  
      
        
    },
  }
  
  module.exports = MembersService