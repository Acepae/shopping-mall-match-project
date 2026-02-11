"use client";

import { useState } from "react";
import { Upload, Loader2, Check, Trash2 } from "lucide-react";
import clsx from "clsx";

interface ImageUploaderProps {
    targetFilename: string;
    onUploadComplete: () => void;
    label?: string;
    minimal?: boolean;
}

export function ImageUploader({ targetFilename, onUploadComplete, label = "Upload Image", minimal = false }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsSuccess(false);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("filename", targetFilename);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            setIsSuccess(true);
            onUploadComplete();

            // Reset success state after 2 seconds
            setTimeout(() => setIsSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent file picker from opening
        if (!confirm("정말 이 이미지를 삭제하고 초기화하시겠습니까?")) return;

        setIsDeleting(true);
        const formData = new FormData();
        formData.append("filename", targetFilename);

        try {
            const res = await fetch("/api/delete", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Delete failed");
            }

            onUploadComplete(); // Reload to show placeholder
        } catch (error: any) {
            console.error(error);
            alert(`삭제 실패: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Upload Button */}
            <div className="relative group cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <label className={clsx(
                    "flex flex-col items-center justify-center transition-all duration-300 cursor-pointer",
                    minimal
                        ? "w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110"
                        : "p-4 rounded-xl border-2 border-dashed border-primary-foreground/20 hover:border-primary-foreground/50 hover:bg-white/50 bg-white/20 text-muted-foreground hover:text-foreground",
                    isSuccess && (minimal ? "bg-green-100 text-green-600" : "border-green-400 bg-green-50 text-green-600")
                )}>
                    {isUploading ? (
                        <Loader2 className={clsx("animate-spin", minimal ? "w-4 h-4" : "w-6 h-6")} />
                    ) : isSuccess ? (
                        <Check className={clsx(minimal ? "w-4 h-4" : "w-6 h-6")} />
                    ) : (
                        <Upload className={clsx(minimal ? "w-4 h-4 text-gray-600" : "w-6 h-6 mb-1")} />
                    )}

                    {!minimal && (
                        <span className="text-xs font-medium">
                            {isUploading ? "..." : isSuccess ? "Done" : label}
                        </span>
                    )}

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                </label>

                {!isUploading && !isSuccess && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                        Upload {targetFilename}
                    </div>
                )}
            </div>

            {/* Delete Button - Enhanced Visibility */}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={clsx(
                    "flex items-center justify-center transition-all duration-300 group/delete z-50",
                    minimal
                        ? "w-8 h-8 rounded-full bg-white shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 hover:scale-110 border border-transparent hover:border-red-200"
                        : "p-4 w-14 h-full rounded-xl border-2 border-transparent bg-red-50/20 text-red-400 hover:bg-red-100/50 hover:text-red-600 hover:border-red-200"
                )}
                title="초기화 (Reset Image)"
            >
                {isDeleting ? (
                    <Loader2 className={clsx("animate-spin", minimal ? "w-4 h-4" : "w-6 h-6")} />
                ) : (
                    <Trash2 className={clsx(minimal ? "w-4 h-4" : "w-6 h-6")} />
                )}

                {/* Tooltip for delete */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/delete:opacity-100 transition-opacity whitespace-nowrap bg-red-700 text-white text-xs px-2 py-1 rounded pointer-events-none z-50">
                    삭제 (Reset)
                </div>
            </button>
        </div>
    );
}
