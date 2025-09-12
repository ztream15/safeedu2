import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin({ supabase, setAdmin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile && profile.role === 'admin') {
          setAdmin(session.user);
          navigate("/admin-dashboard");
        }
      }
    };
    checkSession();
  }, [supabase, navigate, setAdmin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data: loginData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (loginData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', loginData.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile && profile.role === 'admin') {
          setAdmin(loginData.user);
          navigate("/admin-dashboard");
        } else {
          setMessage("สิทธิ์ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ");
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      setMessage("ล็อกอินไม่สำเร็จ: " + (err.message || "กรุณาตรวจสอบข้อมูลอีกครั้ง"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          {message && (
            <p className={`p-3 rounded-lg text-center font-medium ${message.includes('สำเร็จ') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label htmlFor="password"  className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          {/* **[แก้ไข]** เปลี่ยน to="/login" เป็น to="/" */}
          <Link to="/" className="text-blue-600 hover:underline">
            กลับไปหน้าเข้าสู่ระบบสำหรับผู้ใช้ทั่วไป
          </Link>
        </div>
      </div>
    </div>
  );
}
