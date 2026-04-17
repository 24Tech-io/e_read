import React, { useEffect, useRef, useState } from "react";
import ePub from "epubjs";

const BOOK_URL = "/sound_waves-malayalam.epub";
const MIN_FONT_SIZE = 80;
const MAX_FONT_SIZE = 160;
const DEFAULT_FONT_SIZE = 100;
const FONT_FIX_CSS = `
  @font-face {
    font-family: "Adobe Garamond Pro Bold";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/AGaramondPro-Bold.otf") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "Arial";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/ArialMT.ttf") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Helvetica";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/Helvetica.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Helvetica";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/Helvetica-Bold.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Helvetica Condensed";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/Helvetica-Condensed.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Helvetica Condensed Bold";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/Helvetica-Condensed.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Cn";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/HelveticaNeueLTStd-Cn.otf") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Cn";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/HelveticaNeueLTStd-BdCn.OTF") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Lt Cn";
    font-style: normal;
    font-weight: 300;
    src: url("/fonts/HelveticaNeueLTStd-LtCn.OTF") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Med Cn";
    font-style: normal;
    font-weight: 500;
    src: url("/fonts/HelveticaNeueLTStd-MdCn.otf") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "K0VKSquareDemi";
    font-style: normal;
    font-weight: 600;
    src: url("/fonts/K0VKSquareDemi-DemiBold.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "DV-TTSurekh";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/DVTTSurekhNormal.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "DV-TTSurekh";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/DV-TTSurekh-Bold.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/ML-TKanimozhi.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/ML-TKanimozhi-Bold.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: italic;
    font-weight: 400;
    src: url("/fonts/ML-TKanimozhi-Italic.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Minion Pro";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/MinionPro-Regular.otf") format("opentype");
    font-display: swap;
  }

  @font-face {
    font-family: "Times New Roman";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/TimesNewRomanPSMT.TTF") format("truetype");
    font-display: swap;
  }

  @font-face {
    font-family: "Wingdings";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/Wingdings-Regular.ttf") format("truetype");
    font-display: swap;
  }

  [class*="CharOverride"],
  [class*="ParaOverride"],
  .Basic-Paragraph {
    font-kerning: normal;
    text-rendering: optimizeLegibility;
  }
`;

function App() {
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const locationRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const [bookTitle, setBookTitle] = useState("Reader");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!renditionRef.current) {
      return;
    }

    renditionRef.current.themes.fontSize(`${fontSize}%`);
  }, [fontSize]);

  useEffect(() => {
    const rendition = renditionRef.current;

    if (!rendition) {
      return;
    }

    const themeStyles =
      theme === "dark"
        ? {
            body: {
              background: "#16120d",
              color: "#f5ead8",
            },
            "p, div, span, li, h1, h2, h3, h4, h5, h6": {
              color: "#f5ead8 !important",
            },
            "a": {
              color: "#f6c57f !important",
            },
          }
        : {
            body: {
              background: "#fff9ef",
              color: "#2f2418",
            },
            "p, div, span, li, h1, h2, h3, h4, h5, h6": {
              color: "#2f2418 !important",
            },
            "a": {
              color: "#8a551d !important",
            },
          };

    rendition.themes.override("background", themeStyles.body.background, true);
    rendition.themes.override("color", themeStyles.body.color, true);
    rendition.themes.default(themeStyles);
  }, [theme]);

  useEffect(() => {
    const handleViewport = () => {
      window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        if (renditionRef.current) {
          renditionRef.current.resize();

          if (locationRef.current?.start?.cfi) {
            renditionRef.current.display(locationRef.current.start.cfi);
          }
        }
      }, 120);
    };

    window.addEventListener("resize", handleViewport);
    return () => {
      window.removeEventListener("resize", handleViewport);
      window.clearTimeout(resizeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) {
      return undefined;
    }

    const book = ePub(BOOK_URL);
    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: "scrolled-doc",
      manager: "continuous",
      spread: "none",
      allowScriptedContent: true,
    });

    bookRef.current = book;
    renditionRef.current = rendition;
    rendition.themes.default({
      "body": {
        "line-height": "1.7",
        "word-break": "break-word",
        "-webkit-text-size-adjust": "100%",
        "padding": "0 0 2rem",
        "transition": "background 160ms ease, color 160ms ease",
      },
      "img, svg": {
        "max-width": "100%",
        "height": "auto",
      },
    });
    rendition.themes.fontSize(`${DEFAULT_FONT_SIZE}%`);
    rendition.hooks.content.register((contents) => {
      const style = contents.document.createElement("style");
      style.textContent = `
        ${FONT_FIX_CSS}

        html,
        body {
          overflow-y: auto !important;
        }
      `;
      contents.document.head.appendChild(style);
    });

    const onRelocated = (location) => {
      locationRef.current = location;
      const currentProgress =
        location?.start?.percentage != null
          ? Math.round(location.start.percentage * 100)
          : 0;
      setProgress(currentProgress);
    };

    rendition.on("relocated", onRelocated);

    book.loaded.metadata
      .then((metadata) => {
        if (metadata?.title) {
          setBookTitle(metadata.title);
        }
      })
      .catch(() => {});

    book.ready
      .then(() => rendition.display())
      .then(() => setIsReady(true))
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to load EPUB.");
      });

    return () => {
      rendition.off("relocated", onRelocated);
      rendition.destroy();
      book.destroy();
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="reader-card">
        <header className="reader-toolbar">
          <div>
            <p className="eyebrow">Library</p>
            <h1>{bookTitle}</h1>
            <p className="subtle">A focused reading space with adjustable text size.</p>
          </div>

          <div className="reader-controls" aria-label="Reader controls">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "Dark mode" : "Light mode"}
            </button>

            <div className="font-bar" role="group" aria-label="Font size">
              <button
                type="button"
                className="font-stepper"
                onClick={() => setFontSize((size) => Math.max(MIN_FONT_SIZE, size - 10))}
                aria-label="Decrease font size"
              >
                A-
              </button>

              <label className="font-slider">
                <span>Text size</span>
                <input
                  type="range"
                  min={MIN_FONT_SIZE}
                  max={MAX_FONT_SIZE}
                  step="10"
                  value={fontSize}
                  onChange={(event) => setFontSize(Number(event.target.value))}
                />
              </label>

              <button
                type="button"
                className="font-stepper"
                onClick={() => setFontSize((size) => Math.min(MAX_FONT_SIZE, size + 10))}
                aria-label="Increase font size"
              >
                A+
              </button>

              <span className="font-value">{fontSize}%</span>
            </div>
          </div>
        </header>

        <div className="status-row" aria-live="polite">
          <span>{isReady ? `Reading progress: ${progress}%` : "Loading book..."}</span>
          <span>{theme === "light" ? "Light mode" : "Dark mode"}</span>
        </div>

        <div className="viewer-frame">
          {error ? (
            <div className="message-panel error-panel">
              <h2>Unable to open the EPUB</h2>
              <p>{error}</p>
            </div>
          ) : null}

          {!error && !isReady ? (
            <div className="message-panel">
              <div className="spinner" aria-hidden="true" />
              <p>Preparing your book...</p>
            </div>
          ) : null}

          <div
            ref={viewerRef}
            className={`viewer ${!isReady || error ? "viewer-hidden" : ""}`}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
