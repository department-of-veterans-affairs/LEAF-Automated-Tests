package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
)

var origPortalDbName, origNexusDbName string
var origNexusDbNameForNexus string
var mysqlDSN = dbUsername + ":" + dbPassword + "@(" + dbHost + ")/?multiStatements=true"

func getDB() *sql.DB {
	db, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		log.Fatal("Couldn't open database, check DSN: ", err.Error())
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("Can't ping database: ", err.Error())
	}

	return db
}

// setupTestDB creates a predefined test database and reroutes the DB in a standard LEAF dev environment
func setupTestDB() {
	// Setup test database
	db := getDB()
	defer db.Close()

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

	f, err = os.ReadFile("database/portal_agent_db.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importPortalAgentSql := string(f)

	f, err = os.ReadFile("database/portal_national_leaf_launchpad.sql")
	if err != nil {
		log.Fatal("Couldn't open the file: ", err.Error())
	}
	importSitesTable := string(f)

	// Setup launchpad DB (index of sites)
	db.Exec("USE national_leaf_launchpad")
	db.Exec(importSitesTable) // Update sites table

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
	wg := sync.WaitGroup{}
	wg.Add(3)

	go func() {
		defer wg.Done()

		db := getDB()
		defer db.Close()
		db.Exec("DROP DATABASE " + testPortalDbName)
		db.Exec("CREATE DATABASE " + testPortalDbName)
		db.Exec("USE " + testPortalDbName)
		db.Exec(importPortalSql)
	}()

	go func() {
		defer wg.Done()

		db := getDB()
		defer db.Close()
		db.Exec("DROP DATABASE " + testNexusDbName)
		db.Exec("CREATE DATABASE " + testNexusDbName)
		db.Exec("USE " + testNexusDbName)
		db.Exec(importNexusSql)
	}()

	go func() {
		defer wg.Done()

		db := getDB()
		defer db.Close()
		db.Exec("DROP DATABASE leaf_agent")
		db.Exec("CREATE DATABASE leaf_agent")
		db.Exec("USE leaf_agent")
		db.Exec(importPortalAgentSql)
	}()
	wg.Wait()

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
}

func updateTestDBSchema() {
	wg := sync.WaitGroup{}
	wg.Add(4)

	go func() {
		defer wg.Done()

		res, _ := httpGet(RootURL + `scripts/updateDatabase.php`)
		if strings.Contains(res, `Db Update failed`) {
			log.Fatal(`Could not update Request Portal schema: ` + res)
		}
		fmt.Println("Updated DB Schema: Request Portal... OK")
	}()

	go func() {
		defer wg.Done()

		res, _ := httpGet(RootOrgchartURL + `scripts/updateDatabase.php`)
		if strings.Contains(res, `Db Update failed`) {
			log.Fatal(`Could not update Nexus (Orgchart) schema: ` + res)
		}
		fmt.Println("Updated DB Schema: Local Nexus (Orgchart)... OK")
	}()

	go func() {
		defer wg.Done()

		res, _ := httpGet(NationalOrgchartURL + `scripts/updateDatabase.php`)
		if strings.Contains(res, `Db Update failed`) {
			log.Fatal(`Could not update Nexus (Orgchart) schema: ` + res)
		}
		fmt.Println("Updated DB Schema: National Nexus (Orgchart)... OK")
	}()

	go func() {
		defer wg.Done()

		// Update DB Schema: Portal Agent
		res, _ := httpGet(HostURL + `/platform/agent/scripts/updateDatabase.php`)
		if strings.Contains(res, `Db Update failed`) {
			log.Fatal(`Could not update Platform Agent schema: ` + res)
		}
		fmt.Println("Updated DB Schema: Agent... OK")
	}()
	wg.Wait()
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
