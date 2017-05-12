// 'use strict';

const Sequelize = require('sequelize');
const router = require('express').Router();
const db = require('../db');
const _ = require('lodash');

const Engagement = db.Engagement;
const User = db.User;
const Message = db.Message;

const findAuth0User = require('./util').findAuth0User;

router.get('/', (req, res, next) => {
  let showComplete = req.query.completed === 'true';
  findAuth0User(req)
    .then((user)=>{
      return Engagement.findAll({
        where:{ $or: [{sender_id: user.id}, {receiver_id: user.id}], complete: showComplete },
        include: [
          { model: db.Message },
          db.ServiceTransaction,
          { model: db.User, as: 'sender', include: [db.Service, db.ServiceValue] },
          { model: db.User, as: 'receiver', include: [db.Service, db.ServiceValue] },
          { model: db.Review },
      ],
        order: [
          [ 'created_at', 'DESC' ],
          [ db.Message, 'created_at', 'DESC' ]
        ]
      })
    })
    .then(data => {
      // console.log('Engagement GET Request Successful');
      res.status(200).json(data);
    })
});

router.get('/:engagement_id', (req, res, next) => {
  Engagement.find({
    where: {id: req.params.engagement_id},
    include: [ Message ]
  })
  .then(data => {
    // console.log('Engagement GET Request Successful');
    res.status(200).json(data);
  })
});

router.post('/', (req, res, next) => {
  let engagement_id;
  findAuth0User(req)
  .then((user)=>{
    req.body['sender_id'] = user.id;
    return Engagement.create(req.body)
  })
  .then(data => {
    console.log('Engagement POST Request Sucessful')
    engagement_id = data.id;
    return db.ServiceValue
      .findAll({ where: {
        $or: [{user_id: req.body.sender_id}, {user_id: req.body.receiver_id}]
      } })
  })
  .then(data => {
    let senderValue;
    let receiverValue;
    _.each(data, ({ dataValues }) => {
      if (dataValues.user_id === req.body.sender_id) {
        senderValue = dataValues;
      } else if (dataValues.user_id === req.body.receiver_id) {
        receiverValue = dataValues;
      }
    });
    return db.ServiceTransaction
      .create({
        engagement_id,
        sender_svc_currval: senderValue.value,
        receiver_svc_currval: receiverValue.value,
        sender_service_id: senderValue.service_id,
        receiver_service_id: receiverValue.service_id
      })
  })
  .then(() => res.status(201).send('Created engagement and service transaction.'))
})

router.put('/:engagement_id', (req, res, next) => {
  Engagement.findById(req.params.engagement_id)
  .then(data => {
    data.updateAttributes({
      complete: 1
    })
    res.status(202).send(data);
  })
  .catch(next)
})

module.exports = router;
