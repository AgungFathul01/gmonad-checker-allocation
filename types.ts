
export interface AllocationData {
  address: string;
  amount: number;
}

export type SearchStatus = 'idle' | 'searching' | 'found' | 'not-found' | 'error';
