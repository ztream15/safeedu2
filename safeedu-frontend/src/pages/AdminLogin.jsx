import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin({ supabase, setAdmin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ตรวจสอบว่าถ้ามี admin session อยู่แล้ว ให้ redirect ไป dashboard เลย
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // เพิ่มการตรวจสอบว่าเป็น admin จริงหรือไม่
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error.message);
          return;
        }
        
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
      // 1. พยายามล็อกอิน
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        throw error;
      }
      
      // 2. การล็อกอินสำเร็จแล้ว! ตอนนี้ตรวจสอบ role
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          setMessage("เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์: " + profileError.message);
          await supabase.auth.signOut(); // ล็อกเอาต์ทันที
          throw profileError;
        }

        if (profile && profile.role === 'admin') {
          // ถ้าเป็น admin ให้ไปหน้า admin-dashboard
          setAdmin(user);
          navigate("/admin-dashboard");
        } else {
          // ถ้าไม่ใช่ admin ให้แสดงข้อความแจ้งเตือนและออกจากระบบทันที
          setMessage("สิทธิ์ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ");
          await supabase.auth.signOut();
        }
      }

    } catch (err) {
      console.error(err);
      if (!message) {
        setMessage("ล็อกอินไม่สำเร็จ: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">เข้าสู่ระบบแอดมิน</h2>
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-blue-600 hover:underline">
            กลับไปหน้าเข้าสู่ระบบสำหรับผู้ใช้ทั่วไป
          </Link>
        </div>
      </div>
    </div>
  );
}
