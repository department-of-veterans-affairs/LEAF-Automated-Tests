package main

import (
	"encoding/json"
	"html"
	"io"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// FormDataResponse represents the actual structure returned by api/form/{recordID}/data
// It's a map where keys are indicatorIDs (as strings) and values are maps of series numbers to field data
type FormDataResponse map[string]map[string]FieldData

type FieldData struct {
	IndicatorID int             `json:"indicatorID"`
	Series      int             `json:"series"`
	Name        string          `json:"name"`
	Format      string          `json:"format"`
	Value       json.RawMessage `json:"value"` // Can be string or array
	Options     []string        `json:"options,omitempty"`
	IsEmpty     bool            `json:"isEmpty"`
}

// GetValueAsString returns the value as a string, handling both string and array cases
func (f *FieldData) GetValueAsString() string {
	// Try to unmarshal as string first
	var str string
	if err := json.Unmarshal(f.Value, &str); err == nil {
		// Decode HTML entities like &quot; and &amp;
		return html.UnescapeString(str)
	}

	// Try as array of strings
	var arr []string
	if err := json.Unmarshal(f.Value, &arr); err == nil {
		if len(arr) > 0 {
			// Decode each element and join with commas
			for i := range arr {
				arr[i] = html.UnescapeString(arr[i])
			}
			joined := strings.Join(arr, ",")
			return joined
		}
		return ""
	}

	// Return raw value as string, decoded
	return html.UnescapeString(string(f.Value))
}

// Helper function to get form data
func getFormData(recordID string) (FormDataResponse, error) {
	res, _ := client.Get(RootURL + `api/form/` + recordID + `/data`)
	b, _ := io.ReadAll(res.Body)

	var m FormDataResponse
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		return nil, err
	}
	return m, nil
}

// Helper function to create a new form request
func createFormRequest(title string, categoryName string) (string, error) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("title", title)
	postData.Set("num"+categoryName, "1")

	res, err := client.PostForm(RootURL+`api/form/new`, postData)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)

	var recordID string
	err = json.Unmarshal(body, &recordID)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(body))
		return "", err
	}

	return recordID, nil
}

// Helper function to save form field data
func saveFormField(recordID string, indicatorID string, value string) error {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set(indicatorID, value)

	res, err := client.PostForm(RootURL+`api/form/`+recordID, postData)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	return nil
}

// TestSerialization_MultiselectStoredAsJSON verifies multiselect data is stored as JSON
func TestSerialization_MultiselectStoredAsJSON(t *testing.T) {
	recordID, err := createFormRequest("Test Multiselect JSON Storage", "form_7664a")
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Fill in multiselect field (indicatorID 27 is multiselect in form_7664a)
	multiselectData := []string{"apple", "banana", "pineapple"}
	multiselectJSON, _ := json.Marshal(multiselectData)

	err = saveFormField(recordID, "27", string(multiselectJSON))
	if err != nil {
		t.Fatalf("Failed to save multiselect data: %v", err)
	}

	// Retrieve and verify
	formData, err := getFormData(recordID)
	if err != nil {
		t.Fatalf("Failed to retrieve form: %v", err)
	}

	// Access the multiselect field: formData["27"]["1"]
	if fieldMap, ok := formData["27"]; ok {
		if field, ok := fieldMap["1"]; ok {
			got := field.GetValueAsString()

			// Check it's NOT PHP serialized
			if strings.HasPrefix(got, "a:") || strings.HasPrefix(got, "O:") {
				t.Errorf("CRITICAL: Multiselect stored as PHP serialized data: %s", got)
			}

			// Verify valid JSON
			var result []string
			err = json.Unmarshal([]byte(got), &result)
			if err != nil {
				t.Errorf("Multiselect value is not valid JSON: %v, value: %s", err, got)
			}

			if len(result) != 3 {
				t.Errorf("Expected 3 multiselect options, got %d", len(result))
			}

			t.Logf("✓ Multiselect stored as valid JSON: %s", got)
		} else {
			t.Error("Multiselect field series '1' not found")
		}
	} else {
		t.Error("Multiselect field (indicatorID 27) not found in form response")
	}
}

// TestSerialization_CheckboxesStoredAsJSON verifies checkbox data is stored as JSON
func TestSerialization_CheckboxesStoredAsJSON(t *testing.T) {
	recordID, err := createFormRequest("Test Checkboxes JSON Storage", "form_7664a")
	if err != nil {
		t.Fatalf("Failed to create request: %v", err)
	}

	// Fill in checkboxes field (indicatorID 26 is checkboxes in form_7664a)
	checkboxData := []string{"A & B", "C & D"}
	checkboxJSON, _ := json.Marshal(checkboxData)

	err = saveFormField(recordID, "26", string(checkboxJSON))
	if err != nil {
		t.Fatalf("Failed to save checkbox data: %v", err)
	}

	// Retrieve and verify
	formData, err := getFormData(recordID)
	if err != nil {
		t.Fatalf("Failed to retrieve form: %v", err)
	}

	// Access the checkboxes field: formData["26"]["1"]
	if fieldMap, ok := formData["26"]; ok {
		if field, ok := fieldMap["1"]; ok {
			got := field.GetValueAsString()

			// Check it's NOT PHP serialized
			if strings.HasPrefix(got, "a:") || strings.HasPrefix(got, "O:") {
				t.Errorf("CRITICAL: Checkboxes stored as PHP serialized data: %s", got)
			}

			// Verify valid JSON
			var result []string
			err = json.Unmarshal([]byte(got), &result)
			if err != nil {
				t.Errorf("Checkbox value is not valid JSON: %v, value: %s", err, got)
			}

			if len(result) != 2 {
				t.Errorf("Expected 2 checkbox selections, got %d", len(result))
			}

			t.Logf("✓ Checkboxes stored as valid JSON: %s", got)
		} else {
			t.Error("Checkboxes field series '1' not found")
		}
	} else {
		t.Error("Checkboxes field (indicatorID 26) not found in form response")
	}
}

// TestSerialization_DataRoundTrip verifies data can be stored and retrieved correctly
func TestSerialization_DataRoundTrip(t *testing.T) {
	testCases := []struct {
		name        string
		indicatorID string
		inputData   interface{}
	}{
		{
			name:        "Multiselect",
			indicatorID: "27",
			inputData:   []string{"apple", "banana", "cherry"},
		},
		{
			name:        "Checkboxes",
			indicatorID: "26",
			inputData:   []string{"A & B"},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Create request
			recordID, _ := createFormRequest("Round Trip Test: "+tc.name, "form_7664a")

			// Store data
			inputJSON, _ := json.Marshal(tc.inputData)
			saveFormField(recordID, tc.indicatorID, string(inputJSON))

			// Retrieve data
			formData, _ := getFormData(recordID)

			// Find and verify the field
			if fieldMap, ok := formData[tc.indicatorID]; ok {
				if field, ok := fieldMap["1"]; ok {
					got := field.GetValueAsString()

					// Parse the JSON
					var output interface{}
					err := json.Unmarshal([]byte(got), &output)
					if err != nil {
						t.Errorf("%s: Failed to parse value as JSON: %v", tc.name, err)
						return
					}

					// Compare input and output
					outputJSON, _ := json.Marshal(output)
					if string(inputJSON) != string(outputJSON) {
						t.Errorf("%s: Data did not round-trip correctly\nInput:  %s\nOutput: %s",
							tc.name, string(inputJSON), string(outputJSON))
					} else {
						t.Logf("✓ %s: Data round-tripped successfully", tc.name)
					}
				} else {
					t.Errorf("%s: Field series '1' not found", tc.name)
				}
			} else {
				t.Errorf("%s: Field with indicatorID %s not found in response", tc.name, tc.indicatorID)
			}
		})
	}
}

// TestSerialization_EmailQueueStoredAsJSON verifies email queue files are JSON, not serialized
func TestSerialization_EmailQueueStoredAsJSON(t *testing.T) {
	// Check email queue directory for JSON files
	emailQueueDir := "./UPLOADS/email/"
	files, err := os.ReadDir(emailQueueDir)
	if err != nil {
		t.Skipf("Email queue directory not accessible: %v", err)
		return
	}

	if len(files) == 0 {
		t.Log("No email queue files found - this is expected if emails are processed immediately")
		return
	}

	// Check the most recent email queue file
	jsonFileFound := false
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filePath := filepath.Join(emailQueueDir, file.Name())
		content, err := os.ReadFile(filePath)
		if err != nil {
			continue
		}

		// Check if it's JSON (starts with { or [)
		trimmed := strings.TrimSpace(string(content))
		if strings.HasPrefix(trimmed, "{") || strings.HasPrefix(trimmed, "[") {
			// Try to parse as JSON
			var emailData map[string]interface{}
			err = json.Unmarshal(content, &emailData)
			if err == nil {
				jsonFileFound = true
				t.Logf("✓ Found JSON email queue file: %s", file.Name())

				// Verify expected fields
				if _, ok := emailData["recipient"]; !ok {
					t.Error("Email JSON missing 'recipient' field")
				}
				if _, ok := emailData["subject"]; !ok {
					t.Error("Email JSON missing 'subject' field")
				}
				if _, ok := emailData["body"]; !ok {
					t.Error("Email JSON missing 'body' field")
				}
			}
		} else if strings.HasPrefix(trimmed, "a:") || strings.HasPrefix(trimmed, "O:") {
			t.Errorf("CRITICAL: Email queue file %s is PHP serialized, not JSON", file.Name())
		}
	}

	if !jsonFileFound {
		t.Log("Note: No JSON email queue files verified (may be processed immediately)")
	}
}