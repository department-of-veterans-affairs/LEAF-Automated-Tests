package main

import (
	"io"
	"log"
	"encoding/json"
	"testing"
	"github.com/google/go-cmp/cmp"
	"strings"
	"strconv"
	"net/url"
	"net/http"
)


func getSitemapJSON() (string, error) {
	res, _ := client.Get(RootURL + "api/site/settings/sitemap_json")
	b, _ := io.ReadAll(res.Body)
	defer res.Body.Close()

	var r SitemapJsonResponse
	err := json.Unmarshal(b, &r)

	sitemapJSON := r[0].Data
	return sitemapJSON, err
}

func parseSitemapCards(sitemapJSON string) (SiteCards, error) {
	b := []byte(sitemapJSON)
	var m SitemapConfig
	err := json.Unmarshal(b, &m)

	cards := m.Buttons
	return cards, err
}

func findCardByID(cards []SiteCard, id string) (SiteCard, bool) {
    for _, c := range cards {
        if c.Id == id {
            return c, true
        }
    }
    return SiteCard{}, false
}


func TestSitemapEditor_Get_Sitemap_JSON(t *testing.T) {
	sitejson, err := getSitemapJSON()
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap json: %v", err)
	}
	cards, err := parseSitemapCards(sitejson)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap cards: %v", err)
	}

	got := len(cards)
	want := 2
	if !cmp.Equal(got, want) {
		t.Errorf("Expected initial sitemap cardcount: got = %v, want = %v", got, want)
	}
}

func TestSitemapEditor_Post_Sitemap_JSON(t *testing.T) {
	originalSitejson, err := getSitemapJSON()
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap json: %v", err)
	}
	cards, err := parseSitemapCards(originalSitejson)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap cards: %v", err)
	}

	var portalSitemapCards []SiteCard
	for _, c := range cards {
		portalSitemapCards = append(portalSitemapCards, c)
	}

	newCardId := "12345"
	iconPath := HostURL + "/libs/dynicons/svg/"
	iconFile := "LEAF-thumbprint.svg"

	expectedTitle := "site card"
	expectedDescr := "site description"
	expectedTarget := "report.php?a=customreport"
	expectedFontColor := "#000000"
	expectedBgColor := "#ffffff"
	expectedIcon := iconPath + iconFile
	expectedOrder := 3
	expectedColumns := "service,title,status,priority"
	expectedFormColumns := map[string]string{
		"form_5ea07": "service,title,status,8",
		"form_512fa": "service,36,37,34",
	}

	inCard := SiteCard{
		Id: newCardId,
		Title: "<p>" + expectedTitle + "</p>",
		Description: "<img src=1>" + expectedDescr,
		Target: "report.php?a=custom\r\nreport\r\n",
		FontColor: "invalid color",
		Color: "invalid color",
		Icon: "../LEAF-thumbprint.svg",
		Order: expectedOrder,
		Columns: expectedColumns,
		FormColumns: expectedFormColumns,
	}

	portalSitemapCards = append(portalSitemapCards, inCard)
	sitemapConfigIn := SitemapConfig{
		Buttons: portalSitemapCards,
	}
	configBytes, err := json.Marshal(sitemapConfigIn)
	if err != nil {
		log.Printf("Error on card marshal: %v", err)
	}
	configJson := string(configBytes)

	postData := url.Values{}
	postData.Set("CSRFToken", CsrfToken)
	postData.Set("sitemap_json", configJson)

	req, err := http.NewRequest("POST", RootURL+`api/site/settings/sitemap_json`, strings.NewReader(postData.Encode()))
	if err != nil {
		t.Errorf("Error creating POST request: %v", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Referer", RootURL + "admin")
	res, err := client.Do(req)
	if err != nil {
		t.Errorf("Error sending post request: %v", err)
	}
	defer res.Body.Close()

	sitejson, err := getSitemapJSON()
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap json: %v", err)
	}
	cards, err = parseSitemapCards(sitejson)
	if err != nil {
		log.Printf("JSON parsing error, couldn't parse sitemap cards: %v", err)
	}

	newCard, found := findCardByID(cards, newCardId)
	if !cmp.Equal(found, true) {
		t.Errorf("Expected new card not found by ID")
	}

	got := newCard.Title
	want := expectedTitle
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected title: got = %v, want = %v", got, want)
	}
	got = newCard.Description
	want = expectedDescr
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected description: got = %v, want = %v", got, want)
	}
	got = newCard.Target
	want = expectedTarget
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected target (URL): got = %v, want = %v", got, want)
	}
	got = newCard.FontColor
	want = expectedFontColor
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected font color: got = %v, want = %v", got, want)
	}
	got = newCard.Color
	want = expectedBgColor
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected bg color: got = %v, want = %v", got, want)
	}
	got = newCard.Icon
	want = expectedIcon
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected icon src: got = %v, want = %v", got, want)
	}
	got = newCard.Columns
	want = expectedColumns
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected columns: got = %v, want = %v", got, want)
	}
	gotmap := newCard.FormColumns
	wantmap := expectedFormColumns
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected columns: got = %v, want = %v", got, want)
	}
	for k, _ := range gotmap {
		if !cmp.Equal(gotmap[k], wantmap[k]) {
			t.Errorf("Did not get expected form setting: got = %v, want = %v", gotmap[k], wantmap[k])
		}
	}

	got = strconv.Itoa(newCard.Order)
	want = strconv.Itoa(expectedOrder)
	if !cmp.Equal(got, want) {
		t.Errorf("Did not get expected order: got = %v, want = %v", got, want)
	}
}