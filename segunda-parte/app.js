const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de sesión para identificar a cada usuario
app.use(session({
    secret: 'mi-clave-secreta',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // En producción con HTTPS sería true
}));

// Base de datos en memoria (Volátil: se borra si el servidor se reinicia)
// Estructura: { sessionId: [alumnos] }
const dbEnMemoria = {};

// Servir la página web
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener datos del usuario actual
app.get('/api/alumnos', (req, res) => {
    const id = req.sessionID;
    const misAlumnos = dbEnMemoria[id] || [];
    
    // Ordenar antes de enviar
    misAlumnos.sort((a, b) => {
        if (b.nota !== a.nota) return b.nota - a.nota;
        return a.nombre.localeCompare(b.nombre);
    });
    
    res.json(misAlumnos);
});

// Guardar nuevo alumno
app.post('/api/alumnos', (req, res) => {
    const id = req.sessionID;
    if (!dbEnMemoria[id]) dbEnMemoria[id] = [];
    
    dbEnMemoria[id].push(req.body);
    res.redirect('/'); // Recarga la página después de guardar
});

// Escuchar en todas las interfaces de red (0.0.0.0)
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Accesible desde otras IPs en el puerto ${PORT}`);
});