package main

type PlatformResponse []Platform

type Platform struct {
	LaunchpadID          int        `json:"launchpadID"`
	Site_path            string     `json:"site_path"`
	OrgchartImportTags   []string   `json:"tags"`
}
