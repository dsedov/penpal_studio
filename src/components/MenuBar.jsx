import React, { useState } from 'react';
import { dialog } from '@tauri-apps/api';

const MenuBar = () => {
  const [isFileOpen, setIsFileOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleNew = async () => {
    console.log('New clicked');
  };

  const handleOpen = async () => {
    try {
      const selected = await dialog.open({
        multiple: false,
        filters: [
          { name: 'Images', extensions: ['png', 'jpg'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (selected) {
        console.log('Selected file:', selected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex bg-gray-100 border-b border-gray-200">
      <div className="relative">
        <button 
          className="px-4 py-2 hover:bg-gray-200"
          onClick={() => {
            setIsFileOpen(!isFileOpen);
            setIsEditOpen(false);
          }}
        >
          File
        </button>
        {isFileOpen && (
          <div className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50">
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={handleNew}
            >
              New
            </button>
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={handleOpen}
            >
              Open
            </button>
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Save
            </button>
            <div className="border-t border-gray-200"></div>
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => window.close()}
            >
              Exit
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          className="px-4 py-2 hover:bg-gray-200"
          onClick={() => {
            setIsEditOpen(!isEditOpen);
            setIsFileOpen(false);
          }}
        >
          Edit
        </button>
        {isEditOpen && (
          <div className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50">
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Undo
            </button>
            <button 
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              Redo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;