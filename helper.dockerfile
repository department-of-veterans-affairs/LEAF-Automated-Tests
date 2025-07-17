FROM quay.vapo.va.gov/2195_leaf/golang:latest

USER root

COPY api-test-helper app
COPY API-tests API-tests

RUN microdnf upgrade -y && \
    microdnf clean all \
    && rm -rf /var/cache/yum /var/log/yum*

WORKDIR /app
CMD ["go", "run", "."]
