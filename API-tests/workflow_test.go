package main

import (
	"encoding/json"
	"io"
	"log"
	"net/url"
	"net/http"
	"strings"
	"strconv"
	"testing"

	"github.com/google/go-cmp/cmp"
)

var commonWorkflow = Workflow{
	WorkflowID:    0,
	InitialStepID: 0,
	Description:   "Go API Test Workflow",
}
var commonWorkflowStep = WorkflowStep{
	StepID:			0,
	StepTitle:		"Go API Test Step",
}
var commonDependencies = WorkflowDependencies{
	{DependencyID: -1, Description: "Person Designated"},
	{DependencyID: -2, Description: "Requestor Followup"},
	{DependencyID: -3, Description: "Group Designated"},
	{DependencyID: 1, Description: "Service Chief"},
	{DependencyID: 8, Description: "Quadrad"},
}

func getWorkflowStep(stepID string) WorkflowStep {
	res, _ := client.Get(RootURL + "api/workflow/step/" + stepID)
	b, _ := io.ReadAll(res.Body)

	var m WorkflowStep
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func getWorkflowStepDependencies(stepID string) WorkflowStepDependencies {
	res, _ := client.Get(RootURL + "api/workflow/step/" + stepID + "/dependencies")
	b, _ := io.ReadAll(res.Body)

	var m WorkflowStepDependencies
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func setStepCoordinates(workflowID string, stepID string, x string, y string) string {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("stepID", stepID)
	postData.Set("x", x)
	postData.Set("y", y)

	res, _ := client.PostForm(RootURL+`api/workflow/`+workflowID+`/editorPosition`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

func TestWorkflow_Set_Step_Coordinates(t *testing.T) {
	//negative coords use min val of 0
	got := setStepCoordinates("1", "1", "-100", "-100")
	want := "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error setting step position = %v, want = %v", got, want)
	}

	workflowStep := getWorkflowStep("1")
	got = strconv.Itoa(workflowStep.PosX)
	want = "0"
	if !cmp.Equal(got, want) {
		t.Errorf("Saved X position should have min possible value of 0 = %v, want = %v", got, want)
	}
	got = strconv.Itoa(workflowStep.PosY)
	if !cmp.Equal(got, want) {
		t.Errorf("Saved Y position should have min possible value of 0 = %v, want = %v", got, want)
	}

	//positive coords should save as given
	got = setStepCoordinates("1", "1", "200", "500")
	want = "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error setting step position = %v, want = %v", got, want)
	}

	workflowStep = getWorkflowStep("1")
	got = strconv.Itoa(workflowStep.PosX)
	want = "200"
	if !cmp.Equal(got, want) {
		t.Errorf("Saved X position did not match input = %v, want = %v", got, want)
	}
	got = strconv.Itoa(workflowStep.PosY)
	want = "500"
	if !cmp.Equal(got, want) {
		t.Errorf("Saved Y position did not match input = %v, want = %v", got, want)
	}
}

func TestWorkflow_Step_Actions(t *testing.T) {
	res, _ := client.Get(RootURL + "api/workflow/step/2/actions")
	b, _ := io.ReadAll(res.Body)

	var data StepActions
	err := json.Unmarshal(b, &data)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}

	mockData := StepActions{
		StepAction{ActionType: "approve", ActionText: "Approve"},
		StepAction{ActionType: "Note", ActionText: "Note"},
	}

	if !cmp.Equal(data, mockData) {
		t.Errorf("TestWorkflow_Step_Actions want = %v, got = %v", mockData, data)
	}
}

func TestWorkflow_PreventModifyReservedRequirements(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)

	// -4 is a reserved requirement ID
	// this should fail with a HTTP 400 error
	res, _ := client.PostForm(RootURL+`api/workflow/dependency/-4`, postData)

	if res.StatusCode != 400 {
		t.Errorf("Expected status code 400, got %v", res.StatusCode)
	}

	res, _ = client.PostForm(RootURL+`api/workflow/dependency/-4/privileges`, postData)

	if res.StatusCode != 400 {
		t.Errorf("Expected status code 400, got %v", res.StatusCode)
	}
}


func TestWorkflow_NewWorkflow(t *testing.T) {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("description", commonWorkflow.Description)

	res, _ := client.PostForm(RootURL+`api/workflow/new`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var workflowID string
	err := json.Unmarshal(b, &workflowID)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	workflowIDInt, err := strconv.Atoi(workflowID)
	if err != nil || workflowIDInt <= 0 {
		t.Errorf("Expected valid workflow ID, got %v", workflowID)
	}
	commonWorkflow.WorkflowID = workflowIDInt
}

func TestWorkflow_NewWorkflowStep(t *testing.T) {
	if(commonWorkflow.WorkflowID == 0) {
		t.Errorf("commonWorkflow.WorkflowID is 0, cannot create step without valid workflow ID")
	}

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("stepTitle", commonWorkflowStep.StepTitle)

	workflowIDStr := strconv.Itoa(commonWorkflow.WorkflowID)
	res, _ := client.PostForm(RootURL+`api/workflow/` + workflowIDStr + `/step`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var stepID string
	err := json.Unmarshal(b, &stepID)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	stepIDInt, err := strconv.Atoi(stepID)
	if err != nil || stepIDInt <= 0 {
		t.Errorf("Expected valid step ID, got %v", stepID)
	}
	commonWorkflow.InitialStepID = stepIDInt
	commonWorkflowStep.StepID = stepIDInt
}

func TestWorkflow_NewDependency(t *testing.T) {
	depDescription := "Test API Dependency"

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("description", depDescription)

	res, _ := client.PostForm(RootURL+`api/workflow/dependencies`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var dependencyID string
	err := json.Unmarshal(b, &dependencyID)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	dependencyIDInt, err := strconv.Atoi(dependencyID)
	if err != nil || dependencyIDInt <= 0 {
		t.Errorf("Expected valid dependency ID, got %v", dependencyID)
	}
	commonDependencies = append(
		commonDependencies,
		WorkflowDependency{DependencyID: dependencyIDInt, Description: depDescription},
	)
}

func TestWorkflow_AddStepDependenciesToWorkflowStep(t *testing.T) {
	if(commonWorkflowStep.StepID == 0) {
		t.Errorf("commonWorkflowStep.StepID is 0, cannot add dependency without valid ID")
	}

	workflowIDStr := strconv.Itoa(commonWorkflow.WorkflowID)
	stepIDStr := strconv.Itoa(commonWorkflowStep.StepID)

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("workflowID", workflowIDStr)

	for _, dep := range commonDependencies {
		dependencyIDStr := strconv.Itoa(dep.DependencyID)
		postData.Set("dependencyID", dependencyIDStr)

		res, _ := client.PostForm(RootURL+`api/workflow/step/` + stepIDStr + `/dependencies`, postData)
		if res.StatusCode != 200 {
			t.Errorf("Expected status code 200, got %v", res.StatusCode)
		}
		b, _ := io.ReadAll(res.Body)
		defer res.Body.Close()

		var result string
		err := json.Unmarshal(b, &result)
		if err != nil {
			t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
		}

		got := result
		want := "1"
		if !cmp.Equal(got, want) {
			t.Errorf("Error adding requirement type = %v, got = %v, want = %v", dep.Description, got, want)
		}
	}
}

func TestWorkflow_SetCustomDependencyGroupPrivileges(t *testing.T) {
	newDependency := commonDependencies[len(commonDependencies)-1]
	newDependencyIDStr := strconv.Itoa(newDependency.DependencyID)
	if(newDependency.DependencyID <= 8) {
		t.Errorf("Did not get expected new dependencyID, got %v", newDependencyIDStr)
	}

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("groupID", "206")//standard DB test group, 'Group A'

	res, _ := client.PostForm(RootURL+`api/workflow/dependency/` + newDependencyIDStr + `/privileges`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var result string
	err := json.Unmarshal(b, &result)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	got := result
	want := "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error setting custom group privileges for dependencyID = %v, got = %v, want = %v", newDependencyIDStr, got, want)
	}
}

func TestWorkflow_SetStepPersonDesignatedField(t *testing.T) {
	if(commonWorkflowStep.StepID == 0) {
		t.Errorf("commonWorkflowStep.StepID is 0, cannot set person designated field without valid ID")
	}

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("indicatorID", "8")//standard test database ID

	stepIDStr := strconv.Itoa(commonWorkflowStep.StepID)
	res, _ := client.PostForm(RootURL+`api/workflow/step/` + stepIDStr + `/indicatorID_for_assigned_empUID`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var result string
	err := json.Unmarshal(b, &result)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	got := result
	want := "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error setting person designated field for step = %v, got = %v, want = %v", stepIDStr, got, want)
	}
}

func TestWorkflow_SetStepGroupDesignatedField(t *testing.T) {
	if(commonWorkflowStep.StepID == 0) {
		t.Errorf("commonWorkflowStep.StepID is 0, cannot set group designated field without valid ID")
	}

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("indicatorID", "9")//standard test database ID

	stepIDStr := strconv.Itoa(commonWorkflowStep.StepID)
	res, _ := client.PostForm(RootURL+`api/workflow/step/` + stepIDStr + `/indicatorID_for_assigned_groupID`, postData)
	if res.StatusCode != 200 {
		t.Errorf("Expected status code 200, got %v", res.StatusCode)
	}
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var result string
	err := json.Unmarshal(b, &result)
	if err != nil {
		t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
	}
	got := result
	want := "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error setting group designated field for step = %v, got = %v, want = %v", stepIDStr, got, want)
	}
}

func TestWorkflow_StepDependencyConfig(t *testing.T) {
	if(commonWorkflowStep.StepID == 0) {
		t.Errorf("commonWorkflowStep.StepID is 0, cannot set group designated field without valid ID")
	}
	stepIDStr := strconv.Itoa(commonWorkflowStep.StepID)
	stepConfig := getWorkflowStepDependencies(stepIDStr)
	num := len(stepConfig)
	log.Printf("got: %v", num)
}

func TestWorkflow_RemoveStepDependenciesFromWorkflowStep(t *testing.T) {
	if(commonWorkflowStep.StepID == 0) {
		t.Errorf("commonWorkflowStep.StepID is 0, cannot get dependencies without valid ID")
	}
	workflowIDStr := strconv.Itoa(commonWorkflow.WorkflowID)
	stepIDStr := strconv.Itoa(commonWorkflowStep.StepID)

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("workflowID", workflowIDStr)

	for _, dep := range commonDependencies {
		dependencyIDStr := strconv.Itoa(dep.DependencyID)
		postData.Set("dependencyID", dependencyIDStr)

		params := "?dependencyID=" + dependencyIDStr + "&workflowID=" + workflowIDStr + "&CSRFToken=" + CsrfToken
		req, err := http.NewRequest("DELETE", RootURL+`api/workflow/step/` + stepIDStr + `/dependencies` + params, strings.NewReader(postData.Encode()))
		if err != nil {
			t.Errorf("Error creating DELETE request: %v", err)
		}
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		res, err := client.Do(req)
		if err != nil {
			t.Errorf("Error sending delete request: %v", err)
		}
		if res.StatusCode != 200 {
			t.Errorf("Expected status code 200, got %v", res.StatusCode)
		}
		b, _ := io.ReadAll(res.Body)
		defer res.Body.Close()

		var result string
		err = json.Unmarshal(b, &result)
		if err != nil {
			t.Errorf("JSON parsing error, couldn't parse: %v", string(b))
		}

		got := result
		want := "1"
		if !cmp.Equal(got, want) {
			t.Errorf("Error removing requirement type = %v, got = %v, want = %v", dep.Description, got, want)
		}
	}
}
