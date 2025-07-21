FROM quay.vapo.va.gov/2195_leaf/golang:latest

COPY api-test-helper app
COPY API-tests API-tests

WORKDIR /go/app
