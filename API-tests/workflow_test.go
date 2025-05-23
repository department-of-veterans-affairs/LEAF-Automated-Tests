package main

import (
	"encoding/json"
	"io"
	"log"
	"net/url"
	"strconv"
	"testing"

	"github.com/google/go-cmp/cmp"
)

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
