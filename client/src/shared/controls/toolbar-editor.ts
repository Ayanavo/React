import { Quill, ReactQuillProps } from "react-quill";

// Undo and redo functions for Custom Toolbar
function undoChange(this: { reactQuillRef: any; undo: () => void; redo: () => void }) {
  this.reactQuillRef.getEditor().history.undo();
}
function redoChange(this: { quill: any; undo: (this: { reactQuillRef: any; undo: () => void; redo: () => void }) => void; redo: () => void }) {
  this.quill.history.redo();
}

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = ["arial", "comic-sans", "courier-new", "georgia", "helvetica", "lucida"];
Quill.register(Font, true);

// Modules object for setting up the Quill editor
export const editorConfig: ReactQuillProps = {
  formats: [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "align",
    "strike",
    "script",
    "blockquote",
    "background",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "color",
    "code-block",
  ],
  modules: {
    toolbar: {
      container: "#toolbar",
      handlers: {
        undo: undoChange,
        redo: redoChange,
      },
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
  },

  theme: "snow",
};
