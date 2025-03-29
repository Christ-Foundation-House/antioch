"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";

// Type definition based on the provided schema
export type PhotoAlbum = {
  id: number;
  album_key: string;
  thumbnail_url: string;
  image_url_array: string;
  image_url_count?: number;
  image_url_array_hidden?: string;
  image_url_array_dont_thumbnail?: string;
  is_public?: boolean;
  title?: string;
  date?: Date;
  description?: string;
  views: number;
  thumbnail_url_array?: string;
  thumbnail_url_count?: number;
  image_object_array?: string;
};

export type PhotoAlbumSelectorProps = {
  albums: PhotoAlbum[];
  onSelect?: (image: string) => void;
  onSelectMultiple?: (images: string[]) => void;
  selectionMode?: "single" | "multiple";
  buttonText?: string;
  buttonClassName?: string;
  maxHeight?: string;
};

export function PhotoAlbumSelector({
  albums,
  onSelect,
  onSelectMultiple,
  selectionMode = "single",
  buttonText = "Select Photos",
  buttonClassName,
  maxHeight = "80vh",
}: PhotoAlbumSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<PhotoAlbum | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"albums" | "thumbnails">("albums");

  // Parse the thumbnail URLs from the string
  const getThumbnails = (album: PhotoAlbum) => {
    if (!album.thumbnail_url_array) return [];
    try {
      return JSON.parse(album.thumbnail_url_array) as string[];
    } catch (e) {
      console.error("Error parsing thumbnail_url_array:", e);
      return [];
    }
  };

  const handleAlbumClick = (album: PhotoAlbum) => {
    setSelectedAlbum(album);
    setViewMode("thumbnails");
  };

  const handleBackToAlbums = () => {
    setViewMode("albums");
    setSelectedAlbum(null);
  };

  const handleImageSelect = (imageUrl: string) => {
    if (selectionMode === "single") {
      setSelectedImages([imageUrl]);
      onSelect?.(imageUrl);
      setOpen(false);
    } else {
      // Toggle selection for multiple mode
      setSelectedImages((prev) => {
        const newSelection = prev.includes(imageUrl)
          ? prev.filter((url) => url !== imageUrl)
          : [...prev, imageUrl];
        return newSelection;
      });
    }
  };

  const handleConfirmSelection = () => {
    if (selectionMode === "multiple" && selectedImages.length > 0) {
      onSelectMultiple?.(selectedImages);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedAlbum(null);
    setSelectedImages([]);
    setViewMode("albums");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>{buttonText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            {viewMode === "thumbnails" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToAlbums}
                className="mr-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <DialogTitle className="flex-1">
              {viewMode === "albums"
                ? "Select an Album"
                : selectedAlbum?.title || "Album Photos"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div style={{ maxHeight }}>
          {viewMode === "albums" ? (
            <ScrollArea className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-all"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={album.thumbnail_url || "/placeholder.svg"}
                        alt={album.title || "Album thumbnail"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-medium truncate">
                        {album.title || `Album ${album.id}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {album.thumbnail_url_count || 0} photos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {selectedAlbum &&
                    getThumbnails(selectedAlbum).map((thumbnail, index) => (
                      <div
                        key={index}
                        className={cn(
                          "group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-all relative aspect-square",
                          selectedImages.includes(thumbnail) &&
                            "ring-2 ring-primary border-primary",
                        )}
                        onClick={() => handleImageSelect(thumbnail)}
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <Image
                            src={thumbnail || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        {selectionMode === "multiple" && (
                          <div className="absolute top-2 right-2">
                            <Checkbox
                              checked={selectedImages.includes(thumbnail)}
                              className="h-5 w-5 bg-white/80 data-[state=checked]:bg-primary"
                              onCheckedChange={() =>
                                handleImageSelect(thumbnail)
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>

              {selectionMode === "multiple" && (
                <div className="p-4 border-t flex justify-between items-center">
                  <div className="text-sm">
                    {selectedImages.length} photos selected
                  </div>
                  <Button
                    onClick={handleConfirmSelection}
                    disabled={selectedImages.length === 0}
                  >
                    Confirm Selection
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
