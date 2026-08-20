'use client';

import { useState } from 'react';

export default function ManualForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    skill: '',
    experience_years: '',
    current_location: '',
    home_location: '',
    country: 'IN',
    distress: false,
    distress_type: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      experience_years: parseInt(formData.experience_years) || 0
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-[#1a3a6b] mb-4">Manual Worker Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Skill/Work</label>
            <input required type="text" name="skill" value={formData.skill} onChange={handleChange} placeholder="e.g. Mason"
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Years Experience</label>
            <input required type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} min="0"
                   className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Current Location (City, State)</label>
          <input required type="text" name="current_location" value={formData.current_location} onChange={handleChange} 
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Home Town / State</label>
          <input required type="text" name="home_location" value={formData.home_location} onChange={handleChange} 
                 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Country</label>
          <select name="country" value={formData.country} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-[#FF9933] focus:border-[#FF9933] text-black">
            <option value="IN">India</option>
            <option value="BR">Brazil</option>
            <option value="ZA">South Africa</option>
            <option value="RU">Russia</option>
            <option value="CN">China</option>
          </select>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="distress" checked={formData.distress} onChange={handleChange} 
                   className="rounded text-red-500 focus:ring-red-500" />
            <span className="text-sm font-semibold text-red-600">I am currently facing a work-related issue</span>
          </label>
        </div>

        {formData.distress && (
          <div>
            <label className="block text-xs font-semibold text-red-500 uppercase mb-1">Issue Type</label>
            <select name="distress_type" value={formData.distress_type} onChange={handleChange} 
                    className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-red-500 focus:border-red-500 text-black">
              <option value="">Select an issue...</option>
              <option value="unpaid_wages">Unpaid Wages</option>
              <option value="injury">Workplace Injury</option>
              <option value="unsafe_conditions">Unsafe Conditions</option>
              <option value="harassment">Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onCancel}
                  className="px-4 py-2 border border-slate-300 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit"
                  className="flex-1 px-4 py-2 bg-[#FF9933] text-white text-sm font-semibold rounded-xl hover:bg-[#e68a2e] transition-colors">
            Submit Profile
          </button>
        </div>
      </form>
    </div>
  );
}
