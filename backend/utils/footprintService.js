const path = require("path");
const { exec, execFile } = require("child_process");
require('dotenv').config();

function runScraper(scriptName, ...args) {
  const scriptPath = path.join(__dirname, "../scripts", scriptName);
  const cmd = `python "${scriptPath}" ${args.map(a => `"${a}"`).join(' ')}`;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`[ERROR] ${scriptName}:`, stderr);
        return reject(`Failed to run ${scriptName}`);
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        console.error(`[ERROR] JSON parse error:`, stdout);
        reject(`Failed to parse output from ${scriptName}`);
      }
    });
  });
}

function runNodeScript(scriptName, ...args) {
  const scriptPath = path.join(__dirname, "../scripts", scriptName);
  return new Promise((resolve, reject) => {
    execFile("node", [scriptPath, ...args], (error, stdout, stderr) => {
      if (error) {
        console.error(`[ERROR] ${scriptName}:`, stderr);
        return reject(`Failed to run ${scriptName}`);
      }
      try {
        const parsed = JSON.parse(stdout);
        resolve(parsed);
      } catch (e) {
        console.error(`[ERROR] JSON parse error:`, stdout);
        reject(`Failed to parse output from ${scriptName}`);
      }
    });
  });
}

async function getHoleheData(email) {
  return await runScraper("holehe_runner.py", email);
}

async function getFootprintLinks(identifier) {
  const serpapiKey = process.env.SERPAPI_KEY;
  return await runScraper("footprint_scraper.py", identifier, serpapiKey);
}

// Advanced: Multi-engine orchestration
async function getFootprintLinksMultiEngine(identifier) {
  const serpapiKey = process.env.SERPAPI_KEY;
  return await runScraper("footprint_scraper.py", identifier, serpapiKey);
}

// Google search via Puppeteer (JS-based, headless browser)
async function googleEmailSearch(email) {
  return await runNodeScript("email_google_search.js", email);
}

module.exports = {
  getHoleheData,
  getFootprintLinks,
  getFootprintLinksMultiEngine,
  googleEmailSearch
};