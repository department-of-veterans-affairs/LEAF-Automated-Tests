package main

import (
	"encoding/json"
	"html"
	"strings"
)

type FormCategoryResponse []FormCategoryResponseItem

type FormCategoryResponseItemChild struct {
	IndicatorID    int    `json:"indicatorID"`
	CategoryID     string `json:"categoryID"`
	Series         int    `json:"series"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	Default        string `json:"default"`
	ParentID       int    `json:"parentID"`
	Html           string `json:"html"`
	HtmlPrint      string `json:"htmlPrint"`
	Conditions     string `json:"conditions"`
	Required       int    `json:"required"`
	IsSensitive    int    `json:"is_sensitive"`
	IsEmpty        bool   `json:"isEmpty"`
	Value          string `json:"value"`
	DisplayedValue string `json:"displayedValue"`
	Timestamp      int    `json:"timestamp"`
	IsWritable     int    `json:"isWritable"`
	IsMasked       int    `json:"isMasked"`
	IsMaskable     *int   `json:"isMaskable,omitempty"`
	Sort           int    `json:"sort"`
	HasCode        string `json:"has_code"`
	Format         string `json:"format"`
}

type FormCategoryResponseItem struct {
	IndicatorID    int                                   `json:"indicatorID"`
	CategoryID     string                                `json:"categoryID"`
	Series         int                                   `json:"series"`
	Name           string                                `json:"name"`
	Description    string                                `json:"description"`
	Default        string                                `json:"default"`
	ParentID       int                                   `json:"parentID"`
	Html           string                                `json:"html"`
	HtmlPrint      string                                `json:"htmlPrint"`
	Conditions     string                                `json:"conditions"`
	Required       int                                   `json:"required"`
	IsSensitive    int                                   `json:"is_sensitive"`
	IsEmpty        bool                                  `json:"isEmpty"`
	Value          string                                `json:"value"`
	DisplayedValue string                                `json:"displayedValue"`
	Timestamp      int                                   `json:"timestamp"`
	IsWritable     int                                   `json:"isWritable"`
	IsMasked       int                                   `json:"isMasked"`
	IsMaskable     *int                                  `json:"isMaskable,omitempty"`
	Sort           int                                   `json:"sort"`
	HasCode        string                                `json:"has_code"`
	Format         string                                `json:"format"`
	Child          map[int]FormCategoryResponseItemChild `json:"child"`
}

type FormIndicatorList []FormIndicator
type FormIndicator struct {
	ParentIndicatorID *int     `json:"parentIndicatorID,omitempty"`
	IndicatorID       int      `json:"indicatorID"`
	Name              string   `json:"name"`
	Format            string   `json:"format"`
	Conditions        *string  `json:"conditions,omitempty"`
	Description       string   `json:"description"`
	IsDisabled        int      `json:"isDisabled"`
	CategoryName      string   `json:"categoryName"`
	CategoryID        string   `json:"categoryID"`
	IsSensitive       int      `json:"is_sensitive"`
	TimeAdded         string   `json:"timeAdded"` // should be a UNIX timestamp
	ParentCategoryID  string   `json:"parentCategoryID"`
	ParentStaples     []string `json:"parentStaples,omitempty"`
}

// FormDataResponse represents the structure returned by api/form/{recordID}/data
// It's a map where keys are indicatorIDs (as strings) and values are maps of series numbers (as strings) to field data
type FormDataResponse map[string]map[string]FieldDataItem

// Legacy FieldData type for backward compatibility
type FieldData = FieldDataItem

type FieldDataItem struct {
	IndicatorID int             `json:"indicatorID"`
	Series      int             `json:"series"`
	Name        string          `json:"name"`
	Format      string          `json:"format"`
	Value       json.RawMessage `json:"value"` // Can be string or array
	Default     string          `json:"default,omitempty"`
	Description string          `json:"description,omitempty"`
	Html        string          `json:"html,omitempty"`
	HtmlPrint   string          `json:"htmlPrint,omitempty"`
	Conditions  *string         `json:"conditions,omitempty"`
	Required    int             `json:"required"`
	IsSensitive int             `json:"is_sensitive"`
	IsEmpty     bool            `json:"isEmpty"`
	Timestamp   int             `json:"timestamp,omitempty"`
	IsWritable  int             `json:"isWritable,omitempty"`
	IsMasked    int             `json:"isMasked,omitempty"`
	Sort        int             `json:"sort,omitempty"`
	HasCode     interface{}     `json:"has_code,omitempty"` // Can be bool or string
	UserID      string          `json:"userID,omitempty"`
	ParentID    *int            `json:"parentID,omitempty"`
	Options     []string        `json:"options,omitempty"`
}

// GetValueAsString returns the value as a string, handling both string and array cases
func (f *FieldDataItem) GetValueAsString() string {
	// Try to unmarshal as string first
	var str string
	if err := json.Unmarshal(f.Value, &str); err == nil {
		return str
	}

	// Try as array of strings
	var arr []string
	if err := json.Unmarshal(f.Value, &arr); err == nil {
		if len(arr) > 0 {
			return strings.Join(arr, ",")
		}
		return ""
	}

	// Return raw value as string
	return string(f.Value)
}

// GetValueAsJSON returns the value decoded and ready for JSON parsing
// It handles HTML entity decoding that may be present in the stored data
func (f *FieldDataItem) GetValueAsJSON() (string, error) {
	str := f.GetValueAsString()

	// Decode HTML entities like &quot; and &amp;
	decoded := html.UnescapeString(str)

	return decoded, nil
}