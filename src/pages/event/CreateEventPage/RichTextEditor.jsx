import React, { useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Loader2 } from 'lucide-react';
import ImageResize from 'quill-image-resize-module-react';

window.Quill = Quill;
Quill.register('modules/imageResize', ImageResize);

const BaseImageFormat = Quill.import('formats/image');

class CustomImage extends BaseImageFormat {
    static formats(domNode) {
        return ['height', 'width', 'style', 'class'].reduce((formats, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }

    format(name, value) {
        if (['height', 'width', 'style', 'class'].includes(name)) {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}

Quill.register(CustomImage, true);

const RichTextEditor = ({ value, onChange, placeholder }) => {
    const quillRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            try {
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (data.secure_url) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', data.secure_url);
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                console.error('Lỗi upload ảnh:', error);
                alert('Không thể tải ảnh lên. Vui lòng thử lại!');
            } finally {
                setIsUploading(false);
            }
        };
    };

    // eslint-disable-next-line no-unused-vars
    const handleEditorChange = (content, delta, source, editor) => {
        
        if (onChange) onChange(content);

        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 10);
    };

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                [{ 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar']
        }
    }), []);

    return (
        <div className="relative bg-white rounded-xl border border-slate-200 overflow-hidden [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:bg-slate-50 [&_.ql-container]:border-none [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-base [&_.ql-editor_img]:inline-block">
            {isUploading && (
                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm font-medium text-primary">Đang tải ảnh lên...</span>
                </div>
            )}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value || ''}
                onChange={handleEditorChange}
                modules={modules}
                placeholder={placeholder || 'Nhập nội dung...'}
            />
        </div>
    );
};

export default RichTextEditor;