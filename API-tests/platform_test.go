package main

import (
	"encoding/json"
	"io"
	"log"
	"testing"

	"github.com/google/go-cmp/cmp"
)

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

func TestPlatform_getOrgchartTags(t *testing.T) {
	portals := getOrgchartImportTags(RootOrgchartURL + `api/platform/portal/_LEAF_Nexus`)

	count := len(portals)
	retrieved := 1

	if !cmp.Equal(count, retrieved) {
		t.Errorf("Array size = %v, wanted = %v", count, retrieved)
	}

	got := portals[0].LaunchpadID
	want := 0
	if !cmp.Equal(got, want) {
		t.Errorf("LaunchpadId = %v, want = %v", got, want)
	}

	received := portals[0].Site_path
	wanted := "/LEAF_Request_Portal"
	if !cmp.Equal(received, wanted) {
		t.Errorf("Site Path = %v, want = %v", received, wanted)
	}

	received = portals[0].OrgchartImportTags[0]
	wanted = "Academy_Demo1"
	if !cmp.Equal(received, wanted) {
		t.Errorf("Tag = %v, want = %v", received, wanted)
	}
}
