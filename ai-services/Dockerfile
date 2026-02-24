FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m textblob.download_corpora

COPY app.py .

EXPOSE 5001
CMD ["python", "app.py"]
