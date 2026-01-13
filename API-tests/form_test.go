package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestForm_Version(t *testing.T) {
	got, _ := httpGet(RootURL + "api/form/version")
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("form version = %v, want = %v", got, want)
	}
}

func TestForm_AdminCanEditData(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/505`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Admin got = %v, want = %v", got, want)
	}
}

func TestForm_ElicitCSRFFailure(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", "definitely the wrong token")
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/505`, postData)
	got := res.StatusCode
	want := 401

	if !cmp.Equal(got, want) {
		t.Errorf("Admin got = %v, want = %v", got, want)
	}
}

func TestForm_ElicitCSRFFailure_null_csrf(t *testing.T) {
	postData := url.Values{}
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/505`, postData)
	got := res.StatusCode
	want := 401

	if !cmp.Equal(got, want) {
		t.Errorf("Admin got = %v, want = %v", got, want)
	}
}

func TestForm_NonadminCannotEditData(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/505?masquerade=nonAdmin`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"No write access (data field)"`

	if !cmp.Equal(got, want) {
		t.Errorf("Non-admin got = %v, want = %v", got, want)
	}

	if res.StatusCode != 401 {
		t.Errorf("Non-admin got status code = %v, want = %v", res.StatusCode, 401)
	}
}

func TestForm_NeedToKnowDataReadAccess(t *testing.T) {
	got, res := httpGet(RootURL + "api/form/505/data?masquerade=nonAdmin")
	if !cmp.Equal(res.StatusCode, 200) {
		t.Errorf("./api/form/505/data?masquerade=nonAdmin Status Code = %v, want = %v", res.StatusCode, 200)
	}
	want := `[]`
	if !cmp.Equal(got, want) {
		t.Errorf("Non-admin, non actor should not have read access to need to know record. got = %v, want = %v", got, want)
	}
}

func TestForm_RequestFollowupAllowCaseInsensitiveUserID(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/7?masquerade=nonAdmin`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`

	if !cmp.Equal(got, want) {
		t.Errorf("Non-admin got = %v, want = %v", got, want)
	}
}

func TestForm_WorkflowIndicatorAssigned(t *testing.T) {
	got, res := httpGet(RootURL + "api/form/508/workflow/indicator/assigned")

	if !cmp.Equal(res.StatusCode, 200) {
		t.Errorf("./api/form/508/workflow/indicator/assigned Status Code = %v, want = %v", res.StatusCode, 200)
	}

	want := `[]`
	if !cmp.Equal(got, want) {
		t.Errorf("./api/form/508/workflow/indicator/assigned = %v, want = %v", got, want)
	}
}

func TestForm_IsMaskable(t *testing.T) {
	res, _ := httpGet(RootURL + "api/form/_form_ce46b")

	var m FormCategoryResponse
	err := json.Unmarshal([]byte(res), &m)
	if err != nil {
		t.Error(err)
	}

	if m[0].IsMaskable != nil {
		t.Errorf("./api/form/_form_ce46b isMaskable = %v, want = %v", m[0].IsMaskable, nil)
	}

	res, _ = httpGet(RootURL + "api/form/_form_ce46b?context=formEditor")

	err = json.Unmarshal([]byte(res), &m)
	if err != nil {
		t.Error(err)
	}

	if *m[0].IsMaskable != 0 {
		t.Errorf("./api/form/_form_ce46b?context=formEditor isMaskable = %v, want = %v", m[0].IsMaskable, "0")
	}
}

func TestForm_NonadminCannotCancelOwnSubmittedRecord(t *testing.T) {
	// Setup conditions
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("numform_5ea07", "1")
	postData.Set("title", "TestForm_NonadminCannotCancelOwnSubmittedRecord")
	postData.Set("8", "1")
	postData.Set("9", "112")

	// TODO: streamline this
	res, _ := client.PostForm(RootURL+`api/form/new`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	var response string
	json.Unmarshal(bodyBytes, &response)
	recordID, err := strconv.Atoi(string(response))

	if err != nil {
		t.Error("Could not create record for TestForm_NonadminCannotCancelOwnSubmittedRecord: " + err.Error())
	}

	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	client.PostForm(RootURL+`api/form/`+strconv.Itoa(recordID)+`/submit`, postData)

	// Non-admin shouldn't be able to cancel a submitted record
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)

	res, _ = client.PostForm(RootURL+`api/form/`+strconv.Itoa(recordID)+`/cancel?masquerade=nonAdmin`, postData)
	bodyBytes, _ = io.ReadAll(res.Body)
	json.Unmarshal(bodyBytes, &response)
	got := response

	if got == "1" {
		t.Errorf("./api/form/[recordID]/cancel got = %v, want = %v", got, "An error message")
	}
}

func TestForm_FilterChildkeys(t *testing.T) {
	res, _ := httpGet(RootURL + "api/form/9/data/tree?x-filterData=child.name")

	var m FormCategoryResponse
	err := json.Unmarshal([]byte(res), &m)
	if err != nil {
		t.Error(err)
	}

	if m[0].Child[4].Name == "" {
		t.Errorf("./api/form/9/data/tree?x-filterData=child.name child[4].name = %v, want = %v", m[0].Child[4].Name, "")
	}

	if m[0].Child[4].IndicatorID != 0 {
		t.Errorf("./api/form/9/data/tree?x-filterData=child.name child[4].indicatorID = %v, want = %v", m[0].Child[4].IndicatorID, "undefined")
	}
}

func TestForm_GetProgress_ReturnValue(t *testing.T) {
	/* Setup form_7664a, with staple form_dac2a.
	form_7664a has 11 required questions with different formats (format influences logic).
	17p controls 18c.  18c has subquestions 19, 20.  18 is visible if 17 is '2' or '3'
	22p controls 23c.  23c has subquestions 24, 25, (26p, 27c, 28). 23 is visible if 22 is >= '42'
	-26p controls 27c.  27c has subquestion 28. 27 is visible if 26 includes 'E & "F"'
	form_dac2a has 2 required questions
	30p (not required) controls 31c.  31c has subquestion 32.  31 is visisble if 30p is 2 or 3
	Format information is noted when data is posted  */

	//create the new request and get the recordID for progress and domodify urls, check intial progress.
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("numform_7664a", "1")
	postData.Set("title", "TestForm_GetProgressChecking")

	res, _ := client.PostForm(RootURL+`api/form/new`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	var response string
	json.Unmarshal(bodyBytes, &response)
	recordID := string(response)

	urlGetProgress := RootURL + "api/form/" + recordID + "/progress"
	urlPostDoModify := RootURL + "api/form/" + recordID

	got, res := httpGet(urlGetProgress)
	if !cmp.Equal(res.StatusCode, 200) {
		t.Errorf(urlGetProgress+", Status Code = %v, want = %v", res.StatusCode, 200)
		return
	}
	want := `"0"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 2 visible required questions with values that keep subquestions hidden
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("17", "1") //dropdown 1,2,3
	res, err := client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"50"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("22", "10") //numeric
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 17 to display 18,19,20 (2/5)
	//Both 2 and 3 should result in shown state.  Both triggers configured on same condition entry.
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("17", "2") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"40"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	//refill 17 with other trigger 3, percentage should not change
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("17", "3") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"40"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill new visible required questions (3/5, 4/5, 5/5)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("18", "A") //radio A, B, C
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"60"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("19", "2") //currency
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"80"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("20", "test") //single text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 22 to display 23,24,25,26 (5/9)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("22", "42") //numeric
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"56"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill new visible required questions (6/9, 7/9, 8/9, 9/9)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("23", "1") //orgchart employee
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"67"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("24", "12/04/2024") //date
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"78"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("25", "test") //multiline text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"89"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("26", "A & B") //checkboxes A & B, C & D, E & "F"
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 26 to display 27, 28 (9/11)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("26", `E & "F"`) //checkboxes A & B, C & D, E & "F"
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"82"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill new visible required questions (10/11, 11/11)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("27", "apple") //multiselect apple, orange, banana, pineapple, avocado
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"91"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("28", "test") //checkbox, label is 'test'
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill staple 30 to display 31c, 32 (11/13)
	//show triggered by 2 or 3. Two individual conditions.
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("30", "2") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"85"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	//refill 30 with show trigger 3
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("30", "3") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"85"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	//refill/hide 30 with non trigger 1
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("30", "1") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	//order should not matter - repeat 3 + 2
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("30", "3") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"85"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("30", "2") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"85"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("31", "test 31") //text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"92"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("32", "test 32") //text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}
}

// If a stapled form is assocated with more than one parent form, the indicator list should not contain duplicate indicators
func TestForm_DuplicateIndicatorsInIndicatorListWithFormFilter(t *testing.T) {
	res, _ := httpGet(RootURL + "api/form/indicator/list?includeHeadings=1&forms=form_2ca98,form_5ea07,form_7664a,form_512fa,form_ce46b")
	var list FormIndicatorList

	err := json.Unmarshal([]byte(res), &list)
	if err != nil {
		t.Error(err)
	}

	count := 0
	for _, field := range list {
		if field.IndicatorID == 31 {
			count++
		}
	}

	if count > 1 {
		t.Errorf("Got %v instances of indicatorID 31, want 1 instance", count)
	}
}

// Helper function to get form data
func getFormData(recordID string) (FormDataResponse, error) {
	res, err := client.Get(RootURL + `api/form/` + recordID + `/data`)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	b, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	// Check if response is an empty array (PHP returns [] when no data)
	trimmed := strings.TrimSpace(string(b))
	if trimmed == "[]" {
		return make(FormDataResponse), nil
	}

	var m FormDataResponse
	err = json.Unmarshal(b, &m)
	if err != nil {
		return nil, err
	}
	return m, nil
}

// FindField finds a field in FormDataResponse by indicatorID and series
func (fdr FormDataResponse) FindField(indicatorID int, series int) *FieldData {
	indicatorIDStr := strconv.Itoa(indicatorID)
	seriesStr := strconv.Itoa(series)

	if fieldMap, ok := fdr[indicatorIDStr]; ok {
		if field, ok := fieldMap[seriesStr]; ok {
			return &field
		}
	}
	return nil
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

	// Read response to check for errors
	body, _ := io.ReadAll(res.Body)

	// Check if response indicates success
	if res.StatusCode != 200 {
		return fmt.Errorf("save failed with status %d: %s", res.StatusCode, string(body))
	}

	return nil
}

// TestSerialization_LegacyDataDecoding verifies that legacy PHP serialized data is still readable
// Uses recordID 123 which has existing serialized data
func TestSerialization_LegacyDataDecoding(t *testing.T) {
	recordID := "123"

	// Retrieve form data that may contain legacy serialized data
	formData, err := getFormData(recordID)
	if err != nil {
		t.Fatalf("Failed to retrieve form with legacy data: %v", err)
	}

	// Count how many fields we successfully decoded
	decodedCount := 0
	errorCount := 0

	// Check all fields in the form
	for indicatorIDStr, fieldMap := range formData {
		for seriesStr, field := range fieldMap {
			value := field.GetValueAsString()

			// If it looks like it might be array data (has commas or is JSON)
			if strings.Contains(value, ",") || strings.HasPrefix(value, "[") {
				// Get decoded value for JSON parsing
				decodedValue, err := field.GetValueAsJSON()
				if err != nil {
					t.Errorf("Failed to get value as JSON for indicatorID=%s series=%s: %v", indicatorIDStr, seriesStr, err)
					continue
				}

				// Try to decode it
				var result interface{}
				err = json.Unmarshal([]byte(decodedValue), &result)
				if err == nil {
					decodedCount++
				} else {
					// If it's not JSON, it might be legacy serialized or just a regular string with commas
					if strings.HasPrefix(decodedValue, "a:") {
						errorCount++
						t.Errorf("❌ Legacy serialized data not decoded for indicatorID=%s series=%s: %s", indicatorIDStr, seriesStr, decodedValue)
					}
				}
			}
		}
	}

	if errorCount > 0 {
		t.Errorf("Found %d fields with legacy serialized data that wasn't properly decoded", errorCount)
	}
}

// TestSerialization_DataRoundTrip verifies data can be stored and retrieved correctly
// This is a basic sanity test that should pass on both branches
func TestSerialization_DataRoundTrip(t *testing.T) {
	recordID := "123"

	// Find a multiselect or checkboxes field
	formData, err := getFormData(recordID)
	if err != nil {
		t.Fatalf("Failed to retrieve form: %v", err)
	}

	var testIndicatorIDStr string
	var testIndicatorIDInt int
	for indicatorIDStr, fieldMap := range formData {
		for _, field := range fieldMap {
			if field.Format == "multiselect" || field.Format == "checkboxes" {
				testIndicatorIDStr = indicatorIDStr
				testIndicatorIDInt = field.IndicatorID
				break
			}
		}
		if testIndicatorIDStr != "" {
			break
		}
	}

	if testIndicatorIDStr == "" {
		t.Skip("No multiselect or checkboxes field found")
		return
	}

	// Simple test data
	testData := []string{"option1", "option2", "option3"}
	inputJSON, _ := json.Marshal(testData)

	// Store data
	err = saveFormField(recordID, testIndicatorIDStr, string(inputJSON))
	if err != nil {
		t.Fatalf("Failed to save data: %v", err)
	}

	// Retrieve data
	formData, err = getFormData(recordID)
	if err != nil {
		t.Fatalf("Failed to retrieve data: %v", err)
	}

	// Verify the field
	field := formData.FindField(testIndicatorIDInt, 1)
	if field == nil {
		t.Fatalf("Field with indicatorID %d not found in response", testIndicatorIDInt)
	}

	got, err := field.GetValueAsJSON()
	if err != nil {
		t.Fatalf("Failed to get value as JSON: %v", err)
	}

	// Parse and verify
	var output []string
	err = json.Unmarshal([]byte(got), &output)
	if err != nil {
		t.Errorf("Failed to parse value as JSON: %v", err)
		return
	}

	// Verify exact match
	if len(output) != len(testData) {
		t.Errorf("Length mismatch - expected %d, got %d", len(testData), len(output))
	}

	for i, expected := range testData {
		if i >= len(output) {
			t.Errorf("Missing value at index %d", i)
			continue
		}
		if output[i] != expected {
			t.Errorf("Value mismatch at index %d: expected %q, got %q", i, expected, output[i])
		}
	}
}