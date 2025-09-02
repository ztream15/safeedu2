import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

// --- คอมโพเนนต์หลักสำหรับรีเซ็ตรหัสผ่าน ---
export default function ResetPassword({ supabase }) {
  const navigate = useNavigate();
  
  // State ควบคุมว่าจะแสดงหน้าไหน: 'request' (ขอรีเซ็ต) หรือ 'update' (ตั้งรหัสใหม่)
  const [view, setView] = useState('request');
  
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "info" });

  // --- ส่วนสำคัญที่แก้ไข ---
  // useEffect นี้จะคอยดักฟัง event จาก Supabase
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // หาก event คือ PASSWORD_RECOVERY (หมายถึงผู้ใช้กดลิงก์ในอีเมล)
        if (event === "PASSWORD_RECOVERY") {
          // ให้เปลี่ยนไปแสดงหน้าสำหรับตั้งรหัสผ่านใหม่ทันที
          setView('update');
        }
      }
    );

    // Cleanup listener เมื่อคอมโพเนนต์ถูกปิด
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);


  // --- ฟังก์ชันสำหรับส่งอีเมลขอรีเซ็ตรหัสผ่าน ---
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "info" });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // redirectTo คือหน้าที่เราจะให้ผู้ใช้กลับมาหลังจากกดลิงก์
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setMessage({ 
        text: "ส่งคำขอสำเร็จ! โปรดตรวจสอบอีเมลของคุณสำหรับลิงก์รีเซ็ตรหัสผ่าน", 
        type: "success" 
      });

    } catch (err) {
      setMessage({ text: "เกิดข้อผิดพลาด: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- ฟังก์ชันสำหรับตั้งรหัสผ่านใหม่ ---
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน", type: "error" });
      return;
    }
    if (!newPassword) {
      setMessage({ text: "กรุณากรอกรหัสผ่านใหม่", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "info" });

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      setMessage({ text: "อัปเดตรหัสผ่านสำเร็จ! กำลังนำคุณกลับไปหน้าเข้าสู่ระบบ...", type: "success" });
      setTimeout(() => navigate("/"), 2500); // กลับไปหน้าหลัก (/)

    } catch (err) {
      setMessage({ text: "เกิดข้อผิดพลาด: " + err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  //ฟังก์ชันสำหรับเปลี่ยนสีข้อความแจ้งเตือน
  const getMessageClass = () => {
    if (message.type === 'success') return 'bg-green-100 text-green-700';
    if (message.type === 'error') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-6">
        
        {view === 'request' ? (
          // --- หน้าขอรีเซ็ตรหัสผ่าน ---
          <form onSubmit={handleRequestReset} className="space-y-4">
            <h2 className="text-3xl font-bold text-center text-gray-800">ลืมรหัสผ่าน</h2>
            <p className="text-center text-gray-500">กรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน</p>
            
            {message.text && (
              <div className={`p-3 rounded-lg text-center ${getMessageClass()}`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">อีเมล</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
          </form>
        ) : (
          // --- หน้าตั้งรหัสผ่านใหม่ ---
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h2 className="text-3xl font-bold text-center text-gray-800">ตั้งรหัสผ่านใหม่</h2>
            <p className="text-center text-gray-500">กรอกรหัสผ่านใหม่ที่คุณต้องการใช้งาน</p>

             {message.text && (
              <div className={`p-3 rounded-lg text-center ${getMessageClass()}`}>
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">ยืนยันรหัสผ่านใหม่</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
            </button>
          </form>
        )}

        <div className="text-center">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
