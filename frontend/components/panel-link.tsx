'use client';

import { type AnchorHTMLAttributes, type ReactNode, useMemo } from 'react';
import { panelPath } from '@/lib/paths';

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

/** Anchor that preserves stealth UUID prefix (full navigation, static-export safe). */
export function PanelLink({ href, children, className = '', onClick, ...rest }: Props) {
  const target = useMemo(() => panelPath(href), [href]);

  return (
    <a
      href={target}
      className={className}
      onClick={(e) => {
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
