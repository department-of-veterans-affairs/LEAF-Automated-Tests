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

// this test verifies the platform endpoint only returns portals that have
// SQL-safe portal_database values.
func TestPlatform_getOrgchartTags_filtersUnsafePortalDatabases(t *testing.T) {
	db := getDB()
	defer db.Close()

	_, err := db.Exec("USE national_leaf_launchpad")
	if err != nil {
		t.Fatalf("failed to switch to launchpad DB: %v", err)
	}

	validSitePath := "/LEAF_5681_SafePortal"
	unsafeSitePath := "/LEAF_5681_UnsafePortal"

	t.Cleanup(func() {
		_, cleanupErr := db.Exec(
			`DELETE FROM sites WHERE site_path IN (?, ?)`,
			validSitePath,
			unsafeSitePath,
		)
		if cleanupErr != nil {
			t.Logf("cleanup warning: could not remove test sites: %v", cleanupErr)
		}
	})

	_, err = db.Exec(
		`INSERT INTO sites
			(launchpadID, site_type, site_path, site_uploads, portal_database, orgchart_path, orgchart_database, decommissionTimestamp)
		VALUES
			(0, "portal", ?, "/var/www/html/LEAF_Request_Portal/UPLOADS_test", ?, "/Test_Nexus", ?, 0)`,
		validSitePath,
		testPortalDbName,
		testNexusDbName,
	)
	if err != nil {
		t.Fatalf("failed to insert safe test portal: %v", err)
	}

	_, err = db.Exec(
		`INSERT INTO sites
			(launchpadID, site_type, site_path, site_uploads, portal_database, orgchart_path, orgchart_database, decommissionTimestamp)
		VALUES
			(0, "portal", ?, "/var/www/html/LEAF_Request_Portal/UPLOADS_test", ?, "/Test_Nexus", ?, 0)`,
		unsafeSitePath,
		"leaf_portal_API_testing;DROP_DATABASE",
		testNexusDbName,
	)
	if err != nil {
		t.Fatalf("failed to insert unsafe test portal: %v", err)
	}

	portals := getOrgchartImportTags(RootOrgchartURL + `api/platform/portal`)

	foundSafePortal := false
	foundUnsafePortal := false
	for _, portal := range portals {
		if portal.Site_path == validSitePath {
			foundSafePortal = true
		}
		if portal.Site_path == unsafeSitePath {
			foundUnsafePortal = true
		}
	}

	if !foundSafePortal {
		t.Errorf("safe portal %s was unexpectedly filtered out", validSitePath)
	}

	if foundUnsafePortal {
		t.Errorf("unsafe portal %s was unexpectedly returned by ./api/platform/portal", unsafeSitePath)
	}
}
