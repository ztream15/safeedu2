import React, { useState, useEffect, useRef, useCallback } from 'react';
// นำเข้า createClient จากไลบรารี @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";

import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";



// --- การตั้งค่า Supabase ---
// สำคัญ: โปรดแทนที่ค่าเหล่านี้ด้วย Supabase URL และ Anon Key จริงของคุณจากหน้าการตั้งค่าโปรเจกต์ Supabase
// หากคุณเห็นข้อผิดพลาด "Invalid API key" โปรดตรวจสอบให้แน่ใจว่าคีย์ด้านล่างนี้ถูกต้อง
// คุณสามารถหาคีย์นี้ได้จาก Supabase Project Settings -> API -> Project API keys -> public (anon)
const supabaseUrl = 'https://qyklghbgnksmpeqxhndr.supabase.co'; // ตัวอย่าง: 'https://abcde12345.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5a2xnaGJnbmtzbXBlcXhobmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MTE0OTAsImV4cCI6MjA2NzA4NzQ5MH0.OQL0rcjDjH4oDrkDSt3gn8yxfPBxcs7rBNkVu6aaVuw'; // ตัวอย่าง: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// --- สำคัญ: หากคุณพบข้อผิดพลาด "Could not resolve "@supabase/supabase-js" ---
// --- โปรดติดตั้งไลบรารี Supabase client โดยรันคำสั่งใดคำสั่งหนึ่งต่อไปนี้ในไดเรกทอรีโปรเจกต์ของคุณ: ---
// --- npm install @supabase/supabase-js ---
// --- หรือ ---
// --- yarn add @supabase/supabase-js ---
// --- หลังจากการติดตั้ง โปรดรีสตาร์ท development server ของคุณ (เช่น npm start หรือ yarn start) ---

// --- [ส่วนที่เพิ่มใหม่] คอมโพเนนต์สำหรับแสดง Pop-up นโยบายความเป็นส่วนตัว ---
const PrivacyPolicyModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-blue-800">นโยบายความเป็นส่วนตัว (Privacy Policy)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4 text-gray-700 overflow-y-auto">
          <p className="text-sm text-gray-500">ปรับปรุงล่าสุด: 5 กันยายน 2568</p>
          <p>SafeEdu ("เรา") มุ่งมั่นที่จะปกป้องความเป็นส่วนตัวของผู้ใช้งาน ("คุณ") ทุกคน นโยบายนี้อธิบายถึงวิธีการที่เรารวบรวม, ใช้, และปกป้องข้อมูลของคุณ</p>
          
          <ol className="list-decimal list-inside space-y-3">
            <li><strong>การรวบรวมข้อมูล:</strong> เรารวบรวมข้อมูลที่คุณให้โดยตรง เช่น ข้อมูลโปรไฟล์ (ชื่อ, อีเมล, ระดับการศึกษา) และข้อมูลในเรื่องร้องเรียน (รายละเอียด, วันที่, สถานที่, ไฟล์แนบ)</li>
            <li><strong>วัตถุประสงค์การใช้ข้อมูล:</strong> ข้อมูลของคุณจะถูกใช้เพื่อการตรวจสอบ, ติดตาม, และแก้ไขปัญหาตามเรื่องที่ร้องเรียนเท่านั้น รวมถึงการติดต่อกลับหากจำเป็น</li>
            <li><strong>การไม่เปิดเผยตัวตน:</strong> หากคุณเลือก "ไม่เปิดเผยตัวตน" ข้อมูลส่วนตัวของคุณ (ชื่อ, อีเมล, เบอร์โทร) จะไม่ถูกบันทึกในรายงาน แต่ ID ผู้ใช้ของคุณ (หากล็อกอิน) จะยังคงถูกบันทึกไว้เพื่อการแสดงประวัติส่วนตัว โดยที่ผู้ดูแลจะไม่เห็นข้อมูลที่เชื่อมโยงถึงตัวตนของคุณจากหน้ารายงาน</li>
            <li><strong>การเปิดเผยข้อมูลแก่บุคคลที่สาม:</strong> เราจะไม่เปิดเผยข้อมูลของคุณแก่บุคคลภายนอก ยกเว้นกรณีที่จำเป็นต่อกระบวนการตรวจสอบ เช่น การส่งต่อข้อมูลให้แก่ฝ่ายปกครอง, อาจารย์ที่ปรึกษา, หรือผู้มีอำนาจตัดสินใจภายในสถานศึกษาเท่านั้น</li>
            <li><strong>การจัดเก็บและความปลอดภัย:</strong> ข้อมูลของคุณถูกจัดเก็บในฐานข้อมูลที่มีการป้องกันอย่างแน่นหนา และมีการเข้ารหัสข้อมูลที่สำคัญเพื่อความปลอดภัยสูงสุด</li>
            <li><strong>ระยะเวลาการเก็บข้อมูล:</strong> เราจะเก็บข้อมูลเรื่องร้องเรียนของคุณไว้ตราบเท่าที่จำเป็นต่อการดำเนินงานและติดตามผล หรือตามที่กฎหมายกำหนด</li>
            <li><strong>สิทธิ์ของผู้ใช้:</strong> คุณมีสิทธิ์ในการเข้าถึงและดูประวัติการร้องเรียนของคุณได้เสมอผ่านหน้า "ติดตามเรื่องร้องเรียน"</li>
            <li><strong>การใช้คุกกี้ (Cookies):</strong> เว็บไซต์ของเราใช้คุกกี้ที่จำเป็นในการจัดการสถานะการเข้าสู่ระบบ (Session) เท่านั้น ไม่มีการใช้คุกกี้เพื่อการติดตามหรือโฆษณา</li>
            <li><strong>ความปลอดภัยของไฟล์แนบ:</strong> ไฟล์ที่คุณแนบมาจะถูกจัดเก็บอย่างปลอดภัยและเข้าถึงได้เฉพาะผู้ดูแลระบบที่เกี่ยวข้องกับเรื่องร้องเรียนของคุณเท่านั้น</li>
            <li><strong>การเปลี่ยนแปลงนโยบาย:</strong> หากมีการเปลี่ยนแปลงนโยบายความเป็นส่วนตัวอย่างมีนัยสำคัญ เราจะแจ้งให้คุณทราบผ่านทางหน้าเว็บไซต์</li>
          </ol>
        </div>
        <div className="p-4 border-t text-right bg-gray-50 rounded-b-2xl sticky bottom-0">
            <button 
              onClick={onClose} 
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ตกลง
            </button>
        </div>
      </div>
    </div>
  );
};

// --- คอมโพเนนต์ฟอร์มแจ้งเหตุ (Report Form Component) ---
function ReportForm({ showMessage, supabase, user }) {
  const [isAnonymous, setIsAnonymous] = useState(true); // สถานะการไม่เปิดเผยตัวตน
  const [formData, setFormData] = useState({ // สถานะข้อมูลฟอร์ม
    reporter_name: '',
    reporter_email: '',
    reporter_phone: '',
    issue_type: '',
    incident_details: '',
    incident_date: '',
    incident_time: '',
    incident_location: '',
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะการส่งข้อมูล
  const [userProfile, setUserProfile] = useState(null); // สถานะข้อมูลโปรไฟล์ผู้ใช้
  // **[แก้ไข]** ประกาศ State สำหรับควบคุม Pop-up ที่นี่
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  // Effect hook สำหรับดึงข้อมูลโปรไฟล์ผู้ใช้เมื่อ user หรือ supabase client เปลี่ยนแปลง
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && supabase) { // ตรวจสอบว่ามี user และ supabase client พร้อมใช้งาน
        console.log("Fetching user profile for:", user.id);
        try {
          // ดึงข้อมูลโปรไฟล์จากตาราง 'profiles' โดยใช้ user.id
          const { data, error } = await supabase
            .from('profiles')
            .select('prefix, full_name, phone_number, education_level, student_id, department')
            .eq('id', user.id)
            .single(); // ดึงข้อมูลเพียงแถวเดียว

          if (error && error.code !== 'PGRST116') { // PGRST116 หมายถึงไม่พบข้อมูล (โปรไฟล์ยังไม่มี)
            console.error('Error fetching profile:', error);
            showMessage('เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์', 'error');
            setUserProfile(null);
          } else if (data) {
            console.log("User profile fetched:", data);
            setUserProfile(data); // ตั้งค่าข้อมูลโปรไฟล์
            // เติมข้อมูลในฟอร์มล่วงหน้าหากผู้ใช้เลือกเปิดเผยตัวตนและมีข้อมูลโปรไฟล์
            if (!isAnonymous) {
              setFormData((prev) => ({
                ...prev,
                reporter_name: data.full_name || '', // ดึงชื่อเต็มจากโปรไฟล์
                reporter_email: user.email || '', // ดึงอีเมลจาก user object
                reporter_phone: data.phone_number || '', // ดึงเบอร์โทรศัพท์จากโปรไฟล์
              }));
            }
          } else {
            console.log("No profile found for user:", user.id);
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Unexpected error fetching profile:', error);
          showMessage('เกิดข้อผิดพลาดที่ไม่คาดคิดในการดึงข้อมูลโปรไฟล์', 'error');
          setUserProfile(null);
        }
      } else {
        console.log("User or Supabase client not available, clearing profile.");
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [user, supabase, isAnonymous, showMessage]); // Dependencies สำหรับ useEffect

  // จัดการการเปลี่ยนแปลงการตั้งค่าการไม่เปิดเผยตัวตน
  const handleAnonymityChange = (anon) => {
    setIsAnonymous(anon);
    if (!anon && userProfile) {
      // หากผู้ใช้เลือกเปิดเผยตัวตนและมีข้อมูลโปรไฟล์ ให้เติมข้อมูลอัตโนมัติ
      setFormData((prev) => ({
        ...prev,
        reporter_name: userProfile.full_name || '', // เติมชื่อเต็มที่ดึงมา
        reporter_email: user.email || '', // เติมอีเมลของผู้ใช้
        reporter_phone: userProfile.phone_number || '', // เติมเบอร์โทรศัพท์ที่ดึงมา
      }));
    } else {
      // หากผู้ใช้เลือกไม่เปิดเผยตัวตนหรือไม่พบข้อมูลโปรไฟล์ ให้ล้างข้อมูลระบุตัวตน
      setFormData((prev) => ({
        ...prev,
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
      }));
    }
  };

  // จัดการการเปลี่ยนแปลงค่าในฟอร์ม
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value, // จัดการ input ประเภทไฟล์แยกต่างหาก
    }));
  };

  // จัดการการส่งฟอร์มแจ้งเหตุ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    showMessage('กำลังส่งเรื่องร้องเรียน...', 'info');

    try {
      let attachmentUrl = null;

      // จัดการการอัปโหลดไฟล์แนบ
      if (formData.attachment) {
        const file = formData.attachment;
        // สร้างพาธไฟล์ที่ไม่ซ้ำกันสำหรับจัดเก็บ
        const filePath = `public/${Date.now()}-${file.name}`; 

        const { error: uploadError } = await supabase.storage
          .from('report_attachments') // ชื่อ bucket สำหรับจัดเก็บไฟล์แนบใน Supabase
          .upload(filePath, file, {
            cacheControl: '3600', // แคช 1 ชั่วโมง
            upsert: false, // ไม่อนุญาตให้เขียนทับหากไฟล์มีอยู่แล้ว
          });

        if (uploadError) {
          throw new Error(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${uploadError.message}`);
        }
        // รับ Public URL ของไฟล์ที่อัปโหลด
        const { data: publicUrlData } = supabase.storage.from('report_attachments').getPublicUrl(filePath);
        attachmentUrl = publicUrlData.publicUrl;
      }

      // เตรียมข้อมูลรายงานสำหรับการแทรก
      const reportData = {
        is_anonymous: isAnonymous,
        reporter_id: user ? user.id : null, // เชื่อมโยง reporter_id หากไม่เป็นนิรนาม
        reporter_name: isAnonymous ? null : formData.reporter_name, // บันทึก reporter_name หากไม่เป็นนิรนาม
        reporter_email: isAnonymous ? null : formData.reporter_email, // บันทึก reporter_email หากไม่เป็นนิรนาม
        reporter_phone: isAnonymous ? null : formData.reporter_phone, // บันทึก reporter_phone หากไม่เป็นนิรนาม
        issue_type: formData.issue_type,
        incident_details: formData.incident_details,
        incident_date: formData.incident_date,
        incident_time: formData.incident_time,
        incident_location: formData.incident_location,
        attachment_url: attachmentUrl,
        status: 'รับเรื่องแล้ว', // สถานะเริ่มต้น
      };

      // แทรกข้อมูลรายงานลงในตาราง 'reports'
      const { data, error } = await supabase.from('reports').insert([reportData]).select('id');

      if (error) {
        throw new Error(`เกิดข้อผิดพลาดในการส่งเรื่อง: ${error.message}`);
      }

      const trackingId = data[0].id; // รับ ID สำหรับติดตาม
      showMessage(`ส่งเรื่องร้องเรียนสำเร็จ! รหัสติดตามของคุณคือ: ${trackingId}`, 'success');

      // รีเซ็ตฟอร์มหลังจากส่งสำเร็จ
      setFormData({
        reporter_name: '',
        reporter_email: '',
        reporter_phone: '',
        issue_type: '',
        incident_details: '',
        incident_date: '',
        incident_time: '',
        incident_location: '',
        attachment: null,
      });
      setIsAnonymous(true); // รีเซ็ตการไม่เปิดเผยตัวตนเป็นค่าเริ่มต้น
      // ล้าง input ไฟล์ด้วยตนเอง เนื่องจาก React ไม่ได้รีเซ็ต input ไฟล์ได้ง่าย
      if (document.getElementById('attachment')) {
        document.getElementById('attachment').value = '';
      }

    } catch (error) {
      console.error('Error submitting report:', error);
      showMessage(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false); // เปิดใช้งานปุ่มส่งอีกครั้ง
    }
  };

  return (
    <>
      {/* **[แก้ไข]** แสดง Pop-up เมื่อ showPrivacyModal เป็น true */}
      {showPrivacyModal && <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">แจ้งเหตุ/รายงานพฤติกรรม</h2>
      <div className="bg-blue-50 p-5 rounded-2xl shadow-inner">
        <label className="block text-xl font-semibold text-blue-800 mb-3">ข้อมูลผู้แจ้ง:</label>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center text-lg cursor-pointer">
            <input
              type="radio"
              name="anonymity"
              value="anonymous"
              checked={isAnonymous}
              onChange={() => handleAnonymityChange(true)}
              className="form-radio h-5 w-5 text-blue-600 rounded-full focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">ไม่เปิดเผยตัวตน</span>
          </label>
          <label className="inline-flex items-center text-lg cursor-pointer">
            <input
              type="radio"
              name="anonymity"
              value="identified"
              checked={!isAnonymous}
              onChange={() => handleAnonymityChange(false)}
              className="form-radio h-5 w-5 text-blue-600 rounded-full focus:ring-blue-500"
              disabled={!user} // ปิดใช้งานหากผู้ใช้ไม่ได้ล็อกอิน
            />
            <span className="ml-2 text-gray-700">เปิดเผยตัวตน (สำหรับผู้ใช้ที่เข้าสู่ระบบ)</span>
          </label>
        </div>
        {isAnonymous && (
          <p className="mt-3 text-blue-700 text-sm italic">
            <i className="fas fa-lock mr-2"></i>ข้อมูลของคุณจะถูกเก็บเป็นความลับสูงสุด
          </p>
        )}
        {!isAnonymous && user && (
          <p className="mt-3 text-blue-700 text-sm italic">
            คุณกำลังแจ้งในฐานะผู้ใช้ที่เข้าสู่ระบบ: <span className="font-semibold">{user.email}</span>
            {userProfile && userProfile.education_level && (
              <span> (ระดับชั้น: {userProfile.education_level}
                {userProfile.department && `, แผนกวิชา: ${userProfile.department}`})
              </span>
            )}
          </p>
        )}
        {!user && !isAnonymous && (
          <p className="mt-3 text-red-700 text-sm italic">
            โปรดเข้าสู่ระบบเพื่อใช้ตัวเลือก "เปิดเผยตัวตน" และกรอกข้อมูลอัตโนมัติ
          </p>
        )}
      </div>

      {/* การแสดงรายละเอียดผู้แจ้งแบบมีเงื่อนไขตามการเลือกไม่เปิดเผยตัวตน */}
      {!isAnonymous && (
        <div className="grid sm:grid-cols-2 gap-6 bg-white p-5 rounded-2xl shadow-md">
          <div>
            <label htmlFor="reporter_name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อ - นามสกุล (ไม่บังคับ)
            </label>
            <input
              type="text"
              id="reporter_name"
              name="reporter_name"
              value={formData.reporter_name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              // ปิดใช้งานหากผู้ใช้ล็อกอินอยู่และไม่เป็นนิรนาม (เติมข้อมูลจากโปรไฟล์)
              disabled={!isAnonymous && !!user} 
            />
          </div>
          <div>
            <label htmlFor="reporter_email" className="block text-sm font-medium text-gray-700 mb-1">
              อีเมล (ไม่บังคับ)
            </label>
            <input
              type="email"
              id="reporter_email"
              name="reporter_email"
              value={formData.reporter_email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              // ปิดใช้งานหากผู้ใช้ล็อกอินอยู่และไม่เป็นนิรนาม (เติมข้อมูลจากโปรไฟล์)
              disabled={!isAnonymous && !!user} 
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="reporter_phone" className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทรศัพท์ (ไม่บังคับ)
            </label>
            <input
              type="tel"
              id="reporter_phone"
              name="reporter_phone"
              value={formData.reporter_phone}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
              // ปิดใช้งานหากผู้ใช้ล็อกอินอยู่และไม่เป็นนิรนาม (เติมข้อมูลจากโปรไฟล์)
              disabled={!isAnonymous && !!user} 
            />
          </div>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl shadow-md space-y-6">
        <div>
          <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-1">
            ประเภทของปัญหา <span className="text-red-500">*</span>
          </label>
          <select
            id="issue_type"
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">-- เลือกประเภทปัญหา --</option>
            <option value="การกลั่นแกล้ง">การกลั่นแกล้ง</option>
            <option value="ความรุนแรง">ความรุนแรง (ทางกาย/วาจา)</option>
            <option value="ปัญหาทางจิตใจ">ปัญหาทางจิตใจ (ซึมเศร้า, วิตกกังวล)</option>
            <option value="ล่วงละเมิดทางเพศ/คุกคามทางเพศ">ล่วงละเมิดทางเพศ/คุกคามทางเพศ</option>
            <option value="การทุจริต/การประพฤติมิชอบ">การทุจริต/การประพฤติมิชอบ</option>
            <option value="ปัญหาความปลอดภัยในพื้นที่">ปัญหาความปลอดภัยในพื้นที่</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div>
          <label htmlFor="incident_details" className="block text-sm font-medium text-gray-700 mb-1">
            รายละเอียดเหตุการณ์ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="incident_details"
            name="incident_details"
            rows="5"
            value={formData.incident_details}
            onChange={handleChange}
            placeholder="โปรดอธิบายเหตุการณ์ให้ชัดเจนที่สุด เพื่อประโยชน์ในการตรวจสอบ"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <label htmlFor="incident_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เกิดเหตุ <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="incident_date"
              name="incident_date"
              value={formData.incident_date}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="incident_time" className="block text-sm font-medium text-gray-700 mb-1">
              เวลาเกิดเหตุ <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              id="incident_time"
              name="incident_time"
              value={formData.incident_time}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="incident_location" className="block text-sm font-medium text-gray-700 mb-1">
              สถานที่เกิดเหตุ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="incident_location"
              name="incident_location"
              value={formData.incident_location}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
            แนบไฟล์/ภาพ (ไม่บังคับ)
          </label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*,application/pdf"
          />
          {formData.attachment && (
            <p className="mt-2 text-sm text-gray-500">ไฟล์ที่เลือก: {formData.attachment.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-start">
          <div className="flex items-center h-5">
            <input id="privacy_consent" name="privacy_consent" type="checkbox" required className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="privacy_consent" className="font-medium text-gray-700">
              ฉันได้อ่านและยอมรับ
              <button 
                type="button" 
                className="text-blue-600 hover:text-blue-800 ml-1 underline"
                onClick={() => setShowPrivacyModal(true)}
              >
                นโยบายความเป็นส่วนตัว
              </button>
              ของ SafeEdu แล้ว <span className="text-red-500">*</span>
            </label>
          </div>
        </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'ส่งเรื่องร้องเรียน'
        )}
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        ข้อมูลของคุณจะถูกเก็บเป็นความลับสูงสุด และจะถูกใช้เพื่อวัตถุประสงค์ในการแก้ไขปัญหาที่แจ้งเท่านั้น เราตระหนักถึงความปลอดภัยและความเป็นส่วนตัวของผู้ใช้งานเป็นสำคัญ
      </p>
    </form>
    </>
  );
}

// แสดงประวัติการแจ้งเหตุ
function TrackStatus({ showMessage, supabase, user }) {
  const [searchId, setSearchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [allUserReports, setAllUserReports] = useState([]);
  const [displayReports, setDisplayReports] = useState([]);
  const [selectedReportDetails, setSelectedReportDetails] = useState(null);

  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchUserHistory = async () => {
      setHistoryLoading(true);
      try {
        let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

        if (user?.id) {
          query = query.eq('reporter_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        setAllUserReports(data || []);
        setDisplayReports(data || []);
      } catch (error) {
        showMessage(`เกิดข้อผิดพลาดในการดึงประวัติ: ${error.message}`, 'error');
        console.error("History fetch error:", error);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchUserHistory();
  }, [user, supabase, showMessage]);

  const filterReports = (search = searchId, status = statusFilter, type = typeFilter) => {
    let results = allUserReports;

    if (search) {
      results = results.filter(report => report.id.toString().includes(search.trim()));
    }
    if (status !== 'all') {
      results = results.filter(report => report.status === status);
    }
    if (type !== 'all') {
      results = results.filter(report => report.issue_type === type);
    }

    setDisplayReports(results);
    setSelectedReportDetails(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    filterReports();
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    filterReports(searchId, e.target.value, typeFilter);
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
    filterReports(searchId, statusFilter, e.target.value);
  };

  // ✅ คลิกซ้ำปิดรายละเอียดได้
  const handleViewDetails = (report) => {
    setSelectedReportDetails(
      selectedReportDetails?.id === report.id ? null : report
    );
  };

  const formatStatusDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'รับเรื่องแล้ว': return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'กำลังดำเนินการ': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'แก้ไขเรียบร้อย': return 'bg-purple-100 text-purple-800 border-purple-400';
      case 'ปิดเรื่อง': return 'bg-green-100 text-green-800 border-green-400';
      default: return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'รับเรื่องแล้ว': return '✅ ';
      case 'กำลังดำเนินการ': return '🔍 ';
      case 'แก้ไขเรียบร้อย': return '⚙️ ';
      case 'ปิดเรื่อง': return '✔️ ';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">ติดตามสถานะเรื่องร้องเรียน</h2>

      {/* ค้นหา + กรอง */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="กรอกรหัสติดตามเพื่อค้นหา"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-lg"
          />
          <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">
            ค้นหา
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">กรองตามสถานะ</label>
            <select id="status-filter" value={statusFilter} onChange={handleStatusChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white">
              <option value="all">ทั้งหมด</option>
              <option value="รับเรื่องแล้ว">รับเรื่องแล้ว</option>
              <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
              <option value="แก้ไขเรียบร้อย">แก้ไขเรียบร้อย</option>
              <option value="ปิดเรื่อง">ปิดเรื่อง</option>
            </select>
          </div>
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">กรองตามประเภทปัญหา</label>
            <select id="type-filter" value={typeFilter} onChange={handleTypeChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl bg-white">
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
      </form>

      {/* รายการร้องเรียน */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-blue-800 text-center">ประวัติการร้องเรียนของคุณ</h3>
        {historyLoading ? (
          <p className="text-center text-gray-500 py-8">กำลังโหลดประวัติ...</p>
        ) : displayReports.length > 0 ? (
          <div className="space-y-4">
            {displayReports.map((report) => (
              <div key={report.id} className="space-y-2">
                {/* กล่องสรุป */}
                <button
                  onClick={() => handleViewDetails(report)}
                  className="w-full text-left bg-white p-4 rounded-xl shadow-md border-l-4 hover:shadow-lg hover:border-blue-600 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex-grow">
                      <p className="text-sm text-gray-500">
                        รหัสติดตาม: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{report.id}</span>
                      </p>
                      <p className="text-lg font-semibold text-gray-800 mt-1">{report.issue_type}</p>
                      <p className="text-sm text-gray-500 mt-1">วันที่แจ้ง: {formatStatusDate(report.created_at)}</p>
                    </div>
                    <div className="mt-2 sm:mt-0 self-start sm:self-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(report.status)}`}>
                        {getStatusIcon(report.status)}{report.status}
                      </span>
                    </div>
                  </div>
                </button>

                {/* ✅ รายละเอียดจะแสดงใต้กล่องที่กด */}
                {selectedReportDetails?.id === report.id && (
                  <div className="bg-blue-50 p-6 rounded-2xl shadow-inner space-y-4">
                    <h3 className="text-2xl font-bold text-blue-800 mb-4">
                      รายละเอียดเรื่องร้องเรียน #{report.id}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                      <p><strong className="font-semibold text-blue-700">ประเภทปัญหา:</strong> {report.issue_type}</p>
                      <p><strong className="font-semibold text-blue-700">สถานะปัจจุบัน:</strong> 
                        <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(report.status)}`}>
                          {getStatusIcon(report.status)}{report.status}
                        </span>
                      </p>
                      <p><strong className="font-semibold text-blue-700">วันที่เกิดเหตุ:</strong> {formatStatusDate(report.incident_date)}</p>
                      <p><strong className="font-semibold text-blue-700">เวลาเกิดเหตุ:</strong> {report.incident_time}</p>
                      <p className="sm:col-span-2"><strong className="font-semibold text-blue-700">สถานที่เกิดเหตุ:</strong> {report.incident_location}</p>
                      <p className="sm:col-span-2"><strong className="font-semibold text-blue-700">รายละเอียดเหตุการณ์:</strong><br/>{report.incident_details}</p>
                      {report.attachment_url && (
                        <p className="sm:col-span-2">
                          <strong className="font-semibold text-blue-700">ไฟล์แนบ:</strong>
                          <a href={report.attachment_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">ดูไฟล์แนบ</a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-xl">
            {allUserReports.length === 0 ? "คุณยังไม่มีประวัติการร้องเรียน" : "ไม่พบรายการที่ตรงกับตัวกรอง"}
          </p>
        )}
      </div>
    </div>
  );
}




// --- คอมโพเนนต์ฟอร์มล็อกอิน (Login Form Component) ---
function LoginForm({ showMessage, supabase, setActiveTab }) {
  const [email, setEmail] = useState(''); // สถานะอีเมล
  const [password, setPassword] = useState(''); // สถานะรหัสผ่าน
  const [isLoggingIn, setIsLoggingIn] = useState(false); // สถานะการล็อกอิน
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    showMessage('กำลังเข้าสู่ระบบ...', 'info');

    try {
      // พยายามล็อกอินด้วยอีเมลและรหัสผ่าน
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // ตรวจสอบข้อความผิดพลาดเฉพาะสำหรับข้อมูลประจำตัวที่ไม่ถูกต้อง
        if (error.message === "Invalid login credentials") {
            showMessage('ไม่พบบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง กรุณาลงทะเบียน', 'error');
            setActiveTab('register'); // เปลี่ยนไปแท็บลงทะเบียนหากข้อมูลไม่ถูกต้อง
        } else {
            throw new Error(error.message); // ส่งข้อผิดพลาดอื่น ๆ
        }
      } else {
        showMessage('เข้าสู่ระบบสำเร็จ!', 'success');
        // --- ส่วนนี้สำคัญมาก ---
        // เรายังคงเรียก setActiveTab ที่นี่ เพื่อให้ UI ตอบสนองทันทีที่ผู้ใช้คลิก
        // แม้ว่า useEffect ใน App จะจัดการเรื่องนี้ด้วยก็ตาม การทำเช่นนี้จะให้ประสบการณ์ผู้ใช้ที่ดีที่สุด
        setActiveTab('report'); 
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}`, 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6 bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">เข้าสู่ระบบ</h2>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          อีเมล
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          รหัสผ่าน
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={isLoggingIn}
        className="block mx-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
      >
        {isLoggingIn ? (
          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </button>
      <p className="text-center text-sm text-gray-500 mt-4">
        ยังไม่มีบัญชี?{' '}
        <button type="button" onClick={() => setActiveTab('register')} className="text-blue-600 hover:underline">
          ลงทะเบียนที่นี่
        </button>
      </p>
      <p className="text-center text-sm text-gray-500 mt-2">
    ลืมรหัสผ่าน?{' '}
    <button
      type="button"
      onClick={() => navigate("/reset-password")}
      className="text-blue-600 hover:underline"
    >
      รีเซ็ตรหัสผ่าน
    </button>
  </p>
    </form>
  );
}

// --- คอมโพเนนต์ฟอร์มลงทะเบียน (Register Form Component) ---
function RegisterForm({ showMessage, supabase, setActiveTab, setPersistentMessage }) {
  const [email, setEmail] = useState(''); // สถานะอีเมล
  const [password, setPassword] = useState(''); // สถานะรหัสผ่าน
  const [confirmPassword, setConfirmPassword] = useState(''); // สถานะยืนยันรหัสผ่าน
  const [prefix, setPrefix] = useState(''); // สถานะคำนำหน้า
  const [fullName, setFullName] = useState(''); // สถานะชื่อเต็ม
  const [phoneNumber, setPhoneNumber] = useState(''); // สถานะเบอร์โทรศัพท์
  const [educationLevel, setEducationLevel] = useState(''); // สถานะระดับชั้น
  const [department, setDepartment] = useState(''); // สถานะแผนกวิชา
  const [departmentOptions, setDepartmentOptions] = useState([]); // ตัวเลือกแผนกวิชา
  const [studentId, setStudentId] = useState(''); // สถานะเลขบัตรนักศึกษา
  const [isRegistering, setIsRegistering] = useState(false); // สถานะการลงทะเบียน

  // ตั้งค่าตัวเลือกแผนกวิชาแบบไดนามิกตามระดับชั้น
  useEffect(() => {
    const vocationalDepartments = [
      "การตลาด", "การบัญชี", "คหกรรมศาสตร์", "ดิจิทัลกราฟิก",
      "เทคโนโลยีธุรกิจดิจิทัล", "เทคโนโลยีแฟชั่นและเครื่องแต่งกาย",
      "วิจิตรศิลป์", "อาหารและโภชนาการ", "การจัดการสำนักงานดิจิทัล",
      "การโรงแรม", "การจัดการโลจิสติกส์", "การท่องเที่ยว"
    ];
    const itDepartment = "เทคโนโลยีสารสนเทศ";
    const bachelorDepartments = ["การจัดการสำนักงาน", "บัญชี"];

    let options = [];
    if (educationLevel.startsWith('ปวช')) {
      options = vocationalDepartments;
     } else if (educationLevel.startsWith('ปวส.1')) {
      options = [...vocationalDepartments];
    } else if (educationLevel.startsWith('ปวส.2')) {
      options = [...vocationalDepartments, itDepartment];
    } else if (educationLevel === 'ปริญญาตรี') {
      options = bachelorDepartments;
    }
    
    setDepartmentOptions(options);
    setDepartment(''); // รีเซ็ตแผนกวิชาเมื่อระดับชั้นเปลี่ยน
  }, [educationLevel]);

  // จัดการการลงทะเบียนผู้ใช้
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    showMessage('กำลังลงทะเบียน...', 'info');

    // --- ✨ เพิ่มโค้ดส่วนนี้เข้าไป ✨ ---
  if (!prefix || !fullName || !phoneNumber || !educationLevel || !department || !studentId) {
    showMessage('กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบทุกช่อง', 'error');
    setIsRegistering(false);
    return;
  }

    // --- โค้ดเดิมที่เช็คความยาว ---
    if (password.length < 8) {
      showMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร', 'error');
      setIsRegistering(false);
      return;
    }

    // --- ✨ เพิ่มโค้ดส่วนนี้เข้าไปต่อท้าย ✨ ---
    const letterCount = (password.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < 2) {
      showMessage('รหัสผ่านต้องมีตัวอักษรอย่างน้อย 2 ตัว', 'error');
      setIsRegistering(false);
      return;
    }
    // --- สิ้นสุดส่วนที่เพิ่ม ---

    if (password !== confirmPassword) {
      showMessage('รหัสผ่านไม่ตรงกัน', 'error');
      setIsRegistering(false);
      return;
    }

    // การตรวจสอบรูปแบบเลขบัตรนักศึกษาฝั่ง client
    if (studentId && !/^\d{11}$/.test(studentId)) {
      showMessage('โปรดกรอกเลขบัตรนักศึกษา 11 หลักที่เป็นตัวเลขเท่านั้น', 'error');
      setIsRegistering(false);
      return;
    }

    try {
      // พยายามลงทะเบียนผู้ใช้ด้วยอีเมล รหัสผ่าน และข้อมูลเมตาเพิ่มเติม
      // อ็อพชัน 'data' ตรงนี้จะส่งข้อมูลเมตาที่สามารถเข้าถึงได้ใน auth.users.raw_user_meta_data ของ Supabase
      // และสามารถนำไปใช้โดย database triggers (เช่น handle_new_user) เพื่อเติมข้อมูลในตาราง profiles
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { 
            prefix, 
            full_name: fullName, // ส่งค่า fullName ที่ผู้ใช้กรอกไป
            phone_number: phoneNumber, 
            education_level: educationLevel,
            department, 
            student_id: studentId === '' ? null : studentId,
          },
          // *** แก้ไข: เปลี่ยนเส้นทางกลับมาพร้อม hash #confirm เพื่อให้แอปพลิเคชันรู้ว่าผู้ใช้เพิ่งยืนยันอีเมลมา ***
          emailRedirectTo: window.location.origin + '#confirm',
        }
      });

      if (authError) {
        // จัดการข้อผิดพลาดเฉพาะสำหรับ "User already registered"
        if (authError.message === "User already registered") {
          showMessage('อีเมลนี้ลงทะเบียนไว้แล้ว กำลังเข้าสู่ระบบ...', 'info');
          // หากผู้ใช้ลงทะเบียนไว้แล้ว ให้ลองล็อกอินโดยตรง
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

          if (signInError) {
            // หากการล็อกอินอัตโนมัติล้มเหลว (เช่น รหัสผ่านไม่ถูกต้องสำหรับผู้ใช้ที่มีอยู่)
            showMessage(`อีเมลนี้ลงทะเบียนไว้แล้ว แต่เข้าสู่ระบบไม่ได้: ${signInError.message}`, 'error');
          } else {
            // หากการล็อกอินอัตโนมัติสำเร็จ ผู้ใช้จะเข้าสู่ระบบแล้ว
            showMessage('เข้าสู่ระบบสำเร็จ!', 'success');
            // นำทางโดยตรงหลังจากล็อกอินอัตโนมัติสำเร็จ
            setActiveTab('report'); 
            // ล้างฟอร์มเมื่อล็อกอินอัตโนมัติสำเร็จ
            setEmail(''); setPassword(''); setConfirmPassword(''); setPrefix('');
            setFullName(''); setPhoneNumber(''); setEducationLevel('');
            setDepartment(''); setStudentId('');
          }
        } else {
          // ส่งข้อผิดพลาดการยืนยันตัวตนประเภทอื่น ๆ
          throw new Error(authError.message); 
        }
      } else if (authData.session === null && authData.user) {
        // ลงทะเบียนสำเร็จ แต่ต้องมีการยืนยันอีเมล (ยังไม่มี session)
        setPersistentMessage({ text: 'ลงทะเบียนสำเร็จ! โปรดตรวจสอบอีเมลของคุณเพื่อยืนยันการลงทะเบียน', type: 'info' });
        setActiveTab('login'); // เปลี่ยนไปหน้าล็อกอินเพื่อรอการยืนยันอีเมล
        // ล้างฟอร์ม
        setEmail(''); setPassword(''); setConfirmPassword(''); setPrefix('');
        setFullName(''); setPhoneNumber(''); setEducationLevel('');
        setDepartment(''); setStudentId('');
      } else if (authData.user) {
        // ลงทะเบียนสำเร็จและเข้าสู่ระบบทันที (เช่น ไม่ต้องยืนยันอีเมลหรือยืนยันแล้ว)
        showMessage('ลงทะเบียนสำเร็จ! คุณเข้าสู่ระบบแล้ว', 'success');
        // นำทางโดยตรงหลังจากลงทะเบียนและล็อกอินทันที
        setActiveTab('report'); 
        // ล้างฟอร์ม
        setEmail(''); setPassword(''); setConfirmPassword(''); setPrefix('');
        setFullName(''); setPhoneNumber(''); setEducationLevel('');
        setDepartment(''); setStudentId('');
      }

    } catch (error) {
      console.error('Error during registration or auto-login:', error);
      showMessage(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
    } finally {
      setIsRegistering(false); // เปิดใช้งานปุ่มลงทะเบียนอีกครั้ง
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6 bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">ลงทะเบียนผู้ใช้ใหม่</h2>
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <input
          type="email" id="register-email" value={email} onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
          รหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <input
          type="password" id="register-password" value={password} onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <input
          type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="prefix" className="block text-sm font-medium text-gray-700 mb-1">คำนำหน้า <span className="text-red-500">*</span>
        </label>
        <select
          id="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)}
          required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">-- เลือกคำนำหน้า --</option>
          <option value="เด็กชาย">เด็กชาย</option>
          <option value="เด็กหญิง">เด็กหญิง</option>
          <option value="นาย">นาย</option>
          <option value="นาง">นาง</option>
          <option value="นางสาว">นางสาว</option>
        </select>
      </div>
      <div>
        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          type="text" id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)}
          required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          type="tel" id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
          required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="education-level" className="block text-sm font-medium text-gray-700 mb-1">ระดับชั้นที่ศึกษา <span className="text-red-500">*</span>
        </label>
        <select
          id="education-level" value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)}
          required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">-- เลือกระดับชั้น --</option>
          <option value="ปวช.1">ปวช.1</option>
          <option value="ปวช.2">ปวช.2</option>
          <option value="ปวช.3">ปวช.3</option>
          <option value="ปวส.1">ปวส.1</option>
          <option value="ปวส.2">ปวส.2</option>
          <option value="ปริญญาตรี">ปริญญาตรี</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
          แผนกวิชา/คณะ <span className="text-red-500">*</span>
        </label>
        <select
          id="department" value={department} onChange={(e) => setDepartment(e.target.value)}
          required
          disabled={departmentOptions.length === 0} // <-- แก้ไข: ปิดการใช้งานเมื่อยังไม่มีตัวเลือก
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100" // <-- เพิ่ม: สไตล์เมื่อถูกปิด
        >
          {/* แก้ไข: เปลี่ยนข้อความตามสถานะ */}
          <option value="">
            {educationLevel ? '-- เลือกแผนกวิชา/คณะ --' : '-- กรุณาเลือกระดับชั้นก่อน --'}
          </option>
          {departmentOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="student-id" className="block text-sm font-medium text-gray-700 mb-1">
          เลขบัตรนักศึกษา (11 หลัก) <span className="text-red-500">*</span>
        </label>
        <input
          type="text" id="student-id" value={studentId}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 11) {
              setStudentId(value);
            }
          }}
          required maxLength="11" pattern="\d{11}"
          title="โปรดกรอกเลขบัตรนักศึกษา 11 หลักที่เป็นตัวเลขเท่านั้น"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit" disabled={isRegistering}
        className="block mx-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
      >
        {isRegistering ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
      </button>
      <p className="text-center text-sm text-gray-500 mt-4">
        มีบัญชีอยู่แล้ว?{' '}
        <button type="button" onClick={() => setActiveTab('login')} className="text-blue-600 hover:underline">
          เข้าสู่ระบบที่นี่
        </button>
      </p>
    </form>
  );
}

// --- คอมโพเนนต์หลักของแอป (Main App Component) ---
// คอมโพเนนต์หลักของแอป
export default function App() {
  const [activeTab, setActiveTab] = useState('login');
  const [message, setMessage] = useState('');
  const messageTimeoutRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [persistentMessage, setPersistentMessage] = useState(null); // <-- เพิ่มบรรทัดนี้

  const showMessage = useCallback((msg, type = 'info') => {
    setMessage({ text: msg, type });
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setMessage('');
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });

    // --- เพิ่มโค้ดส่วนนี้เข้าไป ---
  // ตรวจจับว่าผู้ใช้กลับมาจากการยืนยันอีเมลหรือไม่
  if (window.location.hash === '#confirm') {
    showMessage('ยืนยันอีเมลสำเร็จ! คุณสามารถเข้าสู่ระบบได้เลย', 'success');
    setPersistentMessage(null); // ล้างข้อความที่ค้างไว้
    // ลบ #confirm ออกจาก URL เพื่อความสวยงาม
    window.history.replaceState(null, null, ' '); 
  }
  // --- สิ้นสุดส่วนที่เพิ่ม ---

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loadingAuth) return;
    if (user) {
      if (activeTab === 'login' || activeTab === 'register') {
        setActiveTab('report');
      }
    } else {
      if (activeTab !== 'login' && activeTab !== 'register') {
        setActiveTab('login');
      }
    }
  }, [user, loadingAuth, activeTab]);

  const handleLogout = async () => {
    showMessage('กำลังออกจากระบบ...', 'info');
    const { error } = await supabase.auth.signOut();

    // ไม่ว่า signOut จะสำเร็จหรือล้มเหลว เราจะบังคับให้ UI กลับไปหน้า login เสมอ
    // เพื่อป้องกันไม่ให้ผู้ใช้ติดอยู่ในสถานะที่ผิดพลาด
    if (error && error.message !== "Auth session missing!") {
      // เราจะแสดงข้อความ Error เฉพาะเมื่อเป็น Error ที่ร้ายแรงจริงๆ
      console.error("Logout Error:", error);
      showMessage(`เกิดข้อผิดพลาด: ${error.message}`, 'error');
    } else {
      // ถ้าไม่มี Error หรือเป็นแค่ "Auth session missing" ให้ถือว่าออกจากระบบสำเร็จ
      // และปล่อยให้ useEffect ที่ดักฟัง onAuthStateChange จัดการเปลี่ยนหน้าเอง
      setUser(null);
      setActiveTab('login');
    }
  };

  // Protected Route สำหรับ Admin
  const ProtectedAdminRoute = ({ children }) => {
    if (!admin) {
      // ใช้ <Navigate> เพื่อนำทางไปยังหน้า login ของ admin
      return <Navigate to="/admin-login" replace />;
    }
    return children;
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
        <div className="text-center text-xl text-gray-600 py-10">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          กำลังโหลดระบบ... โปรดรอสักครู่
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 font-sans text-gray-800 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
              <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
                <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 sm:p-8 text-center rounded-t-3xl">
                  <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight">
                    SafeEdu <span role="img" aria-label="shield">🛡️</span>
                  </h1>
                  <p className="text-lg sm:text-xl font-light opacity-90">พื้นที่ปลอดภัยสำหรับการสื่อสารและร้องเรียนในสถานศึกษา</p>
                  {user && (
                    <p className="text-sm mt-2">
                      เข้าสู่ระบบในฐานะ: <span className="font-semibold">{user.email}</span>
                    </p>
                  )}
                </header>
                <nav className="flex flex-wrap justify-center bg-gray-100 p-3 sm:p-4 gap-2 border-b border-gray-200">
                  {!user ? (
                    <>
                      <button
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('login')}
                      >
                        เข้าสู่ระบบ
                      </button>
                      <button
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'register' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('register')}
                      >
                        ลงทะเบียน
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'report' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('report')}
                      >
                        แจ้งเหตุ/รายงานพฤติกรรม
                      </button>
                      <button
                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${activeTab === 'track' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('track')}
                      >
                        ติดตามเรื่องร้องเรียน
                      </button>
                      <button
                        className="px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-red-500 text-white hover:bg-red-600 shadow-md"
                        onClick={handleLogout}
                      >
                        ออกจากระบบ
                      </button>
                    </>
                  )}
                </nav>
                <main className="p-6 sm:p-8 lg:p-10 bg-gray-50" key={activeTab}>
                  {/* --- เพิ่มโค้ดแสดงข้อความค้างไว้ตรงนี้ --- */}
                  {persistentMessage && (
                    <div
                      className={`p-4 mb-6 rounded-xl text-center font-medium transition-all duration-300 ${
                        persistentMessage.type === 'success' ? 'bg-green-100 text-green-700'
                        : persistentMessage.type === 'error' ? 'bg-red-100 text-red-700'
                        : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {persistentMessage.text}
                    </div>
                  )}
                  {/* --- สิ้นสุดส่วนที่เพิ่ม --- */}
                  {message && (
                    <div
                      className={`p-4 mb-6 rounded-xl text-center font-medium transition-all duration-300 ${
                        message.type === 'success'
                          ? 'bg-green-100 text-green-700'
                          : message.type === 'error'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                  {!user ? (
                    activeTab === 'register' ? (
                      <RegisterForm showMessage={showMessage} supabase={supabase} setActiveTab={setActiveTab} setPersistentMessage={setPersistentMessage} />
                    ) : (
                      <LoginForm showMessage={showMessage} supabase={supabase} setActiveTab={setActiveTab} />
                    )
                  ) : (
                    activeTab === 'report' ? (
                      <ReportForm showMessage={showMessage} supabase={supabase} user={user} />
                    ) : (
                      <TrackStatus showMessage={showMessage} supabase={supabase} user={user} />
                    )
                  )}
                </main>
                <footer className="bg-gray-800 text-white p-4 sm:p-6 text-center text-sm rounded-b-3xl">
                  <p>&copy; 2025 SafeEdu. All rights reserved.</p>
                </footer>
              </div>
            </div>
          }
        />
        <Route path="/reset-password" element={<ResetPassword supabase={supabase} />} />
        <Route path="/admin-login" element={<AdminLogin supabase={supabase} setAdmin={setAdmin} />} />
        <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard supabase={supabase} showMessage={showMessage} setAdmin={setAdmin} /></ProtectedAdminRoute>} />
        <Route path="*" element={<h1 style={{ textAlign: 'center' }}>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}
