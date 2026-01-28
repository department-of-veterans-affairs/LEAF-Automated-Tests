package main

import (
	"crypto/tls"
	"io"
	"net/http"
	"strings"
)

func httpGet(url string) (string, *http.Response) {
	url = strings.Replace(url, " ", "%20", -1)
	res, _ := client.Get(url)
	bodyBytes, _ := io.ReadAll(res.Body)
	return string(bodyBytes), res
}

// min returns the smaller of two integers
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// getKeys extracts keys from a map[int]interface{}
func getKeys(m map[int]interface{}) []int {
	keys := make([]int, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

// containsAny checks if a string contains any of the provided substrings
func containsAny(s string, substrings []string) bool {
	for _, substring := range substrings {
		if strings.Contains(s, substring) {
			return true
		}
	}
	return false
}

// createNoRedirectClient creates an HTTP client that doesn't follow redirects
// Useful for testing redirect security
func createNoRedirectClient() *http.Client {
	return &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
}

// truncateString safely truncates a string to maxLen characters
// Adds "..." if truncated
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
