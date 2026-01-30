# ⚠️ 安全設定說明

## API Key 設定

為了保護你的系統安全，請按照以下步驟設定 API Key：

### 1. 在 Google Apps Script 中設定
打開 `GAS-code.gs`，找到第 8 行：
```javascript
const API_KEY = "YOUR_SECRET_KEY_HERE";
```

將 `YOUR_SECRET_KEY_HERE` 改為你自己的密鑰，例如：
```javascript
const API_KEY = "MySecretKey_2024_abc123";
```

### 2. 在前端設定
打開 `src/components/LoginPage.jsx`，找到第 6 行：
```javascript
const CORRECT_KEY = 'YOUR_SECRET_KEY_HERE';
```

改為**與 GAS 相同的密鑰**：
```javascript
const CORRECT_KEY = 'MySecretKey_2024_abc123';
```

### 3. 重要提醒
- ⚠️ **絕對不要**將真實的 API Key 上傳到 GitHub
- ⚠️ 如果不小心上傳了，請立即更換新的 API Key
- ⚠️ 定期更換 API Key 以確保安全

## 如果 API Key 已經洩漏

1. 立即在 GAS 和前端改為新的 API Key
2. 重新部署 GAS
3. 考慮使用 `.gitignore` 排除包含敏感資訊的檔案
