package main

import (
	"io"
	"net/url"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

// Security tests for Security::parseSerializedData()
//
// Verifies that PHP objects are NOT unserialized when reading form data,
// while legitimate serialized arrays continue to work properly.
//
// All tests use record 200 (form_512fa) indicator 43 (multiselect format).
// Pre-seeded data in portal_test_db.sql:
//   indicator 43: O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}
//
// parseSerializedData() rejects any data matching O: or C: object patterns
// and returns null, preventing PHP object injection via deserialization.

// TestSecurity_StandardObjectNotDeserialized verifies that O: format objects
// stored in the database are NOT unserialized when form data is read.
//
// indicator 43 (multiselect) is pre-seeded with: O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}
// On master (VULNERABLE): unserialize() creates stdClass, JSON includes "evil":"payload"
// On security branch (SAFE): parseSerializedData() returns null, no object in JSON
func TestSecurity_StandardObjectNotDeserialized(t *testing.T) {
	// GET api/form/200 goes through getForm() which calls parseSerializedData
	// for multiselect indicators
	got, _ := httpGet(RootURL + `api/form/200`)

	// On master: value = {"evil":"payload"} (deserialized stdClass properties)
	// On security: value is raw string fallback, no JSON key-value for object properties
	if strings.Contains(got, `"evil":"payload"`) {
		t.Errorf("Serialized object (O: format) was DESERIALIZED - 'evil':'payload' found as JSON key-value in response")
	}
}

// TestSecurity_ValidMultiselectStored verifies that legitimate multiselect
// data can be written to record 200 indicator 43 and stored correctly.
func TestSecurity_ValidMultiselectStored(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Add("43[]", "a")
	postData.Add("43[]", "b")

	res, err := client.PostForm(RootURL+`api/form/200`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Valid multiselect write failed. Got = %v, want = %v", got, want)
	}
}

// TestSecurity_ValidMultiselectDeserialized verifies that legitimate serialized
// multiselect arrays are properly deserialized when form data is read.
func TestSecurity_ValidMultiselectDeserialized(t *testing.T) {
	// Write valid multiselect data to indicator 43 on record 200
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Add("43[]", "a")
	postData.Add("43[]", "b")
	postData.Add("43[]", "c & d")

	res, err := client.PostForm(RootURL+`api/form/200`, postData)
	if err != nil {
		t.Error("Error writing multiselect data: " + err.Error())
		return
	}
	bodyBytes, _ := io.ReadAll(res.Body)
	if string(bodyBytes) != `"1"` {
		t.Errorf("Write failed. Got = %v, want = \"1\"", string(bodyBytes))
		return
	}

	// Read back via form query with getData - multiselect values are comma-joined
	got, _ := httpGet(RootURL + `api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"200","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["43"]}&x-filterData=recordID`)

	if !strings.Contains(got, "a, b") {
		t.Errorf("Valid multiselect data not properly deserialized. Expected 'a, b' in response. Got: %v", got)
	}
}
