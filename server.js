const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
fs.ensureDirSync(UPLOAD_FOLDER);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.sendFile(__dirname + '/views/download.html'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/views/admin.html'));

app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/admin');
});

app.get('/files', (req, res) => {
  fs.readdir(UPLOAD_FOLDER, (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler arquivos' });
    res.json(files);
  });
});

app.get('/delete/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_FOLDER, req.params.filename);
  fs.remove(filePath)
    .then(() => res.redirect('/admin'))
    .catch(() => res.status(500).send('Erro ao deletar arquivo'));
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

// Add posterior

app.get('/fileinfo', (req, res) => {
  fs.readdir(UPLOAD_FOLDER, async (err, files) => {
    if (err) return res.status(500).json({ error: 'Erro ao ler arquivos' });

    const infos = await Promise.all(files.map(async (filename) => {
      const stats = await fs.stat(path.join(UPLOAD_FOLDER, filename));
      return {
        name: filename,
        size: stats.size,
        modified: stats.mtime
      };
    }));

    res.json(infos);
  });
});
