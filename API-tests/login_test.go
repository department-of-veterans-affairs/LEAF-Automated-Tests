package main

import (
	"database/sql"
	"io"
	"log"
	"net/http"
	"strings"
	"testing"
)

func TestLogin_DeactivatedLocalUser(t *testing.T) {
	// Setup database connection
	db, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		log.Fatal("Couldn't open database, check DSN: ", err.Error())
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Can't ping database: ", err.Error())
	}

	// Manually mark local employee as inactive
	db.Exec("USE " + testNexusDbName)
	db.Exec(`UPDATE employee SET deleted=1 WHERE userName="tester"`)

	// Attempt to load homepage
	req, _ := http.NewRequest("GET", RootURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46")
	res, err := client.Do(req)
	if err != nil {
		log.Fatal(err)
	}

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		log.Fatal(err)
	}
	body := string(bodyBytes)

	if strings.Index(body, "Your Session Has Expired") > 0 {
		t.Errorf("Client sees session error, want = no error")
	}
}
