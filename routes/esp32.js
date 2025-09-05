if (WiFi.status() == WL_CONNECTED) {
  HTTPClient http;
  http.begin("https://instala-optima-ecotisat.replit.app/api/esp32");
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");

  String postData = "nivel=" + String(porcentaje);
  int httpResponseCode = http.POST(postData);

  if (httpResponseCode > 0) {
    String respuesta = http.getString();
    Serial.println("Respuesta servidor: " + respuesta);

    if (respuesta.indexOf("apagar") >= 0) {
      digitalWrite(relayPin, HIGH);
    } else if (respuesta.indexOf("encender") >= 0) {
      digitalWrite(relayPin, LOW);
    }

  } else {
    Serial.print("Error HTTP: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}
