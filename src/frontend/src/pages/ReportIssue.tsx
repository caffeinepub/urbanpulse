import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Camera, CheckCircle, Loader2, MapPin, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useFileUpload } from "../hooks/useFileUpload";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateIssue } from "../hooks/useQueries";

const CATEGORIES = [
  { value: "StreetLight", label: "Street Light" },
  { value: "Trash", label: "Trash / Waste" },
  { value: "RoadDamage", label: "Road Damage" },
  { value: "Water", label: "Water / Drain" },
  { value: "Other", label: "Other" },
];

export default function ReportIssue() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const createIssue = useCreateIssue();
  const { upload, uploading, progress } = useFileUpload();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (file: File | null) => {
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const detectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setGpsLoading(false);
        toast.success("Location detected!");
      },
      () => {
        toast.error("Could not get location. Please enter manually.");
        setGpsLoading(false);
      },
      { timeout: 8000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity) {
      toast.error("Please login to report an issue");
      await login();
      return;
    }
    if (!title || !category || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!lat || !lng) {
      toast.error("Please set a location for this issue");
      return;
    }

    try {
      let photoUrl: string | null = null;
      if (photoFile) {
        photoUrl = await upload(photoFile);
      }
      await createIssue.mutateAsync({
        title,
        description,
        category,
        photoUrl,
        lat: Number.parseFloat(lat),
        lng: Number.parseFloat(lng),
      });
      setSubmitted(true);
      setTimeout(() => navigate({ to: "/feed" }), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit issue");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center max-w-sm w-full"
          data-ocid="report.success_state"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2
            className="font-display text-2xl font-bold mb-2"
            style={{ color: "#f0e6d3" }}
          >
            Issue Reported!
          </h2>
          <p className="text-white/60 text-sm">
            Thank you for helping improve your city. Redirecting to feed...
          </p>
        </motion.div>
      </div>
    );
  }

  const isPending = createIssue.isPending || uploading;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="space-y-1 mb-6">
        <h1
          className="font-display text-2xl font-bold"
          style={{ color: "#f0e6d3" }}
        >
          Report an Issue
        </h1>
        <p className="text-sm text-white/50">
          Help your city by reporting infrastructure problems
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-5"
        data-ocid="report.panel"
      >
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">
            Issue Title <span style={{ color: "#FF6B35" }}>*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Broken street light on Main St."
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B35]/40 focus:ring-[#FF6B35]/20"
            data-ocid="report.title.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">
            Category <span style={{ color: "#FF6B35" }}>*</span>
          </Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger
              className="bg-white/5 border-white/10 text-white focus:border-[#FF6B35]/40"
              data-ocid="report.category.select"
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent
              style={{
                background: "#0d1f3c",
                border: "1px solid rgba(0,201,177,0.15)",
              }}
            >
              {CATEGORIES.map((cat) => (
                <SelectItem
                  key={cat.value}
                  value={cat.value}
                  className="text-white/80 focus:bg-[#FF6B35]/10 focus:text-[#FF6B35]"
                >
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">
            Description <span style={{ color: "#FF6B35" }}>*</span>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B35]/40 resize-none"
            data-ocid="report.description.textarea"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Photo (optional)</Label>
          {photoPreview ? (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => handlePhotoChange(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500/80 transition-colors"
                data-ocid="report.photo.close_button"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 transition-all text-white/40 hover:border-[#FF6B35]/40 hover:text-[#FF6B35]"
              data-ocid="report.photo.upload_button"
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">Add photo</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
          />
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/50">
                <span>Uploading photo...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: "#FF6B35" }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white/70 text-sm">
              Location <span style={{ color: "#FF6B35" }}>*</span>
            </Label>
            <button
              type="button"
              onClick={detectGps}
              disabled={gpsLoading}
              className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-50 hover:opacity-80"
              style={{ color: "#FF6B35" }}
              data-ocid="report.gps.button"
            >
              {gpsLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              {gpsLoading ? "Detecting..." : "Auto-detect GPS"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
              type="number"
              step="any"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B35]/40 text-sm"
              data-ocid="report.lat.input"
            />
            <Input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
              type="number"
              step="any"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#FF6B35]/40 text-sm"
              data-ocid="report.lng.input"
            />
          </div>
          {lat && lng && (
            <p className="text-xs text-white/40 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              {Number.parseFloat(lat).toFixed(4)},{" "}
              {Number.parseFloat(lng).toFixed(4)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-6 rounded-xl font-display font-bold text-base transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 text-white"
          style={{ background: isPending ? "#e55a25" : "#FF6B35" }}
          data-ocid="report.submit_button"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </button>
      </form>

      <footer className="mt-8 text-center text-xs text-white/25">
        &copy; {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/50 transition-colors"
        >
          Built with &hearts; using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
