import { useState, useEffect, useCallback, useRef } from 'react';
import { CLUBS as INITIAL_CLUBS, NEXT_ID } from '../data/clubs';
import { ARSIV as INITIAL_ARSIV, NEXT_ARSIV_ID } from '../data/archive';

const LS_CLUBS = 'nexus-clubs';
const LS_DATA = 'nexus-data';
const LS_PHOTO_PREFIX = 'nexus-photo-';

function loadInitialClubs() {
  try {
    const raw = localStorage.getItem(LS_CLUBS);
    if (!raw) return INITIAL_CLUBS;
    const saved = JSON.parse(raw);
    return INITIAL_CLUBS.map((c) => {
      const sc = saved.find((x) => x.id === c.id);
      if (!sc) return c;
      return {
        ...c,
        score: sc.score ?? c.score,
        uye: sc.uye ?? c.uye,
        etkinlik: sc.etkinlik ?? c.etkinlik,
        baskan: sc.baskan || c.baskan,
        danisman: sc.danisman || c.danisman,
        danismanMail: sc.danismanMail || c.danismanMail,
        kurulusYili: sc.kurulusYili || c.kurulusYili,
        fakulte: sc.fakulte || c.fakulte,
        kacinciBaskan: sc.kacinciBaskan || c.kacinciBaskan,
      };
    });
  } catch {
    return INITIAL_CLUBS;
  }
}

function loadInitialExtra() {
  try {
    const raw = localStorage.getItem(LS_DATA);
    if (!raw) return { budgets: [], arsiv: INITIAL_ARSIV, events: [], nextId: NEXT_ID, nextArsivId: NEXT_ARSIV_ID };
    const d = JSON.parse(raw);
    return {
      budgets: d.BUDGETS || [],
      arsiv: d.ARSIV || INITIAL_ARSIV,
      events: d.EVENTS || [],
      nextId: d.nextId || NEXT_ID,
      nextArsivId: d.nextArsivId || NEXT_ARSIV_ID,
    };
  } catch {
    return { budgets: [], arsiv: INITIAL_ARSIV, events: [], nextId: NEXT_ID, nextArsivId: NEXT_ARSIV_ID };
  }
}

function loadPhotos() {
  const photos = {};
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(LS_PHOTO_PREFIX))
      .forEach((k) => {
        const id = k.replace(LS_PHOTO_PREFIX, '');
        photos[id] = localStorage.getItem(k);
      });
  } catch {
    /* ilk açılış */
  }
  return photos;
}

export function useNexusStore() {
  const [clubs, setClubs] = useState(loadInitialClubs);
  const extraInit = useRef(loadInitialExtra()).current;
  const [budgets, setBudgets] = useState(extraInit.budgets);
  const [arsiv, setArsiv] = useState(extraInit.arsiv);
  const [events, setEvents] = useState(extraInit.events);
  const [nextId, setNextId] = useState(extraInit.nextId);
  const [nextArsivId, setNextArsivId] = useState(extraInit.nextArsivId);
  const [photos, setPhotos] = useState(loadPhotos);

  // Persist clubs
  useEffect(() => {
    try {
      localStorage.setItem(LS_CLUBS, JSON.stringify(clubs));
    } catch (e) {
      console.error('CLUBS kayıt hatası:', e);
    }
  }, [clubs]);

  // Persist rest
  useEffect(() => {
    try {
      localStorage.setItem(LS_DATA, JSON.stringify({ BUDGETS: budgets, ARSIV: arsiv, EVENTS: events, nextId, nextArsivId }));
    } catch (e) {
      console.warn('Storage kayıt hatası:', e);
    }
  }, [budgets, arsiv, events, nextId, nextArsivId]);

  const setClubPhoto = useCallback((id, dataUrl) => {
    setPhotos((prev) => ({ ...prev, [id]: dataUrl }));
    try {
      localStorage.setItem(LS_PHOTO_PREFIX + id, dataUrl);
    } catch (e) {
      console.warn('Fotoğraf kaydedilemedi id=' + id, e);
    }
  }, []);

  const addClub = useCallback(
    (data) => {
      setClubs((prev) => [...prev, { id: nextId, etkinlik: 0, ...data }]);
      setBudgets((prev) => [...prev, { id: nextId, tahsis: 10000, harcanan: 0 }]);
      setNextId((n) => n + 1);
    },
    [nextId]
  );

  const deleteClub = useCallback((id) => {
    setClubs((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const updateClub = useCallback((id, patch) => {
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const addArsivRecord = useCallback(
    (rec) => {
      setArsiv((prev) => [...prev, { id: nextArsivId, ...rec }]);
      setNextArsivId((n) => n + 1);
    },
    [nextArsivId]
  );

  const deleteArsivRecord = useCallback((id) => {
    setArsiv((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addEvents = useCallback((newEvents) => {
    setEvents((prev) => [...prev, ...newEvents]);
  }, []);

  const removeEvent = useCallback((predicate) => {
    setEvents((prev) => prev.filter((e) => !predicate(e)));
  }, []);

  return {
    clubs, setClubs, addClub, deleteClub, updateClub,
    budgets, setBudgets,
    arsiv, setArsiv, addArsivRecord, deleteArsivRecord,
    events, setEvents, addEvents, removeEvent,
    photos, setClubPhoto,
    nextId, nextArsivId,
  };
}
