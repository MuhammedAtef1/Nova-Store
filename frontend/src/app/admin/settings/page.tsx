"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Save } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/admin/settings');
      // Initialize if empty to prevent UI breaking
      if (data.length === 0) {
        setSettings([
          { key: "HeroHeadline", value: "Everyday, Elevated.", group: "Homepage" },
          { key: "HeroSubtext", value: "Discover our new collection of premium essentials.", group: "Homepage" },
          { key: "AnnouncementText", value: "FREE SHIPPING ON ORDERS OVER 500 EGP", group: "General" },
          { key: "ContactEmail", value: "support@nova.store", group: "General" }
        ]);
      } else {
        setSettings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (key: string, newValue: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const homepageSettings = settings.filter(s => s.group === "Homepage");
  const generalSettings = settings.filter(s => s.group === "General");

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider">Store Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary gap-2 h-10 px-6 uppercase tracking-wider font-semibold">
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-background border shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider border-b pb-2">General Content</h2>
          {generalSettings.map(s => (
            <div key={s.key}>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">{s.key}</label>
              <input 
                type="text" 
                className="input w-full max-w-lg" 
                value={s.value} 
                onChange={(e) => handleUpdate(s.key, e.target.value)} 
              />
            </div>
          ))}
        </div>

        {/* Homepage Settings */}
        <div className="bg-background border shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-wider border-b pb-2">Homepage Banners</h2>
          {homepageSettings.map(s => (
            <div key={s.key}>
              <label className="block text-sm font-semibold uppercase tracking-wider mb-2">{s.key}</label>
              {s.value.length > 50 ? (
                 <textarea 
                   className="input h-24 py-2 w-full max-w-lg" 
                   value={s.value} 
                   onChange={(e) => handleUpdate(s.key, e.target.value)} 
                 />
              ) : (
                <input 
                  type="text" 
                  className="input w-full max-w-lg" 
                  value={s.value} 
                  onChange={(e) => handleUpdate(s.key, e.target.value)} 
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
