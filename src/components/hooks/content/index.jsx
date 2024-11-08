import { Editor } from "@tinymce/tinymce-react";

const MyEditor = ({ value, onChange }) => {
  return (
    <Editor
      apiKey="edhzwakcu86vflr56dsl1fsuvtgsga1khwmphgztvrpum66u"
      value={value}
      onEditorChange={onChange}
      init={{
        height: 500,
        menubar: true,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "preview",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
      }}
    />
  );
};

export default MyEditor;
