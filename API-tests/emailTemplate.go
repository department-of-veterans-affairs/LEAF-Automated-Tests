package main

type EmailTemplateResponse struct { // No longer a slice
	EmailCcFile string `json:"emailCcFile"`
	EmailToFile string `json:"emailToFile"`
	File        string `json:"file"`
	Modified    int    `json:"modified"`
	SubjectFile string `json:"subjectFile"`
}
