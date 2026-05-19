import { useEffect, useState } from 'react';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  {
    label: 'Bancas',
    path: '/boards',
  },
  {
    label: 'Cargos',
    path: '/roles',
  },
  {
    label: 'Cursos',
    path: '/courses',
  },
  {
    label: 'Instituições',
    path: '/institutions',
  },
  {
    label: 'Níveis de Escolaridade',
    path: '/educational_levels',
  },
  {
    label: 'Usuários',
    path: '/users',
  },
];

const roleLabels = {
  admin: 'Administrador',
  student: 'Estudante',
  professor: 'Professor',
} as const;

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const visibleMenuItems = user?.role === 'professor' ? menuItems.filter((item) => item.path === '/courses') : menuItems;

  const showBackToCoursesButton = /^\/courses\/\d+\/subjects$/.test(location.pathname);
  const skillsMatch = location.pathname.match(/^\/courses\/(\d+)\/subjects\/(\d+)\/skills$/);
  const questionsMatch = location.pathname.match(/^\/courses\/(\d+)\/subjects\/(\d+)\/questions$/);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100/70">
      {isMenuOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setIsMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/30"
        />
      ) : null}

      <aside
        className={[
          'fixed left-0 top-0 z-50 flex h-full w-80 max-w-[88vw] flex-col bg-slate-900 px-5 py-6 text-white shadow-2xl transition-transform duration-200',
          isMenuOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex items-center justify-center rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
          >
            <FiArrowLeft size={20} />
          </button>
        </div>

        <div className="mt-6 border-b border-white/10 pb-6">
          <p className="text-2xl font-bold text-white">{user?.name ?? ''}</p>
          <p className="mt-2 text-sm font-medium text-slate-300">
            {user ? roleLabels[user.role] : ''}
          </p>
        </div>

        <nav className="mt-6 flex-1">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'block rounded-2xl px-4 py-3 text-sm font-semibold transition',
                      isActive ? 'bg-brand-600 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Sair
        </button>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-panel transition hover:bg-slate-50"
            >
              <FiMenu size={18} />
              Menu
            </button>

            {showBackToCoursesButton || skillsMatch || questionsMatch ? (
              <button
                type="button"
                onClick={() => {
                  if (skillsMatch) {
                    navigate(`/courses/${skillsMatch[1]}/subjects`);
                    return;
                  }

                  if (questionsMatch) {
                    navigate(`/courses/${questionsMatch[1]}/subjects`);
                    return;
                  }

                  navigate('/courses');
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-panel transition hover:bg-slate-50"
              >
                <FiArrowLeft size={18} />
                Voltar
              </button>
            ) : null}
          </div>
        </header>

        <main className="flex-1 overflow-hidden px-4 pb-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
