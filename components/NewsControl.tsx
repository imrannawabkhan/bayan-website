"use client";
import { useState, useEffect } from 'react';
import FileUploader from '@/components/FileUploader';
import Image from 'next/image';

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  images?: string[];
  date: string;
  category: string;
}

export default function NewsControl() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    images: [] as string[],
    category: 'announcement'
  });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [hasUnuploadedImage, setHasUnuploadedImage] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      setNewsItems(data.news || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (uploadedImageLink: string) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, uploadedImageLink] }));
  };

  const handleImageStatusChange = (status: { hasUnuploadedFile: boolean; isUploading: boolean }) => {
    setHasUnuploadedImage(status.hasUnuploadedFile);
    setImageUploading(status.isUploading);
  };

  const deleteNews = async (id: number) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      try {
        const response = await fetch(`/api/news?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setNewsItems(newsItems.filter(item => item.id !== id));
        } else {
          alert('Failed to delete news item');
        }
      } catch (error) {
        console.error('Error deleting news:', error);
        alert('Error deleting news item');
      }
    }
  };

  const openAddModal = () => {
    setEditingNews(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      images: [],
      category: 'announcement'
    });
    setImageUrlInput('');
    setShowModal(true);
  };

  const openEditModal = (news: NewsItem) => {
    setEditingNews(news);
    const normalizedImages = news.images && news.images.length > 0
      ? news.images
      : news.image
        ? [news.image]
        : [];
    setFormData({
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      images: normalizedImages,
      category: news.category
    });
    setImageUrlInput('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasUnuploadedImage) {
      alert('Please upload the selected image(s) before submitting.');
      return;
    }

    if (imageUploading) {
      alert('Please wait for the image upload to complete.');
      return;
    }

    try {
      if (editingNews) {
        const response = await fetch('/api/news', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingNews.id, date: editingNews.date })
        });
        
        if (response.ok) {
          fetchNews();
          setShowModal(false);
        } else {
          alert('Failed to update news item');
        }
      } else {
        const response = await fetch('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          fetchNews();
          setShowModal(false);
        } else {
          alert('Failed to add news item');
        }
      }
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Error saving news item');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">News Management ({newsItems.length} items)</h2>
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add News</span>
          </button>
        </div>
        
        {newsItems.length === 0 ? (
          <p className="text-gray-500">No news items found.</p>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex space-x-4">
                    {(() => {
                      const previewImage = item.images && item.images.length > 0 ? item.images[0] : item.image;
                      if (!previewImage) return null;
                      return (
                        <div className="w-20 h-20 relative flex-shrink-0">
                          <Image
                            src={previewImage}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      );
                    })()}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: <span className="capitalize">{item.category}</span> • Date: {item.date}
                      </p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button 
                      onClick={() => openEditModal(item)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteNews(item.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingNews ? 'Edit News Item' : 'Add New News Item'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="announcement">Announcement</option>
                        <option value="update">Update</option>
                        <option value="partnership">Partnership</option>
                        <option value="achievement">Achievement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        News Images
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <FileUploader
                          onFileUpload={handleImageUpload}
                          onFileStatusChange={handleImageStatusChange}
                          multiple
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add image URL manually
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = imageUrlInput.trim();
                            if (!trimmed) return;
                            setFormData((prev) => ({
                              ...prev,
                              images: [...prev.images, trimmed]
                            }));
                            setImageUrlInput('');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {formData.images.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preview
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {formData.images.map((image, index) => (
                            <div key={`${image}-${index}`} className="relative w-full h-24">
                              <Image
                                src={image}
                                alt={`Preview ${index + 1}`}
                                fill
                                className="object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((_, i) => i !== index)
                                  }));
                                }}
                                className="absolute top-1 right-1 bg-white/90 text-gray-700 rounded-full p-1 hover:bg-white shadow"
                                aria-label="Remove image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hasUnuploadedImage || imageUploading}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      hasUnuploadedImage || imageUploading
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {imageUploading ? 'Uploading...' : editingNews ? 'Update News' : 'Add News'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
