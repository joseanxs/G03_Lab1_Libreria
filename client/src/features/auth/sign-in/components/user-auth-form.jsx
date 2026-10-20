import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, LogIn, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { sleep, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/password-input';

const formSchema = z.object({
  email: z.string().email('Por favor ingresa un correo válido.'),
  password: z.string().min(1, 'Por favor ingresa tu contraseña.'),
});

export function UserAuthForm({ className, redirectTo, ...props }) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuthStore();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'admin@espe.edu.ec',
      password: 'admin',
    },
  });

  function onSubmit(data) {
    setIsLoading(true);

    // Validación estricta de credenciales
    if (
      data.email.trim().toLowerCase() !== 'admin@espe.edu.ec' ||
      data.password !== 'admin'
    ) {
      setTimeout(() => {
        setIsLoading(false);
        toast.error(
          'Credenciales incorrectas. El correo debe ser admin@espe.edu.ec y la contraseña admin.'
        );
      }, 500);
      return;
    }

    toast.promise(sleep(1000), {
      loading: 'Iniciando sesión...',
      success: () => {
        setIsLoading(false);
        const mockUser = {
          accountNo: 'ACC001',
          email: data.email,
          role: ['admin'],
          exp: Date.now() + 24 * 60 * 60 * 1000,
        };
        auth.setUser(mockUser);
        auth.setAccessToken('mock-access-token');
        const targetPath = redirectTo || '/';
        navigate({ to: targetPath, replace: true });
        return `¡Bienvenido de nuevo, ${data.email}!`;
      },
      error: 'Error al iniciar sesión',
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <Input placeholder='admin@espe.edu.ec' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='admin' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </FormItem>
          )}
        />

        <div className='rounded-md border border-primary/20 bg-primary/5 p-2.5 text-xs text-muted-foreground flex items-center gap-2'>
          <KeyRound className='size-4 text-primary shrink-0' />
          <span>
            Acceso: <strong>admin@espe.edu.ec</strong> | Clave: <strong>admin</strong>
          </span>
        </div>

        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Iniciar Sesión
        </Button>
      </form>
    </Form>
  );
}
