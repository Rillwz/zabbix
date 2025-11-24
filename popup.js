document.addEventListener('DOMContentLoaded', function() {
  
  function triggerGrab(keyword, filenamePrefix) {
    const msgDiv = document.getElementById('msg');
    msgDiv.textContent = "Mencari data...";

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) return;
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "grab_data",
        keyword: keyword,
        filename: filenamePrefix
      }, function(response) {
        if (chrome.runtime.lastError) {
          msgDiv.textContent = "Error: Silakan refresh halaman dashboard dulu.";
          console.error(chrome.runtime.lastError);
        } else if (response && response.status === "success") {
          msgDiv.textContent = `Berhasil! ${response.count} data diunduh.`;
        } else {
          msgDiv.textContent = `Widget "${keyword}" tidak ditemukan.`;
        }
      });
    });
  }

  // Tombol 1: Forward
  // Keyword: Cukup "Forward" atau "Forward Satellite" agar match dengan "Forward Satellite Bits..."
  document.getElementById('btnForward').addEventListener('click', function() {
    triggerGrab("Forward Satellite", "forward_satellite_bits");
  });

  // Tombol 2: Return
  // Keyword: Cukup "Return Satellite"
  document.getElementById('btnReturn').addEventListener('click', function() {
    triggerGrab("Return Satellite", "return_satellite_throughput");
  });

});