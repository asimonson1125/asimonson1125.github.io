FROM python:3.10-bullseye
LABEL maintainer="Andrew Simonson <asimonson1125@gmail.com>"

WORKDIR /app

COPY src/ .

RUN pip install --no-cache-dir -r requirements.txt

CMD [ "gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
