const mongoose = require("mongoose");

const apkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "El título es obligatorio"], // No permite guardar apps sin nombre
      trim: true, // Anti-hacker: Elimina espacios en blanco invisibles al inicio o final
      maxlength: [100, "El título es demasiado largo"], // Evita que saturen tu base de datos con textos infinitos
    },
    version: {
      type: String,
      required: [true, "La versión es obligatoria"],
      trim: true,
    },
    developer: {
      type: String,
      default: "Xupertv", // Si no envían nombre del creador, asume que eres tú automáticamente
      trim: true,
    },
    size: {
      type: Number, // Obliga a que el peso sea un número (ej. 45.5 MB), rechaza letras
      required: [true, "El peso de la app es obligatorio"],
    },
    downloadUrl: {
      type: String,
      required: [true, "El enlace de descarga es obligatorio"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "La imagen de portada es obligatoria"],
      trim: true,
    },
  },
  {
    timestamps: true,
    // ¡Seguridad Nivel Pro!: 'timestamps' crea automáticamente "createdAt" y "updatedAt".
    // Si alguien modifica algo, sabrás exactamente la fecha y hora en que lo hizo (Auditoría).
  },
);

// Exportamos el modelo para poder usarlo en otras partes de la app
module.exports = mongoose.model("Apk", apkSchema);
