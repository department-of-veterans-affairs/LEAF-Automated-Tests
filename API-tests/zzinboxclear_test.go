package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
)

const (
	smtp4devBaseURL = "http://host.docker.internal:5080" // Default smtp4dev address.  Change if yours is different.
)

const defaultMailbox = "default" // Or whatever the correct identifier is

// ClearInbox clears all emails from the smtp4dev inbox.
func ClearInbox() error {
	endpoint := "/api/messages/*"
	urlStr := smtp4devBaseURL + endpoint

	req, err := http.NewRequest("DELETE", urlStr, nil) // Use DELETE method
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK { // Or potentially 204 No Content
		return fmt.Errorf("error deleting messages: %d", resp.StatusCode)
	}

	return nil
}

func GetMessageCount() (int, error) {
	endpoint := "/api/messages"
	urlStr := smtp4devBaseURL + endpoint

	req, err := http.NewRequest("GET", urlStr, nil)
	if err != nil {
		return 0, fmt.Errorf("error creating request: %w", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Parse the JSON response
	var data map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&data)
	if err != nil {
		return 0, fmt.Errorf("error decoding response: %w", err)
	}

	// Access the "rowCount" value
	rowCount, ok := data["rowCount"].(float64)
	if !ok {
		return 0, fmt.Errorf("missing or invalid 'rowCount' field")
	}

	return int(rowCount), nil
}

func TestClearInbox(t *testing.T) {
	// 1. Get initial message count
	_, err := GetMessageCount()
	if err != nil {
		t.Fatalf("Error getting initial message count: %v", err)
	}

	// 2. Clear the inbox
	err = ClearInbox()
	if err != nil {
		t.Fatalf("Error clearing inbox: %v", err)
	}

	// 3. Get final message count
	finalCount, err := GetMessageCount()
	if err != nil {
		t.Fatalf("Error getting final message count: %v", err)
	}

	// 4. Assert that the inbox is empty
	if finalCount != 0 {
		t.Errorf("Inbox not cleared. Final count is %d, expected 0", finalCount)
	}

}
