import React, { useState } from "react";
import {
  User,
  Shield,
  Key,
  Mail,
  Building,
  CheckCircle2,
  Lock,
  Clock,
  Smartphone,
  Save
} from "lucide-react";
import { UserProfile } from "../types";

interface ProfileViewProps {
  currentUser: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentUser?.name || "Command Administrator");
  const [email, setEmail] = useState(currentUser?.email || "admin@sih.com");
  const [role, setRole] = useState(currentUser?.role || "System Administrator");
  const [outpost, setOutpost] = useState(currentUser?.outpost || "SIH Central Surveillance & Tactical HQ");
  const [phone, setPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...currentUser,
      name,
      email,
      role,
      outpost,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans max-w-4xl">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
            alt={currentUser?.name || "Admin"}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{currentUser?.name || "Admin User"}</h2>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">{currentUser?.email || "admin@sih.com"}</div>
            <div className="text-[11px] text-slate-400 mt-1">{currentUser?.role || "System Administrator"} • {currentUser?.outpost || "Central Command"}</div>
          </div>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Card */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Officer Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Official Email (Login Identifier)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Tactical Role / Designation
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="System Administrator">System Administrator</option>
                <option value="Surveillance Commander">Surveillance Commander</option>
                <option value="Edge Operator">Edge Operator</option>
                <option value="Forensics Auditor">Forensics Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
                Direct Comms Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Assigned Outpost / Sector HQ
            </label>
            <input
              type="text"
              value={outpost}
              onChange={(e) => setOutpost(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="p-6 rounded-2xl bg-[#0f172a]/95 border border-slate-800/90 shadow-xl space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Active Operational Grants</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(currentUser?.permissions || []).map((p) => (
              <div key={p} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE PROFILE CHANGES</span>
          </button>
        </div>
      </form>
    </div>
  );
};
