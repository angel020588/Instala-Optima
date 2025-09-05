
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASSWORD";
const char* serverName = "https://instala-optima-ecotisat.replit.app/api/esp32";

const int relayPin = 5; // GPIO para controlar el relé/bomba
int nivelActual = 50;   // Variable para simular sensor (reemplaza con lectura real)

void setup() {
  Serial.begin(115200);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Bomba apagada por defecto
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando a WiFi...");
  }
  Serial.println("✅ WiFi conectado");
  
  // Debug de conexión
  Serial.print("IP local: ");
  Serial.println(WiFi.localIP());
  Serial.print("Señal WiFi: ");
  Serial.println(WiFi.RSSI());
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // Simular lectura del sensor (reemplaza con código real del sensor)
    nivelActual = random(10, 100); // Para pruebas - usar sensor real
    
    Serial.print("📊 Nivel medido: ");
    Serial.print(nivelActual);
    Serial.println("%");
    
    // Configurar cliente HTTPS
    WiFiClientSecure client;
    client.setInsecure(); // Para desarrollo - considera certificados en producción
    
    HTTPClient https;
    https.begin(client, serverName);
    https.addHeader("Content-Type", "application/x-www-form-urlencoded");
    
    // Preparar datos para enviar
    String postData = "nivel=" + String(nivelActual) + "&dispositivo=ESP32&estado=activo";
    
    // Enviar datos al servidor
    int httpResponseCode = https.POST(postData);
    
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode > 0) {
      String orden = https.getString();
      orden.trim(); // Eliminar espacios en blanco
      
      Serial.print("📩 Orden recibida del servidor: ");
      Serial.println(orden);
      
      // Ejecutar la orden recibida
      if (orden == "ENCENDER") {
        digitalWrite(relayPin, HIGH);
        Serial.println("⚡ Bomba ENCENDIDA");
      } 
      else if (orden == "APAGAR") {
        digitalWrite(relayPin, LOW);
        Serial.println("🛑 Bomba APAGADA");
      } 
      else if (orden == "ESPERAR") {
        Serial.println("⏸️ Bomba en espera...");
      }
      else {
        Serial.println("❓ Orden no reconocida: " + orden);
      }
      
    } else {
      Serial.print("❌ Error HTTP: ");
      Serial.println(httpResponseCode);
      Serial.print("Error detalle: ");
      Serial.println(https.errorToString(httpResponseCode));
    }
    
    https.end();
    
  } else {
    Serial.println("❌ WiFi desconectado - reintentando...");
    WiFi.reconnect();
  }
  
  // Esperar 15 segundos antes de la siguiente consulta
  delay(15000);
}
