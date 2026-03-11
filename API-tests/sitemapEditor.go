package main


type SitemapJsonResponse []SitemapJsonData

type SitemapJsonData struct {
	Data			string `json:"data"`
}

type SiteCard struct {
	Id              string            `json:"id"`
	Title           string            `json:"title"`
	Description     string            `json:"description"`
	Target          string            `json:"target"`
	Color           string            `json:"color"`
	FontColor       string            `json:"fontColor"`
	Icon            string            `json:"icon"`
	Order           int               `json:"order"`
	Columns	        string            `json:"columns,omitempty"`
	FormColumns     map[string]string `json:"formColumns,omitempty"`
}

type SiteCards []SiteCard

type SitemapConfig struct {
	Buttons	SiteCards `json:"buttons"`		
}
