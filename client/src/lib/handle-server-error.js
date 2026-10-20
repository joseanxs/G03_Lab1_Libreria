import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function handleServerError(error) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
  let errMsg = '¡Ocurrió un error inesperado!';
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = 'Sin contenido disponible.';
  }
  if (error instanceof AxiosError) {
    const title = error.response?.data?.title;
    if (typeof title === 'string' && title.length > 0) {
      errMsg = title;
    }
  }
  toast.error(errMsg);
}
