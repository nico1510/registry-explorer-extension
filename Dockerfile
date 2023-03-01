FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui
# cache packages in layer
COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
# install
COPY ui /ui
RUN npm run build

FROM alpine
LABEL org.opencontainers.image.title="Registry Explorer" \
    org.opencontainers.image.description="Explore what's inside the tags published on Docker Hub and drill into the images, layers & files." \
    org.opencontainers.image.vendor="Nicolas Beck" \
    com.docker.desktop.extension.icon="https://raw.githubusercontent.com/nico1510/registry-explorer-extension/main/icon.svg" \
    com.docker.desktop.extension.api.version="0.3.4" \
    com.docker.extension.screenshots='[{"alt":"graph screenshot", "url":"https://raw.githubusercontent.com/nico1510/registry-explorer-extension/main/docs/screenshots/graph.png"},{"alt":"files screenshot", "url":"https://raw.githubusercontent.com/nico1510/registry-explorer-extension/main/docs/screenshots/files.png"}]' \
    com.docker.extension.detailed-description="This extension allows you to explore what's inside the artifacts published on Docker Hub. It lets you unfold image indexes, manifests & layers. For images built with BuildKit >=0.11, you can also view its provenance attestations." \
    com.docker.extension.publisher-url="https://github.com/nico1510" \
    com.docker.extension.additional-urls='[{"title":"GitHub repository","url":"https://github.com/nico1510/registry-explorer-extension"}, {"title":"Report an issue","url":"https://github.com/nico1510/registry-explorer-extension/issues"}]' \
    com.docker.extension.changelog="" \
    com.docker.extension.categories="utility-tools"

COPY docker-compose.yaml .
COPY metadata.json .
COPY icon.svg .
COPY --from=client-builder /ui/build ui