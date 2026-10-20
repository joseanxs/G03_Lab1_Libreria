import { useNavigate, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { ConfirmDialog } from '@/components/confirm-dialog';

export function SignOutDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuthStore();

  const handleSignOut = () => {
    auth.reset();
    const currentPath = location.href;
    navigate({
      to: '/sign-in',
      search: { redirect: currentPath },
      replace: true,
    });
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cerrar Sesión"
      desc="¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a autenticarte para acceder al sistema."
      confirmText="Cerrar Sesión"
      cancelBtnText="Cancelar"
      destructive
      handleConfirm={handleSignOut}
      className="sm:max-w-sm"
    />
  );
}
