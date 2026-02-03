package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"net/url"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func getFormWorkflow(url string) FormWorkflowResponse {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m FormWorkflowResponse
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func TestFormWorkflow_currentStepPersonDesignatedAndGroup(t *testing.T) {
	res := getFormWorkflow(RootURL + `api/formWorkflow/484/currentStep`)

	got := res[9].Description
	want := "Group A"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	got = res[-1].Description
	want = "Step 1 (Omar Marvin)"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	gotPtr := res[9].ApproverName
	// approverName should not exist for depID 9
	if gotPtr != nil {
		t.Errorf("ApproverName = %v, want = %v", *gotPtr, nil)
	}
}

func TestFormWorkflow_ApplyAction(t *testing.T) {
	// Test invalid ID
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("dependencyID", "invalid id")
	postData.Set("actionType", "approve")
	res, _ := client.PostForm(RootURL+`api/formWorkflow/8/apply`, postData)
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("api/formWorkflow/8/apply (invalid ID) StatusCode = %v, want = %v", res.StatusCode, http.StatusBadRequest)
	}

	// Test invalid action
	postData.Set("dependencyID", "-3")
	postData.Set("actionType", "TestFormWorkflow_ApplyAction-invalidAction")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/8/apply`, postData)
	if res.StatusCode != http.StatusBadRequest {
		t.Errorf("api/formWorkflow/8/apply (invalid action) StatusCode = %v, want = %v", res.StatusCode, http.StatusBadRequest)
	}

	// Test valid ID
	postData.Set("dependencyID", "-3")
	postData.Set("actionType", "approve")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/8/apply`, postData)
	if res.StatusCode != http.StatusOK {
		t.Errorf("api/formWorkflow/8/apply (valid ID) StatusCode = %v, want = %v", res.StatusCode, http.StatusOK)
	}

	// Test "page is out of date"
	postData.Set("dependencyID", "-3")
	postData.Set("actionType", "approve")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/8/apply`, postData)
	if res.StatusCode != http.StatusConflict {
		t.Errorf("api/formWorkflow/8/apply ('page is out of date') StatusCode = %v, want = %v", res.StatusCode, http.StatusConflict)
	}

	// Test "valid action with stepID"
	postData.Set("dependencyID", "-2")
	postData.Set("stepID", "3")
	postData.Set("actionType", "Note")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/504/apply`, postData)
	if res.StatusCode != http.StatusOK {
		t.Errorf("api/formWorkflow/504/apply ('valid action with stepID') StatusCode = %v, want = %v", res.StatusCode, http.StatusOK)
	}

	// Test "invalid action with wrong stepID"
	postData.Set("dependencyID", "-2")
	postData.Set("stepID", "1")
	postData.Set("actionType", "Note")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/504/apply`, postData)
	if res.StatusCode != http.StatusConflict {
		t.Errorf("api/formWorkflow/504/apply ('invalid action with wrong stepID') StatusCode = %v, want = %v", res.StatusCode, http.StatusConflict)
	}

	// Test duplicate "valid action with stepID"
	postData.Set("dependencyID", "-1")
	postData.Set("stepID", "1")
	postData.Set("actionType", "approve")
	res, _ = client.PostForm(RootURL+`api/formWorkflow/496/apply`, postData)
	if res.StatusCode != http.StatusOK {
		t.Errorf("api/formWorkflow/504/apply ('duplicate valid action with stepID') StatusCode = %v, want = %v", res.StatusCode, http.StatusOK)
	}
	res, _ = client.PostForm(RootURL+`api/formWorkflow/496/apply`, postData)
	if res.StatusCode != http.StatusAccepted {
		t.Errorf("api/formWorkflow/504/apply ('duplicate valid action with stepID') StatusCode = %v, want = %v", res.StatusCode, http.StatusAccepted)
	}
}

func TestFormWorkflow_currentStepRequestorFollowupNonAdmin(t *testing.T) {
	res := getFormWorkflow(RootURL + `api/formWorkflow/530/currentStep?masquerade=nonAdmin`)

	got := res[-2].UserMetadata.Email
	want := "Alysa.Dare@fake-email.com"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	got = res[-2].UserMetadata.FirstName
	want = "Alysa"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	got = res[-2].UserMetadata.LastName
	want = "Dare"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	got = *res[-2].ApproverName
	want = "Alysa Dare"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	got = *res[-2].ApproverUID
	want = "Alysa.Dare@fake-email.com"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}

	// Request with an initiator who has a disabled account
	res = getFormWorkflow(RootURL + `api/formWorkflow/509/currentStep?masquerade=nonAdmin`)

	got = *res[-2].ApproverName
	want = "Tracy O'Hane"
	if !cmp.Equal(got, want) {
		t.Errorf("Description = %v, want = %v", got, want)
	}
}

func TestFormWorkflow_ChangeStepDifferentWorkflow(t *testing.T) {

	// Move record 17 to step 7, which is in a different workflow
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("stepID", "7")
	postData.Set("comment", "")
	_, err := client.PostForm(RootURL+`api/formWorkflow/17/step`, postData)
	if err != nil {
		t.Errorf("api/formWorkflow/17/step could not change step")
	}

	// Verify that the record includes correct dependency data for record 17
	res, _ := getFormQuery(RootURL + `api/form/query?q={"terms":[{"id":"recordID","operator":"=","match":"17","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["unfilledDependencies"],"sort":{}}`)

	if _, exists := res[17].UnfilledDependencyData["1"]; !exists {
		t.Errorf("Record 17 should include unfilledDependencyData['1']")
	}
}
