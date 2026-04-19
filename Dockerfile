# Vector//Drift - static container.
# Use: docker build -t vector-drift . && docker run -d -p 80:80 vector-drift
FROM nginx:alpine

# Remove default site.
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our Nginx server block and static files.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html methodology.html threat-map.html source.html /usr/share/nginx/html/
COPY editorial /usr/share/nginx/html/editorial
COPY assets /usr/share/nginx/html/assets
COPY LICENSE README.md DEPLOY.md /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
