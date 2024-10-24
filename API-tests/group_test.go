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

func postNewTag(groupID string) string {
	postData := url.Values{}
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
	res, _ := client.Get(RootURL+`api/system/importGroup/`+groupID)
	bodyBytes, _ := io.ReadAll(res.Body)

	var c string
	err := json.Unmarshal(bodyBytes, &c)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse: %v", string(bodyBytes))
	}
	return c
}

func removeNexusGroup(postUrl string) error {

	data := url.Values{}
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
	postNewTag(groupID)
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
	err := removeNexusGroup(fmt.Sprintf("%sapi/group/%s", RootOrgchartURL, groupID))

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
