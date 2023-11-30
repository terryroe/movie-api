const jwtSecret = 'thisisalongsecretstringthatishardtoguess';

const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

/**
 * Performs generation of a token from a given User object.
 * @param {object} user - The user object to build the token from.
 * @returns {string} The token for the User.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256',
  });
};

/**
 * POST login.
 * @param {object} router
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      console.log(user);
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
