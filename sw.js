self.addEventListener("install", function(event) {
  console.log("Service Worker terpasang");
});

self.addEventListener("activate", function(event) {
  console.log("Service Worker aktif");
});

// contoh push (dipakai kalau sudah pakai Firebase / server)
self.addEventListener("push", function(event) {
  let data = {
    title: "Kamikz ID",
    body: "Notifikasi baru masuk",
    icon: "logo.png"
  };

  if (event.data) {
    data = event.data.json();
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon
    })
  );
});
