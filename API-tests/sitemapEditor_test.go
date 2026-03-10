package main

import (
	"io"
	"log"
	"encoding/json"
	"testing"
	"github.com/google/go-cmp/cmp"
	/*
	
	"net/url"
	"net/http"
	"strings"
	"strconv"

	 */
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

	// Marshal the Go value into a JSON byte slice.
	cardJsonBytes, err := json.Marshal(inCard)
	if err != nil {
		log.Printf("Error on card marshal: %v", err)
	} else {
		log.Printf("card marshal: %v", string(cardJsonBytes))
	}
	
}