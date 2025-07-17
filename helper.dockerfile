FROM quay.vapo.va.gov/2195_leaf/golang:latest

USER root

COPY api-test-helper app
COPY API-tests API-tests

RUN apt-get update && \
    apt-get install -y ca-certificates curl wget gnupg dirmngr --no-install-recommends && \
    rm -rf /var/lib/apt/lists/
RUN apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false && \
    rm -rf /tmp/*

WORKDIR /app
CMD ["go", "run", "."]
