const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const mysql = require('mysql');


function initialize(connection, passport) {
  // console.log(connection)
  const authenticateUser = async (username, password, done) => {
    connection.query('SELECT * FROM users WHERE username = ?', [username], async function(error, results, fields) {
      // console.log(results)
      if (results !== undefined) {
        try {
          if (await bcrypt.compare(password, results[0].password)) {
            const user = {
              id: results[0].id,
              username: results[0].username,
              password: results[0].password
            };
            return done(null, user)
          } else {
            return done(null, false, {
              message: "Wrong password"
            })
          }
        } catch (e) {
          return done(e);
        }
      } else {
        return done(null, false, {
          message: "User not found"
        });
      }
    })
  }
  passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: "password"
  }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => connection.query("select * from users where id = ?", [id], function(err, results) {
    done(err, results[0]);
  }));

}

module.exports = initialize;
