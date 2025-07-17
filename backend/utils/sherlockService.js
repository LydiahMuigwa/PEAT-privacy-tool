const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

const runSherlock = (usernames) => {
  return new Promise((resolve, reject) => {
    // Handle both array and single username input
    const usernameList = Array.isArray(usernames) ? usernames : [usernames];
    const username = usernameList[0]; // Process first username for now
    
    console.log('[🧪 RUNNING] Sherlock with username:', username);
    console.log('[🧪 FIXED] Using system sherlock command - NO WINDOWS PATH');
    
    // Use the system-installed sherlock command
    const process = spawn('sherlock', [username, '--print-found', '--timeout', '30'], {
      cwd: '/app/backend',
      timeout: 180000
    });
    
    let output = '';
    let error = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    process.on('close', (code) => {
      console.log('[🧪 SHERLOCK OUTPUT]', output);
      console.log('[🧪 SHERLOCK ERROR]', error);
      
      if (code === 0 || output.includes('[+]')) {
        // Parse the sherlock output for found platforms
        const lines = output.split('\n');
        const matches = [];
        
        for (const line of lines) {
          if (line.includes('[+]') && line.includes('http')) {
            console.log('[🧪 PARSING LINE]', line);
            
            // Split by colon to get platform and URL
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
              const platformPart = line.substring(0, colonIndex);
              const urlPart = line.substring(colonIndex + 1);
              
              // Extract platform name (remove [+] prefix)
              const platform = platformPart.replace(/\[\+\]\s*/, '').trim();
              
              // Extract URL
              const urlMatch = urlPart.match(/(https?:\/\/[^\s]+)/);
              
              if (platform && urlMatch) {
                matches.push({
                  platform: platform,
                  url: urlMatch[1]
                });
              }
            }
          }
        }
        
        console.log('[✅ Sherlock Success]', matches);
        resolve(matches);
      } else {
        console.error('[❌ Sherlock Failed]', error);
        resolve([]); // Return empty array instead of failing
      }
    });
    
    process.on('error', (err) => {
      console.error('[❌ Sherlock Spawn Error]', err.message);
      resolve([]); // Return empty array instead of failing
    });
  });
};

module.exports = { runSherlock };