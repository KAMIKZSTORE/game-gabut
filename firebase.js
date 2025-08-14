<!-- file ini di-include dari index.html -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script>
  // ====== GANTI DENGAN PUNYAMU ======
  const firebaseConfig = {
    apiKey: "API_KEY_KAMU",
    authDomain: "PROJECT_ID.firebaseapp.com",
    projectId: "PROJECT_ID",
    appId: "APP_ID_KAMU"
  };
  // ===================================

  firebase.initializeApp(firebaseConfig);
  window.__db = firebase.firestore();

  // Anonymous auth (agar rules bisa allow create)
  firebase.auth().signInAnonymously().catch(console.error);
</script>
