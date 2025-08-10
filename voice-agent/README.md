# Voice Agent API 🎤

Một hệ thống voice agent thông minh được xây dựng bằng Python với FastAPI, hỗ trợ speech-to-text, text-to-speech, và xử lý ngôn ngữ tự nhiên.

## ✨ Tính năng

- **Speech-to-Text**: Chuyển đổi giọng nói thành văn bản với hỗ trợ nhiều ngôn ngữ
- **Text-to-Speech**: Chuyển đổi văn bản thành giọng nói
- **Intent Recognition**: Nhận diện ý định từ văn bản (đặt hàng, hủy đơn, kiểm tra trạng thái...)
- **Entity Extraction**: Trích xuất thông tin quan trọng (sản phẩm, số lượng, màu sắc...)
- **Multi-language Support**: Hỗ trợ tiếng Việt, tiếng Anh, tiếng Nhật
- **Audio Format Support**: WAV, MP3, FLAC, M4A

## 🎯 Intents được hỗ trợ

- `create_order`: Tạo đơn hàng mới
- `cancel_order`: Hủy đơn hàng
- `check_order_status`: Kiểm tra trạng thái đơn hàng
- `get_product_info`: Lấy thông tin sản phẩm
- `greeting`: Chào hỏi
- `goodbye`: Tạm biệt

## 📋 Yêu cầu hệ thống

- Python 3.8+
- pip
- Microphone (để ghi âm)
- Internet connection (cho Google Speech Recognition)

## 🚀 Cài đặt

### 1. Clone repository

```bash
cd voice-agent
```

### 2. Tạo virtual environment

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc
venv\Scripts\activate  # Windows
```

### 3. Cài đặt dependencies

```bash
pip install -r requirements.txt
```

### 4. Cài đặt các package hệ thống (Ubuntu/Debian)

```bash
# Cho PyAudio
sudo apt-get install portaudio19-dev python3-pyaudio

# Cho audio processing
sudo apt-get install ffmpeg
```

### 5. Chạy server

```bash
uvicorn main:app --reload
```

Server sẽ chạy tại `http://localhost:8000`

## 📖 API Documentation

### Swagger UI
Truy cập `http://localhost:8000/docs` để xem interactive API documentation.

### ReDoc
Truy cập `http://localhost:8000/redoc` để xem alternative documentation.

## 🔧 API Endpoints

### 1. Process Voice Input

**POST** `/voice/process`

Upload file âm thanh và nhận kết quả xử lý.

**Parameters:**
- `file`: Audio file (WAV, MP3, FLAC, M4A)
- `language`: Language code (vi-VN, en-US, ja-JP)
- `enable_tts`: Enable text-to-speech response

**Response:**
```json
{
  "transcript": "Tôi muốn đặt một mô hình Naruto",
  "intent": "create_order",
  "entities": [
    {
      "type": "product",
      "value": "Naruto",
      "confidence": 0.8
    }
  ],
  "confidence": 0.9,
  "response_text": "Tôi đã hiểu yêu cầu đặt hàng của bạn...",
  "audio_url": "/static/audio/response_123.wav",
  "processing_time_ms": 1500
}
```

### 2. Text-to-Speech

**POST** `/voice/text-to-speech`

Chuyển đổi văn bản thành giọng nói.

**Request Body:**
```json
{
  "text": "Xin chào, tôi có thể giúp gì cho bạn?",
  "language": "vi-VN",
  "voice_speed": 1.0
}
```

### 3. Health Check

**GET** `/voice/health`

Kiểm tra trạng thái hệ thống.

### 4. Supported Languages

**GET** `/voice/supported-languages`

Lấy danh sách ngôn ngữ được hỗ trợ.

### 5. Get Audio File

**GET** `/static/audio/{filename}`

Tải file âm thanh đã được tạo.

### 6. Cleanup Audio Files

**DELETE** `/voice/cleanup`

Xóa các file âm thanh cũ (>1 giờ).

## 🧪 Testing

Chạy test script để kiểm tra API:

```bash
python test_voice_agent.py
```

## 💡 Ví dụ sử dụng

### Python Client Example

```python
import requests

# Upload audio file
with open('audio.wav', 'rb') as f:
    files = {'file': f}
    data = {'language': 'vi-VN', 'enable_tts': True}
    
    response = requests.post(
        'http://localhost:8000/voice/process',
        files=files,
        data=data
    )
    
    result = response.json()
    print(f"Transcript: {result['transcript']}")
    print(f"Intent: {result['intent']}")
```

### cURL Example

```bash
curl -X POST "http://localhost:8000/voice/process" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@audio.wav" \
  -F "language=vi-VN" \
  -F "enable_tts=true"
```

## 📊 Supported Audio Formats

| Format | Extension | Supported |
|--------|-----------|-----------|
| WAV    | .wav      | ✅        |
| MP3    | .mp3      | ✅        |
| FLAC   | .flac     | ✅        |
| M4A    | .m4a      | ✅        |

## 🌐 Language Support

| Language | Code  | STT | TTS |
|----------|-------|-----|-----|
| Vietnamese | vi-VN | ✅  | ✅  |
| English (US) | en-US | ✅  | ✅  |
| Japanese | ja-JP | ✅  | ✅  |

## 🔧 Configuration

Tạo file `.env` để cấu hình:

```env
# Speech Recognition Settings
SPEECH_RECOGNITION_TIMEOUT=10
SPEECH_RECOGNITION_PHRASE_TIMEOUT=5

# Text-to-Speech Settings
TTS_VOICE_RATE=180
TTS_VOICE_VOLUME=0.9

# Audio Settings
MAX_AUDIO_FILE_SIZE=10485760  # 10MB

# Logging
LOG_LEVEL=INFO
```

## 🔍 Troubleshooting

### Common Issues

1. **PyAudio installation error**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install portaudio19-dev
   
   # macOS
   brew install portaudio
   
   # Windows
   pip install pipwin
   pipwin install pyaudio
   ```

2. **Permission denied for audio devices**
   ```bash
   # Add user to audio group
   sudo usermod -a -G audio $USER
   ```

3. **Speech recognition not working**
   - Kiểm tra kết nối internet
   - Đảm bảo file âm thanh có chất lượng tốt
   - Thử với file WAV 16kHz mono

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

MIT License - xem file `LICENSE` để biết thêm chi tiết.

## 🆘 Support

Nếu gặp vấn đề, hãy tạo issue hoặc liên hệ team phát triển.

## 🔮 Roadmap

- [ ] Hỗ trợ WebSocket cho real-time processing
- [ ] Tích hợp AI model nâng cao cho NLP
- [ ] Hỗ trợ thêm ngôn ngữ
- [ ] Voice activity detection
- [ ] Noise reduction
- [ ] Speaker diarization