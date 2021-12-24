const WebSocket = require('ws')
var express = require('express');
const cors = require('cors');
const app = express();
const { json, raw } = require('express');
const url = require('url');
const { stringify } = require('querystring');
app.use(cors())
app.use(express.json());


var takenGameIDs = [];
var gameInfosJSON = [];
var passwords = [];
var passwordLength = 20;
var languagePacks = [];
var javascriptTexts = [];

app.get('/ZBUMCommunicate', function (req, res) {
  res.send('hello ass\nnono\nyes\n'); //replace with your data here
});

app.listen(3000);

function makeRandomString(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
