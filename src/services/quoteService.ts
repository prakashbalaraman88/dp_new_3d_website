import { db } from '../config/firebase';
import { collection, addDoc, getDocs, Timestamp, query, orderBy } from 'firebase/firestore';
import { MaterialSelection } from '../utils/pdfGenerator';
import { MaterialOption } from '../data/calculatorConfig';

export interface SavedQuote {
    id?: string;
    clientName: string;
    builtUpArea: number;
    tier: string;
    totalCost: number;
    perSqFtCost: number;
    timestamp: Timestamp;
    selections: MaterialSelection[]; // For PDF generation (flattened)
    rawSelections?: Record<string, MaterialOption>; // For restoring calculator execution state
    totalLumpSum?: number;
    compoundWallCost?: number;
}

const COLLECTION_NAME = 'quotes';

export const saveQuote = async (data: Omit<SavedQuote, 'id' | 'timestamp'>) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            timestamp: Timestamp.now()
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getQuotes = async (): Promise<SavedQuote[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavedQuote));
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};
