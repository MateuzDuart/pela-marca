import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import Profile from './pages/profile';
import PeladaPage from './pages/pelada';
import ManagerPeladasPage from './pages/manager';
import CreatePelada from './pages/createPelada';
import InvitePage from './pages/invite';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/peladas" element={<ManagerPeladasPage />} />
      <Route path="/pelada/criar" element={<CreatePelada />} />
      <Route path="/pelada/:id" element={<PeladaPage />} />
      <Route path="/convite/:id" element={<InvitePage />} />
    </Routes>
  );
}
