let selectedMain = "";
let selectedItems = [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];

// Seasoning options
const powders = ["BBQ", "Chilli", "Cheese", "Balado"];
const sauces = ["Mayo", "Sambel", "Tomato", "Bangko", "Chilli Oil"];

/* =========================
   MAIN MENU
========================= */

function selectMain(main, btnElement) {
  selectedMain = main;
  selectedItems = [];

  document.querySelectorAll('#mainMenu button')
    .forEach(btn => btn.classList.remove('selected'));

  if (btnElement) btnElement.classList.add('selected');

  renderSubMenu(main);
}

function renderSubMenu(main) {
  const subMenu = document.getElementById("subMenu");
  subMenu.innerHTML = "";

  let items = [];

  if (main === "Wonton") {
    items = ["Wonton Chilli Oil", "Wonton Crispy", "Wonton Soup"];
  } 
  else if (main === "Crispy") {
    items = [
      "Chicken Crispy",
      "Chicken Popcorn",
      "Chicken Pokpok",
      "Skin Crispy",
      "Mushroom Crispy",
      "Fries"
    ];
  }
  else if (main === "Combo") {
    items = [
      "Chicken Crispy + Fries",
      "Chicken Popcorn + Fries",
      "Chicken Pokpok + Fries",
      "Skin Crispy + Fries"
    ];
  }
  else if (main === "Dimsum Mentai") {
    subMenu.innerHTML = `<p class="placeholder-text">⠀</p>`;
    return;
  }

  const selectionContainer = document.createElement("div");
  selectionContainer.className =
    main === "Crispy" ? "grid-3" : "button-group";

  items.forEach(item => {
    const btn = document.createElement("button");
    btn.innerText = item;

    btn.onclick = function () {
      selectionContainer.querySelectorAll('button')
        .forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      handleItemSelection(main, item);
    };

    selectionContainer.appendChild(btn);
  });

  subMenu.appendChild(selectionContainer);

  const seasoningContainer = document.createElement("div");
  seasoningContainer.id = "seasoningContainer";
  subMenu.appendChild(seasoningContainer);
}

/* =========================
   ITEM + SEASONING
========================= */

function handleItemSelection(main, item) {
  selectedItems = [];

  if (main === "Combo") {
    const parts = item.split(" + ");
    parts.forEach(p => {
      selectedItems.push({ name: p, seasoning: [] });
    });
  } else {
    selectedItems.push({ name: item, seasoning: [] });
  }

  renderSeasoningSection();
}

function renderSeasoningSection() {
  const seasoningContainer = document.getElementById("seasoningContainer");
  if (!seasoningContainer) return;

  seasoningContainer.innerHTML = "";

  selectedItems.forEach((item, index) => {
    const title = document.createElement("h3");
    title.innerText = item.name + " Seasoning";
    title.className = "seasoning-title";
    seasoningContainer.appendChild(title);

    // POWDERS
const powderTitle = document.createElement("div");
powderTitle.innerHTML = "<strong>Powders</strong>";
seasoningContainer.appendChild(powderTitle);

const powderContainer = document.createElement("div");
powderContainer.className = "grid-4";

powders.forEach(season => {
  const btn = document.createElement("button");
  btn.innerText = season;
  btn.onclick = function () {
    toggleItemSeasoning(index, season, this);
  };
  powderContainer.appendChild(btn);
});

seasoningContainer.appendChild(powderContainer);

// SAUCES
const sauceTitle = document.createElement("div");
sauceTitle.style.marginTop = "10px";
sauceTitle.innerHTML = "<strong>Sauces</strong>";
seasoningContainer.appendChild(sauceTitle);

const sauceContainer = document.createElement("div");
sauceContainer.className = "grid-5";

sauces.forEach(season => {
  const btn = document.createElement("button");
  btn.innerText = season;
  btn.onclick = function () {
    toggleItemSeasoning(index, season, this);
  };
  sauceContainer.appendChild(btn);
});

seasoningContainer.appendChild(sauceContainer);
  });
}

function toggleItemSeasoning(index, seasoning, btnElement) {
  const item = selectedItems[index];

  if (item.seasoning.includes(seasoning)) {
    item.seasoning = item.seasoning.filter(s => s !== seasoning);
    btnElement.classList.remove('selected');
  } else {
    item.seasoning.push(seasoning);
    btnElement.classList.add('selected');
  }
}

/* =========================
   ADD ORDER
========================= */

function addOrder() {
  const name = document.getElementById("customerName").value.trim();
  const note = document.getElementById("note").value.trim();

  if (!name) {
    alert("isi nama");
    return;
  }

  if (!selectedMain) {
    alert("pilih menu");
    return;
  }

  // Auto item for Dimsum Mentai
  if (selectedMain === "Dimsum Mentai" && selectedItems.length === 0) {
    selectedItems.push({ name: "Dimsum Mentai", seasoning: [] });
  }

  if (selectedItems.length === 0) {
    alert("pilih item");
    return;
  }

  const order = {
    id: Date.now(),
    name,
    main: selectedMain,
    items: structuredClone(selectedItems), // deep copy
    note,
    status: "pending",
    checked: false
  };

  orders.push(order);
  saveOrders();
  renderOrders();
  resetForm();
}

/* =========================
   RENDER ORDERS
========================= */

function renderOrders() {
  const list = document.getElementById("orderList");
  list.innerHTML = "";

  if (!orders.length) {
    list.innerHTML = `<p class="placeholder-text">Belum ada orderan</p>`;
    return;
  }

  orders.forEach(order => {

    // Defensive repair (handles old localStorage formats)
    if (!order.items) {
      order.items = [{ name: order.main, seasoning: [] }];
    }

    const div = document.createElement("div");
    div.className = "order-item " +
      (order.status === "pending" ? "pending" : "finished");

    let itemsHTML = "";

    order.items.forEach(item => {
      itemsHTML += `
        <div style="margin-top:4px;">
          • ${item.name}
          <small style="color:#6b7280; display:block; margin-left:12px;">
            ↳ ${item.seasoning?.length ? item.seasoning.join(", ") : "No seasoning"}
          </small>
        </div>
      `;
    });

    div.innerHTML = `
      <div style="flex-grow:1;">
        <label style="cursor:pointer; display:flex; gap:10px; align-items:flex-start;">
          <input type="checkbox" ${order.checked ? "checked" : ""}
            onchange="toggleCheck(${order.id})" style="margin-top:5px;">
          <div>
            <strong>${order.name}</strong><br>
            <span style="color:#3b82f6; font-weight:bold;">
              ${order.main}
            </span>
            ${itemsHTML}
            ${order.note ? `<div style="color:#ef4444; margin-top:5px; font-size:13px;">Note: ${order.note}</div>` : ""}
          </div>
        </label>
      </div>
      <button class="small-btn ${order.status === "finished" ? "delete-btn" : ""}"
        onclick="toggleStatus(${order.id})">
        ${order.status === "pending" ? "Selesai ✓" : "Undo ⟲"}
      </button>
    `;

    list.appendChild(div);
  });
}

/* =========================
   ORDER ACTIONS
========================= */

function toggleStatus(id) {
  orders = orders.map(o => {
    if (o.id === id) {
      o.status = o.status === "pending" ? "finished" : "pending";
    }
    return o;
  });
  saveOrders();
  renderOrders();
}

function toggleCheck(id) {
  orders = orders.map(o => {
    if (o.id === id) o.checked = !o.checked;
    return o;
  });
  saveOrders();
}

function deleteSelected() {
  if (!confirm("Delete selected orders?")) return;

  orders = orders.filter(o => !o.checked);
  saveOrders();
  renderOrders();
}

/* =========================
   UTILITIES
========================= */

function resetForm() {
  document.getElementById("customerName").value = "";
  document.getElementById("note").value = "";
  selectedMain = "";
  selectedItems = [];

  document.querySelectorAll('button.selected')
    .forEach(btn => btn.classList.remove('selected'));

  document.getElementById("subMenu").innerHTML =
    `<p class="placeholder-text">Select a main menu first</p>`;
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders));
}

/* =========================
   INIT
========================= */

// Clear corrupted legacy data automatically
orders = orders.map(o => {
  if (!o.items) {
    o.items = [{ name: o.main, seasoning: [] }];
  }
  return o;
});

saveOrders();
renderOrders();