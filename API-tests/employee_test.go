package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func getEmployee(url string) (EmployeeResponse, error) {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m EmployeeResponse
	err := json.Unmarshal(b, &m)
	if err != nil {
		return nil, err
	}
	return m, err
}

func updateEmployees(url string) error {
	_, err := client.Get(url)
	if err != nil {
		return err
	}
	return nil
}

func postEmployee(postUrl string, data Employee) (string, error) {

	postData := url.Values{}
	postData.Set("firstName", data.FirstName)
	postData.Set("lastName", data.LastName)
	postData.Set("userName", data.UserName)
	postData.Set("CSRFToken", CsrfToken)

	// Send POST request
	res, err := client.PostForm(postUrl, postData)
	if err != nil {
		return "", err
	}

	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err = json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}

	return c, nil
}

func EnableLocalEmployee(empUID string) error {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	_, err := client.PostForm(RootOrgchartURL+`api/employee/` + empUID + `/activate`, postData)
	return err
}

func DisableEmployee(postUrl string) error {

	data := url.Values{}
	data.Set("CSRFToken", CsrfToken)

	req, err := http.NewRequest("DELETE", postUrl, strings.NewReader(data.Encode()))

	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)

	if err != nil {
		return err
	}

	bodyBytes, _ := io.ReadAll(resp.Body)

	defer resp.Body.Close()

	var c string
	err = json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}

	return nil

}

func TestEmployee_AvoidPhantomIncrements(t *testing.T) {
	// as the test name suggests this test is to prevent the auto increment in
	//  the employees table from incrementing without an actual insert. This
	// test will reveal when a condition exists where an insert causes the
	// increment to increase but a unique key forces the ON DUPLICATE UPDATE
	// to update an existing row.

	// This test needs to run before TestEmployee_CheckNationalEmployee as they
	// both run the refreshOrgchartEmployees.php. This test expects there to be
	// a difference between National and Local orgcharts and that may not be true
	// once the refreshOrgchartEmployees.php runs.

	// add new employee getting the empUID
	m := Employee{
		FirstName: "testing",
		LastName:  "users",
		UserName:  "testingusers",
	}

	n := Employee{
		FirstName: "testing",
		LastName:  "users",
		UserName:  "TESTINGUSERS",
	}

	employeeId, err := postEmployee(NationalOrgchartURL+`api/employee/new`, m)

	if err != nil {
		t.Error(err)
	}

	if employeeId == "" {
		t.Error("no user id returned")
	}

	var empUID1 string

	empUID1, err = postEmployee(RootOrgchartURL+`api/employee/new`, n)

	if err != nil {
		t.Error(err)
	}

	if empUID1 == "" {
		t.Error("no user id returned")
	}

	// ensure userNames are spelled the same but with different cases in
	// national and local
	var localEmployeeKey int
	var natEmployeeKey int

	natEmpoyeeRes, err := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testingusers`)

	if err != nil {
		t.Error(err)
	}

	for key := range natEmpoyeeRes {
		natEmployeeKey = key
		break
	}

	localEmployeeRes, _ := getEmployee(RootOrgchartURL + `api/employee/search?q=username:testingusers`)
	for key := range localEmployeeRes {
		localEmployeeKey = key
		break
	}

	local := localEmployeeRes[localEmployeeKey].UserName
	nat := natEmpoyeeRes[natEmployeeKey].UserName

	if (!(nat != local && strings.ToLower(nat) == strings.ToLower(local))) {
		t.Errorf("userNames should match except case - local = %v, national = %v", local, nat)
	}

	// run refresh Orgchart
	err = updateEmployees(RootOrgchartURL + `scripts/refreshOrgchartEmployees.php`)

	if err != nil {
		t.Error(err)
	}

	var empUID2 string

	// add new user getting empUID
	o := Employee{
		FirstName: "testing",
		LastName:  "users",
		UserName:  "testingusers2",
	}

	empUID2, err = postEmployee(RootOrgchartURL+`api/employee/new`, o)

	if err != nil {
		t.Error(err)
	}

	if empUID2 == "" {
		t.Error("no user id returned")
	}

	var id1 int
	var id2 int

	id1, err1 := strconv.Atoi(empUID1)
	id2, err2 := strconv.Atoi(empUID2)

	if err1 != nil || err2 != nil {
		t.Error("empUID is not a number")
	}

	if  id2 != (id1 + 1) {
		t.Error("unexpected auto increment value")
	}
}

func TestEmployee_CheckNationalEmployee(t *testing.T) {

	// make sure the users are in place before we start.
	m := Employee{
		FirstName: "test",
		LastName:  "user",
		UserName:  "testuser",
	}

	employeeId, err := postEmployee(NationalOrgchartURL+`api/employee/new`, m)

	if err != nil {
		t.Error(err)
	}

	if employeeId == "" {
		t.Error("no user id returned")
	}

	employeeId, err = postEmployee(RootOrgchartURL+`api/employee/new`, m)

	if err != nil {
		t.Error(err)
	}

	if employeeId == "" {
		t.Error("no user id returned")
	}

	var localEmployeeKey int
	var natEmployeeKey int

	natEmpoyeeRes, err := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testuser`)

	if err != nil {
		t.Error(err)
	}

	for key := range natEmpoyeeRes {
		natEmployeeKey = key
		break
	}

	localEmployeeRes, _ := getEmployee(RootOrgchartURL + `api/employee/search?q=username:testuser`)
	for key := range localEmployeeRes {
		localEmployeeKey = key
		break
	}

	got := localEmployeeRes[localEmployeeKey].UserName
	want := m.UserName

	if !cmp.Equal(got, want) {
		t.Errorf("got = %v, want = %v", got, want)
	}

	got = natEmpoyeeRes[natEmployeeKey].UserName
	if !cmp.Equal(got, want) {
		t.Errorf("got = %v, want = %v", got, want)
	}

	// delete remote employee
	err = DisableEmployee(fmt.Sprintf("%sapi/employee/%d", NationalOrgchartURL, natEmployeeKey))
	if err != nil {
		t.Error(err)
	}

	// make sure the national is disabled
	res, _ := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testuser`)

	gotId := fmt.Sprintf("%d", res[natEmployeeKey].EmployeeId)
	wantId := natEmployeeKey
	if cmp.Equal(gotId, wantId) {
		t.Errorf("User was not disabled on national - got = %s, want = %d", gotId, wantId)
	}

	// make sure the local is not disabled
	res, _ = getEmployee(RootOrgchartURL + `api/employee/search?q=username:testuser`)

	gotId = fmt.Sprintf("%d", res[localEmployeeKey].EmployeeId)
	wantId = localEmployeeKey
	if !cmp.Equal(gotId, wantId) {
		t.Errorf("User was disabled on local - got = %s, want = %d", gotId, wantId)
	}

	// run script again, make sure it deletes locally
	err = updateEmployees(RootOrgchartURL + `scripts/refreshOrgchartEmployees.php`)
	if err != nil {
		t.Error(err)
	}

	// make sure the national entry was deleted
	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testuser`)

	if len(res) > 0 {
		t.Error("User Exists on national")
	}

	// make sure the local has been deleted.
	res, _ = getEmployee(RootOrgchartURL + `api/employee/search?q=username:testuser`)

	if len(res) > 0 {
		t.Error("User Exists on local")
	}

}

func TestEmployee_UpdateNationalEmployee(t *testing.T) {
	// mock auth server saving data to national orgchart
	fmt.Println("After DB setup.")
	updateNOfromAD()
	fmt.Println("After adding AD data.")

	// check for employees that should have data that will change and those that should
	// become disabled after running the scripts
	var natEmployeeKey int

	//natEmpoyeeRes, err := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testuser`)
	res, _ := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRBFTMINA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotLName := fmt.Sprintf("%s", res[natEmployeeKey].LastName)
	wantLName := "Tromp";
	gotEmail := fmt.Sprintf("%s", res[natEmployeeKey].Email)
	wantEmail := "Marjory.Tromp@fake-email.com"

	if !cmp.Equal(gotLName, wantLName) {
		t.Errorf("User Last Name was not as expected - got = %s, want = %s", gotLName, wantLName)
	}

	if !cmp.Equal(gotEmail, wantEmail) {
		t.Errorf("User Email was not as expected - got = %s, want = %s", gotEmail, wantEmail)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRBBICELINA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId := fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId := 0;
	myId, _ := strconv.Atoi(gotId)

	if (myId > 0) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRCFNYUONNE`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId = fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId = 0;
	myId, _ = strconv.Atoi(gotId)

	if (myId > 0) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRAZRELLEN`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId = fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId = 0;
	myId, _ = strconv.Atoi(gotId)

	if (myId > 0) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRHXDLIZ`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotAddress := fmt.Sprintf("%s", res[natEmployeeKey].Data[8].Data)
	wantAddress := "Mosciskiport, Idaho";

	if !cmp.Equal(gotAddress, wantAddress) {
		t.Errorf("Address was not what was expected - got = %s, want = %s", gotAddress, wantAddress)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRPAZMICKIE`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotPhone := fmt.Sprintf("%s", res[natEmployeeKey].Data[5].Data)
	wantPhone := "1-706-722-8380";
	gotMobile := fmt.Sprintf("%s", res[natEmployeeKey].Data[16].Data)
	wantMobile := "295-356-6010";

	if !cmp.Equal(gotPhone, wantPhone) {
		t.Errorf("Phone was different from what was expected - got = %s, want = %s", gotPhone, wantPhone)
	}

	if !cmp.Equal(gotMobile, wantMobile) {
		t.Errorf("Mobile was different from what was expected - got = %s, want = %s", gotMobile, wantMobile)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRHLQJanetH`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotPhone = fmt.Sprintf("%s", res[natEmployeeKey].Data[5].Data)
	wantPhone = "1-621-512-0990";
	gotMobile = fmt.Sprintf("%s", res[natEmployeeKey].Data[16].Data)
	wantMobile = "277-670-8183";

	if !cmp.Equal(gotPhone, wantPhone) {
		t.Errorf("Phone was different from what was expected - got = %s, want = %s", gotPhone, wantPhone)
	}

	if !cmp.Equal(gotMobile, wantMobile) {
		t.Errorf("Mobile was different from what was expected - got = %s, want = %s", gotMobile, wantMobile)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRYUYDEVONA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotTitle := fmt.Sprintf("%s", res[natEmployeeKey].Data[23].Data)
	wantTitle := "Advertising Associate";

	if !cmp.Equal(gotTitle, wantTitle) {
		t.Errorf("Title was different from what was expected - got = %s, want = %s", gotTitle, wantTitle)
	}

	// run the updateNationalOrgchartEmployees.php
	// need to figure out how to run this from the fpm container
	fmt.Println("orgchart url: "+RootOrgchartURL)
	err := updateEmployees(RootOrgchartURL + `scripts/updateNationalOrgchart.php`)

	if err != nil {
		t.Error(err)
	}

	// check those same employees for the data that should have changed and also make sure the
	// employees that should be disabled are disabled.
	//natEmpoyeeRes, err := getEmployee(NationalOrgchartURL + `api/employee/search?q=username:testuser`)
	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRBFTMINA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotLName = fmt.Sprintf("%s", res[natEmployeeKey].LastName)
	wantLName = "Trump";
	gotEmail = fmt.Sprintf("%s", res[natEmployeeKey].Email)
	wantEmail = "Marjory.Trump@fake-email.com"

	if !cmp.Equal(gotLName, wantLName) {
		t.Errorf("User Last Name was not as expected - got = %s, want = %s", gotLName, wantLName)
	}

	if !cmp.Equal(gotEmail, wantEmail) {
		t.Errorf("User Email was not as expected - got = %s, want = %s", gotEmail, wantEmail)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRBBICELINA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId = fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId = 0;
	myId, _ = strconv.Atoi(gotId)

	if !cmp.Equal(myId, wantId) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRCFNYUONNE`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId = fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId = 0;
	myId, _ = strconv.Atoi(gotId)

	if !cmp.Equal(myId, wantId) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRAZRELLEN`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotId = fmt.Sprintf("%d", res[natEmployeeKey].Deleted)
	wantId = 0;
	myId, _ = strconv.Atoi(gotId)

	if !cmp.Equal(myId, wantId) {
		t.Errorf("User was already deleted - got = %s, want = %d", gotId, wantId)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRHXDLIZ`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotAddress = fmt.Sprintf("%s", res[natEmployeeKey].Data[8].Data)
	wantAddress = "Boise, Idaho";

	if !cmp.Equal(gotAddress, wantAddress) {
		t.Errorf("Address was not what was expected - got = %s, want = %s", gotAddress, wantAddress)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRPAZMICKIE`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotPhone = fmt.Sprintf("%s", res[natEmployeeKey].Data[5].Data)
	wantPhone = "555-222-8380";
	gotMobile = fmt.Sprintf("%s", res[natEmployeeKey].Data[16].Data)
	wantMobile = "222-123-6010";

	if !cmp.Equal(gotPhone, wantPhone) {
		t.Errorf("Phone was different from what was expected - got = %s, want = %s", gotPhone, wantPhone)
	}

	if !cmp.Equal(gotMobile, wantMobile) {
		t.Errorf("Mobile was different from what was expected - got = %s, want = %s", gotMobile, wantMobile)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRHLQJanetH`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotPhone = fmt.Sprintf("%s", res[natEmployeeKey].Data[5].Data)
	wantPhone = "555-222-0990";
	gotMobile = fmt.Sprintf("%s", res[natEmployeeKey].Data[16].Data)
	wantMobile = "";

	if !cmp.Equal(gotPhone, wantPhone) {
		t.Errorf("Phone was different from what was expected - got = %s, want = %s", gotPhone, wantPhone)
	}

	if !cmp.Equal(gotMobile, wantMobile) {
		t.Errorf("Mobile was different from what was expected - got = %s, want = %s", gotMobile, wantMobile)
	}

	res, _ = getEmployee(NationalOrgchartURL + `api/employee/search?q=username:VTRYUYDEVONA`)

	 for key := range res {
		natEmployeeKey = key
		break
	}

	gotTitle = fmt.Sprintf("%s", res[natEmployeeKey].Data[23].Data)
	wantTitle = "Testing Title";

	if !cmp.Equal(gotTitle, wantTitle) {
		t.Errorf("Title was different from what was expected - got = %s, want = %s", gotTitle, wantTitle)
	}
}