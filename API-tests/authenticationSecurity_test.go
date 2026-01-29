package main

import (
	"encoding/base64"
	"io"
	"net/http"
	"strings"
	"testing"
)

// TestAuthDomain_ValidRedirects tests that legitimate redirects work correctly
func TestAuthDomain_ValidRedirects(t *testing.T) {
	testCases := []struct {
		name         string
		redirectPath string
		expectedURL  string
	}{
		{
			name:         "allows valid relative path redirect",
			redirectPath: "/?a=reports&v=3&query=test",
			expectedURL:  "a=reports",
		},
		{
			name:         "allows relative path to admin",
			redirectPath: "/../admin/",
			expectedURL:  "admin",
		},
		{
			name:         "preserves query parameters",
			redirectPath: "/?a=reports&status=active&year=2024",
			expectedURL:  "a=reports",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(tc.redirectPath))
			targetURL := RootURL + "auth_domain/?r=" + encodedRedirect

			res, err := noRedirectClient.Get(targetURL)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			body, err := io.ReadAll(res.Body)
			if err != nil {
				t.Fatalf("Failed to read body: %v", err)
			}

			// Should redirect (302 or 301)
			if res.StatusCode != http.StatusFound && res.StatusCode != http.StatusMovedPermanently {
				t.Fatalf("Expected redirect status, got %d. Body: %s", res.StatusCode, string(body))
			}

			location := res.Header.Get("Location")
			if !strings.Contains(location, tc.expectedURL) {
				t.Errorf("Expected redirect to contain %q, got: %s", tc.expectedURL, location)
			}

			t.Logf("✓ Valid redirect: %s -> %s", tc.redirectPath, location)
		})
	}
}

// TestAuthDomain_DefaultRedirect tests redirect when no parameter provided
func TestAuthDomain_DefaultRedirect(t *testing.T) {
	res, err := noRedirectClient.Get(RootURL + "auth_domain/")
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("Failed to read body: %v", err)
	}

	if res.StatusCode != http.StatusFound && res.StatusCode != http.StatusMovedPermanently {
		t.Fatalf("Expected redirect status, got %d. body: %s", res.StatusCode, body)
	}

	location := res.Header.Get("Location")
	if !strings.Contains(location, RootURL) {
		t.Errorf("Expected default redirect to contain %s, got: %s", RootURL, location)
	}

	t.Logf("✓ Default redirect works: %s", location)
}

// TestAuthDomain_ProtocolRelativeURLs tests blocking of protocol-relative URLs
func TestAuthDomain_ProtocolRelativeURLs(t *testing.T) {
	maliciousPaths := []string{
		"//malicious.example.com/phishing",
		"///attacker.test/phishing",
		"////malicious.example.com",
		"/////evil.com",
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(maliciousPath, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"malicious.example.com", "attacker.test", "evil.com"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: Protocol-relative URL bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked protocol-relative URL: %s", maliciousPath)
		})
	}
}

// TestAuthDomain_URLEncodingBypass tests blocking of URL-encoded attacks
func TestAuthDomain_URLEncodingBypass(t *testing.T) {
	maliciousPaths := []string{
		"/%68%74%74%70%73%3A%2F%2Fmalicious.example.com",       // https://
		"/%0ahttps://phishing.test",                             // newline
		"/%0dhttps://attacker.example.org",                      // carriage return
		"/%68ttps://malicious.example.com",                      // partial encoding
		"/%2F%2Fmalicious.example.com",                          // //
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(truncateString(maliciousPath, 30), func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"malicious.example.com", "phishing.test", "attacker.example.org"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: URL encoding bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked URL-encoded attack: %s", truncateString(maliciousPath, 50))
		})
	}
}

// TestAuthDomain_BackslashBypass tests blocking of backslash-based attacks
func TestAuthDomain_BackslashBypass(t *testing.T) {
	maliciousPaths := []string{
		"/\\attacker.test",
		"\\\\malicious.example.com",
		"/\\/\\/phishing.test",
		"/\\evil.com",
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(maliciousPath, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"attacker.test", "malicious.example.com", "phishing.test", "evil.com"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: Backslash bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked backslash bypass: %s", maliciousPath)
		})
	}
}

// TestAuthDomain_AtSignBypass tests blocking of @-sign credential attacks
func TestAuthDomain_AtSignBypass(t *testing.T) {
	maliciousPaths := []string{
		"/@attacker.example.org",
		"/user:pass@malicious.example.com",
		"/legitsite@phishing.test",
		"/@evil.com/path",
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(maliciousPath, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"attacker.example.org", "malicious.example.com", "phishing.test", "evil.com"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: At-sign bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked at-sign bypass: %s", maliciousPath)
		})
	}
}

// TestAuthDomain_ControlCharacters tests blocking of whitespace/control character injection
func TestAuthDomain_ControlCharacters(t *testing.T) {
	maliciousPaths := []string{
		"/\nhttps://attacker.example.org",     // newline
		"/\rhttps://malicious.example.com",    // carriage return
		"/\r\nhttps://phishing.test",          // CRLF
		"/\thttps://attacker.example.org",     // tab
		"/\x00https://malicious.example.com",  // null byte
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run("control_char_test", func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"attacker.example.org", "malicious.example.com", "phishing.test"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: Control character bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked control character injection")
		})
	}
}

// TestAuthDomain_ProtocolVariations tests blocking of various protocol schemes
func TestAuthDomain_ProtocolVariations(t *testing.T) {
	maliciousPaths := []string{
		"https://phishing.test/steal-credentials",
		"http://attacker.example.org/phishing",
		"/ftp://malicious.example.com",
		"/file://attacker.example.org/secrets",
		"/javascript:alert(document.domain)",
		"/data:text/html,<script>alert(\"xss\")</script>",
		"/vbscript:msgbox(\"xss\")",
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(truncateString(maliciousPath, 30), func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			// Check for any external domains
			maliciousDomains := []string{
				"phishing.test", "attacker.example.org", "malicious.example.com",
			}

			// Check for dangerous protocols
			dangerousProtocols := []string{
				"javascript:", "data:", "vbscript:", "ftp://", "file://",
			}

			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: Protocol variation bypass to %s! Location: %s", domain, location)
				}
			}

			for _, protocol := range dangerousProtocols {
				if strings.Contains(location, protocol) {
					t.Errorf("SECURITY FAILURE: Dangerous protocol %s not blocked! Location: %s", protocol, location)
				}
			}

			t.Logf("✓ Blocked protocol variation: %s", truncateString(maliciousPath, 50))
		})
	}
}

// TestAuthDomain_ProtocolInPath tests blocking of protocols embedded in paths
func TestAuthDomain_ProtocolInPath(t *testing.T) {
	maliciousPaths := []string{
		"/../https://phishing.test",
		"/../https://https://malicious.example.com",
		"/path/../https://evil.com",
	}

	for _, maliciousPath := range maliciousPaths {
		t.Run(maliciousPath, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(maliciousPath))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{"phishing.test", "malicious.example.com", "evil.com"}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: Protocol in path bypass! Location: %s", location)
				}
			}

			t.Logf("✓ Blocked protocol in path: %s", maliciousPath)
		})
	}
}

// TestAuthDomain_EdgeCases tests edge cases and combined attacks
func TestAuthDomain_EdgeCases(t *testing.T) {
	testCases := []struct {
		name string
		path string
	}{
		{"path without leading slash", "admin/"},
		{"semicolon parameter pollution", "/;https://attacker.example.org"},
		{"URL encoding + protocol-relative", "/%2F%2Fmalicious.example.com"},
		{"<br> + URL encoding", "/<br>%68ttps://phishing.test"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(tc.path))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			location := res.Header.Get("Location")

			maliciousDomains := []string{
				"attacker.example.org", "malicious.example.com", "phishing.test",
			}
			for _, domain := range maliciousDomains {
				if strings.Contains(location, domain) {
					t.Errorf("SECURITY FAILURE: %s bypass! Location: %s", tc.name, location)
				}
			}

			t.Logf("✓ Blocked %s: %s", tc.name, tc.path)
		})
	}
}

// TestAuthDomain_InvalidBase64 tests handling of invalid base64
func TestAuthDomain_InvalidBase64(t *testing.T) {
	invalidBase64 := "this-is-not-valid-base64!!!"

	res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + invalidBase64)
	if err != nil {
		t.Fatalf("Request failed: %v", err)
	}
	defer res.Body.Close()

	location := res.Header.Get("Location")

	// Should redirect to default (safe) location
	if !strings.Contains(location, RootURL) {
		t.Errorf("Invalid base64 should redirect to default, got: %s", location)
	}

	t.Logf("✓ Invalid base64 handled gracefully: %s", location)
}

// TestAuthDomain_HTMLTagInjection tests blocking of HTML / script injection
// Uses inert, non-executing payloads to avoid browser side-effects
func TestAuthDomain_HTMLTagInjection(t *testing.T) {
	maliciousPaths := []struct {
		name string
		path string
	}{
		{
			name: "encoded script tag",
			path: "/%3Cscript%3Ealert(1)%3C/script%3E",
		},
		{
			name: "encoded script with location assignment",
			path: "/%3Cscript%3Elocation%3D%22https://phishing.test%22%3C/script%3E",
		},
		{
			name: "encoded iframe",
			path: "/%3Ciframe%20src%3D%22https://evil.com%22%3E%3C/iframe%3E",
		},
		{
			name: "encoded br tag",
			path: "/%3Cbr%3Ehttps://malicious.example.com",
		},
		{
			name: "encoded div tag",
			path: "/%3Cdiv%3Ehttps://attacker.example.org%3C/div%3E",
		},
	}

	for _, tc := range maliciousPaths {
		t.Run(tc.name, func(t *testing.T) {
			encodedRedirect := base64.StdEncoding.EncodeToString([]byte(tc.path))

			res, err := noRedirectClient.Get(RootURL + "auth_domain/?r=" + encodedRedirect)
			if err != nil {
				t.Fatalf("Request failed: %v", err)
			}
			defer res.Body.Close()

			// We only care about redirect behavior
			if res.StatusCode != http.StatusFound && res.StatusCode != http.StatusMovedPermanently {
				t.Fatalf("Expected redirect status, got %d", res.StatusCode)
			}

			location := res.Header.Get("Location")
			if location == "" {
				t.Fatalf("Missing Location header")
			}

			if !strings.HasPrefix(location, RootURL) && !strings.HasPrefix(location, "/") {
				t.Errorf("Redirect escaped allowed scope: %s", location)
			}


			// Assert no malicious domains are ever used
			maliciousDomains := []string{
				"malicious.example.com",
				"attacker.example.org",
				"phishing.test",
				"evil.com",
			}

			for _, domain := range maliciousDomains {
				if strings.Contains(strings.ToLower(location), domain) {
					t.Errorf(
						"SECURITY FAILURE: HTML/script injection redirect to %s. Location: %s",
						domain,
						location,
					)
				}
			}

			// Assert no HTML or JS survives into Location
			disallowedTokens := []string{
				"<", ">", "script", "iframe", "javascript:",
			}

			for _, token := range disallowedTokens {
				if strings.Contains(strings.ToLower(location), token) {
					t.Errorf(
						"SECURITY FAILURE: HTML token %q leaked into Location: %s",
						token,
						location,
					)
				}
			}

			t.Logf("✓ Blocked HTML/script injection safely: %s", tc.name)
		})
	}
}
