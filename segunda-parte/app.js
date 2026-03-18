const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

// 1. Configuración de sesión (DEBE IR ANTES DE LAS RUTAS)
app.use(session({
    secret: 'clave-secreta-formosa',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 2. Middlewares para leer los datos del formulario
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos temporal
const dbEnMemoria = {};

// 3. RUTAS
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/alumnos', (req, res) => {
    const id = req.sessionID;
    const misAlumnos = dbEnMemoria[id] || [];
    
    misAlumnos.sort((a, b) => {
        if (Number(b.nota) !== Number(a.nota)) return Number(b.nota) - Number(a.nota);
        return a.nombre.localeCompare(b.nombre);
    });
    
    res.json(misAlumnos);
});

// Cambiamos la lógica del POST para que sea más robusta
app.post('/api/alumnos', (req, res) => {
    const id = req.sessionID;
    console.log("Recibido alumno de sesión:", id); // Esto saldrá en tu terminal de VS Code
    
    if (!dbEnMemoria[id]) dbEnMemoria[id] = [];
    
    // Verificamos que lleguen datos
    if (req.body.nombre) {
        dbEnMemoria[id].push({
            nombre: req.body.nombre,
            edad: req.body.edad,
            nota: req.body.nota
        });
    }
    
    res.redirect('/'); 
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Servidor corriendo en http://localhost:${PORT}`);
});