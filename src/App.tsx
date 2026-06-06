/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Sketchbook from './components/Sketchbook';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center bg-[#070a13] px-4 py-8 md:py-12 relative overflow-hidden">
      {/* Visual background ambient glow highlights */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00ff88]/5 blur-[120px] pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none select-none" />
      
      {/* Main Container */}
      <main className="w-full max-w-5xl z-10">
        <Sketchbook />
      </main>
    </div>
  );
}

