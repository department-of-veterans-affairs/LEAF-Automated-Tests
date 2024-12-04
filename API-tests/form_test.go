package main

import (
	"encoding/json"
	"io"
	"net/url"
	"strconv"
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

func TestForm_NonadminCannotEditData(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("3", "12345")

	res, _ := client.PostForm(RootURL+`api/form/505?masquerade=nonAdmin`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"0"`

	if !cmp.Equal(got, want) {
		t.Errorf("Non-admin got = %v, want = %v", got, want)
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
		t.Errorf("Could not create record for TestForm_NonadminCannotCancelOwnSubmittedRecord: " + err.Error())
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
	/*
	Setup form_7664a. 11 required questions with different formats (format influences logic).
	19 controls 20, which has subquestions 21, 22.  visible if 19 is '2'
	23 controls 24, which has subquestions 25, 26.  visible if 23 is >= '42'
	27 controls 28, which has subquestion 29. visible if 27 includes 'E & "F"'
	Format information is noted when data is posted  */

	//create the new request and get the recordID for progress and domodify urls, check intial progress.
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("numform_7664a", "1")
	postData.Set("title", "TestForm_GetProgressChecking")

	res, _ := client.PostForm(RootURL + `api/form/new`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)
	var response string
	json.Unmarshal(bodyBytes, &response)
	recordID := string(response)

	urlGetProgress := RootURL + "api/form/" + recordID + "/progress"
	urlPostDoModify := RootURL + "api/form/" + recordID

	got, res := httpGet(urlGetProgress)
	if !cmp.Equal(res.StatusCode, 200) {
		t.Errorf(urlGetProgress + ", Status Code = %v, want = %v", res.StatusCode, 200)
		return
	}
	want := `"0"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 3 visible required questions with values that keep subquestions hidden
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("19", "1") //dropdown 1,2,3
	res, err := client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"33"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("23", "10") //numeric
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
	postData.Set("27", "A & B") //checkboxes A & B, C & D, E & "F"
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}


	//fill 19 to display 20,21,22 (3/6)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("19", "2") //dropdown 1,2,3
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"50"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill new visible required questions (4/6, 5/6, 6/6)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("20", "A") //radio A, B, C
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
	postData.Set("21", "2") //currency
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"83"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("22", "test")  //single text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}


	//fill 23 to display 24,25,26 (6/9)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("23", "42") //numeric
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"67"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill new visible required questions (7/9, 8/9, 9/9)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("24", "1") //orgchart employee
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
	postData.Set("25", "12/04/2024") //date
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
	postData.Set("26", "test")  //multiline text
	res, err = client.PostForm(urlPostDoModify, postData)
	if err != nil {
		t.Error(urlPostDoModify + "Error sending post request")
	}
	got, res = httpGet(urlGetProgress)
	want = `"100"`
	if !cmp.Equal(got, want) {
		t.Errorf("progress check got = %v, want = %v", got, want)
	}

	//fill 27 to display 28, 29 (9/11)
	postData = url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("27", `E & "F"`) //checkboxes A & B, C & D, E & "F"
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
	postData.Set("28", "apple") //multiselect apple, orange, banana, pineapple, avocado
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
	postData.Set("29", "test") //checkbox, label is 'test'
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
