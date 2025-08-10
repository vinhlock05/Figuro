from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import router
from app.config import config
import logging

# Setup logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL))
logger = logging.getLogger(__name__)

# Create directories
config.create_directories()

# Initialize FastAPI app
app = FastAPI(
    title=config.API_TITLE,
    version=config.API_VERSION,
    description=config.API_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Include API router under /voice prefix to match frontend
app.include_router(router, prefix="/voice")


@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Voice Agent Service is running! 🎤",
        "version": config.API_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/voice/health",
        "features": [
            "Speech-to-Text",
            "Text-to-Speech",
            "Intent Recognition",
            "Entity Extraction",
            "Multi-language Support"
        ],
        "supported_languages": list(config.SUPPORTED_LANGUAGES.keys())
    }


@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "healthy", "service": "voice-agent"}


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Voice Agent Service starting up...")
    logger.info(f"📁 Static files directory: {config.STATIC_DIR}")
    logger.info(f"🎵 Audio files directory: {config.AUDIO_DIR}")
    logger.info(
        f"🌍 Supported languages: {list(config.SUPPORTED_LANGUAGES.keys())}")
    logger.info("✅ Voice Agent Service ready!")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Voice Agent Service shutting down...")
    logger.info("✅ Shutdown complete!")
