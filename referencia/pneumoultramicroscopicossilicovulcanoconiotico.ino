const int pinoSensorLuzesq = A0;  // Define o pino analógico onde o sensor está conectado
const int pinoSensorLuzdir = A1;  // Define o pino analógico onde o sensor está conectado
const int motoresq = 2;           // Define o pino positivo do motor esquerdo(move para frente)
const int motordir = 4;          // Define o pino positivo do motor direito(move para frente)
const int motoresqtras = 3;      // Define o pino negativo do motor esquerdo(move para trás)
const int motordirtras = 5;      // Define o pino negativo do motor direito(move para trás)

int media;

void setup() {
  pinMode(pinoSensorLuzesq, INPUT);
  pinMode(pinoSensorLuzdir, INPUT);
  pinMode(motordir, OUTPUT);
  pinMode(motoresq, OUTPUT);
  pinMode(motoresqtras, OUTPUT);
  pinMode(motordirtras, OUTPUT);
  Serial.begin(9600);  // Inicializa a comunicação serial para debug

  media = 100; // Apagar essa linha e descomentar a liha abaixo, caso utilize a calibração
}

void loop() {
  while (true) {
    int intensidadeLuzesq = analogRead(pinoSensorLuzesq);  // Lê a intensidade da luz
    int intensidadeLuzdir = analogRead(pinoSensorLuzdir);  // Lê a intensidade da luz
    Serial.print("Esquerda: ");
    Serial.println(intensidadeLuzesq);
    Serial.print(" | Direita: ");
    Serial.println(intensidadeLuzdir);

    int vel = 180; // 0 a 255

   if (intensidadeLuzesq < media) {
      // Serial.println("esquerda");
      analogWrite(motordirtras, 0); // Neutraliza o movimento para trás do motor  direito
      analogWrite(motordir, vel); // Atribui o valor definido da velocidade para o movimento para frente do motor direito
      analogWrite(motoresqtras, 0); // Atribui um pequeno movimento para trás para o motor esquerdo "travar a roda"
      analogWrite(motoresq, 0); // Neutraliza o movimento para frente do motor esquerdo
    } else if (intensidadeLuzdir < media) {
      // Serial.println("direita");
      analogWrite(motoresqtras, 0); // Neutraliza o movimento para trás do motor motor esquerdo
      analogWrite(motoresq, vel); // Atribui o valor definido da velocidade para o movimento para frente do motor esquerdo
      analogWrite(motordirtras, 0); // Atribui um pequeno movimento para trás para o direito "travar a roda"
      analogWrite(motordir, 0); // Neutraliza o movimento para frente do motor direito 
      
    }
  }
}
