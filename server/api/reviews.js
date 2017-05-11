'use strict';

// const Sequelize = require('sequelize');
// const router = require('express').Router();
// const Review = require('../db').Review;
//
// router.post('/', (req, res, next) => {
//   Review.create({
//     userId: req.body.userId,
//     engagementId: req.body.engagementId,
//     score: req.body.score,
//     review: req.body.review
//   })
//     .then(data => {
//       console.log('Review POST successful');
//       res.status(200).send(data);
//     })
//     .catch(next);
// });
//
// module.exports = router;

'use strict';

const Sequelize = require('sequelize');
const router = require('express').Router();
const db = require('../db');

const Engagement = db.Engagement;
const User = db.User;
const Message = db.Message;

const findAuth0User = require('./util').findAuth0User;

router.post('/', (req, res, next) => {
  let current_user, current_engagement;
  findAuth0User(req)
    .then((user)=>{
      current_user = user;
      req.body['sender_id'] = user.id
      return db.Engagement.findByPrimary(req.body.engagement_id)
    })
    .then((engagement)=>{
      current_engagement = engagement;
      req.body['receiver_id'] = (current_engagement.sender_id === current_user.id) ? current_engagement.receiver_id : current_engagement.sender_id;
      return db.Review.create(req.body)
    })
    .then(data => {
      
      var reviewer = data.dataValues.sender_id;
      var subjOfReview = data.dataValues.receiver_id;
      var reviewerRating = data.dataValues.score;

      //perform some DB querey to 
      //- get subjOfReview's average score
      //- compute never average score 
        

      console.log('Review POST Successful');
      res.status(200).send(data);
    })
});

module.exports = router;



/*
Need:



the data inside api/reviews.js is  Instance {
  dataValues:
   { id: 5,
     engagement_id: 4,
     score: 5,
     review: 'Mariano gave me a great cut!',
     sender_id: 7,
     receiver_id: 1,
     updated_at: 2017-05-11T14:58:02.236Z,
     created_at: 2017-05-11T14:58:02.236Z },
  _previousDataValues:
   { engagement_id: 4,
     score: 5,
     review: 'Mariano gave me a great cut!',
     sender_id: 7,
     receiver_id: 1,
     id: 5,
     created_at: 2017-05-11T14:58:02.236Z,
     updated_at: 2017-05-11T14:58:02.236Z },
  _changed:
   { engagement_id: false,
     score: false,
     review: false,
     sender_id: false,
     receiver_id: false,
     id: false,
     created_at: false,
     updated_at: false },
  '$modelOptions':
   { timestamps: true,
     instanceMethods: {},
     classMethods: {},
     validate: {},
     freezeTableName: false,
     underscored: true,
     underscoredAll: false,
     paranoid: false,
     rejectOnEmpty: false,
     whereCollection: null,
     schema: null,
     schemaDelimiter: '',
     defaultScope: {},
     scopes: [],
     hooks: {},
     indexes: [],
     name: { plural: 'reviews', singular: 'review' },
     omitNul: false,
     sequelize:
      Sequelize {
        options: [Object],
        config: [Object],
        dialect: [Object],
        models: [Object],
        modelManager: [Object],
        connectionManager: [Object],
        importCache: {},
        test: [Object],
        queryInterface: [Object] },
     uniqueKeys: {},
     hasPrimaryKeys: true },
  '$options':
   { isNewRecord: true,
     '$schema': null,
     '$schemaDelimiter': '',
     attributes: undefined,
     include: undefined,
     raw: undefined,
     silent: undefined },
  hasPrimaryKeys: true,
  __eagerlyLoadedAssociations: [],
  isNewRecord: false }



*/