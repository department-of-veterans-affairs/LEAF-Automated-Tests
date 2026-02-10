package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
)

var origPortalDbName, origNexusDbName string
var origNexusDbNameForNexus string
var mysqlDSN = dbUsername + ":" + dbPassword + "@(" + dbHost + ")/?multiStatements=true"

// setupTestDB creates a predefined test database and reroutes the DB in a standard LEAF dev environment
func setupTestDB() {
	// Setup test database
	db, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		log.Fatal("Couldn't open database, check DSN: ", err.Error())
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Can't ping database: ", err.Error())
	}

	// Prep switchover to test DB
	f, err := os.ReadFile("database/portal_test_db.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importPortalSql := string(f)

	f, err = os.ReadFile("database/nexus_test_db.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importNexusSql := string(f)

	f, err = os.ReadFile("database/library_test_db.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importLibrarySql := string(f)

	f, err = os.ReadFile("database/platform_privacy_test_db.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importPlatformPrivSql := string(f)

	db.Exec("USE national_leaf_launchpad")

	// Get original DB config
	err = db.QueryRow(`SELECT portal_database, orgchart_database FROM sites
					WHERE site_path="/LEAF_Request_Portal"`).
		Scan(&origPortalDbName, &origNexusDbName)
	if err != nil {
		log.Fatal("Unable to read database: national_leaf_launchpad.sites. " + err.Error())
	}

	db.QueryRow(`SELECT orgchart_database FROM sites
					WHERE site_path="/LEAF_Request_Portal"`).
		Scan(&origNexusDbNameForNexus)

	// Load test DBs
	db.Exec("DROP DATABASE " + testPortalDbName)
	db.Exec("CREATE DATABASE " + testPortalDbName)
	db.Exec("USE " + testPortalDbName)
	db.Exec(importPortalSql)

	db.Exec("DROP DATABASE " + testNexusDbName)
	db.Exec("CREATE DATABASE " + testNexusDbName)
	db.Exec("USE " + testNexusDbName)
	db.Exec(importNexusSql)

	db.Exec("DROP DATABASE " + testLibraryDbName)
	db.Exec("CREATE DATABASE " + testLibraryDbName)
	db.Exec("USE " + testLibraryDbName)
	db.Exec(importLibrarySql)

	db.Exec("DROP DATABASE " + testPlatformPrivacyDbName)
	db.Exec("CREATE DATABASE " + testPlatformPrivacyDbName)
	db.Exec("USE " + testPlatformPrivacyDbName)
	db.Exec(importPlatformPrivSql)

	// Switch to test DB
	db.Exec("USE national_leaf_launchpad")

	_, err = db.Exec(`UPDATE sites
						SET portal_database = ?,
							orgchart_database = ?
						WHERE site_path="/LEAF_Request_Portal"`,
		testPortalDbName,
		testNexusDbName)
	if err != nil {
		log.Fatal("Could not update database: " + err.Error())
	}
	db.Exec(`UPDATE sites
				SET orgchart_database = ?
				WHERE site_path="/LEAF_Nexus"`,
		testNexusDbName)

	err = db.QueryRow(`SELECT portal_database FROM sites
				WHERE portal_database="leaf_library_testing"`).
	Scan(&testLibraryDbName)
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = db.Exec(
			`INSERT INTO sites (launchpadID, site_type, site_path, site_uploads, portal_database, orgchart_path, orgchart_database, decommissionTimestamp)
			VALUES (0, "portal", "/LEAF/library", "/var/www/LEAF_library_test_uploads/", ?,	"/LEAF_NationalNexus", ?, 0)`,
			testLibraryDbName,
			testNationalNexusDbName,
		)
	}

	err = db.QueryRow(`SELECT portal_database FROM sites
			WHERE portal_database="leaf_platform_privacy_testing"`).
	Scan(&testPlatformPrivacyDbName)
	if err != nil && err.Error() == "sql: no rows in result set" {
		_, err = db.Exec(
			`INSERT INTO sites (launchpadID, site_type, site_path, site_uploads, portal_database, orgchart_path, orgchart_database, decommissionTimestamp)
			VALUES (0, "portal", "/platform/privacy", "/var/www/html/LEAF_Request_Portal/UPLOADS_test/", ?,	"/LEAF_NationalNexus", ?, 0)`,
			testPlatformPrivacyDbName,
			testNationalNexusDbName,
		)
	}
}

func updateTestDBSchema() {
	fmt.Print("Updating DB Schema: Request Portal... ")
	res, _ := httpGet(RootURL + `scripts/updateDatabase.php`)
	if strings.Contains(res, `Db Update failed`) {
		log.Fatal(`Could not update Request Portal schema: ` + res)
	}
	fmt.Println("OK")

	fmt.Print("Updating DB Schema: Local Nexus (Orgchart)... ")
	res, _ = httpGet(RootOrgchartURL + `scripts/updateDatabase.php`)
	if strings.Contains(res, `Db Update failed`) {
		log.Fatal(`Could not update Nexus (Orgchart) schema: ` + res)
	}
	fmt.Println("OK")

	fmt.Print("Updating DB Schema: National Nexus (Orgchart)... ")
	//the LEAF_Nexus dir maps to the LEAF_NationalNexus, LEAF_Nexus and Test_Nexus docker volumes
	res, _ = httpGet(NationalOrgchartURL + `scripts/updateDatabase.php`)
	if strings.Contains(res, `Db Update failed`) {
		log.Fatal(`Could not update Nexus (Orgchart) schema: ` + res)
	}
	fmt.Println("OK")

	//LEAF_Request_Portal dir maps to:
	//LEAF_Request_Portal, Test_Request_Portal, LEAF/library, platform/privacy Docker volumes
	fmt.Print("Updating DB Schema: LEAF Library ... ")
	res, _ = httpGet(LibraryURL + `scripts/updateDatabase.php`)
	if strings.Contains(res, `Db Update failed`) {
		log.Fatal(`Could not update LEAF Library schema: ` + res)
	}
	fmt.Println("OK")

	fmt.Print("Updating DB Schema: LEAF Platform Privacy ... ")
	res, _ = httpGet(PlatformPrivacyURL + `scripts/updateDatabase.php`)
	if strings.Contains(res, `Db Update failed`) {
		log.Fatal(`Could not update LEAF Plaform Privacy schema: ` + res)
	}
	fmt.Println("OK")
}

// teardownTestDB reroutes the standard LEAF dev environment back to the original configuration
func teardownTestDB() {
	db, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		log.Fatal("Can't connect to database: ", err.Error())
	}
	defer db.Close()

	// Switch back to original DB
	db.Exec("USE national_leaf_launchpad")

	_, err = db.Exec(`UPDATE sites
						SET portal_database = ?,
							orgchart_database = ?
						WHERE site_path="/LEAF_Request_Portal"`,
		origPortalDbName,
		origNexusDbName)
	if err != nil {
		log.Fatal("Could not update database: " + err.Error())
	}
	db.Exec(`UPDATE sites
				SET orgchart_database = ?
				WHERE site_path="/LEAF_Nexus"`,
		origNexusDbNameForNexus)
}
