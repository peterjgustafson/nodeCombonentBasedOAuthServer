var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const mySqlConnection = require('./databaseHelpers/mySqlWrapper')
const accessTokenDBHelper = require('./databaseHelpers/accessTokensDBHelper')(mySqlConnection)
const userDBHelper = require('./databaseHelpers/userDBHelper')(mySqlConnection)
const oAuthModel = require('./authorization/accessTokenModel')(userDBHelper, accessTokenDBHelper)
const oAuth2Server = require('./node-oauth2-server')

var app = express();

//bind the express instance to the oAuth2Server
app.oauth = oAuth2Server({
  model: oAuthModel,
  grants: ['password'],
  debug: false,
  allowBearerTokensInQueryString: false,
  useErrorHandler: false
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const restrictedAreaRoutesMethods = require('./restrictedArea/restrictedAreaRoutesMethods.js');
const restrictedAreaRoutes = require('./restrictedArea/restrictedAreaRoutes.js')(express.Router(), app, restrictedAreaRoutesMethods);
const authRoutesMethods = require('./authorization/authRoutesMethods')(userDBHelper);
const authRoutes = require('./authorization/authRoutes')(express.Router(), app, authRoutesMethods);

app.all('/*', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
next();
});

//const stt = require('./routes/stt');
//const stt_test = require('./routes/stt_test');

//set the oAuth errorHandler
app.use(app.oauth.errorHandler());

//set the authRoutes for registration and & login requests
app.use('/auth', authRoutes);

//set the restrictedAreaRoutes used to demo the accesiblity or routes that ar OAuth2 protected
app.use('/secure', restrictedAreaRoutes);


// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

//error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.code || err.status);
  res.render('error');
});

module.exports = app;
