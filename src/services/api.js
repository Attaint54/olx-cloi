import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not configured. ' +
    'Create a .env.local file with: NEXT_PUBLIC_API_URL=https://back-end-olx.vercel.app'
  );
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
  'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
];

export function normalizeProduct(raw) {
  if (!raw) return null;

  const rawIdStr = String(raw.id);
  const numericId = parseInt(rawIdStr.replace('local_', '')) || 1;
  const locationIndex = numericId % LOCATIONS.length;
  const location = raw.location || LOCATIONS[locationIndex];

  const daysAgo = numericId % 7;
  const postDate = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;

  const images = (raw.images || []).filter(Boolean);
  const validThumbnail = raw.thumbnail || images[0] || 'https://via.placeholder.com/300x200?text=No+Image';
  const displayImages = images.length > 0 ? images : [validThumbnail];

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    price: raw.price || 0,
    discountPercentage: raw.discountPercentage || 0,
    rating: raw.rating || 4.0,
    stock: raw.stock || 10,
    brand: raw.brand || 'Generic',
    category: raw.category || 'general',
    thumbnail: validThumbnail,
    images: displayImages,
    location: location,
    date: postDate,
    seller: {
      name: raw.sellerName || `Seller_${raw.brand || 'User'}_${numericId}`,
      joined: 'Jan 2024',
      phone: raw.sellerPhone || `+1 (555) ${100 + (numericId % 900)}-${1000 + (numericId % 9000)}`
    }
  };
}

export const OLX_API = {
  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories');
      const data = response.data;

      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        return data.map(cat => ({
          slug: cat,
          name: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        }));
      }

      return data.map(cat => ({
        slug: cat.slug || cat.name,
        name: cat.name
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getProducts({ query = '', category = '', limit = 20, skip = 0 } = {}) {
    try {
      let endpoint = '/products';
      const params = { limit, skip };

      if (query) {
        endpoint = '/products/search';
        params.q = query;
      } else if (category) {
        endpoint = `/products/category/${category}`;
      }

      const response = await apiClient.get(endpoint, { params });
      const data = response.data;

      return {
        products: (data.products || []).map(normalizeProduct),
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return normalizeProduct(response.data);
    } catch (error) {
      console.error(`Error fetching product details (${id}):`, error);
      throw error;
    }
  },

  async createProduct(formData) {
    try {
      const response = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': null },
      });
      return normalizeProduct(response.data);
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }
};
