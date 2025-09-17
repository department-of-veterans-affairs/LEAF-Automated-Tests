package main

import (
	"testing"
)

func TestEmailTemplatesPost(t *testing.T) {
	/*
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

	   res, err := client.PostForm(RootURL+`api/emailTemplates/_LEAF_notify_next_body.tpl`, postData)

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

	   data := url.Values{}
	   data.Set("CSRFToken", CsrfToken)
	   deleteUrl := RootURL + `api/emailTemplates/_LEAF_notify_next_body.tpl?subjectFileName=LEAF_notify_next_subject.tpl&emailToFileName=LEAF_notify_next_emailTo.tpl&emailCcFileName=LEAF_notify_next_emailCc.tpl&CSRFToken=` + CsrfToken

	   req, err := http.NewRequest("DELETE", deleteUrl, strings.NewReader(data.Encode()))
	   req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	   _, err = client.Do(req)

	   	if err != nil {
	   		t.Fatalf("Error making DELETE request: %v", err)
	   	}

	   res, _ = client.Get(RootURL + `api/emailTemplates/_LEAF_notify_next_body.tpl`)
	   b, _ = io.ReadAll(res.Body)

	   var EmailTemplateDel EmailTemplateResponse

	   err = json.Unmarshal(b, &EmailTemplate)
	   t.Log(EmailTemplateDel)

	   	if err != nil {
	   		t.Fatalf("Error making GET request: %v", err)
	   	}

	   	if cmp.Equal(EmailTemplateDel.EmailCcFile, emailCcFile) {
	   		t.Errorf("Did not find expected EmailCcFile.  got = %v, want = %v", EmailTemplateDel.EmailCcFile, emailCcFile)
	   	}

	   	if cmp.Equal(EmailTemplateDel.EmailToFile, emailToFile) {
	   		t.Errorf("Did not find expected EmailToFile.  got = %v, want = %v", EmailTemplateDel.EmailToFile, emailToFile)
	   	}

	   	if cmp.Equal(EmailTemplateDel.File, file) {
	   		t.Errorf("Did not find expected File.  got = %v, want = %v", EmailTemplateDel.File, file)
	   	}

	   	if cmp.Equal(EmailTemplateDel.SubjectFile, subjectFile) {
	   		t.Errorf("Did not find expected SubjectFile.  got = %v, want = %v", EmailTemplateDel.SubjectFile, subjectFile)
	   	}
	*/
}
