const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const KnexSessionStore= require('connect-session-knex')(session);

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
// const configuredKnex = require('../database/dbConfig');


const server = express();

const sessionConfig = {
  name: 'cookies',
  secret: 'i dont know what this is',
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false,
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore ({
    knex: db,
    tablename: 'sessions',
    sidfieldname: 'sid',
    createtable: true,
    clearInterval: 1000 * 60 * 30,
  }),
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.get('/', (req, res) => {
    res.send("Welcome to the Jungle!");dv
  });


  server.post('/api/register', (req, res) => {
    let user = req.body;
  
    // hash the password
    const hash = bcrypt.hashSync(user.password, 8);
    user.password = hash;
  
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  server.post('/api/login', (req, res) => {
    let { username, password } = req.body;
  
    Users.findBy({ username })
      .first()
      .then(user => {
        // check tha password guess against the database
        if (user && bcrypt.compareSync(password, user.password)) {
          req.session.user = user; //brought this in on day 2
          
          res.status(200).json({ message: `Welcome ${user.username}!` });
        } else {
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(error => {
        res.status(500).json(error);
      });
  });

  server.get('/api/users', restricted, (req, res) => {
    Users.find()
      .then(users => {
        res.json(users);
      })
      .catch(err => res.send(err));
  });
  

//   function only(username) {
//     return function(req, res, next) {
//       if (req.headers.username === username) {
//         next();
//       } else {
//         res.status(403).json({ message: `you are not ${username}` });
//       }
//     };
//   }
  
  function restricted(req, res, next) {
    const { username, password } = req.headers;
      if (req.session && req.session.user) {
        next();
      } else {
        res.status(401).json({ message: 'Go Fish'})
      }
      
    };
  
    // === below is how we did on day 1. above is using session of day 2 ===

    // if (username && password) {
    //   Users.findBy({ username })
    //     .first()
    //     .then(user => {
    //       // check tha password guess against the database
    //       if (user && bcrypt.compareSync(password, user.password)) {
    //         next();
    //       } else {
    //         res.status(401).json({ message: 'You shall not pass!!' });
    //       }
    //     })
    //     .catch(error => {
    //       res.status(500).json(error);
    //     });
    // } else {
    //   res.status(401).json({ message: 'Please provide credentials' });
    // }

    server.get('/api/logout', (req, res) => {
      if (req.session) {
        req.session.destroy(err => {
          if (err) {
            res.status(500).json({ message: 'you can checkout but never leave'})
          } else {
            res.status(200).json({ message: 'Successfully Logged Out'})
          }
        })
      } else {
        res.status(200).json({ message: 'Successfully Logged Out'})
      }
      })

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Welcome to the Jungle ${port} **\n`));