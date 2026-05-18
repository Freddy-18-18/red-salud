import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserAvatar, getInitials } from '../user-avatar';

describe('getInitials', () => {
  it('returns first letters of first and last name', () => {
    expect(getInitials('Juan Perez')).toBe('JP');
  });

  it('returns single letter when only one name', () => {
    expect(getInitials('Juan')).toBe('J');
  });

  it('handles three+ words by taking first two', () => {
    expect(getInitials('Maria Jose Lopez')).toBe('MJ');
  });

  it('returns "P" placeholder when name is undefined or empty', () => {
    expect(getInitials(undefined)).toBe('P');
    expect(getInitials('')).toBe('P');
    expect(getInitials('   ')).toBe('P');
  });

  it('uppercases lowercase names', () => {
    expect(getInitials('juan perez')).toBe('JP');
  });
});

describe('UserAvatar', () => {
  it('renders initials when no avatarUrl is provided', () => {
    render(<UserAvatar name="Juan Perez" />);
    expect(screen.getByText('JP')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('renders an img with the provided url and accessible alt', () => {
    render(
      <UserAvatar name="Juan Perez" avatarUrl="https://example.com/p.png" />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/p.png');
    expect(img).toHaveAttribute('alt', 'Foto de perfil de Juan Perez');
  });

  it('falls back to initials when image fails to load', () => {
    render(
      <UserAvatar name="Juan Perez" avatarUrl="https://broken.example/p.png" />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByText('JP')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('uses no-referrer policy on the image (avoids Google 403 bugs)', () => {
    render(
      <UserAvatar name="Juan Perez" avatarUrl="https://lh3.googleusercontent.com/x" />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('referrerpolicy', 'no-referrer');
  });

  it('uses the placeholder alt when name is missing', () => {
    render(<UserAvatar avatarUrl="https://example.com/p.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Foto de perfil');
  });
});
