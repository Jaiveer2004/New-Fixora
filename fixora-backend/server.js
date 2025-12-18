require('dotenv').config();

const express = require('express');
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const cleanupUnverifiedAccounts = require('./src/jobs/cleanup.job');
const socketService = require('./src/services/socket.service');

const PORT = process.env.PORT || 8000;

// Create HTTP Server:
const server = http.createServer(app);

// Initizalize Socker.IO
socketService.initialize(server);

// Connect to DB
connectDB();

cleanupUnverifiedAccounts.start();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Websocket server is ready.`);
});

module.exports = server;