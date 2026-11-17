/**
 * Isolates a printable DOM element into a top-level #print-portal directly under
 * document.body, hides the rest of the app via body[data-printing="true"] in @media print,
 * triggers window.print(), and cleans up afterward.
 *
 * Guarantees single-page, full-sheet output without blank trailing pages or
 * modal/overflow clipping on mobile and desktop browsers.
 */
export function printElement(elementId: string) {
  const source = document.getElementById(elementId);
  if (!source) {
    window.print();
    return;
  }

  document.getElementById("print-portal")?.remove();

  const portal = document.createElement("div");
  portal.id = "print-portal";

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.display = "";
  portal.appendChild(clone);

  document.body.setAttribute("data-printing", "true");
  document.body.appendChild(portal);

  const cleanup = () => {
    portal.remove();
    document.body.removeAttribute("data-printing");
    window.removeEventListener("afterprint", cleanup);
  };

  window.addEventListener("afterprint", cleanup);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        if (document.body.getAttribute("data-printing") === "true") {
          cleanup();
        }
      }, 60_000);
    });
  });
}
