import { create } from "zustand";
import { type EditorState } from "@/types";

export const useEditorStore = create<EditorState>((set) => ({
    editor: null,
    setEditor: (editor) => set({ editor }),
}));