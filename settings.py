class ProdConfig(Config):
    """Production configuration."""
    ENV = 'prod'
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'postgres://root:ZlCJFRkiCvdHs9ew@172.17.42.1:49153/db'
    DEBUG_TB_ENABLED = False  # Disable Debug toolbar
