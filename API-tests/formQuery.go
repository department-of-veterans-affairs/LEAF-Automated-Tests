package main

type FormQueryResponse map[int]FormQueryRecord

type FormQueryData map[string]any

type FormQuery_Orgchart_Employee struct {
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	MiddleName string `json:"middleName"`
	Email      string `json:"email"`
	UserName   string `json:"userName"`
	EmpUID     int    `json:"empUID"`
}

type FormQueryRecord struct {
	RecordID                int                         `json:"recordID"`
	ServiceID               int                         `json:"serviceID"`
	Date                    int                         `json:"date"`
	UserID                  string                      `json:"userID"`
	Title                   string                      `json:"title"`
	Priority                int                         `json:"priority"`
	LastStatus              string                      `json:"lastStatus"`
	Submitted               int                         `json:"submitted"`
	Deleted                 int                         `json:"deleted"`
	IsWritableUser          int                         `json:"isWritableUser"`
	IsWritableGroup         int                         `json:"isWritableGroup"`
	UserMetadata            FormQuery_Orgchart_Employee `json:"userMetadata"`
	UserName                string                      `json:"userName"`
	Service                 string                      `json:"service,omitempty"`
	AbbreviatedService      string                      `json:"abbreviatedService,omitempty"`
	GroupID                 int                         `json:"groupID,omitempty"`
	StepID                  int                         `json:"stepID,omitempty"`
	StepType                int                         `json:"stepType,omitempty"` // 1 = Review, 2 = Holding
	BlockingStepID          int                         `json:"blockingStepID,omitempty"`
	LastNotified            string                      `json:"lastNotified,omitempty"`
	InitialNotificationSent int                         `json:"initialNotificationSent,omitempty"`
	StepTitle               string                      `json:"stepTitle,omitempty"`
	CategoryNames           []string                    `json:"categoryNames,omitempty"`
	CategoryIDs             []string                    `json:"categoryIDs,omitempty"`
	DestructionAge          int                         `json:"destructionAge,omitempty"`
	ActionHistory           []FormQueryActionHistory    `json:"action_history,omitempty"`
	S1                      FormQueryData               `json:"s1,omitempty"`
	UnfilledDependencyData  UnfilledDependencyData      `json:"unfilledDependencyData,omitempty"`
	FirstName               string                      `json:"firstName,omitempty"`
	LastName                string                      `json:"lastName,omitempty"`
}

type FormQueryActionHistory struct {
	RecordID            int                         `json:"recordID"`
	StepID              int                         `json:"stepID"`
	UserID              string                      `json:"userID"`
	Time                int                         `json:"time"`
	Description         string                      `json:"description"`
	ActionTextPasttense string                      `json:"actionTextPasttense"`
	ActionType          string                      `json:"actionType"`
	Comment             string                      `json:"comment"`
	ApproverName        string                      `json:"approverName"`
	UserMetadata        FormQuery_Orgchart_Employee `json:"userMetadata"`
}

type UnfilledDependencyData map[string]UnfilledDependency

type UnfilledDependency struct {
	Description  string `json:"description"`
	ApproverName string `json:"approverName"`
	ApproverUID  string `json:"approverUID"`
}
