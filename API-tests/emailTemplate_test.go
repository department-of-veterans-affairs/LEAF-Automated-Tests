package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func TestEmailTemplatesPost(t *testing.T) {

	// Create the form data
	file := "file"
	subjectFile := "subjectFile"
	emailToFile := "emailToFile"
	emailCcFile := "emailCcFile"
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("file", file)
	postData.Set("subjectFile", subjectFile)
	postData.Set("subjectFileName", `LEAF_notify_next_subject.tpl`)
	postData.Set("emailToFile", emailToFile)
	postData.Set("emailToFileName", `LEAF_notify_next_emailTo.tpl`)
	postData.Set("emailCcFile", emailCcFile) // Empty string is better for empty values
	postData.Set("emailCcFileName", `LEAF_notify_next_emailCc.tpl`)

	//client.Header.Set("Referer", RootURL)
	// Make the POST request
	res, err := client.PostForm(RootURL+`api/emailTemplates/_LEAF_notify_next_body.tpl`, postData)
	//req, err := http.NewRequest("POST", fullURL, strings.NewReader(postData.Encode()))
	//req, err := &http.NewRequest("POST", fullURL, strings.NewReader(postData.Encode()))
	//req.Header.Set("HTTP_REFERER", RootURL+`admin`)
	//req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	//res, err := client.Do(req)
	if err != nil {
		t.Fatalf("Error making POST request: %v", err)
	}
	defer res.Body.Close()

	// Read the response body
	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		t.Fatalf("Error reading response body: %v", err)
	}
	body := string(bodyBytes) // Convert bytes to string

	// Assertions
	if res.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d, but got %d", http.StatusOK, res.StatusCode)
	}

	expectedResponse := "null"
	if body != expectedResponse {
		t.Errorf("Expected response '%s', but got '%s'", expectedResponse, body)
	}

	res, _ = client.Get(RootURL + `api/emailTemplates/_LEAF_notify_next_body.tpl`)
	b, _ := io.ReadAll(res.Body)
	var EmailTemplate EmailTemplateResponse

	err = json.Unmarshal(b, &EmailTemplate)
	t.Log(EmailTemplate)

	if err != nil {
		t.Fatalf("Error making GET request: %v", err)
	}

	if !cmp.Equal(EmailTemplate.EmailCcFile, emailCcFile) {
		t.Errorf("Did not find expected EmailCcFile.  got = %v, want = %v", EmailTemplate.EmailCcFile, emailCcFile)
	}

	if !cmp.Equal(EmailTemplate.EmailToFile, emailToFile) {
		t.Errorf("Did not find expected EmailToFile.  got = %v, want = %v", EmailTemplate.EmailToFile, emailToFile)
	}

	if !cmp.Equal(EmailTemplate.File, file) {
		t.Errorf("Did not find expected File.  got = %v, want = %v", EmailTemplate.File, file)
	}

	if !cmp.Equal(EmailTemplate.SubjectFile, subjectFile) {
		t.Errorf("Did not find expected SubjectFile.  got = %v, want = %v", EmailTemplate.SubjectFile, subjectFile)
	}

}
