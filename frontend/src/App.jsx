import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// 🚩 DIRECCIÓN LOCAL (Úsala para probar en tu PC)
const API_URL = "https://yonild-tv-xuper.onrender.com";

/// ==========================================
// COMPONENTE DE MONETIZACIÓN REAL (ADSTERRA)
// ==========================================
function BloqueAnuncio({ formato, etiqueta }) {
  const adRef = useRef(null);

  useEffect(() => {
    // Si el componente ya tiene el anuncio cargado, no hacemos nada
    if (adRef.current && adRef.current.children.length === 0) {
      const scriptConf = document.createElement("script");
      const scriptInvoke = document.createElement("script");

      if (formato === "banner-horizontal") {
        // CONFIGURACIÓN PARA EL BANNER 320x50
        scriptConf.innerHTML = `
          atOptions = {
            'key' : '48029dbee5d70c578a7e75dafae3412b',
            'format' : 'iframe',
            'height' : 50,
            'width' : 320,
            'params' : {}
          };
        `;
        scriptInvoke.src =
          "https://www.highperformanceformat.com/48029dbee5d70c578a7e75dafae3412b/invoke.js";
      } else if (formato === "cuadrado-footer") {
        // AQUÍ VA TU KEY DE 300x250 CUANDO LA TENGAS
        // Por ahora lo dejamos preparado para tu próxima clave
        scriptConf.innerHTML = `
          atOptions = {
            'key' : 'TU_NUEVA_KEY_CUADRADA_AQUÍ',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        `;
        scriptInvoke.src =
          "https://www.highperformanceformat.com/TU_NUEVA_KEY_CUADRADA_AQUÍ/invoke.js";
      }

      adRef.current.appendChild(scriptConf);
      adRef.current.appendChild(scriptInvoke);
    }
  }, [formato]);

  return (
    <div
      className={`bloque-anuncio ${formato} flex flex-col items-center my-4`}
    >
      <div className="etiqueta-ad text-[10px] bg-gray-800 text-gray-400 px-2 py-1 rounded-t-md">
        PUBLICIDAD {etiqueta}
      </div>
      {/* Contenedor donde se inyectará el anuncio real */}
      <div
        ref={adRef}
        className="bg-gray-900/50 rounded-b-md overflow-hidden flex justify-center items-center"
        style={{
          width: formato === "banner-horizontal" ? "320px" : "300px",
          height: formato === "banner-horizontal" ? "50px" : "250px",
          border: "1px dashed #333",
        }}
      >
        {/* Si no hay anuncios cargando, mostramos un mensaje sutil */}
        <span className="text-[10px] text-gray-700">Cargando anuncio...</span>
      </div>
    </div>
  );
}

// ==========================================
// LA MÁQUINA DE DINERO TRIPLE (3 PASOS DE 10 SEG)
// ==========================================
function PantallaEspera({ app, cerrar, registrarDescarga }) {
  const [segundos, setSegundos] = useState(10);
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    if (segundos > 0) {
      const temporizador = setTimeout(() => setSegundos(segundos - 1), 1000);
      return () => clearTimeout(temporizador);
    } else {
      if (paso < 3) {
        setTimeout(() => {
          setPaso(paso + 1);
          setSegundos(10);
        }, 500);
      }
    }
  }, [segundos, paso]);

  const finalizarDescarga = () => {
    registrarDescarga(app._id);
    window.open(app.enlaceDescarga, "_blank");
    cerrar();
  };

  return (
    <div className="overlay-oscuro">
      <div className="ventana-espera">
        <div className="indicador-pasos">
          <span className={paso >= 1 ? "paso-activo" : ""}>Verificación 1</span>
          <span className={paso >= 2 ? "paso-activo" : ""}>Verificación 2</span>
          <span className={paso >= 3 ? "paso-activo" : ""}>Final</span>
        </div>

        <h2>
          {paso < 3 ? `Validando Enlace (Paso ${paso}/3)` : "¡Enlace listo!"}
        </h2>
        <p>Por favor espera, estamos verificando que el archivo sea seguro.</p>

        <BloqueAnuncio
          formato="banner-horizontal"
          etiqueta={`PASO ${paso} - A`}
        />

        <div className="zona-contador">
          {segundos > 0 ? (
            <>
              <p>Procesando paso {paso}...</p>
              <div className="numero-gigante">{segundos}</div>
            </>
          ) : paso < 3 ? (
            <div className="cargando-siguiente">
              Generando siguiente paso...
            </div>
          ) : (
            <button
              className="boton-descarga vibrar"
              onClick={finalizarDescarga}
            >
              ✅ DESCARGAR {app.nombre} ✅
            </button>
          )}
        </div>

        <BloqueAnuncio
          formato="cuadrado-footer"
          etiqueta={`PASO ${paso} - B`}
        />
        <BloqueAnuncio
          formato="banner-horizontal"
          etiqueta={`PASO ${paso} - C`}
        />

        <button className="boton-cancelar" onClick={cerrar}>
          ❌ Cancelar descarga
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 1. LA TIENDA PÚBLICA
// ==========================================
function TiendaPublica() {
  const [apps, setApps] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [appEnDescarga, setAppEnDescarga] = useState(null);

  const obtenerApps = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/apks`);
      setApps(await respuesta.json());
    } catch (error) {
      console.error("Error al cargar tienda:", error);
    }
  };

  useEffect(() => {
    obtenerApps();
  }, []);

  // Inyección de Adsterra optimizada para React
  useEffect(() => {
    const scriptAdsterra = document.createElement("script");
    scriptAdsterra.src =
      "https://pl29319410.profitablecpmratenetwork.com/19/a5/b9/19a5b9384abd896b5c6513eeab1c2683.js";
    scriptAdsterra.async = true;
    document.body.appendChild(scriptAdsterra);
  }, []);

  const registrarDescarga = async (id) => {
    try {
      await fetch(`${API_URL}/api/apks/${id}/descarga`, { method: "PATCH" });
      obtenerApps();
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // 🧹 FILTRO INTELIGENTE ANTI-DUPLICADOS
  // ==========================================
  const normalizarCategoria = (texto) => {
    if (!texto) return "Otros";
    // Limpia espacios y pone todo en minúscula
    const limpio = texto.trim().toLowerCase();
    // Vuelve a poner solo la primera letra en mayúscula
    return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  };

  const categoriasUnicas = [
    "Todas",
    ...new Set(apps.map((app) => normalizarCategoria(app.categoria))),
  ];

  const appsFiltradas = apps.filter((app) => {
    // Escudos de seguridad por si alguna app no tiene nombre temporalmente
    const nombreSeguro = app.nombre ? app.nombre.toLowerCase() : "";
    const busquedaSegura = busqueda ? busqueda.toLowerCase() : "";
    const coincideTexto = nombreSeguro.includes(busquedaSegura);

    const coincideCategoria =
      categoriaActiva === "Todas" ||
      normalizarCategoria(app.categoria) === categoriaActiva;

    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="contenedor-principal">
      <header className="cabecera-pro">
        <div className="titulos">
          <h1>YonilD-Apks-TV</h1>
          <p>Descarga las mejores APKs de forma segura</p>
        </div>
        <div className="buscador-contenedor">
          <input
            type="text"
            placeholder="🔍 Buscar aplicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="barra-busqueda"
          />
        </div>
      </header>

      <BloqueAnuncio formato="banner-horizontal" etiqueta="TIENDA TOP" />

      <nav className="filtros-categoria">
        {categoriasUnicas.map((cat) => (
          <button
            key={cat}
            className={`btn-filtro ${categoriaActiva === cat ? "activo" : ""}`}
            onClick={() => setCategoriaActiva(cat)}
          >
            {cat}
          </button>
        ))}
      </nav>

      <main className="lista-apps">
        {appsFiltradas.length > 0 ? (
          appsFiltradas.map((app) => (
            <div key={app._id} className="tarjeta-app">
              <div className="bloque-izquierdo">
                <img src={app.icono} alt="Logo" className="logo-app" />
                <div className="info-app">
                  <h3>{app.nombre}</h3>
                  <p className="detalles">
                    {/* 👇 Aquí también aplicamos el filtro para que se vea premium */}
                    v{app.version} • {normalizarCategoria(app.categoria)} • 📥{" "}
                    {app.descargas || 0} descargas
                  </p>
                </div>
              </div>
              <div className="accion-app">
                <span className="peso">{app.peso}</span>
                <button
                  className="boton-descarga"
                  onClick={() => setAppEnDescarga(app)}
                >
                  ⬇ Descargar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-resultados">
            <h2>😅 No encontramos esa aplicación</h2>
          </div>
        )}
      </main>

      <BloqueAnuncio formato="cuadrado-footer" etiqueta="TIENDA BOTTOM" />

      {appEnDescarga && (
        <PantallaEspera
          app={appEnDescarga}
          cerrar={() => setAppEnDescarga(null)}
          registrarDescarga={registrarDescarga}
        />
      )}
    </div>
  );
}
// ==========================================
// 2. EL PANEL SECRETO (ADMINISTRADOR)
// ==========================================
function PanelAdmin() {
  const [nombre, setNombre] = useState("");
  const [version, setVersion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [peso, setPeso] = useState("");
  const [enlaceDescarga, setEnlaceDescarga] = useState("");
  const [logo, setLogo] = useState(null);
  const [apps, setApps] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const obtenerApps = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/apks`);
      setApps(await respuesta.json());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    obtenerApps();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    setSubiendo(true);

    const fd = new FormData();
    fd.append("nombre", nombre);
    fd.append("version", version);
    fd.append("categoria", categoria);
    fd.append("peso", peso);
    fd.append("enlaceDescarga", enlaceDescarga);
    if (logo) fd.append("logo", logo);

    const url = modoEdicion
      ? `${API_URL}/api/apks/${idEdicion}`
      : `${API_URL}/api/apks/nueva`;
    const metodo = modoEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        body: fd,
        headers: { autorizacion: sessionStorage.getItem("token_vip") },
      });

      const datos = await res.json();
      if (res.ok) {
        alert(modoEdicion ? "✅ ¡Modificada!" : "✅ ¡App guardada!");
        cancelarEdicion();
        obtenerApps();
      } else {
        alert("❌ Error: " + datos.mensaje);
      }
    } catch (error) {
      alert("Hubo un error de conexión con el servidor.");
    } finally {
      setSubiendo(false);
    }
  };

  const prepararEdicion = (app) => {
    setNombre(app.nombre);
    setVersion(app.version);
    setCategoria(app.categoria);
    setPeso(app.peso);
    setEnlaceDescarga(app.enlaceDescarga);
    setModoEdicion(true);
    setIdEdicion(app._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setNombre("");
    setVersion("");
    setCategoria("");
    setPeso("");
    setEnlaceDescarga("");
    setLogo(null);
    setModoEdicion(false);
    setIdEdicion(null);
    document.getElementById("form-admin").reset();
  };

  const eliminarApk = async (id) => {
    if (!window.confirm("¿Borrar app?")) return;
    await fetch(`${API_URL}/api/apks/${id}`, {
      method: "DELETE",
      headers: { autorizacion: sessionStorage.getItem("token_vip") },
    });
    obtenerApps();
  };

  const cerrarSesion = () => {
    sessionStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="contenedor-principal">
      <div className="panel-admin" style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>🛠️ Bóveda YonilD-APKS</h2>
          <button
            onClick={cerrarSesion}
            style={{
              background: "#e53e3e",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🚪 Salir
          </button>
        </div>

        <form
          id="form-admin"
          onSubmit={guardar}
          className="formulario"
          encType="multipart/form-data"
        >
          <input
            type="text"
            value={nombre}
            placeholder="Nombre"
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="text"
            value={version}
            placeholder="Versión"
            onChange={(e) => setVersion(e.target.value)}
            required
          />
          <input
            type="text"
            value={categoria}
            placeholder="Categoría"
            onChange={(e) => setCategoria(e.target.value)}
            required
          />
          <input
            type="text"
            value={peso}
            placeholder="Peso (ej: 45 MB)"
            onChange={(e) => setPeso(e.target.value)}
            required
          />

          <label style={{ color: "var(--text-h)" }}>
            🔗 Enlace de Descarga:
          </label>
          <input
            type="url"
            value={enlaceDescarga}
            placeholder="https://www.mediafire.com..."
            onChange={(e) => setEnlaceDescarga(e.target.value)}
            required
          />

          <label style={{ color: "var(--text-h)" }}>🖼️ Icono de la App:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            required={!modoEdicion}
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              type="submit"
              disabled={subiendo}
              style={{
                flex: 1,
                backgroundColor: modoEdicion ? "#48bb78" : "#2b6cb0",
                opacity: subiendo ? 0.7 : 1,
              }}
            >
              <span>
                {subiendo
                  ? "☁️ Procesando..."
                  : modoEdicion
                    ? "Actualizar"
                    : "Publicar"}
              </span>
            </button>
            {modoEdicion && (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{ flex: 1, backgroundColor: "#a0aec0" }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <h3
          style={{
            marginTop: "40px",
            borderBottom: "2px solid var(--border)",
            color: "var(--text-h)",
          }}
        >
          Inventario Actual
        </h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {apps.map((app) => (
            <li
              key={app._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-card)",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                color: "var(--text-h)",
              }}
            >
              <span>
                <strong>{app.nombre}</strong> (v{app.version})
              </span>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => prepararEdicion(app)}
                  style={{
                    background: "#3182ce",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => eliminarApk(app._id)}
                  style={{
                    background: "#e53e3e",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                  }}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ==========================================
// 3. EL GUARDIÁN FANTASMA (ANTI-REINICIOS)
// ==========================================
function GuardianFantasma() {
  const [autorizado, setAutorizado] = useState(
    sessionStorage.getItem("llave_maestra") === "autorizado",
  );
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const hacerLogin = async () => {
    if (!password) return;
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const datos = await res.json();

      if (datos.exito) {
        sessionStorage.setItem("llave_maestra", "autorizado");
        sessionStorage.setItem("token_vip", datos.token);
        setAutorizado(true);
      } else {
        setErrorMsg("❌ Contraseña incorrecta");
        setPassword("");
      }
    } catch (error) {
      setErrorMsg("❌ Backend local apagado o desconectado");
    }
  };

  const atraparEnter = (e) => {
    if (e.key === "Enter") {
      hacerLogin();
    }
  };

  if (autorizado) return <PanelAdmin />;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#1a202c",
      }}
    >
      {/* 🚩 ADIÓS ETIQUETA FORM. AHORA ES UN SIMPLE DIV */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          width: "300px",
          background: "#2d3748",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ color: "white", textAlign: "center", margin: 0 }}>
          Bóveda Secreta de YonilD-Apks
        </h2>
        <p
          style={{
            color: "#a0aec0",
            textAlign: "center",
            fontSize: "0.9rem",
            marginTop: 0,
          }}
        >
          Ingresa la llave maestra
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={atraparEnter}
          placeholder="Contraseña..."
          style={{
            background: "#1a202c",
            border: "1px solid #4a5568",
            color: "white",
            outline: "none",
            textAlign: "center",
            fontSize: "18px",
            padding: "12px",
            borderRadius: "6px",
          }}
          autoFocus
        />

        {errorMsg && (
          <p
            style={{
              color: "#fc8181",
              textAlign: "center",
              margin: 0,
              fontWeight: "bold",
            }}
          >
            {errorMsg}
          </p>
        )}

        <button
          onClick={hacerLogin}
          style={{
            background: "#3182ce",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "0.2s",
          }}
        >
          🚪 Entrar
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. EL ENRUTADOR PRINCIPAL
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TiendaPublica />} />
        <Route path="/xuper-secreto" element={<GuardianFantasma />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
