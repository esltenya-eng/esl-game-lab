
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
  limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { GameDetail, CatalogGame } from '../types';

const COLLECTION_NAME = "catalog_games";

const generateId = (title: string) => {
  return title.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
};

export const upsertCatalogGame = async (game: GameDetail, source: 'generated' | 'internal' = 'generated') => {
  const id = generateId(game.game_title);
  const docRef = doc(db, COLLECTION_NAME, id);
  
  // Extract season if possible
  const lowerTitle = game.game_title.toLowerCase();
  let season = "";
  if (lowerTitle.includes("christmas")) season = "christmas";
  else if (lowerTitle.includes("halloween")) season = "halloween";
  else if (lowerTitle.includes("easter")) season = "easter";
  else if (lowerTitle.includes("summer")) season = "summer";
  else if (lowerTitle.includes("winter")) season = "winter";

  const data = {
    ...game,
    id,
    source,
    season,
    updatedAt: serverTimestamp(),
  };

  // Check if exists to preserve createdAt
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    (data as any).createdAt = serverTimestamp();
  }

  await setDoc(docRef, data, { merge: true });
  return id;
};

export const fetchAllCatalogGames = async () => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as CatalogGame);
};

export const getGamesWithoutImages = async (max: number = 20) => {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("imageUrl", "==", null), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as CatalogGame);
};

export const updateGameImage = async (id: string, imageUrl: string) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await setDoc(docRef, { imageUrl, updatedAt: serverTimestamp() }, { merge: true });
};
