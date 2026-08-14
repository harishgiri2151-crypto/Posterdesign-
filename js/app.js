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

photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("कृपया केवल फोटो चुनें।");
    photoInput.value = "";
    return;
  }

  // फोटो तुरंत दिखाएँ — कोई blocking AI processing नहीं।
  selectedPhoto = file;
  processedPhotoBlob = null;

  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    placeholder.style.display = "none";
  };

  reader.onerror = () => {
    console.error("Photo preview पढ़ने में समस्या हुई");
  };

  reader.readAsDataURL(file);

  // फोटो आते ही poster preview तैयार करें।
  // Background removal यहाँ blocking नहीं होगी।
  renderPreviewPoster();
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

    // Preview पहले से canvas पर तैयार है।
    // Payment screenshot के बाद poster को दोबारा render नहीं करना है।
    posterReady = true;

    activateDownloadButton();

    paymentStatus.textContent =
      "✓ Poster तैयार है। नीचे से डाउनलोड करें।";

    paymentStatus.className =
      "payment-status success";

  } catch (error) {

    console.error("Download activation error:", error);

    paymentStatus.textContent =
      "Download तैयार करने में समस्या हुई। कृपया दोबारा कोशिश करें।";

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

  if (!ctx) throw new Error("Canvas उपलब्ध नहीं है");

  const template = new Image();

  await new Promise((resolve, reject) => {
    template.onload = resolve;
    template.onerror = reject;
    template.src = "assets/poster-template.png";
  });

  const width = template.naturalWidth || template.width;
  const height = template.naturalHeight || template.height;

  canvas.width = width;
  canvas.height = height;

  ctx.clearRect(0, 0, width, height);

  // ORIGINAL PROFESSIONAL TEMPLATE
  ctx.drawImage(template, 0, 0, width, height);

  // --------------------------------------------------
  // USER PHOTO
  // --------------------------------------------------
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
      reader.readAsDataURL(processedPhotoBlob || selectedPhoto);
    });

    const cx = width * 0.50;
    const cy = height * 0.315;

    // थोड़ा slimmer circular portrait
    const radius = Math.min(
      width * 0.270,
      height * 0.202
    );

    // Photo को circle में cleanly cover करें
    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    const scale = Math.max(
      (radius * 2) / photo.width,
      (radius * 2) / photo.height
    ) * 1.04;

    const drawW = photo.width * scale;
    const drawH = photo.height * scale;

    // photo को थोड़ा ऊपर रखें
    const photoOffsetY = height * 0.018;

    ctx.drawImage(
      photo,
      cx - drawW / 2,
      cy - drawH / 2 + photoOffsetY,
      drawW,
      drawH
    );

    ctx.restore();

    // --------------------------------------------------
    // TRICOLOR PHOTO BORDER
    // --------------------------------------------------
    ctx.save();

    ctx.lineWidth = Math.max(7, width * 0.006);

    ctx.beginPath();
    ctx.arc(cx, cy, radius + ctx.lineWidth * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = "#ff7a00";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + ctx.lineWidth * 1.45, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius + ctx.lineWidth * 2.35, 0, Math.PI * 2);
    ctx.strokeStyle = "#138808";
    ctx.stroke();

    ctx.restore();
  }

  // --------------------------------------------------
  // USER NAME
  // --------------------------------------------------
  const cleanName = (name || "").trim();

  if (cleanName) {

    /*
     * पूरे पुराने nameplate क्षेत्र को ढकें।
     * इससे template का पुराना नाम और उसकी
     * golden strip दिखाई नहीं देगी।
     */
    const nameBox = {
      x: width * 0.195,
      y: height * 0.6645,
      w: width * 0.610,
      h: height * 0.0825
    };

    ctx.save();

    // पूरी पुरानी template nameplate को opaque cover करें।
    // Gold border और पुराने नाम को बिल्कुल नीचे से झलकने न दें।
    const coverRadius = height * 0.020;

    ctx.beginPath();

    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(
        nameBox.x,
        nameBox.y,
        nameBox.w,
        nameBox.h,
        coverRadius
      );
    } else {
      ctx.rect(
        nameBox.x,
        nameBox.y,
        nameBox.w,
        nameBox.h
      );
    }

    ctx.fillStyle = "#082d68";
    ctx.fill();

    ctx.restore();

    // --------------------------------------------------
    // NAME — AUTO FIT
    // --------------------------------------------------
    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";

    const centerX = nameBox.x + nameBox.w / 2;
    const centerY = nameBox.y + nameBox.h / 2;

    let fontSize = Math.round(height * 0.050);
    const maxTextWidth = nameBox.w * 0.90;

    while (fontSize > 22) {
      ctx.font =
        `900 ${fontSize}px Arial, Noto Sans Devanagari, sans-serif`;

      if (ctx.measureText(cleanName).width <= maxTextWidth) {
        break;
      }

      fontSize -= 2;
    }

    ctx.fillText(
      cleanName,
      centerX,
      centerY,
      maxTextWidth
    );

    ctx.restore();
  }

  // Poster visible
  posterSection.style.display = "block";
}

