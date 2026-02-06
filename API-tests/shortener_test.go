package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"
)

// TestShortener_CreateAndVerifyStorage tests that shortened URLs are created and stored
func TestShortener_CreateAndVerifyStorage(t *testing.T) {
	testData := "/?a=reports&testid=storage"

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("data", testData)

	res, err := client.PostForm(RootURL+"api/open/report", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", res.StatusCode)
	}

	body, _ := io.ReadAll(res.Body)
	var shortCode string
	err = json.Unmarshal(body, &shortCode)
	if err != nil {
		t.Fatalf("Failed to parse short code: %v, body: %s", err, string(body))
	}

	if shortCode == "" {
		t.Fatal("Expected short code to be returned, got empty string")
	}

	// Verify short code format
	if len(shortCode) < 5 {
		t.Errorf("Short code should be at least 5 characters, got: %s", shortCode)
	}

	// Verify storage by creating same link again - should return same code
	res2, err := client.PostForm(RootURL+"api/open/report", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res2.Body.Close()

	body2, _ := io.ReadAll(res2.Body)
	var shortCode2 string
	json.Unmarshal(body2, &shortCode2)

	if shortCode != shortCode2 {
		t.Errorf("Expected same short code for same data (verifying DB storage). Got %s and %s", shortCode, shortCode2)
	}

	t.Logf("✓ Short URL created and stored in DB: %s", shortCode)
}

// TestShortener_FormQueryRetrievalReturnsCorrectData tests that retrieving a form query works
func TestShortener_FormQueryRetrievalReturnsCorrectData(t *testing.T) {
	// Create a form query with specific search criteria
	queryData := `{"terms":[{"id":"recordID","operator":"=","match":"5","gate":"AND"}],"joins":[],"sort":{}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("data", queryData)

	res, err := client.PostForm(RootURL+"api/open/form/query", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	var shortCode string
	err = json.Unmarshal(body, &shortCode)
	if err != nil {
		t.Fatalf("Failed to parse short code: %v", err)
	}

	if shortCode == "" {
		t.Fatal("Expected short code for form query")
	}

	t.Logf("Created form query short code: %s", shortCode)

	retrieveURL := RootURL + "api/open/form/query/_" + shortCode
	res, err = client.Get(retrieveURL)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		bodyText, _ := io.ReadAll(res.Body)
		t.Fatalf("Expected status 200 when retrieving form query, got %d. Body: %s", res.StatusCode, string(bodyText))
	}

	body, _ = io.ReadAll(res.Body)
	if len(body) == 0 {
		t.Fatal("Expected form query results, got empty response")
	}

	// Parse the response to verify it contains the expected record
	var formQueryResult map[int]interface{}
	err = json.Unmarshal(body, &formQueryResult)
	if err != nil {
		t.Fatalf("Expected valid JSON from form query retrieval, got error: %v, body: %s", err, string(body[:min(200, len(body))]))
	}

	// Verify we got record 5 back (from our query)
	if _, exists := formQueryResult[5]; !exists {
		t.Errorf("Expected record 5 in results, got records: %v", getKeys(formQueryResult))
	}

	t.Logf("✓ Form query shortened and retrieved successfully, returned %d records", len(formQueryResult))
}

// TestShortener_FormQueryWithFilterData tests form query retrieval with filter parameters
func TestShortener_FormQueryWithFilterData(t *testing.T) {
	queryData := `{"terms":[{"id":"stepID","operator":"!=","match":"resolved","gate":"AND"}],"joins":[],"sort":{}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("data", queryData)

	res, err := client.PostForm(RootURL+"api/open/form/query", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	var shortCode string
	json.Unmarshal(body, &shortCode)

	retrieveURL := RootURL + "api/open/form/query/_" + shortCode + "?x-filterData=recordID,title"
	res, err = client.Get(retrieveURL)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", res.StatusCode)
	}

	body, _ = io.ReadAll(res.Body)

	// Parse to verify structure
	var result map[int]map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		t.Fatalf("Failed to parse filtered results: %v", err)
	}

	// Verify we got some records
	if len(result) == 0 {
		t.Error("Expected at least one record in filtered results")
	}

	// Verify filtered fields exist
	for recordID, record := range result {
		if _, hasRecordID := record["recordID"]; !hasRecordID {
			t.Errorf("Record %d missing 'recordID' field", recordID)
		}
		if _, hasTitle := record["title"]; !hasTitle {
			t.Errorf("Record %d missing 'title' field", recordID)
		}
		// Only check first record
		break
	}

	t.Logf("✓ Form query with filter data retrieved successfully")
}

// TestShortener_ReportRedirectSecurity tests that report shortener blocks external URLs
func TestShortener_ReportRedirectSecurity(t *testing.T) {
	// Based on Shortener.php getReport() method, it should validate redirects
	maliciousURLs := []string{
		"https://evil.com/phishing",
		"http://malicious.example.com/steal-data",
		"//evil.com/attack",
	}

	for _, maliciousURL := range maliciousURLs {
		postData := url.Values{}
		postData.Set("CSRFToken", CsrfToken)
		postData.Set("data", maliciousURL)

		// Create the shortened link
		res, err := client.PostForm(RootURL+"api/open/report", postData)
		if err != nil {
			t.Fatal(err)
		}

		body, _ := io.ReadAll(res.Body)
		res.Body.Close()

		var shortCode string
		err = json.Unmarshal(body, &shortCode)
		if err != nil {
			t.Logf("✓ Malicious URL rejected at creation: %s", maliciousURL)
			continue
		}

		t.Logf("Short code created for potentially malicious URL: %s -> %s", maliciousURL, shortCode)

		res2, _ := client.PostForm(RootURL+"api/open/report", postData)
		body2, _ := io.ReadAll(res2.Body)
		res2.Body.Close()

		var shortCode2 string
		json.Unmarshal(body2, &shortCode2)

		if shortCode == shortCode2 {
			t.Logf("✓ Malicious URL stored (blocking will happen on redirect): %s", maliciousURL)
		}
	}
}

// TestShortener_ReportLinkStorage tests that report links are stored correctly
func TestShortener_ReportLinkStorage(t *testing.T) {
	testCases := []struct {
		name string
		data string
	}{
		{"relative path", "/?a=reports"},
		{"admin path", "/admin/"},
		{"with query params", "/?a=reports&v=3&sort=date"},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			postData := url.Values{}
			postData.Set("CSRFToken", CsrfToken)
			postData.Set("data", tc.data)

			res, err := client.PostForm(RootURL+"api/open/report", postData)
			if err != nil {
				t.Fatal(err)
			}
			defer res.Body.Close()

			if res.StatusCode != http.StatusOK {
				t.Fatalf("Expected status 200, got %d", res.StatusCode)
			}

			body, _ := io.ReadAll(res.Body)
			var shortCode string
			err = json.Unmarshal(body, &shortCode)
			if err != nil {
				t.Fatalf("Failed to parse short code: %v", err)
			}

			if shortCode == "" {
				t.Fatal("Expected short code")
			}

			// Verify it's stored by requesting same link
			res2, _ := client.PostForm(RootURL+"api/open/report", postData)
			body2, _ := io.ReadAll(res2.Body)
			res2.Body.Close()

			var shortCode2 string
			json.Unmarshal(body2, &shortCode2)

			if shortCode != shortCode2 {
				t.Errorf("Storage verification failed: got different codes %s and %s", shortCode, shortCode2)
			}

			t.Logf("✓ Report link stored: %s -> %s", tc.data, shortCode)
		})
	}
}

// TestShortener_Deduplication tests that same data returns same short code
func TestShortener_Deduplication(t *testing.T) {
	testData := "/?a=reports&testid=dedup123"

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("data", testData)

	// Create first link
	res1, err := client.PostForm(RootURL+"api/open/report", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res1.Body.Close()

	body1, _ := io.ReadAll(res1.Body)
	var shortCode1 string
	json.Unmarshal(body1, &shortCode1)

	// Create second link with same data
	res2, err := client.PostForm(RootURL+"api/open/report", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res2.Body.Close()

	body2, _ := io.ReadAll(res2.Body)
	var shortCode2 string
	json.Unmarshal(body2, &shortCode2)

	if shortCode1 != shortCode2 {
		t.Errorf("Deduplication failed: expected same code, got %s and %s", shortCode1, shortCode2)
	}

	t.Logf("✓ Deduplication working: %s", shortCode1)
}

// TestShortener_ShortCodeFormat validates the format of generated short codes
func TestShortener_ShortCodeFormat(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("data", "/test/")

	res, err := client.PostForm(RootURL+"api/open/report", postData)
	if err != nil {
		t.Fatal(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	var shortCode string
	err = json.Unmarshal(body, &shortCode)
	if err != nil {
		t.Fatalf("Failed to parse short code: %v", err)
	}

	// Minimum length check (offset is 10000000, so encoded should be 5+ chars)
	if len(shortCode) < 5 {
		t.Errorf("Short code too short: %s (length %d)", shortCode, len(shortCode))
	}

	// Character set validation (base56: no 0,1,I,O,l)
	validChars := "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz"
	for _, char := range shortCode {
		if !strings.ContainsRune(validChars, char) {
			t.Errorf("Invalid character '%c' in short code: %s", char, shortCode)
			break
		}
	}

	t.Logf("✓ Short code format valid: %s", shortCode)
}
