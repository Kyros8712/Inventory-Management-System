# Google Sheets 初始設置指南

## 重要提醒

你的 GAS URL 正常運作，但回傳空數據：`{"inventory":[],"costs":[],"pricings":[],"orders":[]}`

這表示你的 Google Sheets 中**沒有任何數據**（只有標題行）。

---

## 快速設置步驟

### 方法 1：手動輸入初始數據（推薦）

在你的 Google Sheets 中，按照以下步驟建立 4 個工作表：

#### 1. 工作表：庫存

| A (品項) | B (庫存量) | C (訂單預售庫存) | D (剩餘庫存) |
|----------|-----------|----------------|-------------|
| 麻製品收納盒 | 15 | 0 | =B2-C2 |
| 不鏽鋼杯 | 8 | 2 | =B3-C3 |
| 香氛噴霧 | 20 | 0 | =B4-C4 |

**重要**：
- 第 1 行是標題（品項、庫存量、訂單預售庫存、剩餘庫存）
- D 欄使用公式 `=B2-C2`（拖曳複製到其他行）

---

#### 2. 工作表：單品成本

| A (日期) | B (品項) | C (進貨量) | D (品項進貨單價) | E (品項進貨總價) |
|---------|----------|-----------|----------------|----------------|
| 2024-01-20 | 不鏽鋼杯 | 10 | 100 | 1000 |
| 2024-01-21 | 麻製品收納盒 | 20 | 150 | 3000 |
| 2024-01-22 | 香氛噴霧 | 30 | 80 | 2400 |

**提示**：
- 日期可以直接輸入文字格式（例如：2024-01-20）
- 品項進貨總價 = 進貨量 × 品項進貨單價

---

#### 3. 工作表：單品定價

| A (品項) | B (品項進貨單價) | C (品項定價) | D (毛利率) |
|----------|----------------|-------------|-----------|
| 不鏽鋼杯 | 100 | 250 | =IF(C2>0, (C2-B2)/C2, 0) |
| 麻製品收納盒 | 150 | 300 | =IF(C3>0, (C3-B3)/C3, 0) |
| 香氛噴霧 | 80 | 200 | =IF(C4>0, (C4-B4)/C4, 0) |

**重要**：
- D 欄使用公式 `=IF(C2>0, (C2-B2)/C2, 0)`
- 這個公式會自動計算毛利率
- 拖曳複製到其他行

---

#### 4. 工作表：訂單

| A (日期) | B (訂單品項明細) | C (訂單總價) |
|---------|----------------|-------------|
| 2024-01-28 | 不鏽鋼杯 x 2 | 500 |

**提示**：
- 訂單品項明細格式：`品項名稱 x 數量`
- 多個品項用逗號分隔：`不鏽鋼杯 x 2, 香氛噴霧 x 1`

---

## 驗證設置

### 步驟 1：檢查 GAS URL

在瀏覽器中開啟你的 GAS URL：
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**預期結果**（設置完成後）：
```json
{
  "inventory": [
    {
      "item": "麻製品收納盒",
      "totalStock": 15,
      "preOrderStock": 0,
      "availableStock": 15,
      "unitCost": 150,
      "price": 300,
      "margin": 0.5
    },
    ...
  ],
  "costs": [...],
  "pricings": [...],
  "orders": [...]
}
```

### 步驟 2：測試前端應用

1. 重新整理前端頁面（http://localhost:5173）
2. 點擊「開始使用」
3. 應該看到 3 個商品的庫存資訊
4. 點擊「新增商品」測試新增功能

---

## 常見問題

### Q: 為什麼 GAS URL 回傳空陣列？
**A**: 你的 Google Sheets 中只有標題行，沒有數據行。請按照上述步驟手動輸入初始數據。

### Q: 公式顯示錯誤？
**A**: 確認：
- 剩餘庫存公式：`=B2-C2`（B 是庫存量，C 是訂單預售庫存）
- 毛利率公式：`=IF(C2>0, (C2-B2)/C2, 0)`（C 是定價，B 是成本）

### Q: 新增商品後 Google Sheets 沒有更新？
**A**: 
1. 確認 GAS 已授權
2. 在 Apps Script 編輯器中測試 `doPost` 函式
3. 查看瀏覽器控制台（F12）的錯誤訊息

---

## 自動化腳本（進階）

如果你想用腳本自動建立初始數據，可以在 Apps Script 中執行以下函式：

```javascript
function setupInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 庫存
  const inventorySheet = ss.getSheetByName("庫存") || ss.insertSheet("庫存");
  inventorySheet.clear();
  inventorySheet.appendRow(["品項", "庫存量", "訂單預售庫存", "剩餘庫存"]);
  inventorySheet.appendRow(["麻製品收納盒", 15, 0, "=B2-C2"]);
  inventorySheet.appendRow(["不鏽鋼杯", 8, 2, "=B3-C3"]);
  inventorySheet.appendRow(["香氛噴霧", 20, 0, "=B4-C4"]);
  
  // 2. 單品成本
  const costSheet = ss.getSheetByName("單品成本") || ss.insertSheet("單品成本");
  costSheet.clear();
  costSheet.appendRow(["日期", "品項", "進貨量", "品項進貨單價", "品項進貨總價"]);
  costSheet.appendRow(["2024-01-20", "不鏽鋼杯", 10, 100, 1000]);
  costSheet.appendRow(["2024-01-21", "麻製品收納盒", 20, 150, 3000]);
  costSheet.appendRow(["2024-01-22", "香氛噴霧", 30, 80, 2400]);
  
  // 3. 單品定價
  const pricingSheet = ss.getSheetByName("單品定價") || ss.insertSheet("單品定價");
  pricingSheet.clear();
  pricingSheet.appendRow(["品項", "品項進貨單價", "品項定價", "毛利率"]);
  pricingSheet.appendRow(["不鏽鋼杯", 100, 250, "=IF(C2>0, (C2-B2)/C2, 0)"]);
  pricingSheet.appendRow(["麻製品收納盒", 150, 300, "=IF(C3>0, (C3-B3)/C3, 0)"]);
  pricingSheet.appendRow(["香氛噴霧", 80, 200, "=IF(C4>0, (C4-B4)/C4, 0)"]);
  
  // 4. 訂單
  const orderSheet = ss.getSheetByName("訂單") || ss.insertSheet("訂單");
  orderSheet.clear();
  orderSheet.appendRow(["日期", "訂單品項明細", "訂單總價"]);
  orderSheet.appendRow(["2024-01-28", "不鏽鋼杯 x 2", 500]);
  
  Logger.log("初始數據設置完成！");
}
```

**使用方法**：
1. 將上述代碼貼到 Apps Script 編輯器中
2. 選擇函式 `setupInitialData`
3. 點擊「執行」
4. 重新整理 GAS URL 驗證數據

---

## 下一步

設置完成後，你就可以：
- ✅ 在前端查看庫存資訊
- ✅ 新增、編輯、刪除商品
- ✅ 建立訂單（自動更新訂單預售庫存）
- ✅ 刪除訂單（自動還原訂單預售庫存）
