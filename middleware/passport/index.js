const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
const db = require("../../models");
const User = db.user;
const bcrypt = require("bcryptjs");

passport.use(new LocalStrategy({ session: false},
  async function (username, password, done) {
    const rows = await User.findOne({ where: { username: username} });
    if (!rows) {
      console.log('Database connection error');
      return done(null, false, {message: 'Database connection error'});
    }
    else {
      console.log('Password check');
      const checkPass = await bcrypt.compareSync(password, rows.password);
      if (!checkPass) {
        return done(null, false,  {message: 'Password incorrect'}); 
      }
    }
    console.log('Succeed');
    return done(null, rows, {message: 'Login succeed'});
  }
));

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  console.log(jwt_payload);
  let user = getUser({ username: jwt_payload.username });
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
  return done(null, { username: jwt_payload.username });
}));

module.exports = passport;