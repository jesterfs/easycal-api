const MembersService = require('../members/membersservice')

function decryptToken(token) {
    const userId = Number( Buffer.from(token, 'base64').toString('binary') );
    return { userId };
}

function requireAuth(req, res, next) {
    const authHeader = req.get('Authentication');
    if (!authHeader)
        return res.status(401).json({message: 'Missing Authentication header'});
    
    const token = authHeader.slice('Bearer '.length);
    const {userId} = decryptToken(token);

    return MembersService.getById(req.app.get('db'), userId).then(
        (user) => {

            if (!user)
                return res.status(401).json({message: 'Invalid token'});

            res.user = user;
            next();
        });
}
  
  module.exports = {
    requireAuth,
  }