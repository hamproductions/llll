import { ark } from '@ark-ui/react/factory';
import { ReactNode } from 'react';
import { styled } from 'styled-system/jsx';
import { link } from 'styled-system/recipes';
import type { ComponentProps } from 'styled-system/types';

function _Link({ href, children, ...props }: { href: string; children: ReactNode }) {
  href = href.startsWith('/') ? normalize(import.meta.env.BASE_URL + href) : href;
  return (
    <ark.a href={href} {...props}>
      {children}
    </ark.a>
  );
}
function normalize(url: string) {
  return '/' + url.split('/').filter(Boolean).join('/');
}

export type LinkProps = ComponentProps<typeof Link>;
export const Link = styled(_Link, link);
