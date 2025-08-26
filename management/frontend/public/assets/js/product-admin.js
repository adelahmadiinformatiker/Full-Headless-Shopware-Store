const msg = localStorage.getItem("productMessage");
const serverPort = localStorage.getItem("serverPort") || "3001";

if (msg) {
  const box = document.getElementById("listResponse");
  box.innerHTML = `<div class="alert alert-success">${msg}</div>`;
  localStorage.removeItem("productMessage");
}

// Hilfsfunktion: JSON zu Bootstrap-Tabelle
function renderProductTable(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return '<div class="alert alert-info">Keine Produkte gefunden.</div>';
  }

  let thead = `<thead><tr>
    <th><input type="checkbox" id="checkAll" /></th>
    <th>#</th>
    <th>Produktnummer</th>
    <th>Name</th>
    <th>Bestand</th>
    <th>Preis</th>
    <th>Status</th>
</tr></thead>`;

  let rows = products
    .map((p, i) => {
      const nummer = p.productNumber || p.translated?.productNumber || "-";
      const name = p.name || p.translated?.name || "-";
      const stock = p.stock ?? "-";
      const preis =
        Array.isArray(p.price) && p.price[0]?.gross
          ? p.price[0].gross + " €"
          : "-";
      const status =
        p.active === true
          ? '<span class="badge bg-success">Aktiv</span>'
          : p.active === false
          ? '<span class="badge bg-secondary">Inaktiv</span>'
          : "-";

      return `<tr data-id="${p.id}">
  <td><input type="checkbox" class="row-checkbox" data-id="${p.id}" /></td>
  <td class="clickable-cell">${i + 1}</td>
  <td class="clickable-cell">${nummer}</td>
  <td class="clickable-cell">${name}</td>
  <td class="clickable-cell">${stock}</td>
  <td class="clickable-cell">${preis}</td>
  <td class="clickable-cell">${status}</td>
</tr>`;
    })
    .join("");

  return `<div class="table-responsive">
      <table class="table table-striped table-bordered align-middle">${thead}<tbody>${rows}</tbody></table>
    </div>`;
}

// Initiales Laden ohne Formular
(async () => {
  const box = document.getElementById("listResponse");
  try {
    const data = await fetch(
      "http://localhost:" + serverPort + "/api/products"
    );

    console.log("Lade Produkte von:", data.url);
    if (!data.ok) {
      box.innerHTML = `<div class="alert alert-danger'>${await data.text()}</div>`;
      console.log(
        "Fehler beim Laden der Produkte:",
        data.status,
        data.statusText
      );
      return;
    }
    const json = await data.json(); // JSON-Antwort erwarten
    const products = Array.isArray(json) ? json : json.data || []; // Sicherstellen, dass wir ein Array haben

    // Tabelle rendern
    box.innerHTML = renderProductTable(products);
    setupCheckboxHandlers();
  } catch (err) {
    box.innerHTML =
      "<div class='alert alert-danger'>Fehler beim Laden der Produkte.</div>";
  }
})();

//
function setupCheckboxHandlers() {
  const deleteBtn = document.getElementById("deleteSelectedBtn");
  const checkboxes = document.querySelectorAll(".row-checkbox");
  const checkAll = document.getElementById("checkAll");

  const updateDeleteButton = () => {
    const anyChecked = Array.from(checkboxes).some((cb) => cb.checked);
    deleteBtn.classList.toggle("d-none", !anyChecked);
  };

  checkboxes.forEach((cb) => cb.addEventListener("change", updateDeleteButton));

  if (checkAll) {
    checkAll.addEventListener("change", (e) => {
      checkboxes.forEach((cb) => (cb.checked = e.target.checked));
      updateDeleteButton();
    });
  }

  deleteBtn.addEventListener("click", async () => {
    const selectedIds = Array.from(checkboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.dataset.id);

    if (!selectedIds.length) return;
    if (!confirm("Möchten Sie die ausgewählten Produkte wirklich löschen?"))
      return;

    for (const id of selectedIds) {
      try {
        await fetch(`http://localhost:${serverPort}/api/products/${id}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.error("Fehler beim Löschen von Produkt", id, err);
      }
    }

    // Nach dem Löschen neu laden
    location.reload();
  });

  document.querySelectorAll(".clickable-cell").forEach((cell) => {
    cell.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      const id = row?.dataset?.id;
      if (id) {
        window.location.href = `product-form.html?id=${id}`;
      }
    });
  });
}
