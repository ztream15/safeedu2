import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Function to get the correct CSS class and icon based on Thai status
const getStatusClassLocal = (status) => {
  switch (status) {
    case 'รับเรื่องแล้ว':
      return 'bg-blue-200 text-blue-800';
    case 'กำลังดำเนินการ':
      return 'bg-yellow-200 text-yellow-800';
    case 'แก้ไขเรียบร้อย':
      return 'bg-purple-100 text-purple-800';
    case 'ปิดเรื่อง':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getStatusIconLocal = (status) => {
  switch (status) {
    case 'รับเรื่องแล้ว':
      return '✅';
    case 'กำลังดำเนินการ':
      return '🔍';
    case 'แก้ไขเรียบร้อย':
      return '⚙️';
    case 'ปิดเรื่อง':
      return '✔️';
    default:
      return '';
  }
};

// --- คอมโพเนนต์ย่อยสำหรับฟอร์มเพิ่มแอดมินที่สมบูรณ์ ---
const AddAdminForm = ({ supabase, showMessage, onAdminAdded }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    prefix: '',
    fullName: '',
    phoneNumber: '',
    educationLevel: '',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: '', type: '' });
    if (formData.password !== formData.confirmPassword) {
      setFormMessage({ text: 'รหัสผ่านไม่ตรงกัน', type: 'error' });
      return;
    }
    setLoading(true);

    let createdAuthUser = null;

    try {
      // ขั้นตอนที่ 1: สร้างผู้ใช้ในระบบ Authentication
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("ไม่สามารถสร้างผู้ใช้ในระบบ Authentication ได้");
      createdAuthUser = authData.user;

      // ขั้นตอนที่ 2: เพิ่มข้อมูลโปรไฟล์ลงในตาราง 'profiles' ด้วยตนเอง
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          // updated_at จะถูกตั้งค่าโดยอัตโนมัติจาก database
          full_name: formData.fullName,
          phone_number: formData.phoneNumber,
          education_level: formData.educationLevel,
          prefix: formData.prefix,
          department: null, // department ไม่ได้ใช้ในฟอร์มนี้
          student_id: formData.studentId, // **บันทึกรหัสประจำตัว**
          role: 'admin'
        });

      if (profileError) throw profileError;
      
      setFormMessage({ text: 'เพิ่มแอดมินสำเร็จ!', type: 'success' });
      // เคลียร์ฟอร์มหลังจากสำเร็จ
      setFormData({
        email: '', password: '', confirmPassword: '', prefix: '', fullName: '', 
        phoneNumber: '', educationLevel: '', studentId: ''
      });
      onAdminAdded();

    } catch (error) {
      setFormMessage({ text: `เกิดข้อผิดพลาด: ${error.message}`, type: 'error' });
      // หากสร้างโปรไฟล์ไม่สำเร็จ แต่สร้าง Auth User ไปแล้ว ควรแจ้งให้ทราบ
      if (createdAuthUser) {
        console.error("Profile creation failed for user:", createdAuthUser.id, "This auth user might need to be manually deleted.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">เพิ่มผู้ดูแลระบบใหม่</h2>
      
      {formMessage.text && (
        <div className={`p-3 mb-4 rounded-lg text-center ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {formMessage.text}
        </div>
      )}

      <form onSubmit={handleAddAdminSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">อีเมล <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
           <div>
            <label className="block text-gray-700 font-semibold mb-1">รหัสประจำตัว</label>
            <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">คำนำหน้า</label>
            <select name="prefix" value={formData.prefix} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="">-- เลือกคำนำหน้า --</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-1">ชื่อ - นามสกุล</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">เบอร์โทรศัพท์</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">ระดับการศึกษา</label>
            <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white">
              <option value="">-- เลือกระดับการศึกษา --</option>
              <option value="ปริญญาตรี">ปริญญาตรี</option>
              <option value="ปริญญาโท">ปริญญาโท</option>
              <option value="ปริญญาเอก">ปริญญาเอก</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">รหัสผ่าน <span className="text-red-500">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">ยืนยันรหัสผ่าน <span className="text-red-500">*</span></label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 disabled:bg-gray-400">
          {loading ? 'กำลังเพิ่ม...' : 'เพิ่มแอดมิน'}
        </button>
      </form>
    </div>
  );
};


// --- คอมโพเนนต์หลักของ Dashboard ---
export default function AdminDashboard({ supabase, showMessage, setAdmin }) {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const navigate = useNavigate();

  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchAllData = async () => {
    if(!loading) setLoading(true);
    setError(null);
    try {
      const { data: reportsData, error: reportsError } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (reportsError) throw reportsError;
      setReports(reportsData);

      const { data: usersData, error: usersError } = await supabase.from("profiles").select("id, full_name, role");
      if (usersError) throw usersError;
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let results = reports;
    const lowercasedSearchTerm = searchTerm.trim().toLowerCase();
    if (lowercasedSearchTerm) {
      results = results.filter(report => 
        report.id.toString().includes(lowercasedSearchTerm) ||
        (report.issue_type && report.issue_type.toLowerCase().includes(lowercasedSearchTerm))
      );
    }
    if (statusFilter !== 'all') {
      results = results.filter(report => report.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      results = results.filter(report => report.issue_type === typeFilter);
    }
    setFilteredReports(results);
  }, [searchTerm, statusFilter, typeFilter, reports]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (setAdmin) setAdmin(null);
      if (showMessage) showMessage('ออกจากระบบสำเร็จ!', 'success');
      navigate("/admin-login");
    } catch (error) {
      if (showMessage) showMessage("เกิดข้อผิดพลาดในการออกจากระบบ: " + error.message, "error");
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/admin-login");
      } else {
        fetchAllData();
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, navigate]);

  const handleOpenUpdateModal = (report) => {
    setCurrentReport(report);
    setNewStatus(report.status);
    setShowUpdateModal(true);
  };

  const handleOpenDeleteModal = (id, type) => {
    setCurrentItemId(id);
    setModalType(type);
    setShowDeleteModal(true);
  };

  const handleUpdateStatus = async () => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */ };
  const handleDeleteItem = async () => { /* ... โค้ดส่วนนี้เหมือนเดิม ... */ };
  
  const onAdminAdded = () => {
    // **แก้ไข: ไม่ต้องสลับหน้ากลับ แต่ให้โหลดข้อมูล User ใหม่**
    // setIsAddingAdmin(false); // <--- เอาบรรทัดนี้ออก
    fetchAllData(); // โหลดข้อมูลใหม่ทั้งหมดเพื่ออัปเดตรายชื่อ Users
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Admin Dashboard</h1>
        <div className="text-red-600 p-4 bg-red-100 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800 border-b-4 border-blue-500 pb-2">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <button onClick={() => setIsAddingAdmin(!isAddingAdmin)} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-full hover:bg-purple-700">
            {isAddingAdmin ? 'แสดงรายการรายงาน' : 'เพิ่มแอดมิน'}
          </button>
          <button onClick={handleLogout} className="bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700">
            ออกจากระบบ
          </button>
        </div>
      </div>

      {isAddingAdmin ? (
        <AddAdminForm supabase={supabase} showMessage={showMessage} onAdminAdded={onAdminAdded} />
      ) : (
        <>
          <section className="mb-6 bg-white shadow-lg rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-gray-700 font-semibold mb-1">ค้นหา (ID หรือ ประเภทปัญหา)</label>
                <input 
                  type="text"
                  placeholder="กรอกเพื่อค้นหา..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">กรองตามสถานะ</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option value="all">ทั้งหมด</option>
                  <option value="รับเรื่องแล้ว">รับเรื่องแล้ว</option>
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="แก้ไขเรียบร้อย">แก้ไขเรียบร้อย</option>
                  <option value="ปิดเรื่อง">ปิดเรื่อง</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">กรองตามประเภทปัญหา</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-white">
                  <option value="all">ทั้งหมด</option>
                  <option value="การกลั่นแกล้ง">การกลั่นแกล้ง</option>
                  <option value="ความรุนแรง">ความรุนแรง</option>
                  <option value="ปัญหาทางจิตใจ">ปัญหาทางจิตใจ</option>
                  <option value="ล่วงละเมิดทางเพศ/คุกคามทางเพศ">ล่วงละเมิดทางเพศ/คุกคามทางเพศ</option>
                  <option value="การทุจริต/การประพฤติมิชอบ">การทุจริต/การประพฤติมิชอบ</option>
                  <option value="ปัญหาความปลอดภัยในพื้นที่">ปัญหาความปลอดภัยในพื้นที่</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>
          </section>

          <section className="mb-10 bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700">รายการเรื่องร้องเรียน</h2>
              <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                พบ {filteredReports.length} รายการ
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg">
                <thead>
                  <tr className="bg-blue-500 text-white uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">ID</th>
                    <th className="py-3 px-6 text-left">ประเภทปัญหา</th>
                    <th className="py-3 px-6 text-left">สถานะ</th>
                    <th className="py-3 px-6 text-left">วันที่แจ้ง</th>
                    <th className="py-3 px-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="py-3 px-6 text-left">{r.id}</td>
                      <td className="py-3 px-6 text-left">{r.issue_type}</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`py-1 px-3 rounded-full text-xs font-bold flex items-center ${getStatusClassLocal(r.status)}`}>
                          {getStatusIconLocal(r.status)} {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-left">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex item-center justify-center space-x-2">
                          <button onClick={() => handleOpenUpdateModal(r)} className="bg-blue-500 text-white p-2 rounded-lg" title="Update Status">✏️</button>
                          <button onClick={() => handleOpenDeleteModal(r.id, 'report')} className="bg-red-500 text-white p-2 rounded-lg" title="Delete Report">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white shadow-lg rounded-xl p-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-gray-700">รายชื่อสมาชิก</h2>
               <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                 จำนวน: {users.length}
               </span>
             </div>
             <div className="overflow-x-auto">
               <table className="min-w-full bg-white rounded-lg">
                 <thead>
                   <tr className="bg-green-500 text-white uppercase text-sm leading-normal">
                     <th className="py-3 px-6 text-left">ID</th>
                     <th className="py-3 px-6 text-left">ชื่อ-นามสกุล</th>
                     <th className="py-3 px-6 text-left">บทบาท</th>
                     <th className="py-3 px-6 text-center">จัดการ</th>
                   </tr>
                 </thead>
                 <tbody className="text-gray-600 text-sm font-light">
                   {users.map((u) => (
                     <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-100">
                       <td className="py-3 px-6 text-left">{u.id}</td>
                       <td className="py-3 px-6 text-left">{u.full_name || "ไม่ระบุ"}</td>
                       <td className="py-3 px-6 text-left">{u.role}</td>
                       <td className="py-3 px-6 text-center">
                         <button onClick={() => handleOpenDeleteModal(u.id, 'user')} className="bg-red-500 text-white p-2 rounded-lg" title="Delete User">🗑️</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>
        </>
      )}

      {/* Modals */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-2xl font-bold mb-4">อัปเดตสถานะ</h3>
            <p className="mb-4">รายงาน ID: <span className="font-semibold">{currentReport?.id}</span></p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">สถานะใหม่</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="block w-full px-4 py-2 border rounded-lg">
                <option value="รับเรื่องแล้ว">รับเรื่องแล้ว</option>
                <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                <option value="แก้ไขเรียบร้อย">แก้ไขเรียบร้อย</option>
                <option value="ปิดเรื่อง">ปิดเรื่อง</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowUpdateModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">ยกเลิก</button>
              <button onClick={handleUpdateStatus} className="bg-blue-500 text-white px-4 py-2 rounded-lg">บันทึก</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-2xl font-bold mb-4">ยืนยันการลบ</h3>
            <p className="mb-4">คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">ยกเลิก</button>
              <button onClick={handleDeleteItem} className="bg-red-500 text-white px-4 py-2 rounded-lg">ลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
