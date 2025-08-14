<!-- file ini di-include dari index.html -->
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script>
  // ====== GANTI DENGAN PUNYAMU ======
  const firebaseConfig = {
  apiKey: "AIzaSyBFdVnl_uNV2v5GvZHN95Ng-02MmrcLEdU",
  authDomain: "kamikz-6923d.firebaseapp.com",
  databaseURL: "https://kamikz-6923d-default-rtdb.firebaseio.com",
  projectId: "kamikz-6923d",
  storageBucket: "kamikz-6923d.firebasestorage.app",
  messagingSenderId: "859160167861",
  appId: "1:859160167861:web:4b8c7be988b12ed47245fc",
  measurementId: "G-8K0ZQ8LPYH"
};
  // ===================================

  firebase.initializeApp(firebaseConfig);
  window.__db = firebase.firestore();

  // Anonymous auth (agar rules bisa allow create)
  firebase.auth().signInAnonymously().catch(console.error);
</script>
