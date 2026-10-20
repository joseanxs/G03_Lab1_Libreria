import { useNavigate, useRouter } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function GeneralError({ className, minimal = false }) {
  const navigate = useNavigate();
  const { history } = useRouter();

  return (
    <div className={cn('h-svh w-full', className)}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && (
          <h1 className="text-[7rem] leading-tight font-bold">500</h1>
        )}
        <span className="font-medium text-lg">¡Ups! Ocurrió un error en el servidor</span>
        <p className="text-center text-muted-foreground text-sm">
          Pedimos disculpas por las molestias. <br /> Por favor intenta nuevamente más tarde.
        </p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => history.go(-1)}>
              Regresar
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Ir al Inicio</Button>
          </div>
        )}
      </div>
    </div>
  );
}
