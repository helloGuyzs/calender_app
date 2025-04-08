# Use the official Python image from the Docker Hub
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the required packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container
COPY . .

# Run migrations
RUN python manage.py migrate

# Expose the port the app runs on
EXPOSE 8000

# Start the application using Gunicorn
CMD ["gunicorn", "calendar_app.wsgi:application", "--bind", "0.0.0.0:8000"]