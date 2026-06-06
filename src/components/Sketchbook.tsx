/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Paintbrush, 
  Eraser, 
  Trash2, 
  Download, 
  Undo2, 
  Redo2, 
  Keyboard, 
  Grid2X2, 
  Palette, 
  Plus, 
  Minus,
  Sparkles,
  Info
} from 'lucide-react';
import { DrawingTool, CanvasBackground, PresetColor } from '../types';
import { PALETTE_COLORS, BACKGROUNDS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

export default function Sketchbook() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // React State for Controls & UI Customization
  const [brushColor, setBrushColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(5);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [background, setBackground] = useState<CanvasBackground>('white');
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [showToolbar, setShowToolbar] = useState<boolean>(true);
  
  // History State
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Keep a tracking history of data URLs or ImageData to support full multi-step undo/redo
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Refs for drawing status to avoid stale closure state in handlers
  const brushColorRef = useRef<string>('#000000');
  const brushSizeRef = useRef<number>(5);
  const currentToolRef = useRef<DrawingTool>('pen');
  const backgroundRef = useRef<CanvasBackground>('white');
  const isDrawingRef = useRef<boolean>(false);

  // Update refs when state changes
  useEffect(() => {
    brushColorRef.current = brushColor;
  }, [brushColor]);

  useEffect(() => {
    brushSizeRef.current = brushSize;
  }, [brushSize]);

  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  useEffect(() => {
    backgroundRef.current = background;
  }, [background]);

  // Set default white background and paint it
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Fill with initial transparent/white or transparent so client background handles visualization
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Set canvas dimensions
    canvas.width = 900;
    canvas.height = 500;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save initial empty state to history
    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [initialData];
    historyIndexRef.current = 0;
    updateHistoryButtons();
  }, []);

  const updateHistoryButtons = () => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  };

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Remove any undone states
    const nextIndex = historyIndexRef.current + 1;
    if (nextIndex < historyRef.current.length) {
      historyRef.current = historyRef.current.slice(0, nextIndex);
    }

    // Capture state
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(currentState);
    historyIndexRef.current = historyRef.current.length - 1;
    updateHistoryButtons();
  };

  // Undo Function
  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    updateHistoryButtons();
  };

  // Redo Function
  const handleRedo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    updateHistoryButtons();
  };

  // Paint background color equivalent for eraser
  const getEraserColor = (bg: CanvasBackground): string => {
    switch (bg) {
      case 'white':
      case 'dots':
      case 'grid':
        return '#ffffff';
      case 'cream':
        return '#fbf6eb';
      case 'dark':
        return '#12131a';
      default:
        return '#ffffff';
    }
  };

  // Start Drawing
  const handleStartDrawing = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    
    // Scale correctly in case of CSS fluid scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    // Reset path
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Initial dot
    ctx.lineWidth = brushSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (currentToolRef.current === 'eraser') {
      ctx.strokeStyle = getEraserColor(backgroundRef.current);
    } else {
      ctx.strokeStyle = brushColorRef.current;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Draw Stroke
  const handleDrawStroke = (clientX: number, clientY: number) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    // Convert coordinate using exact rendering scales
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineWidth = brushSizeRef.current;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (currentToolRef.current === 'eraser') {
      ctx.strokeStyle = getEraserColor(backgroundRef.current);
    } else {
      ctx.strokeStyle = brushColorRef.current;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // End Drawing Stroke
  const handleEndDrawing = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveHistoryState();
    }
  };

  // Mouse Listener Handlers
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only draw on primary left click
    handleStartDrawing(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleDrawStroke(e.clientX, e.clientY);
  };

  const onMouseUpOrLeave = () => {
    handleEndDrawing();
  };

  // Touch handlers for mobile/trackpad devices
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStartDrawing(touch.clientX, touch.clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDrawStroke(touch.clientX, touch.clientY);
    }
  };

  const onTouchEnd = () => {
    handleEndDrawing();
  };

  // Clear Canvas (with user confirmation option)
  const handleClearAll = () => {
    const isConfirmed = window.confirm('Are you sure you want to clear the canvas?');
    if (!isConfirmed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  // Save Canvas to local device
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Double check canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Create a temporary offscreen canvas to combine background style + drawing details
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const oCtx = offscreen.getContext('2d');
    if (!oCtx) return;

    // 1. Draw Background color onto offscreen canvas
    const bgType = background;
    if (bgType === 'cream') {
      oCtx.fillStyle = '#fbf6eb';
      oCtx.fillRect(0, 0, width, height);
    } else if (bgType === 'dark') {
      oCtx.fillStyle = '#12131a';
      oCtx.fillRect(0, 0, width, height);
    } else {
      // Plain white standard background
      oCtx.fillStyle = '#ffffff';
      oCtx.fillRect(0, 0, width, height);
    }

    // 2. Overlay Grids/Dots onto saved canvas if configured
    if (bgType === 'grid') {
      oCtx.strokeStyle = '#e5e7eb';
      oCtx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        oCtx.beginPath();
        oCtx.moveTo(x, 0);
        oCtx.lineTo(x, height);
        oCtx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        oCtx.beginPath();
        oCtx.moveTo(0, y);
        oCtx.lineTo(width, y);
        oCtx.stroke();
      }
    } else if (bgType === 'dots') {
      oCtx.fillStyle = '#d1d5db';
      const dotSpacing = 20;
      for (let x = 10; x < width; x += dotSpacing) {
        for (let y = 10; y < height; y += dotSpacing) {
          oCtx.beginPath();
          oCtx.arc(x, y, 1.2, 0, Math.PI * 2);
          oCtx.fill();
        }
      }
    }

    // 3. Draw standard sketches artwork onto top layer
    oCtx.drawImage(canvas, 0, 0);

    // 4. Download file
    const link = document.createElement('a');
    link.download = `duhacell-sketch-${Date.now()}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();
  };

  // Keyboard Shortcuts Config
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing hotkeys when user is focused on form inputs (though we don't have inputs, it's safe)
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p':
          // Select Pen
          setCurrentTool('pen');
          break;
        case 'e':
          // Select Eraser
          setCurrentTool('eraser');
          break;
        case 'c':
          // Trigger Clear
          handleClearAll();
          break;
        case 's':
          // Trigger Download (Allow standard S or CMD/Ctrl+S)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
          }
          handleSave();
          break;
        case 'z':
          // Ctrl+Z Undo
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'y':
          // Ctrl+Y Redo
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleRedo();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [background, currentTool, brushColor, brushSize]);

  // Adjust eraser indicator visually by listening to custom selections
  const changeBackgroundMode = (bgType: CanvasBackground) => {
    setBackground(bgType);
    
    // When switching to obscure dark background, automatically switch pen to vibrant green/cyber if still black
    // as black ink is invisible on dark canvases! Super nice UI intelligence.
    if (bgType === 'dark' && brushColor === '#000000') {
      setBrushColor('#00ff88');
    } else if (bgType !== 'dark' && brushColor === '#00ff88') {
      setBrushColor('#000000');
    }
  };

  const getCanvasBackgroundClass = (): string => {
    switch (background) {
      case 'white':
        return 'bg-white shadow-[0_12px_45px_rgba(0,0,0,0.4)]';
      case 'cream':
        return 'bg-[#fbf6eb] shadow-[0_12px_45px_rgba(0,0,0,0.3)]';
      case 'dark':
        return 'bg-[#12131a] shadow-[0_12px_45px_rgba(0,255,136,0.06)] border border-[#00ff88]/20';
      case 'grid':
        return 'bg-white bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] shadow-[0_12px_45px_rgba(0,0,0,0.3)]';
      case 'dots':
        return 'bg-white bg-[radial-gradient(#d1d5db_1px,transparent_1px)] bg-[size:20px_20px] shadow-[0_12px_45px_rgba(0,0,0,0.3)]';
      default:
        return 'bg-white';
    }
  };

  return (
    <div id="sketchbook_container" className="flex flex-col items-center justify-start w-full max-w-5xl mx-auto space-y-5">
      
      {/* Title Header */}
      <div id="sketch_header" className="flex flex-col items-center text-center space-y-1">
        <div className="flex items-center space-x-2">
          <motion.div 
            initial={{ rotate: -15, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Sparkles className="w-8 h-8 text-[#00ff88] animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-display font-extrabold tracking-widest text-[#00ff88] uppercase">
            DUHA<span className="text-white drop-shadow-[0_0_8px_#00ff88] select-none">CELL</span> Sketchbook
          </h1>
        </div>
        <p className="text-xs font-mono text-gray-400 tracking-wider">
          Next-generation minimalist sketchpad & drafting studio
        </p>
      </div>

      {/* Control Dashboard Panel */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            id="sketch_toolbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-[#0f172a] border border-[#00ff88]/40 rounded-2xl p-4 md:p-6 shadow-[0_8px_32px_rgba(0,255,136,0.05)] flex flex-col space-y-4 md:space-y-5"
          >
            {/* Row 1: Brush styles, thickness, sizes, presets */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* Brush Thickness (4 Columns) */}
              <div className="md:col-span-5 flex items-center space-x-3 bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">📏 Size</span>
                <button 
                  onClick={() => setBrushSize(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded bg-slate-800 hover:bg-[#00ff88]/20 hover:text-[#00ff88] transition text-gray-400"
                  title="Decrease Size"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={brushSize} 
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                />
                <button 
                  onClick={() => setBrushSize(prev => Math.min(50, prev + 1))}
                  className="p-1 rounded bg-slate-800 hover:bg-[#00ff88]/20 hover:text-[#00ff88] transition text-gray-400"
                  title="Increase Size"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm font-mono font-bold text-[#00ff88] min-w-[28px] text-right">
                  {brushSize}
                </span>
              </div>

              {/* Tool Switching (4 Columns) */}
              <div className="md:col-span-4 flex justify-center space-x-2.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCurrentTool('pen')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-xs transition duration-250 ${
                    currentTool === 'pen'
                      ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title="Pen Tool (P)"
                >
                  <Paintbrush className="w-4 h-4" />
                  <span>✏️ Pen</span>
                </button>
                <button
                  onClick={() => setCurrentTool('eraser')}
                  className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-2 font-semibold text-xs transition duration-250 ${
                    currentTool === 'eraser'
                      ? 'bg-[#00ff88] text-slate-950 shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title="Eraser Tool (E)"
                >
                  <Eraser className="w-4 h-4" />
                  <span>🧹 Eraser</span>
                </button>
              </div>

              {/* Color Picker Interface (3 Columns) */}
              <div className="md:col-span-3 flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 relative justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-widest pl-2">🎨 Custom</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-[#00ff88] uppercase">{brushColor}</span>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[#00ff88] cursor-pointer">
                    <input 
                      type="color" 
                      value={brushColor} 
                      disabled={currentTool === 'eraser'}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                    />
                    <div 
                      className="w-full h-full" 
                      style={{ backgroundColor: brushColor }} 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: Color Presets Palette */}
            {currentTool !== 'eraser' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap items-center gap-2.5 bg-slate-900/30 p-3 rounded-xl border border-slate-800/50"
              >
                <span className="text-xs font-mono text-gray-500 uppercase tracking-wider flex items-center space-x-1">
                  <Palette className="w-3.5 h-3.5 mr-1" /> Hot Palette:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PALETTE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBrushColor(color.value)}
                      style={{ backgroundColor: color.value }}
                      className={`w-7 h-7 rounded-lg border-2 transition-all transform hover:scale-110 active:scale-90 relative ${
                        brushColor.toLowerCase() === color.value.toLowerCase()
                          ? 'border-[#00ff88] scale-110 ring-2 ring-[#00ff88]/30 shadow-md'
                          : 'border-slate-700 hover:border-slate-400'
                      }`}
                      title={color.name}
                    >
                      {brushColor.toLowerCase() === color.value.toLowerCase() && (
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-transparent select-none bg-[#00ff88]/10 rounded-md">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Row 3: Utility buttons / Paper Background Preset Options */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-800">
              
              {/* Background styling select buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center mr-1">
                  <Grid2X2 className="w-3.5 h-3.5 mr-1.5" /> Background:
                </span>
                <div className="flex gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => changeBackgroundMode(bg.id as CanvasBackground)}
                      className={`px-3 py-1 text-[11px] font-medium rounded-md transition ${
                        background === bg.id
                          ? 'bg-slate-800 text-[#00ff88] border border-[#00ff88]/30'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  disabled={!canUndo}
                  onClick={handleUndo}
                  className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition duration-200 ${
                    canUndo 
                      ? 'border-slate-700 bg-slate-800 text-gray-100 hover:bg-slate-700 cursor-pointer' 
                      : 'border-slate-800 text-gray-500 bg-slate-900/40 cursor-not-allowed'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Undo</span>
                </button>

                <button
                  disabled={!canRedo}
                  onClick={handleRedo}
                  className={`p-2 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition duration-200 ${
                    canRedo 
                      ? 'border-slate-700 bg-slate-800 text-gray-100 hover:bg-slate-700 cursor-pointer' 
                      : 'border-slate-800 text-gray-500 bg-slate-900/40 cursor-not-allowed'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Redo</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white flex items-center space-x-1.5 text-xs font-bold transition duration-200 cursor-pointer"
                  title="Clear Canvas (C)"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Clear All</span>
                </button>

                <button
                  onClick={handleSave}
                  className="p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center space-x-1.5 text-xs font-extrabold shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition duration-200 cursor-pointer"
                  title="Save Drawing (S)"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Sketch</span>
                </button>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle for Controls Overlay */}
      <div className="w-full flex justify-end">
        <button 
          onClick={() => setShowToolbar(!showToolbar)}
          className="text-xs font-mono text-gray-500 hover:text-[#00ff88] transition flex items-center space-x-1 bg-slate-900/40 hover:bg-slate-905 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <span>{showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}</span>
        </button>
      </div>

      {/* Primary Canvas Workspace Frame */}
      <div 
        id="canvas_workspace" 
        className="w-full relative rounded-2xl overflow-hidden p-1 bg-gradient-to-br from-[#00ff88]/20 via-transparent to-purple-500/10 max-w-full flex justify-center"
      >
        <div className="w-full overflow-auto max-w-full flex justify-center py-2 px-1">
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            onMouseLeave={onMouseUpOrLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`cursor-crosshair select-none touch-none rounded-xl max-w-full transition-all duration-300 ${getCanvasBackgroundClass()}`}
            style={{ width: '900px', height: '500px' }}
          />
        </div>
      </div>

      {/* Interactive Guidance Footnotes */}
      <div id="canvas_footer" className="w-full block flex-col items-center justify-between text-center space-y-1 bg-slate-950/40 py-3.5 px-6 rounded-xl border border-slate-900">
        
        {/* Helper guide */}
        <p className="text-xs font-sans text-gray-400">
          <span className="text-[#00ff88] font-bold">💡 Device Tip:</span> Supports pressure-sensitive drag, desktop pointers, high-precision trackpads, and mobile touch events!
        </p>

        {/* Shortcuts overview */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-1.5 border-t border-slate-900/80">
          <button 
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="text-xs font-mono text-gray-400 hover:text-[#00ff88] transition flex items-center space-x-1 bg-slate-900/60 px-2.5 py-1 rounded-md"
          >
            <Keyboard className="w-3.5 h-3.5 mr-1" />
            <span>{showShortcuts ? 'Close Keyboard Shortcuts' : 'Show Keyboard Shortcuts'}</span>
          </button>
          
          <div className="text-[11px] font-mono text-gray-500 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-gray-500 mr-0.5" />
            <span>Shortcuts: <kbd className="px-1 bg-slate-800 rounded">P</kbd> Pen | <kbd className="px-1 bg-slate-800 rounded">E</kbd> Eraser | <kbd className="px-1 bg-slate-800 rounded">C</kbd> Clear | <kbd className="px-1 bg-slate-800 rounded">Ctrl+S</kbd> Save</span>
          </div>
        </div>

        {/* Shortcuts list details overlay modal if requested */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-3 p-4 bg-slate-900 rounded-xl border border-slate-805 text-left grid grid-cols-2 sm:grid-cols-3 gap-3"
            >
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#00ff88] uppercase block">Drawing pad</span>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">P</kbd> Pen tool mode</p>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">E</kbd> Eraser tool mode</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-purple-400 uppercase block">Shortcuts</span>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">Ctrl + Z</kbd> Undo stroke</p>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">Ctrl + Y</kbd> Redo stroke</p>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase block">Canvas</span>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">C</kbd> Clear canvas</p>
                <p className="text-xs text-gray-400 font-mono"><kbd className="px-1 bg-slate-800 rounded text-slate-100 mr-2">Ctrl + S</kbd> Export png</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
