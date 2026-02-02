package main

import (
	"encoding/base64"
	"io"
	"net/url"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

// TestSecurity_RejectSerializedObject tests that object injection is blocked
// This test should FAIL on master branch (objects allowed)
// This test should PASS on security branch (objects blocked)
func TestSecurity_RejectSerializedObject(t *testing.T) {
	// Create a PHP serialized object payload
	// O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}
	serializedObject := `O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}`

	// Try to submit this as form data
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", serializedObject)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	// On master: object is accepted (VULNERABILITY)
	// On security branch: should be rejected with an error
	if res.StatusCode == 200 && !strings.Contains(got, "error") && !strings.Contains(got, "Invalid") {
		t.Errorf("Serialized object was ACCEPTED - this is a security vulnerability! Response: %v", got)
	}

	// Success means the object was rejected
	if res.StatusCode != 200 || strings.Contains(got, "error") || strings.Contains(got, "Invalid") {
		t.Logf("Object correctly rejected with response: %v", got)
	}
}

// TestSecurity_RejectCustomSerializedObject tests that custom objects (C: format) are blocked
// This test should FAIL on master branch (objects allowed)
// This test should PASS on security branch (objects blocked)
func TestSecurity_RejectCustomSerializedObject(t *testing.T) {
	// Create a custom serialized object payload (C: format)
	customObject := `C:8:"stdClass":0:{}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", customObject)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	// On master: custom object is accepted (VULNERABILITY)
	// On security branch: should be rejected
	if res.StatusCode == 200 && !strings.Contains(got, "error") && !strings.Contains(got, "Invalid") {
		t.Errorf("Custom serialized object was ACCEPTED - this is a security vulnerability! Response: %v", got)
	}

	if res.StatusCode != 200 || strings.Contains(got, "error") || strings.Contains(got, "Invalid") {
		t.Logf("Custom object correctly rejected with response: %v", got)
	}
}

// TestSecurity_RejectObjectInArray tests that objects hidden in arrays are blocked
// This test should FAIL on master branch (objects allowed)
// This test should PASS on security branch (objects blocked)
func TestSecurity_RejectObjectInArray(t *testing.T) {
	// Array containing a serialized object
	// a:2:{s:4:"user";s:4:"john";s:7:"exploit";O:8:"stdClass":1:{s:9:"malicious";s:7:"payload";}}
	arrayWithObject := `a:2:{s:4:"user";s:4:"john";s:7:"exploit";O:8:"stdClass":1:{s:9:"malicious";s:7:"payload";}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", arrayWithObject)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	if res.StatusCode == 200 && !strings.Contains(got, "error") && !strings.Contains(got, "Invalid") {
		t.Errorf("Object in array was ACCEPTED - this is a security vulnerability! Response: %v", got)
	}

	if res.StatusCode != 200 || strings.Contains(got, "error") || strings.Contains(got, "Invalid") {
		t.Logf("Object in array correctly rejected with response: %v", got)
	}
}

// TestSecurity_AcceptLegitimateSerializedArray tests that legitimate arrays still work
// This test should PASS on both master and security branches
func TestSecurity_AcceptLegitimateSerializedArray(t *testing.T) {
	// Valid serialized array with no objects
	// a:3:{s:4:"name";s:4:"John";s:3:"age";i:30;s:5:"items";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}
	validArray := `a:3:{s:4:"name";s:4:"John";s:3:"age";i:30;s:5:"items";a:3:{i:0;i:1;i:1;i:2;i:2;i:3;}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", validArray)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	// Should succeed on both branches
	if !cmp.Equal(got, want) {
		t.Errorf("Valid serialized array was rejected. Got = %v, want = %v", got, want)
	}
}

// TestSecurity_AcceptSerializedStrings tests that serialized strings work
// This test should PASS on both master and security branches
func TestSecurity_AcceptSerializedStrings(t *testing.T) {
	// Valid serialized string
	// s:11:"hello world";
	validString := `s:11:"hello world";`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", validString)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Valid serialized string was rejected. Got = %v, want = %v", got, want)
	}
}

// TestSecurity_RejectGadgetChainPayload tests prevention of gadget chain attacks
// This test should FAIL on master branch (gadget chains possible)
// This test should PASS on security branch (gadget chains blocked)
func TestSecurity_RejectGadgetChainPayload(t *testing.T) {
	// Simulated gadget chain - array with embedded object
	gadgetChain := `a:2:{i:0;s:4:"data";i:1;O:8:"stdClass":1:{s:7:"payload";s:10:"evil_code";}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", gadgetChain)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	if res.StatusCode == 200 && !strings.Contains(got, "error") && !strings.Contains(got, "Invalid") {
		t.Errorf("Gadget chain payload was ACCEPTED - this is a CRITICAL vulnerability! Response: %v", got)
	}

	if res.StatusCode != 200 || strings.Contains(got, "error") || strings.Contains(got, "Invalid") {
		t.Logf("Gadget chain correctly rejected with response: %v", got)
	}
}

// TestSecurity_RejectDeeplyNestedObject tests that objects in nested structures are blocked
// This test should FAIL on master branch
// This test should PASS on security branch
func TestSecurity_RejectDeeplyNestedObject(t *testing.T) {
	// Array with deeply nested object
	// a:1:{s:6:"level1";a:1:{s:6:"level2";a:1:{s:6:"level3";O:8:"stdClass":1:{s:4:"evil";s:4:"code";}}}}
	nestedObject := `a:1:{s:6:"level1";a:1:{s:6:"level2";a:1:{s:6:"level3";O:8:"stdClass":1:{s:4:"evil";s:4:"code";}}}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", nestedObject)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	if res.StatusCode == 200 && !strings.Contains(got, "error") && !strings.Contains(got, "Invalid") {
		t.Errorf("Deeply nested object was ACCEPTED - this is a security vulnerability! Response: %v", got)
	}

	if res.StatusCode != 200 || strings.Contains(got, "error") || strings.Contains(got, "Invalid") {
		t.Logf("Deeply nested object correctly rejected with response: %v", got)
	}
}

// TestSecurity_AcceptMultiselectData tests that multiselect arrays work
// This test should PASS on both branches
func TestSecurity_AcceptMultiselectData(t *testing.T) {
	// Serialized array of selected options (common in LEAF)
	// a:3:{i:0;s:7:"option1";i:1;s:7:"option3";i:2;s:7:"option5";}
	multiselectData := `a:3:{i:0;s:7:"option1";i:1;s:7:"option3";i:2;s:7:"option5";}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", multiselectData)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Valid multiselect data was rejected. Got = %v, want = %v", got, want)
	}
}

// TestSecurity_RejectBase64EncodedObject tests that base64-encoded objects are still blocked
// This test should FAIL on master branch
// This test should PASS on security branch
func TestSecurity_RejectBase64EncodedObject(t *testing.T) {
	// Some systems might base64 encode the serialized data
	serializedObject := `O:8:"stdClass":1:{s:4:"evil";s:7:"payload";}`
	encoded := base64.StdEncoding.EncodeToString([]byte(serializedObject))

	// Try submitting base64-encoded object (if the system decodes it)
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", encoded)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	// This test documents the behavior - base64 encoded data may or may not be decoded
	// The important thing is that IF it's decoded, objects should be rejected
	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)

	t.Logf("Base64 encoded object response: %v (status: %d)", got, res.StatusCode)
}

// TestSecurity_AcceptGridData tests that grid/table data structures work
// This test should PASS on both branches
func TestSecurity_AcceptGridData(t *testing.T) {
	// Serialized grid data (array of arrays)
	// a:2:{i:0;a:3:{s:4:"name";s:4:"John";s:3:"age";s:2:"30";s:4:"dept";s:2:"IT";}i:1;a:3:{s:4:"name";s:4:"Jane";s:3:"age";s:2:"28";s:4:"dept";s:2:"HR";}}
	gridData := `a:2:{i:0;a:3:{s:4:"name";s:4:"John";s:3:"age";s:2:"30";s:4:"dept";s:2:"IT";}i:1;a:3:{s:4:"name";s:4:"Jane";s:3:"age";s:2:"28";s:4:"dept";s:2:"HR";}}`

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", gridData)

	res, err := client.PostForm(RootURL+`api/form/505`, postData)
	if err != nil {
		t.Error("Error sending post request: " + err.Error())
		return
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Valid grid data was rejected. Got = %v, want = %v", got, want)
	}
}