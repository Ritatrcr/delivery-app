const $ = (q) => document.querySelector(q);
const tbody = $("#tbody");
const msg = $("#msg");
const btnEnviar = $("#btnEnviar");
const btnRefrescar = $("#btnRefrescar");
const form = $("#orderForm");

async function listarPedidos() {
  tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
  try {
    const res = await fetch("/orders");
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Respuesta inesperada");

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Sin pedidos aún</td></tr>`;
      return;
    }

    tbody.innerHTML = data
      .map(
        (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${escapeHtml(p.pedido)}</td>
            <td>${p.cantidad}</td>
            <td>${new Date(p.creado_en).toLocaleString()}</td>
          </tr>`
      )
      .join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5">Error: ${e.message}</td></tr>`;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = $("#nombre").value.trim();
  const pedido = $("#pedido").value.trim();
  const cantidad = parseInt($("#cantidad").value, 10);

  if (!nombre || !pedido || !Number.isInteger(cantidad) || cantidad <= 0) {
    setMsg("Completa todos los campos correctamente.", "error");
    return;
  }

  setBusy(true);
  try {
    const res = await fetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, pedido, cantidad }),
    });

    if (!res.ok) {
      const err = await safeJson(res);
      throw new Error(err?.error || `HTTP ${res.status}`);
    }

    await listarPedidos();
    form.reset();
    $("#cantidad").value = 1;
    setMsg("✅ Pedido creado con éxito.", "ok");
  } catch (e) {
    setMsg(`❌ Error: ${e.message}`, "error");
  } finally {
    setBusy(false);
  }
});

btnRefrescar.addEventListener("click", listarPedidos);
document.addEventListener("DOMContentLoaded", listarPedidos);

function setBusy(b) {
  btnEnviar.disabled = b;
  btnEnviar.textContent = b ? "Enviando..." : "Hacer pedido";
}

function setMsg(text, kind) {
  msg.textContent = text;
  msg.className = kind;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}
