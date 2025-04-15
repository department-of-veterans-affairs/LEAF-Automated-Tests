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

func getFormQuery(url string) (FormQueryResponse, error) {
	url = strings.Replace(url, " ", "%20", -1)
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m FormQueryResponse
	err := json.Unmarshal(b, &m)

	return m, err
}

func TestPendingGroupDesignatedNames(t *testing.T) {
	xFilter := `recordID,categoryIDs,categoryNames,date,title,service,submitted,priority,stepID,blockingStepID,lastStatus,stepTitle,action_history.time,unfilledDependencyData`
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"stepID","operator":"=","match":"actionable","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","categoryName","status","unfilledDependencies"],"sort":{},"limit":10000,"limitOffset":0}&x-filterData=` + xFilter)

	rec581 := res[581].UnfilledDependencyData
	rec690 := res[690].UnfilledDependencyData
	rec550 := res[550].UnfilledDependencyData

	//testing two groups that exist to avoid chance false pass
	got := rec581["-3"].ApproverName
	want := "Aluminum Home"
	if !cmp.Equal(got, want) {
		t.Errorf("dependency group 581 name = %v, want = %v", got, want)
	}

	got = rec690["-3"].ApproverName
	want = "Office of Associate Director of Patient Care Services"
	if !cmp.Equal(got, want) {
		t.Errorf("dependency group 690 name = %v, want = %v", got, want)
	}

	//group that does not exist in the portal for warning display
	got = rec550["-3"].ApproverName
	want = "Warning: Group has not been imported into the User Access Group"
	if !cmp.Equal(got, want) {
		t.Errorf("dependency group 550 warning = %v, want = %v", got, want)
	}
}

func TestFormQuery_HomepageQuery(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"title","operator":"LIKE","match":"***","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	// get first key
	var key int
	for k := range res {
		key = k
		break
	}

	got := res[key].RecordID
	want := key

	if got != want {
		t.Errorf("RecordID = %v, want = %v", got, want)
	}
}

func TestFormQuery_NonadminQuery(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"stepID","operator":"!=","match":"resolved","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,title&masquerade=nonAdmin`)

	if _, exists := res[958]; exists {
		t.Errorf("Record 958 should not be readable")
	}

	if _, exists := res[530]; !exists {
		t.Errorf("Record 530 should be readable")
	}
}

func TestFormQuery_NonadminQueryActionable(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"stepID","operator":"=","match":"actionable","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,title&masquerade=nonAdmin`)

	if _, exists := res[503]; !exists {
		t.Errorf("Record 503 should be actionable because tester is backup of person designated")
	}

	if _, exists := res[504]; !exists {
		t.Errorf("Record 504 should be actionable because tester is backup of initiator")
	}

	if _, exists := res[505]; exists {
		t.Errorf("Record 505 should not be actionable because tester is not the requestor")
	}

	if _, exists := res[500]; !exists {
		t.Errorf("Record 500 should be actionable because tester is the designated reviewer")
	}

	if _, exists := res[531]; !exists {
		t.Errorf("Record 531 should be actionable because tester is a member of the designated group")
	}

	if _, exists := res[532]; exists {
		t.Errorf("Record 532 should not be actionable because tester is not a member of the designated group")
	}
}

func TestFormQuery_FulltextSearch_ApplePearOrange(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"data","indicatorID":"3","operator":"MATCH","match":"apple pear orange","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[499]; !exists {
		t.Errorf(`Record 499 should exist because a data field contains either apple, pear, or orange`)
	}

	if _, exists := res[498]; !exists {
		t.Errorf(`Record 498 should exist because a data field contains either apple, pear, or orange`)
	}
}

func TestFormQuery_FulltextSearch_TheOrangeOrPear_StopwordsNotRequired(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"data","indicatorID":"3","operator":"MATCH ALL","match":"The orange or pear","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[497]; !exists {
		t.Errorf(`Record 497 should exist because a data field contains "The apple, orange or pear"`)
	}

}

func TestFormQuery_FulltextSearch_ApplePear_RequireOrange(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"data","indicatorID":"3","operator":"MATCH","match":"apple pear %2Borange","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[499]; !exists {
		t.Errorf(`Record 499 should exist because a data field contains the word "orange"`)
	}

	if _, exists := res[498]; exists {
		t.Errorf(`Record 498 should not exist because data fields do not contain the word "orange"`)
	}
}

func TestFormQuery_FulltextSearch_ApplePearNoOrange(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"data","indicatorID":"3","operator":"MATCH","match":"apple pear %2Dorange","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[499]; exists {
		t.Errorf(`Record 499 should not exist because data fields contain the word "orange". want = no orange`)
	}

	if _, exists := res[498]; !exists {
		t.Errorf(`Record 498 should exist because data fields do not contain the word "orange"`)
	}
}

func TestFormQuery_RecordIdAndFulltext(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"recordID","operator":"=","match":"499","gate":"AND"},{"id":"data","indicatorID":"0","operator":"MATCH ALL","match":"apple","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[499]; !exists {
		t.Errorf(`Record 499 should exist because the data fields contain the word "apple". want = recordID IS 499 AND data contains apple`)
	}
}

func TestFormQuery_GroupClickedApprove(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"stepAction","indicatorID":"4","operator":"=","match":"approve","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)

	if _, exists := res[9]; !exists {
		t.Errorf(`Record 9 should exist because the "Group designated step" clicked "Approve". want = recordID 9 exists in the result set`)
	}
}

func TestFormQuery_FilterActionHistory(t *testing.T) {
	q := `api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"9","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["action_history"],"sort":{},"limit":10000,"limitOffset":0}`
	xFilter := `&x-filterData=recordID,title,action_history.time,action_history.description,action_history.actionTextPasttense,action_history.approverName,action_history.userMetadata`
	res, _ := getFormQuery(RootURL + q + xFilter)

	if res[9].ActionHistory[0].RecordID != 0 {
		t.Errorf(`Record ID should not exist since it wasn't requested within action_history. want = action_history[0].recordID is null`)
	}

	if res[9].ActionHistory[0].ApproverName == "" {
		t.Errorf(`Approver name should not be empty since the record contains actions, and it was requested via filter want = action_history[0].approverName is not empty`)
	}

	gotApproverName := res[9].ActionHistory[0].ApproverName
	wantApproverName := "Tester Tester"
	if !cmp.Equal(gotApproverName, wantApproverName) {
		t.Errorf("Approver name got = %v, want = %v", gotApproverName, wantApproverName)
	}

	approverUserMetadata := res[9].ActionHistory[0].UserMetadata

	gotFirst := approverUserMetadata.FirstName
	wantFirst := "Tester"
	if !cmp.Equal(gotFirst, wantFirst) {
		t.Errorf("Approver first name got = %v, want = %v", gotFirst, wantFirst)
	}
	gotLast := approverUserMetadata.LastName
	wantLast := "Tester"
	if !cmp.Equal(gotLast, wantLast) {
		t.Errorf("Approver last name got = %v, want = %v", gotLast, wantLast)
	}
	gotMiddle := approverUserMetadata.MiddleName
	wantMiddle := ""
	if !cmp.Equal(gotMiddle, wantMiddle) {
		t.Errorf("Approver middle name got = %v, want = %v", gotMiddle, wantMiddle)
	}
	gotEmail := approverUserMetadata.Email
	wantEmail := "tester.tester@fake-email.com"
	if !cmp.Equal(gotEmail, wantEmail) {
		t.Errorf("Approver email got = %v, want = %v", gotEmail, wantEmail)
	}
	gotUserName := approverUserMetadata.UserName
	wantUserName := "tester"
	if !cmp.Equal(gotUserName, wantUserName) {
		t.Errorf("Last name got = %v, want = %v", gotUserName, wantUserName)
	}
}

func TestFormQuery_DescendingIndex(t *testing.T) {
	// This test reproduces an issue where a descending recordID index in MySQL <= 8.4 results in unexpected query results
	// when 2 or more potential indexes can be used. Reliably reproducing this issue also requires a new record to be created.
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("numform_5ea07", "1")
	postData.Set("title", "TestFormQuery_DescendingIndex")
	client.PostForm(RootURL+`api/form/new`, postData)

	res, _ := getFormQuery(RootURL + `api/form/query/?q={"terms":[{"id":"userID","operator":"=","match":"VTRSHHZOFIA","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"recordID","direction":"DESC"},"limit":50}`)

	if _, exists := res[6]; !exists {
		t.Errorf(`Record ID should exist because VTRSHHZOFIA is the initiator. want = recordID is not null`)
	}
}

// TestFormQuery_FindTwoSteps looks for records on stepID 3 OR -3
func TestFormQuery_FindTwoSteps(t *testing.T) {
	res, _ := getFormQuery(RootURL + `api/form/query/?q={"terms":[{"id":"stepID","operator":"=","match":"3","gate":"AND"},{"id":"stepID","operator":"=","match":"-3","gate":"OR"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{}}&x-filterData=recordID,stepID`)

	for _, record := range res {
		if record.StepID != 3 && record.StepID != -3 {
			t.Errorf(`RecordID #%v StepID = %v. want = stepID is 3 OR -3`, record.RecordID, record.StepID)
		}
	}
}

/* post a new employee to an orgchart format question and then confirm expected values on orgchart property */
func TestFormQuery_Employee_Format__Orgchart_Has_Expected_Values(t *testing.T) {
	mock_orgchart_employee := FormQuery_Orgchart_Employee{
		EmpUID:     201,
		FirstName:  "Ramon",
		LastName:   "Watsica",
		MiddleName: "Yundt",
		Email:      "Ramon.Watsica@fake-email.com",
		UserName:   "vtrycxbethany",
	}

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("8", "201")

	res, err := client.PostForm(RootURL+`api/form/11`, postData)
	if err != nil {
		t.Error("Error sending post request")
	}

	bodyBytes, _ := io.ReadAll(res.Body)
	got := string(bodyBytes)
	want := `"1"`
	if !cmp.Equal(got, want) {
		t.Errorf("Error posting orgchart entry.  Admin did not have access got = %v, want = %v", got, want)
	}

	formRes, _ := getFormQuery(RootURL + `api/form/query/?q={"terms":[{"id":"categoryID","operator":"=","match":"form_5ea07","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["8"],"limit":10000,"limitOffset":0}&x-filterData=recordID,title`)
	if _, exists := formRes[11]; !exists {
		t.Errorf("Record 11 should be readable")
	}

	recData := formRes[11].S1

	dataInterface := recData["id8_orgchart"]
	orgchart := dataInterface.(map[string]interface{})
	b, _ := json.Marshal(orgchart)

	var org_emp FormQuery_Orgchart_Employee
	err = json.Unmarshal(b, &org_emp)
	if err != nil {
		t.Error("Error on FormQuery_Orgchart_Employee unmarshal")
	}

	got = org_emp.FirstName
	want = mock_orgchart_employee.FirstName
	if !cmp.Equal(got, want) {
		t.Errorf("firstName got = %v, want = %v", got, want)
	}
	got = org_emp.LastName
	want = mock_orgchart_employee.LastName
	if !cmp.Equal(got, want) {
		t.Errorf("lastName got = %v, want = %v", got, want)
	}
	got = org_emp.MiddleName
	want = mock_orgchart_employee.MiddleName
	if !cmp.Equal(got, want) {
		t.Errorf("middleName got = %v, want = %v", got, want)
	}
	got = org_emp.Email
	want = mock_orgchart_employee.Email
	if !cmp.Equal(got, want) {
		t.Errorf("email got = %v, want = %v", got, want)
	}
	got = org_emp.UserName
	want = mock_orgchart_employee.UserName
	if !cmp.Equal(got, want) {
		t.Errorf("userName got = %v, want = %v", got, want)
	}
	got = strconv.Itoa(org_emp.EmpUID)
	want = strconv.Itoa(mock_orgchart_employee.EmpUID)
	if !cmp.Equal(got, want) {
		t.Errorf("empUID got = %v, want = %v", got, want)
	}
}

/* test query S1[idIndicator] API values of orgchart format types */
func TestFormQuery_Orgchart_Formats__idIndicator_Has_Expected_Values(t *testing.T) {
	q := `q={"terms":[{"id":"categoryID","operator":"=","match":"form_512fa","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["49","50","51"]}`
	xFilter := `&x-filterData=recordID`

	recDataFound := 959
	recDataEmpty := 960
	recDataNotFound := 961
	recNoDataRecord := 962
	keyEmp := "id49"
	keyGrp := "id50"
	keyPos := "id51"

	res, _ := getFormQuery(RootURL + `api/form/query/?` + q + xFilter)

	//data.data value exists and is associated with an existing orgchart employee, group, position
	got := res[recDataFound].S1[keyEmp] //Firstname Lastname derived from correspond metadata (which is based on lookup of data.data at time of entry)
	want := "Tester Tester"
	if !cmp.Equal(got, want) {
		t.Errorf("id49 valid employee, id value got = %v, want = %v", got, want)
	}
	got = res[recDataFound].S1[keyGrp] //Group Title - derived by group lookup of data.data
	want = "Aluminum Books"
	if !cmp.Equal(got, want) {
		t.Errorf("id50 valid group, id value got = %v, want = %v", got, want)
	}
	got = res[recDataFound].S1[keyPos] //Posistion Title (PayPlan-Series-PayGrade) - derived by position lookup of data.data and supsequent orgchart position_data
	want = "Accountability Officer (GS-0343-14)"
	if !cmp.Equal(got, want) {
		t.Errorf("id51 valid position, id value got = %v, want = %v", got, want)
	}

	//data record exists, but the data.data value is empty
	got = res[recDataEmpty].S1[keyEmp]
	want = ""
	if !cmp.Equal(got, want) {
		t.Errorf("id49 empty employee data, id value got = %v, want = %v", got, want)
	}
	got = res[recDataEmpty].S1[keyGrp]
	want = ""
	if !cmp.Equal(got, want) {
		t.Errorf("id50 empty group data, id value got = %v, want = %v", got, want)
	}
	got = res[recDataEmpty].S1[keyPos]
	want = ""
	if !cmp.Equal(got, want) {
		t.Errorf("id51 empty position data, id value got = %v, want = %v", got, want)
	}

	//data.data value exists but is not associated with a current orgchart employee, group, position AND no metadata exists
	got = res[recDataNotFound].S1[keyEmp]
	want = "Employee #9999 no longer available"
	if !cmp.Equal(got, want) {
		t.Errorf("id49 outdated employee, id value got = %v, want = %v", got, want)
	}
	got = res[recDataNotFound].S1[keyGrp]
	want = "Group #9999 no longer available"
	if !cmp.Equal(got, want) {
		t.Errorf("id50 outdated group, id value got = %v, want = %v", got, want)
	}
	got = res[recDataNotFound].S1[keyPos]
	want = "Position #9999 no longer available"
	if !cmp.Equal(got, want) {
		t.Errorf("id51 outdated position, id value got = %v, want = %v", got, want)
	}

	//id values should be null if no data record exists
	got = res[recNoDataRecord].S1[keyEmp]
	if got != nil {
		t.Errorf("id49 no employee data (null), id value got = %v", got)
	}
	got = res[recNoDataRecord].S1[keyGrp]
	if got != nil {
		t.Errorf("id50 no group data (null), id value got = %v", got)
	}
	got = res[recNoDataRecord].S1[keyPos]
	if got != nil {
		t.Errorf("id49 no position data (null), id value got = %v", got)
	}
}

func TestFormQuery_Records_UserMetadata__Has_Expected_Values(t *testing.T) {
	mock_orgchart_employee := FormQuery_Orgchart_Employee{
		FirstName:  "Risa",
		LastName:   "Keebler",
		MiddleName: "Hyatt",
		Email:      "Risá.Keebler@fake-email.com",
		UserName:   "vtrigzcristal",
	}
	//post new request under a username
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("initiator", "vtrigzcristal")
	_, _ = client.PostForm(RootURL+`api/form/12/initiator`, postData)

	//confirm firstName, lastName and userMetadata have expected values
	q := `api/form/query/?q={"terms":[{"id":"categoryID","operator":"=","match":"form_5ea07","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["initiatorName"],"sort":{}}`
	xFilter := `&x-filterData=recordID,lastName,firstName,userMetadata`
	res, _ := getFormQuery(RootURL + q + xFilter)

	formRecord := res[12]
	initiatorMetadata := formRecord.UserMetadata

	gotFirstName := formRecord.FirstName
	gotLastName := formRecord.LastName

	gotMetadataFirstName := initiatorMetadata.FirstName
	gotMetadataLastName := initiatorMetadata.LastName
	gotMetadataMiddle := initiatorMetadata.MiddleName
	gotMetadataEmail := initiatorMetadata.Email
	gotMetadataUserName := initiatorMetadata.UserName

	wantFirst := mock_orgchart_employee.FirstName
	wantLast := mock_orgchart_employee.LastName
	wantMiddle := mock_orgchart_employee.MiddleName
	wantEmail := mock_orgchart_employee.Email
	wantUserName := mock_orgchart_employee.UserName

	//record userMetadata properties
	if !cmp.Equal(gotMetadataFirstName, wantFirst) {
		t.Errorf("Record userMetadata first name got = %v, want = %v", gotMetadataFirstName, wantFirst)
	}
	if !cmp.Equal(gotMetadataLastName, wantLast) {
		t.Errorf("Record userMetadata last name got = %v, want = %v", gotMetadataLastName, wantLast)
	}
	if !cmp.Equal(gotMetadataMiddle, wantMiddle) {
		t.Errorf("Last name got = %v, want = %v", gotMetadataMiddle, wantMiddle)
	}
	if !cmp.Equal(gotMetadataEmail, wantEmail) {
		t.Errorf("Last name got = %v, want = %v", gotMetadataEmail, wantEmail)
	}
	if !cmp.Equal(gotMetadataUserName, wantUserName) {
		t.Errorf("Last name got = %v, want = %v", gotMetadataUserName, wantUserName)
	}

	//record firstName lastName fields.  These are extracted from JSON userMetadata and should also match.
	if !cmp.Equal(gotFirstName, wantFirst) {
		t.Errorf("Record first name got = %v, want = %v", gotFirstName, wantFirst)
	}
	if !cmp.Equal(gotLastName, wantLast) {
		t.Errorf("Record last name got = %v, want = %v", gotLastName, wantLast)
	}

	//disable the account locally and confirm first and last name are still available
	err := DisableEmployee(RootOrgchartURL + "api/employee/11")
	if err != nil {
		t.Error(err)
	}
	res, _ = getFormQuery(RootURL + q + xFilter)
	formRecord = res[12]
	gotFirstName = formRecord.FirstName
	gotLastName = formRecord.LastName
	if !cmp.Equal(gotFirstName, wantFirst) {
		t.Errorf("Record first name got = %v, want = %v", gotFirstName, wantFirst)
	}
	if !cmp.Equal(gotLastName, wantLast) {
		t.Errorf("Record last name got = %v, want = %v", gotLastName, wantLast)
	}
	//re-enable account
	err = EnableLocalEmployee("11")
	if err != nil {
		t.Error(err)
	}

	//test firstName, lastName record fields for a record (#13)with empty metadata (accounts disabled prior to 12/6/2024)
	formRecord = res[13]
	gotFirstName = formRecord.FirstName
	gotLastName = formRecord.LastName

	wantFirst = "(inactive user)"
	wantLast = "tester_disabled"
	if !cmp.Equal(gotFirstName, wantFirst) {
		t.Errorf("Record first name got = %v, want = %v", gotFirstName, wantFirst)
	}
	if !cmp.Equal(gotLastName, wantLast) {
		t.Errorf("Record last name got = %v, want = %v", gotLastName, wantLast)
	}
}

func TestForm_VerifyInitiator(t *testing.T) {

	url := RootURL + `api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"5","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["initiatorName"],"sort":{}}&x-filterData=recordID,lastName,firstName,userName`
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var formQueryResponse FormQueryResponse
	err := json.Unmarshal(b, &formQueryResponse)
	if err != nil {
		t.Error(err)
	}

	if formQueryResponse[5].FirstName == "" {
		t.Error("FirstName not set")
	}

	if formQueryResponse[5].LastName == "" {
		t.Error("LastName not set")
	}

	if formQueryResponse[5].UserName == "" {
		t.Error("UserName not set")
	}
}

/* Test special characters saved in the title of a record and contents of a record */
func TestFormQuery_Special_Characters(t *testing.T) {

	theTestString := "This is an otter 🦦 this is a smiley 😀"
	theTestTitleString := "TestForm_Special_Characters😀"

	// Setup conditions
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("numform_5ea07", "1")
	postData.Set("title", theTestTitleString)
	postData.Set("3", theTestString)
	postData.Set("8", "1")
	postData.Set("9", "112")

	// TODO: streamline this
	pRes, _ := client.PostForm(RootURL+`api/form/new`, postData)
	bodyBytes, _ := io.ReadAll(pRes.Body)
	var response string
	json.Unmarshal(bodyBytes, &response)
	recordID, err := strconv.Atoi(string(response))

	if err != nil {
		t.Errorf("Could not create record for TestFormQuery_Special_Characters: " + err.Error())
	}

	res, _ := getFormQuery(RootURL + fmt.Sprintf(`api/form/query/?q={"terms":[{"id":"recordID","operator":"=","match":"%d","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":[],"sort":{},"getData":["3"]}&x-filterData=recordID,title`, recordID))

	if res[recordID].Title != theTestTitleString {
		t.Errorf(`Title %v Does not match %v.`, res[recordID].Title, theTestTitleString)
	}

	for tKey, tVal := range res[recordID].S1 {

		if tKey == "id3" && tVal != theTestString {
			t.Errorf(`Text %v Does not match %v.`, tVal, theTestString)
		}
	}
}

// Check Role-Based Admin Inbox for accurate Person Designated and Requestor Followup assignments
func TestFormQuery_RoleBasedInbox_PersonDesginatedAndFollowup(t *testing.T) {
	mock_orgchart_employee := FormQuery_Orgchart_Employee{
		FirstName: "Ramon",
		LastName:  "Watsica",
		Email:     "Ramon.Watsica@fake-email.com",
	}

	formRes, _ := getFormQuery(RootURL + `api/form/query/?q={"terms":[{"id":"stepID","operator":"=","match":"actionable","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","categoryName","status","unfilledDependencies"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,categoryIDs,categoryNames,date,title,service,submitted,priority,stepID,blockingStepID,lastStatus,stepTitle,action_history.time,unfilledDependencyData`)
	if _, exists := formRes[11]; !exists {
		t.Errorf("Record 11 should be actionable")
	}

	got := formRes[11].UnfilledDependencyData["-1"].ApproverName
	want := mock_orgchart_employee.FirstName + " " + mock_orgchart_employee.LastName
	if !cmp.Equal(got, want) {
		t.Errorf("ApproverName got = %v, want = %v", got, want)
	}

	got = formRes[11].UnfilledDependencyData["-1"].ApproverUID
	want = mock_orgchart_employee.Email
	if !cmp.Equal(got, want) {
		t.Errorf("email got = %v, want = %v", got, want)
	}

	// Check another record
	mock_orgchart_employee = FormQuery_Orgchart_Employee{
		FirstName: "Hilary",
		LastName:  "Zboncak",
		Email:     "Hilary.Zboncak@fake-email.com",
	}
	if _, exists := formRes[12]; !exists {
		t.Errorf("Record 12 should be actionable")
	}

	got = formRes[12].UnfilledDependencyData["-1"].ApproverName
	want = mock_orgchart_employee.FirstName + " " + mock_orgchart_employee.LastName
	if !cmp.Equal(got, want) {
		t.Errorf("ApproverName got = %v, want = %v", got, want)
	}

	got = formRes[12].UnfilledDependencyData["-1"].ApproverUID
	want = mock_orgchart_employee.Email
	if !cmp.Equal(got, want) {
		t.Errorf("email got = %v, want = %v", got, want)
	}

	// Check record with blank assigned person
	mock_orgchart_employee = FormQuery_Orgchart_Employee{
		FirstName: "Hilary",
		LastName:  "Zboncak",
		Email:     "Hilary.Zboncak@fake-email.com",
	}
	if _, exists := formRes[88]; !exists {
		t.Errorf("Record 88 should be actionable")
	}

	got = formRes[88].UnfilledDependencyData["-1"].ApproverName
	if !strings.Contains(got, "NEEDS REASSIGNMENT") {
		t.Errorf(`ApproverName got = %v, want = contains "NEEDS REASSIGNMENT"`, got)
	}

	// Check Requestor Followup
	mock_orgchart_employee = FormQuery_Orgchart_Employee{
		FirstName: "Charlie",
		LastName:  "Anderson",
		Email:     "Charlie.Anderson@fake-email.com",
	}
	if _, exists := formRes[506]; !exists {
		t.Errorf("Record 506 should be actionable")
	}

	got = formRes[506].UnfilledDependencyData["-2"].ApproverName
	want = mock_orgchart_employee.FirstName + " " + mock_orgchart_employee.LastName
	if !cmp.Equal(got, want) {
		t.Errorf("ApproverName got = %v, want = %v", got, want)
	}

	got = formRes[506].UnfilledDependencyData["-2"].ApproverUID
	want = mock_orgchart_employee.Email
	if !cmp.Equal(got, want) {
		t.Errorf("email got = %v, want = %v", got, want)
	}
}

// Report Builder Step 2: Enable Current Status
func TestForm_QueryJoinStatus(t *testing.T) {

	url := RootURL + `api/form/query?q={"terms":[{"id":"stepID","operator":"!=","match":"resolved","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["status"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,title,stepTitle,lastStatus`
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var formQueryResponse FormQueryResponse
	err := json.Unmarshal(b, &formQueryResponse)
	if err != nil {
		t.Error(err)
	}

	for _, v := range formQueryResponse {
		if v.StepTitle == "" {
			t.Error("TestForm_BasicStatusQuery want = stepTitle is not empty, got = stepTitle is empty")
		}
		break
	}
}
