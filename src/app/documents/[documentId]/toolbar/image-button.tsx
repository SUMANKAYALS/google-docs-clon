"use client";

import React, { useState } from "react";
import { ImageIcon, SearchIcon, UploadIcon } from "lucide-react";
import { useEditorStore } from "@/store/use-editor-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export const ImageButton = React.memo(() => {
    const editor = useEditorStore((state) => state.editor);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    const onChange = (src: string) => {
        editor?.chain().focus().setImage({ src }).run();
    };

    const onUpload = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const imageUrl = URL.createObjectURL(file);
                onChange(imageUrl);
            }
        };
        input.click();
    };

    const handleImageUrlSubmit = () => {
        if (imageUrl) {
            onChange(imageUrl);
            setImageUrl("");
            setIsDialogOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Insert image"
                        title="Insert image"
                        className="h-7 min-w-7 shrink-0 flex flex-col items-center justify-center rounded-sm hover:bg-neutral-200/80 dark:hover:bg-zinc-700/80 text-gray-700 dark:text-zinc-300 overflow-hidden text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                    >
                        <ImageIcon className="size-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-50">
                    <DropdownMenuItem onClick={onUpload}>
                        <UploadIcon className="size-4 mr-2" />
                        Upload
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                        <SearchIcon className="size-4 mr-2" />
                        Paste image URL
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
 
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-white dark:bg-zinc-900 text-black dark:text-zinc-100 opacity-100 z-50 border-neutral-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Insert image URL</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Insert image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleImageUrlSubmit();
                            }
                        }}
                        aria-label="Image URL"
                    />
                    <DialogFooter>
                        <Button onClick={handleImageUrlSubmit}>
                            Insert
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});

ImageButton.displayName = "ImageButton";
