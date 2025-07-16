const { spawn } = require('child_process');
const path = require('path');
const pythonPath = path.join(__dirname, '../sherlock/venv/Scripts/python.exe');
require('dotenv').config();

const runSherlock = (username) => {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, '../sherlock/venv/Scripts/python.exe'); 
    const sherlockRoot = path.join(__dirname, '../sherlock'); 

    console.log('[🧪 RUNNING] Sherlock with username:', username);
    console.log('[🧪 PATH] Python:', pythonPath);
    console.log('[🧪 PATH] CWD:', sherlockRoot);

    const process = spawn(
      pythonPath,
      ['-m', 'sherlock_project', username, '--print-found'],
      {
        cwd: sherlockRoot,  
        timeout: 180000
      }
    );

    let output = '';
    let error = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        const matches = output
          .split('\n')
          .filter(line => line.includes('http'))
          .map(url => url.trim());

        const structured = matches.map(url => {
          const match = url.match(/\/\/(?:www\.)?([^\/]+)/i);
          return {
            platform: match ? match[1] : 'unknown',
            url
          };
        });

        console.log('[✅ Sherlock Success]', structured);
        resolve(structured);
      } else {
        console.error('[❌ Sherlock Failed]', error);
        reject(new Error(`Sherlock exited with code ${code}: ${error}`));
      }
    });

    process.on('error', (err) => {
      console.error('[❌ Sherlock Spawn Error]', err.message);
      reject(err);
    });
  });
};

module.exports = { runSherlock };
