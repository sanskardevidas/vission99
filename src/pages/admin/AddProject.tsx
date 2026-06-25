import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { addProject } from '../../utils/storage';
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
const [isSaving, setIsSaving] = useState(false);
export default function AddProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    location: '',
    area: '',
    price: '',
    priceRange: '',
    configuration: '',
    carpetArea: '',
    possession: '',
    description: '',
    amenities: [] as string[],
    images: [''] as string[],
    vrTourType: 'matterport',
    vrTourUrl: '',
    featured: false,
    vrAvailable: true,
    status: 'draft' as 'draft' | 'published',
    badge: 'Premium',
  });

  const toggleAmenity = (amenity: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }));
  };

  const addImageField = () => {
    setForm((f) => ({
      ...f,
      images: [...f.images, ''],
    }));
  };

  const updateImage = (i: number, val: string) => {
    setForm((f) => ({
      ...f,
      images: f.images.map((img, idx) => (idx === i ? val : img)),
    }));
  };

  const removeImage = (i: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, idx) => idx !== i),
    }));
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (isSaving) return;
    if (!form.location.trim() || !form.area.trim() || !form.price.trim()) {
      alert('Please fill Project Location, Area and Starting Price.');
      return;
    }
    setIsSaving(true);
    try {
      const autoName = form.area
        ? `${form.area} ${form.location}`
        : form.location;

      const autoSlug = generateSlug(
        form.area
          ? `${form.area}-${form.location}`
          : form.location
      );

    const project: Project = {
      name: autoName,
      slug: autoSlug,
      builder: 'Not specified',
      location: form.area
        ? `${form.area}, ${form.location}`
        : form.location,
      address: form.area
        ? `${form.area}, ${form.location}`
        : form.location,
      price: form.price,
      priceRange: form.priceRange,
      configuration: form.configuration,
      carpetArea: form.carpetArea,
      possession: form.possession,
      reraNumber: 'Not specified',
      description: form.description,
      amenities: form.amenities,
      images: form.images.filter((i) => i.trim()),
      floorPlans: [],
      brochure: '',
      vrTourType: form.vrTourType,
      vrTourUrl: form.vrTourUrl,
      featured: form.featured,
      vrAvailable: form.vrAvailable,
      status,
      badge: form.badge,
    };

    await addProject(project);

    alert(status === 'published' ? 'Project published successfully!' : 'Draft saved successfully!');
    navigate('/admin');
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('Project save failed. Check console for exact Supabase error.');
  } finally {
    setIsSaving(false);
  }
};

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-sans text-sm placeholder-muted-gray focus:border-champagne-gold focus:outline-none transition-colors';

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-muted-gray hover:text-champagne-gold transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
          Add New Project
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Project Location *
          </label>
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="e.g. Pune, Dubai, UK"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Area *
          </label>
          <input
            className={inputClass}
            value={form.area}
            onChange={(e) =>
              setForm((f) => ({ ...f, area: e.target.value }))
            }
            placeholder="e.g. Lohegaon, Hinjewadi, PCMC"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Starting Price *
          </label>
          <input
            className={inputClass}
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: e.target.value }))
            }
            placeholder="₹89 L+"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Price Range
          </label>
          <input
            className={inputClass}
            value={form.priceRange}
            onChange={(e) =>
              setForm((f) => ({ ...f, priceRange: e.target.value }))
            }
            placeholder="₹89 L – ₹1.5 Cr"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Configuration *
          </label>
          <input
            className={inputClass}
            value={form.configuration}
            onChange={(e) =>
              setForm((f) => ({ ...f, configuration: e.target.value }))
            }
            placeholder="2, 3 & 4 BHK Luxury Residences"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Carpet Area
          </label>
          <input
            className={inputClass}
            value={form.carpetArea}
            onChange={(e) =>
              setForm((f) => ({ ...f, carpetArea: e.target.value }))
            }
            placeholder="650 – 1450 sq.ft"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Possession Date *
          </label>
          <input
            className={inputClass}
            value={form.possession}
            onChange={(e) =>
              setForm((f) => ({ ...f, possession: e.target.value }))
            }
            placeholder="Dec 2026"
          />
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Badge
          </label>
          <select
            className={inputClass}
            value={form.badge}
            onChange={(e) =>
              setForm((f) => ({ ...f, badge: e.target.value }))
            }
          >
            {['Premium', 'New Launch', 'Luxury', 'Best Seller', 'Ultra Luxury'].map(
              (b) => (
                <option key={b} value={b} className="bg-charcoal">
                  {b}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            VR Tour Type
          </label>
          <select
            className={inputClass}
            value={form.vrTourType}
            onChange={(e) =>
              setForm((f) => ({ ...f, vrTourType: e.target.value }))
            }
          >
            {vrTypes.map((t) => (
              <option key={t} value={t} className="bg-charcoal">
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            VR Tour URL
          </label>
          <input
            className={inputClass}
            value={form.vrTourUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, vrTourUrl: e.target.value }))
            }
            placeholder="https://..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Description
          </label>
          <textarea
            className={`${inputClass} min-h-[120px] resize-y`}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Project description..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-1.5 block">
            Project Images (URLs)
          </label>

          <div className="space-y-2">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  value={img}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder="Image URL"
                />

                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="text-red-400 hover:text-red-300 px-2 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="text-champagne-gold font-sans text-sm hover:underline"
            >
              + Add Image
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-muted-gray font-sans text-xs uppercase tracking-wider mb-3 block">
            Amenities
          </label>

          <div className="flex flex-wrap gap-2">
            {allAmenities.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs transition ${
                  form.amenities.includes(a)
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
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, featured: e.target.checked }))
              }
              className="accent-champagne-gold"
            />
            <span className="text-white font-sans text-sm">
              Featured Project
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.vrAvailable}
              onChange={(e) =>
                setForm((f) => ({ ...f, vrAvailable: e.target.checked }))
              }
              className="accent-champagne-gold"
            />
            <span className="text-white font-sans text-sm">
              VR Available
            </span>
          </label>
        </div>

        <div className="md:col-span-2 flex gap-4 pt-4">
          <motion.button
            whileHover={{ y: -1 }}
            onClick={() => handleSave('draft')}
            className="bg-white/5 border border-white/10 text-white font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:border-champagne-gold/30 transition"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </motion.button>

          <motion.button
            whileHover={{ y: -1 }}
            onClick={() => handleSave('published')}
            className="bg-champagne-gold text-deep-black font-sans font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-soft-gold transition"
          >
            <Send className="w-4 h-4" />
            Publish Project
          </motion.button>
        </div>
      </div>
    </div>
  );
}