package main

import (
	"testing"
)

// Homepage, Default view
func BenchmarkHomepage_defaultQuery(b *testing.B) {
	for i := 0; i < b.N; i++ {
		httpGet(RootURL + `api/form/query?q={"terms":[{"id":"title","operator":"LIKE","match":"***","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","status","categoryName"],"sort":{"column":"date","direction":"DESC"},"limit":50}`)
	}
}

// Inbox, Default view
func BenchmarkInbox_nonAdminActionable(b *testing.B) {
	for i := 0; i < b.N; i++ {
		httpGet(RootURL + `api/form/query?q={"terms":[{"id":"stepID","operator":"=","match":"actionable","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,title&masquerade=nonAdmin`)
	}
}

// Inbox, Admin, Organized by roles
func BenchmarkInbox_adminActionableRoles(b *testing.B) {
	for i := 0; i < b.N; i++ {
		httpGet(RootURL + `api/form/query/?q={"terms":[{"id":"stepID","operator":"=","match":"actionable","gate":"AND"},{"id":"deleted","operator":"=","match":0,"gate":"AND"}],"joins":["service","categoryName","status","unfilledDependencies"],"sort":{},"limit":1000,"limitOffset":0}&x-filterData=recordID,categoryIDs,categoryNames,date,title,service,submitted,priority,stepID,blockingStepID,lastStatus,stepTitle,action_history.time,unfilledDependencyData`)
	}
}
