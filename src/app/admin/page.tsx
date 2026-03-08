'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type Tab = 'editor' | 'leads' | 'projects' | 'settings';

interface SiteSettings {
  heroVideoUrl?: string;
  heroVideoAssetId?: string;
  heroVideoPosterUrl?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroDescription?: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [settings, setSettings] = useState<SiteSettings>({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load current settings
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // Upload file to Sanity via our API
  const handleUpload = async (file: File, type: 'video' | 'image', field: string) => {
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (uploadData.error) throw new Error(uploadData.error);

      setUploadProgress('Saving to site settings...');

      // Link asset to settings
      const settingsRes = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, assetRef: uploadData.assetId }),
      });

      const settingsData = await settingsRes.json();
      if (settingsData.error) throw new Error(settingsData.error);

      setUploadProgress('Done!');
      await loadSettings();
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (err: any) {
      setUploadProgress(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Save text field
  const saveField = async (field: string, value: string) => {
    setSaving(true);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      });
      setLastSaved(field);
      await loadSettings();
      setTimeout(() => setLastSaved(''), 2000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'editor', label: 'Site Editor', icon: '\u270f\ufe0f' },
    { id: 'leads', label: 'Leads', icon: '\ud83d\udce9' },
    { id: 'projects', label: 'Projects', icon: '\ud83d\udcf7' },
    { id: 'settings', label: 'Settings', icon: '\u2699\ufe0f' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-ro-gold/20 bg-[#111]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ro-gold flex items-center justify-center">
              <span className="text-black font-heading text-sm font-bold">RoU</span>
            </div>
            <div>
              <h1 className="font-heading text-lg tracking-wider uppercase text-ro-gold">Admin Dashboard</h1>
              <p className="text-xs text-ro-gray-500">RO Unlimited Site Manager</p>
            </div>
          </div>
          <a href="/" className="text-xs text-ro-gray-500 hover:text-ro-gold transition-colors uppercase tracking-wider">
            View Live Site &rarr;
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <nav className="flex gap-1 mb-8 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-heading tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'text-ro-gold border-b-2 border-ro-gold bg-ro-gold/5'
                  : 'text-ro-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {activeTab === 'editor' && (
          <div className="space-y-8">
            {/* Hero Video Section */}
            <section className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg tracking-wider uppercase">Hero Video</h2>
                  <p className="text-sm text-ro-gray-500 mt-1">Background video for the homepage hero section</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-mono ${settings.heroVideoUrl ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'}`}>
                  {settings.heroVideoUrl ? 'ACTIVE' : 'NO VIDEO'}
                </div>
              </div>

              <div className="p-6">
                {/* Current Video Preview */}
                {settings.heroVideoUrl && (
                  <div className="mb-6 relative aspect-video bg-black rounded-lg overflow-hidden border border-white/5">
                    <video
                      src={settings.heroVideoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-xs text-ro-gray-400 font-mono">
                      Current Hero Video
                    </div>
                  </div>
                )}

                {/* Upload Zone */}
                <div
                  onClick={() => !uploading && videoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    uploading
                      ? 'border-ro-gold/50 bg-ro-gold/5'
                      : 'border-white/20 hover:border-ro-gold/50 hover:bg-ro-gold/5'
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/mov"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file, 'video', 'heroVideo');
                    }}
                  />

                  {uploading ? (
                    <div>
                      <div className="w-8 h-8 border-2 border-ro-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-ro-gold font-mono text-sm">{uploadProgress}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-3">\ud83c\udfa5</div>
                      <p className="text-white font-heading tracking-wider uppercase mb-2">
                        {settings.heroVideoUrl ? 'Replace Hero Video' : 'Upload Hero Video'}
                      </p>
                      <p className="text-ro-gray-500 text-sm">
                        MP4, WebM, or MOV. Recommended: 15-30s loop, 1080p or higher.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Hero Text Section */}
            <section className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10">
                <h2 className="font-heading text-lg tracking-wider uppercase">Hero Text</h2>
                <p className="text-sm text-ro-gray-500 mt-1">Edit the homepage headline and description</p>
              </div>

              <div className="p-6 space-y-6">
                {/* These are for future use - the current hero uses constants.ts */}
                <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    <strong>Note:</strong> Hero text currently comes from the site code. Once CMS text editing is enabled, you will be able to edit it here.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-ro-gray-500 uppercase tracking-wider mb-2">Current Headline</label>
                  <div className="text-white/60 text-lg font-heading">We Build Everything From the Ground Up</div>
                </div>

                <div>
                  <label className="block text-xs text-ro-gray-500 uppercase tracking-wider mb-2">Current Description</label>
                  <div className="text-white/40 text-sm">Complete commercial and residential construction. Land grading to luxury finishes. One company \u2014 total capability.</div>
                </div>
              </div>
            </section>

            {/* Division Videos (Future) */}
            <section className="bg-[#111] border border-white/10 rounded-lg overflow-hidden opacity-50">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg tracking-wider uppercase">Division Videos</h2>
                  <p className="text-sm text-ro-gray-500 mt-1">Background videos for each division page hero</p>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded text-xs text-ro-gray-500 font-mono">COMING SOON</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {['Residential', 'Commercial', 'Land Grading', 'Build Process'].map((div) => (
                    <div key={div} className="aspect-video bg-black/50 rounded-lg border border-white/5 flex items-center justify-center">
                      <span className="text-ro-gray-600 text-sm">{div}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">\ud83d\udce9</div>
            <h2 className="font-heading text-xl tracking-wider uppercase mb-2">Leads Dashboard</h2>
            <p className="text-ro-gray-500">Contact form submissions will appear here once the leads system is connected.</p>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">\ud83d\udcf7</div>
            <h2 className="font-heading text-xl tracking-wider uppercase mb-2">Project Portfolio</h2>
            <p className="text-ro-gray-500">Upload and manage project photos for your portfolio gallery.</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-[#111] border border-white/10 rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">\u2699\ufe0f</div>
            <h2 className="font-heading text-xl tracking-wider uppercase mb-2">Site Settings</h2>
            <p className="text-ro-gray-500">General configuration, SEO, and contact info management.</p>
          </div>
        )}
      </div>
    </div>
  );
}
