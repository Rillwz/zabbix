chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "grab_data") {
    const data = extractDataFromWidget(request.keyword);
    
    if (data && data.length > 0) {
      downloadCSV(data, request.filename);
      sendResponse({status: "success", count: data.length});
    } else {
      sendResponse({status: "not_found"});
    }
  }
});

function extractDataFromWidget(keyword) {
  // 1. Cari semua widget container
  const widgets = document.querySelectorAll('.dashboard-grid-widget');
  let targetWidget = null;

  // 2. Loop untuk mencari widget dengan Header yang sesuai keyword
  for (let widget of widgets) {
    const header = widget.querySelector('.dashboard-grid-widget-header h4');
    if (header && header.innerText.toLowerCase().includes(keyword.toLowerCase())) {
      targetWidget = widget;
      break;
    }
  }

  if (!targetWidget) {
    console.log(`Widget dengan keyword "${keyword}" tidak ditemukan.`);
    return null;
  }

  // 3. Ambil data dari Legenda (.svg-graph-legend)
  // Struktur HTML Anda menunjukkan: Item (Nama), lalu diikuti 3 Value (Min, Avg, Max)
  const legendItems = targetWidget.querySelectorAll('.svg-graph-legend-item span');
  const legendValues = targetWidget.querySelectorAll('.svg-graph-legend-value');

  let results = [];
  // Header CSV
  results.push(["Metric Name", "Min", "Avg", "Max"]);

  // Karena setiap 1 Item diikuti oleh 3 Values (Min, Avg, Max)
  // Kita loop berdasarkan jumlah item
  for (let i = 0; i < legendItems.length; i++) {
    let name = legendItems[i].innerText;
    
    // Index value dikali 3 karena ada 3 kolom per item
    let valIndex = i * 3;
    
    let min = legendValues[valIndex] ? legendValues[valIndex].innerText : "-";
    let avg = legendValues[valIndex + 1] ? legendValues[valIndex + 1].innerText : "-";
    let max = legendValues[valIndex + 2] ? legendValues[valIndex + 2].innerText : "-";

    // Bersihkan data jika perlu (misal menghapus koma agar format CSV aman)
    name = name.replace(/,/g, " "); 
    
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
  
  // Format waktu untuk nama file
  const date = new Date();
  const timeStr = date.toISOString().slice(0,19).replace(/:/g,"-");
  
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filenamePrefix}_${timeStr}.csv`);
  document.body.appendChild(link); // Required for FF
  link.click();
  document.body.removeChild(link);
}