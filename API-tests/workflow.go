package main

type Workflow struct {
	WorkflowID    int    `json:"workflowID"`
	InitialStepID int    `json:"initialStepID"`
	Description   string `json:"description"`
}


type WorkflowStep struct {
	WorkflowID                       int    `json:"workflowID"`
	StepID                           int    `json:"stepID"`
	StepTitle                        string `json:"stepTitle"`
	StepBgColor                      string `json:"stepBgColor"`
	StepFontColor                    string `json:"stepFontColor"`
	JsSrc                            string `json:"jsSrc"`
	PosX                             int    `json:"posX"`
	PosY                             int    `json:"posY"`
	IndicatorID_for_assigned_empUID  int    `json:"indicatorID_for_assigned_empUID"`
	IndicatorID_for_assigned_groupID int    `json:"indicatorID_for_assigned_groupID"`
	RequiresDigitalSignature         int    `json:"requiresDigitalSignature"`
	StepData                         string `json:"stepData"`
}

type WorkflowDependency struct {
	DependencyID int    `json:"dependencyID"`
	Description  string `json:"description"`
}
type WorkflowDependencies []WorkflowDependency

type WorkflowStepDependency struct {
	DependencyID                       int    `json:"dependencyID"`
	Description                        string `json:"description"`
	WorkflowID                         int    `json:"workflowID"`
	StepID                             int    `json:"stepID"`
	StepTitle                          string `json:"stepTitle"`
	GroupID                            int    `json:"groupID"`
	Name                               string `json:"name"`
	IndicatorID_for_assigned_empUID    int    `json:"indicatorID_for_assigned_empUID"`
	IndicatorID_for_assigned_groupID   int    `json:"indicatorID_for_assigned_groupID"`
}
type WorkflowStepDependencies []WorkflowStepDependency

type StepActions []StepAction
type StepAction struct {
	ActionType string `json:"actionType"`
	ActionText string `json:"actionText"`
}
