/**
 * orderEngine.js - Logic for Anas Salah & Dua Prints Studio Order Page
 */

const OrderState = {
  adminEmail: "mustafa2smi@gmail.com",
  adminWhatsApp: "919876543210", // WhatsApp active karte waqt yahan number daalein
  currentPackage: {
    id: "complete_monthly",
    title: "Dua PDF + Complete Monthly Chart",
    basePrice: 150
  },
  addonExtraDua: 30,
  addonUrgent: 50
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
  const urgentChecked = document.getElementById("chkUrgent").checked;

  if (extraDuaChecked) total += OrderState.addonExtraDua;
  if (urgentChecked) total += OrderState.addonUrgent;

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

function resetFormState() {
  setTimeout(() => {
    selectPackage("complete_monthly", 150, document.querySelectorAll(".package-card")[1]);
    calculateTotal();
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
  const phone = document.getElementById("custPhone").value.trim() || "Not Provided";
  const state = document.getElementById("custState").value.trim();
  const district = document.getElementById("custDistrict").value.trim();
  const title = document.getElementById("custTitle").value.trim();
  const notes = document.getElementById("chartNotes").value.trim() || "None";

  const scope = document.querySelector("input[name='orderScope']:checked")?.value || "Masjid";
  const dataSource = document.querySelector("input[name='dataSource']:checked")?.value || "Khud Ka Data";
  const dataFormat = document.getElementById("dataFormatSelect").value;
  const duaContent = document.querySelector("input[name='duaContent']:checked")?.value || "Admin Presets";
  const duaCardCount = document.getElementById("duaCardCountSelect").value;

  const totalAmount = calculateTotal();
  const orderId = generateOrderId();

  const addons = [];
  if (document.getElementById("chkExtraDuaSheet").checked) addons.push("Extra 1 Dua Sheet (+₹30)");
  if (document.getElementById("chkUrgent").checked) addons.push("12-Hour Urgent Delivery (+₹50)");
  const addonsText = addons.length > 0 ? addons.join(", ") : "None";

  const summaryHtml = `
    <div><strong>Order ID:</strong> ${orderId}</div>
    <div><strong>Customer:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</div>
    <div><strong>Phone:</strong> ${escapeHtml(phone)}</div>
    <div><strong>Location:</strong> ${escapeHtml(district)}, ${escapeHtml(state)}</div>
    <div><strong>Display Title:</strong> ${escapeHtml(title)} [${escapeHtml(scope)}]</div>
    <div><strong>Package:</strong> ${escapeHtml(OrderState.currentPackage.title)}</div>
    <div><strong>Add-ons:</strong> ${escapeHtml(addonsText)}</div>
    <div><strong>Total Payable:</strong> ₹${totalAmount}</div>
    <div><strong>Data Source:</strong> ${escapeHtml(dataSource)} via ${escapeHtml(dataFormat)}</div>
    <div><strong>Dua Preferences:</strong> ${escapeHtml(duaCardCount)} (${escapeHtml(duaContent)})</div>
    ${notes !== "None" ? `<div><strong>Notes:</strong> ${escapeHtml(notes)}</div>` : ""}
  `;
  document.getElementById("modalSummaryContent").innerHTML = summaryHtml;

  const emailSubject = `New Salah & Dua Chart Order [${orderId}] - ${title}`;
  const emailBody = `Assalamu Alaikum Mustafa Bhai,

Main ek naya Salah Time Chart aur Masnoon Dua Sheet order karna chahta hoon. Details niche darj hain:

--------------------------------------------------
ORDER SUMMARY (${orderId})
--------------------------------------------------
Customer Name: ${name}
Email Address: ${email}
Phone / WhatsApp: ${phone}
Location: ${district}, ${state}

CHART & MOSQUE DETAILS:
Order For: ${scope}
Mosque / Home Title to Print: ${title}
Package Selected: ${OrderState.currentPackage.title}
Add-ons: ${addonsText}
Total Order Value: Rs. ${totalAmount}

DATA & DUA SETTINGS:
Salah Data Source: ${dataSource}
Data Delivery Format: ${dataFormat}
Dua Card Count: ${duaCardCount}
Dua Content Preference: ${duaContent}

SPECIAL NOTES / INSTRUCTIONS:
${notes}

--------------------------------------------------
Maine data file/screenshot is email ke sath attach kar diya hai (ya upar link de diya hai). Kripya confirm karein.
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

  const msg = `Assalamu Alaikum Mustafa Bhai! Mujhe Salah Time Chart order karna hai.\nName: ${name}\nTitle: ${title}\nPlan: ${OrderState.currentPackage.title}\nTotal: Rs. ${total}`;
  const waUrl = `https://wa.me/${OrderState.adminWhatsApp}?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, "_blank");
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
