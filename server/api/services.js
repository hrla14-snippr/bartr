'use strict';

const Sequelize = require('sequelize');
const db = require('../db');
const router = require('express').Router();

const getBoundingBox = require('./util').getBoundingBox;

router.get('/', (req, res) => {
  db.Service.findAll()
    .then((result)=>{
      res.json(result)
    })
});

router.get('/find', (req, res) => {
  let provided_long = Number(req.query.long);
  let provided_lat = Number(req.query.lat);
  let requested_services = req.query.services;
  let provided_distance = req.query.distance;
  let boundingBox = getBoundingBox([provided_lat, provided_long], provided_distance)
  console.log('location', provided_lat, provided_long)
  console.log('box', boundingBox)
  let buildWhere = {};
  if (requested_services){
    buildWhere = {id: requested_services}
  }
    db.User.findAll({
      where: {
        geo_long: {$gte: boundingBox[0], $lte: boundingBox[2]},
        geo_lat: {$gte: boundingBox[1], $lte: boundingBox[3]}
      },
      include: [
        {
        model: db.Service,
        where: buildWhere
        },
        // {
        //   model: db.Review,
        //   as: 'received_reviews',
        //   attributes: ['score']
        // }
      ],
      // attributes: Object.keys(db.User.attributes).concat([[Sequelize.fn('AVG', Sequelize.col('received_reviews.score')), 'avgscore']]),
      // group:['user.id']
    })
      .then((results)=>{
        res.json(results)
      })
});

router.get('/value', (req, res) => {
  // /value?service=someService&authId=auth0_id
  let userId;
  db.User
    .findOne({ where: { auth0_id: req.query.authId } })
    .then((user) => {
      userId = user.id;
      return db.Service.findOne({ where: { type: req.query.service } });
    })
    .then(service => 
      db.ServiceValue
        .findOne({ where: { service_id: service.id, user_id: userId }}))
        .then(data => res.json(data))
    .catch(e => console.log('Network Error: GET /api/services/value', e));
});

router.post('/value', (req, res) => {
  // req.body = { authId, serviceType, value }
  let userId;
  db.User.findOne({ where: { auth0_id: req.body.authId } })
    .then(({ id }) => {
      userId = id;
      return db.Service.findOne({ where: { type: req.body.serviceType } });
    })
    .then(service => 
      db.ServiceValue
        .upsert({ user_id: userId, service_id: service.id, value: req.body.value }))
    .then(() => res.send('Successfully inserted or updated user\'s service value'))
    .catch(e => console.log('Network Error: POST /api/services/value', e));
})

router.get('/adjustedValue', (req, res) => {
  // /adjustedValue?service=someService
})

router.put('/transaction', (req, res) => {
  const options = {
    sender_svc_units: req.body.sender_svc_units,
    receiver_svc_units: req.body.receiver_svc_units
  };
  if (req.body.accepted) {
    options.accepted = req.body.accepted;
  }
  db.ServiceTransaction
    .update(options, { where: { engagement_id: req.body.engagement_id } })
    .then(data => res.json(data))
})

router.post('/', (req, res, next) => {
  db.Service.findOne({
    where:{
      type: req.body.type
    }
  })
    .then(data => {
      if(!data) {
        db.Service.create({
          type: req.body.type
        })
          .then(data => {
            res.status(201).send(data);
            console.log('POST REQ for Services successful: ', data);
          })
          .catch(next);
      } else {
        res.send('Service already exists. No action taken.')
      }
    })
    .catch(next);
})

module.exports = router;
