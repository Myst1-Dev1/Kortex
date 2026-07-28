import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => {
      return html.replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '');
    },
  },
}));

vi.mock('nookies', () => ({
  parseCookies: () => ({ user: JSON.stringify({ id: 'u1', name: 'Test', email: 'a@b.com' }) }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

import { ProjectData } from '@/components/sections/ProjectContent/projectData';

describe('DOMPurify sanitization em ProjectData', () => {
  it('sanitiza script tags na descrição', () => {
    const data = {
      data: {
        id: 'p1',
        name: 'Projeto',
        description: 'Text<script>alert("xss")</script> seguro',
        author_id: 'outra-pessoa',
        participants: [],
      },
    };

    render(<ProjectData data={data} />);
    const el = screen.getByText(/Text.*seguro/);
    expect(el.innerHTML).not.toContain('<script>');
  });

  it('sanitiza event handlers na descrição', () => {
    const data = {
      data: {
        id: 'p1',
        name: 'Projeto',
        description: '<img src=x onerror="alert(1)">',
        author_id: 'outra-pessoa',
        participants: [],
      },
    };

    render(<ProjectData data={data} />);
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('onerror');
  });

  it('renderiza descrição segura normalmente', () => {
    const data = {
      data: {
        id: 'p1',
        name: 'Projeto',
        description: 'Descrição normal e segura',
        author_id: 'outra-pessoa',
        participants: [],
      },
    };

    render(<ProjectData data={data} />);
    expect(screen.getByText('Projeto')).toBeInTheDocument();
    expect(screen.getByText('Descrição normal e segura')).toBeInTheDocument();
  });
});
