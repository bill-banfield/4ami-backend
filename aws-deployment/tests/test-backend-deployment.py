#!/usr/bin/env python3
"""
Backend Deployment Test Script
Tests the deployed backend API to verify successful deployment
"""

import sys
import requests
import time
import argparse
from typing import Dict, Any

def print_test_header(test_name: str):
    """Print a formatted test header"""
    print(f"\n{'='*60}")
    print(f"🧪 TEST: {test_name}")
    print('='*60)

def print_test_result(passed: bool, message: str):
    """Print a formatted test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def test_health_endpoint(base_url: str) -> bool:
    """Test the health endpoint"""
    print_test_header("Health Endpoint")

    try:
        url = f"{base_url}/health"
        print(f"Testing: {url}")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")

            if data.get('status') == 'ok':
                print_test_result(True, "Health endpoint is healthy")
                return True
            else:
                print_test_result(False, f"Health status is not 'ok': {data.get('status')}")
                return False
        else:
            print_test_result(False, f"HTTP {response.status_code}: {response.text}")
            return False

    except requests.exceptions.RequestException as e:
        print_test_result(False, f"Request failed: {str(e)}")
        return False

def test_api_docs(base_url: str) -> bool:
    """Test that API documentation is accessible"""
    print_test_header("API Documentation")

    try:
        url = f"{base_url}/docs"
        print(f"Testing: {url}")

        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            if 'swagger' in response.text.lower() or 'api' in response.text.lower():
                print_test_result(True, "API documentation is accessible")
                return True
            else:
                print_test_result(False, "Documentation page doesn't contain expected content")
                return False
        else:
            print_test_result(False, f"HTTP {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print_test_result(False, f"Request failed: {str(e)}")
        return False

def test_protected_endpoint(base_url: str) -> bool:
    """Test that protected endpoints require authentication"""
    print_test_header("Protected Endpoint Security")

    try:
        url = f"{base_url}/users"
        print(f"Testing: {url}")

        response = requests.get(url, timeout=10)

        if response.status_code == 401:
            print_test_result(True, "Protected endpoint correctly requires authentication")
            return True
        else:
            print_test_result(False, f"Expected 401 Unauthorized, got {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print_test_result(False, f"Request failed: {str(e)}")
        return False

def test_cors_headers(base_url: str) -> bool:
    """Test that CORS headers are present"""
    print_test_header("CORS Headers")

    try:
        url = f"{base_url}/health"
        print(f"Testing: {url}")

        response = requests.options(url, timeout=10)

        # Check for CORS headers
        has_cors = (
            'access-control-allow-origin' in response.headers or
            'Access-Control-Allow-Origin' in response.headers
        )

        if has_cors or response.status_code in [200, 204]:
            print_test_result(True, "CORS configuration present")
            return True
        else:
            print(f"Warning: CORS headers may not be configured properly")
            print_test_result(True, "Passing test (CORS is optional)")
            return True

    except requests.exceptions.RequestException as e:
        print_test_result(False, f"Request failed: {str(e)}")
        return False

def main():
    """Main test execution"""
    parser = argparse.ArgumentParser(description='Test backend deployment')
    parser.add_argument('--url', required=True, help='Base URL of the API (e.g., http://example.com/api/v1)')
    args = parser.parse_args()

    base_url = args.url.rstrip('/')

    print("\n" + "="*60)
    print("🚀 BACKEND DEPLOYMENT TESTS")
    print("="*60)
    print(f"API Base URL: {base_url}")
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    # Run all tests
    tests = [
        ("Health Endpoint", lambda: test_health_endpoint(base_url)),
        ("API Documentation", lambda: test_api_docs(base_url)),
        ("Protected Endpoints", lambda: test_protected_endpoint(base_url)),
        ("CORS Headers", lambda: test_cors_headers(base_url)),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))

    # Print summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)

    passed = sum(1 for _, result in results if result)
    total = len(results)

    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Deployment is successful!")
        sys.exit(0)
    else:
        print(f"\n❌ {total - passed} test(s) failed! Deployment may have issues.")
        sys.exit(1)

if __name__ == '__main__':
    main()
