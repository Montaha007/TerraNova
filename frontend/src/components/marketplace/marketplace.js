import React, { useState, useEffect } from 'react';
import { 
  FaShoppingCart, 
  FaTag, 
  FaStar, 
  FaHeart, 
  FaSearch, 
  FaFilter,
  FaTruck,
  FaSeedling,
  FaFlask,
  FaTools,
  FaWater,
  FaDollarSign,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTh,
  FaList,
  FaSort,
  FaTimes,
  FaChevronDown,
  FaEye,
  FaShare,
  FaBookmark,
  FaShieldAlt,
  FaLeaf,
  FaCertificate
} from 'react-icons/fa';
import './markertplace.css';

function MarketplaceEnhanced() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const categories = [
    { id: 'all', name: 'All Items', icon: FaShoppingCart, color: '#27ae60' },
    { id: 'seeds', name: 'Seeds', icon: FaSeedling, color: '#f39c12' },
    { id: 'fertilizer', name: 'Fertilizer', icon: FaFlask, color: '#9b59b6' },
    { id: 'equipment', name: 'Equipment', icon: FaTools, color: '#34495e' },
    { id: 'irrigation', name: 'Irrigation', icon: FaWater, color: '#3498db' },
    { id: 'produce', name: 'Fresh Produce', icon: FaLeaf, color: '#e67e22' },
    { id: 'services', name: 'Services', icon: FaTools, color: '#16a085' }
  ];

  useEffect(() => {
    // Enhanced mock marketplace listings with more details
    const mockListings = [
      {
        id: 1,
        title: 'Premium Organic Tomato Seeds',
        category: 'seeds',
        type: 'sale',
        price: 45.00,
        originalPrice: 60.00,
        quantity: 50,
        unit: 'kg',
        seller: {
          name: 'GreenSeed Co.',
          rating: 4.8,
          reviews: 124,
          location: 'Nabeul',
          verified: true,
          memberSince: '2020'
        },
        description: 'High-quality organic tomato seeds, disease resistant varieties perfect for Mediterranean climate.',
        images: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop&crop=center'],
        condition: 'new',
        availability: 'in-stock',
        posted: '2 days ago',
        views: 156,
        likes: 23,
        tags: ['organic', 'tomato', 'disease-resistant'],
        delivery: 'Available nationwide',
        certifications: ['Organic Certified', 'Non-GMO'],
        featured: true,
        discount: 25
      },
      {
        id: 2,
        title: 'Used Tractor - John Deere 5055E',
        category: 'equipment',
        type: 'sale',
        price: 15000.00,
        originalPrice: 18000.00,
        quantity: 1,
        unit: 'unit',
        seller: {
          name: 'Farm Equipment Solutions',
          rating: 4.6,
          reviews: 89,
          location: 'Tunis',
          verified: true,
          memberSince: '2018'
        },
        description: 'Well-maintained John Deere tractor, 500 hours of use, perfect for medium-sized farms.',
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&crop=center'],
        condition: 'used',
        availability: 'in-stock',
        posted: '1 week ago',
        views: 342,
        likes: 45,
        tags: ['tractor', 'john-deere', 'used'],
        delivery: 'Local pickup only',
        certifications: ['Inspection Certified'],
        featured: false,
        discount: 17
      },
      {
        id: 3,
        title: 'NPK Fertilizer 20-20-20',
        category: 'fertilizer',
        type: 'sale',
        price: 280.00,
        originalPrice: 320.00,
        quantity: 100,
        unit: 'bags',
        seller: {
          name: 'AgriSupply Tunisia',
          rating: 4.9,
          reviews: 256,
          location: 'Sfax',
          verified: true,
          memberSince: '2019'
        },
        description: 'Premium NPK fertilizer with balanced nutrients for all crop types.',
        images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop&crop=center'],
        condition: 'new',
        availability: 'in-stock',
        posted: '3 days ago',
        views: 89,
        likes: 12,
        tags: ['fertilizer', 'npk', 'balanced'],
        delivery: 'Available nationwide',
        certifications: ['ISO Certified'],
        featured: true,
        discount: 13
      },
      {
        id: 4,
        title: 'Drip Irrigation System',
        category: 'irrigation',
        type: 'sale',
        price: 1200.00,
        originalPrice: null,
        quantity: 5,
        unit: 'sets',
        seller: {
          name: 'Irrigation Tech',
          rating: 4.7,
          reviews: 78,
          location: 'Sousse',
          verified: true,
          memberSince: '2021'
        },
        description: 'Complete drip irrigation system with automatic timer and water-saving technology.',
        images: ['https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&crop=center'],
        condition: 'new',
        availability: 'in-stock',
        posted: '5 days ago',
        views: 234,
        likes: 34,
        tags: ['irrigation', 'drip', 'water-saving'],
        delivery: 'Installation available',
        certifications: ['Water Efficiency Certified'],
        featured: false,
        discount: 0
      },
      {
        id: 5,
        title: 'Fresh Organic Vegetables',
        category: 'produce',
        type: 'sale',
        price: 15.00,
        originalPrice: null,
        quantity: 200,
        unit: 'kg',
        seller: {
          name: 'Green Valley Farm',
          rating: 4.9,
          reviews: 167,
          location: 'Bizerte',
          verified: true,
          memberSince: '2017'
        },
        description: 'Fresh organic vegetables harvested daily from our certified organic farm.',
        images: ['https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&h=300&fit=crop&crop=center'],
        condition: 'fresh',
        availability: 'in-stock',
        posted: '1 day ago',
        views: 445,
        likes: 67,
        tags: ['organic', 'vegetables', 'fresh'],
        delivery: 'Same-day delivery',
        certifications: ['Organic Certified', 'Farm Fresh'],
        featured: true,
        discount: 0
      },
      {
        id: 6,
        title: 'Farm Consultation Service',
        category: 'services',
        type: 'service',
        price: 150.00,
        originalPrice: null,
        quantity: 1,
        unit: 'hour',
        seller: {
          name: 'Expert Agronomists',
          rating: 5.0,
          reviews: 45,
          location: 'Kairouan',
          verified: true,
          memberSince: '2016'
        },
        description: 'Professional farm consultation and crop management advice from certified agronomists.',
        images: ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&crop=center'],
        condition: 'service',
        availability: 'available',
        posted: '4 days ago',
        views: 78,
        likes: 9,
        tags: ['consultation', 'agronomist', 'advice'],
        delivery: 'On-site service',
        certifications: ['Certified Agronomist'],
        featured: false,
        discount: 0
      }
    ];
    
    setListings(mockListings);
    setFilteredListings(mockListings);
  }, []);

  useEffect(() => {
    let filtered = listings;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by price range
    filtered = filtered.filter(listing => 
      listing.price >= priceRange.min && listing.price <= priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.seller.rating - a.seller.rating);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }

    setFilteredListings(filtered);
  }, [listings, selectedCategory, searchTerm, priceRange, sortBy]);

  const handleSaveItem = (listingId) => {
    setSavedItems(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleShareItem = (listingId) => {
    // Share functionality
    alert(`Share functionality for listing ${listingId}`);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar key={i} className={`star ${i < Math.floor(rating) ? 'filled' : 'empty'}`} />
    ));
  };

  const renderListingCard = (listing) => (
    <div 
      key={listing.id}
      className={`listing-card ${listing.featured ? 'featured' : ''} ${viewMode}`}
      onMouseEnter={() => setHoveredCard(listing.id)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      {/* Featured Badge */}
      {listing.featured && (
        <div className="featured-badge">
          <FaStar /> Featured
        </div>
      )}

      {/* Discount Badge */}
      {listing.discount > 0 && (
        <div className="discount-badge">
          -{listing.discount}%
        </div>
      )}

      {/* Image Section */}
      <div className="card-image">
        <img src={listing.images[0]} alt={listing.title} />
        <div className="card-overlay">
          <div className="overlay-actions">
            <button 
              className="overlay-btn"
              onClick={() => handleSaveItem(listing.id)}
            >
              <FaBookmark className={savedItems.includes(listing.id) ? 'saved' : ''} />
            </button>
            <button 
              className="overlay-btn"
              onClick={() => handleShareItem(listing.id)}
            >
              <FaShare />
            </button>
            <button 
              className="overlay-btn"
              onClick={() => setSelectedListing(listing)}
            >
              <FaEye />
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{listing.title}</h3>
          <div className="card-price">
            {listing.originalPrice && (
              <span className="original-price">{listing.originalPrice} TND</span>
            )}
            <span className="current-price">{listing.price} TND</span>
            <span className="price-unit">/ {listing.unit}</span>
          </div>
        </div>

        <p className="card-description">{listing.description}</p>

        {/* Tags */}
        <div className="card-tags">
          {listing.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
        </div>

        {/* Seller Info */}
        <div className="card-seller">
          <div className="seller-avatar">
            {listing.seller.name.charAt(0)}
          </div>
          <div className="seller-info">
            <div className="seller-name">
              {listing.seller.name}
              {listing.seller.verified && <FaCheckCircle className="verified-badge" />}
            </div>
            <div className="seller-rating">
              {renderStars(listing.seller.rating)}
              <span>({listing.seller.reviews})</span>
            </div>
          </div>
          <div className="seller-location">
            <FaMapMarkerAlt /> {listing.seller.location}
          </div>
        </div>

        {/* Certifications */}
        {listing.certifications.length > 0 && (
          <div className="card-certifications">
            {listing.certifications.slice(0, 2).map((cert, index) => (
              <div key={index} className="certification-badge">
                <FaCertificate /> {cert}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="card-footer">
          <div className="card-meta">
            <span className="posted-time">
              <FaClock /> {listing.posted}
            </span>
            <span className="availability">
              <FaCheckCircle className={listing.availability === 'in-stock' ? 'in-stock' : ''} />
              {listing.availability === 'in-stock' ? 'In Stock' : 'Available'}
            </span>
          </div>
          <button className="contact-btn">
            <FaEnvelope /> Contact
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="marketplace-enhanced">
      {/* Enhanced Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <FaShoppingCart />
              Agricultural Marketplace
            </h1>
            <p>Connect with trusted sellers and buyers in Tunisia's agricultural community</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{listings.length}</span>
              <span className="stat-label">Active Listings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1,247</span>
              <span className="stat-label">Verified Sellers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="marketplace-controls">
        <div className="search-filter-controls">
          <div className="search-bar">
            <span className="fa-search">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search products, equipment, services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter />
              Filters
              {showFilters && <FaTimes />}
            </button>
          </div>
        </div>

        <div className="view-controls">
          <div className="sort-control">
            <FaSort />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaTh />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-section">
            <h3>Categories</h3>
            <div className="category-grid">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{ '--category-color': category.color }}
                >
                  <category.icon />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </div>
              <div className="price-slider">
                <input
                  type="range"
                  min="0"
                  max="20000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          Showing {filteredListings.length} of {listings.length} listings
        </span>
        <span className="active-filters">
          {selectedCategory !== 'all' && (
            <span className="active-filter">
              {categories.find(c => c.id === selectedCategory)?.name}
              <FaTimes onClick={() => setSelectedCategory('all')} />
            </span>
          )}
        </span>
      </div>

      {/* Listings Grid */}
      <div className={`listings-container ${viewMode}`}>
        {filteredListings.length > 0 ? (
          filteredListings.map(listing => renderListingCard(listing))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">
              <FaSearch />
            </div>
            <h3>No listings found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button 
              className="reset-filters-btn"
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setPriceRange({ min: 0, max: 10000 });
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div className="listing-modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="listing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedListing.title}</h2>
              <button className="modal-close" onClick={() => setSelectedListing(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              {/* Modal content would go here */}
              <p>Detailed listing information...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MarketplaceEnhanced;