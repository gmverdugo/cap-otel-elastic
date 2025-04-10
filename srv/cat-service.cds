type LogEntry {
  level   : String;
  message : String;
  source  : String;
}

service LoggingService {
  action sendLog(entry: LogEntry) returns String;
}
