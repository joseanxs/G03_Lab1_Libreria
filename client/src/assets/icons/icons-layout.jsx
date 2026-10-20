import { cn } from '@/lib/utils';

export function IconDir({ dir, className, ...props }) {
  return (
    <svg data-name={`icon-dir-${dir}`} xmlns='http://www.w3.org/2000/svg' viewBox='0 0 79.86 51.14' className={cn(dir === 'rtl' && 'rotate-y-180', className)} {...props}>
      <path d='M23.42.51h51.92c2.21 0 4 1.79 4 4v42.18c0 2.21-1.79 4-4 4H23.42s-.04-.02-.04-.04V.55s.02-.04.04-.04z' opacity={0.15} />
      <path fill='none' opacity={0.72} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='2px' d='M5.56 14.88L17.78 14.88' />
      <path fill='none' opacity={0.48} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='2px' d='M5.56 22.09L16.08 22.09' />
      <path fill='none' opacity={0.55} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='2px' d='M5.56 18.38L14.93 18.38' />
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <circle cx={7.51} cy={7.4} r={2.54} opacity={0.8} />
        <path fill='none' opacity={0.8} strokeWidth='2px' d='M12.06 6.14L17.78 6.14' />
        <path fill='none' opacity={0.6} d='M11.85 8.79L16.91 8.79' />
      </g>
      <path fill='none' opacity={0.62} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='3px' d='M29.41 7.4L34.67 7.4' />
      <rect x={28.76} y={11.21} width={26.03} height={2.73} rx={0.64} ry={0.64} opacity={0.44} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={28.76} y={17.01} width={44.25} height={13.48} rx={0.64} ry={0.64} opacity={0.3} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={28.76} y={33.57} width={44.25} height={4.67} rx={0.64} ry={0.64} opacity={0.21} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={28.76} y={41.32} width={36.21} height={4.67} rx={0.64} ry={0.64} opacity={0.3} strokeLinecap='round' strokeMiterlimit={10} />
    </svg>
  );
}

export function IconLayoutCompact(props) {
  return (
    <svg data-name='icon-layout-compact' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 79.86 51.14' {...props}>
      <rect x={5.84} y={5.2} width={4} height={40} rx={2} ry={2} strokeLinecap='round' strokeMiterlimit={10} />
      <g stroke='#fff' strokeLinecap='round' strokeMiterlimit={10}>
        <path fill='none' opacity={0.66} strokeWidth='2px' d='M7.26 11.56L8.37 11.56' />
        <path fill='none' opacity={0.51} strokeWidth='2px' d='M7.26 14.49L8.37 14.49' />
        <path fill='none' opacity={0.52} strokeWidth='2px' d='M7.26 17.39L8.37 17.39' />
        <circle cx={7.81} cy={7.25} r={1.16} fill='#fff' opacity={0.8} />
      </g>
      <path fill='none' opacity={0.75} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='3px' d='M15.81 14.49L22.89 14.49' />
      <rect x={14.93} y={18.39} width={22.19} height={2.73} rx={0.64} ry={0.64} opacity={0.5} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={14.93} y={5.89} width={59.16} height={2.73} rx={0.64} ry={0.64} opacity={0.9} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={14.93} y={24.22} width={32.68} height={19.95} rx={2.11} ry={2.11} opacity={0.4} strokeLinecap='round' strokeMiterlimit={10} />
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <rect x={59.05} y={38.15} width={2.01} height={3.42} rx={0.33} ry={0.33} opacity={0.32} />
        <rect x={54.78} y={34.99} width={2.01} height={6.58} rx={0.33} ry={0.33} opacity={0.44} />
        <rect x={63.17} y={32.86} width={2.01} height={8.7} rx={0.33} ry={0.33} opacity={0.53} />
        <rect x={67.54} y={29.17} width={2.01} height={12.4} rx={0.33} ry={0.33} opacity={0.66} />
      </g>
      <g opacity={0.5}>
        <circle cx={62.16} cy={18.63} r={7.5} />
        <path d='M62.16 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z' />
      </g>
      <g opacity={0.74}>
        <path d='M63.04 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z' />
        <path d='M66.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z' />
      </g>
    </svg>
  );
}

export function IconLayoutDefault(props) {
  return (
    <svg data-name='con-layout-default' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 79.86 51.14' {...props}>
      <path d='M39.22 15.99h-8.16c-.79 0-1.43-.67-1.43-1.5s.64-1.5 1.43-1.5h8.16c.79 0 1.43.67 1.43 1.5s-.64 1.5-1.43 1.5z' opacity={0.75} />
      <rect x={29.63} y={18.39} width={16.72} height={2.73} rx={1.36} ry={1.36} opacity={0.5} />
      <path d='M75.1 6.68v1.45c0 .63-.49 1.14-1.09 1.14H30.72c-.6 0-1.09-.51-1.09-1.14V6.68c0-.62.49-1.14 1.09-1.14h43.29c.6 0 1.09.52 1.09 1.14z' opacity={0.9} />
      <rect x={29.63} y={24.22} width={21.8} height={19.95} rx={2.11} ry={2.11} opacity={0.4} />
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <rect x={61.06} y={38.15} width={2.01} height={3.42} rx={0.33} ry={0.33} opacity={0.32} />
        <rect x={56.78} y={34.99} width={2.01} height={6.58} rx={0.33} ry={0.33} opacity={0.44} />
        <rect x={65.17} y={32.86} width={2.01} height={8.7} rx={0.33} ry={0.33} opacity={0.53} />
        <rect x={69.55} y={29.17} width={2.01} height={12.4} rx={0.33} ry={0.33} opacity={0.66} />
      </g>
      <g opacity={0.5}>
        <circle cx={63.17} cy={18.63} r={7.5} />
        <path d='M63.17 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z' />
      </g>
      <g opacity={0.74}>
        <path d='M64.05 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z' />
        <path d='M67.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z' />
      </g>
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <rect x={5.84} y={5.02} width={19.14} height={40} rx={2} ry={2} opacity={0.8} />
        <g stroke='#fff'>
          <path fill='none' opacity={0.72} strokeWidth='2px' d='M9.02 17.39L21.25 17.39' />
          <path fill='none' opacity={0.48} strokeWidth='2px' d='M9.02 24.6L19.54 24.6' />
          <path fill='none' opacity={0.55} strokeWidth='2px' d='M9.02 20.88L18.4 20.88' />
          <circle cx={10.98} cy={9.91} r={2.54} fill='#fff' opacity={0.8} />
          <path fill='none' opacity={0.8} strokeWidth='2px' d='M15.53 8.65L21.25 8.65' />
          <path fill='none' opacity={0.6} d='M15.32 11.3L20.38 11.3' />
        </g>
      </g>
    </svg>
  );
}

export function IconLayoutFull(props) {
  return (
    <svg data-name='icon-layout-full' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 79.86 51.14' {...props}>
      <path fill='none' opacity={0.75} strokeLinecap='round' strokeMiterlimit={10} strokeWidth='3px' d='M6.85 14.49L15.02 14.49' />
      <rect x={5.84} y={18.39} width={25.6} height={2.73} rx={0.64} ry={0.64} opacity={0.5} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={5.84} y={5.89} width={68.26} height={2.73} rx={0.64} ry={0.64} opacity={0.9} strokeLinecap='round' strokeMiterlimit={10} />
      <rect x={5.84} y={24.22} width={37.71} height={19.95} rx={2.11} ry={2.11} opacity={0.4} strokeLinecap='round' strokeMiterlimit={10} />
      <g strokeLinecap='round' strokeMiterlimit={10}>
        <rect x={59.05} y={38.15} width={2.01} height={3.42} rx={0.33} ry={0.33} opacity={0.32} />
        <rect x={54.78} y={34.99} width={2.01} height={6.58} rx={0.33} ry={0.33} opacity={0.44} />
        <rect x={63.17} y={32.86} width={2.01} height={8.7} rx={0.33} ry={0.33} opacity={0.53} />
        <rect x={67.54} y={29.17} width={2.01} height={12.4} rx={0.33} ry={0.33} opacity={0.66} />
      </g>
      <g opacity={0.5}>
        <circle cx={62.16} cy={18.63} r={7.5} />
        <path d='M62.16 11.63c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.14-7-7 3.14-7 7-7m0-1c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z' />
      </g>
      <g opacity={0.74}>
        <path d='M63.04 18.13l3.38-5.67c.93.64 1.7 1.48 2.26 2.47.56.98.89 2.08.96 3.21h-6.6z' />
        <path d='M66.57 13.19a6.977 6.977 0 012.52 4.44h-5.17l2.65-4.44m-.31-1.43l-4.1 6.87h8c0-1.39-.36-2.75-1.04-3.95a8.007 8.007 0 00-2.86-2.92z' />
      </g>
    </svg>
  );
}
