package main

import (
	"io"
	"log"
	"net/http"
	"os/exec"
	"sync"
)

func main() {
	log.Println("Starting LEAF api-test-helper...")
	http.HandleFunc("/", handleIndex)
	http.HandleFunc("/api/v1/test", handleRunTest)

	http.ListenAndServe(":8000", nil)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	out := "This is the LEAF api-test-helper"
	log.Println("Sent:", out)
	io.WriteString(w, out)
}

var runningTests = false
var mxRunningTests sync.Mutex

func handleRunTest(w http.ResponseWriter, r *http.Request) {
	modeVerbose := r.URL.Query().Has("-v")

	mxRunningTests.Lock()
	if !runningTests {
		runningTests = true
		log.Println("Starting a test run")

		cmdClear := exec.Command("go", "clean", "-testcache")
		cmdClear.Dir = "../API-tests/"
		cmdClear.Run()

		var cmd *exec.Cmd
		if modeVerbose {
			log.Println("Running in verbose mode")
			cmd = exec.Command("go", "test", "-v")
		} else {
			cmd = exec.Command("go", "test")
		}

		cmd.Dir = "../API-tests/"
		pipe, err := cmd.StdoutPipe()
		if err != nil {
			log.Println(err)
		}
		cmd.Start()
		io.Copy(w, pipe)
		cmd.Wait()

		runningTests = false
		mxRunningTests.Unlock()
		log.Println("Completed test run")
	} else {
		io.WriteString(w, "Already running tests")
	}
}
