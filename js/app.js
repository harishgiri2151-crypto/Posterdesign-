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
photoInput.addEventListener("change", (event) => {

  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("कृपया केवल फोटो चुनें।");
    photoInput.value = "";
    return;
  }

  selectedPhoto = file;

  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    placeholder.style.display = "none";
  };

  reader.readAsDataURL(file);
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

  const width = 900;
  const height = 1200;

  canvas.width = width;
  canvas.height = height;

  // =========================================================
  // PROFESSIONAL INDEPENDENCE DAY POSTER
  // =========================================================

  // Base background
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#fffaf3");
  bg.addColorStop(0.55, "#ffffff");
  bg.addColorStop(1, "#f4fff3");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  ctx.strokeStyle = "#138808";
  ctx.lineWidth = 8;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // ---------------------------------------------------------
  // Tricolor top banner
  // ---------------------------------------------------------

  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(35, 35, width - 70, 72);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(35, 107, width - 70, 72);

  ctx.fillStyle = "#138808";
  ctx.fillRect(35, 179, width - 70, 72);

  // Ashoka Chakra — strictly inside white stripe
  ctx.strokeStyle = "#1a3d73";
  ctx.lineWidth = 5;

  const cx = width / 2;
  const cy = 143;
  const radius = 25;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius
    );
    ctx.stroke();
  }

  // ---------------------------------------------------------
  // Headline
  // ---------------------------------------------------------

  ctx.textAlign = "center";

  ctx.fillStyle = "#ef6c00";
  ctx.font = "900 34px Arial, Noto Sans Devanagari, sans-serif";
  ctx.fillText("15 अगस्त विशेष", width / 2, 305);

  ctx.fillStyle = "#172b4d";
  ctx.font = "900 48px Arial, Noto Sans Devanagari, sans-serif";
  ctx.fillText("आजादी का गौरव", width / 2, 365);

  // Decorative line
  ctx.strokeStyle = "#ff7a00";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(250, 390);
  ctx.lineTo(650, 390);
  ctx.stroke();

  // ---------------------------------------------------------
  // Photo area
  // ---------------------------------------------------------

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

  const photoX = 90;
  const photoY = 420;
  const photoW = 720;
  const photoH = 545;

  // Soft photo card
  ctx.save();

  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 38);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,.16)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    ctx.fill();
  }

  ctx.restore();

  // Photo clipping
  ctx.save();

  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 38);
  } else {
    ctx.beginPath();
    ctx.rect(photoX, photoY, photoW, photoH);
  }

  ctx.clip();

  // Full-image fitting — no forced crop
  const scale = Math.min(
    photoW / photo.width,
    photoH / photo.height
  );

  const drawW = photo.width * scale;
  const drawH = photo.height * scale;

  const drawX = photoX + (photoW - drawW) / 2;
  const drawY = photoY + (photoH - drawH) / 2;

  ctx.drawImage(
    photo,
    drawX,
    drawY,
    drawW,
    drawH
  );

  ctx.restore();

  // ---------------------------------------------------------
  // Name
  // ---------------------------------------------------------

  ctx.fillStyle = "#138808";
  ctx.font = "900 58px Arial, Noto Sans Devanagari, sans-serif";

  // Long names get slightly smaller
  if (name.length > 20) {
    ctx.font = "900 45px Arial, Noto Sans Devanagari, sans-serif";
  } else if (name.length > 14) {
    ctx.font = "900 51px Arial, Noto Sans Devanagari, sans-serif";
  }

  ctx.fillText(name || "आपका नाम", width / 2, 1035);

  // ---------------------------------------------------------
  // Greeting strip
  // ---------------------------------------------------------

  const stripY = 1070;

  const strip = ctx.createLinearGradient(80, 0, 820, 0);
  strip.addColorStop(0, "#ff7a00");
  strip.addColorStop(0.5, "#ffffff");
  strip.addColorStop(1, "#138808");

  ctx.fillStyle = strip;
  ctx.globalAlpha = 0.95;

  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(90, stripY, 720, 58, 18);
    ctx.fill();
  } else {
    ctx.fillRect(90, stripY, 720, 58);
  }

  ctx.globalAlpha = 1;

  ctx.fillStyle = "#172b4d";
  ctx.font = "800 27px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "स्वतंत्रता दिवस की हार्दिक शुभकामनाएँ",
    width / 2,
    1108
  );

  // Small clean footer — no political/social branding
  ctx.fillStyle = "#777";
  ctx.font = "600 17px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "जय हिन्द • वन्दे मातरम्",
    width / 2,
    1155
  );

  // Final border
  ctx.strokeStyle = "#138808";
  ctx.lineWidth = 5;
  ctx.strokeRect(28, 28, width - 56, height - 56);
}
