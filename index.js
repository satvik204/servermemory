const express= require('express');
const app = express();
const {Server} = require('socket.io');
const {createServer} = require('http');
const { disconnect } = require('process');
const { waitForDebugger } = require('inspector');
const httpServer = createServer(app);



const io = new Server(httpServer,{
    cors:{
        origin: "*",
        methods: ["*"],
    }
})

let players = [];
let WaitingPlayers = [];
let Matches = [];
let TotalPlayers= 0;
function playerConnect(socketid) {
    players.push(socketid);
    TotalPlayers++;
    io.emit("updatePlayers",TotalPlayers)
    console.log(players);

}

function playerDisconnect(socketid) {
    
   players= players.filter(items => items !== socketid)
    TotalPlayers--;
    io.emit("updatePlayers",TotalPlayers);
    console.log(players);
    io.emit('playerDisconnect',socketid);
}
function handlePlayRequest(socketid) {
    players= players.filter(items => items !== socketid)
    WaitingPlayers.push(socketid);
    if (WaitingPlayers.length === 2) {
       let socketid1 = WaitingPlayers[0]
       let socketid2 = WaitingPlayers[1]
    WaitingPlayers = WaitingPlayers.filter(items => items !== socketid1)
    WaitingPlayers = WaitingPlayers.filter(items => items !== socketid2)
       Matches.push({socketid1: socketid1,socketid2: socketid2})
       io.emit("Match_Made",{socketid1,socketid2})
    }
}
io.on('connection',(socket) => {
socket.on("disconnect",(socketid) =>{
    playerDisconnect(socket.id);
    
});

socket.on("playRequest",(socketid) => {
    handlePlayRequest(socketid);
    
})
let yscore;

socket.on("finished",({socketid, score}) =>{
    yscore = score;
    io.emit("finished",{socketid, yscore})
})


socket.on("timeover",({socketid, ysscore}) =>{
    io.emit("timeover",{socketid, ysscore})
})
playerConnect(socket.id);
})
const port = process.env.PORT || 3000;

httpServer.listen(port,() => {
    console.log(`Server running on port ${port}`);
    
})