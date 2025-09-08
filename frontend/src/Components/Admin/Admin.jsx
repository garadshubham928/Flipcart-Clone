import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash } from "react-icons/fa";
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

export default function Admin() {
  const [models, setModels] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    model_name: '',
    rating: '',
    price: '',
    category: '',
    photo: ''
  });

  const navigate = useNavigate();
  const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Beauty', 'Sports'];

  // Fetch all models
  const fetchModels = async () => {
    try {
      console.log('Fetching models...');
      const response = await fetch('http://localhost:4000/api/models');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched models:', data);
        // Debug log to check photo data
        data.forEach(model => {
          console.log(`Model ${model.id} photo data:`, {
            hasPhoto: !!model.photo,
            photoLength: model.photo ? model.photo.length : 0,
            startsWithData: model.photo ? model.photo.startsWith('data:') : false
          });
        });
        setModels(data);
      } else {
        console.error('Failed to fetch models:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      setMessage('Error fetching models: ' + error.message);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Convert image file to base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (!validTypes.includes(file.type)) {
        reject(new Error(`Invalid file type. Supported types: ${validTypes.join(', ')}`));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = () => {
        const base64String = reader.result;
        
        // Validate image data
        const img = new Image();
        img.onload = () => {
          console.log('Image validated:', {
            format: file.type,
            size: file.size,
            dimensions: `${img.naturalWidth}x${img.naturalHeight}`
          });
          
          // Extract base64 data without the data URL prefix
          const base64Data = base64String.split('base64,')[1];
          resolve(base64Data);
        };
        
        img.onerror = () => {
          reject(new Error('Invalid image data'));
        };
        
        img.src = base64String;
      };

      reader.onerror = error => {
        console.error('Error reading file:', error);
        reject(error);
      };
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.model_name.trim()) {
      setMessage('Model name is required');
      return false;
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      setMessage('Rating must be 1–5');
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      setMessage('Price must be greater than 0');
      return false;
    }
    if (!formData.category.trim()) {
      setMessage('Category is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      let submitData = { ...formData };

      // Handle image conversion if a new image is selected
      if (image) {
        console.log('Converting image file:', image.name, image.size, 'bytes');
        const base64Image = await convertImageToBase64(image);
        submitData.photo = base64Image;
        console.log('Base64 image data prepared, length:', base64Image.length);
      } else if (editingId && formData.photo) {
        // If editing and using existing photo, extract base64 data
        const base64Data = formData.photo.split('base64,')[1];
        submitData.photo = base64Data;
      }

      console.log('Submitting data:', {
        ...submitData,
        photo: submitData.photo ? 'Base64 image data present' : 'No image'
      });

      const url = editingId
        ? `http://localhost:4000/api/models/${editingId}`
        : 'http://localhost:4000/api/gallery/insert';
      const method = editingId ? 'PUT' : 'POST';

      console.log('Making request to:', url, 'with method:', method);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (response.ok) {
        setMessage(editingId ? 'Model updated successfully!' : 'Model added successfully!');
        resetForm();
        fetchModels(); // Refresh the list
      } else {
        console.error('Server error:', data);
        setMessage('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network error:', error);
      setMessage('Network error: ' + error.message);
    }

    setLoading(false);
  };

  const handleEdit = (model) => {
    console.log('Editing model:', model);
    setFormData({
      model_name: model.model_name,
      rating: model.rating,
      price: model.price,
      category: model.category,
      photo: model.photo || ''  // The photo from backend already includes data URL prefix
    });
    setEditingId(model.id);
    setImage(null);
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/models/${id}`, { method: 'DELETE' });
        const result = await response.json();
        if (response.ok) {
          setMessage('Model deleted successfully!');
          fetchModels();
        } else {
          setMessage('Error: ' + (result.error || 'Failed to delete model'));
        }
      } catch (error) {
        setMessage('Error deleting model: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({ model_name: '', rating: '', price: '', category: '', photo: '' });
    setEditingId(null);
    setImage(null);
    setMessage('');
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    
    <div >
      <div >
        <Header />
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel - Model Management</h1>
        <p className="mb-8 text-gray-600">Add, edit, and manage your product models</p>

        {/* Debug Info */}
        <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
          <p className="text-sm">
            <strong>Debug Info:</strong> Total models: {models.length} | 
            Selected file: {image ? `${image.name} (${image.size} bytes)` : 'None'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
            {message}
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6 text-blue-600">{editingId ? 'Edit Model' : 'Add New Model'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Model Name" 
              value={formData.model_name}
              onChange={e => setFormData({ ...formData, model_name: e.target.value })}
              className="border rounded px-3 py-2" 
              required 
            />
            <input 
              type="number" 
              placeholder="Rating (1-5)" 
              min="1" 
              max="5" 
              step="0.1"
              value={formData.rating} 
              onChange={e => setFormData({ ...formData, rating: e.target.value })}
              className="border rounded px-3 py-2" 
              required 
            />
            <input 
              type="number" 
              placeholder="Price (₹)" 
              min="0" 
              step="0.01"
              value={formData.price} 
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              className="border rounded px-3 py-2" 
              required 
            />
            <select 
              value={formData.category} 
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className="border rounded px-3 py-2" 
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
                  if (!validTypes.includes(file.type)) {
                    setMessage('Please upload a valid image file (JPG, PNG, GIF, WebP, or BMP)');
                    e.target.value = '';
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) { // 5MB limit
                    setMessage('Image size should be less than 5MB');
                    e.target.value = '';
                    return;
                  }
                  setImage(file);
                  console.log('File selected:', `${file.name} (${file.size} bytes, ${file.type})`);
                  setMessage(''); // Clear any error messages
                }
              }} 
              className="border rounded px-3 py-2 md:col-span-2" 
            />
            <p className="text-sm text-gray-500 md:col-span-2">
              Supported formats: JPG, JPEG, PNG, GIF, WebP, BMP (Max size: 5MB)
            </p>
            
            {/* Show current image preview */}
            {formData.photo && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                <img 
                  src={formData.photo.startsWith('data:') ? formData.photo : `data:image/jpeg;base64,${formData.photo}`}
                  alt="Current" 
                  className="h-20 w-20 object-cover rounded border"
                  onError={(e) => {
                    console.error('Image preview load error', {
                      hasPrefix: formData.photo.startsWith('data:'),
                      dataLength: formData.photo.length,
                      preview: formData.photo.substring(0, 100)
                    });
                    e.target.style.display = 'none';
                    setMessage('Error loading image preview');
                  }}
                />
              </div>
            )}
            
            <div className="col-span-full flex gap-4 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Model' : 'Add Model')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">All Models ({models.length})</h2>
          {models.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No models found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Photo</th>
                    <th className="px-4 py-2">Model</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Rating</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Actions</th>
                    <th className="px-4 py-2">Debug</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map(m => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{m.id}</td>
                      <td className="px-4 py-2">
                        {m.photo ? (
                          <img 
                            src={m.photo.startsWith('data:') ? m.photo : `data:image/jpeg;base64,${m.photo}`}
                            alt={m.model_name} 
                            className="h-12 w-12 object-cover rounded border"
                            onError={(e) => {
                              console.error('Image load error for model', m.id, 'Photo data:', m.photo?.substring(0, 100));
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div 
                          className="h-12 w-12 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500"
                          style={{ display: m.photo ? 'none' : 'flex' }}
                        >
                          No Image
                        </div>
                      </td>
                      <td className="px-4 py-2">{m.model_name}</td>
                      <td className="px-4 py-2">{m.category}</td>
                      <td className="px-4 py-2">{m.rating} ⭐</td>
                      <td className="px-4 py-2">₹{parseFloat(m.price).toFixed(2)}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button 
                          onClick={() => handleEdit(m)} 
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(m.id)} 
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <div>Photo: {m.photo ? `${m.photo.length} chars` : 'NULL'}</div>
                        <button 
                          onClick={() => console.log('Full model data:', m)}
                          className="text-blue-500 underline"
                        >
                          Log Data
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}