from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from ..config.rds_config import rds_settings
import boto3
import json

def get_secret():
    """Retrieve database credentials from AWS Secrets Manager"""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=rds_settings.RDS_REGION
    )
    
    try:
        secret_value = client.get_secret_value(
            SecretId=f'timelymate/{rds_settings.RDS_DB_NAME}/credentials'
        )
        secret = json.loads(secret_value['SecretString'])
        return secret
    except Exception as e:
        print(f"Error retrieving secret: {e}")
        return None

# Create SQLAlchemy engine with RDS configuration
def create_db_engine(is_read_replica: bool = False):
    # Get credentials from Secrets Manager
    secret = get_secret()
    if secret:
        rds_settings.RDS_USERNAME = secret.get('username', rds_settings.RDS_USERNAME)
        rds_settings.RDS_PASSWORD = secret.get('password', rds_settings.RDS_PASSWORD)

    # Choose the appropriate connection URL
    db_url = rds_settings.read_replica_url if is_read_replica else rds_settings.database_url

    return create_engine(
        db_url,
        pool_size=rds_settings.RDS_POOL_SIZE,
        max_overflow=rds_settings.RDS_MAX_OVERFLOW,
        pool_timeout=rds_settings.RDS_POOL_TIMEOUT,
        pool_recycle=rds_settings.RDS_POOL_RECYCLE,
        pool_pre_ping=True,  # Enable connection health checks
        echo=False  # Set to True for SQL query logging
    )

# Create engines for both primary and read replica
engine = create_db_engine(is_read_replica=False)
read_replica_engine = create_db_engine(is_read_replica=True) if rds_settings.RDS_READ_REPLICA_HOSTNAME else None

# Create session factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
ReadOnlySessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=read_replica_engine) if read_replica_engine else SessionLocal

Base = declarative_base()

def get_db():
    """Get a database session for write operations"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_read_db():
    """Get a database session for read operations (uses read replica if available)"""
    db = ReadOnlySessionLocal()
    try:
        yield db
    finally:
        db.close()
