import Paragraph from "@tiptap/extension-paragraph";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      setParagraphIndent: (
        left?: string | null,
        right?: string | null,
        firstLine?: string | null
      ) => ReturnType;
    };
  }
}

export const IndentParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      indentLeft: {
        default: null,
        parseHTML: (element) => element.style.marginLeft || null,
        renderHTML: (attributes) => {
          if (!attributes.indentLeft) return {};
          return { style: `margin-left: ${attributes.indentLeft}` };
        },
      },
      indentRight: {
        default: null,
        parseHTML: (element) => element.style.marginRight || null,
        renderHTML: (attributes) => {
          if (!attributes.indentRight) return {};
          return { style: `margin-right: ${attributes.indentRight}` };
        },
      },
      firstLineIndent: {
        default: null,
        parseHTML: (element) => element.style.textIndent || null,
        renderHTML: (attributes) => {
          if (!attributes.firstLineIndent) return {};
          return { style: `text-indent: ${attributes.firstLineIndent}` };
        },
      },
    };
  },

  addCommands() {
    return {
      setParagraphIndent:
        (left?: string | null, right?: string | null, firstLine?: string | null) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          let changed = false;
          tr.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (node.type.name === "paragraph") {
              const attrs = { ...node.attrs };
              if (left !== undefined) attrs.indentLeft = left;
              if (right !== undefined) attrs.indentRight = right;
              if (firstLine !== undefined) attrs.firstLineIndent = firstLine;
              tr.setNodeMarkup(pos, undefined, attrs);
              changed = true;
            }
          });
          if (changed && dispatch) {
            dispatch(tr);
            return true;
          }
          return false;
        },
    };
  },
});
