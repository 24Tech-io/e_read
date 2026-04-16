import React, { useEffect, useRef, useState } from "react";
import ePub from "epubjs";

const BOOK_URL = "/sound_waves-malayalam.epub";
const FONT_FIX_CSS = `
  @font-face {
    font-family: "Helvetica";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/Helvetica.TTF") format("truetype");
  }

  @font-face {
    font-family: "Helvetica";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/Helvetica-Bold.TTF") format("truetype");
  }

  @font-face {
    font-family: "Helvetica Condensed";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/Helvetica-Condensed.TTF") format("truetype");
  }

  @font-face {
    font-family: "Helvetica Condensed Bold";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/Helvetica-Condensed.TTF") format("truetype");
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Cn";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/HelveticaNeueLTStd-Cn.otf") format("opentype");
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Cn";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/HelveticaNeueLTStd-BdCn.OTF") format("opentype");
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Lt Cn";
    font-style: normal;
    font-weight: 300;
    src: url("/fonts/HelveticaNeueLTStd-LtCn.OTF") format("opentype");
  }

  @font-face {
    font-family: "HelveticaNeueLT Std Med Cn";
    font-style: normal;
    font-weight: 500;
    src: url("/fonts/HelveticaNeueLTStd-MdCn.otf") format("opentype");
  }

  @font-face {
    font-family: "K0VKSquareDemi";
    font-style: normal;
    font-weight: 600;
    src: url("/fonts/K0VKSquareDemi-DemiBold.TTF") format("truetype");
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/ML-TKanimozhi.TTF") format("truetype");
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: normal;
    font-weight: 700;
    src: url("/fonts/ML-TKanimozhi-Bold.TTF") format("truetype");
  }

  @font-face {
    font-family: "ML-TKanimozhi";
    font-style: italic;
    font-weight: 400;
    src: url("/fonts/ML-TKanimozhi-Italic.TTF") format("truetype");
  }

  @font-face {
    font-family: "Minion Pro";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/MinionPro-Regular.otf") format("opentype");
  }

  @font-face {
    font-family: "Times New Roman";
    font-style: normal;
    font-weight: 400;
    src: url("/fonts/TimesNewRomanPSMT.TTF") format("truetype");
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
  const [bookTitle, setBookTitle] = useState("Malayalam EPUB Reader");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

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
      },
      "img, svg": {
        "max-width": "100%",
        "height": "auto",
      },
    });
    rendition.themes.fontSize("100%");
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
            <p className="eyebrow">EPUB Reader</p>
            <h1>{bookTitle}</h1>
            <p className="subtle">
              Continuously scrollable Malayalam-friendly EPUB reading.
            </p>
          </div>
        </header>

        <div className="status-row" aria-live="polite">
          <span>{isReady ? `Reading progress: ${progress}%` : "Loading book..."}</span>
          <span>Continuous scroll mode</span>
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
              <p>Preparing the Malayalam EPUB reader...</p>
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
