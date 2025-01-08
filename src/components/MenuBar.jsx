import React, { useEffect } from 'react';
import { invoke } from "@tauri-apps/api/core";

const MenuBar = () => {
  const [isFileOpen, setIsFileOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const handleExit = async () => {
    try {
      await invoke('log_message', { message: "Exit clicked" });
      await invoke('quit_app');
      setIsFileOpen(false); // Close the menu
    } catch (e) {
      console.error(e);
    }
  };

  // Add click outside listener
  useEffect(() => {
    const handleClickOutside = () => {
      setIsFileOpen(false);
      setIsEditOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex bg-gray-100 border-b border-gray-200">
      <div className="relative">
        <button 
          className="px-4 py-1 text-sm hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation(); // Prevent immediate closing
            setIsFileOpen(!isFileOpen);
            setIsEditOpen(false);
          }}
        >
          File
        </button>
        {isFileOpen && (
          <div 
            className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50"
            onClick={(e) => e.stopPropagation()} // Prevent menu from closing when clicking inside
          >
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('New clicked');
                setIsFileOpen(false);
              }}
            >
              New
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Open clicked');
                setIsFileOpen(false);
              }}
            >
              Open
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Save clicked');
                setIsFileOpen(false);
              }}
            >
              Save
            </button>
            <div className="border-t border-gray-200"></div>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={handleExit}
            >
              Exit
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <button 
          className="px-2 py-1 text-sm hover:bg-gray-200"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditOpen(!isEditOpen);
            setIsFileOpen(false);
          }}
        >
          Edit
        </button>
        {isEditOpen && (
          <div 
            className="absolute left-0 top-full bg-white shadow-lg border border-gray-200 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Undo clicked');
                setIsEditOpen(false);
              }}
            >
              Undo
            </button>
            <button 
              className="block w-full px-4 py-1 text-sm text-left hover:bg-gray-100"
              onClick={() => {
                console.log('Redo clicked');
                setIsEditOpen(false);
              }}
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