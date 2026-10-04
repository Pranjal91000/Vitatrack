
import { create } from 'zustand';
import { format } from 'date-fns';

interface DateState {
    currentDate: string; // YYYY-MM-DD
    setDate: (date: Date | string) => void;
}

export const useDateStore = create<DateState>((set) => ({
    currentDate: format(new Date(), 'yyyy-MM-dd'),
    setDate: (date) => set({
        currentDate: typeof date === 'string' ? date : format(date, 'yyyy-MM-dd')
    }),
}));
