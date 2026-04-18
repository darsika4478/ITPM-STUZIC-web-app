const fs = require('fs');

// Fix MusicPlayerBar's mobile bottom offset
let playerCode = fs.readFileSync('src/components/musicPlayer/MusicPlayerBar.jsx', 'utf8');
playerCode = playerCode.replace(/bottom-\[65px\]/, 'bottom-0');
// Also ensure on mobile it has z-index high enough so it doesn't block the sidebar?
// Wait, if it sits on top of the sidebar, we just need to add padding to the bottom of the sidebar.
fs.writeFileSync('src/components/musicPlayer/MusicPlayerBar.jsx', playerCode);

// Fix OverviewLayout sidebar padding
let layoutCode = fs.readFileSync('src/layout/OverviewLayout.jsx', 'utf8');
layoutCode = layoutCode.replace(
    /padding: '1rem 0\.75rem', display: 'flex', flexDirection: 'column'/g,
    "padding: '1rem 0.75rem 6.5rem 0.75rem', display: 'flex', flexDirection: 'column'"
);

fs.writeFileSync('src/layout/OverviewLayout.jsx', layoutCode);
