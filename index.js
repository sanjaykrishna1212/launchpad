const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const readline = require('node:readline');
const { exec } = require('child_process');
const { stdin: input, stdout: output } = require('node:process');
const rl = readline.createInterface({ input, output });

let distPath;
let serverport;

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    let ip = 'localhost'; 
    for (const name in interfaces) {
        if (name.includes('vEthernet') || name.includes('Hyper-V') || name.includes('WSL') || name.includes('Docker')) {continue; }
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ip = iface.address; 
                break;
            }
        }
    }
    return ip;
}

function checkInternetConnection(callback) {
    exec('ping -n 1 8.8.8.8', (error) => {
        if (error) {
            console.log("No internet connection detected. Defaulting to localhost.");
            callback('localhost');
        } else {
            callback(getLocalIP());
        }
    });
}

function getDistPath() {
    rl.question('Enter dist path: ', (answer) => {
        distPath = answer.trim();
        if (fs.existsSync(distPath) && fs.lstatSync(distPath).isDirectory()) {
            getPort();
        } else {
            console.error(`Invalid path: ${distPath}`);
            rl.close();
        }
    });
}

function getPort() {
    rl.question('Enter port number (default 2000): ', (answer) => {
        serverport = parseInt(answer, 10) || 2000;
        if (serverport < 1 || serverport > 65535) {
            console.error('Invalid port number. Please enter a number between 1 and 65535.');
            rl.close();
        } else {
            console.log(`Using port: ${serverport}`);
            checkInternetConnection(startServer);
        }
    });
}

function startServer(ipAddress) {
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
