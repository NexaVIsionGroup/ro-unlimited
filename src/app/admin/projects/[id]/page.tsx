'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Save, Loader2, Check, X, Plus, Trash2, Upload, Download,
  Globe, GlobeLock, Camera, FileText, Users, Info, Eye,
  MapPin, Calendar, DollarSign, Ruler, Phone, Mail, StickyNote,
  ChevronDown, ExternalLink,
} from 'lucide-react';
import { uploadToStorage, formatFileSize, getAcceptTypes, type FileCategory } from '@/lib/storage/upload';

// ── Types ─────────────────────────────────────────────────────────────────

interface Vendor {
  _key: string;
  name: string;
  trade: string;
  contact: string;
  phone: string;
  email: string;
  notes: string;
  cost: string;
}

interface ProjectFile {
  _key: string;
  assetId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  category: FileCategory;
  uploadedAt: string;
  provider: 'sanity' | 'b2';
}

interface SiteData {
  publicTitle: string;
  publicDescription: string;
  heroAssetId: string;
  heroUrl: string;
  selectedMedia: string[];
  displayOrder: string[];
}

interface Project {
  _id: string;
  title: string;
  division: string;
  status: string;
  address: string;
  city: string;
  state: string;
  startDate: string;
  completionDate: string;
  scopeDescription: string;
  estimatedValue: string;
  sqft: string;
  notes: string;
  vendors: Vendor[];
  files: ProjectFile[];
  publishedToSite: boolean;
  siteData: SiteData;
}

// ── Constants ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'details',   label: 'Details',       icon: Info      },
  { id: 'vendors',   label: 'Team & Vendors', icon: Users     },
  { id: 'media',     label: 'Media',          icon: Camera    },
  { id: 'documents', label: 'Documents',      icon: FileText  },
  { id: 'publish',   label: 'Publish to Site',icon: Globe     },
] as const;

type TabId = typeof TABS[number]['id'];

const DOC_CATEGORIES: { id: FileCategory; label: string }[] = [
  { id: 'permit',   label: 'Permit'    },
  { id: 'contract', label: 'Contract'  },
  { id: 'receipt',  label: 'Receipt'   },
  { id: 'drawing',  label: 'Drawing'   },
  { id: 'document', label: 'Document'  },
  { id: 'other',    label: 'Other'     },
];

const TRADES = [
  'General', 'Framing', 'Electrical', 'Plumbing', 'HVAC', 'Roofing',
  'Concrete', 'Masonry', 'Drywall', 'Flooring', 'Painting', 'Landscaping',
  'Excavation', 'Grading', 'Lumber Supplier', 'Hardware Supplier',
  'Appliance Supplier', 'Tile/Stone', 'Cabinets', 'Windows/Doors', 'Insulation', 'Other',
];

// ── Component ─────────────────────────────────────────────────────────────

export default function ProjectFilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject]   = useState<Project | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState<TabId>('details');
  const [message, setMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCategoryRef = useRef<FileCategory>('photo');

  // Fetch project
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/projects?id=${id}`)
      .then(r => r.json())
      .then(data => { setProject(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  // Save any field(s) to Sanity
  const save = useCallback(async (updates: Partial<Project>) => {
    if (!project) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project._id, ...updates }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProject(prev => prev ? { ...prev, ...updates } : prev);
      showMsg('success', 'Saved');
    } catch (e: any) {
      showMsg('error', e.message || 'Save failed');
    } finally { setSaving(false); }
  }, [project]);

  // Upload file
  const handleFileUpload = async (file: File, category: FileCategory) => {
    if (!project) return;
    setUploading(true);
    try {
      const result = await uploadToStorage(file, category);
      const newFile: ProjectFile = {
        _key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        assetId: result.assetId,
        url: result.url,
        filename: result.filename,
        mimeType: result.mimeType,
        size: result.size,
        category,
        uploadedAt: new Date().toISOString(),
        provider: result.provider,
      };
      const updatedFiles = [...(project.files || []), newFile];
      await save({ files: updatedFiles });
    } catch (e: any) {
      showMsg('error', e.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const deleteFile = async (key: string) => {
    if (!project || !confirm('Remove this file from the project?')) return;
    const updatedFiles = project.files.filter(f => f._key !== key);
    await save({ files: updatedFiles });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-white/30">Project not found</p>
    </div>
  );

  const mediaFiles = project.files?.filter(f => f.category === 'photo' || f.category === 'video') || [];
  const docFiles   = project.files?.filter(f => !['photo','video'].includes(f.category)) || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminHeader
        title={project.title}
        subtitle={`${project.division.charAt(0).toUpperCase() + project.division.slice(1)} · ${[project.city, project.state].filter(Boolean).join(', ') || 'No location set'}`}
        backHref="/admin/projects"
      />

      {/* Sticky message */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg border text-xs flex items-center gap-2 shadow-xl ${
          message.type === 'success' ? 'bg-[#0a1a0a] border-green-500/30 text-green-400' : 'bg-[#1a0a0a] border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? <Check size={12} /> : <X size={12} />}
          {message.text}
        </div>
      )}

      {/* Published banner */}
      {project.publishedToSite && (
        <div className="bg-emerald-500/5 border-b border-emerald-500/10 px-6 py-2 flex items-center justify-center gap-2">
          <Globe size={11} className="text-emerald-400" />
          <span className="text-[11px] text-emerald-400">Published to site</span>
          {project.siteData?.publicTitle && (
            <span className="text-[11px] text-emerald-400/40">— "{project.siteData.publicTitle}"</span>
          )}
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 flex gap-0">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setTab(tabId)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-medium border-b-2 transition-all ${
                tab === tabId
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-white/25 hover:text-white/50'
              }`}
            >
              <Icon size={12} />
              {label}
              {tabId === 'media'     && mediaFiles.length > 0 && <span className="ml-1 text-[9px] bg-white/10 px-1 rounded">{mediaFiles.length}</span>}
              {tabId === 'documents' && docFiles.length > 0   && <span className="ml-1 text-[9px] bg-white/10 px-1 rounded">{docFiles.length}</span>}
              {tabId === 'vendors'   && (project.vendors?.length || 0) > 0 && <span className="ml-1 text-[9px] bg-white/10 px-1 rounded">{project.vendors.length}</span>}
            </button>
          ))}

          {/* Save indicator */}
          {saving && (
            <div className="ml-auto flex items-center gap-1.5 py-3.5 pr-2 text-[11px] text-white/30">
              <Loader2 size={11} className="animate-spin" /> Saving...
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── DETAILS TAB ─────────────────────────────────────────────── */}
        {tab === 'details' && (
          <DetailsTab project={project} onSave={save} />
        )}

        {/* ── VENDORS TAB ─────────────────────────────────────────────── */}
        {tab === 'vendors' && (
          <VendorsTab project={project} onSave={save} />
        )}

        {/* ── MEDIA TAB ───────────────────────────────────────────────── */}
        {tab === 'media' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold">Photos & Videos</h2>
                <p className="text-[11px] text-white/25 mt-0.5">{mediaFiles.length} files · stored in project master file</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { uploadCategoryRef.current = 'photo'; fileInputRef.current?.click(); }}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-xs text-white/60 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Camera size={12} /> Add Photo
                </button>
                <button
                  onClick={() => { uploadCategoryRef.current = 'video'; fileInputRef.current?.click(); }}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-xs text-white/60 rounded-lg hover:bg-white/10 transition-all"
                >
                  <Upload size={12} /> Add Video
                </button>
              </div>
            </div>

            {uploading && (
              <div className="mb-4 p-3 bg-[#C9A84C]/5 border border-[#C9A84C]/15 rounded-lg flex items-center gap-2 text-xs text-[#C9A84C]/60">
                <Loader2 size={12} className="animate-spin" /> Uploading...
              </div>
            )}

            {mediaFiles.length === 0 ? (
              <div className="text-center py-16 bg-[#111] border border-dashed border-white/10 rounded-xl">
                <Camera size={32} className="mx-auto mb-2 text-white/10" />
                <p className="text-white/25 text-sm">No photos or videos yet</p>
                <p className="text-white/15 text-xs mt-1">Upload job site photos, progress shots, completed work</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {mediaFiles.map(file => (
                  <div key={file._key} className="relative group aspect-[4/3] bg-black rounded-lg overflow-hidden border border-white/5">
                    {file.mimeType?.startsWith('video/') ? (
                      <video src={file.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer"
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                      <button onClick={() => deleteFile(file._key)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] text-white/50 truncate">{file.filename}</p>
                      <p className="text-[9px] text-white/25">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ───────────────────────────────────────────── */}
        {tab === 'documents' && (
          <DocumentsTab
            project={project}
            docFiles={docFiles}
            uploading={uploading}
            onUpload={(cat) => { uploadCategoryRef.current = cat; fileInputRef.current?.click(); }}
            onDelete={deleteFile}
          />
        )}

        {/* ── PUBLISH TAB ─────────────────────────────────────────────── */}
        {tab === 'publish' && (
          <PublishTab project={project} mediaFiles={mediaFiles} onSave={save} />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={getAcceptTypes(uploadCategoryRef.current)}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, uploadCategoryRef.current);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ── DETAILS TAB ────────────────────────────────────────────────────────────

function DetailsTab({ project, onSave }: { project: Project; onSave: (u: Partial<Project>) => Promise<void> }) {
  const [form, setForm] = useState({
    title: project.title, division: project.division, status: project.status,
    address: project.address || '', city: project.city || '', state: project.state || 'SC',
    startDate: project.startDate || '', completionDate: project.completionDate || '',
    scopeDescription: project.scopeDescription || '',
    estimatedValue: project.estimatedValue || '', sqft: project.sqft || '', notes: project.notes || '',
  });

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none";
  const labelCls = "block text-[10px] text-white/30 uppercase tracking-wider mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Project Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Project Name</label>
            <input {...field('title')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Division</label>
            <select {...field('division')} className={inputCls}>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="grading">Land Grading</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select {...field('status')} className={inputCls}>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" {...field('startDate')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Completion Date</label>
            <input type="date" {...field('completionDate')} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Location</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3">
            <label className={labelCls}>Street Address</label>
            <input {...field('address')} placeholder="123 Main St" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>City</label>
            <input {...field('city')} placeholder="Greenville" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>State</label>
            <input {...field('state')} placeholder="SC" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Scope & Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}><DollarSign size={9} className="inline mr-1" />Est. Value / Contract</label>
            <input {...field('estimatedValue')} placeholder="e.g. $285,000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}><Ruler size={9} className="inline mr-1" />Square Footage</label>
            <input {...field('sqft')} placeholder="e.g. 2,400 sqft" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Scope Description</label>
            <textarea {...field('scopeDescription')} rows={3} placeholder="Brief description of the project scope, type of work, key deliverables..."
              className={`${inputCls} resize-none`} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}><StickyNote size={9} className="inline mr-1" />Internal Notes</label>
            <textarea {...field('notes')} rows={3} placeholder="Internal notes — not visible on site. Record anything relevant: inspector name, HOA contact, special conditions, etc."
              className={`${inputCls} resize-none`} />
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave(form)}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-black text-xs font-bold rounded-lg hover:bg-[#d4b55a] transition-colors"
      >
        <Save size={13} /> Save Details
      </button>
    </div>
  );
}

// ── VENDORS TAB ────────────────────────────────────────────────────────────

function VendorsTab({ project, onSave }: { project: Project; onSave: (u: Partial<Project>) => Promise<void> }) {
  const [vendors, setVendors] = useState<Vendor[]>(project.vendors || []);
  const [adding, setAdding]   = useState(false);
  const [newV, setNewV]       = useState({ name: '', trade: 'General', contact: '', phone: '', email: '', notes: '', cost: '' });

  const addVendor = async () => {
    if (!newV.name.trim()) return;
    const updated = [...vendors, { ...newV, _key: `${Date.now()}` }];
    setVendors(updated);
    await onSave({ vendors: updated });
    setNewV({ name: '', trade: 'General', contact: '', phone: '', email: '', notes: '', cost: '' });
    setAdding(false);
  };

  const removeVendor = async (key: string) => {
    if (!confirm('Remove this vendor from the project?')) return;
    const updated = vendors.filter(v => v._key !== key);
    setVendors(updated);
    await onSave({ vendors: updated });
  };

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold">Team & Vendors</h2>
          <p className="text-[11px] text-white/25 mt-0.5">Subs, suppliers, and contacts associated with this project</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#C9A84C]/15 border border-[#C9A84C]/20 text-[#C9A84C] text-xs rounded-lg hover:bg-[#C9A84C]/25 transition-all">
          <Plus size={12} /> Add Vendor
        </button>
      </div>

      {adding && (
        <div className="mb-5 bg-[#111] border border-[#C9A84C]/15 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-[#C9A84C]/70 mb-3">New Vendor / Contact</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Company / Name *</label>
              <input value={newV.name} onChange={e => setNewV(v => ({ ...v, name: e.target.value }))} placeholder="ABC Electrical" className={inputCls} /></div>
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Trade / Type</label>
              <select value={newV.trade} onChange={e => setNewV(v => ({ ...v, trade: e.target.value }))} className={inputCls}>
                {TRADES.map(t => <option key={t}>{t}</option>)}
              </select></div>
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Contact Name</label>
              <input value={newV.contact} onChange={e => setNewV(v => ({ ...v, contact: e.target.value }))} placeholder="John Smith" className={inputCls} /></div>
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Phone</label>
              <input value={newV.phone} onChange={e => setNewV(v => ({ ...v, phone: e.target.value }))} placeholder="(864) 555-1234" className={inputCls} /></div>
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Email</label>
              <input value={newV.email} onChange={e => setNewV(v => ({ ...v, email: e.target.value }))} placeholder="john@example.com" className={inputCls} /></div>
            <div><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Cost / Invoice Total</label>
              <input value={newV.cost} onChange={e => setNewV(v => ({ ...v, cost: e.target.value }))} placeholder="e.g. $12,400" className={inputCls} /></div>
            <div className="col-span-2"><label className="block text-[9px] text-white/30 uppercase tracking-wider mb-1">Notes</label>
              <input value={newV.notes} onChange={e => setNewV(v => ({ ...v, notes: e.target.value }))} placeholder="Any relevant notes, warranty info, issues, etc." className={inputCls} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={addVendor} disabled={!newV.name.trim()} className="px-4 py-2 bg-[#C9A84C] text-black text-xs font-bold rounded-lg disabled:opacity-40">Add Vendor</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-xs text-white/30 border border-white/10 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {vendors.length === 0 ? (
        <div className="text-center py-14 bg-[#111] border border-dashed border-white/10 rounded-xl">
          <Users size={32} className="mx-auto mb-2 text-white/10" />
          <p className="text-white/25 text-sm">No vendors added yet</p>
          <p className="text-white/15 text-xs mt-1">Track every sub, supplier, and contact for this job</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vendors.map(v => (
            <div key={v._key} className="bg-[#111] border border-white/5 rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{v.name}</span>
                  <span className="text-[10px] text-white/25 bg-white/5 px-2 py-0.5 rounded">{v.trade}</span>
                  {v.cost && <span className="text-[10px] text-[#C9A84C]/60">{v.cost}</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-white/30">
                  {v.contact && <span><Users size={9} className="inline mr-1" />{v.contact}</span>}
                  {v.phone   && <span><Phone size={9} className="inline mr-1" />{v.phone}</span>}
                  {v.email   && <span><Mail size={9} className="inline mr-1" />{v.email}</span>}
                </div>
                {v.notes && <p className="text-[11px] text-white/20 mt-1 italic">{v.notes}</p>}
              </div>
              <button onClick={() => removeVendor(v._key)} className="text-white/10 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── DOCUMENTS TAB ─────────────────────────────────────────────────────────

function DocumentsTab({ project, docFiles, uploading, onUpload, onDelete }: {
  project: Project;
  docFiles: ProjectFile[];
  uploading: boolean;
  onUpload: (cat: FileCategory) => void;
  onDelete: (key: string) => void;
}) {
  const [uploadCat, setUploadCat] = useState<FileCategory>('receipt');

  const catColor: Record<string, string> = {
    permit:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    contract: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    receipt:  'text-amber-400 bg-amber-500/10 border-amber-500/20',
    drawing:  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    document: 'text-white/40 bg-white/5 border-white/10',
    other:    'text-white/20 bg-white/5 border-white/10',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold">Documents, Permits & Receipts</h2>
          <p className="text-[11px] text-white/25 mt-0.5">{docFiles.length} files · permanent project record</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={uploadCat} onChange={e => setUploadCat(e.target.value as FileCategory)}
            className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white/60 focus:outline-none">
            {DOC_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <button onClick={() => onUpload(uploadCat)} disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-xs text-white/60 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50">
            {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload {DOC_CATEGORIES.find(c => c.id === uploadCat)?.label}
          </button>
        </div>
      </div>

      {docFiles.length === 0 ? (
        <div className="text-center py-14 bg-[#111] border border-dashed border-white/10 rounded-xl">
          <FileText size={32} className="mx-auto mb-2 text-white/10" />
          <p className="text-white/25 text-sm">No documents yet</p>
          <p className="text-white/15 text-xs mt-1">Upload permits, contracts, receipts, drawings — all stored permanently in this project file</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docFiles.map(file => (
            <div key={file._key} className="bg-[#111] border border-white/5 rounded-xl px-5 py-3.5 flex items-center gap-4">
              <FileText size={16} className="text-white/20 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 truncate">{file.filename}</span>
                  <span className={`flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded border ${catColor[file.category] || catColor.other}`}>
                    {file.category}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] text-white/20 mt-0.5">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a href={file.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 border border-white/10 text-[11px] text-white/50 rounded-lg hover:bg-white/10 transition-colors">
                  <Download size={11} /> View
                </a>
                <button onClick={() => onDelete(file._key)} className="p-1.5 text-white/10 hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PUBLISH TAB ────────────────────────────────────────────────────────────

function PublishTab({ project, mediaFiles, onSave }: {
  project: Project;
  mediaFiles: ProjectFile[];
  onSave: (u: Partial<Project>) => Promise<void>;
}) {
  const [published, setPublished]   = useState(project.publishedToSite);
  const [siteData, setSiteData]     = useState<SiteData>(project.siteData || {
    publicTitle: project.title, publicDescription: '', heroAssetId: '', heroUrl: '',
    selectedMedia: [], displayOrder: [],
  });

  const togglePublish = async () => {
    const next = !published;
    setPublished(next);
    await onSave({ publishedToSite: next, siteData });
  };

  const saveSiteData = async () => {
    await onSave({ publishedToSite: published, siteData });
  };

  const toggleMediaSelection = (key: string) => {
    setSiteData(s => ({
      ...s,
      selectedMedia: s.selectedMedia.includes(key)
        ? s.selectedMedia.filter(k => k !== key)
        : [...s.selectedMedia, key],
    }));
  };

  const inputCls = "w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none";

  return (
    <div className="space-y-5">
      {/* Publish toggle */}
      <div className={`rounded-xl border p-5 ${published ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-[#111] border-white/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {published ? <Globe size={18} className="text-emerald-400" /> : <GlobeLock size={18} className="text-white/20" />}
            <div>
              <h2 className="text-sm font-semibold">{published ? 'Published to Website' : 'Not Published'}</h2>
              <p className="text-[11px] text-white/25 mt-0.5">
                {published ? 'This project appears in the public portfolio' : 'Only visible in the admin — not on the public site'}
              </p>
            </div>
          </div>
          <button
            onClick={togglePublish}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              published
                ? 'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20'
                : 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
            }`}
          >
            {published ? 'Unpublish' : 'Publish to Site'}
          </button>
        </div>
      </div>

      {/* Site content editor */}
      <div className="bg-[#111] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Public Portfolio Content</h3>
        <p className="text-[11px] text-white/20">This is what visitors see on the site. Internal notes and vendor info never appear here.</p>

        <div>
          <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Public Title</label>
          <input value={siteData.publicTitle}
            onChange={e => setSiteData(s => ({ ...s, publicTitle: e.target.value }))}
            placeholder="Project title shown on website"
            className={inputCls} />
        </div>

        <div>
          <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Public Description</label>
          <textarea value={siteData.publicDescription}
            onChange={e => setSiteData(s => ({ ...s, publicDescription: e.target.value }))}
            rows={4}
            placeholder="Describe this project for potential clients — what was built, key features, scope..."
            className={`${inputCls} resize-none`} />
        </div>

        {/* Hero image picker */}
        {mediaFiles.length > 0 && (
          <div>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-2">Hero Image (shown first)</label>
            <div className="grid grid-cols-4 gap-2">
              {mediaFiles.map(f => (
                <button
                  key={f._key}
                  onClick={() => setSiteData(s => ({ ...s, heroAssetId: f.assetId, heroUrl: f.url }))}
                  className={`aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    siteData.heroAssetId === f.assetId ? 'border-[#C9A84C]' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Select which photos appear on site */}
        {mediaFiles.length > 0 && (
          <div>
            <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">
              Select Photos for Portfolio <span className="text-white/20 normal-case ml-1">({siteData.selectedMedia.length} selected)</span>
            </label>
            <p className="text-[10px] text-white/15 mb-2">Only selected photos appear on the public project page</p>
            <div className="grid grid-cols-4 gap-2">
              {mediaFiles.map(f => (
                <button
                  key={f._key}
                  onClick={() => toggleMediaSelection(f._key)}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
                    siteData.selectedMedia.includes(f._key) ? 'border-emerald-500/60' : 'border-white/5 opacity-50'
                  }`}
                >
                  <img src={f.url} alt="" className="w-full h-full object-cover" />
                  {siteData.selectedMedia.includes(f._key) && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check size={10} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={saveSiteData}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-black text-xs font-bold rounded-lg hover:bg-[#d4b55a] transition-colors">
          <Save size={13} /> Save Portfolio Content
        </button>
      </div>
    </div>
  );
}
