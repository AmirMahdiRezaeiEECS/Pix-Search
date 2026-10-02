import { MeiliSearch } from 'meilisearch';

export const client = new MeiliSearch({
  host: 'https://ms-66464012cf08-103.fra.meilisearch.io',
  apiKey: '728b5f114a7604e32c0e4b0f2d728f15df9e479f8a76115aaaa26ce737d9b518',
});

export const imagesIndex = client.index('images');

export interface ImageDocument {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface SearchFilters {
  formats?: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minSize?: number;
  maxSize?: number;
}

export const buildFilterString = (filters: SearchFilters): string => {
  const filterParts: string[] = [];

  if (filters.formats && filters.formats.length > 0) {
    const formatFilters = filters.formats.map(f => `format = "${f}"`).join(' OR ');
    filterParts.push(`(${formatFilters})`);
  }

  if (filters.minWidth !== undefined) {
    filterParts.push(`width >= ${filters.minWidth}`);
  }
  if (filters.maxWidth !== undefined) {
    filterParts.push(`width <= ${filters.maxWidth}`);
  }

  if (filters.minHeight !== undefined) {
    filterParts.push(`height >= ${filters.minHeight}`);
  }
  if (filters.maxHeight !== undefined) {
    filterParts.push(`height <= ${filters.maxHeight}`);
  }

  if (filters.minSize !== undefined) {
    filterParts.push(`size >= ${filters.minSize}`);
  }
  if (filters.maxSize !== undefined) {
    filterParts.push(`size <= ${filters.maxSize}`);
  }

  return filterParts.join(' AND ');
};

export interface SimilarSearchResult {
  hits: ImageDocument[];
  id: string;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export const similarSearch = async (
  documentId: string,
  limit: number = 50,
  offset: number = 0
): Promise<SimilarSearchResult> => {
  const response = await fetch(
    `https://ms-66464012cf08-103.fra.meilisearch.io/indexes/images/similar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 728b5f114a7604e32c0e4b0f2d728f15df9e479f8a76115aaaa26ce737d9b518`,
      },
      body: JSON.stringify({
        id: documentId,
        limit,
        offset,
        embedder: 'bedrock',
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Similarity search failed: ${response.statusText}`);
  }

  return response.json();
};
