package main

import (
	"encoding/base64"
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
	payload := "@example.com/test"
	encodedPayload := base64.StdEncoding.EncodeToString([]byte(payload))
	targetURL := RootURL + "auth_domain/?r=" + encodedPayload

	res, err := client.Get(targetURL)
	if err != nil {
		if strings.Contains(err.Error(), "example.com") {
			t.Errorf("SECURITY FAILURE: Open redirect attempted to example.com\n"+
				"Payload: %s\n"+
				"Error: %v",
				payload, err)
		}
		t.Logf("Request error (may indicate blocked or unreachable): %v", err)
		return
	}
	defer res.Body.Close()

	finalHost := res.Request.URL.Hostname()
	if finalHost == "example.com" || strings.HasSuffix(finalHost, ".example.com") {
		t.Errorf("SECURITY FAILURE: Open redirect successful!\n"+
			"Payload: %s\n"+
			"Expected to stay on: host.docker.internal\n"+
			"Actually redirected to: %s\n"+
			"Final URL: %s",
			payload, finalHost, res.Request.URL.String())
	}

	t.Logf("OK: Payload %q -> Final URL: %s", payload, res.Request.URL.String())
}

// TestOpenRedirectViaNewline tests whether the auth_domain endpoint is vulnerable
// to header injection via newline characters. A \n in a Location header can allow
// an attacker to inject additional HTTP headers or split the response.
func TestOpenRedirectViaNewline(t *testing.T) {
	payload := "/\nhttps://example.com"
	encodedPayload := base64.StdEncoding.EncodeToString([]byte(payload))
	targetURL := RootURL + "auth_domain/?r=" + encodedPayload

	res, err := client.Get(targetURL)
	if err != nil {
		if strings.Contains(err.Error(), "example.com") {
			t.Errorf("SECURITY FAILURE: Newline injection redirected to example.com\n"+
				"Payload: %s\n"+
				"Error: %v",
				payload, err)
		}
		t.Logf("Request error (may indicate blocked or unreachable): %v", err)
		return
	}
	defer res.Body.Close()

	finalHost := res.Request.URL.Hostname()
	if finalHost == "example.com" || strings.HasSuffix(finalHost, ".example.com") {
		t.Errorf("SECURITY FAILURE: Newline injection redirect successful!\n"+
			"Payload: %s\n"+
			"Expected to stay on: host.docker.internal\n"+
			"Actually redirected to: %s\n"+
			"Final URL: %s",
			payload, finalHost, res.Request.URL.String())
	}

	t.Logf("OK: Payload %q -> Final URL: %s", payload, res.Request.URL.String())
}

// TestLegitimateRedirectWithQueryParams verifies that valid redirect paths
// with query parameters still work correctly after sanitization.
func TestLegitimateRedirectWithQueryParams(t *testing.T) {
	payload := "/?a=reports&v=3&status=active"
	encodedPayload := base64.StdEncoding.EncodeToString([]byte(payload))
	targetURL := RootURL + "auth_domain/?r=" + encodedPayload

	res, err := client.Get(targetURL)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer res.Body.Close()

	finalURL := res.Request.URL.String()
	if !strings.Contains(finalURL, "a=reports") {
		t.Errorf("Legitimate redirect lost query parameters\n"+
			"Payload: %s\n"+
			"Final URL: %s",
			payload, finalURL)
	}

	finalHost := res.Request.URL.Hostname()
	if finalHost != "host.docker.internal" {
		t.Errorf("Legitimate redirect went to wrong host\n"+
			"Expected: host.docker.internal\n"+
			"Got: %s",
			finalHost)
	}

	t.Logf("OK: Payload %q -> Final URL: %s", payload, finalURL)
}
