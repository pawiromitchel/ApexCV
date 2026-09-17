"use client";

import React from "react";
import { PersonalInfo } from "@/lib/types";
import { User, Briefcase, Mail, Phone, MapPin, Globe, Linkedin, Github, Image as ImageIcon } from "lucide-react";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (updated: Partial<PersonalInfo>) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar / Photo Uploader */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-slate-700 bg-slate-800 flex items-center justify-center flex-shrink-0">
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt={data.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-500" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-200">Profile Photo</div>
          <p className="text-[11px] text-slate-400 mb-2">
            Upload a professional headshot or provide an image link.
          </p>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-[11px] font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all">
              <span>Choose Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {data.avatarUrl && (
              <button
                type="button"
                onClick={() => onChange({ avatarUrl: "" })}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Name and Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Full Name *</span>
          </label>
          <input
            type="text"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g. Alex Rivera"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Job Title / Target Role *</span>
          </label>
          <input
            type="text"
            value={data.jobTitle}
            onChange={(e) => onChange({ jobTitle: e.target.value })}
            placeholder="e.g. Senior Full-Stack Engineer"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Address</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="alex.rivera@example.com"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>Phone Number</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 234-5678"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Location & Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Location (City, Country/State)</span>
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="San Francisco, CA"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>Portfolio / Website</span>
          </label>
          <input
            type="text"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://alexrivera.dev"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* LinkedIn & GitHub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Linkedin className="w-3.5 h-3.5 text-slate-400" />
            <span>LinkedIn Profile</span>
          </label>
          <input
            type="text"
            value={data.linkedin}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="linkedin.com/in/username"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Github className="w-3.5 h-3.5 text-slate-400" />
            <span>GitHub / Profile</span>
          </label>
          <input
            type="text"
            value={data.github}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="github.com/username"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
