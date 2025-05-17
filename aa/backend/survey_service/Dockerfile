FROM python:3.9-slim

WORKDIR /app

# Copy and install shared library first
COPY shared/ /shared/
RUN pip install -e /shared/

# Copy requirements file and install dependencies
COPY survey_service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY survey_service/app.py .
COPY survey_service/routes/ ./routes/

# Create .env file for local development (will be overridden by environment variables)
RUN echo "SUPABASE_URL=${SUPABASE_URL}" > .env
RUN echo "SUPABASE_KEY=${SUPABASE_KEY}" >> .env

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]