'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus, FolderOpen, MapPin, Calendar, Camera, FileText,
  Globe, Loader2, ChevronRight, Check, X
} from 'lucide-react';

interface ProjectSummary {
  _id: string;
  title: string;
  division: string;
  status: 'active' | 'complete' | 'archived';
  city: string;
  state: string;
  startDate: string | null;
  completionDate: string | null;
  publishedToSite: boolean;
  photoCount: number;
  docCount: number;
  heroUrl: string | null;
}

const DIVISIONS = [
  { id: 'all',         label: 'All Projects' },
  { id: 'residential', label: 'Residential'  },
  { id: 'commercial',  label: 'Commercial'   },
  { id: 'grading',     label: 'Land Grading' },
];

const STATUS_COLORS = {
  active:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  complete: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  archived: 'bg-white/5 text-white/20 border-white/10',
};

const DIVISION_COLORS: Record<string, string> = {
  residential: 'text-amber-400',
  commercial:  'text-sky-400',
  grading:     'text-emerald-400',
};

export default function ProjectsPage() {
  const [projects, setProjects]       = useState<ProjectSummary[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [showCreate, setShowCreate]   = useState(false);
  const [creating, setCreating]       = useState(false);
  const [message, setMessage]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create form fields
  const [title,       setTitle]       = useState('');
  const [division,    setDivision]    = useState('residential');
  const [city,        setCity]        = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [scopeDesc,   setScopeDesc]   = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch { setProjects([]); }
    finally { setLoading(false); }
  };

  const createProject = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, division, city, state: 'SC', startDate: startDate || null, scopeDescription: scopeDesc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessage({ type: 'success', text: `"${title}" created` });
      setShowCreate(false);
      setTitle(''); setDivision('residential'); setCity(''); setStartDate(''); setScopeDesc('');
      await fetchProjects();
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'Failed to create project' });
    } finally { setCreating(false); }
  };

  const filtered = filter === 'all' ? projects : projects.filter(p => p.division === filter);

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminHeader title="Project Files" subtitle="Master records for every job" backHref="/admin" />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Message */}
        {message && (
          <div className={`mb-5 p-3 rounded-lg border text-sm flex items-center justify-between ${
            message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check size={14} /> : <X size={14} />}
              {message.text}
            </div>
            <button onClick={() => setMessage(null)}><X size={14} className="opacity-50 hover:opacity-100" /></button>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {DIVISIONS.map(d => {
              const count = d.id === 'all' ? projects.length : projects.filter(p => p.division === d.id).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setFilter(d.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                    filter === d.id
                      ? 'bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30'
                      : 'text-white/30 border border-white/5 hover:border-white/10 hover:text-white/50'
                  }`}
                >
                  {d.label} <span className="opacity-50 ml-1">({count})</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-black text-xs font-bold rounded-lg hover:bg-[#d4b55a] transition-colors"
          >
            <Plus size={14} /> New Project
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-6 bg-[#111] border border-[#C9A84C]/20 rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4 text-[#C9A84C]">New Project File</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="col-span-2">
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Project Name *</label>
                <input
                  value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Lakeside Custom Home · Anderson SC"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Division</label>
                <select value={division} onChange={e => setDivision(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#C9A84C]/40 focus:outline-none">
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="grading">Land Grading</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Greenville"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Start Date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:border-[#C9A84C]/40 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1">Scope (optional)</label>
                <input value={scopeDesc} onChange={e => setScopeDesc(e.target.value)} placeholder="Brief scope description"
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/40 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={createProject} disabled={creating || !title.trim()}
                className="px-4 py-2 bg-[#C9A84C] text-black text-xs font-bold rounded-lg hover:bg-[#d4b55a] disabled:opacity-40 transition-all flex items-center gap-2">
                {creating ? <><Loader2 size={12} className="animate-spin" />Creating...</> : 'Create Project File'}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-xs text-white/30 hover:text-white border border-white/10 rounded-lg transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Project list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin text-[#C9A84C]" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-[#111] border border-white/5 rounded-xl">
            <FolderOpen size={36} className="mx-auto mb-3 text-white/10" />
            <p className="text-white/30 text-sm mb-1">No project files yet</p>
            <p className="text-white/15 text-xs">Create your first project file to start building the master record.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(project => (
              <Link
                key={project._id}
                href={`/admin/projects/${project._id}`}
                className="block bg-[#111] border border-white/5 hover:border-white/10 rounded-xl overflow-hidden transition-all group"
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-black/50 border border-white/5 overflow-hidden flex-shrink-0">
                    {project.heroUrl
                      ? <img src={project.heroUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><FolderOpen size={20} className="text-white/10" /></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold truncate">{project.title}</h3>
                      {project.publishedToSite && (
                        <span className="flex-shrink-0 flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Globe size={8} /> Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/25">
                      <span className={`font-medium ${DIVISION_COLORS[project.division] || 'text-white/30'}`}>
                        {project.division.charAt(0).toUpperCase() + project.division.slice(1)}
                      </span>
                      {(project.city || project.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin size={9} />
                          {[project.city, project.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={9} />
                          {formatDate(project.startDate)}
                          {project.completionDate && <> → {formatDate(project.completionDate)}</>}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white/60">{project.photoCount}</div>
                      <div className="text-[9px] text-white/20 flex items-center gap-0.5"><Camera size={8} /> media</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white/60">{project.docCount}</div>
                      <div className="text-[9px] text-white/20 flex items-center gap-0.5"><FileText size={8} /> docs</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>
                      {project.status}
                    </span>
                    <ChevronRight size={14} className="text-white/15 group-hover:text-white/30 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
