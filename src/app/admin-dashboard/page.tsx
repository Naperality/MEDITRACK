import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { updateUserRole } from "@/app/actions/admin";
import { ShieldAlert, Users, UserCog, UserCheck, Search } from "lucide-react";

export default async function AdminDashboard() {
  const { userId, getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  
  if (!userId || !token) redirect('/sign-in');

  const supabase = createClerkSupabaseClient(token);

  // 1. Verify Admin Status
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (adminProfile?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 2. Fetch all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-200">
              <ShieldAlert className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Admin</h1>
              <p className="text-slate-500 font-medium text-sm">Manage user roles and permissions</p>
            </div>
          </div>
          <div className="border p-1 rounded-full shadow-sm bg-white">
            <UserButton />
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users className="text-blue-600" />} label="Total Users" value={users?.length || 0} />
          <StatCard icon={<UserCheck className="text-purple-600" />} label="Caregivers" value={users?.filter(u => u.role === 'CAREGIVER').length || 0} />
          <StatCard icon={<ShieldAlert className="text-indigo-600" />} label="Admins" value={users?.filter(u => u.role === 'ADMIN').length || 0} />
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-slate-400" />
              User Directory
            </h2>
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64 transition-all" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Role Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                          {user.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.full_name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 
                        user.role === 'CAREGIVER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end gap-2">
                        {user.role !== 'CAREGIVER' && (
                          <form action={async () => {
                            'use server';
                            await updateUserRole(user.id, 'CAREGIVER');
                          }}>
                            <button type="submit" className="text-xs font-bold bg-white border border-purple-200 text-purple-600 px-4 py-2 rounded-xl hover:bg-purple-50 transition-all active:scale-95">
                              Assign Caregiver
                            </button>
                          </form>
                        )}
                        {user.role !== 'ADMIN' && (
                          <form action={async () => {
                            'use server';
                            await updateUserRole(user.id, 'ADMIN');
                          }}>
                            <button type="submit" className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-all active:scale-95 shadow-sm">
                              Elevate to Admin
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors">
        <div className="p-4 bg-slate-50 rounded-2xl transition-transform">
          {icon}
        </div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    );
}