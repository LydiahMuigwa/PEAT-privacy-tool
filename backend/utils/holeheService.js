const { execFile } = require("child_process");
const path = require("path");

/**
 * Simple, working Holehe service that calls the fixed holehe_runner.py
 */
const runHolehe = (email) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "scripts", "holehe_runner.py");
    
    console.log(`🔍 [HOLEHE] Starting scan for: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

    execFile(
      "python", 
      [scriptPath, email], 
      {
        timeout: 150000, // 2.5 minutes timeout
        encoding: 'utf8',
        maxBuffer: 2 * 1024 * 1024 // 2MB buffer for large outputs
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ [HOLEHE] Execution error:", {
            code: error.code,
            killed: error.killed,
            signal: error.signal
          });

          // Handle timeout
          if (error.killed) {
            console.error("❌ [HOLEHE] Process was killed (timeout)");
            return reject(new Error("Holehe scan timed out"));
          }

          // Handle exit code 1 (script ran but returned error)
          if (error.code === 1 && stdout) {
            try {
              const result = JSON.parse(stdout.trim());
              console.error("❌ [HOLEHE] Script returned error:", result.error);
              return reject(new Error(result.error || "Holehe scan failed"));
            } catch (parseError) {
              console.error("❌ [HOLEHE] Failed to parse error output");
              return reject(new Error("Failed to parse Holehe error output"));
            }
          }

          // Other execution errors
          return reject(new Error(`Holehe execution failed: ${error.message}`));
        }

        // Log any stderr warnings
        if (stderr && stderr.trim()) {
          console.warn("⚠️ [HOLEHE] stderr:", stderr.trim());
        }

        // Parse the JSON response
        try {
          if (!stdout || stdout.trim() === '') {
            console.error("❌ [HOLEHE] Empty output from script");
            return reject(new Error("Empty output from Holehe script"));
          }

          const result = JSON.parse(stdout.trim());
          
          // Validate the response structure
          if (!result.email) {
            console.error("❌ [HOLEHE] Invalid response structure:", result);
            return reject(new Error("Invalid response from Holehe script"));
          }

          // Check if the scan was successful
          if (result.success === false) {
            console.error("❌ [HOLEHE] Scan failed:", result.error);
            return reject(new Error(result.error || "Holehe scan failed"));
          }

          // Success case
          console.log(`✅ [HOLEHE] Scan completed successfully: ${result.count} confirmed platforms, ${(result.rate_limited || []).length} rate-limited`);
          
          // Return in the format expected by your application
          resolve({
            email: result.email,
            used_on: result.used_on || [],
            rate_limited: result.rate_limited || [],
            count: result.count || 0,
            total_checked: result.total_checked || 0,
            scan_time: result.scan_time,
            success: result.success,
            message: result.message,
            warning: result.warning
          });

        } catch (parseError) {
          console.error("❌ [HOLEHE] JSON parsing error:", parseError.message);
          console.error("❌ [HOLEHE] Raw stdout (first 500 chars):", stdout?.substring(0, 500));
          return reject(new Error(`Failed to parse Holehe output: ${parseError.message}`));
        }
      }
    );
  });
};

// Export the function
module.exports = {
  runHolehe
};