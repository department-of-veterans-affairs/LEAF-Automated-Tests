package main

import (
	"encoding/json"
	"io"
	"log"
	"testing"
)

// get all the portal import tags for the given orgchart
func getOrgchartImportTags(url string) PlatformResponse {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m PlatformResponse
	err := json.Unmarshal(b, &m)

	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

// this test gets all the portals for the given orgchart and makes sure that
// Test_Request_Portal is one of the results
func TestPlatform_getOrgchartTags(t *testing.T) {
	portals := getOrgchartImportTags(RootOrgchartURL + `api/platform/portal`)

	foundTestPortal := false
	for _, portal := range portals {
		if portal.Site_path == "/Test_Request_Portal" {
			foundTestPortal = true
			break
		}
	}

	if !foundTestPortal {
		t.Errorf("Test_Request_Portal was not found in orgchart ./api/platform/portal")
	}
}
