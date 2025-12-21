# Ktshia (公車 API!)
## API (backend-service)
### Service Port (服務 Port)
預設 port 是 `4402`，如果你喜歡 idk `51023` 好了，你可以直接在 ENV 裡直接設定 
```
SERVICE_PORT=51023
```
### Service Logging (服務日誌檔)
預設是沒有開啟服務日誌的，但如果你想，可以在 ENV 可以進行設定
```
SERVICE_LOG=FILE
SERVICE_LOG_FILE=/YOUR_DIR # 請給權限
```

### Log traffic into system session
```
LOG_TRAFFIC_IN_SYSTEM_SESSION=true
```

## Pull repo:
```bash
git clone https://github.com/hpware/ktshia.git --depth=1
```
