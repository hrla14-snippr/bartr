const Sequelize = require('sequelize');
const router = require('express').Router();
const db = require('../db');

const Schedule = db.Schedule;





router.get('/:id', (req,res) => {
  console.log('this is the persons id ', req.params.id);
    Schedule.findAll({
      where: {
        user_id: req.params.id,
      }
    })
      .then((data) => {
        console.log('correct response ', data);
        res.status(202).send(data)
      })
      .catch((err) => {
        console.log('there was an error ', err);
        res.status(403).send('something went wrong fetching appointments ', err);
      })
  });

  router.post('/', (req, res) => {
    Schedule.create({start: req.body.start, end: req.body.end, user_id: req.body.user_id})
      .then((data) => {
        console.log('this is the data from schedules ', data);
        res.status(202).send(data)
      })
      .catch((err) => {
        console.log(err, 'there was an error');
        res.status(403).send('there was an error posting your appointment ', err);
      });
  });



module.exports = router;


