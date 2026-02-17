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
// All tests use record 200 (form_512fa) indicator 48 (grid format).
// Pre-seeded data in portal_test_db.sql:
//   indicator 48: grid data with O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}
//   nested inside cells -> row 1 -> cell 1 (multi-line cell position)
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
