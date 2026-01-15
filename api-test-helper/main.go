package main

import (
	"fmt"
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
	http.HandleFunc("/api/v1/testLLM", handleRunTestLLM)
	http.HandleFunc("/api/v1/benchLLM", handleBenchLLM)

	http.ListenAndServe(":8000", nil)
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	out := "This is the LEAF api-test-helper"
	log.Println("Sent:", out)
	io.WriteString(w, out)
}

var runningTests = false
var mxRunningTests sync.Mutex

func printLog(w http.ResponseWriter, msg string) {
	log.Println(msg)
	fmt.Fprintln(w, msg)
}

func handleRunTest(w http.ResponseWriter, r *http.Request) {
	modeVerbose := r.URL.Query().Has("-v")

	mxRunningTests.Lock()
	if !runningTests {
		runningTests = true
		printLog(w, "Running API tests: LEAF/API-tester")

		cmdClear := exec.Command("go", "clean", "-testcache")
		cmdClear.Dir = "../API-tests/"
		cmdClear.Run()

		var cmd *exec.Cmd
		if modeVerbose {
			printLog(w, "Running in verbose mode")
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

		printLog(w, "\n")

		// Run Unit tests
		printLog(w, "Running Unit tests: github.com/department-of-veterans-affairs/LEAF/pkg/agent")
		if modeVerbose {
			printLog(w, "Running in verbose mode")
			cmd = exec.Command("go", "test", "-v")
		} else {
			cmd = exec.Command("go", "test")
		}
		cmd.Dir = "../pkg/agent"
		pipe, err = cmd.StdoutPipe()
		if err != nil {
			log.Println(err)
		}
		cmd.Start()
		io.Copy(w, pipe)
		cmd.Wait()

		runningTests = false
		mxRunningTests.Unlock()
	} else {
		io.WriteString(w, "Already running tests")
	}
}

func handleRunTestLLM(w http.ResponseWriter, r *http.Request) {
	modeVerbose := r.URL.Query().Has("-v")

	mxRunningTests.Lock()
	if !runningTests {
		runningTests = true
		printLog(w, "Running API tests: LEAF/LEAF_Agent (LLM tests)")

		cmdClear := exec.Command("go", "clean", "-testcache")
		cmdClear.Dir = "../LEAF_Agent"
		cmdClear.Run()

		var cmd *exec.Cmd
		if modeVerbose {
			printLog(w, "Running in verbose mode")
			cmd = exec.Command("go", "test", "-v")
		} else {
			cmd = exec.Command("go", "test")
		}

		cmd.Dir = "../LEAF_Agent"
		pipe, err := cmd.StdoutPipe()
		if err != nil {
			log.Println(err)
		}
		cmd.Start()
		io.Copy(w, pipe)
		cmd.Wait()

		runningTests = false
		mxRunningTests.Unlock()
	} else {
		io.WriteString(w, "Already running tests")
	}
}

func handleBenchLLM(w http.ResponseWriter, r *http.Request) {
	modeVerbose := r.URL.Query().Has("-v")

	mxRunningTests.Lock()
	if !runningTests {
		runningTests = true
		printLog(w, "Running LLM Benchmark: LEAF/LEAF_Agent")

		var cmd *exec.Cmd
		if modeVerbose {
			printLog(w, "Running in verbose mode")
			cmd = exec.Command("go", "test", "-bench=.", "-benchtime=5s", "-v")
		} else {
			cmd = exec.Command("go", "test", "-bench=.", "-benchtime=5s")
		}

		cmd.Dir = "../LEAF_Agent"
		pipe, err := cmd.StdoutPipe()
		if err != nil {
			log.Println(err)
		}
		cmd.Start()
		io.Copy(w, pipe)
		cmd.Wait()

		runningTests = false
		mxRunningTests.Unlock()
	} else {
		io.WriteString(w, "Already running LLM benchmark")
	}
}
