from pydantic_settings import BaseSettings
from typing import Optional

class RDSSettings(BaseSettings):
    RDS_DB_NAME: str = "timelymate"
    RDS_USERNAME: str = "postgres"
    RDS_PASSWORD: str
    RDS_HOSTNAME: str
    RDS_PORT: int = 5432
    RDS_REGION: str = "eu-north-1"

    # Read replica settings (optional)
    RDS_READ_REPLICA_HOSTNAME: Optional[str] = None
    RDS_READ_REPLICA_PORT: Optional[int] = None

    # Connection pool settings
    RDS_POOL_SIZE: int = 5
    RDS_MAX_OVERFLOW: int = 10
    RDS_POOL_TIMEOUT: int = 30
    RDS_POOL_RECYCLE: int = 1800  # 30 minutes

    # SSL settings
    RDS_SSL_MODE: str = "verify-full"
    RDS_SSL_CA: str = "/etc/ssl/certs/rds-ca-2019-root.pem"

    class Config:
        env_file = ".env"

    @property
    def database_url(self) -> str:
        """Generate the database URL with SSL configuration"""
        ssl_params = f"?sslmode={self.RDS_SSL_MODE}&sslcert={self.RDS_SSL_CA}"
        return f"postgresql://{self.RDS_USERNAME}:{self.RDS_PASSWORD}@{self.RDS_HOSTNAME}:{self.RDS_PORT}/{self.RDS_DB_NAME}{ssl_params}"

    @property
    def read_replica_url(self) -> Optional[str]:
        """Generate the read replica URL if configured"""
        if self.RDS_READ_REPLICA_HOSTNAME and self.RDS_READ_REPLICA_PORT:
            ssl_params = f"?sslmode={self.RDS_SSL_MODE}&sslcert={self.RDS_SSL_CA}"
            return f"postgresql://{self.RDS_USERNAME}:{self.RDS_PASSWORD}@{self.RDS_READ_REPLICA_HOSTNAME}:{self.RDS_READ_REPLICA_PORT}/{self.RDS_DB_NAME}{ssl_params}"
        return None

rds_settings = RDSSettings() 