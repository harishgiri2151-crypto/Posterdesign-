const nameInput = document.getElementById("nameInput");
const namePreview = document.getElementById("namePreview");

const photoInput = document.getElementById("photoInput");
const preview = document.getElementById("preview");
const placeholder = document.getElementById("placeholder");

const continueBtn = document.getElementById("continueBtn");


nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();

  namePreview.textContent =
    name || "आपका नाम";
});


photoInput.addEventListener("change", (event) => {

  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("कृपया केवल फोटो चुनें।");
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.style.display = "block";
    placeholder.style.display = "none";
  };

  reader.readAsDataURL(file);
});


continueBtn.addEventListener("click", () => {

  const name = nameInput.value.trim();

  if (!name) {
    alert("पहले अपना नाम लिखें।");
    nameInput.focus();
    return;
  }

  if (!photoInput.files.length) {
    alert("पहले अपनी फोटो अपलोड करें।");
    return;
  }

  alert(
    "अभी यह Demo है। अगला चरण Payment और 10 Poster Templates जोड़ना है।"
  );

});
