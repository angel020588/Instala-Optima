
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";
const int relayPin = 2;

void setup() {
  Serial.begin(115200);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, HIGH); // Bomba apagada por defecto
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("Conectado a WiFi");
}

void loop() {
  // Aquí iría tu código para medir el nivel de agua
  int porcentaje = 50; // Ejemplo: reemplaza con lectura real del sensor
  
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("https://instala-optima-ecotisat.replit.app/api/esp32");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    String postData = "nivel=" + String(porcentaje) + "&dispositivo=ESP32";
    int httpResponseCode = http.POST(postData);

    if (httpResponseCode > 0) {
      String respuesta = http.getString();
      Serial.println("Respuesta servidor: " + respuesta);

      if (respuesta.indexOf("apagar") >= 0) {
        digitalWrite(relayPin, HIGH);
        Serial.println("Bomba APAGADA");
      } else if (respuesta.indexOf("encender") >= 0) {
        digitalWrite(relayPin, LOW);
        Serial.println("Bomba ENCENDIDA");
      }

    } else {
      Serial.print("Error HTTP: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
  
  delay(10000); // Esperar 10 segundos antes del siguiente envío
}
