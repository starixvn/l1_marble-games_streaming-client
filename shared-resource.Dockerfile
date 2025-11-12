FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib@sha256:da65e2f9beb9cc2e87f94ef575852c654bc39c974848da2231cb0747cae04d37

COPY ./.nginx/config.conf /etc/nginx/conf.d/default.conf
COPY ./shared-resources/ /usr/share/nginx/html
