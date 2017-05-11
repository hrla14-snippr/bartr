const Sequelize = require('sequelize');
const router = require('express').Router();
const db = require('../db');

const Schedule = db.Schedule;




router.get('/', (req,res) => {
  db.Schedule.findAll({where: {
    id: req.body.engagementId,
  }})
    .then((response) => {
      res.send(response)
    })
    .catch((err) => {
      res.send('something went wrong fetching appointments ', err);
    })
});

router.post('/', (req,res) => {
  db.Schedule.create({start: req.body.start, end: req.body.end, user_id: req.body.user_id})
    .then((sched) => {
      res.send(sched.get({
        plain: true
      }));
    })
    .catch((err) => {
      res.send('there was an error posting your appointment ', err);
    });
});


module.exports = router;


