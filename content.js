chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "grab_data") {
    console.log("Mencoba mengambil data untuk keyword:", request.keyword);
    const data = extractDataFromWidget(request.keyword);
    
    if (data && data.length > 1) { // Lebih dari 1 karena baris pertama adalah header
      downloadCSV(data, request.filename);
      sendResponse({status: "success", count: data.length - 1});
    } else {
      console.error("Data tidak ditemukan atau widget salah.");
      sendResponse({status: "not_found"});
    }
  }
});

function extractDataFromWidget(keyword) {
  // 1. Cari semua widget di halaman
  const widgets = document.querySelectorAll('.dashboard-grid-widget');
  let targetWidget = null;
  let targetHeader = "";

  // 2. Loop cari widget yang header-nya mengandung keyword (Case Insensitive)
  for (let widget of widgets) {
    const headerEl = widget.querySelector('h4'); // Mencari tag h4
    if (headerEl) {
      const headerText = headerEl.innerText.toLowerCase();
      if (headerText.includes(keyword.toLowerCase())) {
        targetWidget = widget;
        targetHeader = headerEl.innerText;
        console.log("Widget ditemukan:", targetHeader);
        break;
      }
    }
  }

  if (!targetWidget) {
    console.log(`Widget dengan keyword "${keyword}" tidak ditemukan.`);
    return null;
  }

  // 3. Ambil elemen Legenda
  // Kita cari container legenda spesifik di dalam widget tersebut
  const legendContainer = targetWidget.querySelector('.svg-graph-legend');
  
  if (!legendContainer) {
    console.error("Container .svg-graph-legend tidak ditemukan di dalam widget.");
    return null;
  }

  // 4. Ambil Item (Nama Beam) dan Values (Angka)
  // Berdasarkan HTML Anda: Nama ada di class .svg-graph-legend-item
  // Angka ada di class .svg-graph-legend-value
  const itemElements = legendContainer.querySelectorAll('.svg-graph-legend-item');
  const valueElements = legendContainer.querySelectorAll('.svg-graph-legend-value');

  console.log(`Ditemukan ${itemElements.length} items dan ${valueElements.length} values.`);

  let results = [];
  // Header CSV
  results.push(["Beam Name", "Min", "Avg", "Max"]);

  // 5. Pairing Data
  // Pola HTML Anda: 1 Item selalu diikuti logikanya oleh 3 Value (Min, Avg, Max)
  // Jadi untuk Item ke-0, valuenya ada di index 0, 1, 2
  // Untuk Item ke-1, valuenya ada di index 3, 4, 5
  
  for (let i = 0; i < itemElements.length; i++) {
    // Ambil teks nama (bersihkan enter/spasi berlebih)
    let name = itemElements[i].innerText.replace(/[\r\n]+/g, " ").trim();
    // Hapus koma agar tidak merusak CSV
    name = name.replace(/,/g, " ");

    // Hitung index untuk value
    let baseIndex = i * 3;

    // Ambil value, gunakan "N/A" jika index tidak ada (untuk keamanan)
    let min = valueElements[baseIndex] ? valueElements[baseIndex].innerText.trim() : "N/A";
    let avg = valueElements[baseIndex + 1] ? valueElements[baseIndex + 1].innerText.trim() : "N/A";
    let max = valueElements[baseIndex + 2] ? valueElements[baseIndex + 2].innerText.trim() : "N/A";

    results.push([name, min, avg, max]);
  }

  return results;
}

function downloadCSV(rows, filenamePrefix) {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  rows.forEach(function(rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  
  const date = new Date();
  // Format waktu: YYYY-MM-DD_HH-mm
  const timeStr = date.getFullYear() + "-" + 
                  (date.getMonth()+1).toString().padStart(2, '0') + "-" + 
                  date.getDate().toString().padStart(2, '0') + "_" + 
                  date.getHours().toString().padStart(2, '0') + "-" + 
                  date.getMinutes().toString().padStart(2, '0');
  
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filenamePrefix}_${timeStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}