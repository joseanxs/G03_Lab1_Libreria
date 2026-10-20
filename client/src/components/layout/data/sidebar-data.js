import { BookOpen } from 'lucide-react';

export const sidebarData = {
  user: {
    name: 'Administrador',
    email: 'admin@espe.edu.ec',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Sapientia Logos',
      logo: BookOpen,
      plan: 'Sistema de Inventario',
    },
  ],
  navGroups: [
    {
      title: 'Inventario',
      items: [
        {
          title: 'Catálogo de Libros',
          url: '/',
          icon: BookOpen,
        },
      ],
    },
  ],
};
