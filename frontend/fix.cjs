const fs = require('fs');
let code = fs.readFileSync('src/components/musicPlayer/NowPlayingCard.jsx', 'utf8');

code = code.replace(
    /artworkContainer: \{\n\s*position: "relative",\n\s*width: "100%", maxWidth: "320px", aspectRatio: "1\/1",\n\s*height: "auto",\n\s*display: "flex",\n\s*alignItems: "center",\n\s*justifyContent: "center",\n\s*maxWidth: "100%",/,
    'artworkContainer: {\n    position: "relative",\n    width: "100%",\n    maxWidth: "320px",\n    aspectRatio: "1/1",\n    height: "auto",\n    display: "flex",\n    alignItems: "center",\n    justifyContent: "center",'
);

fs.writeFileSync('src/components/musicPlayer/NowPlayingCard.jsx', code);
