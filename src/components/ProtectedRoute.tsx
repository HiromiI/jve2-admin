import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="rounded-3xl bg-white px-8 py-6 text-base font-semibold text-slate-700 shadow-panel">
          Carregando...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (user?.role === 'professor') {
    const { pathname } = location;

    if (pathname === '/dashboard') {
      return <Navigate to="/courses" replace />;
    }

    if (pathname === '/courses' || /^\/courses\/\d+\/subjects$/.test(pathname)) {
      return <Outlet />;
    }

    const questionsMatch = pathname.match(/^\/courses\/(\d+)\/subjects\/(\d+)\/questions$/);

    if (questionsMatch) {
      const courseId = questionsMatch[1];
      const subjectId = Number(questionsMatch[2]);

      if (user.subjectIds.includes(subjectId)) {
        return <Outlet />;
      }

      return <Navigate to={`/courses/${courseId}/subjects`} replace />;
    }

    const nestedCourseMatch = pathname.match(/^\/courses\/(\d+)\//);

    if (nestedCourseMatch) {
      return <Navigate to={`/courses/${nestedCourseMatch[1]}/subjects`} replace />;
    }

    return <Navigate to="/courses" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
