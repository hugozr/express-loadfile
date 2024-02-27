//Ejecutar ts-node index.ts    
import express from 'express';

import * as fs from 'fs';
import * as path from 'path';
import * as chokidar from 'chokidar';

const app = express();
const port = 3005;

const folderPath = 'C:/ehzr/16.Petso/02.app/payload-petzocial/src/excel-files';
const subfolderPath = 'C:/ehzr/16.Petso/02.app/payload-petzocial/src/excel-files/processed';

function moveExcelFile(filePath: string) {
  const fileName = path.basename(filePath);
  const destinationPath = path.join(subfolderPath, fileName);

  fs.renameSync(filePath, destinationPath);

  console.log(`Archivo movido: ${fileName}`);
}

function watchFolder() {
  const watcher = chokidar.watch(folderPath, {
    ignored: /(^|[/\\])\../, // Ignorar archivos ocultos
    persistent: true,
  });

  console.log(`Observando la carpeta: ${folderPath}`);

  watcher
    .on('add', (filePath) => {
      if (path.extname(filePath) === '.xlsx') {
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
