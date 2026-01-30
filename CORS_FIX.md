# CORS 問題解決方案

## 問題描述
Google Apps Script 部署為網路應用程式後，前端 fetch 請求會遇到 CORS 錯誤。

## 解決方法

### 方法 1：使用 Google Apps Script 的正確部署設定（推薦）

1. 在 Apps Script 編輯器中，確認部署設定：
   - **執行身分**：我（你的帳號）
   - **具有存取權的使用者**：**任何人**
   
2. **重要**：每次修改代碼後，必須建立「新版本」的部署：
   - 點擊「部署」→「管理部署作業」
   - 點擊現有部署旁的「✏️ 編輯」
   - 在「版本」下拉選單中選擇「新版本」
   - 點擊「部署」
   
3. 使用更新後的部署 URL

### 方法 2：在 GAS 代碼中添加 CORS 標頭

在 `GAS-code.gs` 的 `doGet` 和 `doPost` 函式中，修改返回方式：

```javascript
function doGet(e) {
  // ... 你的代碼 ...
  
  const output = ContentService.createTextOutput(JSON.stringify({ inventory, costs, pricings, orders }))
    .setMimeType(ContentService.MimeType.JSON);
  
  // 添加 CORS 標頭（但 GAS 可能會忽略）
  return output;
}
```

### 方法 3：使用 JSONP（如果 CORS 持續失敗）

如果上述方法都無效，可以改用 JSONP 方式：

1. 修改 GAS 代碼返回 JSONP：
```javascript
function doGet(e) {
  const callback = e.parameter.callback || 'callback';
  const data = { inventory, costs, pricings, orders };
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(data) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
```

2. 在前端使用 script tag 載入：
```javascript
const loadDataViaJSONP = () => {
  return new Promise((resolve) => {
    window.gasCallback = (data) => {
      resolve(data);
      delete window.gasCallback;
    };
    const script = document.createElement('script');
    script.src = `${import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL}?callback=gasCallback`;
    document.head.appendChild(script);
  });
};
```

## 測試步驟

1. 在瀏覽器中直接訪問你的 GAS URL
2. 應該看到 JSON 格式的數據
3. 如果看到 HTML 或錯誤頁面，表示部署有問題

## 常見錯誤

- **403 Forbidden**：授權問題，重新授權
- **404 Not Found**：URL 錯誤或部署失敗
- **CORS Error**：使用上述方法 2 或 3
