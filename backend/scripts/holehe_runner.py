#!/usr/bin/env python3
"""
Holehe Runner - Working Version for Real Holehe Output
Properly parses the actual holehe command output format
"""

import sys
import subprocess
import json
import re
import logging
import time

# Configure logging
logging.basicConfig(level=logging.WARNING, format='%(asctime)s - %(levelname)s - %(message)s')

def validate_email(email):
    """Validate email format and security"""
    if not email or not isinstance(email, str):
        raise ValueError("Email must be a non-empty string")
    
    email = email.strip().lower()
    
    if len(email) < 5 or len(email) > 254:
        raise ValueError("Email length must be between 5 and 254 characters")
    
    email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    if not email_pattern.match(email):
        raise ValueError("Invalid email format")
    
    # Security checks
    dangerous_chars = ['`', '$', '(', ')', ';', '|', '&', '<', '>', '\\']
    if any(char in email for char in dangerous_chars):
        raise ValueError("Email contains dangerous characters")
    
    return email

def parse_holehe_output(output):
    """
    Parse the actual holehe output format
    [+] = Email confirmed on platform
    [x] = Rate limited (potentially used)
    [-] = Email not found on platform
    """
    used_platforms = []
    rate_limited_platforms = []
    
    if not output:
        return used_platforms, rate_limited_platforms
    
    lines = output.splitlines()
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines and footer messages
        if not line or any(skip in line.lower() for skip in [
            'email used', 'email not used', 'rate limit', 
            'websites checked', 'twitter :', 'github :', 'for btc',
            '***', '100%', 'it/s'
        ]):
            continue
        
        # Parse [+] confirmed platforms
        plus_match = re.match(r'\[\+\]\s+(.+)', line)
        if plus_match:
            platform = plus_match.group(1).strip()
            if platform and platform not in used_platforms:
                used_platforms.append(platform)
            continue
        
        # Parse [x] rate-limited platforms  
        x_match = re.match(r'\[x\]\s+(.+)', line)
        if x_match:
            platform = x_match.group(1).strip()
            if platform and platform not in rate_limited_platforms:
                rate_limited_platforms.append(platform)
            continue
    
    return used_platforms, rate_limited_platforms

def run_holehe_scan(email):
    """Run holehe scan and parse results"""
    try:
        validated_email = validate_email(email)
        
        # Run holehe command
        result = subprocess.run(
            ["holehe", validated_email],
            capture_output=True,
            text=True,
            timeout=120,  # Increase timeout to 2 minutes
            check=False
        )
        
        # Parse the output regardless of exit code
        used_platforms, rate_limited_platforms = parse_holehe_output(result.stdout)
        
        # Check if we got meaningful results
        total_platforms = len(used_platforms) + len(rate_limited_platforms)
        
        if result.returncode == 0 or total_platforms > 0:
            # Success or partial success
            return {
                "email": validated_email,
                "used_on": used_platforms,
                "rate_limited": rate_limited_platforms,
                "count": len(used_platforms),
                "total_checked": total_platforms,
                "scan_time": time.time(),
                "success": True,
                "message": f"Scan completed - {len(used_platforms)} confirmed, {len(rate_limited_platforms)} rate-limited"
            }
        else:
            # Handle various error cases
            error_output = result.stderr.strip() if result.stderr else "Unknown error"
            
            if "not found" in error_output.lower() or "command not found" in error_output.lower():
                raise FileNotFoundError("Holehe tool not found")
            elif "timeout" in error_output.lower():
                raise TimeoutError("Holehe scan timed out")
            else:
                # Return partial results if available, otherwise error
                if total_platforms > 0:
                    return {
                        "email": validated_email,
                        "used_on": used_platforms,
                        "rate_limited": rate_limited_platforms,
                        "count": len(used_platforms),
                        "total_checked": total_platforms,
                        "scan_time": time.time(),
                        "success": True,
                        "warning": f"Holehe returned error but data was extracted: {error_output[:100]}",
                        "message": "Partial scan completed with warnings"
                    }
                else:
                    raise RuntimeError(f"Holehe scan failed: {error_output}")
        
    except ValueError as e:
        raise ValueError(f"Invalid input: {str(e)}")
    except FileNotFoundError:
        raise RuntimeError("Holehe tool not available - please install holehe")
    except subprocess.TimeoutExpired:
        raise TimeoutError("Holehe scan timed out after 2 minutes")
    except Exception as e:
        logging.error(f"Unexpected error: {type(e).__name__}: {str(e)}")
        raise RuntimeError("Internal scan error")

def main():
    """Main function with error handling"""
    try:
        if len(sys.argv) != 2:
            if len(sys.argv) < 2:
                error_result = {"error": "Missing email parameter", "code": "MISSING_EMAIL", "success": False}
            else:
                error_result = {"error": "Too many parameters", "code": "TOO_MANY_PARAMS", "success": False}
            print(json.dumps(error_result))
            sys.exit(1)
        
        email = sys.argv[1]
        result = run_holehe_scan(email)
        print(json.dumps(result))
        
    except ValueError as e:
        error_result = {"error": str(e), "code": "VALIDATION_ERROR", "success": False}
        print(json.dumps(error_result))
        sys.exit(1)
    except TimeoutError as e:
        error_result = {"error": "Scan timed out - please try again", "code": "TIMEOUT_ERROR", "success": False}
        print(json.dumps(error_result))
        sys.exit(1)
    except RuntimeError as e:
        error_result = {"error": str(e), "code": "RUNTIME_ERROR", "success": False}
        print(json.dumps(error_result))
        sys.exit(1)
    except Exception as e:
        logging.error(f"Unexpected error in main: {type(e).__name__}: {str(e)}")
        error_result = {"error": "Internal service error", "code": "INTERNAL_ERROR", "success": False}
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == "__main__":
    main()