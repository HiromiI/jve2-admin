import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import BoardsPage from './pages/Boards';
import CoursesPage from './pages/Courses';
import EducationalLevelsPage from './pages/EducationalLevels';
import InstitutionsPage from './pages/Institutions';
import LoginPage from './pages/Login';
import QuestionsPage from './pages/Questions';
import RolesPage from './pages/Roles';
import SkillsPage from './pages/Skills';
import SubjectsPage from './pages/Subjects';
import UsersPage from './pages/Users';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Navigate to="/courses" replace />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/courses/:courseId/subjects" element={<SubjectsPage />} />
          <Route path="/courses/:courseId/subjects/:subjectId/questions" element={<QuestionsPage />} />
          <Route path="/courses/:courseId/subjects/:subjectId/skills" element={<SkillsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/educational_levels" element={<EducationalLevelsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/courses" replace />} />
    </Routes>
  );
}

export default App;
