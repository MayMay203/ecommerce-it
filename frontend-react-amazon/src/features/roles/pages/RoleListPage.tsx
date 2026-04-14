import { useRoles } from '../hooks/useRoles';
import { RoleList } from '../components/RoleList';

export default function RoleListPage() {
  const { data: roles, isLoading, isError } = useRoles();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        Failed to load roles. Please try again.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
        <p className="mt-1 text-sm text-gray-500">Manage user roles for the platform.</p>
      </div>
      <RoleList roles={roles ?? []} />
    </div>
  );
}
