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
// while legitimate serialized arrays continue to work properly, and
// malformed serialized data returns the same fallback as unserialize().
//
// Record 200 (form_512fa): tests object injection and valid data round-trips.
// Pre-seeded data in portal_test_db.sql:
//   indicator 48: grid data with O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}
//   nested inside cells -> row 1 -> cell 1 (multi-line cell position)
//
// Record 201 (form_512fa): tests malformed/truncated serialized data.
// Pre-seeded data in portal_test_db.sql:
//   indicator 48: truncated serialized grid array
//   indicator 43: truncated serialized multiselect array
//
// parseSerializedData() rejects any data matching O: or C: object patterns
// and returns null, preventing PHP object injection via deserialization.

// TestSecurity_StandardObjectNotDeserialized verifies that O: format objects
// nested deep within grid serialized data are NOT unserialized when form data is read.
//
// indicator 48 (grid) is pre-seeded with a stdClass object nested inside the cells array.
func TestSecurity_StandardObjectNotDeserialized(t *testing.T) {
	// Use rawIndicator endpoint which calls getIndicator() directly.
	got, _ := httpGet(RootURL + `api/form/200/rawIndicator/48/1`)

	if strings.Contains(got, `"evil":"payload"`) {
		t.Errorf("Serialized object (O: format) was DESERIALIZED - 'evil':'payload' found as JSON key-value in response")
	}
}

// TestSecurity_ValidGridDeserialized verifies that legitimate grid data can be
// written to record 200 indicator 48 and deserialized correctly when read back.
// This runs after the injection test to overwrite the malicious seed data.
func TestSecurity_ValidGridDeserialized(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("48[cells][0][0]", "test single line")
	postData.Set("48[cells][0][1]", "test\nmulti\nline")
	postData.Set("48[cells][0][2]", "09/17/2025")
	postData.Set("48[cells][0][3]", "1")
	postData.Set("48[cells][1][0]", "test single line 2")
	postData.Set("48[cells][1][1]", "test\nmulti\nline 2")
	postData.Set("48[cells][1][2]", "12/05/2025")
	postData.Set("48[cells][1][3]", "2")
	postData.Set("48[names][0]", "single line cell")
	postData.Set("48[names][1]", "multi-line cell")
	postData.Set("48[names][2]", "date cell")
	postData.Set("48[names][3]", "dropdown cell")
	postData.Set("48[names][4]", " ")
	postData.Set("48[columns][0]", "col_2872")
	postData.Set("48[columns][1]", "col_ff50")
	postData.Set("48[columns][2]", "col_8d19")
	postData.Set("48[columns][3]", "col_58bf")

	res, err := client.PostForm(RootURL+`api/form/200`, postData)
	if err != nil {
		t.Error("Error writing grid data: " + err.Error())
		return
	}
	bodyBytes, _ := io.ReadAll(res.Body)
	if string(bodyBytes) != `"1"` {
		t.Errorf("Grid write failed. Got = %v, want = \"1\"", string(bodyBytes))
		return
	}

	// Read back via form query with getData
	got, _ := httpGet(RootURL + `api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"200","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["48"]}&x-filterData=recordID`)

	if !strings.Contains(got, "test single line") {
		t.Errorf("Valid grid data not properly deserialized. Expected 'test single line' in response. Got: %v", got)
	}
	if !strings.Contains(got, "gridInput") {
		t.Errorf("Valid grid data missing gridInput structure. Got: %v", got)
	}
	if !strings.Contains(got, "col_2872") {
		t.Errorf("Valid grid data missing column definitions. Got: %v", got)
	}
}

// TestSecurity_MalformedGridReturnsFallback verifies that malformed (truncated)
// serialized grid data is handled gracefully. The behavior must match the old
// unserialize() behavior: malformed data fails to parse, so the grid returns
// format metadata only with no cell data (empty displayedValue).
//
// Record 201 indicator 48 is pre-seeded with a truncated serialized array.
func TestSecurity_MalformedGridReturnsFallback(t *testing.T) {
	// Read via rawIndicator - getIndicator() deserializes grid data
	got, _ := httpGet(RootURL + `api/form/201/rawIndicator/48/1`)

	// Malformed data should NOT cause an error response - the endpoint should still return
	if got == "" {
		t.Errorf("Malformed grid data caused empty response, expected graceful fallback")
		return
	}

	// The grid format metadata should still be present (parsed from indicator definition, not data)
	if !strings.Contains(got, "col_2872") {
		t.Errorf("Grid format metadata missing from malformed data fallback. Got: %v", got)
	}

	// displayedValue should have format info but no cell data since deserialization failed.
	// On both master (unserialize returns false) and this branch (parseSerializedData returns null),
	// $values is not an array so it gets set to [] and displayedValue = {format: ...}.
	// The raw value field will still contain the malformed string (expected fallback behavior),
	// but gridInput (which indicates successfully parsed cell data) should NOT be present.
	if strings.Contains(got, "gridInput") {
		t.Errorf("Malformed serialized data should not have produced gridInput. Got: %v", got)
	}
}

// TestSecurity_MalformedMultiselectReturnsFallback verifies that malformed (truncated)
// serialized multiselect data falls back to CSV splitting, matching old unserialize() behavior.
// On both master (unserialize returns false) and this branch (parseSerializedData returns null),
// the code falls back to preg_split on the raw string, so the output is the same.
//
// Record 201 indicator 43 is pre-seeded with a truncated serialized array.
func TestSecurity_MalformedMultiselectReturnsFallback(t *testing.T) {
	got, _ := httpGet(RootURL + `api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"201","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["43"]}&x-filterData=recordID`)

	// Should not be empty - the endpoint should return a response with record data
	if got == "" {
		t.Errorf("Malformed multiselect data caused empty response")
		return
	}

	// The response should contain a record - deserialization failure should not suppress the record
	if !strings.Contains(got, `"201"`) {
		t.Errorf("Record 201 missing from response. Malformed data may have caused record to be suppressed. Got: %v", got)
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
