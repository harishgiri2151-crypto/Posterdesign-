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


  // Background
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, width, height);


  // Tricolor
  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(0, 0, width, 90);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 90, width, 90);

  ctx.fillStyle = "#138808";
  ctx.fillRect(0, 180, width, 90);


  // Ashoka Chakra — केवल सफेद पट्टी में
  ctx.strokeStyle = "#1a3d73";
  ctx.lineWidth = 7;

  const cx = width / 2;
  const cy = 135;
  const radius = 30;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 24; i++) {

    const angle =
      (Math.PI * 2 * i) / 24;

    ctx.beginPath();

    ctx.moveTo(cx, cy);

    ctx.lineTo(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius
    );

    ctx.stroke();
  }


  // Title
  ctx.textAlign = "center";

  ctx.fillStyle = "#ef6c00";

  ctx.font =
    "bold 42px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "🇮🇳 15 अगस्त विशेष 🇮🇳",
    width / 2,
    350
  );


  ctx.fillStyle = "#172b4d";

  ctx.font =
    "bold 52px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "आजादी का पोस्टर",
    width / 2,
    430
  );


  // Photo
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


  const photoX = 100;
  const photoY = 490;
  const photoW = 700;
  const photoH = 470;


  ctx.save();

  ctx.beginPath();

  // roundRect fallback
  if (typeof ctx.roundRect === "function") {

    ctx.roundRect(
      photoX,
      photoY,
      photoW,
      photoH,
      35
    );

  } else {

    ctx.rect(
      photoX,
      photoY,
      photoW,
      photoH
    );
  }

  ctx.clip();


  const scale = Math.max(
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

  ctx.restore();


  // Name
  ctx.fillStyle = "#138808";

  ctx.font =
    "bold 58px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    name,
    width / 2,
    1040
  );


  // Greeting
  ctx.fillStyle = "#ef6c00";

  ctx.font =
    "bold 30px Arial, Noto Sans Devanagari, sans-serif";

  ctx.fillText(
    "स्वतंत्रता दिवस की हार्दिक शुभकामनाएँ",
    width / 2,
    1100
  );


  // Border
  ctx.strokeStyle = "#138808";
  ctx.lineWidth = 10;

  ctx.strokeRect(
    20,
    20,
    width - 40,
    height - 40
  );


  posterSection.style.display = "block";


  // Scroll to poster
  posterSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
