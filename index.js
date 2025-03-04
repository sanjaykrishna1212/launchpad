const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });
const ipAddress = getLocalIP();
let distPath;
let serverport;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function getDistPath() {
    rl.question('Enter dist path: ', (answer) => {
        distPath = answer;
        if (fs.existsSync(distPath) && fs.lstatSync(distPath).isDirectory()) { getPort();} 
        else {console.error(`Invalid path: ${distPath}`);rl.close();}
    });
}

function getPort() {
    rl.question('Enter port number (default 9000): ', (answer) => {
        serverport = parseInt(answer, 10) || 2000; 
        if (serverport < 1 || serverport > 65535) {
            console.error('Invalid port number. Please enter a number between 1 and 65535.');
            rl.close();
        } else {
            console.log(`Using port: ${serverport}`);
            startServer();
        }
    });
}

function startServer() {
    const app = express();

    app.use("/", express.static(distPath));
    app.get('/', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });

    app.listen(serverport, () => {
        console.log(`Server is running at: http://${ipAddress}:${serverport}`);
    });
}


getDistPath();
