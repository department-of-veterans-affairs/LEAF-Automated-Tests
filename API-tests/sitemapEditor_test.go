package main

import (
	"io"
	"log"
	"encoding/json"
	"testing"
	"github.com/google/go-cmp/cmp"
	"strings"
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

func TestSitemap_Get_Sitemap_Cards(t *testing.T) {
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

func TestSitemap_Post_New_Card_Validation(t *testing.T) {
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

	//iconPath := RootURL + "libs/dynicons/svg/"

	newCardId := "12345"
	expectedTitle := "site card"
	expectedDescr := "site description"
	expectedTarget := "custom_report"
	// expectedFontColor := "#000000"
	// expectedBgColor := "#ffffff"
	// expectedIcon := iconPath + "mock-LEAF-thumbprint.svg"

	inCard := SiteCard{
		Id: newCardId,
		Title: "<p>" + expectedTitle + "</p>",
		Description: "<img src=1>" + expectedDescr,
		Target: expectedTarget + "\r\n",
		FontColor: "invalid color",
		Color: "invalid color",
		Icon: "../mock-LEAF-thumbprint.svg",
		Order: 3,
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
	

}