require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const jwt = require("jsonwebtoken");
const CLAVE_JWT = process.env.CLAVE_JWT || "xuper_firma_secreta_2026";

const app = express();
app.use(express.json());

app.use(cors());

// Definimos el GPS exacto para la carpeta
const rutaUploads = path.join(__dirname, "uploads");
app.use("/uploads", express.static(rutaUploads));

const puerto = process.env.PORT || 10000;
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri)
  .then(() => console.log("🟢 ¡Conectado a MongoDB Atlas!"))
  .catch((error) => console.error("🔴 Error de conexión:", error));

// ==========================================
// CONFIGURACIÓN DE SUBIDA (JUSTO A TIEMPO)
// ==========================================
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    // 👇 EL TRUCO HACKER: Verificamos y creamos la carpeta en el instante exacto que llega el archivo
    if (!fs.existsSync(rutaUploads)) {
      fs.mkdirSync(rutaUploads, { recursive: true });
      console.log("📁 Carpeta 'uploads' creada JUSTO A TIEMPO.");
    }
    cb(null, rutaUploads);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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
    categoria: {
      type: String,
      default: "General",
      trim: true,
    },
    peso: {
      type: String,
      required: [true, "El peso es obligatorio"],
    },
    archivoApk: {
      type: String,
    },
    icono: {
      type: String,
    },
    descargas: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const Apk = mongoose.model("Apk", apkSchema);

// ==========================================
// 👇 2. EL CADENERO DE SEGURIDAD (Middleware) 👇
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

// Ruta POST: Subir nueva app
app.post(
  "/api/apks",
  verificarToken,
  upload.fields([
    { name: "archivo", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const datos = req.body;

      if (req.files["archivo"]) {
        datos.archivoApk = req.files["archivo"][0].filename;
      }

      if (req.files["logo"]) {
        datos.icono = req.files["logo"][0].filename;
      }

      const nuevaApp = new Apk(datos);
      await nuevaApp.save();
      res.status(201).json({
        exito: true,
        mensaje: "¡App con logo guardada correctamente en la nube!",
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
    { name: "archivo", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const datosActualizados = req.body;

      if (req.files && req.files["archivo"]) {
        datosActualizados.archivoApk = req.files["archivo"][0].filename;
      }

      if (req.files && req.files["logo"]) {
        datosActualizados.icono = req.files["logo"][0].filename;
      }

      await Apk.findByIdAndUpdate(req.params.id, datosActualizados);
      res.json({ exito: true, mensaje: "¡Aplicación actualizada con éxito!" });
    } catch (error) {
      res
        .status(400)
        .json({ exito: false, mensaje: "Error al actualizar la aplicación" });
    }
  },
);

// Ruta DELETE: Borrar una app
app.delete("/api/apks/:id", verificarToken, async (req, res) => {
  try {
    await Apk.findByIdAndDelete(req.params.id);
    res.json({ exito: true, mensaje: "Eliminado de la base de datos" });
  } catch (error) {
    res.status(400).json({ exito: false, mensaje: "Error al eliminar" });
  }
});

// Ruta PATCH: Sumar una descarga
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
  const contrasenaSecreta = "xuper2026";

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
