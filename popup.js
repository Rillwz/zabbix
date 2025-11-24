document.addEventListener('DOMContentLoaded', function() {
  
  // Fungsi helper untuk mengirim pesan ke content script
  function triggerGrab(keyword, filenamePrefix) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        action: "grab_data",
        keyword: keyword,
        filename: filenamePrefix
      }, function(response) {
        const msgDiv = document.getElementById('msg');
        if (chrome.runtime.lastError) {
          msgDiv.textContent = "Error: Refresh halaman dulu.";
        } else if (response && response.status === "success") {
          msgDiv.textContent = "Data ditemukan! Mengunduh...";
        } else {
          msgDiv.textContent = "Widget tidak ditemukan.";
        }
      });
    });
  }

  // Tombol 1: Forward
  document.getElementById('btnForward').addEventListener('click', function() {
    // Mencari header yang mengandung kata "Forward Satellite Bits"
    triggerGrab("Forward Satellite Bits", "forward_satellite_bits");
  });

  // Tombol 2: Return
  document.getElementById('btnReturn').addEventListener('click', function() {
    // Mencari header yang mengandung kata "Return Satellite Throughput"
    // (Asumsi struktur widget sama persis dengan yang Forward)
    triggerGrab("Return Satellite Throughput", "return_satellite_throughput");
  });

});