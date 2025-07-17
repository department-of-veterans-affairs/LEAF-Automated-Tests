FROM quay.vapo.va.gov/2195_leaf/golang:latest

USER root

COPY api-test-helper app
COPY API-tests API-tests

WORKDIR /go/app
RUN mkdir /go/.cache && \
    chown -R 1001:1001 /go
