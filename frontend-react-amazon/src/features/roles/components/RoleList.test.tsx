import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleList } from './RoleList';

// Mock mutation hooks — we test UI behaviour, not API calls
vi.mock('../hooks/useCreateRole', () => ({
  useCreateRole: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useUpdateRole', () => ({
  useUpdateRole: () => ({ mutate: vi.fn(), isPending: false }),
}));
vi.mock('../hooks/useDeleteRole', () => ({
  useDeleteRole: () => ({ mutate: vi.fn(), isPending: false }),
}));

const roles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'customer' },
];

describe('RoleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
  });

  it('renders "+ New Role" button', () => {
    render(<RoleList roles={[]} />);
    expect(screen.getByRole('button', { name: /new role/i })).toBeInTheDocument();
  });

  it('renders empty state when roles array is empty', () => {
    render(<RoleList roles={[]} />);
    expect(screen.getByText(/no roles found/i)).toBeInTheDocument();
  });

  it('renders a row for each role with id and name', () => {
    render(<RoleList roles={roles} />);

    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
    // Each row has an Edit button
    expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2);
  });

  it('opens "Create Role" modal when "+ New Role" is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleList roles={roles} />);

    await user.click(screen.getByRole('button', { name: /new role/i }));

    expect(screen.getByRole('heading', { name: /create role/i })).toBeInTheDocument();
  });

  it('opens "Edit Role" modal with pre-filled name when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleList roles={roles} />);

    const rows = screen.getAllByRole('row');
    // rows[0] = thead, rows[1] = admin row
    const editBtns = within(rows[1]).getByRole('button', { name: /edit/i });
    await user.click(editBtns);

    expect(screen.getByRole('heading', { name: /edit role/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
  });

  it('calls window.confirm when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(<RoleList roles={roles} />);

    const deleteBtns = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it('closes modal when Cancel is clicked inside the form', async () => {
    const user = userEvent.setup();
    render(<RoleList roles={roles} />);

    // Open create modal
    await user.click(screen.getByRole('button', { name: /new role/i }));
    expect(screen.getByRole('heading', { name: /create role/i })).toBeInTheDocument();

    // Cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('heading', { name: /create role/i })).not.toBeInTheDocument();
  });
});
