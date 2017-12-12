var express = require('express'),
  bodyParser = require('body-parser'),
  firebase = require('firebase'),
  admin = require('firebase-admin'),
  ejs = require('ejs');

var port = 8080;
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

var serviceAccount = require('../admin/gpsarduino-8b79d-firebase-adminsdk-yq39e-38a553e3ea.json');

// Initialize the default app
var defaultApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://gpsarduino-8b79d.firebaseio.com/'
});

console.log(defaultApp.name); // "[DEFAULT]"

// Retrieve services via the defaultApp variable...
var auth = defaultApp.auth();
var database = defaultApp.database();

var ref = database.ref();

app.use(express.static('stylesheets'));
app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log('Listening on port: ' + port);
});

function listAllUsers(nextPageToken) {
  // List batch of users, 1000 at a time.
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        console.log('user', userRecord.toJSON());
      });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
}
var message = "";
//get home page
app.get('/', (req, res) => {
  //listAllUsers();
  res.redirect('/user');
});
//get home page
app.post('/user', (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;
  admin.auth().createUser({
      email: email,
      password: password,
      displayName: name
    })
    .then(function (userRecord) {
      // See the UserRecord reference doc for the contents of userRecord.
      console.log("Successfully created new user:", userRecord.uid);
      message = "Successfully created new user:" + userRecord.email;
      res.redirect('/user');
    })
    .catch(function (error) {
      console.log("Error creating new user:", error);
      message = error;
      res.redirect('/user');
    });
});
//get home page
app.get('/user', (req, res) => {
  //listAllUsers();
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      res.render('user.ejs', {
        messages: message,
        data: listUsersResult.users
      });

      // listUsersResult.users.forEach(function (userRecord) {
      //   //console.log('user', userRecord.toJSON());
        
      // });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });

});
app.delete('/user', (req, res) => {
  //listAllUsers();
  var uid = req.body.uid.replace(/\s+/g, '');
  console.log(uid);
  admin.auth().deleteUser(uid)
    .then(function () {
      console.log("Successfully deleted user");
    })
    .catch(function (error) {
      console.log("Error deleting user:", error);
    });


});
//get home page
app.get('/devices', (req, res) => {
  admin
    .auth()
    .listUsers()
    .then(function (listUsersResult) {
      res.render('devices.ejs', {
        messages: message,
        userlist: listUsersResult.users
      });

      // listUsersResult.users.forEach(function (userRecord) {
      //   //console.log('user', userRecord.toJSON());

      // });
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
});
app.post('/devices', (req, res) => {
    var device = req.body.name;
    var uid = req.body.user;

    var usersRef = ref.child("Devices/" + device);
    usersRef.set({
        uid: uid
    });
    res.redirect("/devices");

});
