# nginx-gunicorn-flask

FROM ubuntu:lunar
LABEL maintainer="Andrew Simonson <asimonson1125@gmail.com>"

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y python3-pip nginx gunicorn supervisor 
# do we really need venv? 

# Setup flask application
RUN mkdir -p /deploy/app
COPY src /deploy/app
RUN pip install -r /deploy/app/requirements.txt

# Setup nginx
RUN rm /etc/nginx/sites-enabled/default
COPY flask.conf /etc/nginx/sites-available/
RUN ln -s /etc/nginx/sites-available/flask.conf /etc/nginx/sites-enabled/flask.conf && \
    echo "daemon off;" >> /etc/nginx/nginx.conf

# Setup supervisord
RUN mkdir -p /var/log/supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY gunicorn.conf /etc/supervisor/conf.d/gunicorn.conf

# Permissions
# RUN adduser --disabled-password --gecos '' supervisor && \
RUN chmod -R 775 /var/* && \
    chown -R root /var/*

# Entrypoint
USER root

# Start processes
CMD ["/usr/bin/supervisord"]
