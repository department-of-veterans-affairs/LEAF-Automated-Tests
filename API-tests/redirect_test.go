package main

import (
	"testing"
)

func TestRedirection(t *testing.T) {
	redirectURL := RootURL + "/admin//?a=mod_templates&file=view_homepage.tpl"

	resp, err := client.Get(redirectURL)
	if err != nil {
		t.Error("Error loading page " + err.Error())
	}

	defer resp.Body.Close()

	if redirectURL == resp.Request.URL.String() {
		t.Error("Url did not redirect want:" + redirectURL + " got:" + resp.Request.URL.String())
	}

}
