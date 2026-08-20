
import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { GameDetail, CatalogGame } from '../types';

const COLLECTION_NAME = "catalog_games";

const generateId = (title: string) => {
  return title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
};

// Fetch a single game by its slug id. Returns null on miss or Firestore error.
export const getGameById = async (id: string): Promise<CatalogGame | null> => {
  try {
    const snap = await getDoc(doc(db, COLLECTION_NAME, id));
    return snap.exists() ? (snap.data() as CatalogGame) : null;
  } catch {
    return null;
  }
};

// First-writer-wins persistence. Tries baseId, then baseId-2, baseId-3, ... up to 10.
// Uses a Firestore transaction on each slot so two concurrent writes cannot both claim the same id.
// Returns the id actually stored, or null if all slots were taken or a Firestore error occurred.
export const persistGameDetail = async (
  game: GameDetail,
  source: 'generated' | 'internal' = 'generated'
): Promise<string | null> => {
  const baseId = generateId(game.game_title);

  const lowerTitle = game.game_title.toLowerCase();
  let season = '';
  if (lowerTitle.includes('christmas')) season = 'christmas';
  else if (lowerTitle.includes('halloween')) season = 'halloween';
  else if (lowerTitle.includes('easter')) season = 'easter';
  else if (lowerTitle.includes('summer')) season = 'summer';
  else if (lowerTitle.includes('winter')) season = 'winter';

  for (let attempt = 1; attempt <= 10; attempt++) {
    const candidateId = attempt === 1 ? baseId : `${baseId}-${attempt}`;
    const docRef = doc(db, COLLECTION_NAME, candidateId);

    let stored = false;
    try {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(docRef);
        if (snap.exists()) return; // slot taken; commit an empty transaction and loop
        transaction.set(docRef, {
          ...game,
          id: candidateId,
          source,
          season,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        stored = true;
      });
    } catch {
      return null; // real Firestore error — fail gracefully
    }

    if (stored) return candidateId;
    // else: slot was taken by another writer; try next suffix
  }

  return null; // all 10 slots taken (not expected in practice)
};

export const fetchAllCatalogGames = async () => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as CatalogGame);
};

export const getGamesWithoutImages = async (max: number = 20) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("imageUrl", "==", null), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as CatalogGame);
};

export const updateGameImage = async (id: string, imageUrl: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, { imageUrl, updatedAt: serverTimestamp() }, { merge: true });
};
