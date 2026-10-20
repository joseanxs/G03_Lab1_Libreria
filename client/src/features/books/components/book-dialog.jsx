import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export function BookDialog({ open, onOpenChange, onGuardar }) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [precio, setPrecio] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [errorValidacion, setErrorValidacion] = useState('');

  // Limpiar formulario al abrir
  useEffect(() => {
    if (open) {
      setTitulo('');
      setAutor('');
      setPrecio('');
      setDisponible(true);
      setErrorValidacion('');
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titulo.trim() || !autor.trim() || !precio) {
      setErrorValidacion('Por favor completa todos los campos requeridos.');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      setErrorValidacion('El precio debe ser un número positivo.');
      return;
    }

    onGuardar({
      titulo: titulo.trim(),
      autor: autor.trim(),
      precio: precioNum,
      disponible: Boolean(disponible),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Libro</DialogTitle>
          <DialogDescription>
            Completa los datos del libro para registrarlo en el inventario.
          </DialogDescription>
        </DialogHeader>

        {errorValidacion && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive font-medium">
            {errorValidacion}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título del Libro <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Ej: Cien Años de Soledad (o escribe 'error' para simular fallo)"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="autor">
              Autor <span className="text-destructive">*</span>
            </Label>
            <Input
              id="autor"
              placeholder="Ej: Gabriel García Márquez"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">
              Precio ($) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 24.99"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="disponible"
              checked={disponible}
              onCheckedChange={(checked) => setDisponible(Boolean(checked))}
            />
            <Label htmlFor="disponible" className="cursor-pointer font-normal text-sm">
              ¿Disponible para venta y préstamo inmediato?
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Guardar Libro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
