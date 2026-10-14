const express = require('express'); 
const app = express(); 
const PORT = 5000; 
 
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


let tareas = [
  { id: 1, texto: "Aprender conceptos básicos de Docker" }, 
  { id: 2, texto: "Desplegar mi primer arquitectura de Microservicios" } 
]; 
 

app.get('/api/tareas', (req, res) => { 
  res.json(tareas); 
}); 
 

app.post('/api/tareas', (req, res) => { 
  const nuevaTarea = { id: Date.now(), texto: req.body.texto }; 
  tareas.push(nuevaTarea);
   res.status(201).json(nuevaTarea); 
}); 


app.delete('/api/tareas/limpiar', (req, res) => {
  tareas = [];
  res.json({ mensaje: "Lista de tareas vaciada correctamente" });
});
 

app.delete('/api/tareas/:id', (req, res) => { 
  const idEliminar = parseInt(req.params.id); 
  tareas = tareas.filter(t => t.id !== idEliminar); 
  res.json({ mensaje: "Tarea eliminada correctamente" }); 
}); 
 
app.listen(PORT, () => console.log(`API REST corriendo en el puerto ${PORT}`)); 