import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const folders = [
  'public/productos',
  'public/mujer',
  'public/hombre',
  'public/kids',
  'public/accesorios'
];

folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Carpeta creada: ${folder}`);
  } else {
    console.log(`📁 Ya existe: ${folder}`);
  }
});

console.log('✨ Todas las carpetas listas');