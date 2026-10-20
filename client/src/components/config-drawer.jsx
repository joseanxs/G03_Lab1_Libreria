import { Root as Radio, Item } from '@radix-ui/react-radio-group';
import { CircleCheck, RotateCcw, Settings } from 'lucide-react';
import {
  IconDir,
  IconLayoutCompact,
  IconLayoutDefault,
  IconLayoutFull,
  IconSidebarFloating,
  IconSidebarInset,
  IconSidebarSidebar,
  IconThemeDark,
  IconThemeLight,
  IconThemeSystem,
} from '@/assets/icons';
import { cn } from '@/lib/utils';
import { useDirection } from '@/context/direction-provider';
import { useLayout } from '@/context/layout-provider';
import { useTheme } from '@/context/theme-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSidebar } from './ui/sidebar';

export function ConfigDrawer() {
  const { setOpen } = useSidebar();
  const { resetDir } = useDirection();
  const { resetTheme } = useTheme();
  const { resetLayout } = useLayout();

  const handleReset = () => {
    setOpen(true);
    resetDir();
    resetTheme();
    resetLayout();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Configuración de tema"
          className="rounded-full"
          title="Configuración de apariencia"
        >
          <Settings aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0 text-start">
          <SheetTitle>Configuración de Apariencia</SheetTitle>
          <SheetDescription>
            Personaliza el tema, barra lateral y diseño de la interfaz.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <DirConfig />
        </div>
        <SheetFooter className="gap-2">
          <Button
            variant="destructive"
            onClick={handleReset}
            aria-label="Restablecer valores por defecto"
          >
            Restablecer Valores
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="size-4 rounded-full"
          onClick={onReset}
          aria-label={resetAriaLabel}
        >
          <RotateCcw className="size-3" />
        </Button>
      )}
    </div>
  );
}

function RadioGroupItem({ item, isTheme = false }) {
  return (
    <Item
      value={item.value}
      className={cn(
        'group outline-none',
        'transition duration-200 ease-in'
      )}
      aria-label={`Seleccionar ${item.label.toLowerCase()}`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-white',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 text-xs">
        {item.label}
      </div>
    </Item>
  );
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme();
  return (
    <div>
      <SectionTitle
        title="Tema"
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
        resetAriaLabel="Restablecer tema por defecto"
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          {
            value: 'system',
            label: 'Sistema',
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: 'Claro',
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: 'Oscuro',
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
    </div>
  );
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout();
  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Barra Lateral"
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel="Restablecer barra lateral"
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          {
            value: 'inset',
            label: 'Integrada',
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: 'Flotante',
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: 'Fija',
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  );
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar();
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout();
  const radioState = open ? 'default' : collapsible;

  return (
    <div className="max-md:hidden">
      <SectionTitle
        title="Diseño"
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true);
          setCollapsible(defaultCollapsible);
        }}
        resetAriaLabel="Restablecer diseño"
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true);
            return;
          }
          setOpen(false);
          setCollapsible(v);
        }}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          {
            value: 'default',
            label: 'Estándar',
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: 'Compacto',
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: 'Completo',
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  );
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection();
  return (
    <div>
      <SectionTitle
        title="Dirección de Lectura"
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
        resetAriaLabel="Restablecer dirección de texto"
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className="grid w-full max-w-md grid-cols-3 gap-4"
      >
        {[
          {
            value: 'ltr',
            label: 'Izquierda a Derecha',
            icon: (props) => <IconDir dir="ltr" {...props} />,
          },
          {
            value: 'rtl',
            label: 'Derecha a Izquierda',
            icon: (props) => <IconDir dir="rtl" {...props} />,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  );
}
