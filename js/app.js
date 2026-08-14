const nameInput = document.getElementById("nameInput");
const namePreview = document.getElementById("namePreview");

const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");

const paymentInput = document.getElementById("paymentInput");
const paymentPreview = document.getElementById("paymentPreview");
const paymentPlaceholder = document.getElementById("paymentPlaceholder");

const paymentStatus = document.getElementById("paymentStatus");

const posterSection = document.getElementById("posterSection");
const posterCanvas = document.getElementById("posterCanvas");

const downloadBtn = document.getElementById("downloadBtn");
const topDownloadBtn = document.getElementById("topDownloadBtn");

let selectedPhoto = null;
let paymentScreenshot = null;

nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();
  namePreview.textContent = name || "आपका नाम";
});

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

  paymentStatus.textContent =
    "✓ Screenshot अपलोड हो गया। Poster तैयार किया जा रहा है...";

  paymentStatus.className = "payment-status success";

  // Screenshot upload होते ही सीधे poster दिखाओ
  if (!nameInput.value.trim()) {
    paymentStatus.textContent =
      "पहले अपना नाम लिखें।";
    paymentStatus.className = "payment-status error";
    return;
  }

  if (!selectedPhoto) {
    paymentStatus.textContent =
      "पहले अपनी फोटो अपलोड करें।";
    paymentStatus.className = "payment-status error";
    return;
  }

  try {
    await createPoster(nameInput.value.trim());

    paymentStatus.textContent =
      "✓ Poster तैयार है। नीचे से डाउनलोड करें।";

    paymentStatus.className = "payment-status success";

  } catch (error) {
    console.error(error);

    paymentStatus.textContent =
      "Poster बनाने में समस्या हुई। कृपया दोबारा कोशिश करें।";

    paymentStatus.className = "payment-status error";
  }
});


async function createPoster(name) {

  const canvas = posterCanvas;
  const ctx = canvas.getContext("2d");

  const width = 900;
  const height = 1200;

  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, width, height);

  // Tricolor header
  ctx.fillStyle = "#ff7a00";
  ctx.fillRect(0, 0, width, 90);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 90, width, 90);

  ctx.fillStyle = "#138808";
  ctx.fillRect(0, 180, width, 90);

  // Ashoka Chakra - केवल सफेद पट्टी में
  ctx.strokeStyle = "#1a3d73";
  ctx.lineWidth = 7;

  const cx = width / 2;
  const cy = 135;
  const radius = 30;

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

  // Title
  ctx.textAlign = "center";

  ctx.fillStyle = "#ef6c00";
  ctx.font = "bold 42px Arial, Noto Sans Devanagari, sans-serif";
  ctx.fillText(
    "🇮🇳 15 अगस्त विशेष 🇮🇳",
    width / 2,
    350
  );

  ctx.fillStyle = "#172b4d";
  ctx.font = "bold 52px Arial, Noto Sans Devanagari, sans-serif";
  ctx.fillText(
    "आजादी का पोस्टर",
    width / 2,
    430
  );

  // User photo
  const photo = new Image();

  await new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = e => {
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
  ctx.roundRect(
    photoX,
    photoY,
    photoW,
    photoH,
    35
  );
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
  ctx.font = "bold 58px Arial, Noto Sans Devanagari, sans-serif";
  ctx.fillText(
    name,
    width / 2,
    1040
  );

  ctx.fillStyle = "#ef6c00";
  ctx.font = "bold 30px Arial, Noto Sans Devanagari, sans-serif";

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

  // Download link
  const imageData = canvas.toDataURL("image/png");

  downloadBtn.href = imageData;
  topDownloadBtn.href = imageData;

  // दोनों buttons दिखाओ
  topDownloadBtn.style.display = "flex";
  downloadBtn.style.display = "flex";

  // Poster दिखाओ
  posterSection.style.display = "block";

  // Poster के पास scroll करो
  posterSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}
