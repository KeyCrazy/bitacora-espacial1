import { useState, useEffect } from 'react'
import NoticiaCard from './components/NoticiaCard/NoticiaCard';
import './App.css'

const API_URL = import.meta.env.VITE_API_URL;

function App() {

  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [termino, setTermino] = useState("");

  function buscar(evento) {
    evento.preventDefault();
    const texto = new FormData(evento.currentTarget).get('q');
    setTermino(texto.trim());
  }

  useEffect(() => {
    const controller = new AbortController();

    async function cargarNoticias() {
      setCargando(true);
      setError(null);

      try {
        const parametros = new URLSearchParams({ limit: 12 });
        if (termino) {
          parametros.set('search', termino);
        }

        const respuesta = await fetch(`${API_URL}/articles/?${parametros}`, {
          signal: controller.signal,
        });

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} al pedir las noticias`);
        }

        const datos = await respuesta.json();
        setNoticias(datos.results);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    }

    cargarNoticias();

    return () => controller.abort();
  }, [termino]);

  return (
    <>
      <header className="contenedor cabecera">
        <p>Bitácora Espacial</p>
        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="#blogs">Blogs</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor">
        
        <h1>Noticias del espacio</h1>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input
            id="busqueda"
            name="q"
            type="search"
            placeholder="Ej.: Mars, Artemis, SpaceX"
          />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="titulo-noticias">
          <h2 id="titulo-noticias">Últimas noticias</h2>

          {cargando && <p role="status">Cargando noticias...</p>}

          {error && <p role="alert">No se pudieron cargar las noticias: {error}</p>}

          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}

          {!cargando && !error && noticias.length > 0 && (
            <div className="grid-noticias">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.title}
                  resumen={noticia.summary}
                  imagen={noticia.image_url}
                  fuente={noticia.news_site}
                  fecha={noticia.published_at}
                  enlace={noticia.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="contenedor">
        <p>Datos: Spaceflight News API</p>
      </footer>
    </>
  )
}

export default App