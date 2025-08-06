# Hệ thống xử lý Token Expiration

## ✅ **Đã triển khai hệ thống xử lý token hết hạn hoàn chỉnh:**

### **1. Axios Interceptor (authService.ts)**
```typescript
// Tự động xử lý 401 errors
this.api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear tokens và redirect
            this.clearTokens();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }
        return Promise.reject(error);
    }
);
```

### **2. AuthContext Enhancements**
- ✅ **checkTokenExpiration()**: Kiểm tra JWT token expiration
- ✅ **handleTokenExpiration()**: Xử lý khi token hết hạn
- ✅ **Auto redirect**: Tự động chuyển về login khi token invalid

### **3. Custom Hook (useTokenExpiration.ts)**
```typescript
// Kiểm tra token mỗi phút
setInterval(() => {
    if (checkTokenExpiration()) {
        handleTokenExpiration();
    }
}, 60000);

// Kiểm tra khi user focus tab
window.addEventListener('focus', handleFocus);
```

### **4. Login Page Enhancement**
- ✅ **Expired message**: Hiển thị thông báo khi token hết hạn
- ✅ **URL parameter**: `/login?expired=true`
- ✅ **Auto clear**: Tự động xóa parameter khỏi URL

### **5. Token Expiration Modal**
- ✅ **Component**: `TokenExpirationModal.tsx`
- ✅ **UI**: Thông báo đẹp với icon và buttons
- ✅ **Actions**: Đóng hoặc đăng nhập lại

## **🔄 Cách hoạt động:**

### **1. Tự động kiểm tra:**
- **Mỗi phút**: Hook kiểm tra token expiration
- **Khi focus tab**: Kiểm tra khi user quay lại
- **API calls**: Interceptor bắt 401 errors

### **2. Xử lý khi hết hạn:**
1. **Clear tokens** từ localStorage
2. **Set user = null** trong AuthContext
3. **Redirect** đến `/login?expired=true`
4. **Hiển thị thông báo** trên login page

### **3. User Experience:**
- ✅ **Seamless**: Không bị gián đoạn đột ngột
- ✅ **Clear message**: Thông báo rõ ràng bằng tiếng Việt
- ✅ **Easy login**: Chuyển thẳng đến form đăng nhập
- ✅ **Security**: Tự động logout khi token invalid

## **🔧 Cấu hình:**

### **Token Buffer Time:**
```typescript
// 5 phút buffer trước khi hết hạn
if (payload.exp && payload.exp < currentTime + 300) {
    return true; // Token sắp hết hạn
}
```

### **Check Intervals:**
- **API calls**: Mỗi request
- **Background**: Mỗi phút
- **Page focus**: Khi user quay lại tab

## **🎯 Kết quả:**

### **Bảo mật:**
- ✅ Token hết hạn được xử lý tự động
- ✅ Không có session "zombie"
- ✅ Clear tokens ngay lập tức

### **UX:**
- ✅ Thông báo rõ ràng cho user
- ✅ Redirect mượt mà
- ✅ Không bị mất dữ liệu đang làm

### **Developer Experience:**
- ✅ Hook dễ sử dụng
- ✅ Tự động áp dụng cho toàn app
- ✅ Có thể customize dễ dàng

## **📝 Sử dụng:**

```typescript
// Trong component
const { checkTokenExpiration, handleTokenExpiration } = useAuth();

// Kiểm tra thủ công
if (checkTokenExpiration()) {
    handleTokenExpiration();
}

// Hook tự động (đã áp dụng trong App.tsx)
useTokenExpiration();
```

Hệ thống đã sẵn sàng và sẽ tự động xử lý token expiration cho toàn bộ ứng dụng! 🔐 