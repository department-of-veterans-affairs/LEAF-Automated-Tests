package main

type PositionResponse map[string]Position

type Position struct {

}

type PositionIdentifier struct {
	PositionId int `json:"positionId"`
}
