package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"crypto/tls"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strings"
	"testing"
	"time"
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

// TestAtSymbolAllowedInQueryString verifies that @ in the query string portion
// of a redirect is allowed, since it only poses a risk in the path where it can
// redefine the URL host.
func TestAtSymbolAllowedInQueryString(t *testing.T) {
	payload := "/?a=reports&email=user@example.com"
	encodedPayload := base64.StdEncoding.EncodeToString([]byte(payload))
	targetURL := RootURL + "auth_domain/?r=" + encodedPayload

	res, err := client.Get(targetURL)
	if err != nil {
		t.Fatalf("Failed to make request: %v", err)
	}
	defer res.Body.Close()

	finalURL := res.Request.URL.String()
	if !strings.Contains(finalURL, "email=user") {
		t.Errorf("Redirect with @ in query string was rejected or lost parameters\n"+
			"Payload: %s\n"+
			"Final URL: %s",
			payload, finalURL)
	}

	finalHost := res.Request.URL.Hostname()
	if finalHost != "host.docker.internal" {
		t.Errorf("Redirect with @ in query string went to wrong host\n"+
			"Expected: host.docker.internal\n"+
			"Got: %s",
			finalHost)
	}

	t.Logf("OK: Payload %q -> Final URL: %s", payload, finalURL)
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

// newUnauthenticatedClient creates an HTTP client with no existing session,
// used to test authentication flows from scratch.
func newUnauthenticatedClient() *http.Client {
	jar, _ := cookiejar.New(nil)
	return &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
		Timeout: time.Second * 10,
		Jar:     jar,
	}
}

// encryptUser mirrors PHP's encryption used to create the REMOTE_USER cookie.
// PHP decryptUser does:
//  1. hex2bin(cookie) -> binary containing "base64(ciphertext)::hex(iv)"
//  2. explode on "::" -> [base64_ciphertext, hex_iv]
//  3. openssl_decrypt(base64_ciphertext, 'aes-128-ctr', sha256(key), 0, hex2bin(hex_iv))
//     flag 0 means input is base64-encoded
//
// So we encrypt as: AES-128-CTR, base64 the ciphertext, format as "base64::hexIV", then hex-encode all.
func encryptUser(username string, cipherKey string) (string, error) {
	keyHash := sha256.Sum256([]byte(cipherKey))
	encKey := keyHash[:16] // aes-128 uses first 16 bytes of SHA256

	block, err := aes.NewCipher(encKey)
	if err != nil {
		return "", err
	}

	iv := make([]byte, aes.BlockSize)
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	plaintext := []byte(username)
	ciphertext := make([]byte, len(plaintext))
	stream := cipher.NewCTR(block, iv)
	stream.XORKeyStream(ciphertext, plaintext)

	// base64 encode ciphertext (PHP openssl_decrypt with flag 0 expects base64)
	b64Ciphertext := base64.StdEncoding.EncodeToString(ciphertext)

	// Format: base64(ciphertext)::hex(iv), then hex-encode the whole thing
	packed := fmt.Sprintf("%s::%s", b64Ciphertext, hex.EncodeToString(iv))
	return hex.EncodeToString([]byte(packed)), nil
}

// TestAuthDomain_CheckUserExists_ValidUser verifies that auth_domain successfully
// authenticates a valid user via Setting::checkUserExists(). In the Docker test
// environment, REMOTE_USER is set to \tester, so auth_domain extracts "tester"
// and checks that this user exists in the employee table.
func TestAuthDomain_CheckUserExists_ValidUser(t *testing.T) {
	freshClient := newUnauthenticatedClient()

	// Hit auth_domain directly - Docker sets REMOTE_USER=\tester for all requests
	req, _ := http.NewRequest("GET", RootURL+"auth_domain/", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46")

	res, err := freshClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to make request to auth_domain: %v", err)
	}
	defer res.Body.Close()

	// auth_domain should authenticate "tester" via checkUserExists and redirect
	// to the portal. If checkUserExists fails, we'd get the "User not found" error.
	bodyBytes, _ := io.ReadAll(res.Body)
	body := string(bodyBytes)

	if strings.Contains(body, "Unable to log in") {
		t.Errorf("auth_domain failed to authenticate valid user 'tester' via Setting::checkUserExists()\n"+
			"Response: %s", body)
	}

	// After successful auth, we should have been redirected to the portal
	finalHost := res.Request.URL.Hostname()
	if finalHost != "host.docker.internal" {
		t.Errorf("auth_domain redirected to unexpected host: %s", finalHost)
	}

	t.Logf("OK: auth_domain authenticated user, final URL: %s", res.Request.URL.String())
}

// TestAuthCookie_DecryptUser_ValidCookie verifies that auth_cookie successfully
// decrypts a REMOTE_USER cookie via Security::decryptUser() and authenticates
// the user via Setting::checkUserExists().
func TestAuthCookie_DecryptUser_ValidCookie(t *testing.T) {
	cipherKey := "example-key"
	encryptedToken, err := encryptUser("tester", cipherKey)
	if err != nil {
		t.Fatalf("Failed to encrypt test user token: %v", err)
	}

	freshClient := newUnauthenticatedClient()

	// Set the REMOTE_USER cookie with encrypted token
	cookieURL, _ := url.Parse(RootURL)
	freshClient.Jar.SetCookies(cookieURL, []*http.Cookie{
		{
			Name:  "REMOTE_USER",
			Value: encryptedToken,
			Path:  "/",
		},
	})

	req, _ := http.NewRequest("GET", RootURL+"auth_cookie/", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46")

	res, err := freshClient.Do(req)
	if err != nil {
		t.Fatalf("Failed to make request to auth_cookie: %v", err)
	}
	defer res.Body.Close()

	bodyBytes, _ := io.ReadAll(res.Body)
	body := string(bodyBytes)

	// Successful auth should redirect to the portal, not to the login/cert page
	finalURL := res.Request.URL.String()

	// If decryptUser or checkUserExists failed, auth_cookie redirects to AUTH_URL
	// (the cert/login page). A successful auth redirects to the portal root.
	if strings.Contains(finalURL, "auth_cert") || strings.Contains(finalURL, "login") {
		t.Errorf("auth_cookie failed to authenticate via Security::decryptUser() + Setting::checkUserExists()\n"+
			"Expected: redirect to portal\n"+
			"Got: redirect to %s\n"+
			"Body: %s", finalURL, body)
	}

	finalHost := res.Request.URL.Hostname()
	if finalHost != "host.docker.internal" {
		t.Errorf("auth_cookie redirected to unexpected host: %s", finalHost)
	}

	t.Logf("OK: auth_cookie authenticated user via encrypted cookie, final URL: %s", finalURL)
}

// TestAuthCookie_DecryptUser_InvalidCookie verifies that auth_cookie rejects
// an invalid/garbage REMOTE_USER cookie. Security::decryptUser() should fail
// to produce a valid username, and Setting::checkUserExists() should not find
// a matching user.
func TestAuthCookie_DecryptUser_InvalidCookie(t *testing.T) {
	freshClient := newUnauthenticatedClient()

	// Set a garbage REMOTE_USER cookie
	cookieURL, _ := url.Parse(RootURL)
	freshClient.Jar.SetCookies(cookieURL, []*http.Cookie{
		{
			Name:  "REMOTE_USER",
			Value: "not_a_valid_encrypted_token",
			Path:  "/",
		},
	})

	req, _ := http.NewRequest("GET", RootURL+"auth_cookie/", nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46")

	res, err := freshClient.Do(req)
	if err != nil {
		// A redirect error (e.g. malformed AUTH_URL in dev) means auth_cookie
		// rejected the cookie and tried to redirect away — this is expected.
		t.Logf("OK: auth_cookie rejected invalid cookie (redirect error: %v)", err)
		return
	}
	defer res.Body.Close()

	// An invalid cookie should NOT result in a successful login to the portal.
	// auth_cookie should redirect to the cert/login page.
	finalURL := res.Request.URL.String()

	// Check we did NOT land on the main portal (which would indicate false auth)
	bodyBytes, _ := io.ReadAll(res.Body)
	body := string(bodyBytes)

	if strings.Contains(body, "var CSRFToken") {
		t.Errorf("auth_cookie authenticated with invalid cookie - SECURITY FAILURE\n"+
			"Expected: rejection/redirect to login\n"+
			"Got: authenticated session at %s", finalURL)
	}

	t.Logf("OK: auth_cookie rejected invalid cookie, final URL: %s", finalURL)
}
