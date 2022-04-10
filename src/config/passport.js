const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: LocalStrategy } = require('passport-local');
const passport = require('passport');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { User } = require('../models');
const UserSession = require('../models/userSession.model');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

const localStrategy = new LocalStrategy({ usernameField: 'addr', passwordField: 'signature' }, async function verify(
  addr,
  signature,
  done
) {
  const user = await UserSession.findOne({ addr }).exec();

  if (!user) {
    return done(null, false);
  }

  if (!(await user.verifySignature(signature))) {
    return done(null, false);
  }

  console.log('Logged in: ' + user);
  return done(null, user);
});

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
  console.log('Serializing user: ' + user);
  done(null, user.addr);
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
  console.log('Deserializing user: ' + id);
  UserSession.findOne({ addr: id }, function (err, user) {
    done(err, user);
  });
});

module.exports = {
  jwtStrategy,
  localStrategy,
};
