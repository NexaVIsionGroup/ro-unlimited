'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Plus, Upload, Trash2, GripVertical, Loader2, Check, X, Camera } from 'lucide-react';
import Link from 'next/link';

interface ProjectPhoto {
  url: string;
  assetId: string;
  alt?: string;
  caption?: string;
}

interface Project {
  _id: string;
  title: string;
  division: string;
  description?: string;
  order: number;
  photos: ProjectPhoto[];
}

const DIVISIONS = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'grading', label: 'Land Grading' },
  { id: 'process', label: 'Build Process' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDivision, setNewDivision] = useState('residential');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string>('');

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch projects:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const createProject = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, division: newDivision, description: newDescription }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Project "${newTitle}" created!` });
        setNewTitle('');
        setNewDescription('');
        setShowCreate(false);
        await fetchProjects();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to create project' });
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: `"${title}" deleted.` });
      await fetchProjects();
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  const uploadPhoto = async (projectId: string, file: File) => {
    setUploading(projectId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.error) throw new Error(uploadData.error);

      // Add photo to project
      const project = projects.find(p => p._id === projectId);
      const existingPhotos = project?.photos || [];

      await fetch('/api/admin/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: projectId,
          photos: [...existingPhotos.map(p => ({
            _type: 'image',
            asset: { _type: 'reference', _ref: p.assetId },
            alt: p.alt,
            caption: p.caption,
          })), {
            _type: 'image',
            asset: { _type: 'reference', _ref: uploadData.assetId },
          }],
        }),
      });

      setMessage({ type: 'success', text: 'Photo added!' });
      await fetchProjects();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Upload failed' });
    } finally {
      setUploading(null);
    }
  };

  const filtered = filterDivision === 'all' ? projects : projects.filter(p => p.division === filterDivision);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Project Portfolio</h1>
              <p className="text-[11px] text-white/30 tracking-wide uppercase">Manage project photos by division</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black text-xs font-semibold rounded hover:bg-[#d4b55a] transition-colors"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-3 rounded-lg border text-sm flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {message.text}
            </div>
            <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100"><X size={14} /></button>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreate && (
          <div className="mb-8 bg-[#111] border border-[#C9A84C]/20 rounded-lg p-6">
            <h2 className="text-base font-semibold mb-4">New Project</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Project Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Lakeside Custom Home"
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Division</label>
                <select
                  value={newDivision}
                  onChange={e => setNewDivision(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-[#C9A84C]/50 focus:outline-none"
                >
                  {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Description (optional)</label>
              <textarea
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="Brief description of the project..."
                rows={2}
                className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/50 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createProject}
                disabled={creating || !newTitle.trim()}
                className="px-4 py-2 bg-[#C9A84C] text-black text-xs font-semibold rounded hover:bg-[#d4b55a] disabled:opacity-50 transition-all"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-white/40 hover:text-white border border-white/10 rounded transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilterDivision('all')}
            className={`px-3 py-1.5 text-xs rounded transition-all ${filterDivision === 'all' ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30' : 'text-white/30 border border-white/5 hover:border-white/10'}`}
          >
            All ({projects.length})
          </button>
          {DIVISIONS.map(d => {
            const count = projects.filter(p => p.division === d.id).length;
            return (
              <button
                key={d.id}
                onClick={() => setFilterDivision(d.id)}
                className={`px-3 py-1.5 text-xs rounded transition-all ${filterDivision === d.id ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30' : 'text-white/30 border border-white/5 hover:border-white/10'}`}
              >
                {d.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[#111] border border-white/5 rounded-lg">
            <Camera size={32} className="mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm mb-1">No projects yet</p>
            <p className="text-white/15 text-xs">Click "New Project" to add your first project and upload photos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(project => (
              <div key={project._id} className="bg-[#111] border border-white/5 rounded-lg overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{project.title}</h3>
                      <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded uppercase tracking-wider">
                        {DIVISIONS.find(d => d.id === project.division)?.label}
                      </span>
                    </div>
                    {project.description && <p className="text-xs text-white/30 mt-0.5">{project.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/20">{project.photos?.length || 0} photos</span>
                    <button
                      onClick={() => deleteProject(project._id, project.title)}
                      className="p-1.5 text-red-400/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {/* Photo grid */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {project.photos?.map((photo, i) => (
                      <div key={i} className="aspect-[4/3] bg-black rounded overflow-hidden border border-white/5">
                        <img src={photo.url} alt={photo.alt || ''} className="w-full h-full object-cover" />
                      </div>
                    ))}

                    {/* Upload button */}
                    <button
                      onClick={() => {
                        uploadTargetRef.current = project._id;
                        fileInputRef.current?.click();
                      }}
                      disabled={uploading === project._id}
                      className="aspect-[4/3] border-2 border-dashed border-white/10 hover:border-[#C9A84C]/30 rounded flex flex-col items-center justify-center gap-1 text-white/20 hover:text-[#C9A84C] transition-all"
                    >
                      {uploading === project._id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Upload size={18} />
                          <span className="text-[10px]">Add Photo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file && uploadTargetRef.current) {
            uploadPhoto(uploadTargetRef.current, file);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}
