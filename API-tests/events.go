package main

type WorkflowEventsResponse []WorkflowEvent

type WorkflowEvent struct {
	EventID          string `json:"eventID"`
	EventDescription string `json:"eventDescription"`
	EventType        string `json:"eventType"`
	EventData        string `json:"eventData"`
}

type EmailTemplatesRecord struct {
	DisplayName     string `json:"displayName"`
	FileName        string `json:"fileName"`
	EmailToFileName string `json:"emailToFileName"`
	EmailCcFileName string `json:"emailCcFileName"`
	SubjectFileName string `json:"subjectFileName"`
}

type EmailTemplatesResponse []EmailTemplatesRecord
