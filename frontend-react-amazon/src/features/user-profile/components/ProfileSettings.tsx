import { useState } from 'react';
import { useAuthStore } from '@/features/auth';
import { useUpdateProfile } from '@/features/auth/hooks/useUpdateProfile';
import { EditProfileForm } from './EditProfileForm';
import type { UpdateMeRequest } from '@/features/auth';

export function ProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const { mutate: updateProfile, isPending, error } = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  const handleSubmit = (data: UpdateMeRequest) => {
    updateProfile(data, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Information</h2>

      {!isEditing ? (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{`${user.firstName} ${user.lastName}`}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-800">
                {user.role}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        </>
      ) : (
        <>
          <EditProfileForm
            user={user}
            onSubmit={handleSubmit}
            isLoading={isPending}
            error={error?.message}
          />
          <button
            onClick={() => setIsEditing(false)}
            className="mt-3 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
