const BASE = 'https://openlibrary.org';
const COVERS = 'https://covers.openlibrary.org/b/id';

export const getCover = (id, size = 'M') =>
    id ? `${COVERS}/${id}-${size}.jpg` : null;

export const searchBooks = async (query, limit = 10) => {
    try {
        const res = await fetch(
            `${BASE}/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year,ratings_average,number_of_pages_median,subject`
        );
        const data = await res.json();
        return (data.docs || []).map(doc => ({
            id: doc.key,
            title: doc.title || 'Unknown Title',
            author: (doc.author_name || ['Unknown Author'])[0],
            coverId: doc.cover_i || null,
            coverUrl: getCover(doc.cover_i),
            year: doc.first_publish_year || '',
            rating: doc.ratings_average ? parseFloat(doc.ratings_average).toFixed(1) : '4.0',
            pages: doc.number_of_pages_median || 280,
            subjects: (doc.subject || []).slice(0, 3),
            source: 'openlibrary',
            isFree: true,
        }));
    } catch (e) {
        console.log('OpenLibrary error:', e);
        return [];
    }
};

export const getTrending = () => searchBooks('bestseller fiction nonfiction', 8);
export const getByGenre = (genre) => searchBooks(genre, 12);
export const getFeatured = () => searchBooks('atomic habits sapiens deep work', 6);