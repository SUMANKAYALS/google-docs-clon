import { create } from "zustand";
import { type EditorState } from "@/types";

export const useEditorStore = create<EditorState>((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),
    pageTheme: "light",
    setPageTheme: (pageTheme) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("clouds-docs-page-theme", pageTheme);
        }
        set({ pageTheme });
    },
}));