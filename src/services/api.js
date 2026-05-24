import axios from 'axios';

// Create an Axios instance pointing to the base URL
// To target your private backend, simply update this URL!
const apiClient = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 
  'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
];

/**
 * Maps raw data from the backend into a standardized frontend product model.
 */
export function normalizeProduct(raw) {
  if (!raw) return null;

  // Generate consistent location & date based on product ID
  const rawIdStr = String(raw.id);
  const numericId = parseInt(rawIdStr.replace('local_', '')) || 1;
  const locationIndex = numericId % LOCATIONS.length;
  const location = raw.location || LOCATIONS[locationIndex];
  
  const daysAgo = numericId % 7;
  const postDate = daysAgo === 0 ? 'Today' : `${daysAgo} days ago`;

  const images = raw.images && raw.images.length > 0 ? raw.images : [raw.thumbnail];

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
    thumbnail: raw.thumbnail || (images[0] || 'https://via.placeholder.com/300x200?text=No+Image'),
    images: images,
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
  /**
   * Fetches all product categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/products/categories');
      const data = response.data;
      
      // Handle array of strings or objects based on DummyJSON's format
      if (data.length > 0 && typeof data[0] === 'string') {
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
      // Premium defaults fallback
      return [
        { slug: 'smartphones', name: 'Smartphones' },
        { slug: 'laptops', name: 'Laptops' },
        { slug: 'fragrances', name: 'Fragrances' },
        { slug: 'skincare', name: 'Skincare' },
        { slug: 'groceries', name: 'Groceries' },
        { slug: 'home-decoration', name: 'Home Decoration' },
        { slug: 'furniture', name: 'Furniture' },
        { slug: 'automotive', name: 'Automotive' },
        { slug: 'motorcycle', name: 'Motorcycles' }
      ];
    }
  },

  /**
   * Fetches products list by query, category, limit and skip parameters
   */
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
      return { products: [], total: 0, skip: 0, limit };
    }
  },

  /**
   * Gets details of a single product
   */
  async getProductById(id) {
    try {
      // 1. Check local storage for listings created in current browser session
      if (typeof window !== 'undefined') {
        const localProducts = JSON.parse(localStorage.getItem('olx_local_products') || '[]');
        const foundLocal = localProducts.find(p => String(p.id) === String(id));
        if (foundLocal) {
          return normalizeProduct(foundLocal);
        }
      }

      // 2. Fetch from DummyJSON API
      const response = await apiClient.get(`/products/${id}`);
      return normalizeProduct(response.data);
    } catch (error) {
      console.error(`Error fetching product details (${id}):`, error);
      return null;
    }
  },

  /**
   * Sends a POST request to add a new listing.
   * Simulates persistence in localstorage to display it in the app session.
   */
  async createProduct(productData) {
    try {
      const response = await apiClient.post('/products/add', {
        title: productData.title,
        price: parseFloat(productData.price),
        description: productData.description,
        category: productData.category,
        thumbnail: productData.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      });

      const localId = `local_${Date.now()}`;
      const completedProduct = {
        ...productData,
        id: localId,
        thumbnail: productData.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        images: [productData.thumbnail || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
        rating: 5.0,
        brand: 'Self Listed',
        sellerName: productData.sellerName || 'You (Private Seller)',
        sellerPhone: '+1 (555) 777-8899',
        location: productData.location || 'New York, NY',
        date: 'Today'
      };

      if (typeof window !== 'undefined') {
        const localProducts = JSON.parse(localStorage.getItem('olx_local_products') || '[]');
        localProducts.unshift(completedProduct);
        localStorage.setItem('olx_local_products', JSON.stringify(localProducts));
      }

      return normalizeProduct(completedProduct);
    } catch (error) {
      console.error('Error posting product:', error);
      throw error;
    }
  }
};
