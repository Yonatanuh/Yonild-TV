const express = require("express");
const router = express.Router();
const Apk = require("../models/apk"); // Traemos a nuestro guardia de seguridad

// Ruta POST: Sirve exclusivamente para RECIBIR datos y guardarlos
router.post("/nueva", async (req, res) => {
  try {
    // 1. Recibimos los datos de la app (título, versión, etc.)
    const nuevaApp = new Apk(req.body);

    // 2. El guardia (Modelo) revisa que todo esté en orden y lo guarda en MongoDB
    const appGuardada = await nuevaApp.save();

    // 3. Respondemos con el código HTTP 201 (Que profesionalmente significa: "Creado con éxito")
    res.status(201).json({
      exito: true,
      mensaje: "¡Aplicación subida a Xupertv con éxito!",
      datos: appGuardada,
    });
  } catch (error) {
    // Si falta un dato obligatorio o hay un intento de hackeo, el guardia lo rechaza y cae aquí
    res.status(400).json({
      exito: false,
      mensaje: "Error al procesar los datos de la aplicación",
      error: error.message,
    });
  }
});

module.exports = router;
