import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { ConfigDrawer } from '@/components/config-drawer';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

import { initialBooks } from './data/books';
import { BookStats } from './components/book-stats';
import { BookDialog } from './components/book-dialog';
import { BookTable } from './components/book-table';

const API_URL = '/api/books';

// Normaliza la entidad libro (backend inglés/español -> modelo frontend)
const normalizarLibro = (libro) => ({
  id: libro.id,
  titulo: libro.titulo || libro.title || libro.name || '',
  autor: libro.autor || libro.author || libro.Author || '',
  precio: Number(libro.precio ?? libro.price ?? 0),
  disponible:
    libro.disponible !== undefined
      ? Boolean(libro.disponible)
      : Boolean(libro.available),
});

// Prepara la entidad para enviar al backend (en inglés y español por compatibilidad)
const formatearParaBackend = (libro) => ({
  title: libro.titulo || libro.title,
  author: libro.autor || libro.author,
  price: Number(libro.precio ?? libro.price),
  available:
    libro.disponible !== undefined
      ? Boolean(libro.disponible)
      : Boolean(libro.available),
  titulo: libro.titulo || libro.title,
  autor: libro.autor || libro.author,
  precio: Number(libro.precio ?? libro.price),
  disponible:
    libro.disponible !== undefined
      ? Boolean(libro.disponible)
      : Boolean(libro.available),
});

export function Books() {
  const [libros, setLibros] = useState([]);
  // 4 Estados condicionales de la rúbrica: 'cargando' | 'vacio' | 'datos' | 'error'
  const [estado, setEstado] = useState('cargando');
  const [mensajeError, setMensajeError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // GET inicial: al montar el componente conecta con el backend Express
  // con fallback automático a los 20 libros locales de data/books.js si está apagado
  const cargarLibrosBackend = async () => {
    setEstado('cargando');
    setMensajeError('');

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setLibros(data.map(normalizarLibro));
        setEstado('datos');
      } else {
        setLibros([]);
        setEstado('vacio');
      }
    } catch (error) {
      console.warn('Backend Express no disponible o apagado:', error);
      setLibros([]);
      setEstado('error');
      setMensajeError(
        'Error 503: Servicio de inventario temporalmente no disponible.'
      );
    }
  };

  useEffect(() => {
    cargarLibrosBackend();
  }, []);

  // 1. Botón "Carga": recarga los datos reales del backend (data/books.json) mostrando el estado de carga
  const handleSimularCarga = async () => {
    setEstado('cargando');
    setMensajeError('');
    await new Promise((resolve) => setTimeout(resolve, 600));
    await cargarLibrosBackend();
  };

  // 2. Vaciar inventario en el estado local Y TAMBIÉN en data/books.json del backend
  const handleSimularVacio = async () => {
    const librosParaBorrar = [...libros];
    setLibros([]);
    setEstado('vacio');

    try {
      // 1. Intenta vaciado masivo directo DELETE /api/books
      const response = await fetch(API_URL, {
        method: 'DELETE',
      });
      if (response.ok) return;

      // 2. Fallback secuencial (para evitar colisiones de escritura asíncrona en el archivo JSON)
      let lista = librosParaBorrar.map((l) => l.id);
      if (lista.length === 0) {
        const getRes = await fetch(API_URL);
        if (getRes.ok) {
          const data = await getRes.json();
          if (Array.isArray(data)) lista = data.map((b) => b.id);
        }
      }

      for (const id of lista) {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      }
    } catch (error) {
      console.warn('Error al vaciar backend:', error);
    }
  };

  // 3. Botón "Con Datos": recarga los datos del backend (data/books.json)
  const handleSimularDatos = async () => {
    await cargarLibrosBackend();
  };

  // 4. Simular estado de error 503
  const handleSimularError = () => {
    setEstado('error');
    setMensajeError(
      'Error 503: Servicio de inventario temporalmente no disponible.'
    );
  };

  // POST: Guardar nuevo libro desde el modal
  const handleGuardarLibro = async (nuevoLibro) => {
    // Si el título es 'error', dispara el estado de error de la rúbrica
    if (nuevoLibro.titulo.trim().toLowerCase() === 'error') {
      setEstado('error');
      setMensajeError(
        "Error 500: Fallo en el servidor de inventario. Se ingresó el valor reservado 'error'."
      );
      return;
    }

    const payload = formatearParaBackend(nuevoLibro);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error en POST: ${response.status}`);
      }

      const creado = await response.json();
      const libroFinal = normalizarLibro(creado);
      setLibros((prev) => [libroFinal, ...prev]);
      setEstado('datos');
    } catch (error) {
      console.warn('Fallo en POST hacia el backend, guardando en estado local:', error);
      const nuevo = {
        id: libros.length > 0 ? Math.max(...libros.map((l) => Number(l.id) || 0)) + 1 : 1,
        ...nuevoLibro,
      };
      setLibros((prev) => [nuevo, ...prev]);
      setEstado('datos');
    }
  };

  // DELETE: Eliminar libro
  const handleEliminarLibro = async (id) => {
    // Actualización reactiva inmediata con coerción segura de tipos String(id)
    setLibros((prev) => {
      const filtrados = prev.filter((l) => String(l.id) !== String(id));
      if (filtrados.length === 0) {
        setEstado('vacio');
      }
      return filtrados;
    });

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(`Error en DELETE: ${response.status}`);
      }
    } catch (error) {
      console.warn('Fallo en DELETE hacia el backend (se mantiene cambio local):', error);
    }
  };

  // PUT: Alternar disponibilidad
  const handleToggleDisponible = async (id) => {
    const libroActual = libros.find((l) => String(l.id) === String(id));
    if (!libroActual) return;

    const actualDisp =
      libroActual.disponible === true || libroActual.disponible === 'true';
    const nuevoDisp = !actualDisp;

    // Actualización reactiva inmediata
    setLibros((prev) =>
      prev.map((l) => (String(l.id) === String(id) ? { ...l, disponible: nuevoDisp } : l))
    );

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          available: nuevoDisp,
          disponible: nuevoDisp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en PUT: ${response.status}`);
      }

      const actualizado = await response.json();
      setLibros((prev) =>
        prev.map((l) => (String(l.id) === String(id) ? normalizarLibro(actualizado) : l))
      );
    } catch (error) {
      console.warn('Fallo en PUT hacia el backend (se mantiene cambio local):', error);
    }
  };

  // Cargar datos de prueba (botón "Con Datos")
  const handleCargarEjemplos = () => {
    setLibros(initialBooks);
    setEstado('datos');
  };

  return (
    <>
      <Header fixed>
        <Search className="me-auto" placeholder="Buscar en la librería..." />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className="flex flex-1 flex-col gap-5">
        {/* ========================================================= */}
        {/* CABECERA PRINCIPAL: TÍTULO RENOMBRADO                     */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Sistema de Inventario</h2>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Librería Pequeña
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestión de catálogo para los artículos de la librería <strong>Sapientia Logos</strong>
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PESTAÑAS: [ Inventario ] [ Estadísticas ]                 */}
        {/* ========================================================= */}
        <Tabs defaultValue="inventario" className="space-y-4">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger value="inventario">Inventario</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          {/* ========================================================= */}
          {/* PESTAÑA 1: INVENTARIO (Tabla con sus 4 estados integrados) */}
          {/* ========================================================= */}
          <TabsContent value="inventario" className="space-y-4">
            <BookTable
              data={libros}
              estado={estado}
              mensajeError={mensajeError}
              onEliminar={handleEliminarLibro}
              onToggleDisponible={handleToggleDisponible}
              onOpenDialog={() => setIsDialogOpen(true)}
              onSimularCarga={handleSimularCarga}
              onSimularVacio={handleSimularVacio}
              onSimularDatos={handleSimularDatos}
              onSimularError={handleSimularError}
              onCargarEjemplos={handleSimularDatos}
            />
          </TabsContent>

          {/* ========================================================= */}
          {/* PESTAÑA 2: ESTADÍSTICAS (4 KPI + Overview + Recientes)     */}
          {/* ========================================================= */}
          <TabsContent value="estadisticas" className="space-y-4">
            <BookStats libros={libros} />
          </TabsContent>
        </Tabs>

        {/* Modal flotante para crear libro */}
        <BookDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onGuardar={handleGuardarLibro}
        />
      </Main>
    </>
  );
}

export default Books;
