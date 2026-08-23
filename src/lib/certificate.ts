/**
 * Draws a landscape A4-proportioned certificate onto a canvas and
 * triggers a PNG download. Nothing on the page is printed.
 */
export type CertData = {
  name: string;
  course: string;
  date: string;
  serial: string;
  hours?: string;
};

const W = 2000;
const H = 1414; // ~A4 landscape at 170dpi
const RED = "#dc3545";
const INK = "#16181c";
const MUTED = "#6c757d";

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

export function renderCertificate(
  data: CertData,
  teamProfiles?: { name: string; role: string; published?: boolean }[]
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;

  /* ---------- background ---------- */
  c.fillStyle = "#ffffff";
  c.fillRect(0, 0, W, H);

  // soft corner tints
  const g1 = c.createRadialGradient(W, 0, 0, W, 0, 900);
  g1.addColorStop(0, "rgba(220,53,69,0.10)");
  g1.addColorStop(1, "rgba(220,53,69,0)");
  c.fillStyle = g1;
  c.fillRect(0, 0, W, H);

  const g2 = c.createRadialGradient(0, H, 0, 0, H, 800);
  g2.addColorStop(0, "rgba(22,24,28,0.07)");
  g2.addColorStop(1, "rgba(22,24,28,0)");
  c.fillStyle = g2;
  c.fillRect(0, 0, W, H);

  /* ---------- borders ---------- */
  c.strokeStyle = INK;
  c.lineWidth = 10;
  roundRect(c, 46, 46, W - 92, H - 92, 26);
  c.stroke();

  c.strokeStyle = RED;
  c.lineWidth = 3;
  roundRect(c, 74, 74, W - 148, H - 148, 18);
  c.stroke();

  // corner accents
  c.fillStyle = RED;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    c.fillRect(x, y, 90 * dx, 8);
    c.fillRect(x, y, 8, 90 * dy);
  };
  corner(74, 74, 1, 1);
  c.save(); c.translate(W - 74, 74); c.scale(-1, 1); corner(0, 0, 1, 1); c.restore();
  c.save(); c.translate(74, H - 74); c.scale(1, -1); corner(0, 0, 1, 1); c.restore();
  c.save(); c.translate(W - 74, H - 74); c.scale(-1, -1); corner(0, 0, 1, 1); c.restore();

  /* ---------- header / logo ---------- */
  const cx = W / 2;
  const lx = cx - 220, ly = 148;
  c.fillStyle = RED;
  roundRect(c, lx, ly, 78, 78, 18);
  c.fill();

  const drawCandle = (
    x: number, wickTop: number, wickBot: number,
    bodyTop: number, bodyH: number, alpha: number, bodyW = 11
  ) => {
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = "#fff";
    c.fillStyle = "#fff";
    c.lineWidth = 2.4;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(x, wickTop);
    c.lineTo(x, wickBot);
    c.stroke();
    roundRect(c, x - bodyW / 2, bodyTop, bodyW, bodyH, 2.2);
    c.fill();
    c.restore();
  };
  drawCandle(lx + 22, ly + 18, ly + 62, ly + 26, 26, 0.5, 10);
  drawCandle(lx + 39, ly + 14, ly + 64, ly + 24, 30, 1, 12);
  drawCandle(lx + 56, ly + 24, ly + 62, ly + 34, 20, 0.78, 10);

  c.save();
  c.globalAlpha = 0.35;
  c.strokeStyle = "#fff";
  c.lineWidth = 2;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(lx + 12, ly + 54);
  c.bezierCurveTo(lx + 26, ly + 46, lx + 34, ly + 34, lx + 40, ly + 30);
  c.bezierCurveTo(lx + 48, ly + 24, lx + 56, ly + 22, lx + 68, ly + 18);
  c.stroke();
  c.restore();

  c.textAlign = "left";
  c.fillStyle = INK;
  c.font = "800 46px Sora, Georgia, serif";
  c.fillText("GAMAT", lx + 96, ly + 42);
  const wGamat = c.measureText("GAMAT").width;
  c.fillStyle = RED;
  c.fillText(" Fx", lx + 96 + wGamat, ly + 42);
  c.fillStyle = MUTED;
  c.font = "600 18px Inter, Arial, sans-serif";
  c.letterSpacing = "6px";
  c.fillText("ACADEMY", lx + 98, ly + 72);
  c.letterSpacing = "0px";

  /* ---------- titles ---------- */
  c.textAlign = "center";
  c.fillStyle = RED;
  c.font = "700 22px Inter, Arial, sans-serif";
  c.letterSpacing = "10px";
  c.fillText("CERTIFICATE OF COMPLETION", cx, 330);
  c.letterSpacing = "0px";

  c.strokeStyle = "#e6e6ea";
  c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - 300, 366); c.lineTo(cx + 300, 366); c.stroke();
  c.fillStyle = RED;
  c.beginPath(); c.arc(cx, 366, 7, 0, Math.PI * 2); c.fill();

  c.fillStyle = MUTED;
  c.font = "400 30px Inter, Arial, sans-serif";
  c.fillText("This is to certify that", cx, 452);

  /* ---------- recipient ---------- */
  c.fillStyle = INK;
  let nameSize = 108;
  c.font = `800 ${nameSize}px Sora, Georgia, serif`;
  while (c.measureText(data.name).width > W - 420 && nameSize > 48) {
    nameSize -= 4;
    c.font = `800 ${nameSize}px Sora, Georgia, serif`;
  }
  c.fillText(data.name, cx, 570);

  const nw = Math.min(c.measureText(data.name).width + 120, W - 340);
  c.strokeStyle = RED;
  c.lineWidth = 4;
  c.beginPath(); c.moveTo(cx - nw / 2, 612); c.lineTo(cx + nw / 2, 612); c.stroke();

  /* ---------- course ---------- */
  c.fillStyle = MUTED;
  c.font = "400 30px Inter, Arial, sans-serif";
  c.fillText("has successfully completed all modules and assessments of", cx, 686);

  c.fillStyle = INK;
  let cSize = 60;
  c.font = `700 ${cSize}px Sora, Georgia, serif`;
  while (c.measureText(data.course).width > W - 480 && cSize > 32) {
    cSize -= 2;
    c.font = `700 ${cSize}px Sora, Georgia, serif`;
  }
  c.fillText(data.course, cx, 768);

  if (data.hours) {
    c.fillStyle = MUTED;
    c.font = "400 26px Inter, Arial, sans-serif";
    c.fillText(`${data.hours} of structured training`, cx, 816);
  }

  /* ---------- seal ---------- */
  const sy = 960;
  c.save();
  c.translate(cx, sy);
  c.fillStyle = RED;
  c.beginPath(); c.arc(0, 0, 78, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "rgba(255,255,255,0.55)";
  c.lineWidth = 3;
  c.beginPath(); c.arc(0, 0, 62, 0, Math.PI * 2); c.stroke();
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.font = "800 20px Sora, Georgia, serif";
  c.fillText("GAMAT", 0, -6);
  c.font = "700 12px Inter, Arial, sans-serif";
  c.letterSpacing = "3px";
  c.fillText("VERIFIED", 0, 18);
  c.letterSpacing = "0px";
  c.font = "600 11px Inter, Arial, sans-serif";
  c.fillText("FX ACADEMY", 0, 36);
  c.restore();

  c.fillStyle = "#b02a37";
  c.beginPath(); c.moveTo(cx - 34, sy + 62); c.lineTo(cx - 60, sy + 150); c.lineTo(cx - 14, sy + 122); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(cx + 34, sy + 62); c.lineTo(cx + 60, sy + 150); c.lineTo(cx + 14, sy + 122); c.closePath(); c.fill();

  /* ---------- signatories ---------- */
  const sigY = 1200;
  const drawSig = (x: number, label: string, role: string, script: string) => {
    c.textAlign = "center";
    c.fillStyle = INK;
    c.font = "italic 44px Georgia, serif";
    c.fillText(script, x, sigY - 16);
    c.strokeStyle = INK;
    c.lineWidth = 2;
    c.beginPath(); c.moveTo(x - 190, sigY + 6); c.lineTo(x + 190, sigY + 6); c.stroke();
    c.fillStyle = INK;
    c.font = "700 22px Inter, Arial, sans-serif";
    c.fillText(label, x, sigY + 44);
    c.fillStyle = MUTED;
    c.font = "400 19px Inter, Arial, sans-serif";
    c.fillText(role, x, sigY + 72);
  };

  // Signatory 1: Founder/Mentor (Left)
  const founder = teamProfiles?.find((t) => t.published !== false && /founder|lead mentor/i.test(t.role));
  const founderName = founder?.name || "Tonye S. Taylor";
  const founderRole = founder?.role || "Founder & Lead Mentor";
  const founderScript = founderName.split(" ").map((w, i, a) => i === 0 ? w[0] + "." : i === a.length - 1 ? w : w[0] + ".").join(" ");

  // Signatory 2: Secretary (Right — dynamically retrieved from updated team members' information!)
  const secretary = teamProfiles?.find((t) => t.published !== false && /secretary/i.test(t.role));
  const secretaryName = secretary?.name || "Amara Okonkwo";
  const secretaryRole = secretary?.role || "Secretary & Head of Education";
  const secretaryScript = secretaryName.split(" ").map((w, i, a) => i === 0 ? w[0] + "." : i === a.length - 1 ? w : w[0] + ".").join(" ");

  drawSig(430, founderName, founderRole, founderScript);
  drawSig(W - 430, secretaryName, secretaryRole, secretaryScript);

  /* ---------- footer meta ---------- */
  c.textAlign = "center";
  c.fillStyle = MUTED;
  c.font = "500 20px Inter, Arial, sans-serif";
  c.fillText(`Issued ${data.date}`, cx, sigY - 60);

  c.font = "600 17px Inter, Arial, sans-serif";
  c.fillStyle = "#9aa0a6";
  c.fillText(`Certificate serial: ${data.serial}  ·  Verify at gamatfxacademy.com/verify`, cx, H - 96);

  return canvas;
}

export function downloadCertificate(data: CertData, teamProfiles?: { name: string; role: string; published?: boolean }[]) {
  const canvas = renderCertificate(data, teamProfiles);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMAT-Certificate-${data.course.replace(/[^a-z0-9]+/gi, "-")}-${data.serial}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

/** Small preview data URL for showing the certificate inline. */
export function certificatePreview(data: CertData, teamProfiles?: { name: string; role: string; published?: boolean }[]): string {
  return renderCertificate(data, teamProfiles).toDataURL("image/png");
}
