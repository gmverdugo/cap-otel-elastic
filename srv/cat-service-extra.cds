entity TestSuccess {
  key id : UUID;
  result : String;
  timestamp : Timestamp;
}

entity TestError {
  key id : UUID;
  fail : String;
}
