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



wss.on('connection', function (ws, req) {
  let current_url = new URL('https://localhost:8080'+req.url);
  let search_params = current_url.searchParams;
  let gameIDWanted = search_params.get('GameID');
  let clientIDWanted = search_params.get('ClientID');
  let pass = search_params.get('pass');
  let indexWeWant = takenGameIDs.indexOf(gameIDWanted.toUpperCase());
  let finalClientID = gameIDWanted + clientIDWanted;
  console.log(finalClientID);
  if (indexWeWant == -1) {
    ws.close();
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (pass != passwords[indexWeWant]) {
      ws.close();
      return
    }
  }
  wss.clients.forEach(function each(client) {
    if(finalClientID == client.id){
      ws.close();
      return;
    }
  });
  ws.id = finalClientID;

  ws.on('message', function (message) {
    let IDForGame = stringify(ws.id).substring(0,3);
    let IDForClient = stringify(ws.id).substring(3);
    let indexWeWant = takenGameIDs.indexOf(IDForGame.toUpperCase());
    if (indexWeWant == -1) {
      ws.close();
      return;
    }
    if(IDForClient == "Z"){
      gameInfosJSON[indexWeWant] = JSON.parse(message);
    }else{
      gameInfosJSON[indexWeWant].Players[parseInt(req.params.whichPlayer)].playerInfo = JSON.parse(message);
    }

    wss.clients.forEach(function each(client) {
      if(client == ws){
        client.send(JSON.stringify(gameInfosJSON[indexWeWant]));
      }
    });

  });
  ws.on('close', function () {
    console.log('closed');

  });

});

app.get('/ZBUMCommunicate', function (req, res) {
  res.send('hello ass\nnono\nyes\n'); //replace with your data here
});

app.post('/ZBUMCommunicate/testPost', function requestHandler(req, res) {

  console.log(req.body)

  res.send("done");
});

app.get('/ZBUMCommunicate/gimmeAllTakenIDs', function (req, res) {
  // res.send("dd");
  let tmp = " \n";
  for (let index = 0; index < takenGameIDs.length; index++) {
    tmp = tmp + takenGameIDs[index] + "\n";
  }

  res.send(tmp); //replace with your data here
});

app.get('/ZBUMCommunicate/makeGame/:gameID/:lang/:minPlayers/:maxPlayers/:gameModeName/:gameModeType', function (req, res) {
  // res.send("dd");
  //console.log("gg0");
  if (takenGameIDs.indexOf(req.params.gameID.toUpperCase()) != -1) {
    res.send("taken");
    return;
  }

  // console.log("gg1");
  takenGameIDs.push(req.params.gameID.toUpperCase());
  passwords.push(makeRandomString(passwordLength));
  javascriptTexts.push(" ");
  languagePacks.push(" ");
  let playersJSONtmp = {
    "doesExist": false,
    "hisName": "AAA",
    "areYouAlive": false,
    "Active": false,
    "ipAddress": "aaa",
    "playerInfo": {},
  };
  let JSONtmp = {
    "gameID": req.params.gameID.toUpperCase(),
    "language": req.params.lang,
    "currentNumberOfPlayers": 0,
    "minNumberOfPlayers": parseInt(req.params.minPlayers),
    "maxNumberOfPlayers": parseInt(req.params.maxPlayers),
    "skipTextNow": "false",
    "gameState": "lobby",
    "gameModeName": req.params.gameModeName,
    "gameModeType": req.params.gameModeType,
    "currentTurn": 0,
    "textForPhoneIndependance": "",
    "playerPoints": Array(parseInt(req.params.maxPlayers)).fill(0),
    "Players": Array(parseInt(req.params.maxPlayers)).fill('')
  };

  for (let index = 0; index < parseInt(req.params.maxPlayers); index++) {
    JSONtmp.Players[index] = JSON.parse(JSON.stringify(playersJSONtmp));

  }


  gameInfosJSON.push(JSONtmp);

  res.send("doneUUU" + passwords[passwords.length - 1]); //replace with your data here
});

app.post('/ZBUMCommunicate/changeJavascriptFile/:gameID/:pass', function requestHandler(req, res) {
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {

    res.send("not found");
    return;
  }
  if (req.params.pass != passwords[indexWeWant]) {

    res.send("not found");
    return;
  }
  console.log(req.body)
  javascriptTexts[indexWeWant] = req.body.code;

  res.send("done");
});
app.get('/ZBUMCommunicate/deleteGame/:gameID/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }

  if (req.params.pass != passwords[indexWeWant]) {
    res.send("not found");
    return;
  }


  takenGameIDs.splice(indexWeWant, 1);
  gameInfosJSON.splice(indexWeWant, 1);
  javascriptTexts.splice(indexWeWant, 1);
  languagePacks.splice(indexWeWant, 1);
  passwords.splice(indexWeWant, 1);
  res.send("done"); //replace with your data here
});
app.get('/ZBUMCommunicate/incrementCurrentNumberOfPlayers/:gameID/:num/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (req.params.pass != passwords[indexWeWant]) {
      res.send("not found");
      return;
    }
  }

  let JSONtmp = gameInfosJSON[indexWeWant];
  JSONtmp.currentNumberOfPlayers = parseInt(JSONtmp.currentNumberOfPlayers) + parseInt(req.params.num);
  gameInfosJSON[indexWeWant] = JSONtmp;
  res.send("done"); //replace with your data here
});

app.get('/ZBUMCommunicate/changePlayerName/:gameID/:whichPlayer/:whatName/:setActive/:increment/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (req.params.pass != passwords[indexWeWant]) {
      res.send("not found");
      return;
    }
  }

  let JSONtmp = gameInfosJSON[indexWeWant];
  if (req.params.whichPlayer == "all") {
    for (let index = 0; index < JSONtmp.maxNumberOfPlayers; index++) {
      if (req.params.whatName != "ZZZ")
        JSONtmp.Players[index].hisName = req.params.whatName;
      if (req.params.setActive != "ZZZ") {
        if (req.params.setActive == "true") JSONtmp.Players[index].Active = true; else JSONtmp.Players[index].Active = false;
      }

    }
  } else {
    if (req.params.whatName != "ZZZ")
      JSONtmp.Players[parseInt(req.params.whichPlayer)].hisName = req.params.whatName;

    if (req.params.setActive != "ZZZ") {
      if (req.params.setActive == "true") JSONtmp.Players[parseInt(req.params.whichPlayer)].Active = true; else JSONtmp.Players[parseInt(req.params.whichPlayer)].Active = false;
    }
  }

  if (req.params.increment == "true") JSONtmp.currentNumberOfPlayers = (parseInt(JSONtmp.currentNumberOfPlayers) + 1);

  gameInfosJSON[indexWeWant] = JSONtmp;
  let tempTxt = "doneUUU";
  if (gameInfosJSON[indexWeWant].gameState == "lobby") tempTxt += passwords[indexWeWant];
  wss.clients.forEach(function each(client) {

      client.send(JSON.stringify(gameInfosJSON[indexWeWant]));

  });
  res.send(tempTxt); //replace with your data here
});

app.post('/ZBUMCommunicate/changeLanguagePack/:gameID/:pass', function requestHandler(req, res) {
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (req.params.pass != passwords[indexWeWant]) {
    res.send("not found");
    return;
  }
  console.log(req.body)

  languagePacks[indexWeWant] = req.body;

  res.send("done");
});
app.post('/ZBUMCommunicate/updateJSONFile/:gameID/:pass', function requestHandler(req, res) {
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (req.params.pass != passwords[indexWeWant]) {
    res.send("not found");
    return;
  }
  console.log(req.body)

  gameInfosJSON[indexWeWant] = req.body;

  res.send("done");
});
app.post('/ZBUMCommunicate/updatePlayerJSONFile/:gameID/:whichPlayer/:pass', function requestHandler(req, res) {
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {

    res.send("not found");
    return;
  }
  if (req.params.pass != passwords[indexWeWant]) {

    res.send("not found");
    return;
  }
  console.log(req.body)
  gameInfosJSON[indexWeWant].Players[parseInt(req.params.whichPlayer)].playerInfo = req.body;
  res.send("done");
});
app.get('/ZBUMCommunicate/gimmeJSON/:gameID/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (req.params.pass != passwords[indexWeWant]) {
      res.send("not found");
      return;
    }
  }


  let rawdata = gameInfosJSON[indexWeWant];
  res.send(rawdata); //replace with your data here
});

app.get('/ZBUMCommunicate/gimmeJavascriptText/:gameID/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (req.params.pass != passwords[indexWeWant]) {
      res.send("not found");
      return;
    }
  }
  res.send(javascriptTexts[indexWeWant]); //replace with your data here
});

app.get('/ZBUMCommunicate/gimmeLanguagePack/:gameID/:pass', function (req, res) {
  // res.send("dd");
  let indexWeWant = takenGameIDs.indexOf(req.params.gameID.toUpperCase());
  if (indexWeWant == -1) {
    res.send("not found");
    return;
  }
  if (gameInfosJSON[indexWeWant].gameState != "lobby") {
    if (req.params.pass != passwords[indexWeWant]) {
      res.send("not found");
      return;
    }
  }
  res.send(languagePacks[indexWeWant]); //replace with your data here
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