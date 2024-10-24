package main

type PortalGroupResponse []PortalGroup
type NexusGroupResponse []NexusGroup
type ShortGroupResponse []ShortGroup

type PortalGroup struct {
	GroupID            int      `json:"groupID"`
	ParentGroupID	   int		`json:"parentGroupID"`
	Name	           string   `json:"name"`
	GroupDescription   string   `json:"groupDescription"`
	Members            []Member `json:"members"`
}

type NexusGroup struct {
	GroupID            int      `json:"groupID"`
	ParentID	       int		`json:"parentID"`
	GroupTitle	       string   `json:"groupTitle"`
}

type ShortGroup struct {
	GroupID            int      `json:"groupID"`
	Name	           string   `json:"name"`
}
