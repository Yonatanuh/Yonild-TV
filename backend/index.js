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
// CONFIGURACIÓN DE CLOUDINARY (LA NUBE)
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const almacenamiento = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "yonild-tv/otros";
    let resType = "auto";

    if (file.fieldname === "logo") {
      folderName = "yonild-tv/logos";
      resType = "image";
    } else if (file.fieldname === "apk") {
      folderName = "yonild-tv/apks";
      resType = "raw"; // Importante para que el APK no se rompa
    }

    return {
      folder: folderName,
      resource_type: resType,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage: almacenamiento });

// ==========================================
// 1. EL MOLDE PROFESIONAL (GUARDIA DE SEGURIDAD)
// ==========================================
const apkSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    version: {
      type: String,
      required: [true, "La versión es obligatoria"],
      trim: true,
    },
    categoria: { type: String, default: "General", trim: true },
    peso: { type: String }, // Opcional, lo calcularemos si no viene
    archivoApk: { type: String }, // Aquí irá el Link de Cloudinary
    icono: { type: String }, // Aquí irá el Link del Logo
    descargas: { type: Number, default: 0 },
  },
  { timestamps: true },
);

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

// Ruta POST: Subir nueva app a la NUBE (Ruta corregida a /nueva)
app.post(
  "/api/apks/nueva",
  verificarToken,
  upload.fields([
    { name: "apk", maxCount: 1 }, // Nombres corregidos para coincidir con React
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const datos = req.body;

      // Extraemos los links directos de Cloudinary
      if (req.files && req.files["apk"]) {
        datos.archivoApk = req.files["apk"][0].path; // Guardamos la URL
        // Si no mandaste peso, calculamos cuánto pesa el APK
        if (!datos.peso) {
          datos.peso =
            (req.files["apk"][0].size / (1024 * 1024)).toFixed(2) + " MB";
        }
      }

      if (req.files && req.files["logo"]) {
        datos.icono = req.files["logo"][0].path; // Guardamos la URL
      }

      const nuevaApp = new Apk(datos);
      await nuevaApp.save();

      res.status(201).json({
        exito: true,
        mensaje: "¡App con logo guardada en Cloudinary correctamente!",
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
    const lista = await Apk.find();
    res.json(lista);
  } catch (error) {
    res.status(500).json([]);
  }
});

// Ruta PUT: Actualizar una app existente
app.put(
  "/api/apks/:id",
  verificarToken,
  upload.fields([
    { name: "apk", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const datosActualizados = req.body;

      if (req.files && req.files["apk"]) {
        datosActualizados.archivoApk = req.files["apk"][0].path;
      }

      if (req.files && req.files["logo"]) {
        datosActualizados.icono = req.files["logo"][0].path;
      }

      await Apk.findByIdAndUpdate(req.params.id, datosActualizados);
      res.json({ exito: true, mensaje: "¡Aplicación actualizada con éxito!" });
    } catch (error) {
      res.status(400).json({ exito: false, mensaje: "Error al actualizar" });
    }
  },
);

// Ruta DELETE y PATCH quedan igual
app.delete("/api/apks/:id", verificarToken, async (req, res) => {
  try {
    await Apk.findByIdAndDelete(req.params.id);
    res.json({ exito: true, mensaje: "Eliminado de la base de datos" });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: "Error al eliminar" });
  }
});

app.patch("/api/apks/:id/descarga", async (req, res) => {
  try {
    const appActualizada = await Apk.findByIdAndUpdate(
      req.params.id,
      { $inc: { descargas: 1 } },
      { new: true },
    );
    res.json({ exito: true, descargasTotales: appActualizada.descargas });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: "Error al contar" });
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

app.listen(puerto, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${puerto}`);
});
