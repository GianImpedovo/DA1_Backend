# API MoviePlay

## Integrantes

- Jeronimo Aquino
- Lucia Castro
- Agostina Timberio
- Gianfranco Impedovo

### Descripcion 

Api para realizar conexion con base de datos instanciada en aws, realiza la verificacion y creacion de token para validacion de usuario,
interaccion con los datos de la base y conexion con TMDB para la obtencion de informacion sobre las peliculas solicitadas

### Requisitos

- Node.js v20.12.1
- npm v10.5.0

### Instalacion 

## Opcion 1: Archivo ZIP 

Descomprimir el archivo ZIP:

Windows:
- Navega al archivo ZIP descargado y haz clic derecho sobre él.
- Selecciona "Extraer todo..." y elige la ubicación donde deseas descomprimir los archivos.

Linux:
- unzip nombre-del-archivo.zip -d nombre-del-directorio
- cd nombre-del-directorio

## Opcion 2: Clonar el repositorio

Comdando: git clone https://github.com/GianImpedovo/DA1_Backend.git

## Instalar Dependencias

Desde la raiz del proyecto ejecutar el siguiente comando para instalar dependencias:
npm install

## Variables de entorno, archivo .env:
Debe existir un .env en la raiz del proyecto, en caso que no exista crear y copiar los siguientes datos:

### Token para usar la api de TMDB
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyZTUzMTAwNDIxM2MyNGQxZjZlMmE1YjUxNjMwYzg0ZCIsInN1YiI6IjY2MWQ2NjYwZWMwYzU4MDE3Yzc0ZGY5ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.gtIXH-XpTI3d62vL5GM8Zpbunu8TfVvdK2tU6coNvS0"

### Secret key para creacion del JWT
SECRET_KEY = "crlf"

### Puerto de la API
PORT=3000

## Inicio:

Usar el comando para inicializar la API, debe figurar el mensaje: server listening on port http://localhost:<PUERTO> : 

Inicio desarrollo:
npm run dev

Inicio produccion:
node .\src\index.js

### Dependencias
axios - ^1.6.8
compromise - 14.13.0
cors - ^2.8.5
dotenv - ^16.4.5
express - ^4.19.2
jsonwebtoken - ^9.0.2
morgan - ^1.10.0
mssql - ^10.0.2
node-fetch - ^2.7.0
nodemon - ^3.1.0