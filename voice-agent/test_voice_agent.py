#!/usr/bin/env python3
"""
Test script for the Voice Agent API
"""

import asyncio
import requests
import json
from pathlib import Path
import tempfile
import wave
import numpy as np

# API base URL
BASE_URL = "http://localhost:8000"

def create_test_audio():
    """Create a simple test audio file for testing"""
    # Generate a simple sine wave
    sample_rate = 16000
    duration = 2  # seconds
    frequency = 440  # Hz (A note)
    
    t = np.linspace(0, duration, int(sample_rate * duration))
    audio_data = np.sin(2 * np.pi * frequency * t)
    
    # Convert to 16-bit integers
    audio_data = (audio_data * 32767).astype(np.int16)
    
    # Create temporary WAV file
    temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    
    with wave.open(temp_file.name, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes per sample
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_data.tobytes())
    
    return temp_file.name

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/voice/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Services: {data['services']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")

def test_supported_languages():
    """Test the supported languages endpoint"""
    print("\n🌍 Testing supported languages...")
    try:
        response = requests.get(f"{BASE_URL}/voice/supported-languages")
        if response.status_code == 200:
            data = response.json()
            print("✅ Supported languages:")
            for lang in data['languages']:
                print(f"   - {lang['name']} ({lang['code']})")
        else:
            print(f"❌ Languages check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Languages check error: {e}")

def test_text_to_speech():
    """Test the text-to-speech endpoint"""
    print("\n🗣️ Testing text-to-speech...")
    try:
        tts_data = {
            "text": "Xin chào! Tôi là voice agent của Figuro.",
            "language": "vi-VN",
            "voice_speed": 1.0
        }
        
        response = requests.post(
            f"{BASE_URL}/voice/text-to-speech",
            json=tts_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ TTS successful: {data['audio_url']}")
        else:
            print(f"❌ TTS failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ TTS error: {e}")

def test_voice_processing():
    """Test the voice processing endpoint"""
    print("\n🎤 Testing voice processing...")
    
    # Create a test audio file
    audio_file = create_test_audio()
    
    try:
        with open(audio_file, 'rb') as f:
            files = {'file': ('test_audio.wav', f, 'audio/wav')}
            data = {
                'language': 'vi-VN',
                'enable_tts': True
            }
            
            response = requests.post(
                f"{BASE_URL}/voice/process",
                files=files,
                data=data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Voice processing successful:")
                print(f"   Transcript: {result['transcript']}")
                print(f"   Intent: {result['intent']}")
                print(f"   Confidence: {result['confidence']:.2f}")
                print(f"   Entities: {len(result['entities'])} found")
                print(f"   Response: {result['response_text']}")
                print(f"   Processing time: {result['processing_time_ms']}ms")
                if result['audio_url']:
                    print(f"   Audio response: {result['audio_url']}")
            else:
                print(f"❌ Voice processing failed: {response.status_code}")
                print(f"   Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Voice processing error: {e}")
    finally:
        # Clean up test file
        Path(audio_file).unlink(missing_ok=True)

def test_cleanup():
    """Test the cleanup endpoint"""
    print("\n🧹 Testing cleanup...")
    try:
        response = requests.delete(f"{BASE_URL}/voice/cleanup")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Cleanup successful: {data['message']}")
        else:
            print(f"❌ Cleanup failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Cleanup error: {e}")

def main():
    """Run all tests"""
    print("🚀 Voice Agent API Tests")
    print("=" * 50)
    
    # Test if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("❌ Server is not running or not accessible!")
            print("   Please start the server with: uvicorn main:app --reload")
            return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("   Please start the server with: uvicorn main:app --reload")
        return
    
    print("✅ Server is running!")
    
    # Run tests
    test_health_check()
    test_supported_languages()
    test_text_to_speech()
    test_voice_processing()
    test_cleanup()
    
    print("\n🎉 All tests completed!")
    print("\nTo manually test:")
    print("1. Start server: uvicorn main:app --reload")
    print("2. Open browser: http://localhost:8000/docs")
    print("3. Upload an audio file to /voice/process")

if __name__ == "__main__":
    main()