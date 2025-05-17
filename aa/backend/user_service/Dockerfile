FROM python:3.9-slim

WORKDIR /app

# Copy and install shared library first
COPY shared/ /shared/
RUN pip install -e /shared/

# Copy requirements file
COPY user_service/requirements.txt .


# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code with new directory structure
COPY user_service/app.py .
COPY user_service/routes/ ./routes/

# Create .env file for local development (will be overridden by environment variables)
RUN echo "SUPABASE_URL=${SUPABASE_URL}" > .env
RUN echo "SUPABASE_KEY=${SUPABASE_KEY}" >> .env
RUN echo "JWT_SECRET_KEY=${JWT_SECRET_KEY}" >> .env

# Expose port
EXPOSE 5001

# Run the application
CMD ["python", "app.py"]