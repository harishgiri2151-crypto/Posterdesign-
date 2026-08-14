const nameInput = document.getElementById("nameInput");
const namePreview = document.getElementById("namePreview");

const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");

const paymentInput = document.getElementById("paymentInput");
const paymentPreview = document.getElementById("paymentPreview");
const paymentPlaceholder = document.getElementById("paymentPlaceholder");

const paymentStatus = document.getElementById("paymentStatus");
const topDownloadBtn = document.getElementById("topDownloadBtn");

const posterSection = document.getElementById("posterSection");
const posterCanvas = document.getElementById("posterCanvas");
const bottomDownloadBtn = document.getElementById("bottomDownloadBtn");

let selectedPhoto = null;
let paymentScreenshot = null;
let posterReady = false;
let previewReady = false;


// नाम
nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();
  namePreview.textContent = name || "आपका नाम";
  if (selectedPhoto) renderPreviewPoster();
});


// फोटो
let processedPhotoBlob = null;
let processedPhotoUrl = null;

async function removePhotoBackground(file) {
  try {
    const mod = await import(
      "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.6.0/+esm"
    );

    const removeBackground =
      mod.removeBackground || mod.default;

    if (!removeBackground) {
      throw new Error("Background removal module नहीं मिला");
    }

    const blob = await removeBackground(file, {
      model: "isnet_quint8",
      output: {
        format: "image/png",
        type: "foreground"
      }
    });

    return blob;
  } catch (error) {
    console.warn("AI background removal failed, original photo used:", error);
    return file;
  }
}

photoInput.addEventListener("change", async (event) => {

  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("कृपया केवल फोटो चुनें।");
    photoInput.value = "";
    return;
  }

  selectedPhoto = file;
  processedPhotoBlob = null;

  try {
    const result = await removePhotoBackground(file);

    processedPhotoBlob = result;
    selectedPhoto = result;

    if (processedPhotoUrl) {
      URL.revokeObjectURL(processedPhotoUrl);
    }

    processedPhotoUrl = URL.createObjectURL(result);

    preview.src = processedPhotoUrl;
    preview.style.display = "block";
    placeholder.style.display = "none";

    await renderPreviewPoster();

  } catch (error) {

    console.error("Photo processing error:", error);

    selectedPhoto = file;

    const reader = new FileReader();

    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
      placeholder.style.display = "none";
    };

    reader.readAsDataURL(file);
  }
});


// Payment screenshot
paymentInput.addEventListener("change", async (event) => {

  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("कृपया payment screenshot चुनें।");
    paymentInput.value = "";
    return;
  }

  paymentScreenshot = file;

  const reader = new FileReader();

  reader.onload = (e) => {
    paymentPreview.src = e.target.result;
    paymentPreview.style.display = "block";
    paymentPlaceholder.style.display = "none";
  };

  reader.readAsDataURL(file);


  // जरूरी जानकारी check
  if (!nameInput.value.trim()) {
    paymentStatus.textContent =
      "पहले अपना नाम लिखें।";

    paymentStatus.className =
      "payment-status error";

    return;
  }

  if (!selectedPhoto) {
    paymentStatus.textContent =
      "पहले अपनी फोटो अपलोड करें।";

    paymentStatus.className =
      "payment-status error";

    return;
  }


  paymentStatus.textContent =
    "✓ Screenshot अपलोड हो गया। Poster तैयार किया जा रहा है...";

  paymentStatus.className =
    "payment-status success";


  try {

    await createPoster(nameInput.value.trim());

    posterReady = true;

    activateDownloadButton();

    paymentStatus.textContent =
      "✓ Poster तैयार है। नीचे से डाउनलोड करें।";

    paymentStatus.className =
      "payment-status success";

  } catch (error) {

    console.error("Poster error:", error);

    paymentStatus.textContent =
      "Poster बनाने में समस्या हुई। कृपया दोबारा कोशिश करें।";

    paymentStatus.className =
      "payment-status error";

    posterReady = false;

  }

});


// Download buttons
function setupDownloadButton(button) {
  if (!button) return;

  button.addEventListener("click", (event) => {
    if (!posterReady) {
      event.preventDefault();
      return;
    }
  });
}

setupDownloadButton(topDownloadBtn);
setupDownloadButton(bottomDownloadBtn);


// दोनों download buttons को active करें
function activateDownloadButton() {

  const posterUrl = posterCanvas.toDataURL("image/png");

  [topDownloadBtn, bottomDownloadBtn].forEach(button => {

    if (!button) return;

    button.classList.remove("download-disabled");
    button.classList.add("download-active");

    button.removeAttribute("aria-disabled");

    button.href = posterUrl;
  });
}



// Live poster preview
async function renderPreviewPoster() {
  if (!selectedPhoto) return;

  previewReady = true;

  try {
    await createPoster(nameInput.value.trim());
  } catch (error) {
    console.error("Preview error:", error);
  }

  // Preview बनाना payment verification नहीं है।
  // Download buttons payment screenshot आने तक disabled रहेंगे।
  if (!posterReady) {
    [topDownloadBtn, bottomDownloadBtn].forEach(button => {
      if (!button) return;
      button.classList.add("download-disabled");
      button.classList.remove("download-active");
      button.removeAttribute("href");
      button.setAttribute("aria-disabled", "true");
    });
  }
}

// Poster बनाना
async function createPoster(name) {

  const canvas = posterCanvas;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas उपलब्ध नहीं है");
  }

  const width = 1000;
  const height = 1600;

  canvas.width = width;
  canvas.height = height;

  posterSection.style.display = "block";

  // =========================================================
  // PREMIUM BACKGROUND
  // =========================================================

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#fffaf2");
  bg.addColorStop(0.48, "#ffffff");
  bg.addColorStop(1, "#f7fff8");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Top saffron band
  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(0, 0, width, 105);

  // Thin white separation
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 105, width, 20);

  // Green band
  ctx.fillStyle = "#138808";
  ctx.fillRect(0, 125, width, 24);

  // Decorative tricolor waves
  function wave(y, amplitude, thickness, color, phase) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x <= width; x += 10) {
      const yy =
        y +
        Math.sin((x / width) * Math.PI * 2 + phase) * amplitude;

      ctx.lineTo(x, yy);
    }

    for (let x = width; x >= 0; x -= 10) {
      const yy =
        y +
        thickness +
        Math.sin((x / width) * Math.PI * 2 + phase) * amplitude;

      ctx.lineTo(x, yy);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.95;
    ctx.fill();
    ctx.restore();
  }

  wave(185, 18, 28, "#ff7a00", 0);
  wave(220, 16, 20, "#ffffff", 0.35);
  wave(252, 18, 28, "#138808", 0.1);

  // =========================================================
  // ASHOKA CHAKRA
  // =========================================================

  const cx = width / 2;
  const cy = 220;
  const radius = 68;

  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 7, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,.18)";
  ctx.shadowBlur = 18;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#183f7a";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 4;

  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(a) * radius,
      cy + Math.sin(a) * radius
    );
    ctx.stroke();
  }

  ctx.fillStyle = "#183f7a";
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // =========================================================
  // RED FORT STYLE SILHOUETTE
  // =========================================================

  const fortY = 310;

  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = "#b94d27";

  // Main fort
  ctx.fillRect(205, fortY + 55, 590, 105);

  // Central structure
  ctx.fillRect(335, fortY + 5, 330, 155);

  // Side towers
  ctx.fillRect(175, fortY + 20, 65, 140);
  ctx.fillRect(760, fortY + 20, 65, 140);

  // Domes
  function dome(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(x - r, y, r * 2, 20);
  }

  dome(207, fortY + 20, 32);
  dome(793, fortY + 20, 32);
  dome(500, fortY + 4, 50);

  // Central flag
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(500, fortY - 80);
  ctx.lineTo(500, fortY + 15);
  ctx.stroke();

  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(500, fortY - 80, 70, 18);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(500, fortY - 62, 70, 18);

  ctx.fillStyle = "#138808";
  ctx.fillRect(500, fortY - 44, 70, 18);

  ctx.restore();

  // =========================================================
  // MAIN TITLE
  // =========================================================

  ctx.textAlign = "center";

  ctx.fillStyle = "#ef6c00";
  ctx.font =
    "bold 58px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText("15 अगस्त विशेष", width / 2, 535);

  ctx.fillStyle = "#173764";
  ctx.font =
    "bold 92px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText("स्वतंत्रता", width / 2, 635);

  ctx.fillStyle = "#138808";
  ctx.fillText("दिवस", width / 2, 725);

  ctx.fillStyle = "#555";
  ctx.font =
    "bold 27px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "आजादी • एकता • गौरव",
    width / 2,
    775
  );

  // =========================================================
  // PHOTO AREA
  // =========================================================

  const photoX = 115;
  const photoY = 815;
  const photoW = 770;
  const photoH = 520;

  // Premium photo card
  ctx.save();

  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 42);
  } else {
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
  }

  ctx.fillStyle = "#f4f7f8";
  ctx.shadowColor = "rgba(0,0,0,.16)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Tricolor border
  ctx.strokeStyle = "#138808";
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.clip();

  if (selectedPhoto) {

    const photo = new Image();

    await new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = (e) => {

        photo.onload = resolve;
        photo.onerror = reject;
        photo.src = e.target.result;

      };

      reader.onerror = reject;
      reader.readAsDataURL(selectedPhoto);
    });

    // Existing CONTAIN fitting preserved.
    // No crop logic is changed here.
    const scale = Math.min(
      photoW / photo.width,
      photoH / photo.height
    );

    const drawW = photo.width * scale;
    const drawH = photo.height * scale;

    ctx.drawImage(
      photo,
      photoX + (photoW - drawW) / 2,
      photoY + (photoH - drawH) / 2,
      drawW,
      drawH
    );

  } else {

    // Empty photo area before user uploads a photo
    ctx.fillStyle = "#f7f9fb";
    ctx.fillRect(photoX, photoY, photoW, photoH);

    ctx.strokeStyle = "#d7dde5";
    ctx.lineWidth = 4;
    ctx.setLineDash([14, 12]);

    ctx.beginPath();
    ctx.rect(
      photoX + 28,
      photoY + 28,
      photoW - 56,
      photoH - 56
    );
    ctx.stroke();

    ctx.setLineDash([]);

  }

  ctx.restore();

  // =========================================================
  // USER NAME
  // =========================================================

  const cleanName = (name || "").trim();

  if (cleanName) {

    ctx.fillStyle = "#173764";

    ctx.font =
      "bold 62px Arial, Noto Sans Devanagari, sans-serif";

    ctx.fillText(
      cleanName,
      width / 2,
      1435
    );

  }

  // Greeting
  ctx.fillStyle = "#ef6c00";

  ctx.font =
    "bold 30px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "स्वतंत्रता दिवस की हार्दिक शुभकामनाएँ",
    width / 2,
    1490
  );

  // Premium bottom tricolor strip
  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(0, 1550, width / 3, 50);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(width / 3, 1550, width / 3, 50);

  ctx.fillStyle = "#138808";
  ctx.fillRect((width / 3) * 2, 1550, width / 3, 50);

  // Small chakra mark
  ctx.strokeStyle = "#173764";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(width / 2, 1575, 13, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12;

    ctx.beginPath();
    ctx.moveTo(width / 2, 1575);
    ctx.lineTo(
      width / 2 + Math.cos(a) * 13,
      1575 + Math.sin(a) * 13
    );
    ctx.stroke();
  }

}


window.addEventListener("DOMContentLoaded", () => { createPoster(""); });
