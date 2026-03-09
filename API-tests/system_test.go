package main

import (
	"archive/zip"
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func uploadAdminFile(t *testing.T, fileName string, content []byte) (string, *http.Response) {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	if err := writer.WriteField("CSRFToken", CsrfToken); err != nil {
		t.Fatalf("failed to add CSRFToken field: %v", err)
	}

	fileWriter, err := writer.CreateFormFile("file", fileName)
	if err != nil {
		t.Fatalf("failed to create multipart file field: %v", err)
	}

	if _, err := fileWriter.Write(content); err != nil {
		t.Fatalf("failed to write multipart file content: %v", err)
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close multipart writer: %v", err)
	}

	req, err := http.NewRequest(http.MethodPost, RootURL+"admin/ajaxIndex.php?a=uploadFile", &body)
	if err != nil {
		t.Fatalf("failed to build upload request: %v", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	res, err := client.Do(req)
	if err != nil {
		t.Fatalf("failed to post upload request: %v", err)
	}

	bodyBytes, err := io.ReadAll(res.Body)
	res.Body.Close()
	if err != nil {
		t.Fatalf("failed to read upload response body: %v", err)
	}

	return strings.TrimSpace(string(bodyBytes)), res
}

func buildZipFile(t *testing.T, entries map[string][]byte) []byte {
	t.Helper()

	var buf bytes.Buffer
	zipWriter := zip.NewWriter(&buf)

	for name, contents := range entries {
		entryWriter, err := zipWriter.Create(name)
		if err != nil {
			t.Fatalf("failed to create zip entry %s: %v", name, err)
		}

		if _, err := entryWriter.Write(contents); err != nil {
			t.Fatalf("failed to write zip entry %s: %v", name, err)
		}
	}

	if err := zipWriter.Close(); err != nil {
		t.Fatalf("failed to close zip archive: %v", err)
	}

	return buf.Bytes()
}

func cleanupUploadedAdminFile(t *testing.T, fileName string) {
	t.Helper()

	filePath := filepath.Join("..", "..", "LEAF_Request_Portal", "files", fileName)
	if err := os.Remove(filePath); err != nil && !os.IsNotExist(err) {
		t.Fatalf("failed to remove uploaded test file %s: %v", fileName, err)
	}
}

func TestSystem_UploadFileRejectsDangerousMimeContent(t *testing.T) {
	fileName := "leaf_5542_disguised_pdf.pdf"
	t.Cleanup(func() {
		cleanupUploadedAdminFile(t, fileName)
	})

	body, res := uploadAdminFile(t, fileName, []byte("<?php echo 'blocked'; ?>"))

	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200 for rejected upload, got %d with body %q", res.StatusCode, body)
	}

	want := "File content does not match the expected file type."
	if body != want {
		t.Fatalf("unexpected rejection body. got %q want %q", body, want)
	}
}

func TestSystem_UploadFileRejectsZipWithDangerousContents(t *testing.T) {
	fileName := "leaf_5542_unsafe_archive.zip"
	t.Cleanup(func() {
		cleanupUploadedAdminFile(t, fileName)
	})

	zipBytes := buildZipFile(t, map[string][]byte{
		"safe-note.txt": []byte("safe text file"),
		"payload.php":   []byte("<?php echo 'blocked'; ?>"),
	})

	body, res := uploadAdminFile(t, fileName, zipBytes)

	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200 for rejected zip upload, got %d with body %q", res.StatusCode, body)
	}

	want := "Zip file contains a potentially dangerous file type: .php"
	if body != want {
		t.Fatalf("unexpected zip rejection body. got %q want %q", body, want)
	}
}
