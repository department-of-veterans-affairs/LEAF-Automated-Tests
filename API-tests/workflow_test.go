package main

import (
	"encoding/json"
	"io"
	"strconv"
	"log"
	"net/url"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func getWorkflowStep(url string) WorkflowStep {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m WorkflowStep
	err := json.Unmarshal(b, &m)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func setStepCoordinates(stepID string, x string, y string) string {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("stepID", stepID)
	postData.Set("x", x)
	postData.Set("y", y)

	res, _ := client.PostForm(RootURL+`api/workflow/1/editorPosition`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

func TestWorkflow_No_Negative_Step_Coordinates(t *testing.T) {
	res := setStepCoordinates("1", "-100", "-100")

	got := res
	want := "1"
	if !cmp.Equal(got, want) {
		t.Errorf("Error updating step position = %v, want = %v", got, want)
	}

	workflowStep := getWorkflowStep(RootURL + "api/workflow/step/1")
	got = strconv.Itoa(workflowStep.PosX)
	want = "0"
	if !cmp.Equal(got, want) {
		t.Errorf("Saved X position should have min possible value of 0 = %v, want = %v", got, want)
	}
	got = strconv.Itoa(workflowStep.PosY)
	want = "0"
	if !cmp.Equal(got, want) {
		t.Errorf("Saved Y position should have min possible value of 0 = %v, want = %v", got, want)
	}
}