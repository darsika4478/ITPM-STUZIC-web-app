import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';

/**
 * AvatarEditorModal — Profile photo crop & upload modal
 *
 * Props:
 *   open         — whether the modal is visible
 *   currentPhoto — URL/Base64 of the current avatar ('' if none)
 *   onSave       — (blob: Blob) => Promise<void>  — called with cropped image blob
 *   onDelete     — () => Promise<void>             — called to remove the current photo
 *   onClose      — () => void                      — close without saving
 *
 * Features:
 *  - Loads existing photo as a data-URL (avoids CORS/tainted-canvas issues)
 *  - Drag + pinch-zoom crop using react-easy-crop
 *  - Zoom slider for fine-grained control
 *  - Add / Change / Delete photo actions
 */
const AvatarEditorModal = ({ open, currentPhoto, onSave, onDelete, onClose }) => {
    const fileInputRef = useRef(null); // hidden <input type="file"> trigger

    // Image loaded into the cropper (always a data-URL for CORS safety)
    const [imageSrc, setImageSrc] = useState('');

    // Cropper state — position, zoom level, and the final pixel crop area
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Operation state flags
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [loading, setLoading] = useState(false); // loading existing photo URL
    const [error, setError] = useState('');

    // True when the user picked a new file (vs. just viewing existing photo)
    const [hasNewFile, setHasNewFile] = useState(false);

    // ── Load existing photo into the cropper ──
    // External URLs (e.g. Google auth photos) need to be fetched and
    // converted to data-URLs to avoid CORS / tainted-canvas errors on crop.
    useEffect(() => {
        if (!open) return;
        if (!currentPhoto) { setImageSrc(''); return; }

        // Already a data-URL (Base64) — use directly, no fetch needed
        if (currentPhoto.startsWith('data:')) {
            setImageSrc(currentPhoto);
            return;
        }

        // External URL — fetch and convert to data-URL
        let cancelled = false;
        setLoading(true);
        setError('');
        fetch(currentPhoto)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.blob();
            })
            .then(
                (blob) =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    }),
            )
            .then((dataUrl) => {
                if (!cancelled) { setImageSrc(dataUrl); setLoading(false); }
            })
            .catch((err) => {
                console.error('Failed to load existing photo:', err);
                if (!cancelled) { setImageSrc(''); setError('Could not load current photo.'); setLoading(false); }
            });

        return () => { cancelled = true; }; // cancel if modal closes during fetch
    }, [open, currentPhoto]);

    // Called by react-easy-crop whenever the crop area changes — store pixel coords
    const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    // ── File selection ── validates type/size then loads into cropper
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }

        setError('');
        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result);
            setHasNewFile(true);
            setCrop({ x: 0, y: 0 }); // reset crop position for new image
            setZoom(1);
        };
        reader.readAsDataURL(file);
        if (fileInputRef.current) fileInputRef.current.value = ''; // allow re-selecting same file
    };

    // ── Save ── crops the image using pixel coordinates and passes blob to parent
    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        setSaving(true);
        setError('');
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
            await onSave(blob); // parent handles Base64 conversion + Firestore upload
        } catch (err) {
            console.error('Crop/save failed:', err);
            setError('Failed to save photo. Try again.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ── removes the current photo via parent handler
    const handleDelete = async () => {
        setDeleting(true);
        setError('');
        try {
            await onDelete();
            setImageSrc('');
            setHasNewFile(false);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        } catch (err) {
            console.error('Delete failed:', err);
            setError('Failed to delete photo.');
        } finally {
            setDeleting(false);
        }
    };

    // ── Close ── resets all local state without saving
    const handleClose = () => {
        setImageSrc('');
        setHasNewFile(false);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setError('');
        onClose();
    };

    // Don't render anything when modal is closed
    if (!open) return null;

    // Disable all controls while an async operation is in progress
    const busy = saving || deleting || loading;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#272D3E] p-5 shadow-2xl">

                {/* Header — title + close button */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Edit Profile Photo</h3>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={busy}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
                        aria-label="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                {/* Crop area — shows cropper, loading spinner, or empty state */}
                <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-xl bg-black/40">
                    {imageSrc ? (
                        // Interactive crop view using react-easy-crop
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}           // square crop
                            cropShape="round"    // circular preview
                            showGrid={false}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    ) : loading ? (
                        // Loading spinner while fetching external photo URL
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-white/40">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
                            <p className="text-sm">Loading photo…</p>
                        </div>
                    ) : (
                        // Empty state — no photo selected yet
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-white/40">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">No photo selected</p>
                        </div>
                    )}
                </div>

                {/* Zoom slider — only shown when an image is loaded */}
                {imageSrc && (
                    <div className="mt-4 flex items-center gap-3 px-1">
                        {/* Minus icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M5 8a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="range"
                            min={1} max={3} step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-[#585296]"
                        />
                        {/* Plus icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 text-white/40" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M8 5a1 1 0 011 1v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 010-2h1V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {/* Error message */}
                {error && <p className="mt-3 text-center text-xs text-red-400">{error}</p>}

                {/* Action buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    {/* Left side: Add/Change photo + Delete */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={busy}
                            className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {imageSrc ? 'Change Photo' : 'Add Photo'}
                        </button>
                        {/* Delete button — only shown when there's an existing or loaded photo */}
                        {(imageSrc || currentPhoto) && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={busy}
                                className="rounded-xl border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50"
                            >
                                {deleting ? 'Deleting…' : 'Delete'}
                            </button>
                        )}
                    </div>

                    {/* Right side: Save — disabled until an image is cropped */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={busy || !imageSrc || !croppedAreaPixels}
                        className="rounded-xl bg-[#585296] px-5 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#8F8BB6] active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>

                {/* Hidden file input — triggered by the Add/Change Photo button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>
        </div>
    );
};

export default AvatarEditorModal;
