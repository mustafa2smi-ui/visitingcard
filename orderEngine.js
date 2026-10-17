/**
 * orderEngine.js - Logic for Anas Salah & Dua Prints Studio Order Page
 */

const OrderState = {
  adminEmail: "mustafa2smi@gmail.com",
  adminWhatsApp: "919876543210", // WhatsApp active karte waqt apna number update karein
  currentPackage: {
    id: "complete_monthly",
    title: "Dua PDF + Complete Monthly Chart",
    basePrice: 150
  },
  addonExtraDua: 30
};

function selectPackage(packageId, price, element) {
  document.querySelectorAll(".package-card").forEach(card => card.classList.remove("active"));
  element.classList.add("active");

  const radio = element.querySelector(".package-radio");
  if (radio) radio.checked = true;

  const title = element.querySelector(".package-title").textContent.trim();
  OrderState.currentPackage = {
    id: packageId,
    title: title,
    basePrice: price
  };

  calculateTotal();
}

function calculateTotal() {
  let total = OrderState.currentPackage.basePrice;
  const extraDuaChecked = document.getElementById("chkExtraDuaSheet").checked;
  if (extraDuaChecked) total += OrderState.addonExtraDua;

  document.getElementById("displayTotalPrice").textContent = `₹${total}`;
  return total;
}

function setPillActive(element, groupName) {
  const parent = element.parentElement;
  parent.querySelectorAll(".pill-radio-label").forEach(l => l.classList.remove("active"));
  element.classList.add("active");
  const radio = element.querySelector("input[type='radio']");
  if (radio) radio.checked = true;
}

/**
 * Point 2: Auto Disable / Enable format combo box
 */
function handleDataSourceChange(type, element) {
  setPillActive(element, 'dataSource');
  const formatSelect = document.getElementById("dataFormatSelect");
  const formatLabel = document.getElementById("dataFormatLabel");

  if (type === 'admin') {
    // Disable format select
    formatSelect.disabled = true;
    formatSelect.style.opacity = "0.5";
    formatLabel.innerHTML = "Aap Data Kis Format Me Bhejna Chahenge? <span style='color:var(--primary);'>(Disabled: Admin khud standard calculation karega)</span>";
  } else {
    // Enable format select
    formatSelect.disabled = false;
    formatSelect.style.opacity = "1";
    formatLabel.innerHTML = "Aap Data Kis Format Me Bhejna Chahenge?";
  }
}

/**
 * Point 5: Enable submit button only when screenshot checkbox is checked
 */
function toggleSubmitButton() {
  const chk = document.getElementById("chkScreenshotAttached");
  const btn = document.getElementById("btnSubmitOrder");

  if (chk.checked) {
    btn.disabled = false;
    btn.innerHTML = "🚀 Submit Order & Open Gmail Compose";
  } else {
    btn.disabled = true;
    btn.innerHTML = "🔒 Submit Order & Open Gmail Compose (Checkbox Tick Karein)";
  }
}

function resetFormState() {
  setTimeout(() => {
    selectPackage("complete_monthly", 150, document.querySelectorAll(".package-card")[1]);
    calculateTotal();
    handleDataSourceChange('khud', document.querySelectorAll(".pills-group")[1].children[0]);
    toggleSubmitButton();
  }, 50);
}

function generateOrderId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ANAS-SLH-${rand}`;
}

function handleOrderSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("custName").value.trim();
  const email = document.getElementById("custEmail").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  const state = document.getElementById("custState").value.trim();
  const district = document.getElementById("custDistrict").value.trim();
  const title = document.getElementById("custTitle").value.trim();
  const notes = document.getElementById("chartNotes").value.trim() || "None";

  const scope = document.querySelector("input[name='orderScope']:checked")?.value || "Masjid";
  const dataSource = document.querySelector("input[name='dataSource']:checked")?.value || "Khud Ka Data";
  const formatSelect = document.getElementById("dataFormatSelect");
  const dataFormat = formatSelect.disabled ? "Admin Auto Calculation (No file needed)" : formatSelect.value;
  
  const duaContent = document.querySelector("input[name='duaContent']:checked")?.value || "Admin Presets";
  const duaCardCount = document.getElementById("duaCardCountSelect").value;

  const totalAmount = calculateTotal();
  const orderId = generateOrderId();

  const extraDua = document.getElementById("chkExtraDuaSheet").checked ? "Yes (+₹30)" : "No";

  // Modal Summary
  const summaryHtml = `
    <div><strong>Order ID:</strong> ${orderId}</div>
    <div><strong>Customer:</strong> ${escapeHtml(name)}</div>
    <div><strong>Email:</strong> ${escapeHtml(email)}</div>
    <div><strong>WhatsApp:</strong> ${escapeHtml(phone)}</div>
    <div><strong>Location:</strong> ${escapeHtml(district)}, ${escapeHtml(state)}</div>
    <div><strong>Display Title:</strong> ${escapeHtml(title)} [${escapeHtml(scope)}]</div>
    <div><strong>Package:</strong> ${escapeHtml(OrderState.currentPackage.title)}</div>
    <div><strong>Extra Dua Sheet:</strong> ${escapeHtml(extraDua)}</div>
    <div><strong>Total Amount:</strong> ₹${totalAmount}</div>
    <div><strong>Data Source:</strong> ${escapeHtml(dataSource)} (${escapeHtml(dataFormat)})</div>
    <div><strong>Dua Settings:</strong> ${escapeHtml(duaCardCount)} (${escapeHtml(duaContent)})</div>
    ${notes !== "None" ? `<div><strong>Notes:</strong> ${escapeHtml(notes)}</div>` : ""}
  `;
  document.getElementById("modalSummaryContent").innerHTML = summaryHtml;

  // Pre-filled Email Content
  const emailSubject = `New Salah & Dua Chart Order [${orderId}] - ${title}`;
  const emailBody = `Assalamu Alaikum Mustafa Bhai,

Main ek naya Salah Time Chart aur Masnoon Dua Sheet order karna chahta hoon. Details niche darj hain:

--------------------------------------------------
ORDER SUMMARY (${orderId})
--------------------------------------------------
Customer Name: ${name}
Email Address: ${email}
WhatsApp Number: ${phone}
Location: ${district}, ${state}

CHART & MOSQUE DETAILS:
Order For: ${scope}
Title to Print on Chart: ${title}
Package Selected: ${OrderState.currentPackage.title}
Extra Dua Sheet: ${extraDua}
Total Amount: Rs. ${totalAmount}

DATA & DUA PREFERENCES:
Salah Data Source: ${dataSource}
Data Delivery Format: ${dataFormat}
Dua Sheet Size: ${duaCardCount}
Dua Preference: ${duaContent}

CUSTOMER NOTES:
${notes}

--------------------------------------------------
Maine Payment aur Data ka screenshot is email ke sath attach kar diya hai. Kripya PDF ready karke mere WhatsApp/Email par bhejein.
Jazakallah Khaira.
`;

  const encodedSubject = encodeURIComponent(emailSubject);
  const encodedBody = encodeURIComponent(emailBody);

  const gmailWebUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${OrderState.adminEmail}&su=${encodedSubject}&body=${encodedBody}`;

  const linkEl = document.getElementById("gmailDirectLink");
  linkEl.href = gmailWebUrl;

  document.getElementById("orderConfirmModal").classList.add("active");
}

function closeOrderModal() {
  document.getElementById("orderConfirmModal").classList.remove("active");
}

function submitViaWhatsApp() {
  const name = document.getElementById("custName").value.trim() || "Customer";
  const title = document.getElementById("custTitle").value.trim() || "Masjid";
  const total = calculateTotal();

  const msg = `Assalamu Alaikum Mustafa Bhai! Mujhe Salah Time Chart order karna hai.
Name: ${name}
Title: ${title}
Plan: ${OrderState.currentPackage.title}
Total: Rs. ${total}`;
  const waUrl = `https://wa.me/${OrderState.adminWhatsApp}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
