const WebSocket = require('ws')
const wss = new WebSocket.WebSocketServer({ port: 8080, path: "/ZBUMCommunicate" });
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
