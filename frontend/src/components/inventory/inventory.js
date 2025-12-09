import React, { useState, useEffect } from 'react';
import { 
  FaBoxes, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTruck,
  FaFlask,
  FaTools,
  FaWater,
  FaChartBar,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
  FaEye,
  FaDownload
} from 'react-icons/fa';
import './inventory.css';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { id: 'all', name: 'All Items', icon: FaBoxes },
    { id: 'fertilizer', name: 'Fertilizer', icon: FaFlask },
    { id: 'pesticide', name: 'Pesticide', icon: FaTools },
    { id: 'herbicide', name: 'Herbicide', icon: FaTools },
    { id: 'irrigation', name: 'Irrigation', icon: FaWater },
    { id: 'equipment', name: 'Equipment', icon: FaTools },
    { id: 'tools', name: 'Tools', icon: FaTools },
    { id: 'other', name: 'Other', icon: FaBoxes }
  ];

  useEffect(() => {
    // Mock inventory data
    const mockInventory = [
      {
        id: 2,
        name: 'NPK Fertilizer 20-10-10',
        category: 'fertilizer',
        quantity: 150,
        unit: 'bags',
        minStock: 20,
        maxStock: 200,
        costPerUnit: 85.50,
        totalCost: 12825.00,
        location: 'Warehouse B',
        supplier: 'AgriSupply Ltd',
        purchaseDate: '2024-02-20',
        expiryDate: '2026-08-15',
        status: 'good',
        description: 'Balanced NPK fertilizer for general use'
      },
      {
        id: 3,
        name: 'Organic Pesticide',
        category: 'pesticide',
        quantity: 8,
        unit: 'liters',
        minStock: 15,
        maxStock: 50,
        costPerUnit: 105.00,
        totalCost: 840.00,
        location: 'Storage Room C',
        supplier: 'EcoProtect',
        purchaseDate: '2024-01-10',
        expiryDate: '2024-12-31',
        status: 'low',
        description: 'Organic pesticide for vegetable crops'
      },
      {
        id: 4,
        name: 'Drip Irrigation Pipes',
        category: 'irrigation',
        quantity: 500,
        unit: 'meters',
        minStock: 100,
        maxStock: 1000,
        costPerUnit: 7.50,
        totalCost: 3750.00,
        location: 'Warehouse A',
        supplier: 'IrrigationTech',
        purchaseDate: '2024-03-01',
        expiryDate: null,
        status: 'good',
        description: '16mm drip irrigation pipes with built-in filters'
      },
      {
        id: 5,
        name: 'Hand Tractor',
        category: 'equipment',
        quantity: 2,
        unit: 'units',
        minStock: 1,
        maxStock: 3,
        costPerUnit: 7500.00,
        totalCost: 15000.00,
        location: 'Equipment Shed',
        supplier: 'FarmTech Inc',
        purchaseDate: '2023-11-15',
        expiryDate: null,
        status: 'good',
        description: 'Small hand tractor for field preparation'
      },
    ];

    setInventory(mockInventory);
    setFilteredInventory(mockInventory);
  }, []);

  useEffect(() => {
    let filtered = inventory;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInventory(filtered);
  }, [inventory, selectedCategory, searchTerm, sortBy, sortOrder]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'status-good';
      case 'low': return 'status-low';
      case 'critical': return 'status-critical';
      case 'expired': return 'status-expired';
      default: return 'status-good';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <FaCheckCircle className="status-icon-good" />;
      case 'low': return <FaExclamationTriangle className="status-icon-low" />;
      case 'critical': return <FaExclamationTriangle className="status-icon-critical" />;
      default: return <FaCheckCircle />;
    }
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : FaBoxes;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort />;
    return sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.minStock) return 'critical';
    if (item.quantity <= item.minStock * 1.5) return 'low';
    return 'good';
  };

  const calculateTotalValue = () => {
    return filteredInventory.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const getLowStockItems = () => {
    return filteredInventory.filter(item => getStockStatus(item) === 'low' || getStockStatus(item) === 'critical');
  };

  const exportInventory = () => {
    // Mock export functionality
    alert('Export functionality would download CSV file with inventory data');
  };

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1><FaBoxes /> Inventory Management</h1>
        <p>Track and manage your farm supplies, equipment, and materials</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaBoxes />
          </div>
          <div className="stat-content">
            <h3>{filteredInventory.length}</h3>
            <p>Total Items</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon value">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>{calculateTotalValue().toFixed(2)} TND</h3>
            <p>Total Value</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon low-stock">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{getLowStockItems().length}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon categories">
            <FaFilter />
          </div>
          <div className="stat-content">
            <h3>{categories.length - 1}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="inventory-controls">
        <div className="search-filter">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-export" onClick={exportInventory}>
            <FaDownload /> Export
          </button>
          
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Add Item
          </button>
        </div>
      </div>

      {/* Inventory Display */}
      {viewMode === 'grid' ? (
        <div className="inventory-grid">
          {filteredInventory.map(item => {
            const CategoryIcon = getCategoryIcon(item.category);
            const stockStatus = getStockStatus(item);
            
            return (
              <div key={item.id} className={`inventory-card ${getStatusColor(stockStatus)}`}>
                <div className="card-header">
                  <div className="item-category">
                    <CategoryIcon />
                    <span>{item.category}</span>
                  </div>
                  {getStatusIcon(stockStatus)}
                </div>

                <div className="card-content">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  
                  <div className="quantity-info">
                    <div className="quantity-display">
                      <span className="quantity">{item.quantity}</span>
                      <span className="unit">{item.unit}</span>
                    </div>
                    <div className="stock-range">
                      <div className="stock-bar">
                        <div 
                          className="stock-fill"
                          style={{ 
                            width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className="range-text">Min: {item.minStock} | Max: {item.maxStock}</span>
                    </div>
                  </div>

                  <div className="item-details">
                    <div className="detail-row">
                      <span className="label">Location:</span>
                      <span className="value">{item.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Value:</span>
                      <span className="value">{item.totalCost.toFixed(2)} TND</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Supplier:</span>
                      <span className="value">{item.supplier}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="btn-view" onClick={() => setSelectedItem(item)}>
                    <FaEye /> View
                  </button>
                  <button className="btn-edit" onClick={() => {
                    setSelectedItem(item);
                    setShowEditModal(true);
                  }}>
                    <FaEdit /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="inventory-list">
          <div className="list-header">
            <div className="list-column" onClick={() => handleSort('name')}>
              Name {getSortIcon('name')}
            </div>
            <div className="list-column" onClick={() => handleSort('category')}>
              Category {getSortIcon('category')}
            </div>
            <div className="list-column" onClick={() => handleSort('quantity')}>
              Quantity {getSortIcon('quantity')}
            </div>
            <div className="list-column" onClick={() => handleSort('totalCost')}>
              Value {getSortIcon('totalCost')}
            </div>
            <div className="list-column">Location</div>
            <div className="list-column">Status</div>
            <div className="list-column">Actions</div>
          </div>
          
          {filteredInventory.map(item => {
            const CategoryIcon = getCategoryIcon(item.category);
            const stockStatus = getStockStatus(item);
            
            return (
              <div key={item.id} className={`list-row ${getStatusColor(stockStatus)}`}>
                <div className="list-column">
                  <div className="item-name">
                    <CategoryIcon />
                    <span>{item.name}</span>
                  </div>
                </div>
                <div className="list-column">{item.category}</div>
                <div className="list-column">
                  {item.quantity} {item.unit}
                </div>
                <div className="list-column">{item.totalCost.toFixed(2)} TND</div>
                <div className="list-column">{item.location}</div>
                <div className="list-column">
                  <span className={`status-badge ${getStatusColor(stockStatus)}`}>
                    {stockStatus}
                  </span>
                </div>
                <div className="list-column">
                  <div className="row-actions">
                    <button onClick={() => setSelectedItem(item)}>
                      <FaEye />
                    </button>
                    <button onClick={() => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}>
                      <FaEdit />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && !showEditModal && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Item Details</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedItem.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedItem.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Description:</label>
                    <span>{selectedItem.description}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Stock Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Current Quantity:</label>
                    <span>{selectedItem.quantity} {selectedItem.unit}</span>
                  </div>
                  <div className="detail-item">
                    <label>Min Stock Level:</label>
                    <span>{selectedItem.minStock} {selectedItem.unit}</span>
                  </div>
                  <div className="detail-item">
                    <label>Max Stock Level:</label>
                    <span>{selectedItem.maxStock} {selectedItem.unit}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Financial Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Cost per Unit:</label>
                    <span>{selectedItem.costPerUnit.toFixed(2)} TND</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Value:</label>
                    <span>{selectedItem.totalCost.toFixed(2)} TND</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Logistics</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedItem.location}</span>
                  </div>
                  <div className="detail-item">
                    <label>Supplier:</label>
                    <span>{selectedItem.supplier}</span>
                  </div>
                  <div className="detail-item">
                    <label>Purchase Date:</label>
                    <span>{selectedItem.purchaseDate}</span>
                  </div>
                  {selectedItem.expiryDate && (
                    <div className="detail-item">
                      <label>Expiry Date:</label>
                      <span>{selectedItem.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;