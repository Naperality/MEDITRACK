import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { updateUserRole } from "@/app/actions/admin"; // Make sure this action exists

export default async function AdminDashboard() {
  const { userId } = await auth();

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (adminProfile?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-red-600">Admin Control Panel</h1>
        <UserButton />
      </header>

      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 
                    user.role === 'CAREGIVER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2 flex justify-end gap-2">
                  {user.role !== 'CAREGIVER' && (
                    <form action={async () => {
                      'use server';
                      await updateUserRole(user.id, 'CAREGIVER');
                    }}>
                      <button type="submit" className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600">
                        Promote to Caregiver
                      </button>
                    </form>
                  )}
                  {user.role !== 'ADMIN' && (
                    <form action={async () => {
                      'use server';
                      await updateUserRole(user.id, 'ADMIN');
                    }}>
                      <button type="submit" className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                        Make Admin
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}