# 🎤 Voice Input Troubleshooting Guide

## ❌ **Lỗi "Speech recognition not supported"**

### 🔍 **Nguyên nhân có thể:**

1. **Browser không hỗ trợ Web Speech API**
   - Firefox: Không hỗ trợ đầy đủ
   - Safari: Hỗ trợ hạn chế
   - Chrome/Edge: Hỗ trợ đầy đủ ✅

2. **Microphone permissions bị từ chối**
   - Browser chặn quyền truy cập microphone
   - User chưa cấp quyền microphone

3. **Website chạy trên HTTP thay vì HTTPS**
   - Web Speech API yêu cầu HTTPS
   - Localhost development có thể gặp vấn đề

4. **Thiết bị không có microphone**
   - Desktop không có microphone
   - Microphone bị tắt hoặc hỏng

### 🛠️ **Cách khắc phục:**

#### **1. Kiểm tra Browser Support**
```bash
# Mở Console (F12) và chạy:
console.log('SpeechRecognition:', !!window.SpeechRecognition);
console.log('webkitSpeechRecognition:', !!window.webkitSpeechRecognition);
console.log('MediaDevices:', !!navigator.mediaDevices);
```

**Kết quả mong muốn:**
- Chrome/Edge: `true` cho cả 3
- Firefox: `false` cho SpeechRecognition
- Safari: `false` cho SpeechRecognition

#### **2. Cấp quyền Microphone**

**Chrome/Edge:**
1. Click vào icon microphone trên thanh địa chỉ
2. Chọn "Allow" hoặc "Cho phép"
3. Refresh trang

**Safari:**
1. Safari > Preferences > Websites > Microphone
2. Chọn "Allow" cho domain hiện tại
3. Refresh trang

**Firefox:**
1. Click icon microphone trên thanh địa chỉ
2. Chọn "Allow" hoặc "Cho phép"
3. Refresh trang

#### **3. Kiểm tra HTTPS**
```bash
# URL phải bắt đầu bằng:
https://example.com  ✅
http://localhost:3000  ✅ (localhost exception)
http://example.com     ❌ (không hỗ trợ voice)
```

#### **4. Test Microphone**
```bash
# Mở Console và chạy:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('Microphone access granted');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => {
    console.error('Microphone access denied:', err);
  });
```

### 🧪 **Test Voice Support**

#### **Quick Test:**
1. Mở [Voice Agent Modal](../src/components/common/VoiceAgentModal.tsx)
2. Kiểm tra nút microphone có bị disabled không
3. Xem có thông báo lỗi gì không

#### **Console Test:**
```javascript
// Test voice service
import { voiceService } from './src/services/voiceService';

// Check support
console.log('Voice supported:', voiceService.isVoiceSupported());

// Check microphone permission
voiceService.checkMicrophonePermission()
  .then(hasPermission => {
    console.log('Microphone permission:', hasPermission);
  });

// Test speech recognition
if (voiceService.isVoiceSupported()) {
  voiceService.startListening(
    (transcript) => console.log('Transcript:', transcript),
    (error) => console.error('Error:', error)
  );
}
```

### 🔧 **Development Environment**

#### **Local Development:**
```bash
# Backend API
cd backend && npm run dev

# Voice Agent
cd voice-agent && python -m uvicorn app.api:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

#### **Environment Variables:**
```env
# frontend/.env
VITE_AGENT_API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:3000
```

#### **HTTPS for Local Development:**
```bash
# Generate SSL certificate
mkcert localhost 127.0.0.1

# Start with HTTPS
npm run dev -- --https
```

### 📱 **Mobile Testing**

#### **iOS Safari:**
- Hỗ trợ hạn chế
- Cần HTTPS
- Có thể cần user interaction

#### **Android Chrome:**
- Hỗ trợ đầy đủ
- Cần cấp quyền microphone
- HTTPS required

### 🚀 **Alternative Solutions**

#### **1. Text Input Fallback**
- Sử dụng text input thay vì voice
- Tất cả tính năng AI vẫn hoạt động
- Chỉ mất voice input

#### **2. Browser Switch**
- Chrome/Edge: Hỗ trợ tốt nhất
- Firefox: Không hỗ trợ voice
- Safari: Hỗ trợ hạn chế

#### **3. API-based Voice**
- Sử dụng backend voice agent
- Gửi audio file qua API
- Không phụ thuộc browser

### 📊 **Debug Information**

#### **Check Voice Service Status:**
```javascript
// Trong Console
const voiceService = window.voiceService || 
  (await import('./src/services/voiceService')).voiceService;

console.log('Voice Service Status:', {
  isSupported: voiceService.isVoiceSupported(),
  isListening: voiceService.getIsListening(),
  hasSpeechRecognition: !!voiceService.speechRecognition
});
```

#### **Check Browser Capabilities:**
```javascript
// Browser capabilities
console.log('Browser Info:', {
  userAgent: navigator.userAgent,
  platform: navigator.platform,
  language: navigator.language,
  cookieEnabled: navigator.cookieEnabled
});

// Media capabilities
console.log('Media Capabilities:', {
  mediaDevices: !!navigator.mediaDevices,
  getUserMedia: !!navigator.mediaDevices?.getUserMedia,
  enumerateDevices: !!navigator.mediaDevices?.enumerateDevices
});
```

### 🆘 **Khi cần hỗ trợ:**

1. **Kiểm tra Console logs** để xem lỗi chi tiết
2. **Test với browser khác** (Chrome/Edge)
3. **Kiểm tra microphone permissions** trong browser settings
4. **Verify HTTPS connection** nếu deploy production
5. **Contact development team** với thông tin lỗi chi tiết

---

**💡 Lưu ý:** Voice input yêu cầu HTTPS và browser hỗ trợ Web Speech API. Text input vẫn hoạt động bình thường và cung cấp đầy đủ tính năng AI Assistant.
