package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/google/go-cmp/cmp"
)

func getPortalGroup(url string) PortalGroupResponse {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m PortalGroupResponse
	err := json.Unmarshal(b, &m)

	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func getShortGroup(url string) ShortGroupResponse {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m ShortGroupResponse
	err := json.Unmarshal(b, &m)

	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func getNexusGroup(url string) NexusGroupResponse {
	res, _ := client.Get(url)
	b, _ := io.ReadAll(res.Body)

	var m NexusGroupResponse
	err := json.Unmarshal(b, &m)

	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(b))
		log.Printf("JSON parsing error: %v", err.Error())
	}
	return m
}

func postNewGroup() string {
	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("title", "Auto Test Group")

	res, _ := client.PostForm(RootOrgchartURL+`api/group`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

// postNewTag creates a new tag for the given groupID
func postNewTag(groupID string, tag string) string {
	postData := url.Values{}
	if tag != "" {
		postData.Set("tag", tag)
	}
	postData.Set("CSRFToken", CsrfToken)

	res, _ := client.PostForm(RootOrgchartURL+`api/group/`+groupID+`/tag`, postData)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

func importGroup(groupID string) string {
	res, _ := client.Get(RootURL + `api/system/importGroup/` + groupID)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

// changed this method so that it could be used more universally, with the url being passed in
// more variables could be needed to go with the url
func removeFromNexus(postUrl string, tag string) error {

	data := url.Values{}
	if tag != "" {
		data.Set("tag", tag)
	}
	data.Set("CSRFToken", CsrfToken)

	req, err := http.NewRequest("DELETE", postUrl, strings.NewReader(data.Encode()))

	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := client.Do(req)

	if err != nil {
		return err
	}

	bodyBytes, _ := io.ReadAll(resp.Body)

	defer resp.Body.Close()

	var c string
	err = json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}

	return nil
}

func syncServices(url string) error {
	_, err := client.Get(url)

	if err != nil {
		return err
	}

	return nil
}

func TestGroup_syncServices(t *testing.T) {
	// create a new group
	groupID := postNewGroup()
	id, _ := strconv.Atoi(groupID)
	var passed = false
	postNewTag(groupID, "")
	importGroup(groupID)

	// check that the group exists in both nexus and portal
	p_groups := getShortGroup(RootURL + `api/group/list`)
	o_groups := getNexusGroup(RootOrgchartURL + `api/group/list`)

	for _, p_group := range p_groups {
		if id == p_group.GroupID {
			passed = true
			break
		}
	}

	if passed == false {
		t.Errorf("Portal did not have the new group")
	}

	passed = false

	for _, o_group := range o_groups {
		if id == o_group.GroupID {
			passed = true
			break
		}
	}

	if passed == false {
		t.Errorf("Nexus did not have the new group")
	}

	// remove this group from the nexus
	err := removeFromNexus(fmt.Sprintf("%sapi/group/%s", RootOrgchartURL, groupID), "")

	if err != nil {
		t.Error(err)
	}

	// make sure it is gone from nexus
	o_groups = getNexusGroup(RootOrgchartURL + `api/group/list`)

	passed = false

	for _, o_group := range o_groups {
		if id == o_group.GroupID {
			passed = true
			break
		}
	}

	if passed == true {
		t.Errorf("Nexus group was not removed and should have been.")
	}

	// perform a sync_services on the portal
	err = syncServices(RootURL + `scripts/sync_services.php`)

	if err != nil {
		t.Error(err)
	}

	// confirm that the group does not exist in either nexus or portal
	p_groups = getShortGroup(RootURL + `api/group/list`)

	for _, p_group := range p_groups {
		if id == p_group.GroupID {
			passed = true
			break
		}
	}

	if passed == true {
		t.Errorf("Portal group was not removed and should have been")
	}
}

// A test to remove a tag from the nexus group
func TestGroup_removeTag(t *testing.T) {
	// add a tag to a group
	id := "34"
	id_int, _ := strconv.Atoi(id)
	passed := false
	tag_name := "Academy_Demo1"
	postNewTag(id, tag_name)

	// check to make sure tag was added
	o_groups := getNexusGroup(RootOrgchartURL + `api/group/list`)

	for _, o_group := range o_groups {
		if id_int == o_group.GroupID {
			passed = true
			break
		}
	}

	if passed == false {
		t.Errorf("The tag was not found in this group")
	}

	// remove the tag
	err := removeFromNexus(fmt.Sprintf("%sapi/group/%s/tag?", RootOrgchartURL, id), tag_name)

	if err != nil {
		t.Error(err)
	}

	// check to make sure tag was removed
	passed = false
	o_groups = getNexusGroup(RootOrgchartURL + `api/group/list`)

	for _, o_group := range o_groups {
		if (id_int == o_group.GroupID) && (tag_name == o_group.GroupTitle) {
			passed = true
			break
		}
	}

	if passed == true {
		t.Errorf("The tag was not removed from this group")
	}
}

// This is a copy of TestGroup_removeTag, however the intent is to exercise a deprecated HTTP DELETE handler where
// the CSRFToken is passed through the URL instead of the HTTP body
// This test should be removed when there are no remaining instances where the deprecated handler is used
func TestGroup_removeTagUsingDeprecatedMethod(t *testing.T) {
	// add a tag to a group
	id := "34"
	id_int, _ := strconv.Atoi(id)
	passed := false
	tag_name := "Deprecated_Method"
	postNewTag(id, tag_name)

	// check to make sure tag was added
	o_groups := getNexusGroup(RootOrgchartURL + `api/group/list`)

	for _, o_group := range o_groups {
		if id_int == o_group.GroupID {
			passed = true
			break
		}
	}

	if passed == false {
		t.Errorf("The tag was not found in this group")
	}

	// remove the tag using deprecated method
	err := removeFromNexus(fmt.Sprintf("%sapi/group/%s/tag?", RootOrgchartURL, id), tag_name)
	data := url.Values{}
	data.Set("tag", tag_name)

	req, err := http.NewRequest("DELETE", RootOrgchartURL+"api/group/"+id+"/tag?CSRFToken="+CsrfToken, strings.NewReader(data.Encode()))
	if err != nil {
		t.Error(err)
	}

	resp, err := client.Do(req)
	if err != nil {
		t.Error(err)
	}
	defer resp.Body.Close()

	got := resp.StatusCode
	want := 200

	if !cmp.Equal(got, want) {
		t.Errorf("TestGroup_removeTagUsingDeprecatedMethod HTTP response code: got = %v, want = %v", got, want)
	}
}
