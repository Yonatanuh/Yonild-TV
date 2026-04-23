import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// 👇 VARIABLE MAESTRA AGREGADA 👇
const API_URL = "https://yonild-tv-cuper.onrender.com";

// ==========================================
// COMPONENTE DE MONETIZACIÓN
// ==========================================
function BloqueAnuncio({ formato, etiqueta }) {
  return (
    <div className={`bloque-anuncio ${formato}`}>
      <div className="etiqueta-ad">PUBLICIDAD {etiqueta}</div>
      <span className="texto-anuncio">Espacio Reservado ({formato})</span>
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
            <a
              href={`${API_URL}/uploads/${app.archivoApk}`}
              download
              className="boton-descarga vibrar"
              onClick={finalizarDescarga}
            >
              ✅ DESCARGAR {app.nombre} ✅
            </a>
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

  const registrarDescarga = async (id) => {
    try {
      await fetch(`${API_URL}/api/apks/${id}/descarga`, {
        method: "PATCH",
      });
      obtenerApps();
    } catch (error) {
      console.error("Error al registrar la descarga:", error);
    }
  };

  const categoriasUnicas = [
    "Todas",
    ...new Set(apps.map((app) => app.categoria)),
  ];

  const appsFiltradas = apps.filter((app) => {
    const coincideTexto = app.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());
    const coincideCategoria =
      categoriaActiva === "Todas" || app.categoria === categoriaActiva;
    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="contenedor-principal">
      <header className="cabecera-pro">
        <div className="titulos">
          <h1>XUPERTV</h1>
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
                <img
                  src={`${API_URL}/uploads/${app.icono}`}
                  alt="Logo"
                  className="logo-app"
                />
                <div className="info-app">
                  <h3>{app.nombre}</h3>
                  <p className="detalles">
                    v{app.version} • {app.categoria} • 📥 {app.descargas || 0}{" "}
                    descargas
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
            <p>Intenta buscar con otro nombre o revisa otras categorías.</p>
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
// 2. EL PANEL SECRETO (INTACTO CON JWT Y FORMULARIOS)
// ==========================================
function PanelAdmin() {
  const [nombre, setNombre] = useState("");
  const [version, setVersion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [peso, setPeso] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [logo, setLogo] = useState(null);
  const [apps, setApps] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);

  const obtenerApps = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/apks`);
      setApps(await respuesta.json());
    } catch (error) {
      console.error("Error al cargar inventario:", error);
    }
  };

  useEffect(() => {
    obtenerApps();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("nombre", nombre);
    fd.append("version", version);
    fd.append("categoria", categoria);
    fd.append("peso", peso);
    if (archivo) fd.append("archivo", archivo);
    if (logo) fd.append("logo", logo);

    const url = modoEdicion
      ? `${API_URL}/api/apks/${idEdicion}`
      : `${API_URL}/api/apks`;
    const metodo = modoEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: metodo,
        body: fd,
        headers: {
          autorizacion: sessionStorage.getItem("token_vip"),
        },
      });

      const datos = await res.json();

      if (res.ok) {
        alert(modoEdicion ? "✅ ¡Aplicación modificada!" : "✅ ¡App guardada!");
        cancelarEdicion();
        obtenerApps();
      } else {
        alert("❌ Error: " + datos.mensaje);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const prepararEdicion = (app) => {
    setNombre(app.nombre || "");
    setVersion(app.version || "");
    setCategoria(app.categoria || "");
    setPeso(app.peso || "");
    setModoEdicion(true);
    setIdEdicion(app._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setNombre("");
    setVersion("");
    setCategoria("");
    setPeso("");
    setArchivo(null);
    setLogo(null);
    setModoEdicion(false);
    setIdEdicion(null);
    document.getElementById("form-admin").reset();
  };

  const eliminarApk = async (id) => {
    if (!window.confirm("¿Seguro que quieres borrar esta app?")) return;
    try {
      const res = await fetch(`${API_URL}/api/apks/${id}`, {
        method: "DELETE",
        headers: {
          autorizacion: sessionStorage.getItem("token_vip"),
        },
      });

      if (res.ok) {
        obtenerApps();
      } else {
        const datos = await res.json();
        alert("❌ Error: " + datos.mensaje);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem("llave_maestra");
    sessionStorage.removeItem("token_vip");
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
          <h2>🛠️ Bóveda Xupertv</h2>
          <button
            onClick={cerrarSesion}
            style={{
              background: "#e53e3e",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🚪 Salir sin dejar rastro
          </button>
        </div>

        <form id="form-admin" onSubmit={guardar} className="formulario">
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
            placeholder="Peso"
            onChange={(e) => setPeso(e.target.value)}
            required
          />

          <label>
            📁 Archivo APK:{" "}
            {modoEdicion ? (
              <span> (Déjalo vacío para conservar actual)</span>
            ) : null}
          </label>
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
            required={!modoEdicion}
          />

          <label>
            🖼️ Icono de la App:{" "}
            {modoEdicion ? (
              <span> (Déjalo vacío para conservar actual)</span>
            ) : null}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            required={!modoEdicion}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: modoEdicion ? "#48bb78" : "#2b6cb0",
              }}
            >
              <span>
                {modoEdicion ? "Actualizar Aplicación" : "Publicar Aplicación"}
              </span>
            </button>
            {modoEdicion ? (
              <button
                type="button"
                onClick={cancelarEdicion}
                style={{ flex: 1, backgroundColor: "#a0aec0" }}
              >
                <span>Cancelar Edición</span>
              </button>
            ) : null}
          </div>
        </form>
        <h3 style={{ marginTop: "30px", borderBottom: "2px solid #cbd5e0" }}>
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
                background: "white",
                padding: "10px",
                marginBottom: "5px",
                borderRadius: "4px",
                color: "black",
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
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Modificar
                </button>
                <button
                  onClick={() => eliminarApk(app._id)}
                  style={{
                    background: "#e53e3e",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Eliminar
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
// 3. EL GUARDIÁN FANTASMA (COMPLETO CON ESTILOS)
// ==========================================
function GuardianFantasma() {
  const [autorizado, setAutorizado] = useState(
    sessionStorage.getItem("llave_maestra") === "autorizado",
  );
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const intentarLogin = async (e) => {
    e.preventDefault();
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
        setErrorMsg("Acceso denegado");
        setPassword("");
      }
    } catch (error) {
      setErrorMsg("Error de conexión al servidor");
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
      <form
        onSubmit={intentarLogin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <p
          style={{
            color: "#718096",
            textAlign: "center",
            margin: 0,
            fontFamily: "monospace",
          }}
        >
          Autenticación requerida
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=":"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: "2px solid #4a5568",
            color: "white",
            outline: "none",
            textAlign: "center",
            fontSize: "24px",
            padding: "10px",
          }}
          autoFocus
        />
        {errorMsg && (
          <span
            style={{ color: "#fc8181", fontSize: "14px", textAlign: "center" }}
          >
            {errorMsg}
          </span>
        )}
        <button type="submit" style={{ display: "none" }}>
          Entrar
        </button>
      </form>
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
