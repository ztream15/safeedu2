// AdminDashboard.jsx (1/5)
// Imports, config, helpers, UI components, AddAccountForm

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ---------- Config ---------- */
const BUCKET_NAME = "solutions"; // Supabase Storage bucket name (ต้องสร้างและตั้ง public ไว้แล้ว)
const EDUCATION_LEVELS_OVERVIEW = [
  "ปวช.1",
  "ปวช.2",
  "ปวช.3",
  "ปวส.1",
  "ปวส.2",
  "ปริญญาตรี",
  "ไม่ระบุ",
];
const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#7c3aed",
  "#60a5fa",
  "#6366f1",
  "#a78bfa",
  "#34d399",
  "#f97316",
  "#ef4444",
];

/* ---------- Helpers ---------- */
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  try {
    return dt.toLocaleDateString("th-TH");
  } catch {
    return dt.toLocaleString();
  }
};

const parseJsonSafe = (v) => {
  if (!v) return [];
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
};

const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- UI Components ---------- */

function SummaryCard({ title, value, subtitle, color = "bg-blue-100", icon }) {
  return (
    <div className="p-4 rounded-2xl shadow-md bg-white">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${color} text-white text-xl`}>{icon}</div>
        <div className="flex-1">
          <div className="text-sm text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition ${
        active
          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
          : "bg-white text-gray-700 border"
      }`}
    >
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold">{title}</h4>
          <button onClick={onClose} className="text-gray-500">
            ✖
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div>{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- AddAccountForm ---------- */
const AddAccountForm = ({ type = "user", supabase, showMessage, onAdded }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    prefix: "",
    fullName: "",
    phoneNumber: "",
    educationLevel: type === "admin" ? "" : "ปริญญาตรี",
    studentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormMessage({ text: "", type: "" });

    if (!formData.email || !formData.password) {
      setFormMessage({ text: "กรุณากรอกอีเมลและรหัสผ่าน", type: "error" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormMessage({ text: "รหัสผ่านไม่ตรงกัน", type: "error" });
      return;
    }

    setLoading(true);
    let createdAuthUser = null;
    try {
      // สร้างผู้ใช้ใน Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) throw authError;
      if (!authData?.user)
        throw new Error("ไม่สามารถสร้างผู้ใช้ได้ (auth) ขณะนี้");

      createdAuthUser = authData.user;

      // insert profile
      const profilePayload = {
        id: authData.user.id,
        full_name: formData.fullName || null,
        phone_number: formData.phoneNumber || null,
        education_level: formData.educationLevel || null,
        prefix: formData.prefix || null,
        student_id: formData.studentId || null,
        role: type === "admin" ? "admin" : "user",
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .insert(profilePayload);
      if (profileError) throw profileError;

      const successMsg =
        type === "admin" ? "เพิ่มแอดมินสำเร็จ" : "เพิ่มผู้ใช้สำเร็จ";
      setFormMessage({ text: successMsg, type: "success" });
      if (typeof showMessage === "function") showMessage(successMsg, "success");

      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        prefix: "",
        fullName: "",
        phoneNumber: "",
        educationLevel: type === "admin" ? "" : "ปริญญาตรี",
        studentId: "",
      });

      if (typeof onAdded === "function") onAdded();
    } catch (err) {
      setFormMessage({ text: `เกิดข้อผิดพลาด: ${err.message}`, type: "error" });
      console.error("AddAccountForm error:", err);
      if (createdAuthUser) {
        console.warn(
          "Auth user created but profile insert failed (RLS?), id:",
          createdAuthUser.id
        );
      }
      if (typeof showMessage === "function")
        showMessage(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-blue-700 mb-4">
        {type === "admin" ? "เพิ่มผู้ดูแลระบบ" : "เพิ่มผู้ใช้ใหม่"}
      </h3>

      {formMessage.text && (
        <div
          className={`p-3 mb-4 rounded ${
            formMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {formMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">อีเมล *</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">รหัสผ่าน *</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              type="password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">ยืนยันรหัสผ่าน *</label>
            <input
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              type="password"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">คำนำหน้า</label>
            <select
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded bg-white"
            >
              <option value="">--</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">ชื่อ-นามสกุล</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">ระดับการศึกษา</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded bg-white"
            >
              {type === "admin" ? (
                <>
                  <option value="">-- เลือกระดับ --</option>
                  <option value="ปวส.">ปวส.</option>
                  <option value="ปริญญาตรี">ปริญญาตรี</option>
                  <option value="ปริญญาโท">ปริญญาโท</option>
                  <option value="ปริญญาเอก">ปริญญาเอก</option>
                </>
              ) : (
                <>
                  <option value="">-- เลือกระดับ --</option>
                  <option value="ปวช.1">ปวช.1</option>
                  <option value="ปวช.2">ปวช.2</option>
                  <option value="ปวช.3">ปวช.3</option>
                  <option value="ปวส.1">ปวส.1</option>
                  <option value="ปวส.2">ปวส.2</option>
                  <option value="ปริญญาตรี">ปริญญาตรี</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">รหัสประจำตัว</label>
            <input
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            {loading
              ? "กำลังบันทึก..."
              : `${type === "admin" ? "เพิ่มแอดมิน" : "เพิ่มผู้ใช้"}`}
          </button>
        </div>
      </form>
    </div>
  );
};

// -----------------------------
// AdminDashboard.jsx (2/5 + 3/5)
// Main AdminDashboard + fetchAllData + overview + filters + reports/users actions
// -----------------------------

export default function AdminDashboard({ supabase, showMessage, setAdmin }) {
  const navigate = useNavigate();

  // Data
  const [reports, setReports] = useState([]);
  const [profiles, setProfiles] = useState([]);

  // UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("admin_active_tab") || "overview");

  // Filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eduFilter, setEduFilter] = useState("all");
  const [dateMode, setDateMode] = useState("all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);

  // Modals & selection
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [editReport, setEditReport] = useState(null);
  const [editReportLoading, setEditReportLoading] = useState(false);
  const fileInputRef = useRef();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // users subtab (within Users page)
  const [usersSubtab, setUsersSubtab] = useState("users"); // 'users' or 'admins'

  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editUserLoading, setEditUserLoading] = useState(false);

  // expand report details
  const [expandedReportId, setExpandedReportId] = useState(null);

  // overview cache
  const [overviewData, setOverviewData] = useState({
    perType: [],
    perStatus: {},
    perEducation: {},
    total: 0,
  });

  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  /* ---------- fetch data ---------- */
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // reports
      const { data: reportsData, error: reportsError } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (reportsError) throw reportsError;

      const cleanedReports = (reportsData || []).map((r) => ({
        ...r,
        admin_notes: parseJsonSafe(r.admin_notes),
        solution_files: parseJsonSafe(r.solution_files),
      }));
      setReports(cleanedReports);

      // profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, role, education_level, student_id, prefix, phone_number");
      if (profilesError) throw profilesError;

      const normalized = (profilesData || []).map((p) => ({
        ...p,
        education_level: p.education_level || "ไม่ระบุ",
      }));
      setProfiles(normalized);

      // build overview
      buildOverview(cleanedReports, normalized);
    } catch (err) {
      console.error("fetchAllData error", err);
      setError(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
      if (typeof showMessage === "function") showMessage(`เกิดข้อผิดพลาด: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line
  }, []);

  /* ---------- build overview ---------- */
  const buildOverview = React.useCallback((reportsList, profilesList) => {
    const perTypeMap = {};
    const perStatusMap = {};
    const perEduMap = {};
    let total = 0;

  (reportsList || []).forEach((r) => {
    total++;
    perTypeMap[r.issue_type] = (perTypeMap[r.issue_type] || 0) + 1;
    perStatusMap[r.status] = (perStatusMap[r.status] || 0) + 1;

    let edu = "ไม่ระบุ";
    if (r.reporter_id) {
      const p = (profilesList || []).find((x) => x.id === r.reporter_id);
      if (p && p.education_level) edu = p.education_level;
    }
    perEduMap[edu] = (perEduMap[edu] || 0) + 1;
  });

  const perType = Object.keys(perTypeMap).map((k) => ({ name: k || "ไม่ระบุ", value: perTypeMap[k] }));
  setOverviewData({ perType, perStatus: perStatusMap, perEducation: perEduMap, total });
  }, []);

  /* ---------- compute filteredReports ---------- */
useEffect(() => {
  let list = [...reports];

  // date filter
  if (dateMode !== "all") {
    const now = new Date();
    let start = null;
    let end = null;
    if (dateMode === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start);
      end.setDate(end.getDate() + 1);
    } else if (dateMode === "week") {
      const day = now.getDay();
      start = new Date(now);
      start.setDate(now.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
    } else if (dateMode === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (dateMode === "year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
    } else if (dateMode === "range" && rangeStart && rangeEnd) {
      start = new Date(rangeStart);
      end = new Date(rangeEnd);
      end.setDate(end.getDate() + 1);
    }
    if (start && end) {
      list = list.filter((r) => {
        if (!r.created_at) return false;
        const created = new Date(r.created_at);
        return created >= start && created < end;
      });
    }
  }

  // type filter
  if (typeFilter !== "all") {
    list = list.filter((r) => r.issue_type === typeFilter);
  }

  // status filter
  if (statusFilter !== "all") {
    list = list.filter((r) => r.status === statusFilter);
  }

  // education filter
  if (eduFilter !== "all") {
    list = list.filter((r) => {
      if (!r.reporter_id) return eduFilter === "ไม่ระบุ";
      const p = profiles.find((x) => x.id === r.reporter_id);
      const edu = p?.education_level || "ไม่ระบุ";
      return edu === eduFilter;
    });
  }

  // search
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter((r) => {
      return (
        r.id?.toString().includes(q) ||
        (r.issue_type || "").toLowerCase().includes(q) ||
        (r.incident_details || "").toLowerCase().includes(q) ||
        (r.reporter_name || "").toLowerCase().includes(q)
      );
    });
  }

  setFilteredReports(list);
  buildOverview(list, profiles); // <-- นี่คือบรรทัดที่เพิ่มเข้ามาเพื่อสั่งให้คำนวณใหม่

}, [reports, profiles, searchQuery, typeFilter, statusFilter, eduFilter, dateMode, rangeStart, rangeEnd, buildOverview]); // <-- และเพิ่ม buildOverview ตรงนี้

  /* ---------- Reports actions: upload files, save edit, delete, edit users ---------- */
  const handleUploadFiles = async (reportId, files) => {
    const uploaded = [];
    for (const f of files) {
      const ext = f.name.split(".").pop();
      const path = `${reportId}/${Date.now()}_${uid()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(path, f, {
        cacheControl: "3600",
        upsert: false,
      });
      if (uploadError) {
        throw uploadError;
      }
      const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
      const url = publicData?.publicUrl || "";
      uploaded.push({
        name: f.name,
        url,
        path,
        uploaded_at: new Date().toISOString(),
      });
    }
    return uploaded;
  };

  const openEditReport = (report) => {
    setEditReport({
      ...report,
      status: report.status || "รับเรื่องแล้ว",
      new_note_text: "",
      admin_notes: Array.isArray(report.admin_notes)
        ? report.admin_notes
        : parseJsonSafe(report.admin_notes),
      solution_files: Array.isArray(report.solution_files)
        ? report.solution_files
        : parseJsonSafe(report.solution_files),
    });
    setShowEditReportModal(true);
  };

  const handleSaveReportEdit = async () => {
    if (!editReport) return;
    setEditReportLoading(true);
    try {
      // 1. จัดการไฟล์ที่อัปโหลดใหม่
      const filesToUpload = fileInputRef.current?.files || [];
      let uploadedFiles = [];
      if (filesToUpload.length > 0) {
        uploadedFiles = await handleUploadFiles(editReport.id, Array.from(filesToUpload));
      }

      // 2. จัดการ Note ที่เขียนใหม่
      const existingNotes = Array.isArray(editReport.admin_notes) ? editReport.admin_notes : parseJsonSafe(editReport.admin_notes);
      const newNotes = [...existingNotes];
      if (editReport.new_note_text?.trim()) {
        const { data: { user } } = await supabase.auth.getUser();
        newNotes.push({
          text: editReport.new_note_text.trim(),
          author_id: user?.id || null,
          created_at: new Date().toISOString(),
        });
      }

      // 3. รวมไฟล์เก่าและไฟล์ใหม่เข้าด้วยกัน
      const existingFiles = Array.isArray(editReport.solution_files) ? editReport.solution_files : parseJsonSafe(editReport.solution_files);
      const mergedFiles = [...existingFiles, ...uploadedFiles];

      // 4. เตรียมข้อมูลที่จะส่งไป Supabase
      const payload = {
        status: editReport.status,
        admin_notes: JSON.stringify(newNotes),
        solution_files: JSON.stringify(mergedFiles),
      };

      // 5. อัปเดตข้อมูลไปที่ Supabase และ "ขอข้อมูลที่อัปเดตแล้วกลับมาด้วย .select()"
      const { data, error: updateError } = await supabase
        .from("reports")
        .update(payload)
        .eq("id", editReport.id)
        .select(); // <-- เพิ่ม .select() เพื่อตรวจสอบผลลัพธ์

      if (updateError) throw updateError;

      // 6. "ตรวจสอบว่าการอัปเดตสำเร็จจริงหรือไม่" ถ้าไม่สำเร็จ ให้แจ้ง Error
      if (!data || data.length === 0) {
        throw new Error("การอัปเดตไม่สำเร็จ: ไม่พบข้อมูลให้แก้ไข หรืออาจติดสิทธิ์ Policy ของ Storage");
      }

      // 7. "อัปเดตข้อมูลบนหน้าเว็บด้วยตัวเอง" (วิธีนี้จะนุ่มนวลกว่า fetchAllData)
      const updatedReports = reports.map((r) =>
        r.id === editReport.id
          ? {
              ...r,
              status: editReport.status,
              admin_notes: newNotes,
              solution_files: mergedFiles,
            }
          : r
      );
      setReports(updatedReports);
      buildOverview(updatedReports, profiles);

      showMessage("อัปเดตเรื่องร้องเรียนสำเร็จ", "success");
      setShowEditReportModal(false);
      setEditReport(null);

    } catch (err) {
      console.error("save report edit error", err);
      showMessage(`ไม่สามารถอัปเดตได้: ${err.message}`, "error");
    } finally {
      setEditReportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    try {
      if (type === "report") {
        const { error } = await supabase.from("reports").delete().eq("id", id);
        if (error) throw error;
        setReports((p) => p.filter((r) => r.id !== id));
        showMessage("ลบรายงานสำเร็จ", "success");
      } else if (type === "user") {
        const { error } = await supabase.from("profiles").delete().eq("id", id);
        if (error) throw error;
        setProfiles((p) => p.filter((u) => u.id !== id));
        showMessage("ลบผู้ใช้สำเร็จ", "success");
      }
      setDeleteTarget(null);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("delete error", err);
      showMessage(`ไม่สามารถลบได้: ${err.message}`, "error");
    }
  };

  const openEditUser = (user) => {
    setEditUser({ ...user });
    setShowEditUserModal(true);
  };

  const handleSaveUserEdit = async () => {
    if (!editUser) return;
    setEditUserLoading(true);
    try {
      const payload = {
        full_name: editUser.full_name || null,
        phone_number: editUser.phone_number || null,
        education_level: editUser.education_level || null,
        prefix: editUser.prefix || null,
        student_id: editUser.student_id || null,
        role: editUser.role || null,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", editUser.id);
      if (error) throw error;
      setProfiles((p) => p.map((u) => (u.id === editUser.id ? { ...u, ...payload } : u)));
      if (typeof showMessage === "function") showMessage("บันทึกข้อมูลผู้ใช้สำเร็จ", "success");
      setShowEditUserModal(false);
    } catch (err) {
      console.error("save user error", err);
      if (typeof showMessage === "function") showMessage(`ไม่สามารถบันทึกได้: ${err.message}`, "error");
    } finally {
      setEditUserLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "รับเรื่องแล้ว":
        return { className: "bg-blue-100 text-blue-800", icon: "📥" };
      case "กำลังดำเนินการ":
        return { className: "bg-yellow-100 text-yellow-800", icon: "🔍" };
      case "แก้ไขเรียบร้อย":
        return { className: "bg-purple-100 text-purple-800", icon: "⚙️" };
      case "ปิดเรื่อง":
        return { className: "bg-green-100 text-green-800", icon: "✔️" };
      default:
        return { className: "bg-gray-100 text-gray-800", icon: "" };
    }
  };

  const computePieData = () => {
    const perType = overviewData.perType || [];
    const total = overviewData.total || 0;
    return perType.map((d) => ({
      name: d.name,
      value: d.value,
      percent: total ? Math.round((d.value / total) * 10000) / 100 : 0,
    }));
  };

  // --- วางโค้ดส่วนนี้เข้าไปเลยครับ ---
  const userBreakdown = React.useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return { admins: 0, byLevel: {} };
    }

    // จัดกลุ่มและนับจำนวนผู้ใช้
    const breakdown = profiles.reduce((acc, profile) => {
      if (profile.role === 'admin') {
        acc.admins = (acc.admins || 0) + 1;
      } else {
        const level = profile.education_level || 'ไม่ระบุ';
        acc.byLevel[level] = (acc.byLevel[level] || 0) + 1;
      }
      return acc;
    }, { admins: 0, byLevel: {} });

    return breakdown;
  }, [profiles]); // คำนวณใหม่เมื่อข้อมูล profiles เปลี่ยนแปลงเท่านั้น
  // --- สิ้นสุดส่วนที่ต้องวาง ---

  // -----------------------------
// AdminDashboard.jsx (4/5 + 5/5)
// UI layout (overview, reports table with expand, users table, add-user tab), modals, end of component
// -----------------------------

  /* ---------- Render loading / error (already handled earlier) ---------- */

  return (
    <div className="p-6 bg-gradient-to-b from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                } catch (e) {
                  console.warn("signOut err", e);
                }
                if (typeof setAdmin === "function") setAdmin(null);
                navigate("/admin-login");
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-full"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>ภาพรวม</TabButton>
            <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")}>จัดการเรื่องร้องเรียน</TabButton>
            <TabButton active={activeTab === "users"} onClick={() => setActiveTab("users")}>จัดการผู้ใช้</TabButton>
            <TabButton active={activeTab === "add-user"} onClick={() => setActiveTab("add-user")}>เพิ่มผู้ใช้</TabButton>
          </div>
        </div>

        {/* ---------- Overview ---------- */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <SummaryCard title="รายงานทั้งหมด" value={overviewData.total} subtitle="รวมทุกสถานะ" color="bg-blue-500 text-white" icon="📄" />
              <SummaryCard title="รับเรื่องแล้ว" value={overviewData.perStatus["รับเรื่องแล้ว"] || 0} subtitle="รอการดำเนินการ" color="bg-yellow-400 text-white" icon="📥" />
              <SummaryCard title="กำลังดำเนินการ" value={overviewData.perStatus["กำลังดำเนินการ"] || 0} subtitle="ระหว่างการตรวจสอบ" color="bg-purple-600 text-white" icon="🔍" />
              <SummaryCard title="ปิด/แก้ไขแล้ว" value={(overviewData.perStatus["แก้ไขเรียบร้อย"] || 0) + (overviewData.perStatus["ปิดเรื่อง"] || 0)} subtitle="เรื่องที่เสร็จสิ้น" color="bg-green-400 text-white" icon="✔️" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              
              {/* Card 1: ตัวกรอง (ภาพรวม) - ใช้พื้นที่ 4 ส่วน */}
              <div className="bg-white p-4 rounded-2xl shadow-md lg:col-span-4">
                <h4 className="font-semibold mb-2">ตัวกรอง (ภาพรวม)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">ประเภทปัญหา</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 bg-white">
                      <option value="all">ทั้งหมด</option>
                      {Array.from(new Set(reports.map((r) => r.issue_type))).filter(Boolean).sort((a, b) => { if (a === "อื่นๆ") return 1; if (b === "อื่นๆ") return -1; return a.localeCompare(b); }).map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">ชั้นปี</label>
                    <select value={eduFilter} onChange={(e) => setEduFilter(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 bg-white">
                      <option value="all">ทั้งหมด</option>
                      {EDUCATION_LEVELS_OVERVIEW.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">ช่วงเวลา</label>
                    <select value={dateMode} onChange={(e) => setDateMode(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 bg-white">
                      <option value="all">ทั้งหมด</option>
                      <option value="today">วันนี้</option>
                      <option value="week">สัปดาห์</option>
                      <option value="month">เดือนนี้</option>
                      <option value="year">ปีนี้</option>
                      <option value="range">ช่วงที่กำหนด</option>
                    </select>
                    {dateMode === "range" && (<div className="mt-2 grid grid-cols-2 gap-2"><input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="border px-3 py-2 rounded" /><input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="border px-3 py-2 rounded" /></div>)}
                  </div>
                </div>
              </div>

              {/* Card 2: กราฟวงกลม - ใช้พื้นที่ 5 ส่วน (กว้างขึ้น) */}
              <div className="bg-white p-4 rounded-2xl shadow-md lg:col-span-5">
                <h4 className="font-semibold mb-2">แยกตามประเภทปัญหา</h4>
                {/* แก้ไข: เพิ่ม paddingBottom เพื่อสร้างช่องว่างด้านล่าง */}
                <div style={{ width: "100%", height: 350, paddingBottom: '20px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={computePieData()} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100} label={(entry) => `${entry.percent}%`}>
                        {computePieData().map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                      </Pie>
                      <ReTooltip formatter={(value) => { const total = overviewData.total || 1; const percent = Math.round((value / total) * 10000) / 100; return [`${value} รายการ`, `${percent}%`]; }} />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 3: สรุปข้อมูลผู้ใช้ - ใช้พื้นที่ 3 ส่วน (แคบลง) */}
              <div className="bg-white p-4 rounded-2xl shadow-md lg:col-span-3">
                <h4 className="font-semibold mb-2 text-gray-800">สรุปข้อมูลผู้ใช้</h4>
                <div className="pb-3 border-b"><div className="text-xl font-bold text-blue-600">{profiles.length}</div><div className="text-sm text-gray-500">สมาชิกทั้งหมด</div></div>
                <div className="mt-3 space-y-2"><h5 className="text-sm font-semibold text-gray-600">แบ่งตามประเภท:</h5><ul className="text-sm text-gray-700 space-y-1 pl-2"><li className="flex justify-between"><span>ผู้ดูแลระบบ (Admin)</span><span className="font-semibold bg-purple-100 text-purple-800 px-2 rounded-full">{userBreakdown.admins} คน</span></li>{Object.entries(userBreakdown.byLevel).sort(([levelA], [levelB]) => levelA.localeCompare(levelB)).map(([level, count]) => (<li key={level} className="flex justify-between"><span>{level}</span><span className="font-semibold bg-blue-100 text-blue-800 px-2 rounded-full">{count} คน</span></li>))}</ul></div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-md">
              <h4 className="font-semibold mb-2">คำอธิบาย (สรุปเชิงตัวเลข)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold">สัดส่วนปัญหาตามประเภท</h5>
                  <ul className="mt-2 space-y-2">
                    {computePieData().map((d, idx) => (
                      <li key={d.name} className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <span style={{ width: 12, height: 12, background: COLORS[idx % COLORS.length] }} className="inline-block rounded" />
                          <span>{d.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">{d.value} รายการ — {d.percent}%</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold">สัดส่วนตามชั้นปี</h5>
                  <ul className="mt-2 space-y-2">
                    {Object.entries(overviewData.perEducation || {}).map(([k, v]) => {
                      const pct = overviewData.total ? Math.round((v / overviewData.total) * 10000) / 100 : 0;
                      return (
                        <li key={k} className="flex justify-between">
                          <div>{k}</div>
                          <div className="text-sm text-gray-600">{v} รายการ — {pct}%</div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ---------- Reports tab ---------- */}
        {activeTab === "reports" && (
          <>
            <div className="bg-white p-4 rounded-2xl shadow-md mb-4">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-sm text-gray-600">ค้นหา</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                      placeholder="ค้นหา ID, ประเภท, ข้อความ, ชื่อผู้แจ้ง..."
                    />
                    <button
                      onClick={() => {}}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      ค้นหา
                    </button>
                  </div>
                </div>

                <div className="w-48">
                  <label className="text-sm text-gray-600">ประเภท</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full border px-3 py-2 rounded bg-white">
                    <option value="all">ทั้งหมด</option>
                    {Array.from(new Set(reports.map((r) => r.issue_type)))
                      .filter(Boolean)
                      .sort((a, b) => {
                        if (a === "อื่นๆ") return 1; // "อื่นๆ" ควรไปอยู่ท้ายสุด
                        if (b === "อื่นๆ") return -1; // "อื่นๆ" ควรไปอยู่ท้ายสุด
                        return a.localeCompare(b); // ที่เหลือให้เรียงตามตัวอักษรไทย
                      })
                      .map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                  </select>
                </div>

                <div className="w-48">
                  <label className="text-sm text-gray-600">ชั้นปี</label>
                  <select value={eduFilter} onChange={(e) => setEduFilter(e.target.value)} className="w-full border px-3 py-2 rounded bg-white">
                    <option value="all">ทั้งหมด</option>
                    {EDUCATION_LEVELS_OVERVIEW.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md overflow-auto">
              {/* --- 1. แก้ไข table-auto เป็น table-fixed --- */}
              <table className="min-w-full table-fixed">
                <thead>
                  <tr className="text-left bg-gray-50">
                    {/* แก้ไขสัดส่วนความกว้างคอลัมน์ทั้งหมด */}
                    <th className="p-2" style={{ width: "5%" }}>ID</th>
                    <th className="p-2" style={{ width: "12%" }}>วันที่แจ้ง</th>
                    <th className="p-2" style={{ width: "17%" }}>ประเภท</th>
                    <th className="p-2" style={{ width: "18%" }}>สถานที่</th>
                    <th className="p-2" style={{ width: "15%" }}>สถานะ</th>
                    <th className="p-2" style={{ width: "15%" }}>ผู้แจ้ง</th>
                    <th className="p-2 text-center" style={{ width: "18%" }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => {
                    const badge = getStatusBadge(r.status);
                    const isExpanded = expandedReportId === r.id;
                    return (
                      <React.Fragment key={r.id}>
                        <tr className="border-t hover:bg-gray-50">
                          {/* แก้ไข: เพิ่ม text-sm เพื่อลดขนาดตัวอักษร */}
                          <td className="p-2 text-sm">{r.id}</td>
                          <td className="p-2 text-sm">{fmtDate(r.created_at)}</td>
                          <td className="p-2 text-sm truncate">{r.issue_type}</td>
                          <td className="p-2 text-sm truncate">{r.incident_location}</td>
                          {/* ส่วนนี้ถูกต้องแล้ว ไม่ต้องแก้ */}
                          <td className="p-2">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${badge.className}`}>
                              <span>{badge.icon}</span>
                              <span>{r.status}</span>
                            </span>
                          </td>
                          <td className="p-2 truncate">
                            <div className="text-sm">{r.reporter_name || "ไม่ระบุ"}</div>
                            <div className="text-xs text-gray-500">{r.reporter_phone || ""}</div>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button onClick={() => openEditReport(r)} className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 text-sm">แก้ไข</button>
                              <button onClick={() => { setDeleteTarget({ type: "report", id: r.id }); setShowDeleteModal(true); }} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm">ลบ</button>
                              <button onClick={() => setExpandedReportId(isExpanded ? null : r.id)} className="bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300 text-sm whitespace-nowrap">
                                {isExpanded ? "ย่อ" : "รายละเอียด"}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="p-4 text-sm text-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold">รายละเอียดเหตุการณ์</h4>
                                  <p className="mt-2 whitespace-pre-wrap break-words">{r.incident_details || "-"}</p>
                                  <div className="mt-3">
                                    <strong>วันที่เกิดเหตุ:</strong> {r.incident_date || "-"} {r.incident_time || ""}
                                  </div>
                                  <div className="mt-2">
                                    <strong>ไฟล์แนบ (จากผู้แจ้ง):</strong>
                                    <ul className="mt-2">
                                      {r.attachment_url ? (
                                        <li><a href={r.attachment_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">ดูไฟล์แนบ</a></li>
                                      ) : <li className="text-gray-500">ไม่มีไฟล์</li>}
                                    </ul>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold">ข้อมูลการรายงาน</h4>
                                  <div className="mt-2"><strong>ชื่อผู้แจ้ง:</strong> {r.reporter_name || "ไม่ระบุ"}</div>
                                  <div className="mt-1"><strong>โทร:</strong> {r.reporter_phone || "-"}</div>
                                  <div className="mt-1"><strong>สถานะ:</strong> <span className={`ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge.className}`}>{badge.icon} {r.status}</span></div>
                                  <div className="mt-3">
                                    <strong>หมายเหตุจากแอดมิน:</strong>
                                    <ul className="mt-2">
                                      {(r.admin_notes || []).length === 0 && <li className="text-gray-500">ไม่มีหมายเหตุ</li>}
                                      {(r.admin_notes || []).map((n, i) => (
                                        <li key={i} className="mb-2">
                                          <div className="text-sm break-words">{n.text}</div>
                                          <div className="text-xs text-gray-400">{n.created_at ? fmtDate(n.created_at) : ""}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="mt-3">
                                    <strong>ไฟล์แนวทาง/แนวปฏิบัติ:</strong>
                                    <ul className="mt-2">
                                      {(r.solution_files || []).length === 0 && <li className="text-gray-500">ไม่มีไฟล์</li>}
                                      {(r.solution_files || []).map((f, idx) => (
                                        <li key={idx}><a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">{f.name}</a></li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {filteredReports.length === 0 && <div className="p-6 text-gray-500">ไม่พบรายการ</div>}
            </div>
          </>
        )}

        {/* ---------- Users Tab ---------- */}
        {activeTab === "users" && (
          <>
            <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 flex gap-2">
              <button className={`px-4 py-2 rounded ${usersSubtab === "users" ? "bg-blue-600 text-white" : "bg-white"}`} onClick={() => setUsersSubtab("users")}>Users</button>
              <button className={`px-4 py-2 rounded ${usersSubtab === "admins" ? "bg-blue-600 text-white" : "bg-white"}`} onClick={() => setUsersSubtab("admins")}>Admins</button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md overflow-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left bg-gray-50">
                    <th className="p-2">ID</th>
                    <th className="p-2">ชื่อ-นามสกุล</th>
                    <th className="p-2">ระดับการศึกษา</th>
                    <th className="p-2">รหัสประจำตัว</th>
                    <th className="p-2">บทบาท</th>
                    <th className="p-2">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.filter((p) => (usersSubtab === "users" ? p.role !== "admin" : p.role === "admin")).map((u) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{u.id}</td>
                      <td className="p-2">{u.full_name || "ไม่ระบุ"}</td>
                      <td className="p-2">{u.education_level || "ไม่ระบุ"}</td>
                      <td className="p-2">{u.student_id || "-"}</td>
                      <td className="p-2">{u.role || "user"}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button className="bg-yellow-500 text-white px-3 py-1 rounded" onClick={() => openEditUser(u)}>แก้ไข</button>
                          <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => { setDeleteTarget({ type: "user", id: u.id }); setShowDeleteModal(true); }}>ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ---------- Add user tab ---------- */}
        {activeTab === "add-user" && (
          <div className="mt-4">
            <AddAccountForm type="user" supabase={supabase} showMessage={showMessage} onAdded={() => fetchAllData()} />
          </div>
        )}

        {/* ---------- Delete modal ---------- */}
        {showDeleteModal && (
          <Modal title="ยืนยันการลบ" onClose={() => setShowDeleteModal(false)}>
            <p>คุณแน่ใจหรือไม่ที่จะลบ {deleteTarget?.type} id: {deleteTarget?.id} ?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded bg-gray-200">ยกเลิก</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-500 text-white">ลบ</button>
            </div>
          </Modal>
        )}

        {/* Edit report modal */}
        {showEditReportModal && editReport && (
          <Modal title={`แก้ไขเรื่องร้องเรียน #${editReport.id}`} onClose={() => { setShowEditReportModal(false); setEditReport(null); }}>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">สถานะ</label>
                <select
                  className="w-full border px-3 py-2 rounded"
                  value={editReport.status}
                  onChange={(e) => setEditReport((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="รับเรื่องแล้ว">รับเรื่องแล้ว</option>
                  <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                  <option value="แก้ไขเรียบร้อย">แก้ไขเรียบร้อย</option>
                  <option value="ปิดเรื่อง">ปิดเรื่อง</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">เพิ่มหมายเหตุ (note)</label>
                <textarea className="w-full border px-3 py-2 rounded" value={editReport.new_note_text || ""} onChange={(e) => setEditReport((p) => ({ ...p, new_note_text: e.target.value }))} />
              </div>

              <div>
                <label className="text-sm text-gray-600">ไฟล์แนบ (แนบได้หลายไฟล์)</label>
                <input ref={fileInputRef} type="file" multiple />
                <div className="mt-2">
                  <strong>ไฟล์ที่มีอยู่:</strong>
                  <ul className="mt-2">
                    {(editReport.solution_files || []).map((f, i) => (
                      <li key={i}>
                        <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{f.name}</a> <span className="text-xs text-gray-500">({fmtDate(f.uploaded_at)})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowEditReportModal(false); setEditReport(null); }} className="px-4 py-2 rounded bg-gray-200">ยกเลิก</button>
                <button onClick={handleSaveReportEdit} className="px-4 py-2 rounded bg-blue-600 text-white">{editReportLoading ? "กำลังบันทึก..." : "บันทึก"}</button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit user modal */}
        {showEditUserModal && editUser && (
          <Modal title={`แก้ไขผู้ใช้: ${editUser.full_name || editUser.id}`} onClose={() => setShowEditUserModal(false)}>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">ชื่อ-นามสกุล</label>
                <input value={editUser.full_name || ""} onChange={(e) => setEditUser((p) => ({ ...p, full_name: e.target.value }))} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-600">เบอร์โทรศัพท์</label>
                <input value={editUser.phone_number || ""} onChange={(e) => setEditUser((p) => ({ ...p, phone_number: e.target.value }))} className="w-full border px-3 py-2 rounded" />
              </div>
              <div>
                <label className="text-sm text-gray-600">ระดับการศึกษา</label>
                <select value={editUser.education_level || ""} onChange={(e) => setEditUser((p) => ({ ...p, education_level: e.target.value }))} className="w-full border px-3 py-2 rounded">
                  <option value="">ไม่ระบุ</option>
                  <option>ปวช.1</option>
                  <option>ปวช.2</option>
                  <option>ปวช.3</option>
                  <option>ปวส.1</option>
                  <option>ปวส.2</option>
                  <option>ปริญญาตรี</option>
                  <option>ปริญญาโท</option>
                  <option>ปริญญาเอก</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">บทบาท</label>
                <select value={editUser.role || "user"} onChange={(e) => setEditUser((p) => ({ ...p, role: e.target.value }))} className="w-full border px-3 py-2 rounded">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setShowEditUserModal(false)} className="px-4 py-2 rounded bg-gray-200">ยกเลิก</button>
                <button onClick={handleSaveUserEdit} className="px-4 py-2 rounded bg-blue-600 text-white">{editUserLoading ? "กำลังบันทึก..." : "บันทึก"}</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
} // <-- end AdminDashboard function

/* ---------- Helpful notes (do not include inline comments in JSX) ---------- */

/*
  Supabase Row Level Security (RLS) notes — ปัญหาที่มักเจอเมื่อ client INSERT/UPDATE profiles:

  ถ้าเจอข้อผิดพลาด:
    "new row violates row-level security policy for table 'profiles'"

  สาเหตุ: บนตาราง profiles เปิด RLS ไว้ แต่ยังไม่มี Policy อนุญาตให้ผู้ใช้ client ทำ INSERT/UPDATE

  ตัวอย่าง Policy ที่แนะนำ (เบื้องต้น)
  1) Allow insert for authenticated users (แต่ต้องแน่ใจว่าต้องการให้ user สร้าง profile ของตัวเองเท่านั้น)
     SQL (ตัวอย่าง) สำหรับ INSERT:
     ---------------------------------------------------
     CREATE POLICY "Allow insert own profile" ON public.profiles
       FOR INSERT
       WITH CHECK ( auth.uid() = new.id );
     ---------------------------------------------------
     - WITH CHECK (auth.uid() = new.id) หมายถึง ต้อง match id ที่ client ใส่กับ auth.uid() (ป้องกัน insert profile แทนคนอื่น)

  2) Allow update of own profile:
     ---------------------------------------------------
     CREATE POLICY "Allow update own profile" ON public.profiles
       FOR UPDATE
       USING ( auth.uid() = id );
     ---------------------------------------------------

  3) If you want a more permissive dev policy (NOT recommended for production), you can:
     - Temporarily turn off RLS (Table editor -> Policies -> toggle off)
     - Or create a policy USING (true) WITH CHECK (true)

  4) If you want the app to create profiles on behalf of users (admin creating many accounts),
     you should perform inserts server-side using the Supabase service_role (secret) in a trusted environment or via RPC.

  Storage:
   - Make sure bucket 'solutions' exists and is set to public if you want public URLs from getPublicUrl()
   - If bucket is private, you must generate signed URLs for downloads.

  Final checklist if add-user fails:
   - Ensure auth.signUp succeeded (check returned data)
   - Ensure profiles.insert policy allows INSERT for that auth user (or server-side)
   - Inspect Supabase response error (it normally contains policy violation message)
*/

