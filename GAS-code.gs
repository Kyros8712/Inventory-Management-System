// ============================================
// 庫存管理系統 - Google Apps Script 後端
// ============================================

// ---------------- 系統設定 ----------------
// ⚠️ 請務必修改下方的 API Key 以確保安全
const API_KEY = "YOUR_SECRET_KEY_HERE"; // 請改為你自己的密鑰
// ----------------------------------------

function checkApiKey(params) {
  if (params.apiKey !== API_KEY) {
    Utilities.sleep(2000); // 防止暴力破解
    return false;
  }
  return true;
}


// ============================================
// 初始化數據結構
// ============================================
function setupInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 庫存 [品項, 庫存量, 訂單預售庫存, 剩餘庫存, 分類]
  const inventorySheet = ss.getSheetByName("庫存") || ss.insertSheet("庫存");
  inventorySheet.clear();
  inventorySheet.appendRow(["品項", "庫存量", "訂單預售庫存", "剩餘庫存", "分類"]);
  inventorySheet.appendRow(["商品A", 100, "=SUMIF(訂單!B:B,A2,訂單!C:C)", "=B2-C2", "餐廚用品 > 杯具"]);
  
  // 2. 單品成本 [日期, 品項, 進貨量, 品項進貨單價, 品項進貨總價, 分類]
  const costSheet = ss.getSheetByName("單品成本") || ss.insertSheet("單品成本");
  costSheet.clear();
  costSheet.appendRow(["日期", "品項", "進貨量", "品項進貨單價", "品項進貨總價", "分類"]);
  
  // 3. 單品定價 [品項, 品項進貨單價, 品項定價, 毛利率, 分類]
  const pricingSheet = ss.getSheetByName("單品定價") || ss.insertSheet("單品定價");
  pricingSheet.clear();
  pricingSheet.appendRow(["品項", "品項進貨單價", "品項定價", "毛利率", "分類"]);
  
  // 4. 訂單 [訂單編號, 日期, 訂單品項明細, 訂單總價, 訂單利潤, 訂單毛利率]
  const orderSheet = ss.getSheetByName("訂單") || ss.insertSheet("訂單");
  orderSheet.clear();
  orderSheet.appendRow(["訂單編號", "日期", "訂單品項明細", "訂單總價", "訂單利潤", "訂單毛利率"]);
  
  // 5. 完成訂單
  const completedOrderSheet = ss.getSheetByName("完成訂單") || ss.insertSheet("完成訂單");
  completedOrderSheet.clear();
  completedOrderSheet.appendRow(["訂單編號", "日期", "訂單總價", "訂單利潤", "訂單毛利率"]);
  
  // 6. 訂單訂購人
  const customerSheet = ss.getSheetByName("訂單訂購人") || ss.insertSheet("訂單訂購人");
  customerSheet.clear();
  customerSheet.appendRow(["訂單編號", "日期", "訂購人", "電話", "7-11店號"]);

  // 7. 操作紀錄 [時間, 動作, 詳細資訊]
  const logSheet = ss.getSheetByName("操作紀錄") || ss.insertSheet("操作紀錄");
  logSheet.clear();
  logSheet.appendRow(["時間", "動作", "詳細資訊"]);

  // 8. 類別管理 [主類別, 子類別, 啟用狀態]
  const categorySheet = ss.getSheetByName("類別") || ss.insertSheet("類別");
  categorySheet.clear();
  categorySheet.appendRow(["主類別", "子類別", "啟用狀態"]);
  categorySheet.appendRow(["餐廚用品", "杯具", true]);
  categorySheet.appendRow(["餐廚用品", "餐具", true]);
  categorySheet.appendRow(["收納用品", "布質收納", true]);
  categorySheet.appendRow(["收納用品", "", true]);
  categorySheet.appendRow(["香氛用品", "", true]);
  
  Logger.log("✅ 數據結構更新完成！");
}

// ============================================
// GET 請求處理 - 獲取所有數據
// ============================================
function doGet(e) {
  const params = e.parameter;
  
  if (!checkApiKey(params)) {
    const output = ContentService.createTextOutput(JSON.stringify({ error: 'Invalid API Key' }))
      .setMimeType(ContentService.MimeType.JSON);
    return output;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const inventorySheet = ss.getSheetByName("庫存") || createInventorySheet(ss);
  const costSheet = ss.getSheetByName("單品成本") || createSheet(ss, "單品成本", ["日期", "品項", "進貨量", "品項進貨單價", "品項進貨總價", "分類"]);
  const pricingSheet = ss.getSheetByName("單品定價") || createSheet(ss, "單品定價", ["品項", "品項進貨單價", "品項定價", "毛利率", "分類"]);
  const orderSheet = ss.getSheetByName("訂單") || createSheet(ss, "訂單", ["訂單編號", "日期", "訂單品項明細", "訂單總價", "訂單利潤", "訂單毛利率"]);
  const completedOrderSheet = ss.getSheetByName("完成訂單") || createSheet(ss, "完成訂單", ["訂單編號", "日期", "訂單總價", "訂單利潤", "訂單毛利率"]);
  const customerSheet = ss.getSheetByName("訂單訂購人") || createSheet(ss, "訂單訂購人", ["訂單編號", "日期", "訂購人", "電話", "7-11店號"]);
  const logSheet = ss.getSheetByName("操作紀錄") || createSheet(ss, "操作紀錄", ["時間", "動作", "詳細資訊"]);
  const categorySheet = ss.getSheetByName("類別") || createSheet(ss, "類別", ["主類別", "子類別", "啟用狀態"]);
  
  const inventoryData = inventorySheet.getDataRange().getValues().slice(1);
  const pricingData = pricingSheet.getDataRange().getValues().slice(1);
  
  const inventory = inventoryData.map((row, index) => {
    const pricing = pricingData.find(p => p[0] === row[0]) || [];
    return {
      item: row[0],
      stock: row[1],
      totalStock: row[1],
      preOrderStock: row[2],
      remainingStock: row[3],
      category: row[4] || '',
      unitCost: pricing[1] || 0,
      price: pricing[2] || 0,
      margin: pricing[3] || '0%'
    };
  });
  
  const costs = costSheet.getDataRange().getValues().slice(1).map(row => ({
    date: formatDate(row[0]),
    item: row[1],
    quantity: row[2],
    unitCost: row[3],
    totalCost: row[4],
    category: row[5] || ''
  }));
  
  const pricings = pricingData.map(row => ({
    item: row[0],
    unitCost: row[1],
    price: row[2],
    margin: row[3],
    category: row[4] || ''
  }));
  
  const orders = orderSheet.getDataRange().getValues().slice(1).map(row => ({
    id: row[0], date: formatDate(row[1]), items: row[2], totalPrice: row[3], profit: row[4], margin: row[5]
  }));
  
  const completedOrders = completedOrderSheet.getDataRange().getValues().slice(1).map(row => ({
    id: row[0], date: formatDate(row[1]), totalPrice: row[2], profit: row[3], margin: row[4]
  }));

  const lastLogLine = logSheet.getLastRow();
  const activityLogs = lastLogLine > 1 ? logSheet.getRange(2, 1, Math.min(100, lastLogLine - 1), 3).getValues().filter(row => row[0]).map(row => ({
    time: formatDate(row[0]),
    action: row[1],
    details: row[2]
  })) : [];

  const categoryData = categorySheet.getDataRange().getValues().slice(1);
  const categories = categoryData.filter(row => row[2] === true).map(row => ({
    mainCategory: row[0],
    subCategory: row[1] || '',
    enabled: row[2]
  }));
  
  const jsonOutput = JSON.stringify({ inventory, costs, pricings, orders, completedOrders, activityLogs, categories });
  
  return ContentService.createTextOutput(jsonOutput)
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// POST 請求處理 - 執行操作
// ============================================
function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  
  if (!checkApiKey(params)) {
    const output = ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid API Key' }))
      .setMimeType(ContentService.MimeType.JSON);
    return output;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = params.action;
  let result = { status: 'success' };
  
  try {
    if (action === 'createOrder') {
      handleCreateOrder(ss, params);
      logActivity(ss, "建立訂單", params.orderId);
    } else if (action === 'completeOrder') {
      handleCompleteOrder(ss, params.orderId);
      logActivity(ss, "完成訂單", params.orderId);
    } else if (action === 'deleteOrder') {
      handleDeleteOrder(ss, params.orderId);
      logActivity(ss, "刪除訂單", params.orderId);
    } else if (action === 'addInventoryItem') {
      handleAddInventoryItem(ss, params);
      logActivity(ss, "新增商品", `${params.item} (${params.category})`);
    } else if (action === 'updateInventoryItem') {
      handleUpdateInventoryItem(ss, params);
      logActivity(ss, "更新商品", `${params.item} (庫存:${params.totalStock})`);
    } else if (action === 'deleteInventoryItem') {
      handleDeleteInventoryItem(ss, params.item);
      logActivity(ss, "刪除商品", params.item);
    } else if (action === 'addCost') {
      handleAddCost(ss, params);
      logActivity(ss, "新增成本", `${params.item} (${params.quantity})`);
    } else if (action === 'updateCost') {
      updateRowByItem(ss, "單品成本", params.originalItem, [params.date, params.item, params.quantity, params.unitCost, params.totalCost, params.category]);
      logActivity(ss, "更新成本", params.item);
    } else if (action === 'deleteCost') {
      deleteRowByItem(ss, "單品成本", params.item);
      logActivity(ss, "刪除成本", params.item);
    } else if (action === 'addPricing') {
      handleAddPricing(ss, params);
      logActivity(ss, "新增定價", params.item);
    } else if (action === 'updatePricing') {
      updateRowByItem(ss, "單品定價", params.originalItem, [params.item, params.unitCost, params.price, null, params.category]);
      logActivity(ss, "更新定價", params.item);
    } else if (action === 'deletePricing') {
      deleteRowByItem(ss, "單品定價", params.item);
      logActivity(ss, "刪除定價", params.item);
    } else if (action === 'addCategory') {
      handleAddCategory(ss, params);
      logActivity(ss, "新增類別", `${params.mainCategory}${params.subCategory ? ' > ' + params.subCategory : ''}`);
    } else if (action === 'updateCategory') {
      handleUpdateCategory(ss, params);
      logActivity(ss, "更新類別", `${params.oldMain}${params.oldSub ? ' > ' + params.oldSub : ''} → ${params.newMain}${params.newSub ? ' > ' + params.newSub : ''}`);
    } else if (action === 'deleteCategory') {
      const deleteResult = handleDeleteCategory(ss, params);
      if (deleteResult.status === 'error') {
        result = deleteResult;
      } else {
        logActivity(ss, "刪除類別", `${params.mainCategory}${params.subCategory ? ' > ' + params.subCategory : ''}`);
      }
    } else {
      result = { status: 'error', message: 'Unknown action: ' + action };
    }
  } catch (error) {
    result = { status: 'error', message: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// 輔助函式
// ============================================

function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function createSheet(ss, name, headers) {
  const sheet = ss.insertSheet(name);
  sheet.appendRow(headers);
  return sheet;
}

function createInventorySheet(ss) {
    const sheet = ss.insertSheet("庫存");
    sheet.appendRow(["品項", "庫存量", "訂單預售庫存", "剩餘庫存", "分類"]);
    return sheet;
}

function logActivity(ss, action, details) {
  const logSheet = ss.getSheetByName("操作紀錄") || createSheet(ss, "操作紀錄", ["時間", "動作", "詳細資訊"]);
  logSheet.insertRowAfter(1);
  logSheet.getRange(2, 1, 1, 3).setValues([[new Date(), action, details]]);
}

function handleCreateOrder(ss, params) {
  const orderSheet = ss.getSheetByName("訂單");
  orderSheet.appendRow([params.orderId, new Date(), params.items, params.totalPrice, params.profit, params.margin]);
  
  const customerSheet = ss.getSheetByName("訂單訂購人");
  customerSheet.appendRow([params.orderId, new Date(), params.customerName, params.phone, params.store]);
}

function handleCompleteOrder(ss, orderId) {
  const orderSheet = ss.getSheetByName("訂單");
  const completedOrderSheet = ss.getSheetByName("完成訂單");
  
  const data = orderSheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderId) {
      completedOrderSheet.appendRow([data[i][0], data[i][1], data[i][3], data[i][4], data[i][5]]);
      orderSheet.deleteRow(i + 1);
      break;
    }
  }
}

function handleDeleteOrder(ss, orderId) {
  const orderSheet = ss.getSheetByName("訂單");
  const customerSheet = ss.getSheetByName("訂單訂購人");
  
  deleteRowById(orderSheet, orderId);
  deleteRowById(customerSheet, orderId);
}

function handleAddInventoryItem(ss, params) {
  const inventorySheet = ss.getSheetByName("庫存");
  inventorySheet.appendRow([params.item, params.totalStock, 0, params.totalStock, params.category]);
  
  if (params.unitCost && params.price) {
    handleAddPricing(ss, params);
  }
}

function handleUpdateInventoryItem(ss, params) {
  const inventorySheet = ss.getSheetByName("庫存");
  const data = inventorySheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.originalItem) {
      inventorySheet.getRange(i + 1, 1).setValue(params.item);
      inventorySheet.getRange(i + 1, 2).setValue(params.totalStock);
      inventorySheet.getRange(i + 1, 5).setValue(params.category);
      break;
    }
  }
  
  if (params.unitCost !== undefined && params.price !== undefined) {
    updateRowByItem(ss, "單品定價", params.originalItem, [params.item, params.unitCost, params.price, null, params.category]);
  }
}

function handleDeleteInventoryItem(ss, item) {
  deleteRowByItem(ss, "庫存", item);
  deleteRowByItem(ss, "單品定價", item);
}

function handleAddCost(ss, params) {
  const costSheet = ss.getSheetByName("單品成本");
  costSheet.appendRow([new Date(), params.item, params.quantity, params.unitCost, params.totalCost, params.category]);
}

function handleAddPricing(ss, params) {
  const pricingSheet = ss.getSheetByName("單品定價");
  const margin = params.price > 0 ? ((params.price - params.unitCost) / params.price * 100).toFixed(1) + '%' : '0%';
  pricingSheet.appendRow([params.item, params.unitCost, params.price, margin, params.category]);
}

function handleAddCategory(ss, params) {
  const sheet = ss.getSheetByName("類別");
  sheet.appendRow([params.mainCategory, params.subCategory || '', true]);
}

function handleUpdateCategory(ss, params) {
  const sheet = ss.getSheetByName("類別");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.oldMain && data[i][1] === (params.oldSub || '')) {
      sheet.getRange(i + 1, 1, 1, 2).setValues([[params.newMain, params.newSub || '']]);
      break;
    }
  }
}

function handleDeleteCategory(ss, params) {
  const inventorySheet = ss.getSheetByName("庫存");
  const inventoryData = inventorySheet.getDataRange().getValues().slice(1);
  const categoryStr = params.mainCategory + (params.subCategory ? ' > ' + params.subCategory : '');
  
  const usedCount = inventoryData.filter(row => row[4] === categoryStr).length;
  if (usedCount > 0) {
    return { status: 'error', message: `無法刪除：有 ${usedCount} 個商品使用此類別` };
  }
  
  const sheet = ss.getSheetByName("類別");
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === params.mainCategory && data[i][1] === (params.subCategory || '')) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { status: 'success' };
}

function deleteRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
    }
  }
}

function deleteRowByItem(ss, sheetName, item) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === item || data[i][1] === item) {
      sheet.deleteRow(i + 1);
    }
  }
}

function updateRowByItem(ss, sheetName, originalItem, newData) {
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === originalItem || data[i][1] === originalItem) {
      for (let j = 0; j < newData.length; j++) {
        if (newData[j] !== null && newData[j] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(newData[j]);
        }
      }
      break;
    }
  }
}
