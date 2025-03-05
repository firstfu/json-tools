import json
import random
import string
import uuid
from datetime import datetime


def 生成隨機字串(長度):
    # 產生由英文字母與數字組成的隨機字串，避免每筆資料的內容相同
    return "".join(random.choices(string.ascii_letters + string.digits, k=長度))


# 建立複雜的內部資料結構，並持續累積資料直到總長度達 1MB
內部資料 = {"資料": []}
while len(json.dumps(內部資料, separators=(",", ":")).encode("utf-8")) < 1024 * 1024:
    編號 = len(內部資料["資料"])
    隨機描述 = f"記錄 {編號}: " + 生成隨機字串(50)
    時間戳 = datetime.utcnow().isoformat() + "Z"
    內部資料["資料"].append({"編號": 編號, "時間": 時間戳, "描述": 隨機描述, "值": 生成隨機字串(20)})

# 將內部資料轉換成未格式化的 JSON 字串
參數字串 = json.dumps(內部資料, separators=(",", ":"))

# 建立最終的 JSON 結構，包含多個具有意義的中文 key
最終結果 = {
    "驗證密鑰": "H7MMHNWvNED0cLd/2xv+/UuXI2VtkSmo0sPaUuDCMo4qGUqVmPIHINSEmZcDXdY/+n+FLLcNmTAjvTZ/eqVUPA==",
    "請求ID": str(uuid.uuid4()),
    "時間戳": datetime.utcnow().isoformat() + "Z",
    "使用者資訊": {"用戶名": "範例用戶", "角色": "管理員", "權限": ["讀取", "寫入", "執行"]},
    "元數據": {"來源": "生成", "版本": "1.0", "描述": "此 JSON 包含一個超過1MB的複雜參數字串 (參數)。"},
    "參數": 參數字串,
}

# 將最終結果寫入檔案 test.json（未格式化）
with open("test.json", "w", encoding="utf-8") as 檔案:
    json.dump(最終結果, 檔案, separators=(",", ":"))

print("已將 JSON 資料輸出到 test.json")
