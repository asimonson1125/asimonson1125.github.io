FROM python:3.10-bullseye
LABEL maintainer="Andrew Simonson <asimonson1125@gmail.com>"

WORKDIR /app
ADD ./src /app

COPY . .

WORKDIR /app/src

RUN apt-get -yq update && \
    pip install --no-cache-dir -r requirements.txt

CMD [ "gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
