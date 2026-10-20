import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Filter,
  X,
  Plus,
  RotateCw,
  Library,
  AlertOctagon,
  Loader2,
  BookX,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export function BookTable({
  data = [],
  estado = 'datos',
  mensajeError = '',
  onEliminar,
  onToggleDisponible,
  onOpenDialog,
  onSimularCarga,
  onSimularVacio,
  onSimularDatos,
  onSimularError,
  onCargarEjemplos,
}) {
  // Filtros de búsqueda y disponibilidad
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isConfirmVaciarOpen, setIsConfirmVaciarOpen] = useState(false); // 'todos' | 'disponible' | 'no_disponible'

  // Selección de filas
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Paginación
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrado de datos
  const filteredData = useMemo(() => {
    return data.filter((libro) => {
      const matchSearch =
        String(libro.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(libro.autor || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isDisp = libro.disponible === true || libro.disponible === 'true';

      if (statusFilter === 'disponible') return matchSearch && isDisp;
      if (statusFilter === 'no_disponible') return matchSearch && !isDisp;
      return matchSearch;
    });
  }, [data, searchTerm, statusFilter]);

  // Cálculo de páginas
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage, pageSize]);

  // Selección
  const allCurrentSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(item.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allCurrentSelected) {
      paginatedData.forEach((item) => next.delete(item.id));
    } else {
      paginatedData.forEach((item) => next.add(item.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Formato seguro de precio
  const formatPrecio = (precio) => {
    if (typeof precio === 'number') return `$${precio.toFixed(2)}`;
    const num = parseFloat(precio);
    if (!isNaN(num)) return `$${num.toFixed(2)}`;
    return String(precio);
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* BARRA DE HERRAMIENTAS: SIMULADOR DE ESTADOS Y BOTÓN CREAR */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border bg-background/50 p-1 text-xs">
          <span className="px-2 font-medium text-muted-foreground">Probar estados:</span>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onSimularCarga}
            title="Simular recarga con delay de 1.5s"
          >
            <RotateCw className="size-3 mr-1" />
            Carga
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onSimularVacio}
            title="Vaciar inventario y datos"
          >
            <Trash2 className="size-3 mr-1" />
            Vacío
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onSimularDatos}
            title="Cargar datos"
          >
            <Library className="size-3 mr-1" />
            Con Datos
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onSimularError}
            title="Simular estado de error"
          >
            <AlertOctagon className="size-3 mr-1" />
            Error
          </Button>
        </div>

        <Button onClick={onOpenDialog} className="gap-2">
          <Plus className="size-4" />
          Agregar Libro
        </Button>
      </div>

      {/* ========================================================= */}
      {/* ESTADO 1: CARGA (1.5s retardo con setTimeout)             */}
      {/* ========================================================= */}
      {estado === 'cargando' && (
        <Card className="flex flex-col items-center justify-center p-16 text-center shadow-sm">
          <Loader2 className="size-10 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-semibold text-foreground">
            Cargando inventario de libros...
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Obteniendo el catálogo de la librería (simulación con retardo de 1.5s mediante setTimeout).
          </p>
        </Card>
      )}

      {/* ========================================================= */}
      {/* ESTADO 2: VACÍO (Sin libros registrados)                  */}
      {/* ========================================================= */}
      {estado === 'vacio' && (
        <Card className="flex flex-col items-center justify-center p-16 text-center shadow-sm">
          <div className="rounded-full bg-muted p-4 mb-4">
            <BookX className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            El inventario está vacío
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            Aún no hay ningún libro registrado en el catálogo. Puedes agregar uno nuevo o cargar datos de prueba.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onOpenDialog} className="gap-2">
              <Plus className="size-4" />
              Agregar primer libro
            </Button>
            <Button variant="outline" onClick={onCargarEjemplos} className="gap-2">
              <Sparkles className="size-4" />
              Cargar ejemplos
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* ESTADO 3: ERROR (Simulación de fallo del sistema)          */}
      {/* ========================================================= */}
      {estado === 'error' && (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-destructive/30 bg-destructive/5 shadow-sm">
          <div className="rounded-full bg-destructive/10 p-4 mb-4 text-destructive">
            <AlertTriangle className="size-10" />
          </div>
          <h3 className="text-xl font-semibold text-destructive">
            Ocurrió un error en el sistema
          </h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {mensajeError || 'No fue posible completar la operación en el inventario.'}
          </p>
          <Button
            variant="default"
            onClick={onSimularCarga}
            className="mt-6 gap-2 bg-destructive hover:bg-destructive/90 text-white"
          >
            <RotateCcw className="size-4" />
            Reintentar carga
          </Button>
        </Card>
      )}

      {/* ========================================================= */}
      {/* ESTADO 4: CON DATOS (Tabla con búsqueda, filtro y paginación) */}
      {/* ========================================================= */}
      {estado === 'datos' && (
        <Card className="overflow-hidden border shadow-sm flex flex-col gap-0">
          {/* Barra de búsqueda y filtro */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-card">
            <div className="flex flex-1 flex-wrap items-center gap-2 max-w-lg">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Filtrar libros por título o autor..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-8 h-9 text-sm"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Select
                  value={statusFilter}
                  onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 px-3 text-xs gap-1.5 border-dashed">
                    <Filter className="size-3 text-muted-foreground" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="disponible">✓ Disponibles</SelectItem>
                    <SelectItem value="no_disponible">✕ No disponibles</SelectItem>
                  </SelectContent>
                </Select>

                {statusFilter !== 'todos' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter('todos')}
                    className="h-8 px-2 text-xs text-muted-foreground"
                  >
                    Restablecer
                  </Button>
                )}
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
                <strong>{selectedIds.size}</strong> fila(s) seleccionadas
              </div>
            )}
          </div>

          {/* Tabla centralizada */}
          <div className="relative w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[48px] text-center">
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={allCurrentSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Seleccionar todos los libros"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="text-center w-[70px]">ID</TableHead>
                  <TableHead className="text-center">Título</TableHead>
                  <TableHead className="text-center">Autor</TableHead>
                  <TableHead className="text-center">Precio</TableHead>
                  <TableHead className="text-center">Disponibilidad</TableHead>
                  <TableHead className="text-center w-[120px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((libro) => {
                    const isSelected = selectedIds.has(libro.id);
                    const isDisp = libro.disponible === true || libro.disponible === 'true';

                    return (
                      <TableRow
                        key={libro.id}
                        data-state={isSelected ? 'selected' : undefined}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="text-center">
                          <div className="flex justify-center items-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelectRow(libro.id)}
                              aria-label={`Seleccionar libro ${libro.titulo}`}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          #{libro.id}
                        </TableCell>

                        <TableCell className="text-center font-semibold text-foreground">
                          {libro.titulo}
                        </TableCell>

                        <TableCell className="text-center text-muted-foreground">
                          {libro.autor}
                        </TableCell>

                        <TableCell className="text-center font-medium text-foreground">
                          {formatPrecio(libro.precio)}
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => onToggleDisponible(libro.id)}
                              title="Alternar disponibilidad"
                              className="cursor-pointer transition-transform hover:scale-105"
                            >
                              {isDisp ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                                >
                                  ✓ Disponible
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  className="bg-destructive/15 text-destructive hover:bg-destructive/20 border-destructive/30 font-semibold"
                                >
                                  ✕ No disponible
                                </Badge>
                              )}
                            </button>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEliminar(libro.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5"
                              title="Eliminar libro"
                            >
                              <Trash2 className="size-4 mr-1 text-destructive" />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground">
                      No se encontraron libros que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Barra de paginación */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t bg-card text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={String(pageSize)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs">Filas por página</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs">
                Página <strong>{safePage}</strong> de <strong>{totalPages}</strong> ({filteredData.length} libros)
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={safePage <= 1}
                  title="Primera página"
                >
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="size-8 flex items-center justify-center rounded-md bg-foreground text-background font-semibold text-xs">
                  {safePage}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  title="Página siguiente"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safePage >= totalPages}
                  title="Última página"
                >
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
