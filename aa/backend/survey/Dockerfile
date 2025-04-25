FROM python:3.9-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY utils_supabase.py .

# Create .env file for local development (will be overridden by environment variables)
RUN echo "SUPABASE_URL=${SUPABASE_URL}" > .env
RUN echo "SUPABASE_KEY=${SUPABASE_KEY}" >> .env

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]