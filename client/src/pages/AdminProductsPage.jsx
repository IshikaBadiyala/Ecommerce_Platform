/**
 * AdminProductsPage Component
 * ----------------------------
 * Administrative control panel for Product CRUD operations with Indian Rupee (₹) pricing.
 */

import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { productAPI } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const CATEGORIES = ['Clothing', 'Accessories', 'Electronics', 'Home & Lifestyle'];

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Clothing',
    image: '',
    stock: 20,
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getProducts();
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Failed to load products for admin:', err);
      setError(err.message || 'Unable to retrieve product list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const triggerFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Clothing',
      image: '',
      stock: 20,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalOpen(false);
    setTimeout(() => setIsDeleteModalOpen(true), 10);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category: formData.category,
        image: formData.image.trim(),
        stock: Number(formData.stock),
      };

      if (currentProduct) {
        await productAPI.updateProduct(currentProduct._id, payload);
        triggerFeedback(`Product "${payload.name}" updated successfully!`);
      } else {
        await productAPI.createProduct(payload);
        triggerFeedback(`Product "${payload.name}" added to MongoDB Atlas catalogue!`);
      }

      setIsEditModalOpen(false);
      await loadProducts();
    } catch (err) {
      console.error('Save product error:', err);
      setError(err.message || 'Failed to save product changes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentProduct) return;
    setSubmitting(true);
    setError(null);

    try {
      await productAPI.deleteProduct(currentProduct._id);
      setIsDeleteModalOpen(false);
      triggerFeedback(`Product deleted successfully from database.`);
      await loadProducts();
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.message || 'Failed to delete product.');
    } finally {
      setSubmitting(false);
      setCurrentProduct(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Admin Inventory Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Product Inventory Management (INR ₹)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct real-time CRUD management connected to MongoDB Atlas
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {feedbackMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Retrieving catalogue records from MongoDB..." />
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900 mb-1">No products found</h3>
            <p className="text-xs text-slate-500 mb-4">Click "Add New Product" to create your first item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (INR)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 sm:px-6 flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-14 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{product.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{product.description}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {product.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4">
                      {product.stock <= 0 ? (
                        <span className="text-red-600 font-bold">0 (Out of stock)</span>
                      ) : product.stock <= 5 ? (
                        <span className="text-amber-600 font-bold">{product.stock} (Low)</span>
                      ) : (
                        <span className="text-emerald-700 font-semibold">{product.stock} units</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right pr-6 space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                        title="Edit Product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentProduct ? 'Edit Product Details' : 'Add New Indian Catalogue Product'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Women's Floral Print Summer Top / Men's Fleece Hoodie"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="price"
                required
                value={formData.price}
                onChange={handleFormChange}
                placeholder="e.g. 899"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              min="0"
              name="stock"
              required
              value={formData.stock}
              onChange={handleFormChange}
              placeholder="25"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Image URL *
            </label>
            <input
              type="url"
              name="image"
              required
              value={formData.image}
              onChange={handleFormChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe the fabric, fit, design, or specifications..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition"
            >
              {submitting ? 'Saving to Database...' : currentProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Product Deletion"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900 font-bold">"{currentProduct?.name}"</strong> from MongoDB
            Atlas?
          </p>
          <p className="text-red-600 font-medium">
            This action removes the record from the database catalogue immediately.
          </p>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition"
            >
              {submitting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AdminProductsPage;
