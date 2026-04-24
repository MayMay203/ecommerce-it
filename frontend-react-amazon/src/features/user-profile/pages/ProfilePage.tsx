import { Link } from 'react-router';
import { ROUTES } from '@/routes/routes';
import { ProfileSettings } from '../components/ProfileSettings';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      </div>

      <div className="space-y-6">
        <ProfileSettings />

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses</h2>
              <p className="mt-1 text-sm text-gray-600">Manage your delivery addresses</p>
            </div>
            <Link
              to={ROUTES.ADDRESSES}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Addresses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
