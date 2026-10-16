const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tareas_app_db';

const tareaSchema = new mongoose.Schema(
  {
    texto: { type: String, required: true, trim: true }
  },
  { versionKey: false }
);
const Tarea = mongoose.model('Tarea', tareaSchema, 'tareas_app');

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8082');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.get('/api/tareas', async (req, res, next) => {
  try {
    const tareas = await Tarea.find().lean();
    res.json(tareas.map(({ _id, texto }) => ({ id: _id.toString(), texto })));
  } catch (error) {
    next(error);
  }
});

app.post('/api/tareas', async (req, res, next) => {
  const texto = req.body && req.body.texto;
  if (typeof texto !== 'string' || !texto.trim()) {
    return res.status(400).json({ mensaje: 'El campo texto es obligatorio' });
  }

  try {
    const tarea = await Tarea.create({ texto });
    res.status(201).json({ id: tarea._id.toString(), texto: tarea.texto });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tareas/limpiar', async (req, res, next) => {
  try {
    await Tarea.deleteMany({});
    res.json({ mensaje: 'Lista de tareas vaciada correctamente' });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tareas/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El ID de la tarea no es válido' });
  }

  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error('Error en la API:', error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const collections = await mongoose.connection.db
      .listCollections({ name: Tarea.collection.collectionName }, { nameOnly: true })
      .toArray();
    if (collections.length === 0) {
      await Tarea.createCollection();
    }
    console.log(`Conectado a MongoDB: ${mongoose.connection.name}.${Tarea.collection.collectionName}`);
    app.listen(PORT, () => console.log(`API REST corriendo en el puerto ${PORT}`));
  })
  .catch((error) => {
    console.error('No se pudo inicializar MongoDB:', error);
    process.exit(1);
  });
