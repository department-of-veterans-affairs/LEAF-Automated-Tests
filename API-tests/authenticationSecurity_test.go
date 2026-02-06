package main

import (
	"encoding/base64"
	"net/url"
	"strings"
	"testing"
)

// TestOpenRedirectViaAtSymbol tests whether the auth_domain endpoint is vulnerable
// to open redirect attacks using the @ symbol. When user input is appended to a URL,
// an attacker can use @ to redefine the host portion of the URL.
//
// Example: https://legitimate.com@evil.com/path
// The browser interprets "legitimate.com" as credentials and redirects to evil.com
func TestOpenRedirectViaAtSymbol(t *testing.T) {
	// Using example.com as it's a safe, reserved domain for testing (RFC 2606)
	// The test will fail if we successfully redirect to any of these external domains
	testCases := []struct {
		name           string
		payload        string
		expectedHost   string // The malicious host we'd be redirected to if vulnerable
	}{
		{
			name:         "basic @ symbol attack",
			payload:      "@example.com/test",
			expectedHost: "example.com",
		},
		{
			name:         "@ with subdomain",
			payload:      "@sub.example.com/path",
			expectedHost: "sub.example.com",
		},
		{
			name:         "@ with port",
			payload:      "@example.com:8080/path",
			expectedHost: "example.com:8080",
		},
		{
			name:         "@ with fake credentials",
			payload:      "user:pass@example.com/path",
			expectedHost: "example.com",
		},
		{
			name:         "double @ symbol",
			payload:      "foo@bar@example.com/path",
			expectedHost: "example.com",
		},
		{
			name:         "@ with query string",
			payload:      "@example.com/path?q=test",
			expectedHost: "example.com",
		},
		{
			name:         "encoded @ symbol",
			payload:      "%40example.com/path",
			expectedHost: "example.com",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			encodedPayload := base64.StdEncoding.EncodeToString([]byte(tc.payload))
			targetURL := RootURL + "auth_domain/?r=" + encodedPayload

			// Use the regular client that follows redirects
			res, err := client.Get(targetURL)
			if err != nil {
				// If we can't connect to the external domain, that's actually fine
				// It means the redirect was attempted but the domain wasn't reachable
				if strings.Contains(err.Error(), tc.expectedHost) {
					t.Errorf("SECURITY FAILURE: Open redirect attempted to %s\n"+
						"Payload: %s\n"+
						"Error: %v",
						tc.expectedHost, tc.payload, err)
				}
				t.Logf("Request error (may indicate blocked or unreachable): %v", err)
				return
			}
			defer res.Body.Close()

			// Check the final URL after following redirects
			finalURL := res.Request.URL
			finalHost := finalURL.Host

			// Remove port from host for comparison if needed
			finalHostWithoutPort := finalURL.Hostname()

			// Check if we ended up on the malicious domain
			expectedHostWithoutPort := tc.expectedHost
			if strings.Contains(tc.expectedHost, ":") {
				parsedExpected, _ := url.Parse("https://" + tc.expectedHost)
				if parsedExpected != nil {
					expectedHostWithoutPort = parsedExpected.Hostname()
				}
			}

			if finalHostWithoutPort == expectedHostWithoutPort ||
				strings.HasSuffix(finalHostWithoutPort, "."+expectedHostWithoutPort) {
				t.Errorf("SECURITY FAILURE: Open redirect successful!\n"+
					"Payload: %s\n"+
					"Expected to stay on: host.docker.internal\n"+
					"Actually redirected to: %s\n"+
					"Final URL: %s",
					tc.payload, finalHost, finalURL.String())
			}

			// Also check if the host contains our expected malicious domain anywhere
			// This catches cases where the redirect happened but landed on a different page
			if strings.Contains(finalHost, expectedHostWithoutPort) {
				t.Errorf("SECURITY FAILURE: Redirected to external domain!\n"+
					"Payload: %s\n"+
					"Final host: %s",
					tc.payload, finalHost)
			}

			t.Logf("OK: Payload %q -> Final URL: %s", tc.payload, finalURL.String())
		})
	}
}
