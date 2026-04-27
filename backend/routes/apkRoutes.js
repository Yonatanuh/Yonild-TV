const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Apk = require("../models/apk");

// 1. Configuración de las llaves maestras de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configuración del "Túnel" de envío (Storage)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "yonild-tv/otros";
    let resType = "auto";

    // Si es el logo, lo mandamos a la carpeta de imágenes
    if (file.fieldname === "logo") {
      folderName = "yonild-tv/logos";
      resType = "image";
    }
    // Si es el APK, lo mandamos como archivo "raw" (crudo) para que no se dañe
    else if (file.fieldname === "apk") {
      folderName = "yonild-tv/apks";
      resType = "raw";
    }

    return {
      folder: folderName,
      resource_type: resType,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

// 3. El motor de subida
const upload = multer({ storage: storage });

// Ruta POST: Ahora recibe el Logo y el APK simultáneamente
router.post(
  "/nueva",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "apk", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Extraemos las direcciones (URLs) que Cloudinary nos generó
      const logoUrl = req.files["logo"] ? req.files["logo"][0].path : "";
      const apkUrl = req.files["apk"] ? req.files["apk"][0].path : "";

      // Calculamos el peso del APK automáticamente si no lo enviamos
      const pesoCalculado = req.files["apk"]
        ? (req.files["apk"][0].size / (1024 * 1024)).toFixed(2) + " MB"
        : req.body.peso;

      // Creamos el objeto combinando los textos del formulario con los links de la nube
      const datosFinales = {
        ...req.body,
        logo: logoUrl,
        enlace: apkUrl, // Enlace indestructible de Cloudinary
        peso: pesoCalculado,
      };

      const nuevaApp = new Apk(datosFinales);
      const appGuardada = await nuevaApp.save();

      res.status(201).json({
        exito: true,
        mensaje: "¡Aplicación guardada en la nube para siempre!",
        datos: appGuardada,
      });
    } catch (error) {
      res.status(400).json({
        exito: false,
        mensaje: "Error al subir archivos a Cloudinary",
        error: error.message,
      });
    }
  },
);

module.exports = router;
