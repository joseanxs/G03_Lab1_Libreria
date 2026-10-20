import { Link } from '@tanstack/react-router';
import { Logo } from '@/assets/logo';
import { cn } from '@/lib/utils';
const dashboardImage = '/images/shadcn-admin.png';
import { UserAuthForm } from './components/user-auth-form';

export function SignIn2() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-120 sm:p-8'>
          <div className='mb-4 flex items-center justify-center'>
            <Logo className='me-2' />
            <h1 className='text-xl font-medium'>Sapientia Logos</h1>
          </div>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-2'>
          <div className='flex flex-col space-y-2 text-start'>
            <h2 className='text-lg font-semibold tracking-tight'>Iniciar Sesión</h2>
            <p className='text-sm text-muted-foreground'>
              Ingresa tu correo y contraseña para acceder a tu cuenta.{' '}
              <br className='max-sm:hidden' /> ¿No tienes una cuenta?{' '}
              <Link
                to='/sign-up'
                className='text-nowrap underline underline-offset-4 hover:text-primary'
              >
                Regístrate
              </Link>
            </p>
          </div>
          <UserAuthForm />
          <p className='px-8 text-center text-sm text-muted-foreground'>
            Al hacer clic en Iniciar Sesión, aceptas nuestros{' '}
            <a
              href='/terms'
              className='underline underline-offset-4 hover:text-primary'
            >
              Términos de Servicio
            </a>{' '}
            y{' '}
            <a
              href='/privacy'
              className='underline underline-offset-4 hover:text-primary'
            >
              Política de Privacidad
            </a>
            .
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-full overflow-hidden bg-muted max-lg:hidden',
          '[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none'
        )}
      >
        <img src={dashboardImage} width={1024} height={1151} alt='Sapientia Logos' />
        <img
          src={dashboardImage}
          className='hidden dark:block'
          width={1024}
          height={1138}
          alt='Sapientia Logos'
        />
      </div>
    </div>
  );
}
