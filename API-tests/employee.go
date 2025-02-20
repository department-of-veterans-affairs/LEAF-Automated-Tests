package main

type EmployeeResponse map[int]Employee
type EmployeeQueryData map[int]EmployeeData

type Employee struct {
	EmployeeId int               `json:"empUID"`
	FirstName  string            `json:"firstName"`
	LastName   string            `json:"lastName"`
	MiddleName string            `json:"middleName"`
	UserName   string            `json:"userName"`
	Phone	   string            `json:"phone"`
	Mobile     string            `json:"mobile"`
	Address    string            `json:"address"`
	Title      string            `json:"title"`
	Email      string            `json:"email"`
	Deleted    int               `json:"deleted"`
	Data       EmployeeQueryData    `json:"data"`
}

type EmployeeData struct {
	IndicatorID  int    `json:"indicatorID"`
	Name         string `json:"name"`
	Data         string `json:"data"`

}

type EmployeeIdentifier struct {
	EmployeeId int `json:"employeeId"`
}
