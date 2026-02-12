package main

import (
	"crypto/tls"
	"io"
	"net/http"
	"strings"
)

func httpGet(url string) (string, *http.Response) {
	url = strings.Replace(url, " ", "%20", -1)
	res, err := client.Get(url)
	if err != nil || res == nil {
		return "", nil
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(res.Body)
	if err != nil {
		return "", res
	}

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

var noRedirectClient = &http.Client{
	Transport: &http.Transport{
		TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
	},
	CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	},
}


// truncateString safely truncates a string to maxLen characters
// Adds "..." if truncated
func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}
