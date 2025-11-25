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
