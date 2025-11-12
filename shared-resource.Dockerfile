FROM hub.lumigame.com/base/nginx:brotli-1.20.2-zlib@sha256:da65e2f9beb9cc2e87f94ef575852c654bc39c974848da2231cb0747cae04d37

COPY ./.nginx/config.conf /etc/nginx/conf.d/default.conf
COPY ./shared-resources/ /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid

USER nginx
