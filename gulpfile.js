const gulp = require('gulp');
var gutil = require("gulp-util");
const nodemon = require('gulp-nodemon');
const Promise = require('bluebird');
const sequelize_fixtures = require('sequelize-fixtures');
const env = require('gulp-env'); 
const _ = require('lodash');
const webpack = require ('webpack')
const webpackDevConfig = require('./webpack.config.dev');
const WebpackDevServer = require("webpack-dev-server");

env({
  file: './.env',
  type: 'ini'
});

//put this after .env file load as db needs some of those env variables
const db = require('./server/db');
const models = {
  'User': db.User,
  'Service': db.Service,
  'Engagement': db.Engagement,
  'ServiceValue': db.ServiceValue,
  'AverageASV': db.AverageASV,
  'ServiceTransaction': db.ServiceTransaction,
  'Review': db.Review,
  'Message': db.Message,
  'Schedule': db.Schedule,
};

gulp.task('seed:wipe', function(cb){
  db.Service.sync({force: true})
    .then(()=>{
      return Promise.all([db.User.sync({force: true})])
    })
    .then(()=>{
      return Promise.all([db.Engagement.sync({force: true})])
    })
    .then(()=>{
      return Promise.all([
        db.Message.sync({force: true}),
        db.Review.sync({force: true}),
        db.ServiceValue.sync({force: true}),
        db.AverageASV.sync({force: true}),
        db.ServiceTransaction.sync({force: true})
      ])
    })
    .then(()=>{
      return Promise.all([db.Schedule.sync({force: true})])
    })
    .then(()=>{
      if(process.env.DATABASE_URL.includes('postgres')){
        return db.sql.query('alter sequence engagements_id_seq restart with 100;') // reset engagement id primary key to 100 so it doesnt conflict with our manually seeded IDs
      } else {
        return true
      }
    })
    .then(()=>{cb()})
    .catch((err)=>{cb(err)})
});

gulp.task('seed:seed', ['seed:wipe'], function(cb){
  sequelize_fixtures.loadFile('./server/db/seedData/seedData.json', models)
    .then(() => {
      return sequelize_fixtures.loadFile('./server/db/seedData/engagement*.json', models)
    })
    .then(() => {
      cb()
    })
    .catch((err)=>{cb(err)})
});

gulp.task('seed', ['seed:wipe', 'seed:seed']);

gulp.task('nodemon', function () {
  const stream = nodemon({
    script: 'server/index.js',
    watch: ["server/**"],
    ignore: ["client/**"]
  });
});

gulp.task('watch', function() {
  gulp.watch(['server/db/index.js', 'server/db/seedData/*.json'], ['seed']);
});

gulp.task("webpackhot", function(callback) {
  // Start a webpack-dev-server
  var compiler = webpack(webpackDevConfig);

  new WebpackDevServer(compiler, {
    contentBase: "./client/static",
    publicPath: "/",
    hot: true,
    inline: true,
    stats: true
  }).listen(8080, "localhost", function(err) {
    if(err) throw new gutil.PluginError("webpack-dev-server", err);
    // Server listening
    // gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");

    // keep the server alive or continue?
    //  callback();
  });
});

gulp.task('calcworker', function(callback) {
  const nextCalc = () => {
    let store = {};
    let optionStore = [];
    db.ServiceTransaction
      .findAll({ where: { accepted: true } })
      .then((data) => {
        _.each(data, ({ dataValues }) => {
          if (!store[dataValues.sender_service_id]) {
            store[dataValues.sender_service_id] = [];
          }
          store[dataValues.sender_service_id].push(dataValues.sender_asv);
          if (!store[dataValues.receiver_service_id]) {
            store[dataValues.receiver_service_id] = [];
          }
          store[dataValues.receiver_service_id].push(dataValues.receiver_asv);
        });
        // calc avg value of each service found
        _.each(store, (asv, key) => {
          let avg = _.reduce(asv, (a, b) => {
            return a + b;
          }) / asv.length;
          optionStore.push({
            service_id: key,
            value: parseFloat(avg.toFixed(3))
          })
        });
        // pass store into bulkcreate adjustedservicetrans
        return db.AverageASV.bulkCreate(optionStore);
      })
      .then(data => console.log('Inserted new Average ASVs!'));
  }
  nextCalc();
  // run per interval defined in .env
  setInterval(nextCalc, process.env.CALC_INTERVAL)
});

gulp.task('default', ['nodemon', 'watch', 'webpackhot', 'calcworker']);
