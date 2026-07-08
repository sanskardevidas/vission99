import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';
import { getProjectById, updateProject, deleteProject } from '../../utils/storage';
import { generateSlug } from '../../utils/slug';
import type { Project } from '../../types';

const allAmenities = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area',
  'Jogging Track', 'Landscaped Gardens', 'Indoor Games', 'Multipurpose Hall',
  'Power Backup', '24/7 Security', 'Yoga Deck', 'Kids Zone',
  'Co-Working Space', 'Amphitheatre', 'Spa', 'Tennis Court',
  'Business Center', 'Concierge Service', 'Retail Shops', 'Medical Center',
  'Infinity Pool', 'Private Pool', 'Private Lifts', 'Rooftop Lounge',
  'Smart Home', 'Sports Complex',
];

const vrTypes = ['matterport', 'kuula', 'youtube360', 'video360', 'video'];

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<Project>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        const project = await getProjectById(id);
        if (project) {
          setForm(project);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      } finally {
        setLoaded(true);
      }
    };
    loadProject();
  }, [id]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-gray font-sans">Project not found.</p>
      </div>
    );
  }

  const toggleAmenity = (amenity: string) => {
    const amenities = form.amenities || [];
    setForm((f) => ({
      ...f,
      amenities: amenities.includes(amenity)
        ? amenities.filter((a) => a !== amenity)
        : [...amenities, amenity],
    }));
  };

  const addImageField = () => setForm((f) => ({ ...f, images: [...(f.images || ['']), ''] }));
  const updateImage = (i: number, val: string) => {
    setForm((f) => ({ ...f, images: (f.images || []).map((img, idx) => (idx === i ? val : img)) }));
  };
  const removeImage = (i: number) => {
    setForm((f) => ({ ...f, images: (f.images || []).filter((_, idx) => idx !== i) }));
  };

  const handleSave = (status: 'draft' | 'published') => {
    if (!id) return;
    updateProject(id, {
      ...form,
      slug: form.slug || generateSlug(form.name || ''),
      status,
    });
    navigate('/admin');
  };

  const handleDelete = () => {
    if (!id) return;
    deleteProject(id);
    navigate('/admin');
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors';

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate('/admin')} className="text-muted-gray hover:text-champagne-gold transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Edit Project</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Project Name *</label>
          <input className={inputClass} value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Slug</label>
          <input className={inputClass} value={form.slug || ''} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Builder Name *</label>
          <input className={inputClass} value={form.builder || ''} onChange={(e) => setForm((f) => ({ ...f, builder: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Location *</label>
          <select className={inputClass} value={form.location || ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}>
            <option value="" className="bg-charcoal">Select Location</option>
            {['Baner', 'Wakad', 'Hinjewadi', 'Kharadi', 'Viman Nagar'].map((l) => (
              <option key={l} value={l} className="bg-charcoal">{l}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Address</label>
          <input className={inputClass} value={form.address || ''} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Starting Price *</label>
          <input className={inputClass} value={form.price || ''} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Price Range</label>
          <input className={inputClass} value={form.priceRange || ''} onChange={(e) => setForm((f) => ({ ...f, priceRange: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Configuration *</label>
          <input className={inputClass} value={form.configuration || ''} onChange={(e) => setForm((f) => ({ ...f, configuration: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Carpet Area</label>
          <input className={inputClass} value={form.carpetArea || ''} onChange={(e) => setForm((f) => ({ ...f, carpetArea: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Possession Date *</label>
          <input className={inputClass} value={form.possession || ''} onChange={(e) => setForm((f) => ({ ...f, possession: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">RERA Number</label>
          <input className={inputClass} value={form.reraNumber || ''} onChange={(e) => setForm((f) => ({ ...f, reraNumber: e.target.value }))} />
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Badge</label>
          <select className={inputClass} value={form.badge || 'Premium'} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}>
            {['Premium', 'New Launch', 'Luxury', 'Best Seller', 'Ultra Luxury'].map((b) => (
              <option key={b} value={b} className="bg-charcoal">{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">VR Tour Type</label>
          <select className={inputClass} value={form.vrTourType || 'matterport'} onChange={(e) => setForm((f) => ({ ...f, vrTourType: e.target.value }))}>
            {vrTypes.map((t) => (
              <option key={t} value={t} className="bg-charcoal">{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">VR Tour URL</label>
          <input className={inputClass} value={form.vrTourUrl || ''} onChange={(e) => setForm((f) => ({ ...f, vrTourUrl: e.target.value }))} />
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Description</label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">Project Images (URLs)</label>
          <div className="space-y-2">
            {(form.images || ['']).map((img, i) => (
              <div key={i} className="flex gap-2">
                <input className={inputClass} value={img} onChange={(e) => updateImage(i, e.target.value)} placeholder="Image URL" />
                {(form.images || []).length > 1 && (
                  <button onClick={() => removeImage(i)} className="text-red-400 hover:text-red-300 px-2 text-sm">Remove</button>
                )}
              </div>
            ))}
            <button onClick={addImageField} className="text-champagne-gold font-sans text-sm hover:underline">+ Add Image</button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-3 block">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {allAmenities.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs transition ${
                  (form.amenities || []).includes(a)
                    ? 'bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/30'
                    : 'bg-white/5 text-muted-gray border border-white/10 hover:border-white/20'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured || false} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-champagne-gold" />
            <span className="text-white font-sans text-sm">Featured Project</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.vrAvailable ?? true} onChange={(e) => setForm((f) => ({ ...f, vrAvailable: e.target.checked }))} className="accent-champagne-gold" />
            <span className="text-white font-sans text-sm">VR Available</span>
          </label>
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <button
            onClick={() => handleSave('draft')}
            className="bg-white/5 border border-white/10 text-white font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:border-champagne-gold/30 transition"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            className="bg-champagne-gold text-deep-black font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-soft-gold transition"
          >
            <Send className="w-4 h-4" /> Publish Project
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500/10 border border-red-500/30 text-red-400 font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition ml-auto"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
