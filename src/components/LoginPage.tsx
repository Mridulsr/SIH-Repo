import React, { useState } from "react";
import { 
  Shield, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  Camera, 
  Radio, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  ChevronRight
} from "lucide-react";
import { UserProfile } from "../types";

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, currentUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@sih.com");
  const [password, setPassword] = useState("admin123");
  const [name, setName] = useState("Command Administrator");
  const [role, setRole] = useState<UserProfile["role"]>("System Administrator");
  const [outpost, setOutpost] = useState("SIH Central Surveillance & Tactical HQ");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const userProfile: UserProfile = {
        id: `USR-${Date.now()}`,
        name: isSignUp ? name : (currentUser?.name || "Command Administrator"),
        email: email,
        role: isSignUp ? role : (currentUser?.role || "System Administrator"),
        outpost: isSignUp ? outpost : (currentUser?.outpost || "SIH Central Surveillance & Tactical HQ"),
        avatarUrl: currentUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        phone: currentUser?.phone || "+91 98765 43210",
        lastLogin: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST",
        permissions: currentUser?.permissions || ["cameras_view", "cameras_ptz", "alerts_ack", "fences_edit", "ai_forensics", "system_admin"]
      };
      onLoginSuccess(userProfile);
    }, 450);
  };

  const handleQuickAdminLogin = () => {
    setEmail("admin@sih.com");
    setPassword("admin123");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(currentUser || {
        id: "USR-001",
        name: "Command Administrator",
        email: "admin@sih.com",
        role: "System Administrator",
        outpost: "SIH Central Surveillance & Tactical HQ",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        phone: "+91 98765 43210",
        lastLogin: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " IST",
        permissions: ["cameras_view", "cameras_ptz", "alerts_ack", "fences_edit", "ai_forensics", "system_admin"]
      });
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0e17] text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* High-tech background grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d0f_1px,transparent_1px),linear-gradient(to_bottom,#1f293d0f_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: CCTV Camera Visual Banner (Matching Screen 1) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-950 via-[#0d1527] to-[#0a101f] p-8 lg:p-12 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-hidden">
          
          {/* Top Bar on Visual */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wider text-sm text-slate-200">SIH SYSTEM</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ACTIVE
            </div>
          </div>

          {/* Center Graphic: CCTV Hardware Blueprint & Optical Node */}
          <div className="my-8 lg:my-0 flex flex-col items-center justify-center relative z-10">
            {/* Concentric Radar Rings */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-cyan-500/20 border-dashed" />
              <div className="absolute inset-10 rounded-full border border-slate-700/60" />
              
              {/* Surveillance Camera Graphic */}
              <div className="relative z-10 w-40 h-40 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center shadow-2xl p-4 group">
                <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-emerald-500/50 flex items-center justify-center relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Camera className="w-8 h-8 text-emerald-400" />
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-xs font-mono font-bold text-emerald-400">CAM-01 • ONLINE</div>
                  <div className="text-[10px] text-slate-400 font-mono">1920x1080 @ 25 FPS</div>
                </div>
              </div>

              {/* Orbiting Sensor Indicators */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-cyan-300">
                AI DETECT: 99.4%
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-emerald-300">
                ANPR OCR: ACTIVE
              </div>
            </div>

            <div className="text-center mt-6">
              <h2 className="text-xl font-bold text-white tracking-tight">
                SIH – Intelligent Surveillance
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Real-time intrusion detection, optical virtual fences, and automated ANPR checkpost intelligence.
              </p>
            </div>
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/80 text-center z-10">
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Cameras</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">12 Online</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Inference</div>
              <div className="text-xs font-bold text-cyan-400 font-mono">28ms Latency</div>
            </div>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-mono">Enc Engine</div>
              <div className="text-xs font-bold text-slate-300 font-mono">AES-256</div>
            </div>
          </div>
        </div>

        {/* Right Side: Login / Sign Up Form (Exact layout as in Screenshot 1) */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-[#0d1424]">
          <div className="max-w-md w-full mx-auto">
            
            {/* Header with Green Shield Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 mb-3 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isSignUp ? "Create Tactical Account" : "Welcome Back"}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {isSignUp ? "Register for authorized surveillance access" : "Login to continue to your account"}
              </p>
            </div>

            {/* Quick Demo Login Bar */}
            {!isSignUp && (
              <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs">
                    <span className="text-slate-300 font-semibold">Demo Officer: </span>
                    <span className="text-emerald-400 font-mono">admin@sih.com</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 transition-colors"
                >
                  Quick Fill & Enter
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="System Administrator">Admin</option>
                        <option value="Surveillance Commander">Commander</option>
                        <option value="Edge Operator">Operator</option>
                        <option value="Forensics Auditor">Auditor</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                        Sector
                      </label>
                      <input
                        type="text"
                        value={outpost}
                        onChange={(e) => setOutpost(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-mono"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login / Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "REGISTER ACCOUNT" : "LOGIN"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch Sign in / Sign up */}
            <div className="text-center mt-6 pt-4 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-emerald-400 font-semibold hover:underline ml-1 cursor-pointer"
                >
                  {isSignUp ? "Login" : "Sign up"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-emerald-400" />
              Reset Tactical Credentials
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Enter your registered email address. A one-time verification token will be dispatched to your encrypted terminal.
            </p>

            {resetSent ? (
              <div className="mt-4 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-400" />
                Password reset instructions dispatched to <strong className="text-white">{resetEmail || email}</strong>.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  defaultValue={email}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="admin@sih.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setResetSent(true)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs tracking-wider"
                >
                  DISPATCH RESET TOKEN
                </button>
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => {
                  setForgotPasswordOpen(false);
                  setResetSent(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
