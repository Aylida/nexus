import { useState } from 'react';
import Login from './components/Login';
import Nav from './components/Nav';
import ClashWarning from './components/ClashWarning';
import HeroOrbit from './components/HeroOrbit';
import SidebarNav from './components/SidebarNav';
import AdminBar from './components/AdminBar';
import ChatWidget from './components/ChatWidget';
import HealthPanel from './components/panels/HealthPanel';
import CalendarPanel from './components/panels/CalendarPanel';
import StatsPanel from './components/panels/StatsPanel';
import ArchivePanel from './components/panels/ArchivePanel';
import AssistantPanel from './components/panels/AssistantPanel';
import { ClubDetailModal, EditClubInfoModal } from './components/modals/ClubModals';
import AddClubModal from './components/modals/AddClubModal';
import DeleteClubModal from './components/modals/DeleteClubModal';
import { useNexusStore } from './hooks/useNexusStore';
import { useToast, ToastContainer } from './hooks/useToast';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('saglik');
  const [clubDetailId, setClubDetailId] = useState(null);
  const [editingClubId, setEditingClubId] = useState(null);
  const [showAddClub, setShowAddClub] = useState(false);
  const [deletingClub, setDeletingClub] = useState(null);

  const store = useNexusStore();
  const { toasts, notify } = useToast();

  if (!loggedIn) {
    return <Login onSuccess={() => setLoggedIn(true)} />;
  }

  function handleLogout() {
    setLoggedIn(false);
    setIsAdmin(false);
  }

  function handleOpenArchiveFromOther() {
    setActiveTab('arsiv');
  }

  const clubDetail = clubDetailId ? store.clubs.find((c) => c.id === clubDetailId) : null;
  const editingClub = editingClubId ? store.clubs.find((c) => c.id === editingClubId) : null;

  return (
    <>
      <Nav isAdmin={isAdmin} onLogout={handleLogout} />
      <ClashWarning events={store.events} />
      <HeroOrbit clubs={store.clubs} events={store.events} photos={store.photos} />

      <section id="panels-section" className={isAdmin ? 'admin-mode' : ''}>
        <SidebarNav
          active={activeTab}
          onChange={setActiveTab}
          arsivCount={store.arsiv.length}
          clashCount={store.events.filter((e) => e.cl).length}
        />
        <div className="panels-main">
          {activeTab === 'saglik' && (
            <HealthPanel clubs={store.clubs} photos={store.photos} onOpenClub={setClubDetailId} />
          )}
          {activeTab === 'takvim' && (
            <CalendarPanel
              clubs={store.clubs}
              events={store.events}
              addEvents={store.addEvents}
              isAdmin={isAdmin}
              notify={notify}
            />
          )}
          {activeTab === 'istatistik' && <StatsPanel clubs={store.clubs} />}
          {activeTab === 'arsiv' && (
            <ArchivePanel
              clubs={store.clubs}
              arsiv={store.arsiv}
              addArsivRecord={store.addArsivRecord}
              deleteArsivRecord={store.deleteArsivRecord}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'asistan' && (
            <AssistantPanel
              clubs={store.clubs}
              arsiv={store.arsiv}
              addEvents={store.addEvents}
              notify={notify}
              onOpenArchive={handleOpenArchiveFromOther}
            />
          )}
        </div>
      </section>

      {isAdmin && (
        <AdminBar
          clubs={store.clubs}
          photos={store.photos}
          setClubPhoto={store.setClubPhoto}
          onAddClub={() => setShowAddClub(true)}
          onDeleteClub={setDeletingClub}
        />
      )}

      <button id="admin-toggle" className={isAdmin ? 'active' : ''} onClick={() => setIsAdmin((v) => !v)} title="Admin modu">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-1a6 6 0 0 1 12 0v1" /><line x1="19" y1="11" x2="19" y2="17" /><line x1="16" y1="14" x2="22" y2="14" /></svg>
      </button>

      <ChatWidget
        clubs={store.clubs}
        arsiv={store.arsiv}
        onOpenArchive={handleOpenArchiveFromOther}
        onGoToAssistant={() => setActiveTab('asistan')}
      />

      <ClubDetailModal
        club={clubDetail}
        photos={store.photos}
        onClose={() => setClubDetailId(null)}
        onEdit={() => { setEditingClubId(clubDetailId); setClubDetailId(null); }}
      />
      <EditClubInfoModal
        club={editingClub}
        onCancel={() => setEditingClubId(null)}
        onConfirm={(id, patch) => { store.updateClub(id, patch); setEditingClubId(null); }}
      />
      {showAddClub && (
        <AddClubModal
          onCancel={() => setShowAddClub(false)}
          onConfirm={(data) => { store.addClub(data); setShowAddClub(false); }}
        />
      )}
      <DeleteClubModal
        club={deletingClub}
        onCancel={() => setDeletingClub(null)}
        onConfirm={(id) => { store.deleteClub(id); setDeletingClub(null); }}
      />

      <ToastContainer toasts={toasts} />
    </>
  );
}
