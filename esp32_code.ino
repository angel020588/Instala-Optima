
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configuración WiFi
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// URL del servidor (asegúrate de que termine con /)
const String serverURL = "https://instala-optima-ecotisat.replit.app/api/esp32/";

// Pin del sensor ultrasónico
const int trigPin = 2;
const int echoPin = 4;

// Pin del relé (bomba)
const int relayPin = 5;

// Variables del tanque
const float alturaTanque = 200.0; // altura total del tanque en cm

void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW); // Bomba apagada inicialmente
  
  // Conectar a WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Leer sensor ultrasónico
  float distancia = leerSensorUltrasonico();
  float porcentaje = calcularPorcentaje(distancia);
  
  Serial.print("Distancia: ");
  Serial.print(distancia);
  Serial.print(" cm, Nivel: ");
  Serial.print(porcentaje);
  Serial.println("%");
  
  // Enviar datos al servidor y recibir comando
  String comando = enviarDatosAlServidor(porcentaje);
  
  // Ejecutar comando recibido
  ejecutarComando(comando);
  
  delay(10000); // Esperar 10 segundos antes de la siguiente lectura
}

float leerSensorUltrasonico() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  float distancia = duration * 0.034 / 2;
  
  return distancia;
}

float calcularPorcentaje(float distancia) {
  float nivelAgua = alturaTanque - distancia;
  if (nivelAgua < 0) nivelAgua = 0;
  if (nivelAgua > alturaTanque) nivelAgua = alturaTanque;
  
  float porcentaje = (nivelAgua / alturaTanque) * 100;
  return porcentaje;
}

String enviarDatosAlServidor(float porcentaje) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado");
    return "ESPERAR";
  }
  
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  
  // Crear JSON
  DynamicJsonDocument doc(1024);
  doc["nivel"] = round(porcentaje);
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Enviando: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  String comando = "ESPERAR";
  if (httpResponseCode > 0) {
    comando = http.getString();
    comando.trim();
    Serial.print("Comando recibido: ");
    Serial.println(comando);
  } else {
    Serial.print("Error HTTP: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
  return comando;
}

void ejecutarComando(String comando) {
  comando.toUpperCase();
  
  if (comando == "ENCENDER") {
    digitalWrite(relayPin, HIGH);
    Serial.println("💧 BOMBA ENCENDIDA");
  } else if (comando == "APAGAR") {
    digitalWrite(relayPin, LOW);
    Serial.println("🚫 BOMBA APAGADA");
  } else {
    // ESPERAR - mantener estado actual
    Serial.println("⏳ ESPERANDO...");
  }
}
