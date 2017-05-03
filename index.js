const http = require('http');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.set('port', PORT);

const server = http.createServer(app);

server.listen(app.get('port'), () => {
  console.log(`Server listening on port ${app.get('port')}...`)
});