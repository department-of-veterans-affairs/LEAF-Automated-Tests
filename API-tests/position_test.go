package main

import (
	"encoding/json"
	"testing"
)

func TestPositionTitleExists(t *testing.T) {
	// Fetch data from API endpoint
	resp, err := client.Get(NationalOrgchartURL + `api/position/search?q=username:tester&employeeSearch=1&noLimit=1`)
	if err != nil {
		t.Fatalf("failed to fetch data: %v", err)
	}

	// Decode JSON response
	var positionData []map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&positionData)
	if err != nil {
		t.Fatalf("failed to decode JSON: %v", err)
	}
	t.Log(positionData)
	// Close response body
	defer resp.Body.Close()

	// Check if position title exists in data
	for _, position := range positionData {
		t.Log(position)
		if position["positionTitle"] == "Associate Director of Patient Care Servicess" {
			t.Logf("Position title '%s' found", position["positionTitle"])
		} else {
			t.Errorf("Position title '%s' not found", position["positionTitle"])
		}
	}
}
