
const path = require('path')
const express = require('express')
const MembersService = require('./membersservice')
const { requireAuth } = require('../middleware/basic-auth')
var generator = require('generate-password');
const membersRouter = express.Router()
const jsonParser = express.json()


const serializeMember = member => ({
    id: member.id,
    name: member.name,
    email:member.email,
    password: member.password
  })


  const serializeMemberEvents = member => (
    {
      email: member.email,
      id: member.id,
      name: member.name,
      password: member.password,
      events: [{
          endTime: member.events.end_time,
          id: member.events.id,
          name: member.events.name,
          start_time: member.events.start_time,
          owner: {
              email: member.events.owner.email,
              id: member.events.owner.id,
              name: member.events.owner.name
          }
        }]
        })

      function makeAuthToken(userId) {
          // creates a token and returns it for userId
          return Buffer.from(String(userId)).toString('base64');
      }
      
      

membersRouter
    .route('/')
    .all(requireAuth)    
    .get( (req, res, next) => {
      MembersService.getAllMembers(req.app.get('db'))
      .then(members => {
        res.json(members)
      })
      .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
     
        const { name, email, calendarIds=[] }  = req.body;
        const db = req.app.get('db');
        
        
        MembersService.getByEmail(db, email).then(
          (member) => {
            if (member)
              return MembersService.inviteMemberToCalendars(db, member.id, calendarIds);
            
            const password = generator.generate({
              length: 10,
              numbers: true
            });
      
            const newMember = { name, email, password };
      
            return MembersService.insertMemberWithCalendars(db, newMember, calendarIds);
          }
        ).then(
          () => res.json({ message: 'member invited' })
        ).catch(next);
      });


  membersRouter
    .route('/signup')
    .post(jsonParser, (req, res, next) => {
      const {name, email, password, calendarIds=[]} = req.body
      
      const newMember = {name, email, password}

      MembersService.insertMemberWithCalendars(req.app.get('db'), newMember, calendarIds)
          .then(member => {
              res
                  .status(201)
                  .location(`/api/members/${member.id}`)
                  .json({ member, token: makeAuthToken(member.id) })
          })
      .catch(next)
})





  membersRouter
    .route('/login')
    .all(requireAuth)
    .post(jsonParser, (req, res, next) => {
      const { email, password } = req.body;

      
      return MembersService.getByEmail(req.app.get('db'), email).then(
          (member) => {
              if (!member || member.password !== password)
                  return res.status(401).json({message: 'invalid username or password'})

              return res.json({
                  member,
                  token: makeAuthToken(member.id)
              });
            
          })
          .catch(next)
});



  
membersRouter
    .route('/:id')
    .all(requireAuth)
    .all( (req,res,next) => {
        if(isNaN(parseInt(req.params.id))) {
          return res.status(404).json({
            error: {message: 'Invalid id'}
          })
        }
        MembersService.getByMemberId(
          req.app.get('db'),
          req.params.id
        )
          .then(member => {
            if(!member) {
              return res.status(404).json({
                error: { message: 'Member does not exist'}
              })
            }
            res.member= member
            next()
          })
          .catch(next)
      })
  
    .get((req, res, next) => {
    res.json(res.member)
    })

    .delete((req, res, next) => {
    MembersService.deleteMember(
        req.app.get('db'),
        req.params.id
    )
        .then(numRowsAffected => {
        res.status(204).end()
        })
        .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
      const {name, email, password} = req.body
      const memberToUpdate = { name, email, password }

      const numberOfValues = Object.values(memberToUpdate).filter(Boolean).length
      if (numberOfValues === 0)
          return res.status(400).json({
          error: { message: 'Request body must contain either "name", "email", or "password" '}
          })

      MembersService.updateMember(
          req.app.get('db'),
          req.params.id,
          memberToUpdate
      )
          .then(updatedMember => {
              
          res.status(200).json(serializeMember(updatedMember[0]))
          
          })
      .catch(next)
    })

    module.exports = membersRouter