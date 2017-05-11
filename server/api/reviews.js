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

const Review = db.Review;

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

      //when a review gets posted, you really care about
      //the person who we're reviewing & the score they were 
      //given for their services rendered
      var subjOfReview = data.dataValues.receiver_id;
      var reviewerRating = data.dataValues.score;

      Review.findAll({
        where: {
          receiver_id: subjOfReview
        }
      }).then(data=> {
        //data is an array of Instances
        console.log(`got the reviews for ${subjOfReview}`, data);
        console.log("");
        console.log("");

        var counter = 0;
        var accumulatedScore = 0;

        data.forEach(instance => {
          console.log("the score is ", instance.dataValues.score);

          accumulatedScore += instance.dataValues.score;
          counter++;

          
        });

        var averageReviewScore = Math.round(accumulatedScore / counter);

        console.log(`The averageReviewScore is ${averageReviewScore}`);

        User.find({
          where: {id: subjOfReview}
        }).then(data=>{
          console.log("the user who's rating we'll update is ", data);
          //service_provider_average_rating

        });        

      })

      console.log('Review POST Successful');
      res.status(200).send(data);
    })
});

module.exports = router;