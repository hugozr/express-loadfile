//Ejecutar ts-node index.ts    
import express from 'express';

import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';
const axios = require('axios');
const app = express();
const port = 3005;

const folderPath = 'C:/ehzr/16.Petso/02.app/payload-petzocial/src/excel-files';
const subfolderPath = 'C:/ehzr/16.Petso/02.app/payload-petzocial/src/excel-files-processed';
const API_URL = 'http://localhost:3000/api/vets';  // Cambia esto


function moveExcelFile(filePath: string) {
  console.log("voy a mover");
  const fileName = path.basename(filePath);
  const destinationPath = path.join(subfolderPath, fileName);
  fs.renameSync(filePath, destinationPath);
  console.log(`Archivo movido: ${fileName}`);
}

async function loadData(){
  console.log("Estoy aca... ");
  try{
    const data: any = JSON.parse(fs.readFileSync('upload/vets/mass-load-vets.json', 'utf-8'));
    console.log(data);
    for (const item of data) {
      await uploadItem(item);
    }
    console.log('Carga masiva completada.');
  }catch{
    console.log("error al cargar el archivo")
  }
  
}

async function uploadItem(item: any) {
  try {
    const response = await axios.post(API_URL, item, {
      headers: {
        'Authorization': "AUTH_TOKEN",
        'Content-Type': 'application/json'
      }
    });
    console.log(`Item cargado con éxito: ${response.data.id}`);
  } catch (error: any) {
    console.error('Error al cargar el item:', error.response ? error.response.data : error.message);
  }
}

function watchFolder() {
  const watcher = chokidar.watch(folderPath, {
    ignored: /(^|[/\\])\../, // Ignorar archivos ocultos
    persistent: true,
  });
  console.log(`Observando la carpeta: ${folderPath}`);

  watcher
    .on('add', async (filePath) => {
      if (path.extname(filePath) === '.xlsx') {
        await loadData();
        moveExcelFile(filePath);
      }
    })
    .on('error', (error) => {
      console.error(`Error en el observador: ${error}`);
    });
}

// Middleware para mostrar un mensaje de bienvenida
app.use((req: any, res: any, next: any) => {
  console.log('Petición recibida');
  next();
});

// Ruta de inicio
app.get('/', (req: any, res: any) => {
  res.send('¡Hola, bienvenido a tu aplicación Express!');
});

// Iniciar la observación cuando el servidor Express se inicia
app.listen(port, () => {
  console.log(`Servidor Express iniciado en http://localhost:${port}`);
  watchFolder(); // Iniciar la observación después de que el servidor esté en funcionamiento
});
