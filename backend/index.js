require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const jwt = require("jsonwebtoken");

const CLAVE_JWT = process.env.CLAVE_JWT || "xuper_firma_secreta_2026";
const app = express();
app.use(express.json());
app.use(cors());

const puerto = process.env.PORT || 10000;
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("🟢 ¡Conectado a MongoDB Atlas!"))
  .catch((error) => console.error("🔴 Error de conexión:", error));

// ==========================================
// CONFIGURACIÓN DE CLOUDINARY (SOLO PARA LOGOS)
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const almacenamiento = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "yonild-tv/logos",
    resource_type: "image", // Solo subiremos imágenes (logos)
    public_id: (req, file) =>
      `${Date.now()}-${file.originalname.split(".")[0]}`,
  },
});

const upload = multer({ storage: almacenamiento });

// ==========================================
// 1. EL MOLDE PROFESIONAL (ESQUEMA ACTUALIZADO)
// ==========================================
const apkSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    version: { type: String, required: true },
    categoria: { type: String, default: "General" },
    peso: { type: String, required: true }, // Se escribe a mano, ej: "25 MB"
    enlaceDescarga: { type: String, required: true }, // 👈 El link externo (MediaFire, etc.)
    icono: { type: String }, // URL del logo en Cloudinary
    descargas: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// IMPORTANTE: Inicializamos el modelo Apk para poder usarlo en las rutas
const Apk = mongoose.model("Apk", apkSchema);

// ==========================================
// 2. EL CADENERO DE SEGURIDAD (Middleware)
// ==========================================
const verificarToken = (req, res, next) => {
  const token = req.headers["autorizacion"];
  if (!token) {
    return res
      .status(403)
      .json({ exito: false, mensaje: "Alto ahí: No tienes el pase VIP" });
  }
  jwt.verify(token, CLAVE_JWT, (error, decodificado) => {
    if (error) {
      return res
        .status(401)
        .json({ exito: false, mensaje: "Pase VIP falso o expirado" });
    }
    next();
  });
};

// ==========================================
// 3. RUTAS DE LA API
// ==========================================
app.get("/", (req, res) => {
  res.send(
    "🚀 El motor de Yonild-TV está encendido y volando. ¡Todo bien, jefe!",
  );
});

// Ruta POST: Publicar nueva app (Ahora solo sube el LOGO a la nube)
app.post(
  "/api/apks/nueva",
  verificarToken,
  upload.single("logo"), // Solo esperamos un archivo: el logo
  async (req, res) => {
    try {
      const datos = req.body;

      // Si el usuario subió un logo, guardamos la URL de Cloudinary
      if (req.file) {
        datos.icono = req.file.path;
      }

      const nuevaApp = new Apk(datos);
      await nuevaApp.save();

      res.status(201).json({
        exito: true,
        mensaje:
          "¡App publicada con éxito! El logo está en la nube y el link guardado.",
      });
    } catch (error) {
      res.status(400).json({
        exito: false,
        mensaje: "Error al guardar la aplicación",
        error: error.message,
      });
    }
  },
);

// Ruta GET: Pedir la lista de apps
app.get("/api/apks", async (req, res) => {
  try {
    const lista = await Apk.find().sort({ createdAt: -1 });
    res.json(lista);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Ruta PUT: Actualizar una app existente
app.put(
  "/api/apks/:id",
  verificarToken,
  upload.single("logo"),
  async (req, res) => {
    try {
      const datosActualizados = req.body;

      if (req.file) {
        datosActualizados.icono = req.file.path;
      }

      await Apk.findByIdAndUpdate(req.params.id, datosActualizados);
      res.json({ exito: true, mensaje: "¡Aplicación actualizada con éxito!" });
    } catch (error) {
      res.status(400).json({ exito: false, mensaje: "Error al actualizar" });
    }
  },
);

// Ruta DELETE
app.delete("/api/apks/:id", verificarToken, async (req, res) => {
  try {
    await Apk.findByIdAndDelete(req.params.id);
    res.json({ exito: true, mensaje: "Eliminado de la base de datos" });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: "Error al eliminar" });
  }
});

// Ruta PATCH: Sumar descarga
app.patch("/api/apks/:id/descarga", async (req, res) => {
  try {
    const appActualizada = await Apk.findByIdAndUpdate(
      req.params.id,
      { $inc: { descargas: 1 } },
      { new: true },
    );
    res.json({ exito: true, descargasTotales: appActualizada.descargas });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: "Error al contar descarga" });
  }
});

// ==========================================
// 4. RUTA DE SEGURIDAD (Login)
// ==========================================
app.post("/api/login", (req, res) => {
  const contrasenaSecreta = process.env.PASS_ADMIN;

  if (req.body.password === contrasenaSecreta) {
    const token = jwt.sign({ rol: "administrador" }, CLAVE_JWT, {
      expiresIn: "2h",
    });
    res.json({ exito: true, mensaje: "Bienvenido jefe", token: token });
  } else {
    res.status(401).json({ exito: false, mensaje: "Intruso detectado" });
  }
});

// ==========================================
// 🚨 ATRAPADOR DE ERRORES GLOBAL
// ==========================================
app.use((err, req, res, next) => {
  console.error("🚨 ERROR FATAL REVELADO:", err);
  res.status(500).json({
    exito: false,
    mensaje: "Error interno del servidor",
    detalle: err.message || "Error desconocido",
  });
});

app.listen(puerto, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${puerto}`);
});
