# Use a slimmer base image to reduce image size and pull times
FROM python:3.10-slim-bullseye
LABEL maintainer="Andrew Simonson <asimonson1125@gmail.com>"

# Set environment variables for better Python performance in Docker
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy only the requirements file first to leverage Docker layer caching
COPY src/requirements.txt .

# Install dependencies as root, but then switch to the non-root user
RUN pip install -r requirements.txt

# Copy the rest of the source code
COPY src/ .

# Ensure the appuser owns the app directory
RUN chown -R appuser:appuser /app

# Switch to the non-root user for better security
USER appuser

# Expose the port (Gunicorn's default or specified in CMD)
EXPOSE 8080

# Start Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
