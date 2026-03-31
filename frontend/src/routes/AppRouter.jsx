import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import StudentDashboard from "../pages/student/StudentDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import QuestionManager from "../pages/admin/QuestionManager";
import ExamManager from "../pages/admin/ExamManager";
import UserManager from "../pages/admin/UserManager";
import ExamInstructions from "../pages/student/ExamInstructions";
import ExamPage from "../pages/student/ExamPage";
import ResultPage from "../pages/student/ResultPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/exam/:examId/instructions" element={<ExamInstructions />} />
          <Route path="/student/exam/:examId" element={<ExamPage />} />
          <Route path="/student/result" element={<ResultPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/questions" element={<QuestionManager />} />
          <Route path="/admin/exams" element={<ExamManager />} />
          <Route path="/admin/users" element={<UserManager />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
