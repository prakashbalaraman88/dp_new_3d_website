import { useRef, useState } from 'react';
import KineticText from '../components/KineticText';

export default function FloorPlanSection({ onChange }: { onChange: (file: File | null, notes: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setF = (f: File | null) => {
    setFile(f);
    setPreview(f && f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
    onChange(f, notes);
  };
  const setN = (n: string) => {
    setNotes(n);
    onChange(file, n);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <p className="text-secondary tracking-[0.25em] uppercase text-[11px] sm:text-xs mb-3">Almost there</p>
      <h2 className="font-serif font-light text-2xl sm:text-4xl md:text-5xl text-white mb-3">
        <KineticText text="Now, show us your space." trigger="inView" stagger={0.07} />
      </h2>
      <p className="text-white/70 text-sm sm:text-base mb-7 sm:mb-8">Share your floor plan and we’ll design around your life — and your taste.</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          setF(e.dataTransfer.files?.[0] || null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-7 sm:p-10 transition-colors ${
          drag ? 'border-secondary bg-secondary/10' : 'border-white/20 hover:border-secondary/50 active:border-secondary/60'
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setF(e.target.files?.[0] || null)} />
        {preview ? (
          <img src={preview} alt="Floor plan preview" className="max-h-52 sm:max-h-56 mx-auto rounded-lg" />
        ) : file ? (
          <p className="text-white break-all text-sm">{file.name}</p>
        ) : (
          <p className="text-white/60 text-sm">
            Tap to upload your floor plan
            <br />
            <span className="text-xs text-white/40">JPG, PNG or PDF — or take a photo</span>
          </p>
        )}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setN(e.target.value)}
        rows={3}
        placeholder="Anything you’d love us to know? (optional)"
        className="mt-5 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-base text-white placeholder-white/40 focus:border-secondary/60 outline-none transition-colors resize-none"
      />

      <p className="text-white/35 text-[11px] mt-6">Optional · scroll down to finish &darr;</p>
    </div>
  );
}
