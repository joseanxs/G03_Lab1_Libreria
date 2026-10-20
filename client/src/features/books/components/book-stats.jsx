import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DollarSign, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export function BookStats({ libros = [] }) {
  const total = libros.length;

  const disponibles = libros.filter(
    (l) => l.disponible === true || l.disponible === 'true'
  ).length;

  const agotados = total - disponibles;

  const preciosValidos = libros
    .map((l) => (typeof l.precio === 'number' ? l.precio : parseFloat(l.precio)))
    .filter((p) => !isNaN(p));

  const valorTotal = preciosValidos.reduce((acc, curr) => acc + curr, 0);
  const promedio = preciosValidos.length > 0 ? valorTotal / preciosValidos.length : 0;

  const autoresUnicos = new Set(
    libros.map((l) => String(l.autor || '').trim()).filter(Boolean)
  ).size;

  const porcentajeDisponibles = total > 0 ? Math.round((disponibles / total) * 100) : 0;
  const porcentajeAgotados = total > 0 ? Math.round((agotados / total) * 100) : 0;

  // Datos para el gráfico de barras por libro
  const chartData = useMemo(() => {
    if (!libros || libros.length === 0) return [];
    const items = libros.slice(0, 10);

    return items.map((libro) => {
      const precioNum =
        typeof libro.precio === 'number'
          ? libro.precio
          : parseFloat(libro.precio) || 0;

      const rawTitle = String(libro.titulo || 'Sin título');
      const shortName = rawTitle.length > 9 ? rawTitle.slice(0, 8) + '…' : rawTitle;

      return {
        name: shortName,
        tituloCompleto: rawTitle,
        autor: libro.autor || 'Desconocido',
        precio: precioNum,
      };
    });
  }, [libros]);

  // Libros recientes (últimos 5)
  const recentBooks = libros.slice(0, 5);

  const getInitials = (titulo) => {
    if (!titulo) return 'LB';
    const words = String(titulo).trim().split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return words[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. LAS 4 TARJETAS KPI SUPERIORES                          */}
      {/* ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tarjeta 1: Valor del Inventario */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor del Inventario
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${valorTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${promedio.toFixed(2)} promedio por ejemplar
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Títulos Registrados */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Títulos Registrados
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              +{total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {autoresUnicos} autor(es) distintos en catálogo
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Disponibles en Stock */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponibles en Stock
            </CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{disponibles}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeDisponibles}% listo para venta o préstamo
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 4: Agotados / Préstamos */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Agotados / En Préstamo
            </CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              +{agotados}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {porcentajeAgotados}% requiere reposición
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 2. GRÁFICO OVERVIEW Y LISTA DE MOVIMIENTOS RECIENTES     */}
      {/* ========================================================= */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gráfico de barras (col-span 4) */}
        <Card className="lg:col-span-4 border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Distribución de precios</CardTitle>
            <CardDescription>
              Distribución de precios por libro registrado en inventario.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {chartData.length > 0 ? (
              <div className="h-[350px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-card p-2.5 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">{item.tituloCompleto}</p>
                              <p className="text-muted-foreground">Autor: {item.autor}</p>
                              <p className="font-bold text-primary">Precio: ${item.precio.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="precio"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground text-sm">
                <p>No hay libros registrados en el inventario para graficar.</p>
                <span className="text-xs text-muted-foreground/70 mt-1">
                  Agrega libros en la pestaña Inventario para visualizar sus valores aquí.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de libros recientes (col-span 3) */}
        <Card className="lg:col-span-3 border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Libros Recientes</CardTitle>
            <CardDescription>
              {libros.length} títulos registrados en el catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentBooks.length > 0 ? (
              <div className="space-y-6 pt-2">
                {recentBooks.map((libro) => {
                  const isDisp = libro.disponible === true || libro.disponible === 'true';
                  const precioNum =
                    typeof libro.precio === 'number'
                      ? libro.precio
                      : parseFloat(libro.precio) || 0;

                  return (
                    <div key={libro.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="size-9">
                          <AvatarFallback className="font-semibold text-xs bg-muted text-foreground">
                            {getInitials(libro.titulo)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium leading-none text-foreground">
                            {libro.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {libro.autor} •{' '}
                            <span className={isDisp ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
                              {isDisp ? 'En stock' : 'Agotado'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="font-semibold text-sm text-foreground">
                        +${precioNum.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No hay libros registrados en el catálogo recientemente.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
