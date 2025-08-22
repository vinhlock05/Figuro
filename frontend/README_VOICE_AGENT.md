# 🎤 Voice Agent Frontend Integration

Frontend đã được tích hợp đầy đủ với **Backend Voice Agent** và **Chatbot Integration** để cung cấp trải nghiệm tương tác bằng giọng nói hoàn chỉnh.

## ✨ **Tính năng đã tích hợp**

### 🎯 **Core Voice Features**
- **Speech-to-Text (STT)**: Ghi âm và chuyển đổi giọng nói thành văn bản
- **Text-to-Speech (TTS)**: Chuyển đổi văn bản thành giọng nói tự nhiên
- **Multi-language Support**: Hỗ trợ Tiếng Việt, English, Japanese
- **Real-time Processing**: Xử lý giọng nói theo thời gian thực

### 🤖 **AI Integration**
- **Chatbot Integration**: Kết nối với backend chatbot service
- **Product Knowledge Base**: Truy cập vào 50+ sản phẩm anime/manga
- **Intent Recognition**: Nhận diện ý định người dùng (tìm kiếm, đặt hàng, tư vấn)
- **Entity Extraction**: Trích xuất thông tin sản phẩm, danh mục, giá cả

### 🔍 **Product Search & Recommendations**
- **Voice-based Search**: Tìm kiếm sản phẩm bằng giọng nói
- **Smart Filtering**: Lọc theo danh mục, khoảng giá
- **Product Recommendations**: Gợi ý sản phẩm thông minh
- **Category Browsing**: Duyệt danh mục sản phẩm

## 🚀 **Cách sử dụng**

### 1. **Khởi động Backend Services**
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Voice Agent
cd voice-agent
python -m uvicorn app.api:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Frontend
cd frontend
npm run dev
```

### 2. **Cấu hình Environment**
Tạo file `.env` trong thư mục `frontend`:
```env
VITE_AGENT_API_BASE_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:3000
```

### 3. **Sử dụng Voice Agent**

#### **Quick Voice Button**
- Click vào nút microphone để bắt đầu ghi âm
- Nói câu lệnh như: "Tôi muốn tìm sản phẩm Naruto"
- Click vào nút settings để mở menu hành động nhanh

#### **Full Voice Modal**
- Sử dụng phím tắt `Ctrl + /` để mở modal đầy đủ
- Hoặc click "Mở trợ lý ảo đầy đủ" từ quick actions

#### **Voice Product Search**
- Click "🔍 Tìm sản phẩm" để mở modal tìm kiếm
- Sử dụng giọng nói hoặc nhập text để tìm kiếm
- Lọc theo danh mục và khoảng giá

## 🎨 **UI Components**

### **VoiceAgentButton**
- Nút microphone chính với animation
- Quick actions menu với các tác vụ phổ biến
- Status indicators (listening, processing, error)

### **VoiceAgentModal**
- Modal đầy đủ cho tương tác voice
- Conversation history với product recommendations
- Language selection và settings
- Quick action buttons

### **VoiceProductSearch**
- Modal tìm kiếm sản phẩm nâng cao
- Filters theo danh mục và giá
- Grid layout hiển thị sản phẩm
- Voice search integration

## 🔧 **Technical Implementation**

### **Services**
- `voiceService.ts`: Core voice functionality
- `voiceContextService.ts`: Voice context management
- `voiceHelpers.ts`: Product search helpers

### **Contexts**
- `VoiceContext.tsx`: Global voice state management
- Integration với chatbot và product knowledge

### **API Endpoints**
- `/voice/process-text`: Xử lý text input
- `/voice/process`: Xử lý audio file
- `/voice/products/search`: Tìm kiếm sản phẩm
- `/voice/products/recommendations`: Gợi ý sản phẩm
- `/voice/chatbot/query`: Truy vấn chatbot

## 📱 **Responsive Design**
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts cho tablet/desktop
- Dark mode support

## 🌐 **Browser Support**
- Chrome/Edge: Full support
- Firefox: Limited support
- Safari: Limited support
- Mobile browsers: Full support

## 🔒 **Security Features**
- HTTPS required cho microphone access
- API rate limiting
- Input sanitization
- Error handling

## 📊 **Performance Optimizations**
- Lazy loading components
- Debounced search
- Cached API responses
- Optimized audio processing

## 🐛 **Troubleshooting**

### **Microphone không hoạt động**
1. Kiểm tra HTTPS connection
2. Cấp quyền microphone cho browser
3. Kiểm tra backend voice agent status

### **API Errors**
1. Kiểm tra backend services đang chạy
2. Verify environment variables
3. Check network connectivity

### **Voice Recognition Issues**
1. Nói rõ ràng và chậm
2. Kiểm tra language setting
3. Test với different browsers

## 🚀 **Future Enhancements**
- [ ] Offline voice processing
- [ ] Custom voice commands
- [ ] Voice shopping cart
- [ ] Multi-user voice profiles
- [ ] Advanced NLP features
- [ ] Voice analytics dashboard

## 📚 **Documentation**
- [Backend Voice Agent](../voice-agent/README_ENHANCED.md)
- [API Documentation](../voice-agent/README_ENHANCED.md#api-endpoints)
- [Product Database](../backend/prisma/seed.ts)

## 🤝 **Support**
Nếu gặp vấn đề, hãy:
1. Kiểm tra console logs
2. Verify backend services
3. Test với curl commands
4. Contact development team

---

**🎉 Frontend đã sẵn sàng sử dụng Voice Agent với đầy đủ tính năng!**
